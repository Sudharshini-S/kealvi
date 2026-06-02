import { createClient } from "@supabase/supabase-js";

// Server-only client. The service role key is a password to the whole
// database — it lives here, on the server, and never ships to the browser.
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);