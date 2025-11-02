# Clerk + Supabase Integration Setup Guide

This guide follows the **official Clerk and Supabase integration documentation** for third-party authentication.

## 📚 Official Documentation

- **Clerk**: https://clerk.com/docs/integrations/databases/supabase
- **Supabase**: https://supabase.com/docs/guides/auth/third-party/clerk

## ✅ Implementation Status

Your codebase has been updated to follow the official Clerk + Supabase integration pattern:

- ✅ Supabase client factory functions with Clerk JWT integration
- ✅ API routes using per-request Supabase clients with Clerk tokens
- ✅ Dashboard component using Clerk session tokens
- ✅ RLS policies using `auth.jwt()->>'sub'` pattern
- ✅ Webhook handler for user synchronization

## 🔧 Required Setup Steps

### Step 1: Configure Clerk for Supabase Integration

#### Option A: Using Clerk's Automatic Setup (Recommended)

1. Go to https://dashboard.clerk.com/
2. Navigate to **Integrations** → **Supabase**
3. Click **"Connect with Supabase"** or **"Activate Supabase integration"**
4. Follow the wizard - it will automatically:
   - Add the `role: authenticated` claim to your JWT
   - Create a JWT template named "supabase" (if needed)
5. **Save your Clerk domain** (e.g., `your-app.clerk.accounts.dev`)

#### Option B: Manual JWT Template Setup

If automatic setup isn't available:

1. In Clerk Dashboard, go to **JWT Templates**
2. Click **New template**
3. Name it: `supabase` (exactly this name)
4. Add this claim:
   ```json
   {
     "role": "authenticated"
   }
   ```
5. Save the template

### Step 2: Configure Supabase for Clerk Authentication

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Scroll to **Third-Party Auth**
5. Click **"Add provider"**
6. Select **Clerk** from the list
7. Enter your **Clerk domain** (from Step 1)
   - Example: `your-app.clerk.accounts.dev`
8. Click **Save**

### Step 3: Run Database Migration

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `/supabase-schema.sql`
4. Paste into the SQL editor
5. Click **"Run"**

This creates:
- `users` table (synced from Clerk via webhook)
- `posts`, `scraping_jobs`, `engagements` tables
- RLS policies using `auth.jwt()->>'sub'` pattern
- Indexes for performance

### Step 4: Set Up Environment Variables

Update your `.env.local` with Supabase credentials:

```bash
# Clerk Authentication (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Configuration
NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_ANON_KEY=your-anon-key
ENGAGETRACKER_SUPABASE_SERVICE_KEY=your-service-role-key

# Apify API
ENGAGETRACKER_APIFY_API_TOKEN=your-apify-token

# App URL
NEXT_PUBLIC_ENGAGETRACKER_APP_URL=http://localhost:3000
```

**Where to find Supabase keys:**
1. Supabase Dashboard → Settings → API
2. **Project URL** → `NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_URL`
3. **anon public key** → `NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_ANON_KEY`
4. **service_role key** → `ENGAGETRACKER_SUPABASE_SERVICE_KEY` ⚠️ Keep secret!

### Step 5: Configure Clerk Webhook (User Sync)

