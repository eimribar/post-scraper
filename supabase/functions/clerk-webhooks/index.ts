// Supabase Edge Function for Clerk Webhooks
// Official approach: https://clerk.com/blog/sync-clerk-user-data-to-supabase

import { Webhook } from 'npm:svix@1.36.0'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const webhookSecret = Deno.env.get('CLERK_WEBHOOK_SECRET')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface ClerkUserEvent {
  id: string
  email_addresses: Array<{ email_address: string }>
  first_name: string | null
  last_name: string | null
  image_url: string | null
}

interface ClerkWebhookEvent {
  type: string
  data: ClerkUserEvent
}

Deno.serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    // Verify webhook signature
    if (!webhookSecret) {
      console.error('Missing CLERK_WEBHOOK_SECRET')
      return new Response('Server configuration error', { status: 500 })
    }

    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)

    const wh = new Webhook(webhookSecret)
    let evt: ClerkWebhookEvent

    try {
      evt = wh.verify(payload, headers) as ClerkWebhookEvent
    } catch (err) {
      console.error('Error verifying webhook:', err)
      return new Response('Invalid signature', { status: 400 })
    }

    // Create Supabase client with service role (bypasses RLS)
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials')
      return new Response('Server configuration error', { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Handle webhook events
    const { type, data } = evt
    console.log(`Processing webhook: ${type}`)

    switch (type) {
      case 'user.created': {
        const { error } = await supabase.from('users').insert({
          clerk_user_id: data.id,
          email: data.email_addresses[0]?.email_address || '',
          first_name: data.first_name,
          last_name: data.last_name,
          profile_image_url: data.image_url,
        })

        if (error) {
          console.error('Error creating user:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        console.log(`User created: ${data.id}`)
        break
      }

      case 'user.updated': {
        const { error } = await supabase
          .from('users')
          .update({
            email: data.email_addresses[0]?.email_address || '',
            first_name: data.first_name,
            last_name: data.last_name,
            profile_image_url: data.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('clerk_user_id', data.id)

        if (error) {
          console.error('Error updating user:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        console.log(`User updated: ${data.id}`)
        break
      }

      case 'user.deleted': {
        if (data.id) {
          const { error } = await supabase
            .from('users')
            .delete()
            .eq('clerk_user_id', data.id)

          if (error) {
            console.error('Error deleting user:', error)
            return new Response(JSON.stringify({ error: error.message }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            })
          }

          console.log(`User deleted: ${data.id}`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${type}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
