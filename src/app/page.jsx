import DraftTool from "@/components/DraftTool";
import { getPublicDraftMeta } from "@/lib/drafts";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ searchParams }) {
  const draftId = searchParams?.draft;
  if (!draftId || !UUID_RE.test(draftId)) return {};

  const draft = await getPublicDraftMeta(draftId);
  if (!draft) return {};

  const title = `${draft.blueTeamName} vs ${draft.redTeamName} | ArenaDraft`;
  const description = draft.isFearless
    ? `Fearless draft between ${draft.blueTeamName} and ${draft.redTeamName} — view the full pick/ban on ArenaDraft.`
    : `${draft.blueTeamName} vs ${draft.redTeamName} — view the full pick/ban on ArenaDraft.`;
  const ogImageUrl = `/api/og?draft=${draftId}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function HomePage() {
  return <DraftTool />;
}
