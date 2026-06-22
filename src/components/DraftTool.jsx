"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AuthModal from "@/components/AuthModal";
import ChampionPool from "@/components/ChampionPool";
import DraftSidebar from "@/components/DraftSidebar";
import Header from "@/components/Header";
import { CANVAS, DRAFT_LIMITS } from "@/lib/const";
import { createClient } from "@/lib/supabaseClient";
import { sanitizeFilename, validateDraftData } from "@/lib/validation";
import useChampionStore from "@/stores/championStore";
import useDraftStore from "@/stores/draftStore";

export default function DraftTool() {
  const supabase = createClient();
  const pageRef = useRef(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const {
    user, setUser,
    draftId, setDraftId,
    draftOwnerId, setDraftOwnerId,
    isPublic,
    games, currentGameIndex, isFearless,
    blueTeamName, redTeamName,
    draftMode, setDraftMode,
    loadDraftData, resetDraft,
  } = useDraftStore();

  const { syncPatch } = useChampionStore();

  const isReadOnly = Boolean(draftId && user?.id !== draftOwnerId);

  // Auth session listener + avatar fetch
  useEffect(() => {
    const syncUser = async (u) => {
      setUser(u);
      if (u) {
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", u.id)
          .single();
        setAvatarUrl(data?.avatar_url ?? null);
      } else {
        setAvatarUrl(null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => syncUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase, setUser]);

  // Sync patch on mount: uses cached champions immediately, re-fetches if patch changed
  useEffect(() => {
    syncPatch().catch(() => {
      toast.error("Failed to load champions. Please refresh.");
    });
  }, [syncPatch]);

  // Load draft from ?draft= URL param
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("draft");
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!id || !UUID_RE.test(id)) return;

    setIsLoadingDraft(true);
    setDraftId(id);

    const fetchDraft = async () => {
      try {
        const { data, error } = await supabase
          .from("drafts")
          .select("draft_data, user_id, is_public")
          .eq("id", id)
          .single();

        if (data?.draft_data) {
          const dd = data.draft_data;
          if (!validateDraftData(dd)) {
            toast.error("Draft data is corrupted.");
            return;
          }
          loadDraftData(dd, data.user_id, data.is_public);
        } else if (error) {
          toast.error("Draft not found or is private.");
        }
      } catch {
      } finally {
        setIsLoadingDraft(false);
      }
    };
    fetchDraft();
  }, [supabase, setDraftId, loadDraftData]);

  const handleSaveDraft = async () => {
    if (!user) {
      toast.error("Please log in with Google to save your draft.");
      return;
    }

    if (
      blueTeamName.length > DRAFT_LIMITS.TEAM_NAME_MAX ||
      redTeamName.length > DRAFT_LIMITS.TEAM_NAME_MAX
    ) {
      toast.error("Team name must be 64 characters or fewer.");
      return;
    }

    const seriesName = `${blueTeamName} vs ${redTeamName}`;
    if (seriesName.length > DRAFT_LIMITS.DRAFT_NAME_MAX) {
      toast.error("Draft name must be 128 characters or fewer.");
      return;
    }

    const stripChamp = (c) => (c ? { id: c.id, key: c.key } : null);
    const minimalDraftData = {
      isFearless,
      blueTeamName,
      redTeamName,
      currentGame: currentGameIndex,
      games: games.map((g) => ({
        blueBan: g.blueBan.map(stripChamp),
        redBan: g.redBan.map(stripChamp),
        blue: g.blue.map(stripChamp),
        red: g.red.map(stripChamp),
        swapped: g.swapped || false,
      })),
    };

    if (draftId) {
      const { error } = await supabase
        .from("drafts")
        .update({ draft_data: minimalDraftData, name: seriesName, is_public: isPublic })
        .eq("id", draftId)
        .eq("user_id", user.id);

      if (error) {
        toast.error("Failed to update draft.");
      } else {
        toast.success("Draft updated successfully!");
      }
    } else {
      const { data, error } = await supabase
        .from("drafts")
        .insert([{ user_id: user.id, draft_data: minimalDraftData, name: seriesName, is_public: isPublic }])
        .select()
        .single();

      if (error) {
        toast.error("Failed to save draft.");
      } else {
        setDraftId(data.id);
        setDraftOwnerId(user.id);
        window.history.pushState(null, "", `/?draft=${data.id}`);
        toast.success("Draft saved!");
      }
    }
  };

  const handleDownload = async () => {
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(pageRef.current, {
      useCORS: true,
      allowTaint: false,
      backgroundColor: CANVAS.BG_COLOR,
      scale: CANVAS.SCALE,
      onclone: (clonedDoc) => {
        const header = clonedDoc.querySelector("header");
        if (header) header.style.display = "none";
      },
    });

    const ratio = Math.min(CANVAS.WIDTH / canvas.width, CANVAS.HEIGHT / canvas.height);
    const destW = canvas.width * ratio;
    const destH = canvas.height * ratio;
    const destX = (CANVAS.WIDTH - destW) / 2;
    const destY = (CANVAS.HEIGHT - destH) / 2;

    const out = document.createElement("canvas");
    out.width = CANVAS.WIDTH;
    out.height = CANVAS.HEIGHT;
    const ctx = out.getContext("2d");
    ctx.fillStyle = CANVAS.BG_COLOR;
    ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, destX, destY, destW, destH);

    const gamePart = isFearless ? `Game${currentGameIndex + 1}` : "Draft";
    const fileName = `${sanitizeFilename(blueTeamName)}_vs_${sanitizeFilename(redTeamName)}_${gamePart}.png`;
    const link = document.createElement("a");
    link.download = fileName;
    link.href = out.toDataURL("image/png");
    link.click();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isLoadingDraft) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-white text-2xl font-black italic tracking-widest animate-pulse">
          Loading Draft...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black text-slate-200 relative"
    >
      <Header
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => setIsAuthModalOpen(true)}
        draftMode={draftMode}
        setDraftMode={setDraftMode}
        avatarUrl={avatarUrl}
      />

      <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 pt-8 px-4 md:px-8 pb-12 items-stretch">
        <DraftSidebar side="blue" />
        <ChampionPool
          onSave={handleSaveDraft}
          onDownload={handleDownload}
          onReset={resetDraft}
        />
        <DraftSidebar side="red" />
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        supabase={supabase}
      />
    </div>
  );
}
