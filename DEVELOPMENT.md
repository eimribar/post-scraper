# Development Guide - EngageTracker

## Project Overview

EngageTracker is a LinkedIn post engagement scraper built with Next.js 15, Supabase, and Apify. This guide covers the development workflow, architecture decisions, and troubleshooting steps.

## Development Setup

### Local Development

```bash
# Start development server
npm run dev
# Runs on http://localhost:8000

# Build for production
npm run build

# Run linting
npm run lint
```

### Environment Configuration

The app uses project-specific environment variable prefixes to avoid conflicts:

```bash
# All variables are prefixed with ENGAGETRACKER_
NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_URL=...
NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_ANON_KEY=...
ENGAGETRACKER_SUPABASE_SERVICE_KEY=...
ENGAGETRACKER_APIFY_API_TOKEN=...
ENGAGETRACKER_APIFY_ACTOR_ID=...
NEXT_PUBLIC_ENGAGETRACKER_APP_URL=...
ENGAGETRACKER_WEBHOOK_SECRET=...
```

## Architecture Decisions

### Authentication Flow

We implemented a custom OAuth flow following Supabase's App Router documentation:

1. **OAuth Callback**: Uses `/auth/callback` route handler
2. **Email Validation**: Validates work emails after OAuth success
3. **Middleware**: Excludes OAuth routes from processing
4. **PKCE Flow**: Uses PKCE for security (no implicit flow)

### Apify Integration

The Apify integration uses a specific JSON structure:

```json
{
  "post_url": "https://linkedin.com/posts/...",
  "reaction_type": "ALL",
  "webhooks": [...]
}
```

**Important**: The fields must be at root level, not wrapped in an `input` object.

### Database Design

- **RLS Policies**: Every table has row-level security
- **Foreign Keys**: Proper relationships between users, jobs, and data
- **Enums**: Used for job status (`pending`, `running`, `completed`, `failed`)

## Key Components

### Supabase Clients

We use two different clients:

```typescript
// Client-side (browser)
import { createClient } from '@/lib/supabase/client'

// Server-side (API routes, Server Components)
import { createClient } from '@/lib/supabase/server'
```

### Email Validation

Work email validation blocks personal domains:

```typescript
import { isWorkEmail, getWorkEmailErrorMessage } from '@/lib/email-validation'

// Blocks: gmail.com, yahoo.com, outlook.com, etc.
// Allows: company.com, organization.org, etc.
```

### Middleware

The middleware excludes OAuth callback routes:

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|auth/callback).*)',
  ],
}
```

## API Routes

### `/api/scrape/initiate`

Creates a new scraping job:

1. Validates LinkedIn URL format
2. Checks user authentication
3. Creates job record in database
4. Calls Apify actor with webhook
5. Returns job ID for tracking

### `/api/scrape/webhook`

Handles Apify webhook callbacks:

1. Verifies webhook signature
2. Fetches data from Apify dataset
3. Stores engagement data in database
4. Updates job status

### `/api/scrape/poll`

Polling fallback for development:

1. Checks job status
2. Fetches data if completed
3. Used when webhooks aren't available locally

## Common Issues & Solutions

### OAuth Issues

**Problem**: "auth_failed" error
**Solution**: 
- Verify redirect URLs match exactly
- Clear browser cookies/cache
- Check middleware excludes OAuth routes

**Problem**: Personal emails can sign in
**Solution**: 
- Email validation runs after OAuth success
- Personal emails are signed out automatically
- Error message shown on signin page

### Apify Issues

**Problem**: Wrong URL being scraped
**Solution**: 
- Ensure JSON structure is flat (no `input` wrapper)
- Remove unnecessary fields like `limit`, `page_number`
- Only send `post_url` and `reaction_type`

**Problem**: Webhook not receiving data
**Solution**: 
- Verify webhook URL is publicly accessible
- Check webhook secret matches
- Use polling in development

### Database Issues

**Problem**: RLS policies blocking access
**Solution**: 
- Check policies use `auth.uid()` correctly
- Verify foreign key relationships
- Test with service key for debugging

**Problem**: Migration errors
**Solution**: 
- Check enum types exist before creating tables
- Use `IF NOT EXISTS` for idempotent migrations
- Handle foreign key constraints properly

## Development Workflow

### Making Changes

1. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes locally**
   ```bash
   npm run dev
   # Test changes thoroughly
   ```

3. **Run linting**
   ```bash
   npm run lint
   ```

4. **Test authentication flow**
   - Test OAuth with work email
   - Test OAuth with personal email (should be blocked)
   - Test email/password signin

5. **Test scraping flow**
   - Submit LinkedIn URL
   - Verify job creation
   - Check webhook/polling works
   - Verify data appears in dashboard

6. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

### Testing Checklist

Before deploying:

- [ ] OAuth works with work emails
- [ ] Personal emails are blocked and show error
- [ ] LinkedIn URL validation works
- [ ] Scraping creates jobs correctly
- [ ] Webhook/polling returns data
- [ ] Dashboard displays data
- [ ] RLS policies enforce user isolation
- [ ] Middleware protects routes correctly

## Deployment

### Vercel Configuration

1. **Environment Variables**: All prefixed with `ENGAGETRACKER_`
2. **Build Command**: `npm run build`
3. **Output Directory**: `.next`
4. **Node.js Version**: 18.x

### Post-Deployment Steps

1. **Update Supabase URLs**: Add production URL to redirect URLs
2. **Test OAuth Flow**: Verify production OAuth works
3. **Test Webhooks**: Ensure Apify can reach webhook endpoint
4. **Monitor Logs**: Check Vercel function logs for errors

## Performance Considerations

### Database

- **Indexes**: Add indexes on frequently queried columns
- **Connection Pooling**: Supabase handles this automatically
- **RLS Performance**: Keep policies simple for better performance

### API Routes

- **Caching**: Consider caching static data
- **Rate Limiting**: Implement for public endpoints
- **Error Handling**: Always return proper HTTP status codes

### Frontend

- **Real-time Updates**: Use Supabase subscriptions sparingly
- **Image Optimization**: Next.js handles this automatically
- **Bundle Size**: Monitor and optimize imports

## Debugging Tips

### Authentication Issues

```bash
# Check if user is authenticated in browser console
console.log(await supabase.auth.getUser())

# Check middleware logs
console.log('Middleware processing:', request.nextUrl.pathname)
```

### Database Issues

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'scraping_jobs';

-- Test with service key (bypasses RLS)
-- Use in server-side debugging only
```

### Apify Issues

```bash
# Check webhook payload
console.log('Webhook received:', JSON.stringify(body, null, 2))

# Verify Apify response
console.log('Apify response:', await apifyResponse.text())
```

## Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Standard Next.js rules
- **Prettier**: Automatic formatting
- **File Naming**: kebab-case for files, PascalCase for components

## Security Checklist

- [ ] All API routes check authentication
- [ ] RLS policies prevent data leakage
- [ ] Webhooks verify signatures
- [ ] Environment variables are prefixed
- [ ] No secrets in client-side code
- [ ] HTTPS enforced in production