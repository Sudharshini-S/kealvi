export type Question = {
  id: string;
  body: string;
  author: string;
};

// Hardcoded placeholder data — intentionally fake. Submissions made through
// the form are NOT stored here; a refresh resets the list to exactly this.
export const SEED: Question[] = [
  { id: "1", body: "Why did our questions disappear when the server restarted?", author: "Priya" },
  { id: "2", body: "Why store each vote as its own row instead of just a count column?", author: "Marcus" },
  { id: "3", body: "How does the unique constraint stop someone from voting twice?", author: "Aisha" },
];
