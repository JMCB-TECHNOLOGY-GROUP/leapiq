import { describe, it, expect } from 'vitest';
import {
  LEITNER_INTERVALS,
  BLOOMS,
  SUBJECTS,
  STATES,
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

  it('contains math, history, science, english', () => {
    const ids = SUBJECTS.map(s => s.id);
    expect(ids).toContain('math');
    expect(ids).toContain('history');
    expect(ids).toContain('science');
    expect(ids).toContain('english');
  });
});

describe('STATES', () => {
  it('has 51 entries (50 states + DC)', () => {
    expect(STATES).toHaveLength(51);
  });

  it('each state has code, name, and std', () => {
    for (const state of STATES) {
      expect(state.code).toBeTruthy();
      expect(state.name).toBeTruthy();
      expect(state.std).toBeTruthy();
      expect(state.code.length).toBeLessThanOrEqual(2);
    }
  });
});

describe('GRADE_OPTIONS', () => {
  it('has 15 options (prek through college)', () => {
    expect(GRADE_OPTIONS).toHaveLength(15);
  });

  it('each option has value and label', () => {
    for (const opt of GRADE_OPTIONS) {
      expect(opt.value).toBeTruthy();
      expect(opt.label).toBeTruthy();
    }
  });

  it('starts with prek and ends with college', () => {
    expect(GRADE_OPTIONS[0].value).toBe('prek');
    expect(GRADE_OPTIONS[GRADE_OPTIONS.length - 1].value).toBe('college');
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

  it('prek only has math and english', () => {
    expect(GRADE_CONFIG['prek'].subjects).toEqual(['math', 'english']);
  });

  it('higher grades have all 4 subjects', () => {
    expect(GRADE_CONFIG['5th'].subjects).toHaveLength(4);
    expect(GRADE_CONFIG['college'].subjects).toHaveLength(4);
  });
});

describe('STANDARDS_MAP', () => {
  it('has entries for all 4 subjects', () => {
    expect(Object.keys(STANDARDS_MAP)).toEqual(expect.arrayContaining(['math', 'science', 'history', 'english']));
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
