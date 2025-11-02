import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_URL!
const supabaseServiceKey = process.env.ENGAGETRACKER_SUPABASE_SERVICE_KEY!
const supabaseAnonKey = process.env.NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Server-side Supabase client with service role key (bypasses RLS)
 * Use this ONLY for:
 * - Webhook handlers that need to write data on behalf of users
 * - Admin operations that need to bypass RLS
 * - Background jobs
 *
 * WARNING: This bypasses all RLS policies. Use with caution.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

/**
 * Create a server-side Supabase client with Clerk authentication (Official 2025 Pattern)
 * This respects RLS policies and should be used in API routes for user-scoped operations
 *
 * Uses the official accessToken callback pattern (not deprecated JWT templates)
 * Ref: https://clerk.com/docs/integrations/databases/supabase
 *
 * @param getToken - Function that returns Clerk session token (from auth().getToken)
 * @returns Supabase client configured with Clerk authentication
 */
export function createClerkSupabaseClientSSR(getToken: () => Promise<string | null>): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => {
      return await getToken()
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
