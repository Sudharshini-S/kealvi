import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { voterId } = await req.json();
  const { id: questionId } = await params;

  // Check whether this user already voted
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("question_id", questionId)
    .eq("voter_id", voterId)
    .maybeSingle();

  // Vote exists → remove it
  if (existingVote) {
    const { error } = await supabase
      .from("votes")
      .delete()
      .eq("id", existingVote.id);

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      action: "removed",
    });
  }

  // Vote doesn't exist → add it
  const { error } = await supabase
    .from("votes")
    .insert({
      question_id: questionId,
      voter_id: voterId,
    });

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json({
    success: true,
    action: "added",
  });
}