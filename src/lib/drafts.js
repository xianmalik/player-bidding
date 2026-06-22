import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { DRAFT_LIMITS } from "@/lib/const";
import { createClient } from "./supabaseClient";

/**
 * Fetch all drafts for a specific user (capped at DRAFT_LIMITS.USER_DRAFTS_MAX,
 * most recent first)
 * @param {string} userId - The user ID to fetch drafts for
 * @returns {Promise<Array>} Array of draft objects
 */
export async function getUserDrafts(userId) {
  if (!userId) {
    return [];
  }

  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("drafts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(0, DRAFT_LIMITS.USER_DRAFTS_MAX - 1);

    if (error) {
      return [];
    }

    return data || [];
  } catch (_error) {
    return [];
  }
}

/**
 * Delete a draft owned by the given user
 * @param {string} draftId - The draft to delete
 * @param {string} userId - The requesting user's ID (ownership check)
 * @returns {Promise<{ error: Error | null }>}
 */
export async function deleteDraft(draftId, userId) {
  if (!draftId || !userId) {
    return { error: new Error("Missing draftId or userId") };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("drafts")
      .delete()
      .eq("id", draftId)
      .eq("user_id", userId);

    return { error: error ?? null };
  } catch (error) {
    return { error };
  }
}

/**
 * Fetch minimal metadata for a public draft, for use in server-rendered
 * page metadata / OG image generation. Returns null for private/missing drafts.
 * @param {string} draftId
 * @returns {Promise<{ name: string, blueTeamName: string, redTeamName: string, isFearless: boolean } | null>}
 */
export async function getPublicDraftMeta(draftId) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key || !draftId) return null;

  try {
    const supabase = createSupabaseClient(url, key);
    const { data, error } = await supabase
      .from("drafts")
      .select("name, draft_data, is_public")
      .eq("id", draftId)
      .eq("is_public", true)
      .single();

    if (error || !data) return null;

    const dd = data.draft_data || {};
    return {
      name: data.name || `${dd.blueTeamName || "Blue Team"} vs ${dd.redTeamName || "Red Team"}`,
      blueTeamName: dd.blueTeamName || "Blue Team",
      redTeamName: dd.redTeamName || "Red Team",
      isFearless: Boolean(dd.isFearless),
    };
  } catch {
    return null;
  }
}

/**
 * Transform draft data from Supabase format to modal format
 * @param {Array} drafts - Raw drafts from Supabase
 * @returns {Array} Transformed drafts for modal display
 */
export function transformDraftsForModal(drafts) {
  return drafts.map((draft) => {
    const draftData = draft.draft_data || {};
    const isFearless = draftData.isFearless || false;

    // Use latest game for series format, fall back to legacy single-game format
    let latestGame;
    if (draftData.games && draftData.games.length > 0) {
      latestGame = draftData.games[draftData.games.length - 1];
    } else {
      latestGame = { blue: draftData.blue || [], red: draftData.red || [] };
    }

    const blueTeamChamps = (latestGame.blue || [])
      .filter((champ) => champ?.id && typeof champ.id === "string" && champ.id.trim() !== "")
      .map((champ) => champ.id);

    const redTeamChamps = (latestGame.red || [])
      .filter((champ) => champ?.id && typeof champ.id === "string" && champ.id.trim() !== "")
      .map((champ) => champ.id);

    return {
      id: draft.id,
      name: draft.name || `Draft ${new Date(draft.created_at).toLocaleDateString()}`,
      createdAt: draft.created_at,
      isPublic: draft.is_public || false,
      isFearless,
      gameCount: draftData.games ? draftData.games.length : 1,
      blueTeam: {
        name: draftData.blueTeamName || "Blue Team",
        champions: blueTeamChamps,
      },
      redTeam: {
        name: draftData.redTeamName || "Red Team",
        champions: redTeamChamps,
      },
    };
  });
}
