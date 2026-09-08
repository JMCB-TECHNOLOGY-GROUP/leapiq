# Changelog

All notable changes to LeapIQ will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Assessment intake: CSV/TSV importer with delimiter detection, column alias matching,
  and subject, grade, strand, score and date normalisation. Every inferred or rejected
  value is reported as a row-level issue before anything is stored (`lib/ingest.ts`)
- Baseline engine: recency-weighted percent per subject and strand with a 90-day
  half-life, performance bands sharing the existing 70% gap threshold, and an
  evidence-weighted overall figure (`lib/baseline.ts`)
- Individualised plan builder: present-levels narrative, measurable annual goals with
  baseline, growth-based target and criterion, suggested accommodations, and module
  assignment from the grade catalogue (`lib/iep-builder.ts`)
- Mastery engine: module checkpoints and practice quizzes move goals against their
  baseline on a rolling mean, re-derive goal and plan status, and release the next
  module (`lib/iep-progress.ts`)
- Pre-populated class materials for every grade from Pre-K to College across all four
  subjects, with per-grade strand sequencing and cross-grade prerequisites
  (`data/curriculum.ts`)
- Sample Grade 6 mark sheet demonstrating each recovery the importer performs
  (`data/sample-marksheet.ts`)
- Assessment Intake and Learning Plan screens, Class Materials coverage view in the
  educator dashboard, and a plan summary with up-next modules on the student dashboard
- 108 tests covering the pipeline, including an end-to-end pass from imported scores to
  a met goal

- Guyana's education structure as first-class data: Nursery 1 to Form 5 with the
  national assessment each year sits, and the eleven education districts with the four
  hinterland regions flagged (`data/guyana.ts`)
- Teaching pathways: a goal draws modules from up to two years below the pupil's own
  year, deduplicated across years, so a plan teaches at the instructional level rather
  than the enrolled level. Earlier-year modules are badged with their year in the plan

### Changed

- **Scoped the platform to the Ministry of Education, Guyana.** Grades are Nursery 1 to
  Form 5 instead of Pre-K to College; the 50-state list is replaced by the eleven
  education districts; Social Studies replaces US History as the fourth core subject;
  and every strand, question category and curriculum reference now follows the Guyana
  National Curriculum guides published by NCERD instead of Common Core and NGSS
- Learner records carry `district` rather than `state`
- AI question generation is pinned to the Guyanese curriculum: it receives the valid
  strand list for the subject so generated questions roll into the matching plan goal,
  and is instructed to use Guyanese context, metric units and Guyana dollars
- The AI tutor addresses pupils in a Guyanese setting and references the national
  assessment they are working toward
- `recordSession` folds completed quizzes into the pupil's plan, so practice keeps the
  plan current without a separate step

## [0.1.0] - 2026-04-19

### Added

- Initial project setup with Next.js 16 and TypeScript
- Adaptive learning engine with spaced repetition (Leitner system) and difficulty calibration
- AI question generation via Anthropic Claude with 50-state standards alignment
- AI learning gap analysis with remediation learning path generation
- AI tutor with conversational, growth-mindset pedagogy
- Document-to-quiz feature (text and image uploads via Claude vision)
- Student dashboard with subject selection and XP tracking
- Educator dashboard with classroom management views
- Parent dashboard with progress monitoring
- Progress visualization with Recharts (accuracy, XP, velocity)
- localStorage persistence layer for all student data
- Static question bank fallback for offline/API-free usage
- Grade support from Pre-K through College
- Subject coverage: Math, Science, History, English
- Bloom's Taxonomy tagging on all questions (remember, understand, apply, analyze)
