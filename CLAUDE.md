# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Portfolio frontend rules

Before creating or changing frontend UI, read and follow `docs/style-rules.md`.

- Build every component mobile-first and verify it from 320px through wide desktop layouts.
- Search for and reuse existing components before creating new ones.
- Use the portfolio's semantic design tokens; do not introduce one-off colours or duplicate spacing conventions.
- Treat accessibility, keyboard use, touch input, reduced motion, and responsive image behaviour as acceptance criteria.
- Use local shadcn/ui components from `@/components/ui/*` as the default primitive layer for reusable UI. Keep the portfolio's editorial theme, spacing, typography, motion, and case-study visuals defined in local components and semantic tokens.

## Work architecture

All portfolio work (case studies and external articles) lives in one registry: `src/app/work/projects.ts`. The home grid, project cards, page metadata, and case-study prev/next navigation all derive from it. Never hardcode project titles, taglines, slugs, or URLs elsewhere.

Entries are a discriminated union on `kind`:

- `kind: "case-study"` — has a `slug`; renders at `/work/<slug>` from its own route folder.
- `kind: "article"` — has an external `url` (e.g. Substack); the home card links out in a new tab. No route folder.

To add a case study:

1. Add a `case-study` entry to `workEntries` in `src/app/work/projects.ts`.
2. Create `src/app/work/<slug>/page.tsx` that exports `metadata` via `caseStudyMetadata("<slug>")` and wraps its content in `<CaseStudyShell slug="<slug>">`.

To add an article: add an `article` entry to `workEntries`. Nothing else.

Shared chrome: `SiteHeader` (all pages) and `CaseStudyShell` (case-study hero, content slot, prev/next footer) in `src/app/components/`. Each case study keeps its own visual language *inside* the shell — put project-specific modules in the page, not in the shell. Deliberately no dynamic `/work/[slug]` route: per-project folders let each case study own its presentation.
