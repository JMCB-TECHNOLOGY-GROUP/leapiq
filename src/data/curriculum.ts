import type { BloomLevel } from '@/lib/constants';
import type { CurriculumModule } from '@/lib/iep-types';

/**
 * Pre-populated class materials.
 *
 * Every grade from Pre-K to College ships with a catalogue of modules, so a plan
 * can be built the moment assessment data lands — nobody has to author content
 * first. A seed lists the grades it serves; a module is the seed instantiated for
 * one grade, which is what gets assigned to a pupil.
 *
 * Strand names match the question categories in `STANDARDS_MAP` wherever the two
 * overlap, so quiz results roll straight into the matching plan goal.
 */
interface ModuleSeed {
  subject: string;
  strand: string;
  grades: string[];
  title: string;
  objective: string;
  bloom: BloomLevel;
  /** 1 (foundational) to 5 (extension). Also orders the strand sequence. */
  difficulty: number;
  standards?: string[];
}

/** Grade keys in teaching order. Drives cross-grade prerequisite chaining. */
export const GRADE_ORDER = [
  'prek', 'k', '1st', '2nd', '3rd', '4th', '5th', '6th',
  '7th', '8th', '9th', '10th', '11th', '12th', 'college',
];

const SEEDS: ModuleSeed[] = [
  // ── Math · Number & Operations ──
  { subject: 'math', strand: 'Number & Operations', grades: ['prek'], title: 'Counting to 10', objective: 'Count a group of up to ten objects and say how many there are.', bloom: 'remember', difficulty: 1 },
  { subject: 'math', strand: 'Number & Operations', grades: ['prek', 'k'], title: 'Number Names and Order', objective: 'Name written numerals 0-10 and put them in order.', bloom: 'remember', difficulty: 1 },
  { subject: 'math', strand: 'Number & Operations', grades: ['k'], title: 'Counting to 100 by Ones and Tens', objective: 'Count forward to 100 by ones and by tens from any starting number.', bloom: 'remember', difficulty: 2, standards: ['K.CC.A.1'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['k', '1st'], title: 'Adding and Subtracting Within 10', objective: 'Solve addition and subtraction problems within 10 using objects or drawings.', bloom: 'apply', difficulty: 2, standards: ['K.OA.A.2'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['1st'], title: 'Place Value to 100', objective: 'Understand that the two digits of a two-digit number represent tens and ones.', bloom: 'understand', difficulty: 2, standards: ['1.NBT.B.2'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['1st', '2nd'], title: 'Addition and Subtraction Within 20', objective: 'Add and subtract within 20 fluently, using make-a-ten and doubles strategies.', bloom: 'apply', difficulty: 3, standards: ['2.OA.B.2'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['2nd'], title: 'Place Value to 1,000', objective: 'Read, write and compare three-digit numbers using hundreds, tens and ones.', bloom: 'understand', difficulty: 3, standards: ['2.NBT.A.1'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['3rd'], title: 'Multiplication and Division Within 100', objective: 'Multiply and divide within 100 using the relationship between the two operations.', bloom: 'apply', difficulty: 3, standards: ['3.OA.C.7'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['3rd', '4th'], title: 'Fractions on a Number Line', objective: 'Represent a fraction on a number line and explain what the numerator and denominator mean.', bloom: 'understand', difficulty: 3, standards: ['3.NF.A.2'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['4th'], title: 'Equivalent Fractions', objective: 'Recognise and generate equivalent fractions and explain why they are equal.', bloom: 'understand', difficulty: 3, standards: ['4.NF.A.1'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['4th', '5th'], title: 'Multi-Digit Multiplication', objective: 'Multiply a multi-digit number by a two-digit number using place-value strategies.', bloom: 'apply', difficulty: 4, standards: ['4.NBT.B.5'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['5th'], title: 'Adding and Subtracting Unlike Fractions', objective: 'Add and subtract fractions with unlike denominators by finding a common denominator.', bloom: 'apply', difficulty: 4, standards: ['5.NF.A.1'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['5th', '6th'], title: 'Decimals to Hundredths', objective: 'Add, subtract, multiply and divide decimals to hundredths.', bloom: 'apply', difficulty: 4, standards: ['5.NBT.B.7'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['5th', '6th'], title: 'Dividing by Unit Fractions', objective: 'Divide a whole number by a unit fraction and a unit fraction by a whole number.', bloom: 'analyze', difficulty: 5, standards: ['5.NF.B.7'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['6th', '7th'], title: 'Ratios and Unit Rates', objective: 'Use ratio reasoning and unit rates to solve real-world problems.', bloom: 'apply', difficulty: 4, standards: ['6.RP.A.3'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['7th'], title: 'Operations With Integers', objective: 'Add, subtract, multiply and divide positive and negative rational numbers.', bloom: 'apply', difficulty: 4, standards: ['7.NS.A.2'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['7th', '8th'], title: 'Percent Increase and Decrease', objective: 'Solve multi-step percent problems including markup, discount and interest.', bloom: 'analyze', difficulty: 5, standards: ['7.RP.A.3'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['8th'], title: 'Exponents and Scientific Notation', objective: 'Apply the properties of integer exponents and work in scientific notation.', bloom: 'apply', difficulty: 4, standards: ['8.EE.A.1'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['9th', '10th'], title: 'Rational and Irrational Numbers', objective: 'Classify real numbers and reason about sums and products of rational and irrational numbers.', bloom: 'analyze', difficulty: 4, standards: ['HSN.RN.B.3'] },
  { subject: 'math', strand: 'Number & Operations', grades: ['11th', '12th', 'college'], title: 'Complex Numbers', objective: 'Perform arithmetic with complex numbers and interpret them geometrically.', bloom: 'analyze', difficulty: 5, standards: ['HSN.CN.A.2'] },

  // ── Math · Operations & Algebraic Thinking ──
  { subject: 'math', strand: 'Operations & Algebraic Thinking', grades: ['1st', '2nd'], title: 'Patterns and Number Sentences', objective: 'Extend a repeating pattern and complete a missing-number sentence.', bloom: 'understand', difficulty: 2 },
  { subject: 'math', strand: 'Operations & Algebraic Thinking', grades: ['3rd', '4th'], title: 'Two-Step Word Problems', objective: 'Solve two-step word problems and judge whether an answer is reasonable.', bloom: 'apply', difficulty: 3, standards: ['3.OA.D.8'] },
  { subject: 'math', strand: 'Operations & Algebraic Thinking', grades: ['5th'], title: 'Order of Operations', objective: 'Evaluate expressions containing parentheses, brackets and braces.', bloom: 'apply', difficulty: 3, standards: ['5.OA.A.1'] },
  { subject: 'math', strand: 'Operations & Algebraic Thinking', grades: ['5th', '6th'], title: 'Writing Expressions', objective: 'Write and read expressions that record calculations with numbers and letters.', bloom: 'understand', difficulty: 3, standards: ['5.OA.A.2'] },
  { subject: 'math', strand: 'Operations & Algebraic Thinking', grades: ['6th', '7th'], title: 'Solving One-Step Equations', objective: 'Solve one-step equations and inequalities and graph the solution set.', bloom: 'apply', difficulty: 4, standards: ['6.EE.B.7'] },
  { subject: 'math', strand: 'Operations & Algebraic Thinking', grades: ['8th', '9th'], title: 'Linear Functions', objective: 'Interpret slope and intercept, and construct a linear function from a table or graph.', bloom: 'analyze', difficulty: 4, standards: ['8.F.B.4'] },
  { subject: 'math', strand: 'Operations & Algebraic Thinking', grades: ['9th', '10th'], title: 'Systems of Equations', objective: 'Solve systems of linear equations algebraically and graphically.', bloom: 'analyze', difficulty: 5, standards: ['HSA.REI.C.6'] },
  { subject: 'math', strand: 'Operations & Algebraic Thinking', grades: ['10th', '11th'], title: 'Quadratic Functions', objective: 'Solve quadratic equations and interpret the graph of a quadratic function.', bloom: 'analyze', difficulty: 5, standards: ['HSA.REI.B.4'] },
  { subject: 'math', strand: 'Operations & Algebraic Thinking', grades: ['12th', 'college'], title: 'Limits and Rates of Change', objective: 'Estimate a limit numerically and connect it to an average rate of change.', bloom: 'analyze', difficulty: 5 },

  // ── Math · Measurement & Data ──
  { subject: 'math', strand: 'Measurement & Data', grades: ['prek', 'k'], title: 'Sorting and Comparing', objective: 'Sort objects by one attribute and compare which group has more.', bloom: 'understand', difficulty: 1 },
  { subject: 'math', strand: 'Measurement & Data', grades: ['1st', '2nd'], title: 'Measuring Length', objective: 'Measure the length of an object using standard units and a ruler.', bloom: 'apply', difficulty: 2, standards: ['2.MD.A.1'] },
  { subject: 'math', strand: 'Measurement & Data', grades: ['2nd', '3rd'], title: 'Telling Time and Money', objective: 'Tell time to the nearest five minutes and solve word problems involving money.', bloom: 'apply', difficulty: 2, standards: ['2.MD.C.7'] },
  { subject: 'math', strand: 'Measurement & Data', grades: ['3rd', '4th'], title: 'Reading Bar and Picture Graphs', objective: 'Draw a scaled bar graph and answer comparison questions from it.', bloom: 'analyze', difficulty: 3, standards: ['3.MD.B.3'] },
  { subject: 'math', strand: 'Measurement & Data', grades: ['4th', '5th'], title: 'Converting Measurement Units', objective: 'Convert among different-sized standard measurement units within one system.', bloom: 'apply', difficulty: 3, standards: ['5.MD.A.1'] },
  { subject: 'math', strand: 'Measurement & Data', grades: ['5th', '6th'], title: 'Volume of Solid Figures', objective: 'Relate volume to multiplication and find the volume of a rectangular prism.', bloom: 'apply', difficulty: 4, standards: ['5.MD.C.5'] },
  { subject: 'math', strand: 'Measurement & Data', grades: ['6th', '7th'], title: 'Mean, Median and Spread', objective: 'Summarise a data set with measures of centre and describe its variability.', bloom: 'analyze', difficulty: 4, standards: ['6.SP.B.5'] },
  { subject: 'math', strand: 'Measurement & Data', grades: ['8th', '9th'], title: 'Scatter Plots and Association', objective: 'Construct a scatter plot and describe the association between two variables.', bloom: 'analyze', difficulty: 4, standards: ['8.SP.A.1'] },
  { subject: 'math', strand: 'Measurement & Data', grades: ['10th', '11th', '12th', 'college'], title: 'Probability and Inference', objective: 'Compute conditional probability and evaluate a claim from sample data.', bloom: 'analyze', difficulty: 5, standards: ['HSS.CP.A.3'] },

  // ── Math · Geometry ──
  { subject: 'math', strand: 'Geometry', grades: ['prek', 'k'], title: 'Naming 2D Shapes', objective: 'Name circles, squares, triangles and rectangles in any orientation.', bloom: 'remember', difficulty: 1 },
  { subject: 'math', strand: 'Geometry', grades: ['1st', '2nd'], title: 'Composing Shapes', objective: 'Build larger shapes from smaller ones and partition shapes into equal parts.', bloom: 'apply', difficulty: 2, standards: ['1.G.A.2'] },
  { subject: 'math', strand: 'Geometry', grades: ['3rd', '4th'], title: 'Perimeter and Area', objective: 'Find the perimeter and area of rectangles and solve problems involving both.', bloom: 'apply', difficulty: 3, standards: ['3.MD.D.8'] },
  { subject: 'math', strand: 'Geometry', grades: ['4th', '5th'], title: 'Angles and Lines', objective: 'Classify angles and identify parallel and perpendicular lines in figures.', bloom: 'understand', difficulty: 3, standards: ['4.G.A.1'] },
  { subject: 'math', strand: 'Geometry', grades: ['5th', '6th'], title: 'The Coordinate Plane', objective: 'Plot points in all four quadrants and interpret coordinate values in context.', bloom: 'apply', difficulty: 3, standards: ['5.G.A.1'] },
  { subject: 'math', strand: 'Geometry', grades: ['6th', '7th'], title: 'Area of Triangles and Polygons', objective: 'Find the area of triangles, special quadrilaterals and composite polygons.', bloom: 'apply', difficulty: 4, standards: ['6.G.A.1'] },
  { subject: 'math', strand: 'Geometry', grades: ['8th', '9th'], title: 'Pythagorean Theorem', objective: 'Apply the Pythagorean theorem to find unknown side lengths in right triangles.', bloom: 'apply', difficulty: 4, standards: ['8.G.B.7'] },
  { subject: 'math', strand: 'Geometry', grades: ['10th', '11th'], title: 'Similarity and Trigonometric Ratios', objective: 'Use similarity to define sine, cosine and tangent and solve right triangles.', bloom: 'analyze', difficulty: 5, standards: ['HSG.SRT.C.8'] },

  // ── English · Reading ──
  { subject: 'english', strand: 'Reading', grades: ['prek', 'k'], title: 'Letter Sounds', objective: 'Match each consonant and short vowel to its most common sound.', bloom: 'remember', difficulty: 1, standards: ['RF.K.3'] },
  { subject: 'english', strand: 'Reading', grades: ['k', '1st'], title: 'Blending and Decoding CVC Words', objective: 'Blend sounds to read simple consonant-vowel-consonant words.', bloom: 'apply', difficulty: 2, standards: ['RF.1.2'] },
  { subject: 'english', strand: 'Reading', grades: ['1st', '2nd'], title: 'Retelling a Story', objective: 'Retell a story in order and identify its central message.', bloom: 'understand', difficulty: 2, standards: ['RL.1.2'] },
  { subject: 'english', strand: 'Reading', grades: ['2nd', '3rd'], title: 'Reading Fluency', objective: 'Read grade-level text accurately and with expression at an appropriate rate.', bloom: 'apply', difficulty: 3, standards: ['RF.3.4'] },
  { subject: 'english', strand: 'Reading', grades: ['3rd', '4th'], title: 'Main Idea and Supporting Detail', objective: 'Determine the main idea of a passage and the details that support it.', bloom: 'analyze', difficulty: 3, standards: ['RI.4.2'] },
  { subject: 'english', strand: 'Reading', grades: ['4th', '5th'], title: 'Theme in Literature', objective: 'Determine a theme of a story, drama or poem from details in the text.', bloom: 'analyze', difficulty: 4, standards: ['RL.5.2'] },
  { subject: 'english', strand: 'Reading', grades: ['5th', '6th'], title: 'Figurative Language', objective: 'Interpret figurative language, including similes, metaphors and idioms.', bloom: 'analyze', difficulty: 4, standards: ['RL.5.4'] },
  { subject: 'english', strand: 'Reading', grades: ['6th', '7th'], title: 'Inference and Evidence', objective: 'Draw an inference from a text and cite the evidence that supports it.', bloom: 'analyze', difficulty: 4, standards: ['RL.7.1'] },
  { subject: 'english', strand: 'Reading', grades: ['8th', '9th'], title: 'Author’s Purpose and Point of View', objective: 'Analyse how an author develops point of view and responds to conflicting evidence.', bloom: 'analyze', difficulty: 5, standards: ['RI.8.6'] },
  { subject: 'english', strand: 'Reading', grades: ['10th', '11th', '12th', 'college'], title: 'Analysing Complex Texts', objective: 'Analyse the structure and rhetoric of complex informational and literary texts.', bloom: 'analyze', difficulty: 5, standards: ['RI.11-12.6'] },

  // ── English · Writing ──
  { subject: 'english', strand: 'Writing', grades: ['prek', 'k', '1st'], title: 'Writing Sentences', objective: 'Write a complete sentence with a capital letter and an end mark.', bloom: 'apply', difficulty: 1, standards: ['L.1.2'] },
  { subject: 'english', strand: 'Writing', grades: ['2nd', '3rd'], title: 'Paragraph Structure', objective: 'Write a paragraph with a topic sentence, supporting detail and a closing.', bloom: 'apply', difficulty: 2, standards: ['W.3.2'] },
  { subject: 'english', strand: 'Writing', grades: ['3rd', '4th'], title: 'Narrative Writing', objective: 'Write a narrative with a clear sequence of events and descriptive detail.', bloom: 'apply', difficulty: 3, standards: ['W.4.3'] },
  { subject: 'english', strand: 'Writing', grades: ['4th', '5th'], title: 'Opinion Writing', objective: 'Write an opinion piece supporting a point of view with reasons and information.', bloom: 'apply', difficulty: 3, standards: ['W.5.1'] },
  { subject: 'english', strand: 'Writing', grades: ['5th', '6th'], title: 'Informative Writing', objective: 'Write an informative text that examines a topic and conveys ideas clearly.', bloom: 'apply', difficulty: 4, standards: ['W.5.2'] },
  { subject: 'english', strand: 'Writing', grades: ['7th', '8th'], title: 'Argument and Counterclaim', objective: 'Write an argument that acknowledges and answers an opposing claim.', bloom: 'analyze', difficulty: 4, standards: ['W.8.1'] },
  { subject: 'english', strand: 'Writing', grades: ['9th', '10th', '11th', '12th', 'college'], title: 'Research and Citation', objective: 'Write a research piece that integrates and cites sources without plagiarism.', bloom: 'analyze', difficulty: 5, standards: ['W.9-10.8'] },

  // ── English · Grammar ──
  { subject: 'english', strand: 'Grammar', grades: ['1st', '2nd'], title: 'Nouns and Verbs', objective: 'Identify nouns and verbs and use them correctly in a sentence.', bloom: 'remember', difficulty: 1, standards: ['L.1.1'] },
  { subject: 'english', strand: 'Grammar', grades: ['3rd', '4th'], title: 'Subject-Verb Agreement', objective: 'Make subjects and verbs agree in simple and compound sentences.', bloom: 'apply', difficulty: 3, standards: ['L.3.1'] },
  { subject: 'english', strand: 'Grammar', grades: ['5th', '6th'], title: 'Punctuation and Clauses', objective: 'Punctuate compound and complex sentences using commas and conjunctions.', bloom: 'apply', difficulty: 3, standards: ['L.5.1'] },
  { subject: 'english', strand: 'Grammar', grades: ['7th', '8th', '9th'], title: 'Sentence Variety and Voice', objective: 'Vary sentence structure and choose active or passive voice for effect.', bloom: 'analyze', difficulty: 4, standards: ['L.9-10.3'] },

  // ── English · Vocabulary ──
  { subject: 'english', strand: 'Vocabulary', grades: ['k', '1st', '2nd'], title: 'High-Frequency Words', objective: 'Read and spell the most common sight words on sight.', bloom: 'remember', difficulty: 1, standards: ['RF.2.3'] },
  { subject: 'english', strand: 'Vocabulary', grades: ['3rd', '4th', '5th'], title: 'Context Clues', objective: 'Work out the meaning of an unknown word from the surrounding text.', bloom: 'apply', difficulty: 3, standards: ['L.5.4'] },
  { subject: 'english', strand: 'Vocabulary', grades: ['6th', '7th', '8th'], title: 'Roots, Prefixes and Suffixes', objective: 'Use Greek and Latin word parts to work out the meaning of unfamiliar words.', bloom: 'apply', difficulty: 4, standards: ['L.7.4'] },
  { subject: 'english', strand: 'Vocabulary', grades: ['9th', '10th', '11th', '12th', 'college'], title: 'Academic and Domain Vocabulary', objective: 'Acquire and use academic vocabulary precisely across subject areas.', bloom: 'analyze', difficulty: 4, standards: ['L.9-10.6'] },

  // ── Science · Physical Science ──
  { subject: 'science', strand: 'Physical Science', grades: ['k', '1st', '2nd'], title: 'Properties of Materials', objective: 'Describe and sort materials by observable properties such as texture and hardness.', bloom: 'understand', difficulty: 1, standards: ['2-PS1-1'] },
  { subject: 'science', strand: 'Physical Science', grades: ['3rd', '4th', '5th'], title: 'Identifying Materials by Property', objective: 'Make measurements to identify materials based on their properties.', bloom: 'apply', difficulty: 3, standards: ['5-PS1-3'] },
  { subject: 'science', strand: 'Physical Science', grades: ['6th', '7th', '8th'], title: 'Forces and Motion', objective: 'Plan an investigation showing that a change in motion depends on the net force.', bloom: 'analyze', difficulty: 4, standards: ['MS-PS2-2'] },
  { subject: 'science', strand: 'Physical Science', grades: ['9th', '10th', '11th', '12th', 'college'], title: 'Energy Transfer and Conservation', objective: 'Model energy transfer in a system and account for it quantitatively.', bloom: 'analyze', difficulty: 5, standards: ['HS-PS3-1'] },

  // ── Science · Earth Science ──
  { subject: 'science', strand: 'Earth Science', grades: ['k', '1st', '2nd'], title: 'Weather and Seasons', objective: 'Record daily weather and describe how it changes across the seasons.', bloom: 'understand', difficulty: 1, standards: ['K-ESS2-1'] },
  { subject: 'science', strand: 'Earth Science', grades: ['3rd', '4th', '5th'], title: 'Earth Systems Interact', objective: 'Model how the geosphere, biosphere, hydrosphere and atmosphere interact.', bloom: 'analyze', difficulty: 3, standards: ['5-ESS2-1'] },
  { subject: 'science', strand: 'Earth Science', grades: ['6th', '7th', '8th'], title: 'The Water Cycle and Climate', objective: 'Explain how water cycling and atmospheric circulation determine regional climate.', bloom: 'analyze', difficulty: 4, standards: ['MS-ESS2-6'] },
  { subject: 'science', strand: 'Earth Science', grades: ['9th', '10th', '11th', '12th', 'college'], title: 'Human Impact on Earth Systems', objective: 'Evaluate a solution for reducing human impact on natural systems.', bloom: 'analyze', difficulty: 5, standards: ['HS-ESS3-4'] },

  // ── Science · Biology Basics ──
  { subject: 'science', strand: 'Biology Basics', grades: ['k', '1st', '2nd'], title: 'Living and Non-Living', objective: 'Sort things into living and non-living and give reasons for the sort.', bloom: 'understand', difficulty: 1 },
  { subject: 'science', strand: 'Biology Basics', grades: ['3rd', '4th', '5th'], title: 'Life Cycles and Inheritance', objective: 'Describe the life cycle of an organism and how traits pass to offspring.', bloom: 'understand', difficulty: 3, standards: ['3-LS1-1'] },
  { subject: 'science', strand: 'Biology Basics', grades: ['6th', '7th'], title: 'Cells as the Unit of Life', objective: 'Provide evidence that living things are made of one or more cells.', bloom: 'analyze', difficulty: 4, standards: ['MS-LS1-1'] },
  { subject: 'science', strand: 'Biology Basics', grades: ['7th', '8th'], title: 'Adaptation and Natural Selection', objective: 'Explain how genetic variation affects the chance of surviving in an environment.', bloom: 'analyze', difficulty: 5, standards: ['MS-LS4-4'] },
  { subject: 'science', strand: 'Biology Basics', grades: ['9th', '10th', '11th', '12th', 'college'], title: 'Ecosystem Dynamics', objective: 'Model the cycling of matter and flow of energy through an ecosystem.', bloom: 'analyze', difficulty: 5, standards: ['HS-LS2-4'] },

  // ── History · Civilizations ──
  { subject: 'history', strand: 'Civilizations', grades: ['3rd', '4th', '5th'], title: 'Cause and Effect in History', objective: 'Explain probable causes and effects of events and developments.', bloom: 'analyze', difficulty: 3, standards: ['C3.D2.His.14.3-5'] },
  { subject: 'history', strand: 'Civilizations', grades: ['6th', '7th'], title: 'Early Civilizations', objective: 'Compare how early civilizations organised food, trade and settlement.', bloom: 'analyze', difficulty: 4, standards: ['C3.D2.His.1.6-8'] },
  { subject: 'history', strand: 'Civilizations', grades: ['7th', '8th'], title: 'African Empires and Trade', objective: 'Explain how trade routes shaped the economies of West African empires.', bloom: 'analyze', difficulty: 4, standards: ['C3.D2.Geo.4.6-8'] },
  { subject: 'history', strand: 'Civilizations', grades: ['9th', '10th', '11th', '12th', 'college'], title: 'Historical Interpretation', objective: 'Evaluate competing historical interpretations using primary sources.', bloom: 'analyze', difficulty: 5 },

  // ── History · Government Types ──
  { subject: 'history', strand: 'Government Types', grades: ['3rd', '4th', '5th'], title: 'Branches and Levels of Government', objective: 'Distinguish the powers of officials at different levels and branches of government.', bloom: 'understand', difficulty: 3, standards: ['C3.D2.Civ.1.3-5'] },
  { subject: 'history', strand: 'Government Types', grades: ['6th', '7th', '8th'], title: 'Comparing Systems of Government', objective: 'Compare democratic, monarchic and authoritarian systems and their trade-offs.', bloom: 'analyze', difficulty: 4 },
  { subject: 'history', strand: 'Government Types', grades: ['9th', '10th', '11th', '12th', 'college'], title: 'Rights, Law and Civic Action', objective: 'Analyse how constitutional rights are protected and contested through law.', bloom: 'analyze', difficulty: 5 },

  // ── History · Geography ──
  { subject: 'history', strand: 'Geography', grades: ['3rd', '4th', '5th'], title: 'Reading Maps', objective: 'Use scale, key and compass directions to answer questions from a map.', bloom: 'apply', difficulty: 2 },
  { subject: 'history', strand: 'Geography', grades: ['6th', '7th', '8th'], title: 'People and Environment', objective: 'Explain how physical geography shapes where and how people live.', bloom: 'analyze', difficulty: 4, standards: ['C3.D2.Geo.4.6-8'] },
  { subject: 'history', strand: 'Geography', grades: ['9th', '10th', '11th', '12th', 'college'], title: 'Migration and Global Change', objective: 'Analyse the drivers and consequences of migration at a regional scale.', bloom: 'analyze', difficulty: 5 },
];

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Materials scale with difficulty: harder modules ship more practice. */
function materialsFor(difficulty: number) {
  return {
    lessons: difficulty >= 4 ? 4 : difficulty >= 2 ? 3 : 2,
    practice: 6 + difficulty * 2,
    checkpoints: 2,
  };
}

function buildCatalog(): CurriculumModule[] {
  const modules: CurriculumModule[] = [];

  for (const grade of GRADE_ORDER) {
    const forGrade = SEEDS.filter(s => s.grades.includes(grade));

    // Group by strand so sequence numbers run per subject+strand.
    const byStrand = new Map<string, ModuleSeed[]>();
    for (const seed of forGrade) {
      const key = `${seed.subject}::${seed.strand}`;
      const list = byStrand.get(key);
      if (list) list.push(seed);
      else byStrand.set(key, [seed]);
    }

    for (const [key, seeds] of byStrand) {
      // Stable order: easiest first, then declaration order for ties.
      const ordered = [...seeds].sort(
        (a, b) => a.difficulty - b.difficulty || SEEDS.indexOf(a) - SEEDS.indexOf(b),
      );

      ordered.forEach((seed, i) => {
        const id = `${seed.subject}-${grade}-${slug(seed.title)}`;
        const prerequisiteIds: string[] = [];

        if (i > 0) {
          // Previous module in this strand, same grade.
          prerequisiteIds.push(`${seed.subject}-${grade}-${slug(ordered[i - 1].title)}`);
        } else {
          // First of the strand: chain to the last module of the same strand in
          // the nearest lower grade that teaches it.
          const gi = GRADE_ORDER.indexOf(grade);
          for (let g = gi - 1; g >= 0; g--) {
            const prior = modules.filter(
              m => `${m.subject}::${m.strand}` === key && m.grade === GRADE_ORDER[g],
            );
            if (prior.length > 0) {
              prerequisiteIds.push(prior[prior.length - 1].id);
              break;
            }
          }
        }

        modules.push({
          id,
          subject: seed.subject,
          strand: seed.strand,
          grade,
          sequence: i + 1,
          title: seed.title,
          objective: seed.objective,
          bloom: seed.bloom,
          difficulty: seed.difficulty,
          minutes: 20 + seed.difficulty * 10,
          standards: seed.standards ?? [],
          prerequisiteIds,
          materials: materialsFor(seed.difficulty),
        });
      });
    }
  }

  return modules;
}

/** Every module for every grade. Built once at import; deterministic. */
export const CURRICULUM: CurriculumModule[] = buildCatalog();

export function modulesForGrade(grade: string): CurriculumModule[] {
  return CURRICULUM.filter(m => m.grade === grade);
}

/** Modules for one strand of one grade, in teaching order. */
export function modulesForStrand(grade: string, subject: string, strand: string): CurriculumModule[] {
  return CURRICULUM.filter(
    m => m.grade === grade && m.subject === subject && m.strand === strand,
  ).sort((a, b) => a.sequence - b.sequence);
}

export function getModule(id: string): CurriculumModule | undefined {
  return CURRICULUM.find(m => m.id === id);
}

/** Distinct `subject::strand` keys taught at a grade. */
export function strandsForGrade(grade: string): { subject: string; strand: string }[] {
  const seen = new Set<string>();
  const out: { subject: string; strand: string }[] = [];
  for (const m of modulesForGrade(grade)) {
    const key = `${m.subject}::${m.strand}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ subject: m.subject, strand: m.strand });
    }
  }
  return out;
}

/** Per-grade catalogue totals, for the coverage panel in the educator console. */
export function catalogCoverage(): { grade: string; modules: number; subjects: number; minutes: number }[] {
  return GRADE_ORDER.map(grade => {
    const mods = modulesForGrade(grade);
    return {
      grade,
      modules: mods.length,
      subjects: new Set(mods.map(m => m.subject)).size,
      minutes: mods.reduce((a, m) => a + m.minutes, 0),
    };
  });
}
