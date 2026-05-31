"use client";

import { useState } from "react";
import type { Question } from "@/lib/seed";

export default function Questions({ initial }: { initial: Question[] }) {
  const [questions, setQuestions] = useState<Question[]>(initial);
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return; // guard against empty body

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      body: trimmed,
      author: author.trim() || "Anonymous",
    };

    // LOCAL STATE ONLY — no network call. This is what gets lost on refresh.
    setQuestions((qs) => [newQuestion, ...qs]);
    setBody("");
    setAuthor("");
  }

  return (
    <div className="space-y-6">
      {/* Submit card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
      >
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type your question…"
          className="w-full rounded-lg bg-gray-50 px-4 py-3 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-brand/40"
        />
        <div className="mt-3 flex items-center gap-3">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name (optional)"
            className="flex-1 rounded-lg bg-gray-50 px-4 py-2 text-sm outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-brand/40"
          />
          <button
            type="submit"
            disabled={!body.trim()}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>

      {/* Questions list — each card leaves room on the right for the
          Phase 5 upvote pill to drop into once voting is wired up. */}
      <ul className="space-y-3">
        {questions.map((q) => (
          <li
            key={q.id}
            className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[15px] leading-relaxed">{q.body}</p>
              <p className="mt-2 text-xs font-medium text-gray-400">
                {q.author}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
