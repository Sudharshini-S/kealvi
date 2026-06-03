import { supabase } from "./supabase";

export async function getPolls() {
  const { data, error } = await supabase
    .from("polls")
    .select("*, poll_votes(option_index)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((poll) => {
    const voteCounts: number[] = Array(
      poll.options.length
    ).fill(0);

    poll.poll_votes?.forEach((v: any) => {
      voteCounts[v.option_index]++;
    });

    return {
      ...poll,
      voteCounts,
    };
  });
}

export async function createPoll(question: string, options: string[]) {
  return supabase
    .from("polls")
    .insert({
      question,
      options,
    })
    .select()
    .single();
}