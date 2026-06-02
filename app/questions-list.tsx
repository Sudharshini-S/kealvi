"use client";

import { useState, useEffect } from "react";
import { getVoterId } from "@/lib/voter";

type Question = {
  id: string;
  body: string;
  author: string | null;
  votes: number;
};

export default function QuestionsList({
  initialQuestions,
  initialHasMore,
}: {
  initialQuestions: Question[];
  initialHasMore: boolean;
}) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const id = setTimeout(async () => {
      const url = query
        ? `/api/questions?q=${encodeURIComponent(query)}`
        : `/api/questions`;

      const res = await fetch(url);
      const data = await res.json();

      setQuestions(data.questions);
      setHasMore(data.hasMore);
    }, 300);

    return () => clearTimeout(id);
  }, [query]);

  async function submit() {
    if (!draft.trim()) return;

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: draft,
      }),
    });

    const created = await res.json();

    setQuestions((qs) => [{ ...created, votes: 0 }, ...qs]);
    setDraft("");
  }

  async function upvote(id: string) {
    const res = await fetch(`/api/questions/${id}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voterId: getVoterId(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Something went wrong");
      return;
    }

    setQuestions((qs) =>
      qs.map((q) =>
        q.id === id
          ? {
              ...q,
              votes:
                data.action === "added"
                  ? q.votes + 1
                  : Math.max(0, q.votes - 1),
            }
          : q
      )
    );
  }

  async function loadMore() {
    setLoading(true);

    const res = await fetch(
      `/api/questions?offset=${questions.length}`
    );

    const data = await res.json();

    setQuestions((qs) => [...qs, ...data.questions]);
    setHasMore(data.hasMore);

    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">
        {hydrated ? "Interactive ✓" : "Loading interactivity…"}
      </p>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 rounded-md border border-white/10 bg-white/5 backdrop-blur-md px-3 py-2 text-white outline-none"
        />

        <button
          onClick={submit}
          className="rounded-md border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 hover:bg-white/10 transition"
        >
          Ask
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search questions..."
        className="w-full rounded-md border border-white/10 bg-white/5 backdrop-blur-md px-3 py-2 text-white outline-none"
      />

      <ul className="space-y-3">
        {questions.map((q) => (
          <li
            key={q.id}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-lg hover:bg-white/10 transition"
          >
            <button
              onClick={() => upvote(q.id)}
              className="rounded-md border border-white/10 bg-white/10 px-3 py-1 font-mono hover:bg-white/20 transition"
            >
              ▲ {q.votes}
            </button>

            <div className="flex flex-col">
              <span className="text-white">{q.body}</span>
            </div>
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="rounded-md border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2 hover:bg-white/10 disabled:opacity-50 transition"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}