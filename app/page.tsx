import Questions from "@/components/Questions";
import { SEED } from "@/lib/seed";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Live Q&amp;A
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Ask a question or upvote the ones you want answered.
        </p>
      </header>
      <Questions initial={SEED} />
    </main>
  );
}
