"use client";

import { useState, useEffect } from "react";
import { getVoterId } from "@/lib/voter";

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

export default function QuestionsList({
  initialQuestions,
  initialHasMore,
}: {
  initialQuestions: Question[];
  initialHasMore: boolean;
}) {
  // ---------------- QUESTIONS ----------------
  const [questions, setQuestions] = useState(initialQuestions);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  // ---------------- POLLS ----------------
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // ---------------- QUESTIONS FETCH ----------------
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

  // ---------------- POLLS FETCH ----------------
  useEffect(() => {
    fetch("/api/polls")
      .then((r) => r.json())
      .then((d) => setPolls(d.polls || []));
  }, []);

  // ---------------- QUESTION ACTIONS ----------------
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
      body: JSON.stringify({ voterId: getVoterId() }),
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

    const res = await fetch(`/api/questions?offset=${questions.length}`);
    const data = await res.json();

    setQuestions((qs) => [...qs, ...data.questions]);
    setHasMore(data.hasMore);

    setLoading(false);
  }

  // ---------------- POLL CREATE (FIXED SAFE VERSION) ----------------
  async function createPoll() {
    if (!pollQuestion.trim()) return;

    const res = await fetch("/api/polls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: pollQuestion,
        options: pollOptions.filter((o) => o.trim()),
      }),
    });

    // 🔥 SAFE JSON HANDLING (FIX FOR YOUR ERROR)
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ Invalid JSON from /api/polls:", text);
      alert("Server error while creating poll");
      return;
    }

    if (!res.ok) {
      alert(data?.error || "Failed to create poll");
      return;
    }

    setPolls((p) => [data, ...p]);
    setPollQuestion("");
    setPollOptions(["", ""]);
  }

  // ---------------- POLL VOTE ----------------
  async function votePoll(pollId: string, optionIndex: number) {
    const res = await fetch(`/api/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        voterId: getVoterId(),
        optionIndex,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Poll vote failed");
      return;
    }

    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId) return p;

        const updated = { ...p };

        if (!updated.voteCounts) {
          updated.voteCounts = Array(updated.options.length).fill(0);
        }

        return updated;
      })
    );
  }

  // ---------------- UI ----------------
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        {hydrated ? "Interactive ✓" : "Loading interactivity…"}
      </p>

      {/* QUESTIONS */}
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
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
          >
            <button
              onClick={() => upvote(q.id)}
              className="rounded-md border border-white/10 bg-white/10 px-3 py-1 font-mono"
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
          className="rounded-md border border-white/10 bg-white/5 px-4 py-2"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}

      {/* POLLS */}
      <div className="mt-10 space-y-4">
        <h2 className="text-xl font-medium">Polls</h2>

        {/* CREATE POLL */}
        <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
          <input
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            placeholder="Poll question..."
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
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
              className="w-full mt-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white outline-none"
            />
          ))}

          <button
            onClick={() => setPollOptions([...pollOptions, ""])}
            className="text-sm text-blue-400"
          >
            + Add option
          </button>

          <button
            onClick={createPoll}
            className="block mt-2 rounded-md bg-blue-500 px-4 py-2 text-white"
          >
            Create Poll
          </button>
        </div>

        {/* POLL LIST */}
        {polls.map((poll) => {
          const total = poll.totalVotes || 0;

          return (
            <div
              key={poll.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
            >
              <p className="font-medium text-white">{poll.question}</p>

              <p className="text-xs text-gray-400">
                {total} vote{total !== 1 ? "s" : ""}
              </p>

              <div className="space-y-2">
                {poll.options.map((opt, i) => {
                  const count = poll.voteCounts?.[i] || 0;
                  const percent =
                    total > 0 ? Math.round((count / total) * 100) : 0;

                  return (
                    <button
                      key={i}
                      onClick={() => votePoll(poll.id, i)}
                      className="w-full text-left p-2 rounded-md hover:bg-white/10"
                    >
                      <div className="flex justify-between text-sm text-white">
                        <span>{opt}</span>
                        <span className="text-gray-400">{percent}%</span>
                      </div>

                      <div className="mt-1 h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <div className="text-xs text-gray-500 mt-1">
                        {count} vote{count !== 1 ? "s" : ""}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}