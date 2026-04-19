# LeapIQ -- API Reference

All API routes are server-side Next.js route handlers that communicate with the Anthropic Claude API. They require the `ANTHROPIC_API_KEY` environment variable. If the key is missing, endpoints return 503.

---

## POST /api/generate-questions

Generates curriculum-aligned multiple-choice quiz questions using Claude AI.

**Request Body:**

```json
{
  "subject": "math",
  "grade": "5th",
  "state": "NY",
  "count": 8
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `subject` | string | Yes | -- | Subject ID: `math`, `science`, `history`, `english` |
| `grade` | string | Yes | -- | Grade level: `prek`, `k`, `1st`-`12th`, `college` |
| `state` | string | Yes | -- | US state code (e.g., `NY`, `CA`, `DC`) |
| `count` | number | No | 8 | Number of questions to generate |

**Response (200):**

```json
{
  "questions": [
    {
      "id": "q1",
      "q": "What is 3/4 + 1/2?",
      "opts": ["5/4", "1/4", "4/6", "3/6"],
      "ans": 0,
      "exp": "To add fractions with different denominators, find a common denominator...",
      "cat": "fractions",
      "bl": "apply",
      "diff": 2,
      "standards": ["5.NF.A.1"]
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique question identifier |
| `q` | string | Question text |
| `opts` | string[] | Answer choices (2-4 options) |
| `ans` | number | Correct answer index (0-based) |
| `exp` | string | Explanation for the correct answer |
| `cat` | string | Topic category |
| `bl` | string | Bloom's Taxonomy level: `remember`, `understand`, `apply`, `analyze` |
| `diff` | number | Difficulty rating (1-5) |
| `standards` | string[] | Relevant state/Common Core standard codes |

**Error Response (500):**

```json
{
  "questions": [],
  "error": "Failed to parse generated questions"
}
```

---

## POST /api/analyze-gaps

Analyzes student performance data to identify knowledge gaps and generate a remediation learning path.

**Request Body:**

```json
{
  "sessions": [
    {
      "id": "s1",
      "subject": "math",
      "date": "2026-04-15",
      "correct": 6,
      "total": 8,
      "questions": [
        { "id": "q1", "correct": true, "bloom": "remember", "category": "fractions" }
      ]
    }
  ],
  "studentName": "Alex",
  "grade": "5th"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sessions` | Session[] | Yes | Array of completed quiz sessions with question-level detail |
| `studentName` | string | Yes | Student's first name |
| `grade` | string | Yes | Grade level |

**Response (200):**

```json
{
  "gaps": [
    {
      "category": "fractions",
      "subject": "math",
      "accuracy": 45,
      "severity": "high",
      "recommendation": "Start with basic fraction concepts using visual models"
    }
  ],
  "learningPath": [
    {
      "order": 1,
      "category": "fractions",
      "bloom": "remember",
      "description": "Review fraction basics with visual representations",
      "questionCount": 5
    }
  ],
  "summary": "Alex is doing well in geometry and measurement but needs more practice with fractions. Focus on visual fraction models before moving to operations."
}
```

**Fallback Response (when parsing fails):**

```json
{
  "gaps": [],
  "learningPath": [],
  "summary": "Analysis is being prepared. Complete more quizzes for deeper insights!"
}
```

---

## POST /api/generate-from-doc

Generates quiz questions from uploaded study materials (text or images).

**Request Body:**

```json
{
  "content": "Chapter 5: The water cycle begins with evaporation...",
  "type": "text",
  "name": "Alex",
  "grade": "5th"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | Text content or base64-encoded image (data URI) |
| `type` | string | Yes | `text` or `image` |
| `name` | string | Yes | Student name for age-appropriate language |
| `grade` | string | Yes | Grade level |

**Notes:**
- Text content is truncated to 4,000 characters
- Images are sent to Claude's vision API as base64 JPEG
- Always generates 6 questions per upload

**Response (200):**

```json
{
  "questions": [
    {
      "id": "dq1",
      "q": "What is the first stage of the water cycle?",
      "opts": ["Evaporation", "Condensation", "Precipitation", "Collection"],
      "ans": 0,
      "exp": "Evaporation is when water turns from liquid to gas...",
      "cat": "water cycle",
      "bl": "remember",
      "diff": 1
    }
  ]
}
```

---

## POST /api/chat

AI tutoring conversation endpoint. Maintains conversational context for multi-turn tutoring sessions.

**Request Body:**

```json
{
  "messages": [
    { "role": "user", "content": "I don't understand how to multiply fractions" }
  ],
  "subject": "math",
  "name": "Alex",
  "grade": "5th",
  "state": "NY"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | ChatMessage[] | Yes | Conversation history (user and assistant turns) |
| `subject` | string | Yes | Current subject being studied |
| `name` | string | Yes | Student's first name |
| `grade` | string | Yes | Grade level |
| `state` | string | No | US state code for standards context |

**Response (200):**

```json
{
  "reply": "Great question, Alex! Multiplying fractions is actually simpler than adding them..."
}
```

**Tutoring Behavior:**
- Zone of Proximal Development scaffolding
- Growth-mindset language ("you're building this skill")
- Age-appropriate analogies from the student's world
- Under 150 words unless detail is requested
- Guiding questions instead of direct answers when a student is wrong
- References state standards when relevant
- Gentle redirection for off-topic questions
