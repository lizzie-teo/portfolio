# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Portfolio frontend rules

Before creating or changing frontend UI, read and follow `.docs/style-rules.md`. When building or changing an animated home-card cover, also follow `.docs/cover-effects.md`. When placing video that must dissolve into the page background (no visible rectangle), follow `.docs/video-blend.md`. When adding, replacing, or re-encoding any video or image asset, follow `.docs/asset-weight.md` — generated clips arrive at absurd bitrates, and the obvious fixes (downscale, regenerate smaller, batch-compress every image) are the wrong ones.

When the user asks for a frontend change, load the `frontend-design` skill (Skill tool: `frontend-design:frontend-design`) before writing or editing any UI code, and apply its guidance alongside the rules below.

- Build every component mobile-first and verify it from 320px through wide desktop layouts.
- Search for and reuse existing components before creating new ones.
- Use the portfolio's semantic design tokens; do not introduce one-off colours or duplicate spacing conventions.
- Treat accessibility, keyboard use, touch input, reduced motion, and responsive image behaviour as acceptance criteria.
- Use local shadcn/ui components from `@/components/ui/*` as the default primitive layer for reusable UI. Keep the portfolio's editorial theme, spacing, typography, motion, and case-study visuals defined in local components and semantic tokens.
- Product/app screenshots in case studies get a small corner radius: `rounded-xs` (the `--radius-xs` token, 4px). This is a deliberate carve-out from the `rounded-2xl`/`rounded-3xl` convention that full-bleed project media, illustrations, and diagrams keep — captured UI reads as a crisp artifact, not a soft media card. Scope it to genuine product screenshots only; leave chapter illustrations, sketches, and diagrams square/large. Clip at the shadow-bearing element (not just the image) so no square shadow halos a rounded screenshot.

## Token efficiency

Full playbook: `.docs/token-playbook.md`. Standing rules:

- **Delegate by default — don't wait to be asked.** The user won't remember to request agents; picking the right one is Claude's job. Route automatically: user asks how a design looks or for an opinion → `design-crit`; new UI needing design decisions (a section, component, or layout where the look isn't settled, without a motion centrepiece) → `fd` (the frontend designer agent); motion-heavy work (animated covers, hero shaders, scroll-linked sequences, canvas/WebGL effects, retuning existing motion) → `ms` (the motion designer agent); prose review or rewrite across a whole case study → `writer` agent (a one-line copy tweak mid-conversation uses the `ux-writer` skill inline instead); "where/how does X work" across many files → Explore agent; mechanical batch work (renames, repetitive edits, formatting) → a haiku or sonnet agent. Say in one line which agent is being used and why; don't ask permission first.
- When a whole stretch of upcoming work is mechanical, recommend the user run `/model sonnet` (only they can switch the main session), and remind them to switch back after.
- Never take screenshots in the main conversation to verify UI. Run the `visual-qa` agent (`.claude/agents/visual-qa.md`) only when the user asks for it, not automatically after frontend changes; give it the affected routes and it captures, looks, and returns text findings. (Agents that verify their own work with screenshots, like `fd` and `ms`, still do so.)
- `fd`'s screenshot loop is conditional, not a fixed ritual: it earns its cost on visual decisions (new/unsettled layout, responsive behaviour, hover, reduced motion) and is wasted on mechanical, deterministic edits (token renames, string swaps, applying a settled rule). If a change is that mechanical it isn't an `fd` task at all — route it to a haiku/sonnet agent. When a genuine `fd` task also happens to be non-visual, tell it in the brief to skip screenshot verification.
- Any screenshot capture goes through `node scripts/screenshot.mjs` — never write ad-hoc Playwright or headless-Chrome code.
- Any asset re-encode goes through `node scripts/shrink-asset.mjs` — never hand-roll ffmpeg. It runs the quality and blend gates and refuses to write anything that fails. Its gates are easy to get subtly wrong by hand: every one of them produced a false alarm the first time it ran without a control (`.docs/asset-weight.md` §3).

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
