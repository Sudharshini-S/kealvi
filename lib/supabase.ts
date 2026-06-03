import { createClient } from "@supabase/supabase-js";

// support BOTH env naming styles safely
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY; // fallback (not ideal but works)

if (!supabaseUrl) {
  throw new Error(
    "Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL"
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing Supabase key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);