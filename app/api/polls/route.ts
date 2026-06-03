import { supabase } from "@/lib/supabase";

/* ---------------- GET POLLS ---------------- */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("polls")
      .select("*, poll_votes(option_index)");

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const formatted = (data || []).map((poll) => {
      const options = Array.isArray(poll.options)
        ? poll.options
        : Object.values(poll.options || {});

      const voteCounts = Array(options.length).fill(0);

      poll.poll_votes?.forEach((v: any) => {
        voteCounts[v.option_index] =
          (voteCounts[v.option_index] || 0) + 1;
      });

      const totalVotes = voteCounts.reduce((a, b) => a + b, 0);

      return {
        ...poll,
        options,
        voteCounts,
        totalVotes,
      };
    });

    return Response.json({ polls: formatted });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

/* ---------------- CREATE POLL ---------------- */
export async function POST(req: Request) {
  try {
    const { question, options } = await req.json();

    const cleanOptions = (options || []).filter((o: string) =>
      o?.trim()
    );

    if (!question || cleanOptions.length < 2) {
      return Response.json(
        { error: "Invalid poll data" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("polls")
      .insert({
        question,
        options: cleanOptions,
      })
      .select("id, question, options, created_at")
      .single();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json(data);
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Server crash" },
      { status: 500 }
    );
  }
}