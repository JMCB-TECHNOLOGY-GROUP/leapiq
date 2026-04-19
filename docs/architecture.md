# LeapIQ -- System Architecture

## Component Overview

LeapIQ is structured as a Next.js 16 application with four AI-powered API routes and a client-side adaptive learning engine. The platform uses a role-based component architecture to serve Students, Educators, and Parents.

```
+---------------------+
|    Landing Page     |
| (Role Selection)    |
+----+-------+-------++
     |       |        |
+----v--+ +--v----+ +-v--------+
|Student| |Parent | |Educator  |
|Login  | |Login  | |Login     |
+----+--+ +--+----+ +--+-------+
     |       |          |
+----v--+ +--v------+ +-v---------+
|Student| |Parent   | |Educator   |
|Dash   | |Dash     | |Dash       |
+---+---+ +---------+ +--+--------+
    |                     |
    +----------+----------+
               |
    +----------v----------+
    |   AI API Routes     |
    | generate-questions  |
    | analyze-gaps        |
    | generate-from-doc   |
    | chat (tutor)        |
    +----------+----------+
               |
    +----------v----------+
    |  Anthropic Claude   |
    |  (claude-sonnet-4)  |
    +---------------------+
```

## Data Flow

### Quiz Generation Flow

1. Student selects subject, grade, and state in the StudentDashboard
2. Request sent to `/api/generate-questions` with subject, grade, state, count
3. API builds a grade-appropriate prompt with state standards and Bloom's Taxonomy distribution
4. Claude generates questions as a JSON array with id, question, options, answer, explanation, category, Bloom's level, and difficulty
5. Questions returned to client and rendered in the Quiz component
6. Results stored in localStorage via the storage layer

### Adaptive Question Selection

1. `getAdaptiveQuestions()` in the adaptive engine pulls from three pools:
   - **Priority 1:** Questions due for spaced repetition review (Leitner box system)
   - **Priority 2:** Unseen questions the student has not attempted
   - **Priority 3:** Struggling questions (box 1-2 in spaced repetition)
2. Pool is shuffled, then sorted by difficulty for progressive challenge
3. Student completes questions; results update the spaced repetition queue

### Learning Gap Analysis

1. Student or parent triggers gap analysis from the dashboard
2. `/api/analyze-gaps` receives all session history
3. Server aggregates performance by category (topic) with Bloom's taxonomy distribution
4. Claude analyzes the data and returns:
   - Knowledge gaps (categories below 70% accuracy) with severity ratings
   - Remediation learning path ordered by priority
   - Plain-language summary for parents
5. Results displayed in the ProgressCharts component

### Document-to-Quiz Flow

1. Student uploads a study document (text file or image) via DocUpload
2. `/api/generate-from-doc` sends content to Claude with grade context
3. For images, uses Claude's vision capability with base64 encoding
4. Claude generates quiz questions from the study material
5. Questions rendered in GenQuizPractice component

### AI Tutor Conversation

1. Student opens the Tutor component and types a question
2. `/api/chat` receives the conversation history plus student context (grade, state, subject)
3. Claude responds with pedagogically-grounded tutoring using:
   - Zone of Proximal Development scaffolding
   - Growth-mindset language
   - Age-appropriate analogies
   - State standards references
4. Response displayed in the chat interface

## Key Design Decisions

### Client-Side Storage (localStorage)

All student progress, sessions, spaced repetition state, and uploaded documents are stored in localStorage. This was chosen for:

- Zero-friction onboarding (no account creation required)
- Instant read/write with no network latency
- Privacy by default (data stays on device)

**Trade-off:** No multi-device sync, no teacher-student data sharing, data lost if browser storage is cleared. A Supabase migration is planned.

### Spaced Repetition (Leitner System)

Questions are tracked in a 5-box Leitner system:

| Box | Review Interval | Description |
|-----|----------------|-------------|
| 1 | Every session | New or recently missed |
| 2 | Every 2 sessions | Getting familiar |
| 3 | Every 4 sessions | Developing mastery |
| 4 | Every 8 sessions | Near mastery |
| 5 | Every 16 sessions | Mastered |

Correct answers move a question up one box. Incorrect answers reset to box 1.

### Bloom's Taxonomy Integration

Every question is tagged with a Bloom's level:

| Level | Description | Distribution Target |
|-------|-------------|-------------------|
| Remember | Recall facts | 25% of questions |
| Understand | Explain concepts | 25% of questions |
| Apply | Use in new situations | 25% of questions |
| Analyze | Break down, compare | 25% of questions |

The gap analysis uses Bloom's distribution to identify whether a student struggles with recall vs. application.

### 50-State Standards Alignment

Each US state has a mapped standards framework (Common Core, NGSS, state-specific standards). The question generation prompt includes the student's state so Claude generates curriculum-aligned content.

## Type Definitions

### Core Types

| Type | Fields | Purpose |
|------|--------|---------|
| `Student` | id, name, grade, state, avatar | Student profile |
| `Question` | id, q, opts, ans, exp, cat, bl, diff, standards | Quiz question |
| `Session` | id, studentId, subject, date, correct, total, xp, questions | Quiz session record |
| `SREntry` | box, next, attempts, correct, lastReview | Spaced repetition state |
| `KnowledgeGap` | category, subject, accuracy, totalAttempts, bloom, recommendation | Identified weakness |
| `LearningPath` | studentId, subject, steps | Remediation plan |
| `ChatMessage` | role, content | Tutor conversation message |
| `Classroom` | id, name, educatorId, studentIds, subject | Future classroom grouping |
