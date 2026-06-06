import { supabase } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: question } = await supabase
    .from("questions")
    .select("pinned")
    .eq("id", id)
    .single();

  if (!question) {
    return Response.json(
      { error: "Question not found" },
      { status: 404 }
    );
  }

  // Limit to 2 pinned questions
  const { count } = await supabase
    .from("questions")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("pinned", true);

  if (!question.pinned && (count ?? 0) >= 2) {
    return Response.json(
      { error: "Only 2 questions can be pinned" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("questions")
    .update({
      pinned: !question.pinned,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return Response.json(data);
}