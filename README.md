# EngageTracker - LinkedIn Post Engagement Scraper

A production-ready LinkedIn post scraper that extracts engagement data (likes, reactions) from any public LinkedIn post and converts them into actionable business leads.

## Features

- 🔐 **Secure Authentication**: Google OAuth with work email validation (blocks personal emails)
- 📊 **Real-time Scraping**: Extract likes and reactions from LinkedIn posts using Apify
- 💾 **Data Persistence**: Store and manage engagement data in PostgreSQL
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- ⚡ **Real-time Updates**: Live progress tracking during scraping operations
- 📈 **Analytics Dashboard**: View and filter engagement data
- 🏢 **Enterprise Ready**: Multi-user support with row-level security
- 🔄 **Smart Data Flow**: Polling + webhook mechanisms for reliable data retrieval

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Scraping**: Apify LinkedIn Scraper
- **Hosting**: Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Apify account and API token
- Google Cloud Console project (for OAuth)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd linkedin-scraper
npm install
```

### 2. Configure Supabase

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Enable Google OAuth provider:
   - Go to Authentication > Providers
   - Enable Google
   - Add your Google OAuth credentials

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Add authorized redirect URI: `https://[YOUR_SUPABASE_PROJECT].supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret to Supabase Auth settings

### 4. Configure Apify

1. Sign up for [Apify](https://apify.com)
2. Get your API token from Account Settings
3. Note the actor ID (default: `apify/linkedin-scraper`)

### 5. Set Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Update the following variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_KEY`: Your Supabase service key
- `APIFY_API_TOKEN`: Your Apify API token
- `APIFY_ACTOR_ID`: The Apify actor ID
- `NEXT_PUBLIC_APP_URL`: Your app URL (http://localhost:3000 for development)
- `WEBHOOK_SECRET`: A random secret for webhook verification

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard
4. Deploy

### 3. Update Supabase Settings

After deployment, update your Supabase OAuth redirect URL:
- Add: `https://your-app.vercel.app/auth/callback`

### 4. Update Environment Variables

Update `NEXT_PUBLIC_APP_URL` in Vercel to your production URL.

## Project Structure

```
linkedin-scraper/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── scrape/        # Scraping endpoints
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   └── page.tsx           # Landing page
├── components/            # React components
├── lib/                   # Utility functions
│   └── supabase/         # Supabase clients
├── types/                 # TypeScript types
├── public/               # Static assets
└── supabase/             # Database schema
```

## API Endpoints

- `POST /api/scrape/initiate` - Start a new scraping job
- `POST /api/scrape/webhook` - Webhook endpoint for Apify results

## Database Schema

- **profiles**: User profiles (extends Supabase auth)
- **scraping_jobs**: Track scraping job status
- **posts**: LinkedIn post metadata
- **engagements**: Individual engagement records

## Security Features

- Row Level Security (RLS) policies
- Webhook signature verification
- API route authentication
- Secure session management

## Usage

1. **Landing Page**: Enter a LinkedIn post URL
2. **Authentication**: Sign in with Google or email
3. **Automatic Scraping**: Scraping starts immediately after auth
4. **Dashboard**: View real-time progress and results
5. **Data Export**: Export engagement data (coming soon)

## Troubleshooting

### Common Issues

1. **Supabase connection errors**: Check your environment variables
2. **OAuth redirect issues**: Verify redirect URLs in both Google and Supabase
3. **Apify errors**: Check API token and actor availability
4. **Webhook not receiving data**: Ensure webhook URL is publicly accessible

### Development Tips

- Use `npm run dev` for hot-reload development
- Check browser console for client-side errors
- Monitor Supabase logs for database issues
- Test webhook locally using ngrok

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT

## Support

For issues and questions, please open a GitHub issue.