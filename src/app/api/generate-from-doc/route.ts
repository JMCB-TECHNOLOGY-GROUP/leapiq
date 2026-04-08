import Anthropic from '@anthropic-ai/sdk';
import { GRADE_CONFIG } from '@/lib/constants';

const client = new Anthropic();

export async function POST(request: Request) {
  const { content, type, name, grade } = await request.json();
  const gc = GRADE_CONFIG[grade] || GRADE_CONFIG['5th'];

  const msgContent: Anthropic.MessageParam['content'] = type === 'image'
    ? [
        { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: content.split(',')[1] } },
        { type: 'text', text: `Generate 6 multiple-choice quiz questions from this study material. The student is ${name} in ${gc.label}.` },
      ]
    : `Generate 6 multiple-choice quiz questions from this study material for ${name}, a ${gc.label} student. Here is the material:\n\n${content.substring(0, 4000)}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: `You generate quiz questions from uploaded study materials. Return ONLY valid JSON array, no markdown, no backticks. Each object: {"id":"dq1","q":"question text","opts":["A","B","C","D"],"ans":0,"exp":"explanation","cat":"category","bl":"remember|understand|apply|analyze","diff":1}. ans is 0-indexed. Make questions age-appropriate for a ${gc.label} student. Mix Bloom's levels.`,
    messages: [{ role: 'user', content: msgContent }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('');

  try {
    const questions = JSON.parse(text.replace(/```json|```/g, '').trim());
    return Response.json({ questions });
  } catch {
    return Response.json({ questions: [], error: 'Failed to parse' }, { status: 500 });
  }
}
