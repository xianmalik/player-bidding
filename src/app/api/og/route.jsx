import { createClient } from "@supabase/supabase-js";
import { ImageResponse } from "next/og";

export const runtime = "edge";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Riot's internal champion ids are PascalCase with no spaces/punctuation
// (e.g. "MissFortune", "Khazix") — split on case boundaries for readability.
const readableName = (id) => id.replace(/([a-z0-9])([A-Z])/g, "$1 $2");

async function fetchDraftSummary(draftId) {
  if (!draftId || !UUID_RE.test(draftId)) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("drafts")
      .select("draft_data, is_public")
      .eq("id", draftId)
      .eq("is_public", true)
      .single();

    if (error || !data?.draft_data) return null;

    const dd = data.draft_data;
    const latestGame = dd.games?.[dd.games.length - 1] ?? {};

    return {
      isFearless: Boolean(dd.isFearless),
      gameCount: dd.games?.length ?? 1,
      blueTeamName: dd.blueTeamName || "Blue Team",
      redTeamName: dd.redTeamName || "Red Team",
      blueChamps: (latestGame.blue || []).filter(Boolean).map((c) => readableName(c.id)),
      redChamps: (latestGame.red || []).filter(Boolean).map((c) => readableName(c.id)),
    };
  } catch {
    return null;
  }
}

function ChampList({ names, color }) {
  const slots = Array.from({ length: 5 }, (_, i) => names[i] || "");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 320 }}>
      {slots.map((name, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-size, non-interactive list rendered once per image
        <div
          key={`${i}-${name}`}
          style={{
            display: "flex",
            alignItems: "center",
            height: 40,
            padding: "0 16px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${name ? color : "rgba(255,255,255,0.06)"}`,
            color: name ? "#fff" : "rgba(255,255,255,0.25)",
            fontSize: 20,
            fontWeight: name ? 700 : 400,
          }}
        >
          {name || "—"}
        </div>
      ))}
    </div>
  );
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const draftId = searchParams.get("draft");
  const summary = await fetchDraftSummary(draftId);

  const blueTeamName = summary?.blueTeamName ?? "Blue Team";
  const redTeamName = summary?.redTeamName ?? "Red Team";
  const blueChamps = summary?.blueChamps ?? [];
  const redChamps = summary?.redChamps ?? [];
  const blue = "#60a5fa";
  const red = "#f87171";
  const amber = "#fbbf24";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 56,
        background: "#020617",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <span style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>
          ARENA
        </span>
        <span style={{ fontSize: 36, fontWeight: 900, color: amber, letterSpacing: -1 }}>
          DRAFT
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 48 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: blue,
              textTransform: "uppercase",
              letterSpacing: -0.5,
            }}
          >
            {blueTeamName}
          </span>
          <ChampList names={blueChamps} color={blue} />
        </div>

        <span style={{ fontSize: 32, fontWeight: 900, color: "rgba(255,255,255,0.3)" }}>VS</span>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: red,
              textTransform: "uppercase",
              letterSpacing: -0.5,
            }}
          >
            {redTeamName}
          </span>
          <ChampList names={redChamps} color={red} />
        </div>
      </div>

      <div style={{ display: "flex", height: 4, width: "100%", borderRadius: 2 }}>
        <div style={{ flex: 1, background: blue }} />
        <div style={{ flex: 1, background: amber }} />
        <div style={{ flex: 1, background: red }} />
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
