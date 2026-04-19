# LeapIQ — Development Guide

@AGENTS.md

## Overview
An adaptive AI educational delivery platform that personalizes learning from Pre-K through College. Uses Anthropic Claude to generate curriculum-aligned lessons, quizzes, and assessments that adapt to each student's level and learning pace.

## Tech Stack
- **Framework:** Next.js 16 (App Router) + TypeScript
- **AI:** Anthropic Claude via `@anthropic-ai/sdk`
- **Charts:** Recharts (progress visualization)
- **Styling:** Tailwind CSS 4
- **Storage:** Client-side localStorage (no persistent database yet)
- **Hosting:** Vercel

## Next.js 16 Breaking Changes
- `params` and `searchParams` are **Promises** — must be `await`ed
- Use `PageProps<'/path'>` and `LayoutProps<'/path'>` type helpers
- Do NOT use `middleware.ts` for auth — use proxy pattern if needed
- Read `node_modules/next/dist/docs/` before writing new patterns

## Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
```

## Project Structure
```
src/
  app/               # Pages and API routes
  app/api/           # AI endpoints (analyze-gaps, generate-questions, generate-from-doc)
  lib/
    adaptive-engine.ts  # Core adaptive learning algorithm
    app-context.tsx     # React context for app state
    constants.ts        # Grade levels, subjects, difficulty tiers
    storage.ts          # localStorage persistence layer
    types.ts            # TypeScript interfaces
  components/        # React components
```

## Key Architecture
- **Adaptive Engine** (`lib/adaptive-engine.ts`): Adjusts difficulty based on student performance. Tracks mastery per topic, suggests review vs advancement.
- **No Database Yet**: All student progress stored in localStorage. Future: migrate to Supabase for multi-device sync and teacher dashboards.
- **AI Endpoints**: Generate questions, analyze learning gaps, create lessons from uploaded documents. All require `ANTHROPIC_API_KEY`.

## Error Handling
- API routes must have try-catch with descriptive error messages
- Never expose API key errors to the client
- Return 503 if `ANTHROPIC_API_KEY` is missing (not 500)

## Environment
Requires `.env.local`:
```
ANTHROPIC_API_KEY=...
```

## Roadmap Considerations
- Database migration to Supabase (student accounts, teacher dashboards, parent views)
- Multi-device sync for student progress
- Classroom mode (teacher assigns, students complete)
- Assessment export (PDF report cards)
