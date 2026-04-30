import championRoles from "@/lib/championRoles";
import { PATCH_NO } from "@/lib/const";

export const revalidate = 86400;

export async function GET() {
  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/data/en_US/champion.json`,
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
        id:    String(champ.id ?? "").slice(0, 64),
        key:   String(champ.key ?? "").slice(0, 8),
        name:  String(champ.name ?? "").slice(0, 64),
        title: String(champ.title ?? "").slice(0, 128),
        image: { full: String(champ.image?.full ?? "").slice(0, 128) },
        roles: championRoles[champ.id] ?? [],
      },
    ])
  );

  return Response.json(data);
}
