# Assessment Intake to Individualised Plan

How a pupil's assessment data becomes a plan, and how the plan keeps itself current
as that pupil works. Four stages, each a pure module with its own tests.

Everything below is scoped to the **Ministry of Education, Guyana**: Nursery 1 through
Form 5, the eleven education districts, the four core subjects of the national
curriculum, and the national assessments — the Grade Two and Grade Four assessments,
the NGSA at Grade 6, the Grade Nine assessment at Form 3, and CSEC at Form 5.

```
  mark sheet (CSV/TSV)
          |
          v
  [1] ingest.ts ................ parse, map columns, validate, normalise
          |  AssessmentRecord[]
          v
  [2] baseline.ts .............. recency-weighted percent per subject::strand
          |  BaselineProfile
          v
  [3] iep-builder.ts ........... present levels, goals, targets, accommodations
          |  IEP + ModuleAssignment[]   <-- modules pulled from data/curriculum.ts
          v
  [4] iep-progress.ts .......... checkpoints and quizzes move goals, release modules
          |
          +--> back into the plan: current level, status, next module
```

## Stage 1 — Ingest (`src/lib/ingest.ts`)

Schools export from a dozen different systems, so the parser is forgiving but never
silent. Every assumption it makes is reported as a row-level issue the importer sees
before anything is stored.

- **Delimiter** detected from the header row (comma, tab, semicolon, pipe).
- **Columns** matched through an alias table, so `Pupil Name`, `Student_ID`, `Out Of`
  and `Domain` all land in the right field.
- **Subjects** mapped onto the four core subjects. `Mathematics`, `Maths` and
  `Numeracy` all become `math`; `Social Studies`, `History` and `Geography` become
  `social`; `Music` is reported and the row skipped.
- **Grades** normalised to Guyana's years. `6`, `Grade 6` and `Year 6` become
  `grade6`; `N1` and `Nursery 1` become `nursery1`; `Form 3`, `F3` and `Grade 9`
  all become `form3`, because Guyana numbers the secondary years both ways.
  Unreadable grades fall back to the default chosen at import, with a warning.
- **Strands** snapped onto a strand the curriculum actually teaches at that grade by
  token overlap, so `Number Operations` reaches `Number & Operations` and lines up
  with assignable modules. An unmatched strand is kept verbatim rather than dropped.
- **Percent** taken from an explicit column, otherwise `score / maxScore`. A missing
  maximum is treated as 100 with a warning; a result outside 0–100 is clamped with a
  warning; a non-numeric score skips the row with an error.
- **Dates** read as ISO first, then `d/m/yyyy` where the first number cannot be a
  month, then anything `Date` accepts. An unreadable date falls back to today.

Errors skip a row. Warnings keep it and say what was inferred.

## Stage 2 — Baselines (`src/lib/baseline.ts`)

One number per `subject::strand`, computed as a **recency-weighted mean** with a
90-day half-life: a result from last term still counts, but this term's counts more.

Bands: `well below` (<40), `below` (<55), `approaching` (<70), `meeting` (<85),
`exceeding`. The 70% line is `MEETING_THRESHOLD`, deliberately the same threshold the
existing gap analyser uses, so the two features never disagree about who is behind.

The profile also carries `overall` — weighted by how much evidence backs each strand,
not a flat average of strands — and `priorityStrands`, the strands under 70%, weakest
first.

## Stage 3 — The plan (`src/lib/iep-builder.ts`)

Every strand below the meeting threshold becomes one goal, capped at `MAX_GOALS` (6)
so a plan stays workable.

Each goal carries:

- **Baseline** — fixed at the moment of writing. It never moves; it is the line growth
  is measured from.
- **Target** — baseline plus expected growth for that band (+20 well below, +18 below,
  +15 approaching), capped at 90%. Always above the baseline, never a 50-point jump.
- **Statement** — named, measurable and time-bound: *"Given 6th Grade math material in
  Number & Operations, Anaya will improve from a baseline of 31.7% to 52% or better on
  module checkpoints by the next review."*
- **Criterion** — target or better on 2 consecutive checkpoints in that strand.
- **Modules** — up to 4, drawn from the strand's **teaching pathway**: the modules
  from two years below the pupil's year up to their own year, deduplicated so a
  lesson taught across several years is met once, at the earliest year it appears.
  `startIndexFor` then picks the entry point from the baseline.

  This is the point of a plan. A Grade 6 pupil sitting at 31% in Number Concepts is
  not taught Grade 6 material harder; they get Grade 4 place value, then Grade 5
  factors and multiples, then the Grade 6 module — teaching at the instructional
  level, not the enrolled level. Earlier-year modules are badged with their year in
  the plan view so the teacher can see exactly what is being taught and why.

