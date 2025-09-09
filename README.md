# EngageTracker - LinkedIn Post Scraper

A production-ready Next.js application that scrapes LinkedIn post engagement data using Supabase authentication and Apify integration.

## 🚀 Features

- **Google OAuth Authentication** with work email validation
- **LinkedIn Post Scraping** using Apify's linkedin-post-reactions actor
- **Real-time Dashboard** showing engagement metrics
- **Multi-user Support** with row-level security
- **Production Deployment** on Vercel with Supabase backend

## 🛠 Tech Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: PostgreSQL via Supabase
- **Scraping**: Apify (apimaestro~linkedin-post-reactions)
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account
- Apify account
- Google Cloud Console project for OAuth

## ⚙️ Environment Variables

Create a `.env.local` file with these variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_ANON_KEY=your-anon-key
ENGAGETRACKER_SUPABASE_SERVICE_KEY=your-service-key

# Apify Configuration
ENGAGETRACKER_APIFY_API_TOKEN=apify_api_your-token
ENGAGETRACKER_APIFY_ACTOR_ID=apimaestro~linkedin-post-reactions

# App Configuration
NEXT_PUBLIC_ENGAGETRACKER_APP_URL=https://your-app.vercel.app
ENGAGETRACKER_WEBHOOK_SECRET=your-webhook-secret

# Google OAuth (configured in Supabase Dashboard)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🗄️ Database Schema

```sql
-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_data ENABLE ROW LEVEL SECURITY;

-- User profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Job statuses enum
CREATE TYPE job_status AS ENUM ('pending', 'running', 'completed', 'failed');

-- Scraping jobs table
CREATE TABLE scraping_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  post_url TEXT NOT NULL,
  status job_status DEFAULT 'pending',
  apify_run_id TEXT,
  apify_dataset_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Engagement data table
CREATE TABLE engagement_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES scraping_jobs(id) NOT NULL,
  profile_name TEXT NOT NULL,
  profile_url TEXT,
  profile_image_url TEXT,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own jobs" ON scraping_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own jobs" ON scraping_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own engagement data" ON engagement_data FOR SELECT USING (
  EXISTS (SELECT 1 FROM scraping_jobs WHERE scraping_jobs.id = engagement_data.job_id AND scraping_jobs.user_id = auth.uid())
);
```

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/eimribar/post-scraper.git
cd post-scraper
npm install
```

### 2. Supabase Configuration

1. Create a new Supabase project
2. Run the database schema above in SQL Editor
3. Configure Google OAuth provider:
   - Go to Authentication → Providers → Google
   - Enable Google provider
   - Add your Google OAuth credentials

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized origins:
   - `https://your-app.vercel.app`
   - `https://your-project.supabase.co`
4. Add authorized redirect URI:
   - `https://your-project.supabase.co/auth/v1/callback`

### 4. Supabase URL Configuration

In your Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: Add these URLs:
  - `https://your-app.vercel.app/auth/callback`
  - `http://localhost:8000/auth/callback`

### 5. Apify Setup

1. Sign up for [Apify](https://apify.com)
2. Get your API token from Account → Integrations
3. Use actor ID: `apimaestro~linkedin-post-reactions`

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repo to Vercel
2. Add all environment variables in Vercel dashboard
3. Deploy

### Production Environment Variables

Make sure these are set in Vercel:

```bash
NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_ENGAGETRACKER_SUPABASE_ANON_KEY=your-anon-key
ENGAGETRACKER_SUPABASE_SERVICE_KEY=your-service-key
ENGAGETRACKER_APIFY_API_TOKEN=your-apify-token
ENGAGETRACKER_APIFY_ACTOR_ID=apimaestro~linkedin-post-reactions
NEXT_PUBLIC_ENGAGETRACKER_APP_URL=https://your-app.vercel.app
ENGAGETRACKER_WEBHOOK_SECRET=your-webhook-secret
```

## 🔒 Security Features

- **Work Email Validation**: Only corporate emails allowed (blocks gmail.com, yahoo.com, etc.)
- **Row Level Security**: Users can only access their own data
- **OAuth PKCE Flow**: Secure authentication flow
- **Webhook Validation**: Signed webhooks from Apify

## 🏗️ Architecture

### Authentication Flow
1. User enters LinkedIn URL on landing page
2. Redirected to sign-in with Google OAuth
3. After OAuth, validates work email domain
4. Personal emails are rejected and signed out
5. Work emails proceed to dashboard

### Scraping Flow
1. User submits LinkedIn post URL
2. Creates job in database
3. Calls Apify actor with webhook
4. Apify scrapes data and sends webhook
5. Data stored in database
6. Real-time updates via Supabase subscriptions

### File Structure

```
├── app/
│   ├── api/scrape/           # Scraping API routes
│   ├── auth/                 # Authentication pages
│   ├── dashboard/           # Main dashboard
│   ├── loading/             # Loading page during scraping
│   └── page.tsx             # Landing page
├── lib/
│   ├── supabase/           # Supabase clients
│   └── email-validation.ts # Work email validation
└── middleware.ts           # Auth middleware
```

## 🔍 Troubleshooting

### OAuth Issues
- Verify redirect URLs match exactly in Google Console and Supabase
- Clear browser cookies/cache after config changes
- Check that `/auth/callback` is excluded from middleware

### Apify Issues  
- Ensure JSON structure is: `{"post_url": "...", "reaction_type": "ALL"}`
- Verify webhook URL is accessible from internet
- Check Apify actor has sufficient credits

### Database Issues
- Verify RLS policies are enabled
- Check user permissions in Supabase dashboard
- Ensure foreign key relationships are correct

## 🧪 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## 📝 Recent Updates

- **OAuth Flow**: Completely rebuilt from scratch following Supabase docs
- **Apify Integration**: Fixed JSON structure (removed input wrapper)  
- **Email Validation**: Added validation for both OAuth and password signin
- **Production Ready**: Deployed and tested on Vercel

## 📊 API Endpoints

- `GET /` - Landing page
- `GET /auth/signin` - Sign in page  
- `GET /auth/callback` - OAuth callback handler
- `GET /dashboard` - Main dashboard
- `POST /api/scrape/initiate` - Start scraping job
- `POST /api/scrape/webhook` - Apify webhook handler
- `GET /api/scrape/poll` - Poll job status

## 🔑 Key Components

### Authentication (`/app/auth/`)
- **signin/page.tsx**: Login with Google OAuth and email/password
- **callback/route.ts**: Handles OAuth callback and email validation

### API Routes (`/app/api/scrape/`)
- **initiate/route.ts**: Creates job and calls Apify actor
- **webhook/route.ts**: Receives data from Apify webhooks
- **poll/route.ts**: Polling fallback for development

### Core Pages
- **page.tsx**: Landing page with URL input
- **dashboard/page.tsx**: Main dashboard with engagement data
- **loading/page.tsx**: Loading state during scraping

## 🗃️ Configuration Files

- **middleware.ts**: Auth middleware excluding OAuth routes
- **lib/supabase/**: Client and server Supabase configurations
- **lib/email-validation.ts**: Work email domain validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly  
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.