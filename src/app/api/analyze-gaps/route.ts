import Anthropic from '@anthropic-ai/sdk';
import { GRADE_CONFIG, SUBJECTS } from '@/lib/constants';

const client = new Anthropic();

export async function POST(request: Request) {
  const { sessions, studentName, grade } = await request.json();

  if (!sessions || sessions.length === 0) {
    return Response.json({ gaps: [], learningPath: [], summary: 'Not enough data yet. Complete a few quizzes to get personalized insights!' });
  }

  const gc = GRADE_CONFIG[grade] || GRADE_CONFIG['5th'];

  // Aggregate performance data
  const categoryPerformance: Record<string, { correct: number; total: number; bloom: string[] }> = {};
  for (const session of sessions) {
    if (session.questions) {
      for (const q of session.questions) {
        if (!categoryPerformance[q.category]) {
          categoryPerformance[q.category] = { correct: 0, total: 0, bloom: [] };
        }
        categoryPerformance[q.category].total++;
        if (q.correct) categoryPerformance[q.category].correct++;
        categoryPerformance[q.category].bloom.push(q.bloom);
      }
    }
  }

  const perfSummary = Object.entries(categoryPerformance).map(([cat, data]) => ({
    category: cat,
    accuracy: Math.round((data.correct / data.total) * 100),
    total: data.total,
    bloomDistribution: data.bloom.reduce((acc: Record<string, number>, b) => {
      acc[b] = (acc[b] || 0) + 1;
      return acc;
    }, {}),
  }));

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: `You are an educational data analyst for LeapIQ. Analyze student performance data and return a JSON object with:
{
  "gaps": [{"category": "topic", "subject": "subject", "accuracy": 45, "severity": "high|medium|low", "recommendation": "specific action"}],
  "learningPath": [{"order": 1, "category": "topic", "bloom": "remember", "description": "what to do", "questionCount": 5}],
  "summary": "2-3 sentence plain language summary for parents"
}
Return ONLY valid JSON. No markdown.`,
    messages: [{
      role: 'user',
      content: `Analyze performance for ${studentName} (${gc.label}, ages ${gc.age}):

PERFORMANCE BY CATEGORY:
${JSON.stringify(perfSummary, null, 2)}

SUBJECTS STUDIED: ${[...new Set(sessions.map((s: { subject: string }) => SUBJECTS.find(x => x.id === s.subject)?.name || s.subject))].join(', ')}

TOTAL SESSIONS: ${sessions.length}
OVERALL ACCURACY: ${Math.round(sessions.reduce((a: number, s: { correct?: number }) => a + (s.correct || 0), 0) / Math.max(sessions.reduce((a: number, s: { total?: number }) => a + (s.total || 0), 0), 1) * 100)}%

Identify knowledge gaps (categories below 70% accuracy) and create a remediation learning path that:
1. Starts with foundational "remember" level questions in weak areas
2. Progresses through Bloom's taxonomy as mastery improves
3. Includes specific, actionable recommendations
4. Is encouraging and growth-mindset oriented`,
    }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('');

  try {
    const analysis = JSON.parse(text.replace(/```json|```/g, '').trim());
    return Response.json(analysis);
  } catch {
    return Response.json({
      gaps: [],
      learningPath: [],
      summary: 'Analysis is being prepared. Complete more quizzes for deeper insights!',
    });
  }
}
