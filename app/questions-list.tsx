"use client";

import { useState, useEffect } from "react";
import { getVoterId } from "@/lib/voter";

/* ---------------- TYPES ---------------- */

type Question = {
  id: string;
  body: string;
  author: string | null;
  votes: number;
};

type Poll = {
  id: string;
  question: string;
  options: string[];
  voteCounts?: number[];
  totalVotes?: number;
};

/* ---------------- COMPONENT ---------------- */

export default function QuestionsList({
  initialQuestions,
  initialHasMore,
}: {
  initialQuestions: Question[];
  initialHasMore: boolean;
}) {
  /* ---------------- QUESTIONS STATE ---------------- */
  const [questions, setQuestions] = useState(initialQuestions);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  /* ---------------- POLLS STATE ---------------- */
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  /* ---------------- UI ---------------- */
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  /* ---------------- FETCH QUESTIONS ---------------- */
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

  /* ---------------- FETCH POLLS ---------------- */
  useEffect(() => {
    async function loadPolls() {
      try {
        const res = await fetch("/api/polls");
        const data = await res.json();

        setPolls(data.polls || []);
      } catch (err) {
        console.error("Poll fetch error:", err);
        setPolls([]);
      }
    }

    loadPolls();
  }, []);

  /* ---------------- QUESTION FUNCTIONS ---------------- */
  async function submit() {
    if (!draft.trim()) return;

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });

    const created = await res.json();

    setQuestions((qs) => [{ ...created, votes: 0 }, ...qs]);
    setDraft("");
  }

  async function upvote(id: string) {
    const res = await fetch(`/api/questions/${id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  /* ---------------- POLL FUNCTIONS ---------------- */

  async function createPoll() {
    if (!pollQuestion.trim()) return;

    const cleanOptions = pollOptions.filter((o) => o.trim());

    if (cleanOptions.length < 2) {
      alert("Need at least 2 options");
      return;
    }

    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: pollQuestion,
          options: cleanOptions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create poll");
        return;
      }

      setPolls((p) => [
        {
          ...data,
          voteCounts: Array(cleanOptions.length).fill(0),
          totalVotes: 0,
        },
        ...p,
      ]);

      setPollQuestion("");
      setPollOptions(["", ""]);
    } catch (err) {
      console.error("Create poll error:", err);
    }
  }

  async function votePoll(pollId: string | undefined, optionIndex: number) {
    if (!pollId) {
      console.error("Missing pollId:", pollId);
      return;
    }

    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voterId: getVoterId(),
          optionIndex,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Vote failed");
        return;
      }

      setPolls((prev) =>
        prev.map((p) => {
          if (p.id !== pollId) return p;

          const updated = { ...p };

          if (!updated.voteCounts) {
            updated.voteCounts = Array(updated.options.length).fill(0);
          }

          updated.voteCounts[optionIndex] =
            (updated.voteCounts[optionIndex] || 0) + 1;

          updated.totalVotes = (updated.totalVotes || 0) + 1;

          return updated;
        })
      );
    } catch (err) {
      console.error("Vote error:", err);
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        {hydrated ? "Interactive ✓" : "Loading interactivity…"}
      </p>

      {/* ---------------- QUESTIONS ---------------- */}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
        />

        <button
          onClick={submit}
          className="rounded-md border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10"
        >
          Ask
        </button>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search questions..."
        className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
      />

      <ul className="space-y-3">
        {questions.map((q) => (
          <li
            key={q.id}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <button
              onClick={() => upvote(q.id)}
              className="rounded-md bg-white/10 px-3 py-1"
            >
              ▲ {q.votes}
            </button>

            <span className="text-white">{q.body}</span>
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="rounded-md bg-white/5 px-4 py-2"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}

      {/* ---------------- POLLS ---------------- */}
      <div className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Polls</h2>

        {/* CREATE POLL */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
          <input
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            placeholder="Poll question..."
            className="w-full px-3 py-2 bg-white/5 rounded-md"
          />

          {pollOptions.map((opt, i) => (
            <input
              key={i}
              value={opt}
              onChange={(e) => {
                const copy = [...pollOptions];
                copy[i] = e.target.value;
                setPollOptions(copy);
              }}
              placeholder={`Option ${i + 1}`}
              className="w-full px-3 py-2 bg-white/5 rounded-md mt-2"
            />
          ))}

          <button
            onClick={() => setPollOptions([...pollOptions, ""])}
            className="text-blue-400 text-sm"
          >
            + Add option
          </button>

          <button
            onClick={createPoll}
            className="w-full mt-2 bg-blue-500 text-white py-2 rounded-md"
          >
            Create Poll
          </button>
        </div>

        {/* POLL LIST */}
        {polls.map((poll) => (
          <div
            key={poll.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <p className="font-medium mb-2">{poll.question}</p>

            {poll.options.map((opt, i) => {
              const count = poll.voteCounts?.[i] || 0;
              const total = poll.totalVotes || 0;
              const percent = total ? Math.round((count / total) * 100) : 0;

              return (
                <button
                  key={i}
                  onClick={() => votePoll(poll.id, i)}
                  className="w-full text-left p-2 rounded-md hover:bg-white/10"
                >
                  <div className="flex justify-between">
                    <span>{opt}</span>
                    <span className="text-gray-400">
                      {count} ({percent}%)
                    </span>
                  </div>

                  {/* WhatsApp-style bar */}
                  <div className="h-1 bg-white/10 mt-1 rounded">
                    <div
                      className="h-1 bg-blue-500 rounded"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </button>
              );
            })}

            <p className="text-xs text-gray-400 mt-2">
              {poll.totalVotes || 0} votes
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}