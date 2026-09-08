import { describe, it, expect } from 'vitest';
import {
  CURRICULUM,
  GRADE_ORDER,
  catalogCoverage,
  getModule,
  modulesForGrade,
  modulesForStrand,
  strandPathway,
  strandsForGrade,
} from '@/data/curriculum';
import { GRADE_CONFIG } from '@/lib/constants';

describe('the shipped catalogue', () => {
  it('covers every grade the platform teaches', () => {
    for (const grade of GRADE_ORDER) {
      expect(modulesForGrade(grade).length).toBeGreaterThan(0);
    }
  });

  it('agrees with the grade config on which grades exist', () => {
    expect(GRADE_ORDER.every(g => GRADE_CONFIG[g] !== undefined)).toBe(true);
  });

  it('teaches only subjects that grade is configured for', () => {
    for (const grade of GRADE_ORDER) {
      const allowed = GRADE_CONFIG[grade].subjects;
      for (const mod of modulesForGrade(grade)) {
        expect(allowed).toContain(mod.subject);
      }
    }
  });

  it('gives every module a unique id', () => {
    expect(new Set(CURRICULUM.map(m => m.id)).size).toBe(CURRICULUM.length);
  });

  it('gives every module teachable content', () => {
    for (const mod of CURRICULUM) {
      expect(mod.title.length).toBeGreaterThan(0);
      expect(mod.objective.length).toBeGreaterThan(0);
      expect(mod.minutes).toBeGreaterThan(0);
      expect(mod.difficulty).toBeGreaterThanOrEqual(1);
      expect(mod.difficulty).toBeLessThanOrEqual(5);
      expect(mod.materials.lessons).toBeGreaterThan(0);
      expect(mod.materials.practice).toBeGreaterThan(0);
      expect(mod.materials.checkpoints).toBeGreaterThan(0);
    }
  });

  it('points every prerequisite at a module that exists', () => {
    for (const mod of CURRICULUM) {
      for (const id of mod.prerequisiteIds) {
        expect(getModule(id)).toBeDefined();
      }
    }
  });

  it('never makes a module its own prerequisite', () => {
    for (const mod of CURRICULUM) {
      expect(mod.prerequisiteIds).not.toContain(mod.id);
    }
  });

  it('only depends on modules at the same grade or earlier', () => {
    for (const mod of CURRICULUM) {
      for (const id of mod.prerequisiteIds) {
        const prereq = getModule(id)!;
        expect(GRADE_ORDER.indexOf(prereq.grade)).toBeLessThanOrEqual(GRADE_ORDER.indexOf(mod.grade));
      }
    }
  });
});

describe('strand sequencing', () => {
  it('numbers each strand from one with no gaps', () => {
    for (const grade of GRADE_ORDER) {
      for (const { subject, strand } of strandsForGrade(grade)) {
        const seq = modulesForStrand(grade, subject, strand).map(m => m.sequence);
        expect(seq).toEqual(seq.map((_, i) => i + 1));
      }
    }
  });

  it('orders a strand easiest first', () => {
    for (const grade of GRADE_ORDER) {
      for (const { subject, strand } of strandsForGrade(grade)) {
        const diffs = modulesForStrand(grade, subject, strand).map(m => m.difficulty);
        expect([...diffs].sort((a, b) => a - b)).toEqual(diffs);
      }
    }
  });

  it('chains the first module of a strand back to the previous grade', () => {
    const first = modulesForStrand('grade6', 'math', 'Number Concepts')[0];
    expect(first.prerequisiteIds).toHaveLength(1);
    expect(getModule(first.prerequisiteIds[0])!.grade).toBe('grade5');
  });

  it('is deterministic across calls', () => {
    expect(modulesForStrand('grade6', 'math', 'Geometry').map(m => m.id))
      .toEqual(modulesForStrand('grade6', 'math', 'Geometry').map(m => m.id));
  });
});

describe('lookups', () => {
  it('returns nothing for a strand that grade does not teach', () => {
    expect(modulesForStrand('grade6', 'math', 'Mental Arithmetic')).toEqual([]);
  });

  it('returns undefined for an unknown module id', () => {
    expect(getModule('nope')).toBeUndefined();
  });

  it('lists each strand of a grade once', () => {
    const strands = strandsForGrade('grade6').map(s => `${s.subject}::${s.strand}`);
    expect(new Set(strands).size).toBe(strands.length);
  });

  it('reports coverage per grade', () => {
    const coverage = catalogCoverage();
    expect(coverage).toHaveLength(GRADE_ORDER.length);
    for (const row of coverage) {
      expect(row.modules).toBe(modulesForGrade(row.grade).length);
      expect(row.subjects).toBeGreaterThan(0);
      expect(row.minutes).toBeGreaterThan(0);
    }
  });
});

describe('strandPathway', () => {
  it('runs from earlier years up to the pupil’s own year', () => {
    const pathway = strandPathway('grade6', 'math', 'Number Concepts');
    expect(pathway.length).toBeGreaterThan(1);
    const ranks = pathway.map(m => GRADE_ORDER.indexOf(m.grade));
    expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);
    expect(pathway.at(-1)!.grade).toBe('grade6');
  });

  it('never teaches the same lesson twice, even when it spans years', () => {
    for (const grade of GRADE_ORDER) {
      for (const { subject, strand } of strandsForGrade(grade)) {
        const titles = strandPathway(grade, subject, strand).map(m => m.title);
        expect(new Set(titles).size).toBe(titles.length);
      }
    }
  });

  it('meets a lesson at the earliest year it is taught', () => {
    const pathway = strandPathway('grade6', 'math', 'Number Concepts');
    const factors = pathway.find(m => m.title.startsWith('Factors'));
    expect(factors?.grade).toBe('grade4');
  });

  it('never reaches beyond the pupil’s own year', () => {
    for (const grade of GRADE_ORDER) {
      for (const { subject, strand } of strandsForGrade(grade)) {
        for (const mod of strandPathway(grade, subject, strand)) {
          expect(GRADE_ORDER.indexOf(mod.grade)).toBeLessThanOrEqual(GRADE_ORDER.indexOf(grade));
        }
      }
    }
  });

  it('returns nothing for a strand that is not taught', () => {
    expect(strandPathway('grade6', 'math', 'Mental Arithmetic')).toEqual([]);
    expect(strandPathway('not-a-grade', 'math', 'Geometry')).toEqual([]);
  });
});
