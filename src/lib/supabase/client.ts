"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "./config";

/**
 * Browser Supabase client. Returns `null` when the backend is not configured
 * so callers can render a setup state rather than throw.
 */
export function getBrowserSupabase() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
