# LeapIQ -- Deployment Guide

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Anthropic Claude API key for all AI features |

LeapIQ has a minimal environment configuration because it uses client-side localStorage instead of a database. The only required secret is the Anthropic API key.

## Vercel Deployment

### Initial Setup

1. Push the repository to GitHub
2. Import the project in [Vercel Dashboard](https://vercel.com/new)
3. Select the `leapiq` repository
4. Framework preset will auto-detect as **Next.js**
5. Add the `ANTHROPIC_API_KEY` environment variable
6. Deploy

### Build Settings

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | `next build` |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Node.js Version | 20.x |

### Custom Domain

1. Go to Project Settings > Domains
2. Add your domain (e.g., `leapiq.com`)
3. Update DNS records as instructed by Vercel

## API Key Security

The `ANTHROPIC_API_KEY` is only used server-side in API route handlers. It is never exposed to the client. The API routes in `src/app/api/` are the only entry points to Claude.

If the API key is missing or invalid:
- `/api/generate-questions` will fail to generate (returns 500)
- `/api/analyze-gaps` will fail to analyze (returns fallback message)
- `/api/generate-from-doc` will fail to parse (returns 500)
- `/api/chat` will fail to respond (returns error)

## Future: Database Migration

When LeapIQ migrates from localStorage to Supabase, additional environment variables will be required:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The migration will enable:
- Persistent student accounts across devices
- Teacher dashboards with class-wide analytics
- Parent accounts linked to student profiles
- Assessment history that survives browser cache clears

## Monitoring

### Recommended Services

- **Vercel Analytics** -- Built-in performance and Web Vitals monitoring
- **Sentry** -- Error tracking for API route failures
- **Anthropic Console** -- Monitor API usage and token consumption

### Health Checks

- Application: `GET /` should return 200
- AI connectivity: `POST /api/generate-questions` with valid payload should return questions

### Cost Management

Claude API usage scales with student activity. Each action has an approximate token cost:

| Action | Approximate Tokens |
|--------|--------------------|
| Generate 8 questions | ~3,000 |
| Gap analysis | ~2,000 |
| Document-to-quiz | ~2,000 |
| Tutor message | ~1,000 |

Monitor usage in the [Anthropic Console](https://console.anthropic.com) and set billing alerts to avoid unexpected charges.
