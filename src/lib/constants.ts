import { GUYANA_GRADES, EDUCATION_DISTRICTS, CURRICULUM_AUTHORITY } from '@/data/guyana';

// ── Spaced Repetition (Leitner Boxes) ──
// Box 1: review in 1 day, Box 2: 3 days, Box 3: 7 days, Box 4: 14 days, Box 5: 30 days (mastered)
export const LEITNER_INTERVALS = [0, 1, 3, 7, 14, 30];

// ── Bloom's Taxonomy Levels ──
export const BLOOMS = ['remember', 'understand', 'apply', 'analyze'] as const;
export type BloomLevel = typeof BLOOMS[number];

// ── Subjects ──
// The four core subjects of Guyana's national curriculum. `social` is Social
// Studies, which carries history, geography and civics in the Guyanese system.
export const SUBJECTS = [
  { id: 'math', name: 'Mathematics', icon: '🧮', gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', tx: 'text-blue-600', bd: 'border-blue-200', img: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80&auto=format' },
  { id: 'english', name: 'English Language', icon: '📖', gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', tx: 'text-purple-600', bd: 'border-purple-200', img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80&auto=format' },
  { id: 'science', name: 'Science', icon: '🔬', gradient: 'from-green-500 to-green-600', bg: 'bg-green-50', tx: 'text-green-600', bd: 'border-green-200', img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80&auto=format' },
  { id: 'social', name: 'Social Studies', icon: '🌎', gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', tx: 'text-amber-600', bd: 'border-amber-200', img: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=400&q=80&auto=format' },
] as const;

export type SubjectId = typeof SUBJECTS[number]['id'];

// ── Education districts ──
// Guyana is administered as eleven education districts: the ten regions plus
// Georgetown as District 11. This replaces the US state list the platform
// shipped with; every learner belongs to a district, not a state.
export { EDUCATION_DISTRICTS, CURRICULUM_AUTHORITY };

// ── Grades ──
export const GRADE_OPTIONS = GUYANA_GRADES.map(g => ({ value: g.id, label: g.label }));

export const GRADE_CONFIG: Record<string, {
  label: string;
  short: string;
  age: string;
  stage: string;
  assessment?: string;
  qCount: number;
  subjects: readonly string[];
}> = Object.fromEntries(
  GUYANA_GRADES.map(g => [
    g.id,
    {
      label: g.label,
      short: g.short,
      age: g.ages,
      stage: g.stage,
      assessment: g.assessment,
      qCount: g.qCount,
      subjects: g.subjects,
    },
  ]),
);

// ── Curriculum strands ──
// Strand names follow the Guyana National Curriculum guides published by NCERD.
// The `code` values are LeapIQ strand references, not official NCERD objective
// numbers; when the Ministry supplies the guides, the official numbering loads
// in their place without changing any strand name.
export const STANDARDS_MAP: Record<string, Record<string, { code: string; description: string }[]>> = {
  math: {
    'Sets': [
      { code: 'GY-MATH-ST1', description: 'Sort and classify objects by one or more attributes' },
      { code: 'GY-MATH-ST2', description: 'Use set language, union and intersection to solve problems' },
    ],
    'Number Concepts': [
      { code: 'GY-MATH-NC1', description: 'Read, write, order and compare whole numbers and place value' },
      { code: 'GY-MATH-NC2', description: 'Recognise factors, multiples, squares and number patterns' },
    ],
    'Operations, Relations and Properties': [
      { code: 'GY-MATH-OP1', description: 'Add, subtract, multiply and divide whole numbers accurately' },
      { code: 'GY-MATH-OP2', description: 'Apply the order of operations and the properties of the four operations' },
      { code: 'GY-MATH-OP3', description: 'Solve multi-step word problems and check the answer for reasonableness' },
    ],
    'Fractions, Decimals and Percentages': [
      { code: 'GY-MATH-FD1', description: 'Represent, compare and compute with fractions and decimals' },
      { code: 'GY-MATH-FD2', description: 'Convert between fractions, decimals and percentages' },
      { code: 'GY-MATH-FD3', description: 'Solve problems involving ratio, proportion and percentage' },
    ],
    'Measurement': [
      { code: 'GY-MATH-ME1', description: 'Measure and convert length, mass, capacity and time in metric units' },
      { code: 'GY-MATH-ME2', description: 'Calculate perimeter, area and volume of common shapes and solids' },
    ],
    'Geometry': [
      { code: 'GY-MATH-GE1', description: 'Identify, describe and construct plane shapes and solids' },
      { code: 'GY-MATH-GE2', description: 'Work with angles, symmetry, transformations and the coordinate plane' },
    ],
    'Statistics and Graphs': [
      { code: 'GY-MATH-SG1', description: 'Collect, organise and represent data in tables, charts and graphs' },
      { code: 'GY-MATH-SG2', description: 'Interpret data using mean, median, mode and simple probability' },
    ],
    'Algebra': [
      { code: 'GY-MATH-AL1', description: 'Write, simplify and evaluate algebraic expressions' },
      { code: 'GY-MATH-AL2', description: 'Solve linear equations and inequalities and graph their solutions' },
    ],
    'Consumer Arithmetic': [
      { code: 'GY-MATH-CA1', description: 'Solve problems involving money, wages, discount, interest and utility bills' },
    ],
  },
  english: {
    'Listening and Speaking': [
      { code: 'GY-ENG-LS1', description: 'Listen attentively and respond appropriately to spoken instructions' },
      { code: 'GY-ENG-LS2', description: 'Speak clearly in Standard English for a range of audiences and purposes' },
    ],
    'Reading and Comprehension': [
      { code: 'GY-ENG-RC1', description: 'Decode and read grade-level text accurately and fluently' },
      { code: 'GY-ENG-RC2', description: 'Identify main idea, supporting detail, sequence and cause and effect' },
      { code: 'GY-ENG-RC3', description: 'Infer meaning and interpret figurative language in a range of texts' },
    ],
    'Writing and Composition': [
      { code: 'GY-ENG-WC1', description: 'Write complete, correctly punctuated sentences and paragraphs' },
      { code: 'GY-ENG-WC2', description: 'Compose narrative, descriptive, expository and persuasive pieces' },
      { code: 'GY-ENG-WC3', description: 'Plan, draft, revise and edit extended writing' },
    ],
    'Grammar and Mechanics': [
      { code: 'GY-ENG-GM1', description: 'Use parts of speech, tense and subject-verb agreement correctly' },
      { code: 'GY-ENG-GM2', description: 'Apply the conventions of capitalisation, punctuation and sentence structure' },
    ],
    'Vocabulary and Spelling': [
      { code: 'GY-ENG-VS1', description: 'Spell high-frequency and subject vocabulary accurately' },
      { code: 'GY-ENG-VS2', description: 'Work out word meaning from context, roots, prefixes and suffixes' },
    ],
  },
  science: {
    'Living Things': [
      { code: 'GY-SCI-LT1', description: 'Classify living things and describe their characteristics and habitats' },
      { code: 'GY-SCI-LT2', description: 'Describe life cycles, reproduction, adaptation and inheritance' },
      { code: 'GY-SCI-LT3', description: 'Explain the cell as the basic unit of living things' },
    ],
    'The Human Body and Health': [
      { code: 'GY-SCI-HB1', description: 'Describe the major body systems and how they work together' },
      { code: 'GY-SCI-HB2', description: 'Explain nutrition, hygiene, disease prevention and healthy choices' },
    ],
    'Matter and Materials': [
      { code: 'GY-SCI-MM1', description: 'Identify materials by their properties and describe states of matter' },
      { code: 'GY-SCI-MM2', description: 'Describe physical and chemical changes and simple separation techniques' },
    ],
    'Energy and Forces': [
      { code: 'GY-SCI-EF1', description: 'Describe forms of energy and how energy is transferred and conserved' },
      { code: 'GY-SCI-EF2', description: 'Investigate forces, motion, simple machines, light, sound and electricity' },
    ],
    'Earth and Environment': [
      { code: 'GY-SCI-EE1', description: 'Describe weather, climate, the water cycle and Guyana’s natural environment' },
      { code: 'GY-SCI-EE2', description: 'Explain conservation, pollution and the sustainable use of resources' },
    ],
    'Working Scientifically': [
      { code: 'GY-SCI-WS1', description: 'Observe, measure and record accurately using metric units' },
      { code: 'GY-SCI-WS2', description: 'Plan a fair test, identify variables and draw a conclusion from evidence' },
    ],
  },
  social: {
    'Our Country Guyana': [
      { code: 'GY-SOC-CG1', description: 'Locate Guyana’s ten regions, capital, rivers and neighbouring countries' },
      { code: 'GY-SOC-CG2', description: 'Describe the peoples, languages and cultural life of Guyana' },
    ],
    'Our Heritage and History': [
      { code: 'GY-SOC-HH1', description: 'Describe the indigenous peoples and the settlement of Guyana' },
      { code: 'GY-SOC-HH2', description: 'Explain colonisation, emancipation, indentureship and independence' },
      { code: 'GY-SOC-HH3', description: 'Interpret historical sources and explain cause and consequence' },
    ],
    'Geography and Environment': [
      { code: 'GY-SOC-GE1', description: 'Use maps, scale, keys and directions to answer geographical questions' },
      { code: 'GY-SOC-GE2', description: 'Describe landforms, climate and how physical geography shapes settlement' },
    ],
    'Civics and Government': [
      { code: 'GY-SOC-CV1', description: 'Describe the roles of citizens, local government and national government' },
      { code: 'GY-SOC-CV2', description: 'Explain rights, responsibilities, democracy and the rule of law' },
    ],
    'Resources and Economic Activity': [
      { code: 'GY-SOC-RE1', description: 'Describe Guyana’s natural resources and its main economic activities' },
      { code: 'GY-SOC-RE2', description: 'Explain trade, industry and the impact of resource use on communities' },
    ],
    'The Caribbean and the Wider World': [
      { code: 'GY-SOC-CW1', description: 'Describe Guyana’s place in CARICOM and the wider Caribbean' },
      { code: 'GY-SOC-CW2', description: 'Explain regional cooperation, migration and global connections' },
    ],
  },
};
