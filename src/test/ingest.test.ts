import { describe, it, expect } from 'vitest';
import {
  detectColumns,
  ingestAssessments,
  groupByStudent,
  normaliseGrade,
  normaliseStrand,
  normaliseSubject,
  parseDelimited,
} from '@/lib/ingest';
import { SAMPLE_MARKSHEET } from '@/data/sample-marksheet';

describe('parseDelimited', () => {
  it('parses a comma-separated file', () => {
    expect(parseDelimited('a,b\n1,2')).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('honours quoted fields containing the delimiter', () => {
    const rows = parseDelimited('name,subject\n"Persaud, Anaya",Math');
    expect(rows[1]).toEqual(['Persaud, Anaya', 'Math']);
  });

  it('unescapes doubled quotes', () => {
    expect(parseDelimited('a\n"say ""hi"""')[1]).toEqual(['say "hi"']);
  });

  it('detects tab-separated input', () => {
    expect(parseDelimited('a\tb\n1\t2')).toEqual([['a', 'b'], ['1', '2']]);
  });

  it('drops blank lines and a leading byte-order mark', () => {
    expect(parseDelimited('﻿a,b\n\n1,2\n')).toEqual([['a', 'b'], ['1', '2']]);
  });
});

describe('detectColumns', () => {
  it('matches headers through aliases and separators', () => {
    const mapping = detectColumns(['Student_ID', 'Pupil Name', 'Year', 'Course', 'Domain', 'Out Of', 'Marks']);
    expect(mapping.studentRef).toBe('Student_ID');
    expect(mapping.studentName).toBe('Pupil Name');
    expect(mapping.grade).toBe('Year');
    expect(mapping.subject).toBe('Course');
    expect(mapping.strand).toBe('Domain');
    expect(mapping.maxScore).toBe('Out Of');
    expect(mapping.score).toBe('Marks');
  });

  it('leaves unknown headers unmapped', () => {
    expect(detectColumns(['sausages']).subject).toBeUndefined();
  });
});

describe('normalisers', () => {
  it('maps subject synonyms onto taught subjects', () => {
    expect(normaliseSubject('Mathematics')).toBe('math');
    expect(normaliseSubject('numeracy')).toBe('math');
    expect(normaliseSubject('Social Studies')).toBe('social');
    expect(normaliseSubject('Music')).toBeNull();
  });

  it('normalises Guyanese grade labels', () => {
    expect(normaliseGrade('6')).toBe('grade6');
    expect(normaliseGrade('Grade 6')).toBe('grade6');
    expect(normaliseGrade('Nursery 2')).toBe('nursery2');
    expect(normaliseGrade('N1')).toBe('nursery1');
    expect(normaliseGrade('sixth')).toBeNull();
  });

  it('reads a secondary year written either as a form or as a grade', () => {
    expect(normaliseGrade('Form 3')).toBe('form3');
    expect(normaliseGrade('F3')).toBe('form3');
    // Guyana numbers the secondary years 7-11 as well as Forms 1-5.
    expect(normaliseGrade('Grade 9')).toBe('form3');
    expect(normaliseGrade('11')).toBe('form5');
  });

  it('snaps a loosely spelled strand onto a taught one', () => {
    expect(normaliseStrand('Number Operations', 'math', 'grade6')).toBe('Number Concepts');
    expect(normaliseStrand('number concepts', 'math', 'grade6')).toBe('Number Concepts');
  });

  it('keeps an unrecognised strand rather than discarding the row', () => {
    expect(normaliseStrand('Mental Arithmetic', 'math', 'grade6')).toBe('Mental Arithmetic');
  });
});

describe('ingestAssessments', () => {
  const header = 'Student ID,Student Name,Year,Subject,Domain,Assessment,Date,Marks,Out Of';

  it('computes percent from marks and maximum', () => {
    const result = ingestAssessments(`${header}\nG1,Ann,6,Math,Geometry,Test,2026-01-14,30,40`);
    expect(result.accepted).toBe(1);
    expect(result.records[0].percent).toBe(75);
    expect(result.records[0].subject).toBe('math');
    expect(result.records[0].grade).toBe('grade6');
  });

  it('prefers an explicit percent column over marks', () => {
    const result = ingestAssessments(
      'Name,Subject,Grade,Percent,Marks\nAnn,Math,6,64,10',
    );
    expect(result.records[0].percent).toBe(64);
  });

  it('warns and assumes a maximum of 100 when none is given', () => {
    const result = ingestAssessments(`${header}\nG1,Ann,6,Math,Geometry,Test,2026-01-14,27,`);
    expect(result.records[0].percent).toBe(27);
    expect(result.issues.some(i => i.severity === 'warning' && i.field === 'maxScore')).toBe(true);
  });

  it('skips rows in subjects the platform does not teach, and says which row', () => {
    const result = ingestAssessments(`${header}\nG1,Ann,6,Music,Recital,Test,2026-01-14,18,25`);
    expect(result.accepted).toBe(0);
    const issue = result.issues.find(i => i.severity === 'error');
    expect(issue?.row).toBe(2);
    expect(issue?.message).toContain('Music');
  });

  it('reads day-first dates when the first number cannot be a month', () => {
    const result = ingestAssessments(`${header}\nG1,Ann,6,Math,Geometry,Test,14/02/2026,30,40`);
    expect(result.records[0].date).toBe('2026-02-14');
  });

  it('falls back to the default grade and warns', () => {
    const result = ingestAssessments(
      `${header}\nG1,Ann,Senior Phase,Math,Geometry,Test,2026-01-14,30,40`,
      { defaultGrade: 'grade6' },
    );
    expect(result.records[0].grade).toBe('grade6');
    expect(result.issues.some(i => i.field === 'grade' && i.severity === 'warning')).toBe(true);
  });

  it('clamps an out-of-range score and warns rather than storing it', () => {
    const result = ingestAssessments(`${header}\nG1,Ann,6,Math,Geometry,Test,2026-01-14,50,40`);
    expect(result.records[0].percent).toBe(100);
    expect(result.issues.some(i => i.severity === 'warning' && i.field === 'score')).toBe(true);
  });

  it('refuses the whole file when no student column exists', () => {
    const result = ingestAssessments('Subject,Marks\nMath,30');
    expect(result.accepted).toBe(0);
    expect(result.issues[0].severity).toBe('error');
  });

  it('refuses the whole file when no score or percent column exists', () => {
    const result = ingestAssessments('Name,Subject\nAnn,Math');
    expect(result.accepted).toBe(0);
    expect(result.issues.some(i => i.field === 'score')).toBe(true);
  });

  it('warns once when there is no strand column at all', () => {
    const result = ingestAssessments('Name,Subject,Grade,Marks,Out Of\nAnn,Math,6,30,40');
    expect(result.records[0].strand).toBe('General');
    expect(result.issues.filter(i => i.field === 'strand')).toHaveLength(1);
  });

  it('reports an empty file instead of throwing', () => {
    expect(ingestAssessments('').accepted).toBe(0);
  });
});

describe('the shipped sample mark sheet', () => {
  const result = ingestAssessments(SAMPLE_MARKSHEET, { source: 'sample' });

  it('imports every row except the untaught subject', () => {
    expect(result.rows).toBe(29);
    expect(result.accepted).toBe(28);
    expect(result.issues.filter(i => i.severity === 'error')).toHaveLength(1);
  });

  it('demonstrates each recovery the importer performs', () => {
    expect(result.issues.some(i => i.field === 'maxScore')).toBe(true);
    expect(result.records.some(r => r.date === '2026-02-14')).toBe(true);
    expect(
      result.records.filter(r => r.studentName === 'Anaya Persaud' && r.strand === 'Number Concepts'),
    ).toHaveLength(2);
  });

  it('yields five students', () => {
    expect(groupByStudent(result.records).size).toBe(5);
  });
});
