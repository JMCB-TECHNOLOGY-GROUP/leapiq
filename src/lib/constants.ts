// ── Spaced Repetition (Leitner Boxes) ──
// Box 1: review in 1 day, Box 2: 3 days, Box 3: 7 days, Box 4: 14 days, Box 5: 30 days (mastered)
export const LEITNER_INTERVALS = [0, 1, 3, 7, 14, 30];

// ── Bloom's Taxonomy Levels ──
export const BLOOMS = ['remember', 'understand', 'apply', 'analyze'] as const;
export type BloomLevel = typeof BLOOMS[number];

// ── Subject Configuration ──
export const SUBJECTS = [
  { id: 'math', name: 'Math', icon: '🧮', gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', tx: 'text-blue-600', bd: 'border-blue-200', img: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80&auto=format' },
  { id: 'history', name: 'History', icon: '🏛️', gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', tx: 'text-amber-600', bd: 'border-amber-200', img: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=400&q=80&auto=format' },
  { id: 'science', name: 'Science', icon: '🔬', gradient: 'from-green-500 to-green-600', bg: 'bg-green-50', tx: 'text-green-600', bd: 'border-green-200', img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80&auto=format' },
  { id: 'english', name: 'English', icon: '📖', gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', tx: 'text-purple-600', bd: 'border-purple-200', img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80&auto=format' },
] as const;

export type SubjectId = typeof SUBJECTS[number]['id'];

// ── US States ──
export const STATES = [
  { code: 'AL', name: 'Alabama', std: 'AL Course of Study' },
  { code: 'AK', name: 'Alaska', std: 'Alaska Standards' },
  { code: 'AZ', name: 'Arizona', std: 'Arizona Standards' },
  { code: 'AR', name: 'Arkansas', std: 'AR Frameworks' },
  { code: 'CA', name: 'California', std: 'CA Common Core/NGSS' },
  { code: 'CO', name: 'Colorado', std: 'CO Academic Standards' },
  { code: 'CT', name: 'Connecticut', std: 'CT Core Standards' },
  { code: 'DE', name: 'Delaware', std: 'DE Standards' },
  { code: 'DC', name: 'District of Columbia', std: 'DC Common Core/NGSS' },
  { code: 'FL', name: 'Florida', std: 'FL BEST Standards' },
  { code: 'GA', name: 'Georgia', std: 'GA Standards of Excellence' },
  { code: 'HI', name: 'Hawaii', std: 'HI Common Core' },
  { code: 'ID', name: 'Idaho', std: 'ID Content Standards' },
  { code: 'IL', name: 'Illinois', std: 'IL Learning Standards' },
  { code: 'IN', name: 'Indiana', std: 'IN Academic Standards' },
  { code: 'IA', name: 'Iowa', std: 'Iowa Core' },
  { code: 'KS', name: 'Kansas', std: 'KS Standards' },
  { code: 'KY', name: 'Kentucky', std: 'KY Academic Standards' },
  { code: 'LA', name: 'Louisiana', std: 'LA Student Standards' },
  { code: 'ME', name: 'Maine', std: 'ME Learning Results' },
  { code: 'MD', name: 'Maryland', std: 'MD College & Career Ready Standards' },
  { code: 'MA', name: 'Massachusetts', std: 'MA Curriculum Frameworks' },
  { code: 'MI', name: 'Michigan', std: 'MI Academic Standards' },
  { code: 'MN', name: 'Minnesota', std: 'MN Academic Standards' },
  { code: 'MS', name: 'Mississippi', std: 'MS College & Career Ready' },
  { code: 'MO', name: 'Missouri', std: 'MO Learning Standards' },
  { code: 'MT', name: 'Montana', std: 'MT Content Standards' },
  { code: 'NE', name: 'Nebraska', std: 'NE Standards' },
  { code: 'NV', name: 'Nevada', std: 'NV Academic Standards' },
  { code: 'NH', name: 'New Hampshire', std: 'NH Standards' },
  { code: 'NJ', name: 'New Jersey', std: 'NJ Student Learning Standards' },
  { code: 'NM', name: 'New Mexico', std: 'NM Standards' },
  { code: 'NY', name: 'New York', std: 'NY Next Gen Standards' },
  { code: 'NC', name: 'North Carolina', std: 'NC Standard Course of Study' },
  { code: 'ND', name: 'North Dakota', std: 'ND Content Standards' },
  { code: 'OH', name: 'Ohio', std: 'OH Learning Standards' },
  { code: 'OK', name: 'Oklahoma', std: 'OK Academic Standards' },
  { code: 'OR', name: 'Oregon', std: 'OR Standards' },
  { code: 'PA', name: 'Pennsylvania', std: 'PA Core Standards' },
  { code: 'RI', name: 'Rhode Island', std: 'RI Core Standards' },
  { code: 'SC', name: 'South Carolina', std: 'SC Standards' },
  { code: 'SD', name: 'South Dakota', std: 'SD Content Standards' },
  { code: 'TN', name: 'Tennessee', std: 'TN Academic Standards' },
  { code: 'TX', name: 'Texas', std: 'TX TEKS' },
  { code: 'UT', name: 'Utah', std: 'UT Core Standards' },
  { code: 'VT', name: 'Vermont', std: 'VT Standards' },
  { code: 'VA', name: 'Virginia', std: 'VA SOL' },
  { code: 'WA', name: 'Washington', std: 'WA Learning Standards' },
  { code: 'WV', name: 'West Virginia', std: 'WV Standards' },
  { code: 'WI', name: 'Wisconsin', std: 'WI Academic Standards' },
  { code: 'WY', name: 'Wyoming', std: 'WY Content Standards' },
];

// ── Grade-level config ──
export const GRADE_OPTIONS = [
  { value: 'prek', label: 'Pre-K' },
  { value: 'k', label: 'Kindergarten' },
  { value: '1st', label: '1st Grade' },
  { value: '2nd', label: '2nd Grade' },
  { value: '3rd', label: '3rd Grade' },
  { value: '4th', label: '4th Grade' },
  { value: '5th', label: '5th Grade' },
  { value: '6th', label: '6th Grade' },
  { value: '7th', label: '7th Grade' },
  { value: '8th', label: '8th Grade' },
  { value: '9th', label: '9th Grade' },
  { value: '10th', label: '10th Grade' },
  { value: '11th', label: '11th Grade' },
  { value: '12th', label: '12th Grade' },
  { value: 'college', label: 'College / University' },
];

export const GRADE_CONFIG: Record<string, { label: string; age: string; qCount: number; subjects: string[] }> = {
  prek: { label: 'Pre-K', age: '3-5', qCount: 5, subjects: ['math', 'english'] },
  k: { label: 'Kindergarten', age: '5-6', qCount: 5, subjects: ['math', 'english', 'science'] },
  '1st': { label: '1st Grade', age: '6-7', qCount: 6, subjects: ['math', 'english', 'science'] },
  '2nd': { label: '2nd Grade', age: '7-8', qCount: 6, subjects: ['math', 'english', 'science'] },
  '3rd': { label: '3rd Grade', age: '8-9', qCount: 8, subjects: ['math', 'english', 'science', 'history'] },
  '4th': { label: '4th Grade', age: '9-10', qCount: 8, subjects: ['math', 'english', 'science', 'history'] },
  '5th': { label: '5th Grade', age: '10-11', qCount: 8, subjects: ['math', 'english', 'science', 'history'] },
  '6th': { label: '6th Grade', age: '11-12', qCount: 8, subjects: ['math', 'english', 'science', 'history'] },
  '7th': { label: '7th Grade', age: '12-13', qCount: 10, subjects: ['math', 'english', 'science', 'history'] },
  '8th': { label: '8th Grade', age: '13-14', qCount: 10, subjects: ['math', 'english', 'science', 'history'] },
  '9th': { label: '9th Grade', age: '14-15', qCount: 10, subjects: ['math', 'english', 'science', 'history'] },
  '10th': { label: '10th Grade', age: '15-16', qCount: 10, subjects: ['math', 'english', 'science', 'history'] },
  '11th': { label: '11th Grade', age: '16-17', qCount: 10, subjects: ['math', 'english', 'science', 'history'] },
  '12th': { label: '12th Grade', age: '17-18', qCount: 10, subjects: ['math', 'english', 'science', 'history'] },
  college: { label: 'College', age: '18+', qCount: 10, subjects: ['math', 'english', 'science', 'history'] },
};

// ── Standards Mapping (Common Core codes) ──
export const STANDARDS_MAP: Record<string, Record<string, { code: string; description: string }[]>> = {
  math: {
    'Number & Operations': [
      { code: '5.NF.A.1', description: 'Add and subtract fractions with unlike denominators' },
      { code: '5.NF.B.4', description: 'Apply and extend previous understandings of multiplication to multiply a fraction by a fraction' },
      { code: '5.NF.B.7', description: 'Apply and extend previous understandings of division to divide unit fractions by whole numbers' },
      { code: '5.NBT.B.7', description: 'Add, subtract, multiply, and divide decimals to hundredths' },
    ],
    'Measurement & Data': [
      { code: '5.MD.A.1', description: 'Convert among different-sized standard measurement units' },
      { code: '5.MD.C.3', description: 'Recognize volume as an attribute of solid figures' },
      { code: '5.MD.C.5', description: 'Relate volume to the operations of multiplication and addition' },
    ],
    'Geometry': [
      { code: '5.G.A.1', description: 'Use a pair of perpendicular number lines to define a coordinate system' },
      { code: '5.G.B.3', description: 'Understand that attributes belonging to a category of figures also belong to all subcategories' },
      { code: '6.G.A.1', description: 'Find the area of right triangles, other triangles, special quadrilaterals, and polygons' },
    ],
    'Operations & Algebraic Thinking': [
      { code: '5.OA.A.1', description: 'Use parentheses, brackets, or braces and evaluate expressions with these symbols' },
      { code: '5.OA.A.2', description: 'Write simple expressions that record calculations with numbers' },
    ],
  },
  science: {
    'Biology Basics': [
      { code: 'MS-LS1-1', description: 'Conduct an investigation to provide evidence that living things are made of cells' },
      { code: 'MS-LS1-2', description: 'Develop and use a model to describe the function of a cell as a whole' },
    ],
    'Cells': [
      { code: 'MS-LS1-2', description: 'Develop and use a model to describe the function of a cell as a whole' },
    ],
    'Earth Science': [
      { code: '5-ESS1-2', description: 'Represent data in graphical displays to reveal patterns of daily changes in length and direction of shadows' },
      { code: '5-ESS2-1', description: 'Develop a model using an example to describe ways the geosphere, biosphere, hydrosphere, and/or atmosphere interact' },
    ],
    'Physical Science': [
      { code: '5-PS1-3', description: 'Make observations and measurements to identify materials based on their properties' },
      { code: 'MS-PS2-2', description: 'Plan an investigation to provide evidence that the change in an object\'s motion depends on the sum of the forces acting on the object' },
    ],
    'Adaptations': [
      { code: 'MS-LS4-4', description: 'Construct an explanation based on evidence that describes how genetic variations of traits in a population increase some individuals\' probability of surviving' },
    ],
  },
  history: {
    'Government Types': [
      { code: 'C3.D2.Civ.1.3-5', description: 'Distinguish the responsibilities and powers of government officials at various levels and branches of government' },
    ],
    'Imperialism': [
      { code: 'C3.D2.His.1.6-8', description: 'Analyze connections among events and developments in broader historical contexts' },
    ],
    'Civilizations': [
      { code: 'C3.D2.His.14.3-5', description: 'Explain probable causes and effects of events and developments' },
    ],
    'African Empires': [
      { code: 'C3.D2.Geo.4.6-8', description: 'Explain how cultural patterns and economic decisions influence environments and the daily lives of people' },
    ],
  },
  english: {
    'Grammar': [
      { code: 'L.5.1', description: 'Demonstrate command of the conventions of standard English grammar and usage' },
    ],
    'Writing': [
      { code: 'W.5.1', description: 'Write opinion pieces on topics or texts, supporting a point of view with reasons and information' },
      { code: 'W.5.2', description: 'Write informative/explanatory texts to examine a topic and convey ideas and information clearly' },
    ],
    'Vocabulary': [
      { code: 'L.5.4', description: 'Determine or clarify the meaning of unknown and multiple-meaning words and phrases' },
    ],
    'Reading': [
      { code: 'RL.5.2', description: 'Determine a theme of a story, drama, or poem from details in the text' },
      { code: 'RL.5.4', description: 'Determine the meaning of words and phrases as they are used in a text, including figurative language' },
    ],
  },
};
