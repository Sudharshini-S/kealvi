import { supabase } from "@/lib/supabase";

export async function POST(req: Request, context: any) {
  try {
    const pollId = context?.params?.id;

    if (!pollId) {
      return Response.json(
        { error: "Invalid poll id (missing param)" },
        { status: 400 }
      );
    }

    const { voterId, optionIndex } = await req.json();

    if (!voterId || optionIndex === undefined) {
      return Response.json(
        { error: "Missing vote data" },
        { status: 400 }
      );
    }

    // check existing vote
    const { data: existing, error: fetchError } = await supabase
      .from("poll_votes")
      .select("*")
      .eq("poll_id", pollId)
      .eq("voter_id", voterId)
      .maybeSingle();

    if (fetchError) {
      return Response.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    // CASE 1: NEW VOTE
    if (!existing) {
      const { error } = await supabase.from("poll_votes").insert({
        poll_id: pollId,
        voter_id: voterId,
        option_index: optionIndex,
      });

      if (error) {
        return Response.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return Response.json({ action: "added" });
    }

    // CASE 2: TOGGLE OFF SAME OPTION
    if (existing.option_index === optionIndex) {
      const { error } = await supabase
        .from("poll_votes")
        .delete()
        .eq("id", existing.id);

      if (error) {
        return Response.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return Response.json({ action: "removed" });
    }

    // CASE 3: SWITCH VOTE
    await supabase
      .from("poll_votes")
      .delete()
      .eq("id", existing.id);

    const { error: insertError } = await supabase
      .from("poll_votes")
      .insert({
        poll_id: pollId,
        voter_id: voterId,
        option_index: optionIndex,
      });

    if (insertError) {
      return Response.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return Response.json({ action: "switched" });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Server crash" },
      { status: 500 }
    );
  }
}