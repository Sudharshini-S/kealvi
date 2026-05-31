// Demonstrates the upvote read-then-write race against the running app.
//
// Usage (from the kealvi/ directory, with the dev server already running):
//
//   node --env-file=.env.local scripts/race-demo.mjs
//   node --env-file=.env.local scripts/race-demo.mjs http://localhost:3000 50
//
// Args: [baseUrl] [numConcurrentVotes]   (defaults: http://localhost:3000, 50)
//
// It creates a throwaway question, fires N votes concurrently at
// /api/questions/[id]/vote, then reads the true count straight from the DB
// and reports how many votes were lost. Cleans up the test question after.
//
// Needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (hence --env-file=.env.local)
// to read the final count and delete the test row.

import { createClient } from "@supabase/supabase-js";

const base = process.argv[2] ?? "http://localhost:3000";
const N = Number(process.argv[3] ?? 50);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing Supabase env vars. Run with:  node --env-file=.env.local scripts/race-demo.mjs"
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST with retries — the dev server compiles each route on its first hit.
async function post(url, body) {
  let lastErr = "";
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : {},
        body: body ? JSON.stringify(body) : undefined,
      });
      const text = await res.text();
      if (res.ok && text) return JSON.parse(text);
      lastErr = `status ${res.status}: ${text.slice(0, 120)}`;
    } catch (e) {
      lastErr = String(e);
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`no response from ${url} — last: ${lastErr}`);
}

const q = await post(`${base}/api/questions`, { body: "__race_demo__" });
console.log("created question", q.id, "— starting votes =", q.votes);

await post(`${base}/api/questions/${q.id}/vote`); // warm the vote route

console.log(`\nfiring ${N} concurrent votes...`);
await Promise.all(
  Array.from({ length: N }, () => post(`${base}/api/questions/${q.id}/vote`))
);

const { data } = await supabase
  .from("questions")
  .select("votes")
  .eq("id", q.id)
  .single();

const expected = N + 1; // +1 for the warm-up vote
console.log(`\nexpected votes: ${expected}`);
console.log(`actual votes:   ${data.votes}`);
console.log(
  data.votes < expected
    ? `❗ LOST ${expected - data.votes} votes to the read-then-write race`
    : `✅ no votes lost`
);

await supabase.from("questions").delete().eq("id", q.id);
console.log("\ncleaned up test question.");
