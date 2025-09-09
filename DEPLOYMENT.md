# Deployment Guide - EngageTracker

Complete guide for deploying EngageTracker to production with Vercel and Supabase.

## Prerequisites

- GitHub repository with your code
- Vercel account
- Supabase project configured
- Google Cloud Console OAuth credentials
- Apify account with API token

## 1. Prepare Environment Variables

Create these environment variables in Vercel dashboard:

### Required Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_ANON_KEY=eyJ...your-anon-key
ENGAGETRACKER_SUPABASE_SERVICE_KEY=eyJ...your-service-key

# Apify Configuration  
ENGAGETRACKER_APIFY_API_TOKEN=apify_api_your-token-here
ENGAGETRACKER_APIFY_ACTOR_ID=apimaestro~linkedin-post-reactions

# App Configuration
NEXT_PUBLIC_ENGAGETRACKER_APP_URL=https://your-app-name.vercel.app
ENGAGETRACKER_WEBHOOK_SECRET=your-random-webhook-secret-here

# Google OAuth (Optional - configured in Supabase)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### How to Get Each Variable

1. **Supabase URLs & Keys**:
   - Go to your Supabase project → Settings → API
   - Copy Project URL and anon public key
   - Copy service_role secret key

2. **Apify Token**:
   - Login to Apify → Account → Integrations
   - Create or copy your API token

3. **App URL**:
   - Will be `https://your-project-name.vercel.app`
   - Update this after first deployment

4. **Webhook Secret**:
   - Generate a random string (32+ characters)
   - Use: `openssl rand -hex 32`

## 2. Deploy to Vercel

### Option 1: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add all environment variables from above
6. Click "Deploy"

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? engagetracker (or your choice)
# - Directory? ./
# - Settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_URL
# ... repeat for all variables

# Redeploy with new environment variables
vercel --prod
```

## 3. Configure Supabase for Production

### Update URL Configuration

1. Go to Supabase Dashboard → Authentication → URL Configuration

2. **Site URL**: Update to your Vercel domain
   ```
   https://your-app-name.vercel.app
   ```

3. **Additional Redirect URLs**: Add both development and production
   ```
   http://localhost:8000/auth/callback
   https://your-app-name.vercel.app/auth/callback
   ```

### Verify Google OAuth Settings

1. Go to Authentication → Providers → Google
2. Ensure Google OAuth is enabled
3. Client ID and Secret should be set

## 4. Configure Google Cloud Console

### Update OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials
3. Click on your OAuth 2.0 client ID

4. **Authorized JavaScript origins**: Add production domain
   ```
   https://your-app-name.vercel.app
   https://your-project-id.supabase.co
   ```

5. **Authorized redirect URIs**: Should already have
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```

6. Save changes

## 5. Test Production Deployment

### Authentication Flow

1. Visit your production URL
2. Try signing in with Google OAuth
3. Verify work email validation works
4. Confirm personal emails are blocked

### Scraping Flow

1. Submit a LinkedIn post URL
2. Verify job is created
3. Check that webhook receives data
4. Confirm data appears in dashboard

## 6. Monitor and Debug

### Vercel Function Logs

```bash
# View recent logs
vercel logs

# Follow logs in real-time
vercel logs --follow

# Filter by function
vercel logs --follow /api/scrape/webhook
```

### Common Issues & Solutions

#### OAuth Redirect Issues

**Error**: `auth_failed` after OAuth
**Solution**: 
- Check redirect URLs match exactly
- Clear browser cache/cookies
- Verify Supabase Site URL is correct

#### Webhook Not Working

**Error**: Apify webhook fails
**Solution**:
- Check webhook URL is publicly accessible
- Verify webhook secret matches
- Test webhook endpoint directly

#### Environment Variable Issues

**Error**: `undefined` environment variables
**Solution**:
- Ensure all variables are set in Vercel
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

#### Database Permission Issues

**Error**: RLS policies blocking access
**Solution**:
- Check RLS policies in Supabase
- Verify foreign key relationships
- Test with service key for debugging

## 7. Production Configuration Checklist

### Vercel Settings

- [ ] All environment variables set
- [ ] Build command: `npm run build`
- [ ] Node.js version: 18.x
- [ ] Custom domain configured (if applicable)

### Supabase Settings

- [ ] Site URL updated to production domain
- [ ] Redirect URLs include production callback
- [ ] Google OAuth provider enabled
- [ ] Database schema deployed
- [ ] RLS policies enabled

### Google Cloud Console

- [ ] JavaScript origins include production domain
- [ ] Redirect URIs include Supabase callback
- [ ] OAuth consent screen configured
- [ ] Credentials active and valid

### Apify Settings

- [ ] API token has sufficient credits
- [ ] Actor ID correct: `apimaestro~linkedin-post-reactions`
- [ ] Webhook URL accessible from internet

## 8. Performance Optimization

### Vercel Optimization

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  images: {
    domains: ['media.licdn.com'] // For LinkedIn profile images
  }
}

module.exports = nextConfig
```

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_scraping_jobs_user_id ON scraping_jobs(user_id);
CREATE INDEX idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX idx_engagement_data_job_id ON engagement_data(job_id);
```

## 9. Security Hardening

### Environment Variables

- Never commit `.env.local` to git
- Use project-specific prefixes (`ENGAGETRACKER_`)
- Rotate secrets regularly

### API Security

- All API routes check authentication
- Webhook signatures verified
- Rate limiting implemented

### Database Security

- RLS policies on all tables
- Service key used only server-side
- Foreign key constraints enforced

## 10. Maintenance

### Regular Tasks

1. **Monitor Apify Credits**: Check monthly usage
2. **Update Dependencies**: `npm audit` and updates
3. **Database Cleanup**: Archive old jobs if needed
4. **Log Monitoring**: Check Vercel function logs

### Backup Strategy

1. **Database**: Supabase handles automatic backups
2. **Code**: GitHub repository with branches
3. **Environment**: Document all configuration

## 11. Scaling Considerations

### Database Scaling

- Monitor connection usage
- Consider read replicas for heavy loads
- Implement database pooling if needed

### Function Limits

- Vercel functions timeout after 10s (Hobby) or 60s (Pro)
- Consider splitting long-running operations
- Use background jobs for heavy processing

### Cost Management

- Monitor Vercel bandwidth usage
- Track Supabase database size
- Monitor Apify credit consumption

## 12. Rollback Strategy

If deployment fails:

```bash
# Revert to previous deployment
vercel rollback

# Or deploy specific commit
vercel --prod --confirm
```

### Database Rollback

```sql
-- If schema changes cause issues, rollback with:
DROP TABLE IF EXISTS new_table;
-- Restore from backup if needed
```

## 13. Custom Domain (Optional)

1. Purchase domain from provider
2. Add domain in Vercel dashboard
3. Configure DNS records as instructed
4. Update all URLs in configurations
5. Update Supabase redirect URLs

## Support

For deployment issues:
- Check [Vercel documentation](https://vercel.com/docs)
- Check [Supabase documentation](https://supabase.com/docs)
- Review GitHub Issues in repository