# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Portfolio frontend rules

Before creating or changing frontend UI, read and follow `.docs/style-rules.md`; for "what size is this heading/label" use the resolved table in `.docs/type-scale.md`. When building or changing an animated home-card cover, also follow `.docs/cover-effects.md`. When placing video that must dissolve into the page background (no visible rectangle), follow `.docs/video-blend.md`. When a mobile prototype gallery should demonstrate its own hotspots (the auto-playing touch ring), follow `.docs/auto-demo.md` — it is opt-in per user flow via `Hotspot.demoStep`, and its gating rules (in-view, reduced-motion, permanent handover on first touch) are not optional. When adding, replacing, or re-encoding any video or image asset, follow `.docs/asset-weight.md` — generated clips arrive at absurd bitrates, and the obvious fixes (downscale, regenerate smaller, batch-compress every image) are the wrong ones.

When the user asks for a frontend change, load the `frontend-design` skill (Skill tool: `frontend-design:frontend-design`) before writing or editing any UI code, and apply its guidance alongside the rules below.

The `.claude/skills/` folder also contains 21 installed third-party skills, symlinked from `.agents/skills/`, across three bundles: 3 "taste" skills (`design-taste-frontend`, `redesign-existing-projects`, `minimalist-ui`), 10 motion-craft skills (`apple-design`, `animate`, `improve-animations` and others), and 8 `higgsfield-*` generation skills that `/world` depends on. Only `ux-writer` is the project's own. **Most of these can auto-fire on a keyword match — only seven are user-only.** The motion skills misfire on Canvas 2D and shader work, and one of their rules would break Motion's `MotionValue` wiring if applied literally; two `higgsfield-*` skills trigger on "build a portfolio", "hero banner" and "carousel", which mean something else entirely in this repo. **Check `.docs/taste-skills.md` before loading any of them** — it carries a per-skill verdict and the specific conflicts. Ten are gated via `skillOverrides` in `.claude/settings.json` (six hidden entirely, four user-only); that file, not skill frontmatter, is where gating belongs, because frontmatter edits get clobbered by `npx skills update`. Project docs and semantic tokens always outrank an installed skill.

- Build every component mobile-first and verify it from 320px through wide desktop layouts.
- Search for and reuse existing components before creating new ones.
- Use the portfolio's semantic design tokens; do not introduce one-off colours or duplicate spacing conventions.
- Treat accessibility, keyboard use, touch input, reduced motion, and responsive image behaviour as acceptance criteria.
- Use local shadcn/ui components from `@/components/ui/*` as the default primitive layer for reusable UI. Keep the portfolio's editorial theme, spacing, typography, motion, and case-study visuals defined in local components and semantic tokens.
- Product/app screenshots in case studies get a small corner radius: `rounded-xs` (the `--radius-xs` token, 4px). This is a deliberate carve-out from the `rounded-2xl`/`rounded-3xl` convention that full-bleed project media, illustrations, and diagrams keep — captured UI reads as a crisp artifact, not a soft media card. Scope it to genuine product screenshots only; leave chapter illustrations, sketches, and diagrams square/large. Clip at the shadow-bearing element (not just the image) so no square shadow halos a rounded screenshot.

## Token efficiency

Full playbook: `.docs/token-playbook.md`. Standing rules:

- **A `UserPromptSubmit` hook does the first pass of this routing.** `.claude/hooks/route.sh` matches each prompt against the table below and injects the matching route into context before Claude reads it. It is advisory, not enforcement — override it when it's wrong, and say why. **When the routing rules below change, change the hook too**; a hook that contradicts this file is worse than no hook.
- **Delegate by default — don't wait to be asked.** The user won't remember to request agents; picking the right one is Claude's job. Route automatically: user asks how a design looks or for an opinion → `design-crit`; new UI needing design decisions (a section, component, or layout where the look isn't settled, without a motion centrepiece) → `fd` (the frontend designer agent); motion-heavy work (animated covers, hero shaders, scroll-linked sequences, canvas/WebGL effects, retuning existing motion) → `ms` (the motion designer agent); prose review or rewrite across a whole case study → `writer` agent (a one-line copy tweak mid-conversation uses the `ux-writer` skill inline instead); "where/how does X work" across many files → Explore agent; mechanical batch work (renames, repetitive edits, formatting) → the `batch` agent (Haiku), but only once the change is decided. Say in one line which agent is being used and why; don't ask permission first.
- When a whole stretch of upcoming work is mechanical, recommend the user run `/model sonnet` (only they can switch the main session), and remind them to switch back after.
- **Screenshots are opt-in, everywhere, for every agent.** They are the single most expensive thing this project does, so the default is now: don't capture, reason about the code instead. Capture only when the user has asked for a visual check, or when the visual outcome genuinely cannot be derived from the source. `.claude/settings.json` backs this with a `permissions.ask` rule on `node scripts/screenshot.mjs`, so every capture — including one a subagent starts — surfaces a prompt the user answers. Don't work around that prompt; if it is declined, finish the task and say plainly what went unverified.
- Never take screenshots in the main conversation to verify UI. The `visual-qa` agent (`.claude/agents/visual-qa.md`) exists for when the user does want eyes on something: give it the affected routes and it captures, looks, and returns text findings. It is user-triggered only, never a reflex after a frontend change.
- `fd` and `ms` no longer verify their own work with screenshots by default; their agent files carry the same opt-in rule. When a brief genuinely needs the visual loop (a brand-new composition, an overlay whose collision with existing chrome can't be predicted), say so explicitly in the brief. Silence means no captures.
- Any screenshot capture goes through `node scripts/screenshot.mjs` — never write ad-hoc Playwright or headless-Chrome code, and never as a way around the permission prompt.
- Any asset re-encode goes through `node scripts/shrink-asset.mjs --blend --write` — never hand-roll ffmpeg. It runs the quality and blend gates and refuses to write anything that fails. Both flags matter: without `--blend` only the SSIM gate runs, and without `--write` it is a dry run. Its gates are easy to get subtly wrong by hand: every one of them produced a false alarm the first time it ran without a control (`.docs/asset-weight.md` §3).

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

### Explorations are a second registry, on purpose

`src/app/explorations/entries.ts` is a sibling of `workEntries`, not a `kind` inside it. Do not merge them. An exploration has no client, outcome, industry or cover, and it must never appear in the home grid; folding it into `workEntries` would mean adding a third `kind` and filtering it back out of every consumer. Entries live at `/explorations/<slug>` in their own folders and wrap in `ExplorationShell`, mirroring the case-study pattern.

The exploration shell is deliberately the *other* surface: plain paper, light masthead, one reading column, where a case study runs on grout with tiled plates and a project theme. That contrast is how a reader tells working notes from a finished argument. Don't port the grout system across.

The index at `/explorations` is a **library**, shelved by subject rather than by date, so the page never promises a publishing cadence. Every entry states a verdict (`shipped`, `killed`, `superseded`, `open`) — `killed` is the most valuable value in the set and the copy should say so plainly. No counters anywhere, in the nav or on the shelves.

`/explore/*` (gitignored, local, never deployed) is the private workbench these entries are written *from*, and is not the same thing. An entry embeds a few live specimens; it never publishes the lab.
