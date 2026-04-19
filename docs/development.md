# LeapIQ -- Development Guide

## Local Setup

### Prerequisites

- Node.js 20+
- npm 10+
- Anthropic API key

### Installation

```bash
git clone https://github.com/jmcbtechgroup/leapiq.git
cd leapiq
npm install
cp .env.example .env.local
# Add ANTHROPIC_API_KEY to .env.local
npm run dev
```

The dev server starts at [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm run start` | Run production build locally |
| `npm run lint` | Run ESLint |

## Key Patterns

### Next.js 16 Breaking Changes

This project uses Next.js 16:

1. **`params` and `searchParams` are Promises** -- Must be `await`ed
2. **Use `PageProps<'/path'>` and `LayoutProps<'/path'>`** type helpers
3. **No `middleware.ts`** -- Use the proxy pattern if auth is added
4. **Read `node_modules/next/dist/docs/`** before writing new patterns

### App Context

The application uses React Context (`lib/app-context.tsx`) to manage global state including:

- Current student profile
- Active view/page selection
- Subject and grade state

Wrap components that need access to app state with the context provider.

### localStorage Persistence

All data persistence goes through `lib/storage.ts`. Key storage patterns:

```typescript
import { getSRQueue, getDueQuestions } from '@/lib/storage';

// Get spaced repetition queue for a student
const queue = getSRQueue(studentId);

// Get questions due for review
const dueIds = getDueQuestions(studentId);
```

**Storage keys:**
- `leapiq_students` -- Student profiles
- `leapiq_sessions_{studentId}` -- Quiz session history
- `leapiq_sr_{studentId}` -- Spaced repetition state
- `leapiq_docs_{studentId}` -- Uploaded documents

### Adaptive Engine

The adaptive engine (`lib/adaptive-engine.ts`) provides four core functions:

| Function | Purpose |
|----------|---------|
| `getAdaptiveQuestions(subject, studentId, count)` | Select optimally ordered questions |
| `identifyGaps(sessions, subject?)` | Find categories below 70% accuracy |
| `calculateVelocity(sessions)` | Compute daily learning rate and trend |
| `getSubjectPerformance(sessions, subjectId)` | Aggregate stats for one subject |

### AI API Route Pattern

All AI routes follow the same structure:

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

export async function POST(request: Request) {
  const body = await request.json();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system: 'System prompt with JSON output instructions',
    messages: [{ role: 'user', content: 'Constructed prompt' }],
  });

  // Extract text, parse JSON, return
  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('');

  try {
    const result = JSON.parse(text.replace(/```json|```/g, '').trim());
    return Response.json(result);
  } catch {
    return Response.json({ error: 'Failed to parse' }, { status: 500 });
  }
}
```

## Common Tasks

### Adding a New Subject

1. Add the subject to `SUBJECTS` array in `lib/constants.ts`
2. Add subject-specific grade guides in `/api/generate-questions/route.ts` `subjectGuides` object
3. Add fallback questions in `data/questions.ts`

### Adding a New Grade Level

1. Add the grade config to `GRADE_CONFIG` in `lib/constants.ts` (label, age range)
2. Verify subject guides cover the new grade in `/api/generate-questions/route.ts`

### Adding a New Component

1. Create the component in `src/components/`
2. Use PascalCase naming (e.g., `MyComponent.tsx`)
3. Import it in the appropriate dashboard or add a navigation route in app-context

### Modifying the Adaptive Algorithm

The adaptive engine is in `lib/adaptive-engine.ts`. Key parameters to tune:

- **Gap threshold:** Currently 70% accuracy (in `identifyGaps`)
- **SR box count:** Currently 5 boxes (in storage layer)
- **Due question priority:** Currently max 3 due questions per session (in `getAdaptiveQuestions`)
- **Velocity window:** Currently 7-day rolling window (in `calculateVelocity`)

## Error Handling

- API routes must have try-catch with descriptive error messages
- Never expose the API key in error responses
- Return 503 if `ANTHROPIC_API_KEY` is missing (not 500)
- Return fallback data when JSON parsing fails (graceful degradation)
