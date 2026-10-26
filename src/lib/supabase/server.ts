import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "./config";

/**
 * Server Supabase client bound to the request cookies.
 *
 * Cookie wiring is kept even though the current build has no auth, so that
 * enabling Supabase Auth later is a drop-in change. Returns `null` when the
 * backend is not configured.
 */
export async function getServerSupabase() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `setAll` is called from a Server Component where mutating cookies
          // is not allowed. Safe to ignore when there is no auth session to
          // refresh; middleware would handle this once auth is enabled.
        }
      },
    },
  });
}
