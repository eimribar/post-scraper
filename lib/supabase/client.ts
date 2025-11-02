import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Session } from '@clerk/nextjs/server'

const supabaseUrl = process.env.NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Create a Supabase client with Clerk session token integration (Official 2025 Pattern)
 * This enables RLS policies to access the authenticated user's Clerk ID via auth.jwt()
 *
 * Uses the official accessToken callback pattern (not deprecated JWT templates)
 * Ref: https://clerk.com/docs/integrations/databases/supabase
 *
 * @param session - Clerk session object from useSession() hook
 * @returns Supabase client configured with Clerk authentication
 */
export function createClerkSupabaseClient(session: Session | null): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => {
      return session?.getToken() ?? null
    },
  })
}
