import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request) {
  if (process.env.CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ status: "error" }, { status: 401 });
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return Response.json(
      { status: "error", supabase: "misconfigured" },
      { status: 503 }
    );
  }

  try {
    const supabase = createClient(url, key);
    const { error } = await supabase
      .from("drafts")
      .select("id", { count: "exact", head: true });

    if (error) {
      return Response.json(
        { status: "error", supabase: "unreachable", message: error.message },
        { status: 503 }
      );
    }

    return Response.json({
      status: "ok",
      supabase: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return Response.json(
      { status: "error", supabase: "unreachable", message: err.message },
      { status: 503 }
    );
  }
}
