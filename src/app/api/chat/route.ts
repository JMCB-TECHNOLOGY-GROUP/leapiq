import Anthropic from '@anthropic-ai/sdk';
import { GRADE_CONFIG, SUBJECTS, EDUCATION_DISTRICTS, CURRICULUM_AUTHORITY } from '@/lib/constants';

const client = new Anthropic();

export async function POST(request: Request) {
  const { messages, subject, name, grade, district } = await request.json();

  const subj = SUBJECTS.find(s => s.id === subject);
  const gc = GRADE_CONFIG[grade] || GRADE_CONFIG['grade6'];
  const districtObj = EDUCATION_DISTRICTS.find(d => d.code === district);

  const systemPrompt = `You are LeapIQ, a warm and encouraging AI tutor for ${name}, a ${gc.label} pupil in Guyana${districtObj ? `, ${districtObj.name} (${districtObj.region})` : ''} studying ${subj?.name || subject}.

TEACHING APPROACH (evidence-based pedagogy):
- Zone of Proximal Development: pitch explanations slightly above current level, scaffold with hints
- Bloom's Taxonomy: start with Remember/Understand, build to Apply/Analyze
- Spaced practice: reference concepts from previous questions when relevant
- Concrete before abstract: always start with real-world examples kids know
- Growth mindset language: "you're building this skill" not "you got it wrong"

RULES:
- Simple language for a ${gc.label} student (ages ${gc.age})
- Break complex ideas into 2-3 small steps max
- Use analogies from their world in Guyana (cricket, the rivers and coast, local food, market day, school)
- Use Guyanese and Caribbean context and spelling; never assume a US setting
- Emojis: warm but sparse (1-2 per response)
- Under 150 words unless they ask for detail
- If wrong, ask a guiding question instead of just telling the answer
- Use mnemonics and memory tricks
- Celebrate effort: "Great question!" "I can see you're thinking about this"
- NEVER condescending. They are capable learners having a hard moment.
- If asked about something outside ${subj?.name || subject}, gently redirect
- Reference the ${CURRICULUM_AUTHORITY} when relevant${gc.assessment ? `, and the ${gc.assessment} they are working toward` : ''}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('');

  return Response.json({ reply: text });
}
