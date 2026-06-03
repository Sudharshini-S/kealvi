import { supabase } from "@/lib/supabase";

export async function POST(req: Request, context: any) {
  const pollId = context?.params?.id;

  const { voterId, optionIndex } = await req.json();

  const { data: existing } = await supabase
    .from("poll_votes")
    .select("*")
    .eq("poll_id", pollId)
    .eq("voter_id", voterId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("poll_votes").insert({
      poll_id: pollId,
      voter_id: voterId,
      option_index: optionIndex,
    });

    return Response.json({ action: "added" });
  }

  return Response.json({ action: "exists" });
}