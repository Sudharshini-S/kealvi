import { supabase } from "@/lib/supabase";
import { getPolls } from "@/lib/polls";

export async function GET() {
  const polls = await getPolls();
  return Response.json({ polls });
}

export async function POST(req: Request) {
  const { question, options } = await req.json();

  const { data, error } = await supabase
    .from("polls")
    .insert({ question, options })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}