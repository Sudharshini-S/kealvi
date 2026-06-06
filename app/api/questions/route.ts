import { supabase } from "@/lib/supabase";
import { getQuestionsPage, searchQuestions } from "@/lib/questions";

const PAGE_SIZE = 10;

function normalizeQuestion(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (q) {
    const questions = await searchQuestions(q, PAGE_SIZE);
    return Response.json({ questions, hasMore: false });
  }

  const offset = Number(searchParams.get("offset") ?? 0);
  const { questions, hasMore } = await getQuestionsPage(offset, PAGE_SIZE);

  return Response.json({ questions, hasMore });
}

export async function POST(req: Request) {
  const { body, author } = await req.json();

  if (!body?.trim()) {
    return Response.json(
      { error: "Question cannot be empty" },
      { status: 400 }
    );
  }

  const normalizedNew = normalizeQuestion(body);

  const { data: existingQuestions, error: fetchError } =
    await supabase
      .from("questions")
      .select("id, body");

  if (fetchError) {
    return Response.json(
      { error: fetchError.message },
      { status: 500 }
    );
  }

  const duplicate = existingQuestions?.find(
    (q) =>
      normalizeQuestion(q.body) === normalizedNew
  );

  if (duplicate) {
    return Response.json(
      {
        error: "Question already exists",
        duplicate: duplicate.body,
      },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("questions")
    .insert({
      body,
      author,
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
}