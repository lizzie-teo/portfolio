# Handoff — type role registry and heading outline

Started 9 Aug 2026. Goal: one cohesive type system across home and case studies, with typographic role and heading level as **separate, documented decisions**.

## The governing principle

A role is not a heading level. `h1` is a document-structure fact; "display" is a typographic one, and the same element is both at once.

- **Pick the tag from the outline** (what is this inside of?), **then** apply whatever role token that element needs (how big is it?).
- Never pick a heading level to get a font size. That is the actual accessibility rule behind "visual and semantic hierarchy should agree" (WCAG 1.3.1) — not "font sizes must rank-order with heading levels", which no major design system holds.
- A role must never imply a tag (`statementHeading` is deliberately usable on non-heading elements). A tag must never imply a role (the "Writing" `h3` is styled as a 12px uppercase eyebrow, and that is correct).
- Test: strip all CSS, read the headings alone in order. If it reads as a sensible table of contents, the outline is right.

## Done

**`src/app/components/typography.ts` (new)** — the single type role registry. Holds two families:

- *Editorial* (case studies): `font-semibold`, `tracking-[-0.03em]` — `coverHeading`, `statementHeading`, `leafHeading`, `sectionHeading`, `subsectionHeading`, `minorHeading`, `sectionLede`.
- *Gallery* (home): `font-medium`, tracking -0.01em to -0.015em — `galleryHeading`, `projectCardHeading`, `articleCardHeading`, `indexItemHeading`.
- `displayHeading` (home hero) sits above both: semibold, `tracking-tight`, the site's only breakpoint staircase.

The six editorial tokens moved out of `Chapter.tsx`, which now imports `leafHeading` and re-exports all of them, so the ~11 existing importers are unchanged.

**Call sites wired** (byte-identical class strings, so zero pixel change — verified by `npm run build` plus grepping the emitted CSS for every clamp and the full `text-9xl` staircase): `CaseStudyShell`, `StatementHero`, `WorkGallery`, `LoFiProjectCard` (all three copies, including the outcome figure that quotes the title token), `WritingIndex`.

Measure stays at the call site (`max-w-[18ch]`, `max-w-[70rem]`, `max-w-[10ch]`) — it is layout, not type.

**Docs** — `.docs/type-scale.md` (new) is the resolved mobile→desktop table for every role. `.docs/style-rules.md` §4 and §12 point at it; §12 gained the "name a role for its job, never for its tag" rule and had two stale facts corrected (`leafHeading` is 28→46px, not 28→52px; tokens live in `typography.ts`). `CLAUDE.md` points at the new doc.

## Pending

### 1. Heading outline fix on the home page — Option A, agreed

Current outline (DOM order), which is wrong:

```
h1  A decade designing for complexity     StatementHero
h2  Selected work                         WorkGallery FilterRail
h2  <card title> × N                      LoFiProjectCard      ← peers of the rubric, not inside it
h3  Writing                               WorkGallery          ← reads as a child of the LAST card
h4  <article title>                       WritingIndex
```

Target:

```
h2  Selected work
  h3  Projects        ← new label; the grid currently has none
    h4  <card title>
  h3  Writing
    h4  <article title>
```

- Card titles drop from `h2` to `h4`. **Tag change only** — they keep `projectCardHeading` and render at the same 36px.
- Add a "Projects" heading for the grid, mirroring the existing `<section aria-labelledby="writing-heading">` pattern. Make it a **visible** eyebrow matching "Writing" (same `font-mono text-xs uppercase tracking-[0.16em]` treatment) — the asymmetry where the writing list is labelled and the grid is not is a sighted problem too. `sr-only` is the fallback if the visible label is unwanted.
- `FeatureItem`'s `h3` is fine as-is: it replaces the whole grid, so it already sits directly under the `h2`.
- Then re-read the outline top to bottom with CSS off and confirm it reads as a table of contents.

The size/level "inversion" this leaves (36px card inside a 30px rubric) is deliberate and documented in `type-scale.md`: the rubric is a quiet caption naming the region, the cards are the content. Containment is carried by the grout plane and the grid, not by size. Do not "fix" it by growing the rubric.

Option B (make the grid a `<ul>` and drop card headings entirely) was considered and rejected — individual jumpability for the projects is worth more than tidy size-ranking.

### 2. Two live home components still carry inline type

- `FeatureItem.tsx:114` (decorative publication masthead) and `:136` (feature title, 30→36→48). Both use `tracking-[-0.02em]`, a **third** tracking value in the gallery voice. Name them (`featureCardHeading`, `featureMasthead`) preserving current values — do not silently retune to -0.015em. Then decide separately whether the outlier is deliberate.
- `ProjectCard.tsx:1150` (`ComingSoonCard`) is live on the home page via `WorkGallery` and carries `projectCardHeading`'s exact string inline. Point it at the token.
- `ProjectCard.tsx:1024` is *not* live — only `/explore` direction pages use it. Leave it; noted at the foot of `type-scale.md`.

### 3. Then check the case-study outlines

The same audit has only been run on the home page. `.docs/style-rules.md` §12 already specifies the case-study hierarchy (`h2` section → `h3` subsection → `h4`); confirm the pages actually follow it.

## Verifying

`npx tsc --noEmit` and `npx eslint <files>` both clean at handoff. For type changes, `npm run build` then grep the emitted CSS under `.next/static/chunks/*.css` — the minifier strips leading zeros and spaces the `+` inside `calc`/`clamp`, so grep for a fragment like `1.4437rem`, not the whole declaration.
