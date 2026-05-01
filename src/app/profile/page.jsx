"use client";

import { ArrowLeft, Camera, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabaseClient";

const DISPLAY_NAME_MAX = 64;
const USERNAME_MAX = 32;
const BIO_MAX = 200;
const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
const USERNAME_RE = /^[a-z0-9_]+$/;

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);

  const loadProfile = async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, username, bio, avatar_url")
      .eq("id", userId)
      .single();

    if (data) {
      setDisplayName(data.display_name ?? "");
      setUsername(data.username ?? "");
      setBio(data.bio ?? "");
      setAvatarUrl(data.avatar_url ?? null);
    }
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (!u) { router.replace("/"); return; }
      loadProfile(u.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (!u) router.replace("/");
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error("Image must be under 2 MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = {};
    if (displayName.length > DISPLAY_NAME_MAX)
      errs.displayName = `Max ${DISPLAY_NAME_MAX} characters.`;
    if (username && !USERNAME_RE.test(username))
      errs.username = "Only lowercase letters, numbers, and underscores.";
    if (username.length > USERNAME_MAX)
      errs.username = `Max ${USERNAME_MAX} characters.`;
    if (bio.length > BIO_MAX)
      errs.bio = `Max ${BIO_MAX} characters.`;
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    let newAvatarUrl = avatarUrl;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop().toLowerCase();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });

      if (uploadError) {
        toast.error("Failed to upload avatar.");
        setSaving(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      newAvatarUrl = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(null);
      }
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        display_name: displayName.trim() || null,
        username: username.trim() || null,
        bio: bio.trim() || null,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      if (error.code === "23505") {
        setErrors({ username: "That username is already taken." });
      } else {
        toast.error("Failed to save profile.");
      }
    } else {
      toast.success("Profile saved!");
    }

    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="text-amber-400 w-8 h-8 animate-spin" />
      </div>
    );
  }

  const avatarSrc = avatarPreview ?? avatarUrl;
  const initials = (displayName || user?.email || "?")[0].toUpperCase();

  return (
    <div className="min-h-screen bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black text-slate-200">
      <div className="max-w-xl mx-auto px-4 pt-10 pb-20 space-y-8">

        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft size={15} />
          Back to Draft
        </button>

        {/* Page title */}
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">
            Edit <span className="text-amber-400">Profile</span>
          </h1>
          <p className="text-white/30 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Avatar picker */}
        <div className="flex items-end gap-5">
          <div
            className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 cursor-pointer group hover:border-amber-400/40 transition-all shadow-[0_0_30px_rgba(0,0,0,0.6)]"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarSrc ? (
              <Image src={avatarSrc} alt="Avatar" fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 text-3xl font-black select-none">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white w-6 h-6" />
            </div>
            {avatarPreview && (
              <div className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                <Check size={11} strokeWidth={3} className="text-slate-900" />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs font-black uppercase tracking-widest text-white/60 hover:text-white"
            >
              <Camera size={14} />
              Change Photo
            </button>
            <p className="text-[10px] text-white/25 leading-snug">
              JPEG · PNG · WebP · Max 2 MB
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5" />

        {/* Form */}
        <div className="space-y-6">

          {/* Display Name */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={DISPLAY_NAME_MAX}
              placeholder="Your name"
              className="w-full h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-white text-sm font-medium focus:outline-none focus:border-amber-400/60 placeholder:text-white/20 transition-colors"
            />
            <div className="flex justify-between mt-1.5">
              {errors.displayName
                ? <p className="text-xs text-red-400 font-bold">{errors.displayName}</p>
                : <span />}
              <p className="text-[10px] text-white/20 ml-auto">{displayName.length}/{DISPLAY_NAME_MAX}</p>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-bold pointer-events-none">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                maxLength={USERNAME_MAX}
                placeholder="yourusername"
                className={`w-full h-12 bg-black/40 border rounded-xl pl-8 pr-4 text-white text-sm font-medium focus:outline-none placeholder:text-white/20 transition-colors ${
                  errors.username
                    ? "border-red-500/50 focus:border-red-400/60"
                    : "border-white/10 focus:border-amber-400/60"
                }`}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              {errors.username
                ? <p className="text-xs text-red-400 font-bold">{errors.username}</p>
                : <p className="text-[10px] text-white/20">Lowercase letters, numbers, underscores</p>}
              <p className="text-[10px] text-white/20 ml-auto">{username.length}/{USERNAME_MAX}</p>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={BIO_MAX}
              placeholder="Tell us about yourself…"
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium focus:outline-none focus:border-amber-400/60 placeholder:text-white/20 transition-colors resize-none"
            />
            <div className="flex justify-between mt-1.5">
              {errors.bio
                ? <p className="text-xs text-red-400 font-bold">{errors.bio}</p>
                : <span />}
              <p className="text-[10px] text-white/20 ml-auto">{bio.length}/{BIO_MAX}</p>
            </div>
          </div>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black uppercase tracking-widest rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-6 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-500/60">
            Danger Zone
          </p>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white/60">Sign out</p>
              <p className="text-xs text-white/25 mt-0.5">
                Log out of your account on this device
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 px-4 py-2 rounded-xl border border-red-500/25 text-red-400 hover:bg-red-500/10 text-xs font-black uppercase tracking-widest transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
