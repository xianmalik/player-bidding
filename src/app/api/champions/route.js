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
      { ...champ, roles: championRoles[champ.id] ?? [] },
    ])
  );

  return Response.json(data);
}
