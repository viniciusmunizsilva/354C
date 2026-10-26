/**
 * Centralized Supabase environment handling.
 *
 * The app is designed to run (viewer demo + static UI) even before a Supabase
 * project has been provisioned. Anything that needs the backend first checks
 * `isSupabaseConfigured()` and shows a setup state instead of crashing.
 *
 * Only the public (anon) key is ever read on the client. The service-role key
 * is never imported here and must never reach the browser.
 */

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
