import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("polls")
    .select("*, poll_votes(option_index)")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const formatted = (data || []).map((poll) => {
    const voteCounts = Array(poll.options.length).fill(0);

    poll.poll_votes?.forEach((v: any) => {
      voteCounts[v.option_index]++;
    });

    const totalVotes = voteCounts.reduce((a, b) => a + b, 0);

    return {
      ...poll,
      voteCounts,
      totalVotes, // 🔥 NEW
    };
  });

  return Response.json({ polls: formatted });
}