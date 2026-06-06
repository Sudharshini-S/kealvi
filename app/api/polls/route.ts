import { supabase } from "@/lib/supabase";

/* ---------------- GET POLLS ---------------- */
export async function GET() {
  try {
    const { data: polls, error } = await supabase
      .from("polls")
      .select("*");

    if (error) {
      return Response.json(
        { error: error.message, polls: [] },
        { status: 200 }
      );
    }

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
      {
        error: err.message || "Server error",
        polls: [],
      },
      { status: 200 }
    );
  }
}

/* ---------------- CREATE POLL ---------------- */
export async function POST(req: Request) {
  try {
    const { question, options } = await req.json();

    const cleanOptions = (options || []).filter(
      (o: string) => o?.trim()
    );

    if (!question || cleanOptions.length < 2) {
      return Response.json(
        { error: "Invalid poll data" },
        { status: 400 }
      );
    }

    // ---------------- DUPLICATE CHECK ----------------

    const normalize = (text: string) =>
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const normalizedQuestion = normalize(question);

    const normalizedOptions = cleanOptions
      .map(normalize)
      .sort();

    const { data: existingPolls, error: fetchError } =
      await supabase
        .from("polls")
        .select("id, question, options");

    if (fetchError) {
      return Response.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    const duplicate = existingPolls?.find((poll) => {
      const sameQuestion =
        normalize(poll.question) === normalizedQuestion;

      const existingOptions = (
        Array.isArray(poll.options)
          ? poll.options
          : []
      )
        .map(normalize)
        .sort();

      const sameOptions =
        JSON.stringify(existingOptions) ===
        JSON.stringify(normalizedOptions);

      return sameQuestion && sameOptions;
    });

    if (duplicate) {
      return Response.json(
        {
          error: "An identical poll already exists.",
        },
        { status: 400 }
      );
    }

    // ---------------- CREATE POLL ----------------

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
      {
        error: err.message || "Server crash",
      },
      { status: 500 }
    );
  }
}