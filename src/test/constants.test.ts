import { describe, it, expect } from 'vitest';
import {
  LEITNER_INTERVALS,
  BLOOMS,
  SUBJECTS,
  EDUCATION_DISTRICTS,
  GRADE_OPTIONS,
  GRADE_CONFIG,
  STANDARDS_MAP,
} from '@/lib/constants';

describe('LEITNER_INTERVALS', () => {
  it('has 6 entries (box 0 through 5)', () => {
    expect(LEITNER_INTERVALS).toHaveLength(6);
  });

  it('intervals increase monotonically', () => {
    for (let i = 1; i < LEITNER_INTERVALS.length; i++) {
      expect(LEITNER_INTERVALS[i]).toBeGreaterThanOrEqual(LEITNER_INTERVALS[i - 1]);
    }
  });

  it('box 0 has interval 0 (immediate)', () => {
    expect(LEITNER_INTERVALS[0]).toBe(0);
  });

  it('box 5 (mastered) has 30-day interval', () => {
    expect(LEITNER_INTERVALS[5]).toBe(30);
  });
});

describe('BLOOMS', () => {
  it('has exactly 4 levels in correct order', () => {
    expect(BLOOMS).toEqual(['remember', 'understand', 'apply', 'analyze']);
  });
});

describe('SUBJECTS', () => {
  it('has 4 subjects', () => {
    expect(SUBJECTS).toHaveLength(4);
  });

  it('each subject has required fields', () => {
    for (const subject of SUBJECTS) {
      expect(subject).toHaveProperty('id');
      expect(subject).toHaveProperty('name');
      expect(subject).toHaveProperty('icon');
      expect(subject).toHaveProperty('gradient');
    }
  });

  it('contains the four core subjects of Guyana’s national curriculum', () => {
    const ids = SUBJECTS.map(s => s.id);
    expect(ids).toContain('math');
    expect(ids).toContain('social');
    expect(ids).toContain('science');
    expect(ids).toContain('english');
  });
});

describe('EDUCATION_DISTRICTS', () => {
  it('has the eleven districts: ten regions plus Georgetown', () => {
    expect(EDUCATION_DISTRICTS).toHaveLength(11);
    expect(EDUCATION_DISTRICTS[10].name).toBe('Georgetown');
  });

  it('each district has a code, name and region', () => {
    for (const district of EDUCATION_DISTRICTS) {
      expect(district.code).toBeTruthy();
      expect(district.name).toBeTruthy();
      expect(district.region).toBeTruthy();
    }
  });

  it('flags the four hinterland regions', () => {
    const hinterland = EDUCATION_DISTRICTS.filter(d => d.hinterland).map(d => d.code);
    expect(hinterland).toEqual(['1', '7', '8', '9']);
  });
});

describe('GRADE_OPTIONS', () => {
  it('covers Nursery 1 through Form 5', () => {
    expect(GRADE_OPTIONS).toHaveLength(13);
  });

  it('each option has value and label', () => {
    for (const opt of GRADE_OPTIONS) {
      expect(opt.value).toBeTruthy();
      expect(opt.label).toBeTruthy();
    }
  });

  it('starts at Nursery 1 and ends at Form 5', () => {
    expect(GRADE_OPTIONS[0].value).toBe('nursery1');
    expect(GRADE_OPTIONS[GRADE_OPTIONS.length - 1].value).toBe('form5');
  });
});

describe('GRADE_CONFIG', () => {
  it('has a config for every grade option value', () => {
    for (const opt of GRADE_OPTIONS) {
      expect(GRADE_CONFIG[opt.value]).toBeDefined();
    }
  });

  it('each config has label, age, qCount, subjects', () => {
    for (const [, config] of Object.entries(GRADE_CONFIG)) {
      expect(config.label).toBeTruthy();
      expect(config.age).toBeTruthy();
      expect(config.qCount).toBeGreaterThan(0);
      expect(config.subjects.length).toBeGreaterThan(0);
    }
  });

  it('nursery only has mathematics and english', () => {
    expect(GRADE_CONFIG['nursery1'].subjects).toEqual(['math', 'english']);
  });

  it('grade 3 upward has all four subjects', () => {
    expect(GRADE_CONFIG['grade3'].subjects).toHaveLength(4);
    expect(GRADE_CONFIG['form5'].subjects).toHaveLength(4);
  });

  it('names the national assessment for the years that sit one', () => {
    expect(GRADE_CONFIG['grade6'].assessment).toContain('NGSA');
    expect(GRADE_CONFIG['form5'].assessment).toContain('CSEC');
    expect(GRADE_CONFIG['grade5'].assessment).toBeUndefined();
  });
});

describe('STANDARDS_MAP', () => {
  it('has entries for all 4 subjects', () => {
    expect(Object.keys(STANDARDS_MAP)).toEqual(expect.arrayContaining(['math', 'science', 'social', 'english']));
  });

  it('uses Guyana strand references, never US standard codes', () => {
    for (const categories of Object.values(STANDARDS_MAP)) {
      for (const standards of Object.values(categories)) {
        for (const std of standards) expect(std.code).toMatch(/^GY-/);
      }
    }
  });

  it('each standard has code and description', () => {
    for (const [, categories] of Object.entries(STANDARDS_MAP)) {
      for (const [, standards] of Object.entries(categories)) {
        for (const std of standards) {
          expect(std.code).toBeTruthy();
          expect(std.description).toBeTruthy();
        }
      }
    }
  });
});
