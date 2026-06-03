import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { voterId, optionIndex } = await req.json();
  const pollId = params.id;

  // check existing vote
  const { data: existing } = await supabase
    .from("poll_votes")
    .select("*")
    .eq("poll_id", pollId)
    .eq("voter_id", voterId)
    .maybeSingle();

  // REMOVE vote (toggle)
  if (existing) {
    const { error } = await supabase
      .from("poll_votes")
      .delete()
      .eq("id", existing.id);

    if (error)
      return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ action: "removed" });
  }

  // ADD vote
  const { error } = await supabase.from("poll_votes").insert({
    poll_id: pollId,
    voter_id: voterId,
    option_index: optionIndex,
  });

  if (error)
    return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ action: "added" });
}