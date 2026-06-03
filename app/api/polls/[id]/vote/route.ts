import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await context.params;

    console.log("pollId =", pollId);

    if (!pollId) {
      return Response.json(
        { error: "Missing poll id" },
        { status: 400 }
      );
    }

    const { voterId, optionIndex } = await req.json();

    console.log("voterId =", voterId);

    if (!voterId) {
      return Response.json(
        { error: "Missing voter id" },
        { status: 400 }
      );
    }

    const { data: existingVote, error: findError } = await supabase
      .from("poll_votes")
      .select("*")
      .eq("poll_id", pollId)
      .eq("voter_id", voterId)
      .maybeSingle();

    if (findError) {
      return Response.json(
        { error: findError.message },
        { status: 500 }
      );
    }

    // First vote
    if (!existingVote) {
      const { error } = await supabase
        .from("poll_votes")
        .insert({
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
      });
    }

    // Remove vote
    if (existingVote.option_index === optionIndex) {
      const { error } = await supabase
        .from("poll_votes")
        .delete()
        .eq("id", existingVote.id);

      if (error) {
        return Response.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return Response.json({
        action: "removed",
      });
    }

    // Switch vote
    const { error } = await supabase
      .from("poll_votes")
      .update({
        option_index: optionIndex,
      })
      .eq("id", existingVote.id);

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      action: "switched",
      previousOption: existingVote.option_index,
      optionIndex,
    });
  } catch (err: any) {
    console.error(err);

    return Response.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}