#### Development (Using ngrok)

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Copy the https URL (e.g., https://abc123.ngrok.io)
```

#### Configure Webhook in Clerk

1. Clerk Dashboard → **Webhooks**
2. Click **"Add Endpoint"**
3. Endpoint URL:
   - Dev: `https://abc123.ngrok.io/api/webhooks/clerk`
   - Prod: `https://your-domain.com/api/webhooks/clerk`
4. Select events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
5. Copy the **Signing Secret** (starts with `whsec_`)
6. Add to `.env.local`:
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_your_secret_here
   ```

### Step 6: Restart Development Server

```bash
# Kill any running servers
lsof -ti:3000 | xargs kill -9

# Start fresh
npm run dev
```

## 🧪 Testing the Integration

### Test 1: User Synchronization

1. Visit http://localhost:3000
2. Click **"Signup"** in navbar
3. Create a new account
4. Check Supabase Dashboard → **Table Editor** → `users`
5. ✅ Your user should appear with `clerk_user_id`

**If user doesn't appear:**
- Check Clerk Dashboard → Webhooks → Recent deliveries
- Check Next.js console for webhook errors
- Verify `CLERK_WEBHOOK_SECRET` is correct

### Test 2: RLS Policies

1. Sign in to your app
2. Go to Dashboard (should load without errors)
3. Open browser DevTools → Network tab
4. Try creating a scraping job
5. ✅ Database queries should succeed with proper RLS filtering

**If you see "permission denied" errors:**
- Check Supabase Dashboard → Logs
- Verify JWT template is named exactly "supabase"
- Verify Clerk domain is correctly configured in Supabase

### Test 3: Multi-User Data Isolation

1. Sign up as User A, create some scraping jobs
2. Sign out
3. Sign up as User B
4. ✅ User B should NOT see User A's jobs (RLS working)

## 🔍 Troubleshooting

### Error: "Missing Supabase access token"

**Cause:** Clerk JWT template not configured

**Fix:**
1. Verify JWT template named "supabase" exists in Clerk Dashboard
2. Verify it includes `{"role": "authenticated"}` claim
3. Or use Clerk's automatic Supabase integration setup

### Error: "permission denied for table"

**Cause:** RLS policies not finding user ID in JWT

**Fix:**
1. Check that `auth.jwt()->>'sub'` returns your Clerk user ID:
   ```sql
   SELECT auth.jwt()->>'sub';
   ```
2. Verify Clerk is configured as third-party auth provider in Supabase
3. Check browser Network tab for JWT token in Authorization header

### Error: Webhook failing (user not syncing)

**Cause:** Webhook URL unreachable or signature verification failing

**Fix:**
1. For local dev, ensure ngrok is running
2. Verify webhook URL in Clerk Dashboard is correct
3. Check `CLERK_WEBHOOK_SECRET` matches Clerk Dashboard
4. Check Next.js console for webhook errors

### Error: "No authenticated user" in API routes

**Cause:** Clerk middleware not protecting routes correctly

**Fix:**
1. Check `middleware.ts` - verify routes are in `isProtectedRoute` matcher
2. Verify user is signed in (check Clerk DevTools)
3. Check that JWT template is being used correctly

## 🏗️ Architecture Overview

### How It Works

```
┌──────────┐
│  Browser │
└────┬─────┘
     │ 1. User signs in
     ↓
┌──────────┐
│   Clerk  │ (Authentication)
└────┬─────┘
     │ 2. Issues JWT with "sub" claim
     ↓
┌──────────┐
│ Your App │
└────┬─────┘
     │ 3. Passes JWT to Supabase
     ↓
┌──────────┐
│ Supabase │ (Database + RLS)
└──────────┘
  4. RLS checks: auth.jwt()->>'sub' = clerk_user_id
```

### Key Files

| File | Purpose |
|------|---------|
| `/lib/supabase/client.ts` | Factory for client-side Supabase with Clerk JWT |
| `/lib/supabase/server.ts` | Factory for server-side Supabase with Clerk JWT |
| `/app/api/scrape/*/route.ts` | API routes using `createClerkSupabaseClientSSR()` |
| `/app/dashboard/page.tsx` | Dashboard using `createClerkSupabaseClient()` |
| `/app/api/webhooks/clerk/route.ts` | Syncs Clerk users → Supabase |
| `/supabase-schema.sql` | Database schema with RLS policies |

### Authentication Flow

1. **User signs up/in** → Clerk handles authentication
2. **Clerk issues JWT** → Contains `sub` claim with Clerk user ID
3. **App requests data** → Passes JWT to Supabase via Authorization header
4. **Supabase checks RLS** → Uses `auth.jwt()->>'sub'` to verify ownership
5. **Data returned** → Only user's own data (RLS enforced)

### Data Sync Flow

1. **User created in Clerk** → Webhook triggered
2. **Webhook calls** `/api/webhooks/clerk` → Verified with Svix
3. **User inserted** → Supabase `users` table via `supabaseAdmin` (bypasses RLS)
4. **Foreign keys work** → `scraping_jobs.clerk_user_id` references `users.clerk_user_id`

## 🚀 Production Deployment Checklist

Before deploying to production:

- [ ] Update Clerk redirect URLs (production domain)
- [ ] Update webhook URL to production domain
- [ ] Set all environment variables in hosting platform
- [ ] Run database migration on production Supabase
- [ ] Test sign-up flow in production
- [ ] Test RLS policies work correctly
- [ ] Monitor Clerk webhook deliveries
- [ ] Set up Supabase database backups

## 📖 Additional Resources

- **Clerk + Supabase Guide**: https://clerk.com/docs/integrations/databases/supabase
- **Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security
- **Clerk JWT Templates**: https://clerk.com/docs/backend-requests/making/jwt-templates
- **Supabase Third-Party Auth**: https://supabase.com/docs/guides/auth/third-party/clerk

## 🆘 Support

If you encounter issues:

1. Check the official documentation links above
2. Review the Troubleshooting section
3. Check Clerk Dashboard → Webhooks for delivery status
4. Check Supabase Dashboard → Logs for RLS errors
5. Check browser DevTools → Network tab for JWT tokens
6. Check Next.js console for server-side errors

---

**Last Updated:** Based on official Clerk + Supabase third-party auth integration (2025)