`writePresentLevels` produces the PLAAFP narrative from the same data — strengths,
areas of need, the lowest strand and the evidence count behind it. `suggestAccommodations`
proposes supports implied by the shape of the data (read-aloud when reading is weak,
extended time when overall performance is low), never by diagnosis.

A strand with no catalogue modules at that grade gets no goal; `uncoveredStrands`
reports it so the gap is visible rather than hidden.

## Stage 4 — Mastery (`src/lib/iep-progress.ts`)

`createAssignments` creates one `ModuleAssignment` per module. `nextModule` is the
earliest one not yet mastered, so the queue advances on its own.

`applyMasteryEvent` records a checkpoint:

1. The assignment gains an attempt, keeps its best score, and is **mastered at 80%**
   (`MASTERY_THRESHOLD`).
2. The goal gains a progress point and recomputes `currentPercent` as a rolling mean of
   the last 3 checkpoints — one lucky result does not move a goal on its own.
3. The goal's status is re-derived: `met` once the criterion is satisfied, otherwise
   `on track` or `off track` against a progress line proportional to how much of the
   module set is done.
4. The plan moves `draft → active → complete`, or `review due` once the review date passes.

`applySessionResults` folds ordinary practice quizzes into the plan too, matching
question categories to goal strands. Quiz evidence moves a goal but never masters a
module — that needs a real checkpoint.

All four functions are pure: they return new objects and never mutate the plan passed in.

## Pre-populated class materials (`src/data/curriculum.ts`)

The catalogue is what makes a plan assignable the moment data lands — nobody authors
content first.

Modules are declared as seeds listing the years they are taught in, then instantiated
per year with a stable id, a sequence within the strand, and prerequisites chained both
within the year and back to the previous year that teaches the strand. A seed is only
instantiated where that year actually offers the subject, so nursery carries
Mathematics and English only, Science starts at Grade 1 and Social Studies at Grade 3.

Strand names follow the Guyana National Curriculum guides published by NCERD and match
the question categories in `STANDARDS_MAP`, so quiz results roll straight into the
matching goal:

| Subject | Strands |
|---|---|
| Mathematics | Sets · Number Concepts · Operations, Relations and Properties · Fractions, Decimals and Percentages · Measurement · Geometry · Statistics and Graphs · Algebra · Consumer Arithmetic |
| English Language | Listening and Speaking · Reading and Comprehension · Writing and Composition · Grammar and Mechanics · Vocabulary and Spelling |
| Science | Living Things · The Human Body and Health · Matter and Materials · Energy and Forces · Earth and Environment · Working Scientifically |
| Social Studies | Our Country Guyana · Our Heritage and History · Geography and Environment · Civics and Government · Resources and Economic Activity · The Caribbean and the Wider World |

The `GY-` codes in `STANDARDS_MAP` are LeapIQ strand references, **not** official NCERD
objective numbers. When the Ministry supplies the curriculum guides, the official
numbering loads in their place without any strand name changing.

`catalogCoverage()` reports the per-year totals shown in the educator console.

## Where it appears in the app

| Screen | Component | What it does |
|---|---|---|
| Assessment Intake | `PlanIntake.tsx` | Paste, upload or load the sample mark sheet; review what was read; import |
| Baselines & Plans | `PlanIntake.tsx` | Per-pupil baselines by strand, then build a plan |
| Learning Plan | `PlanView.tsx` | Present levels, accommodations, goals with baseline/current/target, assigned modules, checkpoint entry, progress chart and log |
| Class Materials | `EducatorDashboard.tsx` | Per-grade module coverage |
| My Learning Plan | `StudentDashboard.tsx` | Goal count, growth toward target, next modules |

Pupils see their own plan read-only. Educators record checkpoints.

## Trying it

Educator Dashboard → **Assessment Intake** → **Load Sample** → **Analyse Data**.

The shipped sample is a Grade 6 mark sheet from a hinterland primary school in Region 8,
with deliberate mess in it: a subject outside the four core areas, a missing maximum, a
day-first date and a strand spelled differently from the curriculum guide. All four are
reported on the review screen.

## Scope

This is built for the Ministry of Education, Guyana. Grades, districts, subjects,
strands and assessments all come from `src/data/guyana.ts` and
`src/lib/constants.ts` — there is no US state list, no Common Core code and no
grade label that does not exist in the Guyanese system.
