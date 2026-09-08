import Anthropic from '@anthropic-ai/sdk';
import {
  CURRICULUM_AUTHORITY,
  EDUCATION_DISTRICTS,
  GRADE_CONFIG,
  STANDARDS_MAP,
  SUBJECTS,
} from '@/lib/constants';

const client = new Anthropic();

/**
 * Question generation is pinned to Guyana's national curriculum. The valid
 * strand names for the subject are passed in so generated questions carry a
 * `cat` the plan engine already understands — a generated question then rolls
 * straight into the matching plan goal.
 */
const SUBJECT_GUIDES: Record<string, Record<string, string>> = {
  math: {
    nursery: 'Counting to 20, matching and sorting, more and less, simple patterns, naming shapes',
    primary: 'Number concepts and place value, the four operations, fractions and decimals, metric measurement, shape and space, reading tables and graphs, money in Guyana dollars',
    'lower secondary': 'Directed numbers, algebraic expressions and linear equations, ratio and proportion, perimeter, area and volume, statistics and probability',
    'upper secondary': 'CSEC Mathematics profiles: computation, algebra, relations and functions, geometry and trigonometry, statistics, consumer arithmetic',
  },
  english: {
    nursery: 'Letter sounds, rhyme, listening and responding, naming and describing familiar things',
    primary: 'Phonics and decoding, reading fluency and comprehension, sentence and paragraph writing, parts of speech, punctuation, spelling and vocabulary',
    'lower secondary': 'Comprehension and inference, expository and narrative writing, grammar and sentence variety, vocabulary in context',
    'upper secondary': 'CSEC English A: summary writing, comprehension, expository and persuasive composition, register and audience',
  },
  science: {
    nursery: 'Living and non-living, the senses, weather, plants and animals around us',
    primary: 'Classification of living things, the human body and health, materials and their properties, energy, forces and simple machines, weather and the environment of Guyana',
    'lower secondary': 'Cells and body systems, matter and mixtures, energy transfer, forces and motion, ecosystems and conservation',
    'upper secondary': 'Integrated Science and CSEC single sciences: investigation, measurement, and application to Guyanese contexts',
  },
  social: {
    nursery: 'Myself, my family, my school and my community',
    primary: 'Guyana’s regions, rivers and neighbours; the indigenous peoples; emancipation and indentureship; independence; the work of citizens and local government; natural resources',
    'lower secondary': 'Caribbean history and heritage, physical and human geography of Guyana, government and citizenship, economic activity and resource use',
    'upper secondary': 'CSEC Social Studies: individual and family, community and society, sustainable development and use of resources, regional integration and CARICOM',
  },
};

export async function POST(request: Request) {
  const { subject, grade, district, count = 8 } = await request.json();

  const gc = GRADE_CONFIG[grade] || GRADE_CONFIG['grade6'];
  const subj = SUBJECTS.find(s => s.id === subject);
  const districtObj = EDUCATION_DISTRICTS.find(d => d.code === district);
  const strands = Object.keys(STANDARDS_MAP[subject] ?? {});
  const subjectGuide = SUBJECT_GUIDES[subject]?.[gc.stage] ?? '';

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    system:
      'You generate quiz questions for Guyana\'s national school curriculum. Return ONLY a valid JSON array. ' +
      'No markdown, no backticks, no preamble. Each object must have: ' +
      '{"id":"q1","q":"question","opts":["A","B","C","D"],"ans":0,"exp":"explanation","cat":"strand","bl":"remember|understand|apply|analyze","diff":1,"standards":["CODE"]}. ' +
      'The ans field is 0-indexed. The cat field MUST be copied exactly from the list of strands given by the user. ' +
      'Use Guyanese context, Guyana dollars, metric units and British spelling throughout.',
    messages: [{
      role: 'user',
      content: `Generate ${count} multiple-choice questions for a ${gc.label} pupil in Guyana${
        districtObj ? `, ${districtObj.name} (${districtObj.region})` : ''
      } studying ${subj?.name || subject}.

CURRICULUM: ${CURRICULUM_AUTHORITY}
GRADE: ${gc.label} (${gc.stage}, ages ${gc.age})
${gc.assessment ? `NATIONAL ASSESSMENT: pupils in this year sit the ${gc.assessment}, so pitch and phrasing should match it.\n` : ''}
STRANDS — set "cat" to exactly one of these, spelled exactly as written:
${strands.map(s => `- ${s}`).join('\n')}

REQUIREMENTS:
- Age-appropriate vocabulary and complexity for ${gc.label}
- Spread across the strands above; do not invent a strand
- Mix Bloom's levels: 2 remember, 2 understand, the rest apply/analyze
- Explanations should be encouraging and pitched at ages ${gc.age}
- Ground examples in Guyana: its regions, rivers, produce, currency, cricket, market and school life
- Use metric units and Guyana dollars, never US customary units or US dollars
- Put the relevant strand code from the curriculum in "standards" where you can
${gc.stage === 'nursery' ? '- Keep questions very simple and concrete; limit to 2-3 answer choices\n' : ''}${subjectGuide ? `\nSUBJECT FOCUS FOR THIS STAGE:\n${subjectGuide}` : ''}

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
