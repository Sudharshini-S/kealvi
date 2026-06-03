import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { question, options } = await req.json();

    if (!question || !options?.length) {
      return Response.json(
        { error: "Invalid poll data" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("polls")
      .insert({
        question,
        options,
      })
      .select()
      .single();

    if (error) {
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return Response.json(data);
  } catch (err: any) {
    return Response.json(
      { error: err.message || "Server crash" },
      { status: 500 }
    );
  }
}