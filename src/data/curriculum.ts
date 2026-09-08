import type { BloomLevel } from '@/lib/constants';
import type { CurriculumModule } from '@/lib/iep-types';
import { GRADE_ORDER, gradeById } from './guyana';

export { GRADE_ORDER };

/**
 * Pre-populated class materials for Guyana's national curriculum.
 *
 * Every year of schooling — Nursery 1 through Form 5 — ships with a module
 * catalogue, so a plan can assign work the moment assessment data lands and
 * nobody has to author content first.
 *
 * Strand names follow the Guyana National Curriculum guides published by NCERD
 * and match the question categories in `STANDARDS_MAP`, so quiz results roll
 * straight into the matching plan goal. Modules build toward the national
 * assessments: the Grade Two and Grade Four assessments, the NGSA at Grade 6,
 * the Grade Nine assessment at Form 3, and CSEC at Form 5.
 */
interface ModuleSeed {
  subject: string;
  strand: string;
  /** Grade ids this module is taught in. */
  grades: string[];
  title: string;
  objective: string;
  bloom: BloomLevel;
  /** 1 (foundational) to 5 (extension). Also orders the strand sequence. */
  difficulty: number;
  standards?: string[];
}

const SEEDS: ModuleSeed[] = [
  // ── Mathematics · Sets ──
  { subject: 'math', strand: 'Sets', grades: ['nursery1', 'nursery2'], title: 'Sorting and Matching', objective: 'Sort objects into groups by colour, shape or size and say why they belong together.', bloom: 'understand', difficulty: 1, standards: ['GY-MATH-ST1'] },
  { subject: 'math', strand: 'Sets', grades: ['grade1', 'grade2'], title: 'Grouping by Attribute', objective: 'Group objects by one attribute and count how many are in each group.', bloom: 'understand', difficulty: 1, standards: ['GY-MATH-ST1'] },
  { subject: 'math', strand: 'Sets', grades: ['grade3', 'grade4'], title: 'Sets and Their Members', objective: 'Describe a set, list its members, and identify empty and equal sets.', bloom: 'understand', difficulty: 2, standards: ['GY-MATH-ST2'] },
  { subject: 'math', strand: 'Sets', grades: ['grade5', 'grade6'], title: 'Union, Intersection and Venn Diagrams', objective: 'Use Venn diagrams to show union and intersection and solve simple set problems.', bloom: 'apply', difficulty: 4, standards: ['GY-MATH-ST2'] },
  { subject: 'math', strand: 'Sets', grades: ['form1', 'form2'], title: 'Set Notation and Problem Solving', objective: 'Use set notation and Venn diagrams to solve two-set and three-set problems.', bloom: 'analyze', difficulty: 5, standards: ['GY-MATH-ST2'] },

  // ── Mathematics · Number Concepts ──
  { subject: 'math', strand: 'Number Concepts', grades: ['nursery1'], title: 'Counting to 10', objective: 'Count a group of up to ten objects and say how many there are.', bloom: 'remember', difficulty: 1, standards: ['GY-MATH-NC1'] },
  { subject: 'math', strand: 'Number Concepts', grades: ['nursery2'], title: 'Number Names and Order to 20', objective: 'Name and order the numerals 0 to 20 and match each to a quantity.', bloom: 'remember', difficulty: 1, standards: ['GY-MATH-NC1'] },
  { subject: 'math', strand: 'Number Concepts', grades: ['grade1'], title: 'Counting and Number Names to 100', objective: 'Count, read and write numbers to 100 and count on and back from any number.', bloom: 'remember', difficulty: 2, standards: ['GY-MATH-NC1'] },
  { subject: 'math', strand: 'Number Concepts', grades: ['grade2'], title: 'Place Value to 1 000', objective: 'Read, write and compare three-digit numbers using hundreds, tens and ones.', bloom: 'understand', difficulty: 2, standards: ['GY-MATH-NC1'] },
  { subject: 'math', strand: 'Number Concepts', grades: ['grade3', 'grade4'], title: 'Place Value to 100 000', objective: 'Read, write, order and round large whole numbers using place value.', bloom: 'understand', difficulty: 3, standards: ['GY-MATH-NC1'] },
  { subject: 'math', strand: 'Number Concepts', grades: ['grade4', 'grade5'], title: 'Factors, Multiples and Number Patterns', objective: 'Find factors and multiples, recognise squares, and continue number patterns.', bloom: 'apply', difficulty: 3, standards: ['GY-MATH-NC2'] },
  { subject: 'math', strand: 'Number Concepts', grades: ['grade6'], title: 'Rounding, Estimation and Large Numbers', objective: 'Round and estimate to check whether an answer to a large calculation is reasonable.', bloom: 'analyze', difficulty: 4, standards: ['GY-MATH-NC2'] },
  { subject: 'math', strand: 'Number Concepts', grades: ['form1', 'form2'], title: 'Directed Numbers and the Number Line', objective: 'Order and compare positive and negative numbers and place them on a number line.', bloom: 'understand', difficulty: 3, standards: ['GY-MATH-NC1'] },
  { subject: 'math', strand: 'Number Concepts', grades: ['form3', 'form4'], title: 'Indices and Standard Form', objective: 'Apply the laws of indices and write large and small numbers in standard form.', bloom: 'apply', difficulty: 5, standards: ['GY-MATH-NC2'] },

  // ── Mathematics · Operations, Relations and Properties ──
  { subject: 'math', strand: 'Operations, Relations and Properties', grades: ['grade1', 'grade2'], title: 'Addition and Subtraction to 20', objective: 'Add and subtract within 20 using make-a-ten, doubles and number bonds.', bloom: 'apply', difficulty: 2, standards: ['GY-MATH-OP1'] },
  { subject: 'math', strand: 'Operations, Relations and Properties', grades: ['grade2', 'grade3'], title: 'Addition and Subtraction to 1 000', objective: 'Add and subtract three-digit numbers with regrouping.', bloom: 'apply', difficulty: 3, standards: ['GY-MATH-OP1'] },
  { subject: 'math', strand: 'Operations, Relations and Properties', grades: ['grade3', 'grade4'], title: 'Multiplication and Division Facts', objective: 'Recall multiplication and division facts to 12 and use the link between them.', bloom: 'remember', difficulty: 3, standards: ['GY-MATH-OP1'] },
  { subject: 'math', strand: 'Operations, Relations and Properties', grades: ['grade4', 'grade5'], title: 'Long Multiplication and Division', objective: 'Multiply and divide multi-digit numbers using written methods.', bloom: 'apply', difficulty: 4, standards: ['GY-MATH-OP1'] },
  { subject: 'math', strand: 'Operations, Relations and Properties', grades: ['grade5', 'grade6'], title: 'Order of Operations and Multi-Step Problems', objective: 'Apply the order of operations and solve multi-step word problems.', bloom: 'analyze', difficulty: 5, standards: ['GY-MATH-OP2', 'GY-MATH-OP3'] },
  { subject: 'math', strand: 'Operations, Relations and Properties', grades: ['form1', 'form2'], title: 'Operations with Directed Numbers', objective: 'Add, subtract, multiply and divide positive and negative numbers.', bloom: 'apply', difficulty: 4, standards: ['GY-MATH-OP1'] },

  // ── Mathematics · Fractions, Decimals and Percentages ──
  { subject: 'math', strand: 'Fractions, Decimals and Percentages', grades: ['grade3', 'grade4'], title: 'Introducing Fractions', objective: 'Name, write and compare simple fractions of a shape and of a set.', bloom: 'understand', difficulty: 2, standards: ['GY-MATH-FD1'] },
  { subject: 'math', strand: 'Fractions, Decimals and Percentages', grades: ['grade4', 'grade5'], title: 'Equivalent Fractions', objective: 'Generate equivalent fractions, simplify, and compare fractions with unlike denominators.', bloom: 'understand', difficulty: 3, standards: ['GY-MATH-FD1'] },
  { subject: 'math', strand: 'Fractions, Decimals and Percentages', grades: ['grade5', 'grade6'], title: 'Adding and Subtracting Fractions', objective: 'Add and subtract fractions with unlike denominators by finding a common denominator.', bloom: 'apply', difficulty: 4, standards: ['GY-MATH-FD1'] },
  { subject: 'math', strand: 'Fractions, Decimals and Percentages', grades: ['grade5', 'grade6'], title: 'Decimals to Hundredths', objective: 'Read, order and calculate with decimals to two places.', bloom: 'apply', difficulty: 4, standards: ['GY-MATH-FD2'] },
  { subject: 'math', strand: 'Fractions, Decimals and Percentages', grades: ['grade6', 'form1'], title: 'Percentages, Ratio and Proportion', objective: 'Convert between fractions, decimals and percentages and solve ratio problems.', bloom: 'apply', difficulty: 5, standards: ['GY-MATH-FD2', 'GY-MATH-FD3'] },
  { subject: 'math', strand: 'Fractions, Decimals and Percentages', grades: ['form2', 'form3'], title: 'Percentage Change in Context', objective: 'Solve multi-step problems involving percentage increase, decrease and proportion.', bloom: 'analyze', difficulty: 5, standards: ['GY-MATH-FD3'] },

  // ── Mathematics · Measurement ──
  { subject: 'math', strand: 'Measurement', grades: ['nursery1', 'nursery2'], title: 'Comparing Size and Length', objective: 'Compare objects as longer, shorter, heavier or lighter and order them.', bloom: 'understand', difficulty: 1, standards: ['GY-MATH-ME1'] },
  { subject: 'math', strand: 'Measurement', grades: ['grade1', 'grade2'], title: 'Measuring Length and Mass', objective: 'Measure length in centimetres and metres and mass in grams and kilograms.', bloom: 'apply', difficulty: 2, standards: ['GY-MATH-ME1'] },
  { subject: 'math', strand: 'Measurement', grades: ['grade2', 'grade3'], title: 'Telling Time', objective: 'Tell and write time to five minutes and solve simple problems about duration.', bloom: 'apply', difficulty: 2, standards: ['GY-MATH-ME1'] },
  { subject: 'math', strand: 'Measurement', grades: ['grade3', 'grade4'], title: 'Money and Shopping', objective: 'Add and subtract amounts in Guyana dollars and work out change.', bloom: 'apply', difficulty: 3, standards: ['GY-MATH-ME1'] },
  { subject: 'math', strand: 'Measurement', grades: ['grade4', 'grade5'], title: 'Perimeter and Area', objective: 'Find the perimeter and area of rectangles and of shapes made from rectangles.', bloom: 'apply', difficulty: 3, standards: ['GY-MATH-ME2'] },
  { subject: 'math', strand: 'Measurement', grades: ['grade5', 'grade6'], title: 'Volume and Capacity', objective: 'Find the volume of a cuboid and convert between millilitres and litres.', bloom: 'apply', difficulty: 4, standards: ['GY-MATH-ME2'] },
  { subject: 'math', strand: 'Measurement', grades: ['form1', 'form2'], title: 'Metric Conversions and Compound Measures', objective: 'Convert between metric units and work with rates such as speed and density.', bloom: 'apply', difficulty: 4, standards: ['GY-MATH-ME1'] },
  { subject: 'math', strand: 'Measurement', grades: ['form3', 'form4'], title: 'Area and Volume of Composite Figures', objective: 'Find the area and volume of composite shapes, circles, prisms and cylinders.', bloom: 'analyze', difficulty: 5, standards: ['GY-MATH-ME2'] },

  // ── Mathematics · Geometry ──
  { subject: 'math', strand: 'Geometry', grades: ['nursery1', 'nursery2'], title: 'Naming Shapes', objective: 'Name circles, squares, triangles and rectangles in any position.', bloom: 'remember', difficulty: 1, standards: ['GY-MATH-GE1'] },
  { subject: 'math', strand: 'Geometry', grades: ['grade1', 'grade2'], title: 'Plane Shapes and Solids', objective: 'Describe plane shapes and solids by their sides, corners and faces.', bloom: 'understand', difficulty: 2, standards: ['GY-MATH-GE1'] },
  { subject: 'math', strand: 'Geometry', grades: ['grade3', 'grade4'], title: 'Lines, Angles and Symmetry', objective: 'Identify lines, right angles and lines of symmetry in shapes around them.', bloom: 'understand', difficulty: 3, standards: ['GY-MATH-GE2'] },
  { subject: 'math', strand: 'Geometry', grades: ['grade5', 'grade6'], title: 'Properties of Polygons', objective: 'Classify triangles and quadrilaterals and use angle facts to find missing angles.', bloom: 'apply', difficulty: 4, standards: ['GY-MATH-GE1'] },
  { subject: 'math', strand: 'Geometry', grades: ['form1', 'form2'], title: 'Angles, Parallel Lines and Constructions', objective: 'Use angle relationships in parallel lines and construct shapes with ruler and compasses.', bloom: 'apply', difficulty: 4, standards: ['GY-MATH-GE2'] },
  { subject: 'math', strand: 'Geometry', grades: ['form3', 'form4'], title: 'Pythagoras and Trigonometric Ratios', objective: 'Apply Pythagoras’ theorem and the sine, cosine and tangent ratios to right triangles.', bloom: 'analyze', difficulty: 5, standards: ['GY-MATH-GE2'] },

  // ── Mathematics · Statistics and Graphs ──
  { subject: 'math', strand: 'Statistics and Graphs', grades: ['grade2', 'grade3'], title: 'Pictographs and Bar Graphs', objective: 'Read a pictograph and a bar graph and answer questions about the data.', bloom: 'understand', difficulty: 2, standards: ['GY-MATH-SG1'] },
  { subject: 'math', strand: 'Statistics and Graphs', grades: ['grade4', 'grade5'], title: 'Tallies, Tables and Graphs', objective: 'Collect data with a tally, organise it in a table and draw a bar graph.', bloom: 'apply', difficulty: 3, standards: ['GY-MATH-SG1'] },
  { subject: 'math', strand: 'Statistics and Graphs', grades: ['grade5', 'grade6'], title: 'Mean, Median and Mode', objective: 'Calculate the mean, median and mode of a small data set and say what each shows.', bloom: 'apply', difficulty: 4, standards: ['GY-MATH-SG2'] },
  { subject: 'math', strand: 'Statistics and Graphs', grades: ['form1', 'form2'], title: 'Collecting and Displaying Data', objective: 'Design a data collection sheet and present results in an appropriate chart.', bloom: 'apply', difficulty: 4, standards: ['GY-MATH-SG1'] },
  { subject: 'math', strand: 'Statistics and Graphs', grades: ['form3', 'form4'], title: 'Spread and Probability', objective: 'Describe the spread of a data set and calculate simple and combined probabilities.', bloom: 'analyze', difficulty: 5, standards: ['GY-MATH-SG2'] },

  // ── Mathematics · Algebra ──
  { subject: 'math', strand: 'Algebra', grades: ['form1', 'form2'], title: 'Algebraic Expressions', objective: 'Write, simplify and substitute into algebraic expressions.', bloom: 'understand', difficulty: 3, standards: ['GY-MATH-AL1'] },
  { subject: 'math', strand: 'Algebra', grades: ['form2', 'form3'], title: 'Solving Linear Equations', objective: 'Solve linear equations and inequalities in one unknown and check the solution.', bloom: 'apply', difficulty: 4, standards: ['GY-MATH-AL2'] },
  { subject: 'math', strand: 'Algebra', grades: ['form3', 'form4'], title: 'Linear Graphs and Relations', objective: 'Draw and interpret linear graphs and find gradient and intercept.', bloom: 'analyze', difficulty: 4, standards: ['GY-MATH-AL2'] },
  { subject: 'math', strand: 'Algebra', grades: ['form4', 'form5'], title: 'Simultaneous and Quadratic Equations', objective: 'Solve simultaneous linear equations and factorise and solve quadratics.', bloom: 'analyze', difficulty: 5, standards: ['GY-MATH-AL2'] },

  // ── Mathematics · Consumer Arithmetic ──
  { subject: 'math', strand: 'Consumer Arithmetic', grades: ['form2', 'form3'], title: 'Money, Wages and Bills', objective: 'Calculate wages, salaries and utility bills and check a bill for errors.', bloom: 'apply', difficulty: 3, standards: ['GY-MATH-CA1'] },
  { subject: 'math', strand: 'Consumer Arithmetic', grades: ['form4', 'form5'], title: 'Discount, Interest and Hire Purchase', objective: 'Solve problems involving discount, simple and compound interest and hire purchase.', bloom: 'analyze', difficulty: 5, standards: ['GY-MATH-CA1'] },

  // ── English Language · Listening and Speaking ──
  { subject: 'english', strand: 'Listening and Speaking', grades: ['nursery1', 'nursery2'], title: 'Listening and Responding', objective: 'Listen to a short story or instruction and respond appropriately.', bloom: 'understand', difficulty: 1, standards: ['GY-ENG-LS1'] },
  { subject: 'english', strand: 'Listening and Speaking', grades: ['grade1', 'grade2'], title: 'Speaking in Full Sentences', objective: 'Answer a question in a complete, clearly spoken sentence.', bloom: 'apply', difficulty: 2, standards: ['GY-ENG-LS2'] },
  { subject: 'english', strand: 'Listening and Speaking', grades: ['grade3', 'grade4'], title: 'Retelling and Reporting', objective: 'Retell an event in order and report information clearly to the class.', bloom: 'apply', difficulty: 3, standards: ['GY-ENG-LS2'] },
  { subject: 'english', strand: 'Listening and Speaking', grades: ['grade5', 'grade6'], title: 'Speaking in Standard English', objective: 'Move between Creolese and Standard English according to audience and purpose.', bloom: 'analyze', difficulty: 4, standards: ['GY-ENG-LS2'] },
  { subject: 'english', strand: 'Listening and Speaking', grades: ['form1', 'form2', 'form3'], title: 'Presentation and Discussion', objective: 'Present a prepared talk and take part in a structured discussion.', bloom: 'analyze', difficulty: 4, standards: ['GY-ENG-LS2'] },

  // ── English Language · Reading and Comprehension ──
  { subject: 'english', strand: 'Reading and Comprehension', grades: ['nursery1', 'nursery2'], title: 'Letter Sounds and Rhyme', objective: 'Match each letter to its most common sound and hear rhyme in words.', bloom: 'remember', difficulty: 1, standards: ['GY-ENG-RC1'] },
  { subject: 'english', strand: 'Reading and Comprehension', grades: ['grade1'], title: 'Blending and Decoding', objective: 'Blend sounds to read simple consonant-vowel-consonant words.', bloom: 'apply', difficulty: 2, standards: ['GY-ENG-RC1'] },
  { subject: 'english', strand: 'Reading and Comprehension', grades: ['grade1', 'grade2'], title: 'Sight Words and Simple Texts', objective: 'Read high-frequency words on sight and read a simple text with support.', bloom: 'apply', difficulty: 2, standards: ['GY-ENG-RC1'] },
  { subject: 'english', strand: 'Reading and Comprehension', grades: ['grade2', 'grade3'], title: 'Reading Fluency', objective: 'Read grade-level text accurately, at a steady pace and with expression.', bloom: 'apply', difficulty: 3, standards: ['GY-ENG-RC1'] },
  { subject: 'english', strand: 'Reading and Comprehension', grades: ['grade3', 'grade4'], title: 'Main Idea and Supporting Detail', objective: 'Identify the main idea of a passage and the details that support it.', bloom: 'analyze', difficulty: 3, standards: ['GY-ENG-RC2'] },
  { subject: 'english', strand: 'Reading and Comprehension', grades: ['grade4', 'grade5'], title: 'Sequence, Cause and Effect', objective: 'Follow the sequence of a text and explain what caused an event in it.', bloom: 'analyze', difficulty: 4, standards: ['GY-ENG-RC2'] },
  { subject: 'english', strand: 'Reading and Comprehension', grades: ['grade5', 'grade6'], title: 'Inference and Figurative Language', objective: 'Draw an inference from a text and interpret similes, metaphors and idioms.', bloom: 'analyze', difficulty: 4, standards: ['GY-ENG-RC3'] },
  { subject: 'english', strand: 'Reading and Comprehension', grades: ['form1', 'form2'], title: 'Comprehension of Longer Texts', objective: 'Answer literal, inferential and evaluative questions on an extended passage.', bloom: 'analyze', difficulty: 4, standards: ['GY-ENG-RC2'] },
  { subject: 'english', strand: 'Reading and Comprehension', grades: ['form3', 'form4'], title: 'Summary Writing', objective: 'Reduce a passage to its main points in your own words within a word limit.', bloom: 'analyze', difficulty: 5, standards: ['GY-ENG-RC2'] },
  { subject: 'english', strand: 'Reading and Comprehension', grades: ['form4', 'form5'], title: 'Analysing Argument and Register', objective: 'Analyse a writer’s purpose, tone and register and evaluate the argument made.', bloom: 'analyze', difficulty: 5, standards: ['GY-ENG-RC3'] },

  // ── English Language · Writing and Composition ──
  { subject: 'english', strand: 'Writing and Composition', grades: ['nursery1', 'nursery2'], title: 'Letter Formation', objective: 'Form letters correctly and write your own name.', bloom: 'apply', difficulty: 1, standards: ['GY-ENG-WC1'] },
  { subject: 'english', strand: 'Writing and Composition', grades: ['grade1', 'grade2'], title: 'Writing Sentences', objective: 'Write a complete sentence with a capital letter and an end mark.', bloom: 'apply', difficulty: 2, standards: ['GY-ENG-WC1'] },
  { subject: 'english', strand: 'Writing and Composition', grades: ['grade2', 'grade3'], title: 'Writing a Paragraph', objective: 'Write a paragraph with a topic sentence, supporting detail and a closing.', bloom: 'apply', difficulty: 3, standards: ['GY-ENG-WC1'] },
  { subject: 'english', strand: 'Writing and Composition', grades: ['grade3', 'grade4'], title: 'Narrative Writing', objective: 'Write a story with a clear beginning, middle and end and descriptive detail.', bloom: 'apply', difficulty: 3, standards: ['GY-ENG-WC2'] },
  { subject: 'english', strand: 'Writing and Composition', grades: ['grade4', 'grade5'], title: 'Descriptive Writing', objective: 'Describe a place or person in Guyana using precise, sensory language.', bloom: 'apply', difficulty: 4, standards: ['GY-ENG-WC2'] },
  { subject: 'english', strand: 'Writing and Composition', grades: ['grade5', 'grade6'], title: 'Expository Writing', objective: 'Write an informative piece that explains a topic clearly and in order.', bloom: 'apply', difficulty: 4, standards: ['GY-ENG-WC2'] },
  { subject: 'english', strand: 'Writing and Composition', grades: ['form1', 'form2'], title: 'Planning, Drafting and Editing', objective: 'Plan, draft, revise and proofread an extended piece of writing.', bloom: 'analyze', difficulty: 4, standards: ['GY-ENG-WC3'] },
  { subject: 'english', strand: 'Writing and Composition', grades: ['form3', 'form4', 'form5'], title: 'Persuasive and Argument Writing', objective: 'Write an argument that states a position, supports it and answers the other side.', bloom: 'analyze', difficulty: 5, standards: ['GY-ENG-WC2'] },

  // ── English Language · Grammar and Mechanics ──
  { subject: 'english', strand: 'Grammar and Mechanics', grades: ['grade1', 'grade2'], title: 'Nouns and Verbs', objective: 'Identify nouns and verbs and use them correctly in a sentence.', bloom: 'remember', difficulty: 1, standards: ['GY-ENG-GM1'] },
  { subject: 'english', strand: 'Grammar and Mechanics', grades: ['grade3', 'grade4'], title: 'Sentence Types and Punctuation', objective: 'Punctuate statements, questions and exclamations correctly.', bloom: 'apply', difficulty: 3, standards: ['GY-ENG-GM2'] },
  { subject: 'english', strand: 'Grammar and Mechanics', grades: ['grade4', 'grade5'], title: 'Subject-Verb Agreement', objective: 'Make subjects and verbs agree in simple and compound sentences.', bloom: 'apply', difficulty: 3, standards: ['GY-ENG-GM1'] },
  { subject: 'english', strand: 'Grammar and Mechanics', grades: ['grade5', 'grade6'], title: 'Tense and Consistency', objective: 'Use tense consistently across a piece of writing and correct shifts.', bloom: 'apply', difficulty: 4, standards: ['GY-ENG-GM1'] },
  { subject: 'english', strand: 'Grammar and Mechanics', grades: ['form1', 'form2', 'form3'], title: 'Clauses and Sentence Variety', objective: 'Combine clauses to vary sentence structure and punctuate them correctly.', bloom: 'analyze', difficulty: 4, standards: ['GY-ENG-GM2'] },

  // ── English Language · Vocabulary and Spelling ──
  { subject: 'english', strand: 'Vocabulary and Spelling', grades: ['grade1', 'grade2'], title: 'High-Frequency Words', objective: 'Read and spell the most common words on sight.', bloom: 'remember', difficulty: 1, standards: ['GY-ENG-VS1'] },
  { subject: 'english', strand: 'Vocabulary and Spelling', grades: ['grade3', 'grade4'], title: 'Spelling Patterns', objective: 'Apply common spelling patterns and plural and tense rules.', bloom: 'apply', difficulty: 3, standards: ['GY-ENG-VS1'] },
  { subject: 'english', strand: 'Vocabulary and Spelling', grades: ['grade4', 'grade5'], title: 'Context Clues', objective: 'Work out the meaning of an unknown word from the surrounding text.', bloom: 'apply', difficulty: 3, standards: ['GY-ENG-VS2'] },
  { subject: 'english', strand: 'Vocabulary and Spelling', grades: ['grade5', 'grade6'], title: 'Roots, Prefixes and Suffixes', objective: 'Use word parts to work out the meaning of unfamiliar words.', bloom: 'apply', difficulty: 4, standards: ['GY-ENG-VS2'] },
  { subject: 'english', strand: 'Vocabulary and Spelling', grades: ['form1', 'form2', 'form3'], title: 'Subject and Academic Vocabulary', objective: 'Acquire and use academic and subject vocabulary precisely.', bloom: 'analyze', difficulty: 4, standards: ['GY-ENG-VS2'] },

  // ── Science · Living Things ──
  { subject: 'science', strand: 'Living Things', grades: ['grade1', 'grade2'], title: 'Living and Non-Living', objective: 'Sort things into living and non-living and give reasons for the sort.', bloom: 'understand', difficulty: 1, standards: ['GY-SCI-LT1'] },
  { subject: 'science', strand: 'Living Things', grades: ['grade3', 'grade4'], title: 'Classifying Plants and Animals', objective: 'Group plants and animals by observable features and name their parts.', bloom: 'understand', difficulty: 2, standards: ['GY-SCI-LT1'] },
  { subject: 'science', strand: 'Living Things', grades: ['grade4', 'grade5'], title: 'Life Cycles and Habitats', objective: 'Describe the life cycle of a plant and an animal and the habitat each needs.', bloom: 'understand', difficulty: 3, standards: ['GY-SCI-LT2'] },
  { subject: 'science', strand: 'Living Things', grades: ['grade5', 'grade6'], title: 'Adaptation in Guyana’s Habitats', objective: 'Explain how plants and animals are adapted to rainforest, savannah and coastal habitats.', bloom: 'analyze', difficulty: 4, standards: ['GY-SCI-LT2'] },
  { subject: 'science', strand: 'Living Things', grades: ['form1', 'form2'], title: 'Cells as the Unit of Life', objective: 'Describe plant and animal cells and the job each part does.', bloom: 'understand', difficulty: 4, standards: ['GY-SCI-LT3'] },
  { subject: 'science', strand: 'Living Things', grades: ['form2', 'form3'], title: 'Photosynthesis and Nutrition', objective: 'Explain how plants make food and how organisms obtain energy.', bloom: 'analyze', difficulty: 5, standards: ['GY-SCI-LT3'] },
  { subject: 'science', strand: 'Living Things', grades: ['form4', 'form5'], title: 'Ecosystems and Energy Flow', objective: 'Model food chains, food webs and the cycling of matter in an ecosystem.', bloom: 'analyze', difficulty: 5, standards: ['GY-SCI-LT2'] },

  // ── Science · The Human Body and Health ──
  { subject: 'science', strand: 'The Human Body and Health', grades: ['grade1', 'grade2'], title: 'The Senses', objective: 'Name the five senses and the body part used for each.', bloom: 'remember', difficulty: 1, standards: ['GY-SCI-HB1'] },
  { subject: 'science', strand: 'The Human Body and Health', grades: ['grade3', 'grade4'], title: 'Food and Healthy Eating', objective: 'Group local foods by nutrient and plan a balanced meal.', bloom: 'apply', difficulty: 2, standards: ['GY-SCI-HB2'] },
  { subject: 'science', strand: 'The Human Body and Health', grades: ['grade5', 'grade6'], title: 'Body Systems', objective: 'Describe the digestive, circulatory and respiratory systems and what each does.', bloom: 'understand', difficulty: 4, standards: ['GY-SCI-HB1'] },
  { subject: 'science', strand: 'The Human Body and Health', grades: ['form1', 'form2'], title: 'Digestion, Circulation and Respiration', objective: 'Explain how the body breaks down food and transports oxygen and nutrients.', bloom: 'analyze', difficulty: 4, standards: ['GY-SCI-HB1'] },
  { subject: 'science', strand: 'The Human Body and Health', grades: ['form3', 'form4'], title: 'Disease, Immunity and Public Health', objective: 'Explain how disease spreads and how vaccination and hygiene prevent it.', bloom: 'analyze', difficulty: 5, standards: ['GY-SCI-HB2'] },

  // ── Science · Matter and Materials ──
  { subject: 'science', strand: 'Matter and Materials', grades: ['grade1', 'grade2'], title: 'Properties of Materials', objective: 'Describe and sort materials by properties such as hard, soft, rough and smooth.', bloom: 'understand', difficulty: 1, standards: ['GY-SCI-MM1'] },
  { subject: 'science', strand: 'Matter and Materials', grades: ['grade3', 'grade4'], title: 'Solids, Liquids and Gases', objective: 'Describe the three states of matter and give examples of each.', bloom: 'understand', difficulty: 2, standards: ['GY-SCI-MM1'] },
  { subject: 'science', strand: 'Matter and Materials', grades: ['grade5', 'grade6'], title: 'Changes of State and Mixtures', objective: 'Explain melting, evaporation and condensation, and separate simple mixtures.', bloom: 'apply', difficulty: 4, standards: ['GY-SCI-MM2'] },
  { subject: 'science', strand: 'Matter and Materials', grades: ['form1', 'form2'], title: 'Elements, Compounds and Mixtures', objective: 'Distinguish elements, compounds and mixtures and give examples of each.', bloom: 'understand', difficulty: 4, standards: ['GY-SCI-MM1'] },
  { subject: 'science', strand: 'Matter and Materials', grades: ['form3', 'form4'], title: 'Separation and Chemical Change', objective: 'Choose a separation technique for a mixture and identify a chemical change.', bloom: 'analyze', difficulty: 5, standards: ['GY-SCI-MM2'] },

  // ── Science · Energy and Forces ──
  { subject: 'science', strand: 'Energy and Forces', grades: ['grade3', 'grade4'], title: 'Pushes, Pulls and Movement', objective: 'Describe how pushes and pulls change the movement of an object.', bloom: 'understand', difficulty: 2, standards: ['GY-SCI-EF2'] },
  { subject: 'science', strand: 'Energy and Forces', grades: ['grade5', 'grade6'], title: 'Light, Sound and Simple Machines', objective: 'Explain how light and sound travel and how simple machines make work easier.', bloom: 'apply', difficulty: 4, standards: ['GY-SCI-EF2'] },
  { subject: 'science', strand: 'Energy and Forces', grades: ['form1', 'form2'], title: 'Forms of Energy and Energy Transfer', objective: 'Identify forms of energy and trace transfers through a system.', bloom: 'analyze', difficulty: 4, standards: ['GY-SCI-EF1'] },
  { subject: 'science', strand: 'Energy and Forces', grades: ['form3', 'form4'], title: 'Forces, Motion and Electricity', objective: 'Investigate how force affects motion and build and describe simple circuits.', bloom: 'analyze', difficulty: 5, standards: ['GY-SCI-EF2'] },

  // ── Science · Earth and Environment ──
  { subject: 'science', strand: 'Earth and Environment', grades: ['grade1', 'grade2'], title: 'Weather and the Seasons', objective: 'Record daily weather and describe Guyana’s wet and dry seasons.', bloom: 'understand', difficulty: 1, standards: ['GY-SCI-EE1'] },
  { subject: 'science', strand: 'Earth and Environment', grades: ['grade3', 'grade4'], title: 'Water and the Water Cycle', objective: 'Describe the water cycle and where the water in a community comes from.', bloom: 'understand', difficulty: 3, standards: ['GY-SCI-EE1'] },
  { subject: 'science', strand: 'Earth and Environment', grades: ['grade5', 'grade6'], title: 'Guyana’s Natural Environment', objective: 'Describe Guyana’s rainforest, savannah, rivers and coastal plain and why they matter.', bloom: 'analyze', difficulty: 4, standards: ['GY-SCI-EE1'] },
  { subject: 'science', strand: 'Earth and Environment', grades: ['form1', 'form2'], title: 'Conservation and Pollution', objective: 'Explain the causes of pollution and evaluate ways to conserve resources.', bloom: 'analyze', difficulty: 4, standards: ['GY-SCI-EE2'] },
  { subject: 'science', strand: 'Earth and Environment', grades: ['form3', 'form4'], title: 'Climate, Flooding and Sea Defence', objective: 'Explain why Guyana’s coast floods and evaluate the sea defence response.', bloom: 'analyze', difficulty: 5, standards: ['GY-SCI-EE2'] },

  // ── Science · Working Scientifically ──
  { subject: 'science', strand: 'Working Scientifically', grades: ['grade3', 'grade4'], title: 'Observing and Recording', objective: 'Make careful observations and record them in a table or drawing.', bloom: 'apply', difficulty: 2, standards: ['GY-SCI-WS1'] },
  { subject: 'science', strand: 'Working Scientifically', grades: ['grade5', 'grade6'], title: 'Measuring in Metric Units', objective: 'Measure length, mass, volume and temperature accurately and convert units.', bloom: 'apply', difficulty: 3, standards: ['GY-SCI-WS1'] },
  { subject: 'science', strand: 'Working Scientifically', grades: ['form1', 'form2', 'form3'], title: 'Planning a Fair Test', objective: 'Identify variables, plan a fair test and draw a conclusion from the evidence.', bloom: 'analyze', difficulty: 4, standards: ['GY-SCI-WS2'] },

  // ── Social Studies · Our Country Guyana ──
  { subject: 'social', strand: 'Our Country Guyana', grades: ['grade3', 'grade4'], title: 'The Ten Regions', objective: 'Locate Guyana’s ten regions and name the main town in each.', bloom: 'remember', difficulty: 2, standards: ['GY-SOC-CG1'] },
  { subject: 'social', strand: 'Our Country Guyana', grades: ['grade4', 'grade5'], title: 'Rivers, Coast and Hinterland', objective: 'Describe Guyana’s main rivers and the difference between coast and hinterland.', bloom: 'understand', difficulty: 3, standards: ['GY-SOC-CG1'] },
  { subject: 'social', strand: 'Our Country Guyana', grades: ['grade5', 'grade6'], title: 'Peoples and Cultures of Guyana', objective: 'Describe the six peoples of Guyana and the festivals and foods they share.', bloom: 'understand', difficulty: 3, standards: ['GY-SOC-CG2'] },
  { subject: 'social', strand: 'Our Country Guyana', grades: ['form1', 'form2'], title: 'National Symbols and Identity', objective: 'Explain the meaning of Guyana’s national symbols, motto and pledge.', bloom: 'analyze', difficulty: 4, standards: ['GY-SOC-CG2'] },

  // ── Social Studies · Our Heritage and History ──
  { subject: 'social', strand: 'Our Heritage and History', grades: ['grade3', 'grade4'], title: 'The Indigenous Peoples', objective: 'Describe the nine indigenous peoples of Guyana and how they live.', bloom: 'understand', difficulty: 2, standards: ['GY-SOC-HH1'] },
  { subject: 'social', strand: 'Our Heritage and History', grades: ['grade4', 'grade5'], title: 'Colonisation and the Plantation', objective: 'Explain Dutch and British settlement and life on the sugar plantation.', bloom: 'understand', difficulty: 3, standards: ['GY-SOC-HH2'] },
  { subject: 'social', strand: 'Our Heritage and History', grades: ['grade5', 'grade6'], title: 'Emancipation and Indentureship', objective: 'Explain emancipation in 1838 and the indentureship that followed.', bloom: 'analyze', difficulty: 4, standards: ['GY-SOC-HH2'] },
  { subject: 'social', strand: 'Our Heritage and History', grades: ['grade6', 'form1'], title: 'The Road to Independence', objective: 'Trace the steps to independence in 1966 and republic status in 1970.', bloom: 'analyze', difficulty: 4, standards: ['GY-SOC-HH2'] },
  { subject: 'social', strand: 'Our Heritage and History', grades: ['form2', 'form3'], title: 'Building the Nation since 1966', objective: 'Describe the main developments in Guyana since independence.', bloom: 'analyze', difficulty: 5, standards: ['GY-SOC-HH2'] },
  { subject: 'social', strand: 'Our Heritage and History', grades: ['form4', 'form5'], title: 'Using Historical Sources', objective: 'Evaluate primary and secondary sources and explain cause and consequence.', bloom: 'analyze', difficulty: 5, standards: ['GY-SOC-HH3'] },

  // ── Social Studies · Geography and Environment ──
  { subject: 'social', strand: 'Geography and Environment', grades: ['grade3', 'grade4'], title: 'Map Skills', objective: 'Use scale, key and compass directions to answer questions from a map.', bloom: 'apply', difficulty: 2, standards: ['GY-SOC-GE1'] },
  { subject: 'social', strand: 'Geography and Environment', grades: ['grade5', 'grade6'], title: 'Landforms, Climate and Settlement', objective: 'Explain how landforms and climate shape where people live in Guyana.', bloom: 'analyze', difficulty: 4, standards: ['GY-SOC-GE2'] },
  { subject: 'social', strand: 'Geography and Environment', grades: ['form1', 'form2'], title: 'Population and Migration', objective: 'Describe Guyana’s population distribution and the causes of migration.', bloom: 'analyze', difficulty: 4, standards: ['GY-SOC-GE2'] },
  { subject: 'social', strand: 'Geography and Environment', grades: ['form3', 'form4'], title: 'Sustainable Development', objective: 'Evaluate development choices against their environmental and social cost.', bloom: 'analyze', difficulty: 5, standards: ['GY-SOC-GE2'] },

  // ── Social Studies · Civics and Government ──
  { subject: 'social', strand: 'Civics and Government', grades: ['grade3', 'grade4'], title: 'Rules, Rights and Responsibilities', objective: 'Explain why rules exist and describe the rights and duties of a pupil.', bloom: 'understand', difficulty: 2, standards: ['GY-SOC-CV1'] },
  { subject: 'social', strand: 'Civics and Government', grades: ['grade5', 'grade6'], title: 'Local and National Government', objective: 'Describe what regional and national government each do for citizens.', bloom: 'understand', difficulty: 3, standards: ['GY-SOC-CV1'] },
  { subject: 'social', strand: 'Civics and Government', grades: ['form1', 'form2'], title: 'Democracy and the Rule of Law', objective: 'Explain elections, the branches of government and the rule of law.', bloom: 'analyze', difficulty: 4, standards: ['GY-SOC-CV2'] },
  { subject: 'social', strand: 'Civics and Government', grades: ['form3', 'form4'], title: 'Citizenship and Civic Action', objective: 'Evaluate how citizens can take action on an issue in their community.', bloom: 'analyze', difficulty: 5, standards: ['GY-SOC-CV2'] },

  // ── Social Studies · Resources and Economic Activity ──
  { subject: 'social', strand: 'Resources and Economic Activity', grades: ['grade4', 'grade5'], title: 'Guyana’s Natural Resources', objective: 'Name Guyana’s main natural resources and where each is found.', bloom: 'remember', difficulty: 3, standards: ['GY-SOC-RE1'] },
  { subject: 'social', strand: 'Resources and Economic Activity', grades: ['grade5', 'grade6'], title: 'Farming, Fishing, Mining and Forestry', objective: 'Describe Guyana’s main economic activities and the work people do in them.', bloom: 'understand', difficulty: 3, standards: ['GY-SOC-RE1'] },
  { subject: 'social', strand: 'Resources and Economic Activity', grades: ['form1', 'form2'], title: 'Industry, Trade and the Oil Economy', objective: 'Explain how oil, trade and industry are changing Guyana’s economy.', bloom: 'analyze', difficulty: 4, standards: ['GY-SOC-RE2'] },
  { subject: 'social', strand: 'Resources and Economic Activity', grades: ['form3', 'form4'], title: 'Work, Enterprise and Livelihoods', objective: 'Evaluate career and enterprise options and the skills each needs.', bloom: 'analyze', difficulty: 5, standards: ['GY-SOC-RE2'] },

  // ── Social Studies · The Caribbean and the Wider World ──
  { subject: 'social', strand: 'The Caribbean and the Wider World', grades: ['grade6', 'form1'], title: 'Guyana and the Caribbean', objective: 'Locate Guyana’s Caribbean neighbours and describe what they share.', bloom: 'understand', difficulty: 3, standards: ['GY-SOC-CW1'] },
  { subject: 'social', strand: 'The Caribbean and the Wider World', grades: ['form2', 'form3'], title: 'CARICOM and Regional Integration', objective: 'Explain what CARICOM does and how regional cooperation benefits Guyana.', bloom: 'analyze', difficulty: 4, standards: ['GY-SOC-CW2'] },
  { subject: 'social', strand: 'The Caribbean and the Wider World', grades: ['form4', 'form5'], title: 'Guyana in the Global Economy', objective: 'Evaluate Guyana’s trade and diplomatic links beyond the Caribbean.', bloom: 'analyze', difficulty: 5, standards: ['GY-SOC-CW2'] },
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
    // A module can only be taught if the grade offers that subject.
    const offered = gradeById(grade)?.subjects ?? [];
    const forGrade = SEEDS.filter(s => s.grades.includes(grade) && offered.includes(s.subject));

    // Group by strand so sequence numbers run per subject and strand.
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

/** Every module for every year of schooling. Built once at import; deterministic. */
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

/**
 * The teaching pathway for one strand: the modules from `backGrades` years below
 * the pupil's grade up to their own grade, in teaching order.
 *
 * A plan teaches at the instructional level, not the enrolled level. A Grade 6
 * pupil sitting at 30% in Number Concepts needs the Grade 4 and Grade 5 modules
 * of that strand before the Grade 6 one, and this is the ladder that provides
 * them. Where a strand only appears at the pupil's own grade the pathway is just
 * that grade's modules.
 */
export function strandPathway(
  grade: string,
  subject: string,
  strand: string,
  backGrades = 2,
): CurriculumModule[] {
  const gi = GRADE_ORDER.indexOf(grade);
  if (gi === -1) return [];
  const from = Math.max(0, gi - backGrades);

  // A module taught across several years exists once per year. On a pathway the
  // pupil should meet that lesson once, at the earliest year it appears — that is
  // the instructional entry point.
  const pathway: CurriculumModule[] = [];
  const seen = new Set<string>();
  for (let g = from; g <= gi; g++) {
    for (const mod of modulesForStrand(GRADE_ORDER[g], subject, strand)) {
      if (seen.has(mod.title)) continue;
      seen.add(mod.title);
      pathway.push(mod);
    }
  }
  return pathway;
}

export function getModule(id: string): CurriculumModule | undefined {
  return CURRICULUM.find(m => m.id === id);
}

/** Distinct `subject::strand` pairs taught at a grade. */
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
