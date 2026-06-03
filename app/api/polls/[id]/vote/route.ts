import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { voterId, optionIndex } = await req.json();
    const pollId = params.id;

    // 🔥 DEBUG SAFETY (prevents invalid uuid crash)
    if (!pollId || typeof pollId !== "string") {
      return Response.json(
        { error: "Invalid poll id" },
        { status: 400 }
      );
    }

    if (optionIndex === undefined || !voterId) {
      return Response.json(
        { error: "Missing data" },
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

    /* ---------------- CASE 1: NO VOTE ---------------- */
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

      return Response.json({
        action: "added",
        optionIndex,
      });
    }

    /* ---------------- CASE 2: SAME OPTION (TOGGLE OFF) ---------------- */
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

      return Response.json({
        action: "removed",
        optionIndex,
      });
    }

    /* ---------------- CASE 3: SWITCH VOTE ---------------- */
    const { error: deleteError } = await supabase
      .from("poll_votes")
      .delete()
      .eq("id", existing.id);

    if (deleteError) {
      return Response.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

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

    return Response.json({
      action: "switched",
      optionIndex,
      previousOption: existing.option_index,
    });
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Server crash" },
      { status: 500 }
    );
  }
}