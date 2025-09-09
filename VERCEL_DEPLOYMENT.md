# Vercel Deployment Guide

## Step 1: Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository: `eimribar/post-scraper`
4. Click "Import"

## Step 2: Configure Environment Variables

In the Vercel project settings, add these environment variables:

### Required Environment Variables

Copy these variable names to Vercel and add your actual values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=(Your Supabase project URL from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_ANON_KEY=(Your Supabase anon key from API settings)
SUPABASE_SERVICE_KEY=(Your Supabase service key from API settings)

# Apify Configuration
APIFY_API_TOKEN=(Your Apify API token from account settings)
APIFY_ACTOR_ID=apimaestro~linkedin-post-reactions

# App Configuration (UPDATE THIS WITH YOUR VERCEL URL)
NEXT_PUBLIC_APP_URL=https://YOUR-PROJECT-NAME.vercel.app
WEBHOOK_SECRET=(Generate a random secret key)

# Google OAuth (configured in Supabase Dashboard)
GOOGLE_CLIENT_ID=(Your Google OAuth client ID)
GOOGLE_CLIENT_SECRET=(Your Google OAuth client secret)
```

**Note**: The actual values are stored securely in your local `.env.local` file

**IMPORTANT**: Replace `YOUR-PROJECT-NAME` with your actual Vercel project URL!

## Step 3: Deploy

Click "Deploy" and wait for the build to complete.

## Step 4: Update OAuth Redirect URLs

After deployment, you need to update the OAuth redirect URLs:

### Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add these redirect URIs:
   - `https://rkmedellooxpvquhjxsn.supabase.co/auth/v1/callback` (already added)
   - `https://YOUR-PROJECT-NAME.vercel.app/auth/callback` (add this)

### Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/rkmedellooxpvquhjxsn/auth/url-configuration)
2. Update **Site URL** to: `https://YOUR-PROJECT-NAME.vercel.app`
3. Add to **Redirect URLs**:
   - `https://YOUR-PROJECT-NAME.vercel.app/auth/callback`
   - `http://localhost:8000/auth/callback` (keep for development)

## Step 5: Test Production Deployment

1. Visit your production URL: `https://YOUR-PROJECT-NAME.vercel.app`
2. Enter a LinkedIn post URL
3. Sign in with a work email (personal emails are blocked)
4. Verify that scraping works and data appears in dashboard

## Features in Production

✅ **Work Email Validation**: Only work emails can sign up (Gmail, Yahoo, etc. are blocked)
✅ **Polling Mechanism**: Reliable data retrieval even if webhooks fail
✅ **Multi-User Support**: Each user only sees their own data
✅ **Secure Authentication**: Google OAuth with proper redirect handling
✅ **Real-time Updates**: Live progress tracking during scraping

## Troubleshooting

### Common Issues

1. **OAuth Error**: Make sure redirect URLs match exactly in Google Console and Supabase
2. **Scraping Not Working**: Check Apify API token is correct
3. **Database Errors**: Verify Supabase keys are correctly set
4. **Personal Email Blocked**: This is intentional - use a work email

### Monitoring

- Check Vercel logs: Project → Functions → Logs
- Check Supabase logs: Dashboard → Logs → API
- Check Apify runs: https://console.apify.com

## Support

For any issues, check the GitHub repository: https://github.com/eimribar/post-scraper