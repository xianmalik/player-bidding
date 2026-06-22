import championRoles from "@/lib/championRoles";
import { CHAMPION_FIELD_LIMITS } from "@/lib/const";

export const revalidate = 86400;

export async function GET() {
  const versionsRes = await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json",
    { next: { revalidate: 86400 } }
  );

  if (!versionsRes.ok) {
    return Response.json({ error: "Failed to fetch version data" }, { status: 502 });
  }

  const versions = await versionsRes.json();
  const latestPatch = versions[0];

  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${latestPatch}/data/en_US/champion.json`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) {
    return Response.json({ error: "Failed to fetch champion data" }, { status: 502 });
  }

  const json = await res.json();

  const data = Object.fromEntries(
    Object.entries(json.data).map(([key, champ]) => [
      key,
      {
        id:    String(champ.id ?? "").slice(0, CHAMPION_FIELD_LIMITS.ID),
        key:   String(champ.key ?? "").slice(0, CHAMPION_FIELD_LIMITS.KEY),
        name:  String(champ.name ?? "").slice(0, CHAMPION_FIELD_LIMITS.NAME),
        title: String(champ.title ?? "").slice(0, CHAMPION_FIELD_LIMITS.TITLE),
        image: { full: String(champ.image?.full ?? "").slice(0, CHAMPION_FIELD_LIMITS.IMAGE_URL) },
        roles: championRoles[champ.id] ?? [],
      },
    ])
  );

  return Response.json(data, {
    headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" },
  });
}
