# Vercel Environment Variables

Add these environment variables in your Vercel project settings:

## Required Environment Variables

```
NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_URL=https://zzqyxefktvmnhqaxelrt.supabase.co
NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cXl4ZWZrdHZtbmhxYXhlbHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4NDg1MjEsImV4cCI6MjA1MTQyNDUyMX0.bMl8LyoKGIJ8T9YLN7uRLZ9sPJyQzP7U5Rf3mLsRNtE
ENGAGETRACKER_APIFY_API_TOKEN=apify_api_x8xkjTVEMhw7xOaHwvjeIAzN1dINH73XSJGy
ENGAGETRACKER_APIFY_ACTOR_ID=apimaestro~linkedin-post-reactions
NEXT_PUBLIC_ENGAGETRACKER_APP_URL=https://your-vercel-app.vercel.app
```

## Important Notes

1. Replace `https://your-vercel-app.vercel.app` with your actual Vercel deployment URL once available

2. After deployment, update these settings in Supabase:
   - Go to Supabase Dashboard > Authentication > URL Configuration
   - Add your production URL to Site URL and Redirect URLs
   - Add `https://your-vercel-app.vercel.app/auth/callback` to redirect URLs

3. Update Google OAuth settings:
   - Go to Google Cloud Console
   - Add `https://your-vercel-app.vercel.app` to Authorized JavaScript origins
   - Add `https://your-vercel-app.vercel.app/auth/callback` to Authorized redirect URIs
```