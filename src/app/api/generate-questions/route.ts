import Anthropic from '@anthropic-ai/sdk';
import { GRADE_CONFIG, SUBJECTS, STATES } from '@/lib/constants';

const client = new Anthropic();

export async function POST(request: Request) {
  const { subject, grade, state, count = 8 } = await request.json();

  const stateObj = STATES.find(s => s.code === state) || { name: 'District of Columbia', std: 'DC Common Core/NGSS' };
  const gc = GRADE_CONFIG[grade] || GRADE_CONFIG['5th'];
  const subj = SUBJECTS.find(s => s.id === subject);

  const subjectGuides: Record<string, Record<string, string>> = {
    math: {
      prek: 'Focus on: counting to 20, shapes, more/less, patterns, sorting',
      k: 'Focus on: counting to 20, shapes, more/less, patterns, sorting',
      '1st': 'Focus on: addition/subtraction within 100, place value, time, measurement, basic geometry',
      '2nd': 'Focus on: addition/subtraction within 100, place value, time, measurement, basic geometry',
      '3rd': 'Focus on: multiplication/division, fractions introduction, area/perimeter, data/graphs',
      '4th': 'Focus on: multiplication/division, fractions introduction, area/perimeter, data/graphs',
      '6th': 'Focus on: ratios, proportions, expressions, equations, geometry, statistics, pre-algebra',
      '7th': 'Focus on: ratios, proportions, expressions, equations, geometry, statistics, pre-algebra',
      '8th': 'Focus on: ratios, proportions, expressions, equations, geometry, statistics, pre-algebra',
      '9th': 'Focus on: algebra I/II, linear equations, quadratics, systems of equations, geometry proofs',
      '10th': 'Focus on: algebra I/II, linear equations, quadratics, systems of equations, geometry proofs',
      '11th': 'Focus on: pre-calculus, trigonometry, statistics, probability, SAT/ACT prep',
      '12th': 'Focus on: pre-calculus, trigonometry, statistics, probability, SAT/ACT prep',
      college: 'Focus on: calculus, linear algebra, statistics, discrete math',
    },
    science: {
      prek: 'Focus on: weather, plants, animals, senses, seasons, living vs non-living',
      k: 'Focus on: weather, plants, animals, senses, seasons, living vs non-living',
      '1st': 'Focus on: weather, plants, animals, senses, seasons, living vs non-living',
      '2nd': 'Focus on: weather, plants, animals, senses, seasons, living vs non-living',
      '3rd': 'Focus on: ecosystems, simple machines, states of matter, life cycles, earth science',
      '4th': 'Focus on: ecosystems, simple machines, states of matter, life cycles, earth science',
      '6th': 'Focus on: cells, body systems, chemistry basics, physics intro, earth systems',
      '7th': 'Focus on: cells, body systems, chemistry basics, physics intro, earth systems',
      '8th': 'Focus on: cells, body systems, chemistry basics, physics intro, earth systems',
      '9th': 'Focus on: biology, chemistry, earth science',
      '10th': 'Focus on: biology, chemistry, earth science',
      '11th': 'Focus on: AP Biology, AP Chemistry, Physics, Environmental Science',
      '12th': 'Focus on: AP Biology, AP Chemistry, Physics, Environmental Science',
      college: 'Focus on: advanced biology, organic chemistry, physics, environmental science',
    },
    history: {
      '3rd': 'Focus on: community, state history, US symbols, map skills, citizenship',
      '4th': 'Focus on: community, state history, US symbols, map skills, citizenship',
      '5th': 'Focus on: US history, ancient civilizations, geography, government basics',
      '6th': 'Focus on: US history, ancient civilizations, geography, government basics',
      '7th': 'Focus on: world history, US Constitution, Civil War, civics',
      '8th': 'Focus on: world history, US Constitution, Civil War, civics',
      '9th': 'Focus on: world history I/II, US government, economics',
      '10th': 'Focus on: world history I/II, US government, economics',
      '11th': 'Focus on: AP US History, AP World, AP Government, economics, current events',
      '12th': 'Focus on: AP US History, AP World, AP Government, economics, current events',
      college: 'Focus on: historiography, primary source analysis, research methodology',
    },
    english: {
      prek: 'Focus on: letter recognition, rhyming, sight words, story comprehension',
      k: 'Focus on: letter recognition, rhyming, sight words, story comprehension',
      '1st': 'Focus on: phonics, reading fluency, simple sentences, story elements',
      '2nd': 'Focus on: phonics, reading fluency, simple sentences, story elements',
      '3rd': 'Focus on: reading comprehension, paragraph writing, grammar basics, vocabulary',
      '4th': 'Focus on: reading comprehension, paragraph writing, grammar basics, vocabulary',
      '9th': 'Focus on: literary analysis, essay writing, rhetoric, research skills',
      '10th': 'Focus on: literary analysis, essay writing, rhetoric, research skills',
      '11th': 'Focus on: AP Literature, AP Language, argument writing, synthesis, SAT/ACT reading',
      '12th': 'Focus on: AP Literature, AP Language, argument writing, synthesis, SAT/ACT reading',
      college: 'Focus on: critical analysis, academic writing, rhetoric, research methodology',
    },
  };

  const subjectGuide = subjectGuides[subject]?.[grade] || '';

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system: 'You generate educational quiz questions. Return ONLY a valid JSON array. No markdown, no backticks, no preamble. Each object must have: {"id":"q1","q":"question","opts":["A","B","C","D"],"ans":0,"exp":"explanation","cat":"topic","bl":"remember|understand|apply|analyze","diff":1,"standards":["CODE"]}. The ans field is 0-indexed. Include relevant Common Core or state standard codes in standards array.',
    messages: [{
      role: 'user',
      content: `Generate ${count} multiple-choice questions for a ${gc.label} student in ${stateObj.name} studying ${subj?.name || subject}.

STATE STANDARDS: ${stateObj.std}
GRADE: ${gc.label} (ages ${gc.age})

PEDAGOGICAL REQUIREMENTS:
- Age-appropriate vocabulary and complexity for ${gc.label}
- Align to ${stateObj.std} standards for this grade level
- Mix Bloom's Taxonomy levels: 2 remember, 2 understand, 2-3 apply/analyze
- Difficulty should be calibrated to ${gc.label} level
- Explanations should be encouraging and use language appropriate for ages ${gc.age}
- Use real-world examples students this age would relate to
${['prek', 'k'].includes(grade) ? '- Keep questions very simple, use concrete objects and counting\n- Limit to 2-3 answer choices' : ''}
${grade === 'college' ? '- College-level rigor: critical thinking, analysis, synthesis required\n- Reference established academic frameworks and theories' : ''}
${subjectGuide ? '\nSUBJECT-SPECIFIC:\n' + subjectGuide : ''}

Return exactly ${count} questions.`,
    }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('');

  try {
    const questions = JSON.parse(text.replace(/```json|```/g, '').trim());
    // Ensure IDs
    questions.forEach((q: { id?: string }, i: number) => {
      if (!q.id) q.id = `ai_${subject}_${grade}_${Date.now()}_${i}`;
    });
    return Response.json({ questions });
  } catch {
    return Response.json({ questions: [], error: 'Failed to parse generated questions' }, { status: 500 });
  }
}
