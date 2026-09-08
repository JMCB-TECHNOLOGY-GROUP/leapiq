/**
 * Guyana's education structure, as the Ministry of Education runs it.
 *
 * Nursery (2 years) → Primary (Grades 1-6, ending with the NGSA) → Secondary
 * (Forms 1-5, i.e. Grades 7-11, ending with CSEC). The system is administered
 * through eleven education districts: the ten administrative regions plus
 * Georgetown as District 11.
 *
 * Sources: Ministry of Education Guyana, School Education System; Guyana
 * Education Sector Plan 2021-2025.
 */

export type Stage = 'nursery' | 'primary' | 'lower secondary' | 'upper secondary';

export interface GuyanaGrade {
  id: string;
  label: string;
  /** Short form used in mark sheets and rosters, e.g. "G6", "F3". */
  short: string;
  stage: Stage;
  ages: string;
  /** National assessment sat at the end of this year, if any. */
  assessment?: string;
  /** Questions per practice session, scaled to attention span. */
  qCount: number;
  subjects: string[];
}

/** Every year of schooling, in order. Drives prerequisite chaining. */
export const GUYANA_GRADES: GuyanaGrade[] = [
  { id: 'nursery1', label: 'Nursery Year 1', short: 'N1', stage: 'nursery', ages: '3-4', qCount: 5, subjects: ['math', 'english'] },
  { id: 'nursery2', label: 'Nursery Year 2', short: 'N2', stage: 'nursery', ages: '4-5', qCount: 5, subjects: ['math', 'english'] },
  { id: 'grade1', label: 'Grade 1', short: 'G1', stage: 'primary', ages: '5-6', qCount: 6, subjects: ['math', 'english', 'science'] },
  { id: 'grade2', label: 'Grade 2', short: 'G2', stage: 'primary', ages: '6-7', qCount: 6, subjects: ['math', 'english', 'science'], assessment: 'National Grade Two Assessment' },
  { id: 'grade3', label: 'Grade 3', short: 'G3', stage: 'primary', ages: '7-8', qCount: 8, subjects: ['math', 'english', 'science', 'social'] },
  { id: 'grade4', label: 'Grade 4', short: 'G4', stage: 'primary', ages: '8-9', qCount: 8, subjects: ['math', 'english', 'science', 'social'], assessment: 'National Grade Four Assessment' },
  { id: 'grade5', label: 'Grade 5', short: 'G5', stage: 'primary', ages: '9-10', qCount: 10, subjects: ['math', 'english', 'science', 'social'] },
  { id: 'grade6', label: 'Grade 6', short: 'G6', stage: 'primary', ages: '10-11', qCount: 10, subjects: ['math', 'english', 'science', 'social'], assessment: 'National Grade Six Assessment (NGSA)' },
  { id: 'form1', label: 'Form 1', short: 'F1', stage: 'lower secondary', ages: '11-12', qCount: 10, subjects: ['math', 'english', 'science', 'social'] },
  { id: 'form2', label: 'Form 2', short: 'F2', stage: 'lower secondary', ages: '12-13', qCount: 10, subjects: ['math', 'english', 'science', 'social'] },
  { id: 'form3', label: 'Form 3', short: 'F3', stage: 'lower secondary', ages: '13-14', qCount: 12, subjects: ['math', 'english', 'science', 'social'], assessment: 'National Grade Nine Assessment' },
  { id: 'form4', label: 'Form 4', short: 'F4', stage: 'upper secondary', ages: '14-15', qCount: 12, subjects: ['math', 'english', 'science', 'social'] },
  { id: 'form5', label: 'Form 5', short: 'F5', stage: 'upper secondary', ages: '15-16', qCount: 12, subjects: ['math', 'english', 'science', 'social'], assessment: 'CSEC (CXC)' },
];

export const GRADE_ORDER: string[] = GUYANA_GRADES.map(g => g.id);

export function gradeById(id: string): GuyanaGrade | undefined {
  return GUYANA_GRADES.find(g => g.id === id);
}

export function gradesInStage(stage: Stage): GuyanaGrade[] {
  return GUYANA_GRADES.filter(g => g.stage === stage);
}

export interface EducationDistrict {
  /** Education district number. Districts 1-10 are the administrative regions. */
  code: string;
  name: string;
  region: string;
  /** Hinterland districts carry the connectivity and access constraints. */
  hinterland: boolean;
}

export const EDUCATION_DISTRICTS: EducationDistrict[] = [
  { code: '1', name: 'Barima-Waini', region: 'Region 1', hinterland: true },
  { code: '2', name: 'Pomeroon-Supenaam', region: 'Region 2', hinterland: false },
  { code: '3', name: 'Essequibo Islands-West Demerara', region: 'Region 3', hinterland: false },
  { code: '4', name: 'Demerara-Mahaica', region: 'Region 4', hinterland: false },
  { code: '5', name: 'Mahaica-Berbice', region: 'Region 5', hinterland: false },
  { code: '6', name: 'East Berbice-Corentyne', region: 'Region 6', hinterland: false },
  { code: '7', name: 'Cuyuni-Mazaruni', region: 'Region 7', hinterland: true },
  { code: '8', name: 'Potaro-Siparuni', region: 'Region 8', hinterland: true },
  { code: '9', name: 'Upper Takutu-Upper Essequibo', region: 'Region 9', hinterland: true },
  { code: '10', name: 'Upper Demerara-Berbice', region: 'Region 10', hinterland: false },
  { code: '11', name: 'Georgetown', region: 'Education District 11', hinterland: false },
];

export function districtByCode(code: string): EducationDistrict | undefined {
  return EDUCATION_DISTRICTS.find(d => d.code === code);
}

/** The curriculum authority every module and question is written against. */
export const CURRICULUM_AUTHORITY =
  'Guyana National Curriculum, National Centre for Educational Resource Development (NCERD)';
