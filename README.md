# KeySentry

A Next.js application for monitoring and detecting exposed API keys across GitHub repositories.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# GitHub API token with repo and user scopes
GITHUB_TOKEN=your_github_token_here

# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build

# Start the production server
npm run start
```

## Features

- Real-time monitoring of GitHub repositories for exposed API keys
- Detailed information about discovered keys
- Filtering and sorting capabilities
- Rate limit handling with exponential backoff
- User authentication with Supabase
- Secure session management
