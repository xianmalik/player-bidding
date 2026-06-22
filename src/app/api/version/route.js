export const revalidate = 86400;

export async function GET() {
  const res = await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json",
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) {
    return Response.json({ error: "Failed to fetch version data" }, { status: 502 });
  }

  const versions = await res.json();
  return Response.json(
    { patch: versions[0] },
    { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" } }
  );
}
