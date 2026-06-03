import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;

    if (!pollId) {
      return Response.json(
        { error: "Missing poll id" },
        { status: 400 }
      );
    }

    const { voterId, optionIndex } = await req.json();

    if (!voterId) {
      return Response.json(
        { error: "Missing voter id" },
        { status: 400 }
      );
    }

    const { data: existingVote } = await supabase
      .from("poll_votes")
      .select("*")
      .eq("poll_id", pollId)
      .eq("voter_id", voterId)
      .maybeSingle();

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

    // Click same option again -> remove vote
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
    return Response.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}