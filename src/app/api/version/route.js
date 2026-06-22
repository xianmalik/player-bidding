export const revalidate = 3600;

export async function GET() {
  const res = await fetch(
    "https://ddragon.leagueoflegends.com/api/versions.json",
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    return Response.json({ error: "Failed to fetch version data" }, { status: 502 });
  }

  const versions = await res.json();
  return Response.json(
    { patch: versions[0] },
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=300" } }
  );
}
