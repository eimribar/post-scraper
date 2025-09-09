# Google OAuth Configuration for Production

## Steps to Update Google OAuth for Production

### 1. Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one if needed)
3. Navigate to **APIs & Services** > **Credentials**

### 2. Update OAuth 2.0 Client Settings
1. Click on your OAuth 2.0 Client ID
2. Update the following settings:

#### Authorized JavaScript Origins
Add these URLs:
```
https://your-vercel-app.vercel.app
https://zzqyxefktvmnhqaxelrt.supabase.co
```

#### Authorized Redirect URIs
Add these URLs:
```
https://your-vercel-app.vercel.app/auth/callback
https://zzqyxefktvmnhqaxelrt.supabase.co/auth/v1/callback
```

### 3. Important Notes
- Replace `your-vercel-app` with your actual Vercel deployment URL
- Keep the development URLs if you want to continue local development:
  - `http://localhost:3000`
  - `http://localhost:3000/auth/callback`

### 4. Save Changes
Click **Save** at the bottom of the OAuth client configuration page

### 5. Verify in Supabase
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication** > **Providers**
3. Ensure Google provider is enabled
4. Verify the Client ID and Client Secret match your Google OAuth credentials

### 6. Update Supabase Redirect URLs
1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**
2. Update these fields:

#### Site URL
```
https://your-vercel-app.vercel.app
```

#### Redirect URLs
Add all these (one per line):
```
https://your-vercel-app.vercel.app/auth/callback
https://your-vercel-app.vercel.app/dashboard
http://localhost:3000/auth/callback
http://localhost:3000/dashboard
```

### 7. Test the Flow
1. Visit your production URL
2. Enter a LinkedIn post URL
3. Click "Continue with Google"
4. Use a work email (personal emails are blocked)
5. Verify you're redirected to the dashboard with the scraping initiated

## Troubleshooting

### Common Issues:
1. **"Redirect URI mismatch"** - Ensure the callback URL exactly matches in both Google and your app
2. **"Invalid Site URL"** - Update the Site URL in Supabase to your production domain
3. **Authentication loop** - Clear cookies and ensure all URLs are using HTTPS in production

### Required Environment Variables in Vercel:
```
NEXT_PUBLIC_ENGAGETRACKER_APP_URL=https://your-vercel-app.vercel.app
```

This variable is used for OAuth redirects in the application code.