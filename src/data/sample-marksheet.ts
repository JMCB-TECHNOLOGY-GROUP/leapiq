/**
 * A term's mark sheet for one Grade 6 class at a hinterland primary school in
 * Region 8, in the shape schools actually export it: mixed date formats, a
 * missing maximum, a subject outside the four core areas, and a strand spelled
 * differently from the curriculum guide. The importer reports each of those
 * rather than silently guessing.
 *
 * Grade 6 pupils sit the National Grade Six Assessment, so these baselines are
 * the ones that matter most for placement.
 */
export const SAMPLE_MARKSHEET = `Student ID,Student Name,Year,Subject,Domain,Assessment,Date,Marks,Out Of
G6-001,Anaya Persaud,Grade 6,Mathematics,Number Concepts,Term 1 Diagnostic,2026-01-14,11,40
G6-001,Anaya Persaud,Grade 6,Mathematics,Number Concept,Fractions Check,2026-02-11,14,40
G6-001,Anaya Persaud,Grade 6,Mathematics,Geometry,Term 1 Diagnostic,2026-01-14,22,40
G6-001,Anaya Persaud,Grade 6,English Language,Reading and Comprehension,Term 1 Diagnostic,2026-01-15,18,50
G6-001,Anaya Persaud,Grade 6,English Language,Vocabulary and Spelling,Word Study Check,2026-02-12,31,50
G6-001,Anaya Persaud,Grade 6,Science,Living Things,Term 1 Diagnostic,2026-01-16,29,40
G6-002,Devon Chase,Grade 6,Mathematics,Number Concepts,Term 1 Diagnostic,2026-01-14,31,40
G6-002,Devon Chase,Grade 6,Mathematics,Measurement,Term 1 Diagnostic,2026-01-14,17,40
G6-002,Devon Chase,Grade 6,Mathematics,Measurement,Volume and Capacity Check,14/02/2026,21,40
G6-002,Devon Chase,Grade 6,English Language,Reading and Comprehension,Term 1 Diagnostic,2026-01-15,36,50
G6-002,Devon Chase,Grade 6,English Language,Writing and Composition,Extended Task,2026-02-20,24,50
G6-002,Devon Chase,Grade 6,Social Studies,Our Heritage and History,Term 1 Diagnostic,2026-01-16,15,40
G6-003,Onika Fredericks,Grade 6,Mathematics,Number Concepts,Term 1 Diagnostic,2026-01-14,26,40
G6-003,Onika Fredericks,Grade 6,Mathematics,Statistics and Graphs,Term 1 Diagnostic,2026-01-14,14,40
G6-003,Onika Fredericks,Grade 6,English Language,Reading and Comprehension,Term 1 Diagnostic,2026-01-15,21,50
G6-003,Onika Fredericks,Grade 6,English Language,Grammar and Mechanics,Punctuation Check,2026-02-18,26,50
G6-003,Onika Fredericks,Grade 6,Science,Earth and Environment,Term 1 Diagnostic,2026-01-16,33,40
G6-003,Onika Fredericks,Grade 6,Music,Performance,Term 1 Recital,2026-01-20,18,25
G6-004,Rajiv Sammy,Grade 6,Mathematics,Number Concepts,Term 1 Diagnostic,2026-01-14,36,40
G6-004,Rajiv Sammy,Grade 6,Mathematics,Geometry,Term 1 Diagnostic,2026-01-14,34,40
G6-004,Rajiv Sammy,Grade 6,English Language,Reading and Comprehension,Term 1 Diagnostic,2026-01-15,44,50
G6-004,Rajiv Sammy,Grade 6,English Language,Writing and Composition,Extended Task,2026-02-20,19,50
G6-004,Rajiv Sammy,Grade 6,Social Studies,Our Country Guyana,Term 1 Diagnostic,2026-01-16,35,40
G6-005,Shanice Bourne,Grade 6,Mathematics,Number Concepts,Term 1 Diagnostic,2026-01-14,19,40
G6-005,Shanice Bourne,Grade 6,Mathematics,Fractions Decimals and Percentages,Fractions Check,2026-02-25,16,40
G6-005,Shanice Bourne,Grade 6,English Language,Reading and Comprehension,Term 1 Diagnostic,2026-01-15,23,50
G6-005,Shanice Bourne,Grade 6,English Language,Vocabulary and Spelling,Word Study Check,2026-02-12,27,
G6-005,Shanice Bourne,Grade 6,Science,Matter and Materials,Term 1 Diagnostic,2026-01-16,18,40
G6-005,Shanice Bourne,Grade 6,Social Studies,Geography and Environment,Map Skills Check,2026-02-05,17,40
`;
