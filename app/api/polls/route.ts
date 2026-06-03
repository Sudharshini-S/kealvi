import { supabase } from "@/lib/supabase";

/* ---------------- GET POLLS ---------------- */
export async function GET() {
  try {
    // fetch polls
    const { data: polls, error } = await supabase
      .from("polls")
      .select("*");

    if (error) {
      return Response.json(
        { error: error.message, polls: [] },
        { status: 200 }
      );
    }

    // fetch all votes separately
    const { data: votes, error: voteError } = await supabase
      .from("poll_votes")
      .select("*");

    if (voteError) {
      return Response.json(
        { error: voteError.message, polls: [] },
        { status: 200 }
      );
    }

    const formatted = (polls || []).map((poll) => {
      // normalize options (jsonb safe)
      const options = Array.isArray(poll.options)
        ? poll.options
        : Object.values(poll.options || {});

      const voteCounts = Array(options.length).fill(0);

      const relatedVotes = (votes || []).filter(
        (v) => v.poll_id === poll.id
      );

      relatedVotes.forEach((v) => {
        if (voteCounts[v.option_index] !== undefined) {
          voteCounts[v.option_index]++;
        }
      });

      return {
        ...poll,
        options,
        voteCounts,
        totalVotes: relatedVotes.length,
      };
    });

    return Response.json({ polls: formatted });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Server error", polls: [] },
      { status: 200 }
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
      console.error("CREATE POLL ERROR:", error);

      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json(data);
  } catch (err: any) {
    console.error("CREATE POLL CRASH:", err);

    return Response.json(
      { error: err.message || "Server crash" },
      { status: 500 }
    );
  }
}