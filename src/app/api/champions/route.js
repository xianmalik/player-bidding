import { PATCH_NO } from '@/lib/const';

export const revalidate = 86400; // revalidate once per day — patch data rarely changes

export async function GET() {
  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${PATCH_NO}/data/en_US/champion.json`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) {
    return Response.json({ error: 'Failed to fetch champion data' }, { status: 502 });
  }

  const json = await res.json();
  return Response.json(json.data);
}
