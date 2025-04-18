# KeySentry

A Next.js application for monitoring and detecting exposed API keys across GitHub repositories.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
# GitHub API token with repo and user scopes
GITHUB_TOKEN=your_github_token_here
\`\`\`

## Development

\`\`\`bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build

# Start the production server
npm run start
\`\`\`

## Features

- Real-time monitoring of GitHub repositories for exposed API keys
- Detailed information about discovered keys
- Filtering and sorting capabilities
- Rate limit handling with exponential backoff
