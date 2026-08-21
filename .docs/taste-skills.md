# Installed skills: which to use when

Twenty-one third-party skills are installed via `npx skills add`, living in
`.agents/skills/` and symlinked from `.claude/skills/`. This file records what
each one is for and whether it should ever be loaded on this project. (The
22nd entry, `ux-writer`, is the project's own real directory, not a symlink,
and is not covered here.)

| Bundle | Installed | Skills | Section |
|---|---|---|---|
| `Leonxlnx/taste-skill` | 15 Aug 2026 | 3 (of 13) | [Taste skills](#bundle-1--taste-skills-leonxlnxtaste-skill) |
| `emilkowalski/skills` | 16 Aug 2026 | 10 | [Motion craft skills](#bundle-2--motion-craft-skills-emilkowalskiskills) |
| `higgsfield-*` | before 16 Aug 2026 | 8 | [Generation skills](#bundle-3--generation-skills-higgsfield-) |

Curated 16 Aug 2026: ten of the thirteen taste skills were removed. The other
two bundles are installed whole and stay that way — Emil's for completeness of
the philosophy, Higgsfield's because `/world` depends on it.

## Most of these can fire on their own

A skill's name and description sit in Claude's system prompt. Claude decides
whether a description matches your request and loads the skill itself — you
never have to name it. It is judgment against the description text, not a
keyword regex, so "triggers on 'hero banner'" is shorthand for "the description
advertises hero banners and a model reading it might reasonably pick it".

An earlier version of this file said none of them were automatic. That was
wrong, and it made every "reference only" and "no" verdict here read as safer
than it was: a skill you would never *choose* to load can still load itself.
That error is why the curation happened — a written verdict was never a control,
so the skills rated "no" had to actually leave.

### Gating: `skillOverrides` in `.claude/settings.json`

The durable control is `skillOverrides`, not a frontmatter edit. Frontmatter
edits diverge from upstream and get clobbered by `npx skills update`;
`skillOverrides` lives in project settings and survives. Values:
`"user-invocable-only"` hides the skill from Claude but keeps `/name` for you,
`"off"` hides it from both, `"name-only"` lists it without its description.

| Skill | Setting | Why |
|---|---|---|
| `animate` | `user-invocable-only` | Matches "animate this" / "add motion" and then writes motion code, bypassing the rule that motion routes to the `ms` agent. |
| `improve-animations` | `user-invocable-only` | Matches "make this app feel better", then writes plan files to `plans/` at the repo root and runs git and the build. |
| `higgsfield-websites` | `user-invocable-only` | Matches "build a portfolio" / "make a landing page" and wants to scaffold a Cloudflare Worker product. Kept reachable for its `scroll-scrub` references. |
| `higgsfield-product-photoshoot` | `user-invocable-only` | Matches "hero banner" and "carousel", which mean layout components here. |
| `higgsfield-marketplace-cards`, `-youtube-thumbnail`, `-soul-id`, `-video-explainer`, `-brandkit`, `ask-sonner` | `off` | No path to any work on this project. Kept on disk (the higgsfield bundle is one unit and `/world` is live) but out of the listing entirely. |

Three more are user-only upstream and need no override:
`prototype`, `review-animations`, `pick-ui-library`.

That leaves seven that can still self-load — `apple-design`,
`animation-vocabulary`, `find-animation-opportunities`, `emil-design-eng`, the
three taste skills — plus `higgsfield-generate`, which is wanted. All are
read-only advice.

# Bundle 1 — Taste skills (`Leonxlnx/taste-skill`)

## Precedence, first

These skills are written for greenfield landing pages built from nothing. This
portfolio is an established editorial system with its own tokens, type scale, and
motion vocabulary. So:

1. `.docs/style-rules.md`, `.docs/type-scale.md`, `CLAUDE.md` and the semantic
   tokens **always win**.
2. `frontend-design:frontend-design` stays the default skill for UI work.
3. A taste skill is a *lens* for generating options, never a spec to implement
   literally.

If a taste skill and a project doc disagree, the project doc wins and the
conflict gets mentioned in the reply, not silently resolved.

## The verdict table

| Skill | What it is | Use it? |
|---|---|---|
| `design-taste-frontend` | v2 flagship. Brief inference, three dials (variance / motion / density), design-system map, anti-default discipline. Contextual by design, nothing fires automatically. | **Yes, selectively.** The best of the bundle. Load for divergent exploration in `/explore` and `/lab`, or when a new section's direction is genuinely unsettled. Ignore its font and package recommendations. |
| `redesign-existing-projects` | Audit checklist of generic AI patterns across typography, colour, layout, states. Audit-first, does not rewrite. | **Yes, as a checklist.** Useful as a second pair of eyes on an existing page. Read it as diagnostics, not prescriptions; several of its "fixes" conflict with this site (see below). |
| `minimalist-ui` | Warm monochrome editorial, 1px borders, muted pastel accents, flat bento. | **Reference only.** Closest in spirit to this site, and its bans (no emoji, no AI clichés, no oversaturated colour) match existing rules. But it hardcodes hex values and font stacks that are not ours. |

## Removed 16 Aug 2026

Ten of the original thirteen were removed. Recorded here so nobody re-adds them
expecting a fresh evaluation, and so the reasoning survives if one is ever
wanted back.

| Skill | Why it went |
|---|---|
| `high-end-visual-design` | "Reference only" — a different visual identity (double-bezel cards, `rounded-[2rem]`, glass pill nav) that would fight the masthead and radius conventions. Its motion guardrails were the only sound part, and Emil's bundle covers that ground better. |
| `industrial-brutalist-ui` | "Reference only" — a complete alternative identity (Swiss print plus CRT terminal). Might have informed one case study's internal language; never the site chrome. |
| `gpt-taste` | Mandates GSAP, simulated Python RNG for layout selection, AIDA page structure, `picsum.photos`. Wrong stack, wrong structure. |
| `full-output-enforcement` | Written for chat-completion output, not an agentic harness. Its anti-brevity stance runs against `.docs/token-playbook.md`. |
| `stitch-design-taste` | Requires Google Stitch. Not part of this workflow. |
| `design-taste-frontend-v1` | Superseded by v2, which is kept. |
| `brandkit`, `imagegen-frontend-web`, `imagegen-frontend-mobile`, `image-to-code` | All four needed an image-generation tool Claude Code doesn't have. Note the higgsfield bundle *does* generate images — but none of these four is wired to it, so they stayed inert regardless. |

The two "reference only" removals are the judgment calls. Both were rated
never-load, and the discovery that a never-load skill can still invoke itself
turned that rating into a reason to remove rather than a reason to keep.

Restore any of them with:
`npx skills add Leonxlnx/taste-skill -s "<name>"`

## Known conflicts to watch for

If one of the three remaining taste skills is loaded, these are the specific
places it will give bad advice for this project:

- **Fonts.** They ban Inter and prescribe Satoshi, Clash Display, Plus Jakarta
  Sans, or a serif display face. This site is Avant Garde for display and Geist
  for body. Do not swap fonts on a skill's say-so.
- **Type scale.** Expect arbitrary `clamp()` values and `text-[10px]` eyebrow
  badges. This project uses the standard Tailwind scale only; see
  `.docs/type-scale.md`.
- **Hardcoded colour.** All three ship hex values. Use the semantic tokens.
- **Radius.** `minimalist-ui` caps radius at 12px. This project's rule is
  `rounded-xs` for product screenshots and `rounded-2xl`/`rounded-3xl` for
  full-bleed media.
- **Placeholder imagery.** Several instruct the use of `picsum.photos`. This
  site ships real assets under the weight discipline in `.docs/asset-weight.md`.
  Never introduce a placeholder image source.
- **Dark sections.** `redesign-existing-projects` flags "a single dark section
  in a light page" as a copy-paste accident. The symptom checker's dark
  FeatureChips band is a deliberate decision. Ignore that item.
- **Motion library.** Any instruction to install GSAP or Framer Motion is wrong
  here; the motion surfaces are Motion for React, Canvas 2D covers, and Paper
  Shaders. Route motion work to the `ms` agent instead.

## Reading status

`design-taste-frontend`, `redesign-existing-projects` and `minimalist-ui` have
all been read in full. (The other two bundles have been read in full as well;
this bundle was the only one where that was ever partial.)

# Bundle 2 — Motion craft skills (`emilkowalski/skills`)

Installed 16 Aug 2026 (`npx skills@latest add emilkowalski/skills`). Ten skills
encoding Emil Kowalski's design-engineering philosophy — the author of Sonner
and Vaul, and of the animations.dev course. **All ten have been read in full,
including their supporting files** (`RECIPES.md`, `AUDIT.md`, `STANDARDS.md`,
`PLAN-TEMPLATE.md`, `PICKER.md`, `API.md`).

These are a different animal from the taste bundle. That one is visual
direction for greenfield landing pages, mostly wrong for an established
editorial system. This one is **motion craft applied to existing code**, and it
lands directly on top of territory this project already owns: the `ms` agent,
Motion for React (70 files import it), `.docs/cover-effects.md`,
`.docs/auto-demo.md`, Canvas 2D covers, and Paper Shaders.

So the precedence rule is the same but the failure mode is different. A taste
skill gives advice that obviously doesn't fit. These give advice that fits
*almost* everywhere and is wrong in a few specific, expensive places.

## What this project actually runs

Grounding facts, because most gating decisions below turn on them:

- **`motion` v12** (the package is `motion`, not `framer-motion`), imported in
  ~70 files. Anything these skills say about "Framer Motion" is about this.
- **`@base-ui/react` v1.6** is installed, used in `src/components/ui/button.tsx`
  and `accordion.tsx`. So `var(--transform-origin)` — which these skills lean on
  constantly — is a real, available variable here, not a foreign assumption.
  It is currently used nowhere.
- **No `--ease-*` or `--duration-*` tokens exist** in `theme.css` or
  `globals.css`. Six hand-rolled `cubic-bezier()` values live in `src/`, mostly
  Tailwind's default `cubic-bezier(0.4, 0, 0.2, 1)`.
- **No `plans/` directory exists.**
- **Sonner, cmdk, zustand, next-themes, dnd kit, Virtuoso, recharts and
  NumberFlow are not installed** and a portfolio has no use for most of them.

## The verdict table

| Skill | What it is | Use it? |
|---|---|---|
| `apple-design` | WWDC *Designing Fluid Interfaces* translated to the web. Interruptibility, velocity handoff, momentum projection (`(v/1000)·d/(1−d)`, `d ≈ 0.998`), rubber-banding, spring damping/response, materials, typography, Apple's eight design principles. | **Yes, the best of the bundle.** Its gesture and interruptibility material is genuinely better than anything in the project docs and directly useful to the `ms` agent and `.docs/auto-demo.md`. Skip §12 (materials) and §15 (typography) — see conflicts. |
| `animate` | Construction skill. Runs a gate (should this animate at all → purpose → tool → properties → curve → interruption → reduced motion) and writes the implementation. | **Yes, as a checklist for the `ms` agent — not as a router.** Its decision sequence is sound and its "Never Ship" table is a good pre-flight. But it writes code, and motion work here routes to `ms`. **Gated 16 Aug 2026** so it can't self-invoke past that routing; load it deliberately, *inside* an `ms` brief. |
| `animation-vocabulary` | Reverse-lookup glossary: "the bouncy thing when a popover opens" → *Pop in*. Naming only, no prescriptions. | **Yes, freely.** Zero conflict surface. Useful when writing captions or briefing the `ms` agent precisely. |
| `find-animation-opportunities` | Read-only sweep for places that *should* animate, with a four-question gate and a required "rejected candidates" section. Caps output at 5–7. | **Yes, selectively.** The restraint discipline is the valuable part, and the mandatory rejection list is a real safeguard. Its frequency heuristics are written for daily-use product UI, so discount them on case-study pages a visitor sees once. |
| `review-animations` | Critique skill, ten non-negotiable standards, findings table + verdict, blocks by default. `disable-model-invocation: true`. | **Reference only.** Overlaps `design-crit` and the `ms` agent's own review. Useful as a rule catalogue (`STANDARDS.md` is the richest file in the bundle); its Block/Approve ceremony is heavier than this project needs. |
| `emil-design-eng` | The philosophy monolith — 674 lines covering everything the four skills above cover, plus the Sonner-building principles. | **Reference only, and don't invoke it bare.** Its "Initial Response" instruction makes it reply with a plug for animations.dev and then refuse to say anything until asked a question. Read the file; don't load the skill for a conversational opener. |
| `improve-animations` | Codebase-wide motion audit that fans out subagents and writes self-contained plan files for cheaper models to execute. | **Only on purpose. Gated 16 Aug 2026.** Its recon → vet → plan workflow is good, but its output collides with this repo's conventions and its rule catalogue misfires on canvas and shader work. If invoked, redirect plans to `.docs/animation-plans/` and read the `plans/` and false-positive entries below first. |
| `prototype` | Builds 3–5 genuinely divergent variants behind a floating picker so you can flip between them live. `disable-model-invocation: true`. | **Yes, but redirect the surface.** This is essentially what `/explore` already is. Never let it create `/prototypes/<slug>` — see conflicts. |
| `pick-ui-library` | Curated library picks by task. `disable-model-invocation: true`. | **Reference only.** Notable mainly because it independently arrives at this project's existing stack (base-ui, motion, clsx, cva), which is mild validation. Everything else on its list is a dependency this portfolio doesn't need. |
| `ask-sonner` | Sonner setup, API, and troubleshooting. | **Inert.** Sonner is not installed and a portfolio has no toasts. Leave it unused. |

## Known conflicts to watch for

Six specific places where this bundle will give bad advice here. The first two
are the expensive ones.

- **The "Motion `x`/`y`/`scale` are not hardware-accelerated" rule.** Stated in
  `emil-design-eng`, `animate` §4, `review-animations` standard 7,
  `improve-animations/AUDIT.md`, and `review-animations/STANDARDS.md` — it tells
  the agent to rewrite `animate={{ x: 100 }}` as
  `animate={{ transform: "translateX(100px)" }}`. **Do not apply this
  mechanically.** It would fire on ~70 files, and the rewrite is incompatible
  with `MotionValue`-driven `x`/`y`, `useTransform`, `useScroll`, and layout
  animations — the exact things the scroll-linked and cover work depends on. The
  underlying point (CSS animation runs off the main thread; JS motion drops
  frames while the page is busy) is true and worth knowing. The blanket rewrite
  is not.

- **The anti-`requestAnimationFrame` stance and the sub-300ms ceiling.** Both
  rule catalogues treat rAF loops as a smell and durations over 300ms as a
  finding. Every rule in them presumes a DOM element with a CSS transform.
  **Nothing in this bundle contemplates Canvas 2D or shader motion**, so on
  `.docs/cover-effects.md` work, the home hero, `/world`, and any Paper Shaders
  surface these two rules are pure false-positive generators. Both catalogues do
  carve out "marketing / explanatory can be longer" — a case study is that.

- **`--ease-out` / `--ease-in-out` / `--ease-drawer` are not defined here.**
  `animate/RECIPES.md` and every recipe in it reference `var(--ease-out)`, and
  the bundle insists "never approximate a value that appears here — copy it."
  Paste a recipe as-is and the transition silently falls back and does nothing.
  Either define the three tokens in `theme.css` first or substitute a literal.
  The three values, if they're ever wanted:
  `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`,
  `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`,
  `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`.
  Adopting them is a real proposal worth considering — six ad-hoc cubic-beziers
  in `src/` is exactly the consolidation finding the audit would raise — but it
  is a deliberate token decision, not something a skill gets to make mid-task.

- **`improve-animations` writes to `plans/`.** Its hard rules create
  `plans/NNN-slug.md` plus `plans/README.md` at the repo root, stamp each with
  `git rev-parse --short HEAD`, and specify typecheck/lint/build commands for an
  executor to run. This repo keeps working documents in `.docs/` and scratch
  work in the session scratchpad. If it is ever run, point it at
  `.docs/animation-plans/` and say so in the invocation.

- **`prototype` wants a `/prototypes/<slug>` route.** This project already has
  `/explore` for exactly this purpose — gitignored, local, never deployed. Send
  prototype surfaces there instead. Two knock-on notes: Tailwind does not
  generate arbitrary classes used only in `/explore`, so the harness needs
  inline styles; and `PICKER.md` explicitly forbids restyling its chrome with
  project tokens, which is correct — the picker must not look like the design
  under review. Its hardcoded `-apple-system` stack, `#fff`, `border-radius:
  999px` and `z-index: 2147483647` are chrome-only and must never reach a real
  page.

- **`apple-design` §12 and §15 are the two sections to skip.** §12 prescribes
  translucent `backdrop-filter` chrome and "materialize, don't just fade" — a
  frosted-glass chapter dock was built here and rejected as ugly and lifeless,
  so this is settled, not open. §15 says to default to the platform system font
  and reaches for `clamp()` type and `font-optical-sizing`; this site is Avant
  Garde for display and Geist for body on the standard Tailwind scale. Its
  reduced-motion material in §14 is good and does apply, including the
  `prefers-reduced-transparency` and `prefers-contrast` signals the project
  docs don't currently mention.

## What is genuinely worth stealing

Not conflicts — the parts that improve on what is written down here today:

- **Interruptibility as a first principle** (`apple-design` §3): always animate
  from the live presentation value, never the target; blend velocity through a
  reversal rather than hard-cutting it; decompose 2D motion into independent X
  and Y springs.
- **Velocity handoff and momentum projection** (§5–6), with Apple's actual
  exponential-decay projection function rather than the physics-textbook one.
  Directly relevant to `.docs/auto-demo.md` and any drag surface.
- **Rubber-banding at boundaries** (§9) instead of hard stops.
- **The frequency gate** — how often a user sees an animation should set its
  budget. A case study read once is a different tier from a nav a visitor uses
  every session, and the docs don't currently say that anywhere.
- **Feel-checking protocol**: play at 2–5× duration or in the DevTools
  Animations panel, step frame by frame, test gestures on a real device, look
  again the next day. This is a concrete answer to a known gap — stills can't
  verify motion, and live hover checks currently fall to the user.
- **Reduced motion means gentler, not zero.** Keep opacity and colour, drop
  position change. Plus gating hover motion behind
  `@media (hover: hover) and (pointer: fine)`.

# Bundle 3 — Generation skills (`higgsfield-*`)

Eight skills wrapping the Higgsfield CLI, installed before 16 Aug 2026. All
eight read 16 Aug 2026. **The whole bundle is kept**, because `/world` — the
scroll-scrubbed camera-flight landing page — is built on Higgsfield and is
actively in progress in a parallel session.

They share one auth story: install the CLI by piping a GitHub script to `sh`,
then interactive `higgsfield auth login`. **No API key or env var anywhere** —
it's OAuth against the account, and every job spends from the same credit pool
`/world` is drawing on (194 of 800 spent as of writing). None of the eight is
gated; all can auto-fire on keyword.

## What actually touches `/world`

Only two, and the distinction matters — "higgsfield is important" is true of
this pair and not of the other six.

| Skill | Relationship to `/world` |
|---|---|
| `higgsfield-generate` | **Load-bearing.** The generic front door to every model — text-to-image, image-to-video (Seedance 2.0), 3D/GLB, audio — plus the model catalog, prompt-engineering and media-input references. The global `scroll-world` skill points at it for CLI install, then drives `higgsfield generate create` directly. This is also the right tool for any one-off still or clip a case study needs. |
| `higgsfield-websites` | **Keep for its references, not its workflow.** Its `references/scroll-scrub*.md` family (React, CSS, video variants) is the most detailed writeup of the `/world` technique on this machine — seam-locking, boundary-frame extraction, encoding, a mobile QA contract — and `scroll-world` does not reference it. The *skill* is a shadow twin: it builds the same scroll-scrubbed journey, but only inside a Higgsfield-created React 19 + TanStack + Cloudflare Worker project, so its workflow cannot run on this Next.js repo. Mine the references; never let it scaffold. |

## The other six

No path to `/world` at all. Left installed rather than pruned, because the
bundle is one unit and the `/world` work is live — but nothing here should ever
be loaded for portfolio work.

| Skill | What it's for | Why it isn't for this |
|---|---|---|
| `higgsfield-video-explainer` | Narrated explainer videos, 10-second blocks stitched server-side. | Explicitly disclaims "one-off clips without narration" — precisely what `/world` consumes. |
| `higgsfield-soul-id` | Trains a face-identity model on 5–20 photos of one person. | `/world` has no people in it. Also needs a paid Basic+ plan. |
| `higgsfield-brandkit` | Palette → SVG logos → typography → packaging/signage/merch → PPTX brandbook. | Client-services identity deliverables. A designer already owns their identity. Writes `./brandkit/state.json` into the project dir. |
| `higgsfield-product-photoshoot` | DTC product photography and paid-social ad packs. | E-commerce. **Trigger hazard:** fires on "hero banner" and "carousel", which mean layout components here. |
| `higgsfield-youtube-thumbnail` | High-CTR thumbnails with "information gap" concepts. | Creator-economy work. |
| `higgsfield-marketplace-cards` | Amazon/Shopee listing image sets and A+ modules. | Listing compliance. Nothing to do with anything here. |

## Sizes, for context

`higgsfield-websites` is 836K and `higgsfield-brandkit` 280K — between them
about two-thirds of everything in `.agents/skills/`. Most of `-websites` is
game art, rigging scripts and multiplayer material that will never apply. That
weight is accepted as the price of the four scroll-scrub documents.

# Global skills (`~/.claude/skills/`) — one left

Everything above is project-scoped. There is a second, machine-wide skill folder
that applies to every project, and after 16 Aug 2026 it contains exactly one
skill: **`scroll-world`**, which builds the scroll-scrubbed camera-flight
landing page at `/world`. It is self-contained (`SKILL.md` plus seven
references, including `scrub-engine.js`, `knockout.py` and `prompts.md`) and
depends on nothing but the Higgsfield CLI.

The other 21 — the whole HyperFrames and video family from
`heygen-com/hyperframes`, installed 5 Jul 2026 — were removed: `hyperframes`
and its seven domain skills, plus `embedded-captions`, `faceless-explainer`,
`figma`, `general-video`, `media-use`, `motion-graphics`, `music-to-video`,
`pr-to-video`, `product-launch-video`, `remotion-to-hyperframes`, `slideshow`,
`talking-head-recut` and `website-to-video`. They were 110MB across two mirrored
locations and none of them was in use.

Two notes if this ever comes up again:

- **`scroll-world` was never part of that bundle.** It is not in
  `~/.agents/.skill-lock.json` and was installed by some other route, which is
  why the uninstall left it standing. Don't assume a global reinstall would
  restore it.
- **`remotion-to-hyperframes` is the one worth *not* missing.** This project
  uses Remotion for real (`remotion.config.ts`, `src/remotion/`, the Funding
  Finder hero), and that skill ports Remotion *away* to HyperFrames — the
  opposite of what's wanted here. Removing it protects the Remotion work rather
  than threatening it.

Restore the whole family with `npx skills add heygen-com/hyperframes -g`, or one
of them with `-s "<name>"`.

# Housekeeping (all three bundles)

**Decided 16 Aug 2026: skills are committed, not gitignored.** All 21 skill
folders under `.agents/skills/` and their `.claude/skills/*` symlinks are
tracked, so the installed rules are pinned and an upstream change shows up as a
reviewable diff rather than silently altering how an agent behaves. Two reasons
this matters more than it first looked: the two local `disable-model-invocation`
edits only survive as reviewable diffs, and a skill that can invoke itself is
one whose text you want under version control. The cost is accepted —
re-running `npx skills add` produces a large, noisy commit, so keep those
installs on their own commit, away from portfolio work.

When a bundle is updated or a new one added, update this file in the same
commit — a skill on disk with no verdict here is the failure mode this document
exists to prevent. After `npx skills update`, re-check the two gating edits
listed near the top of this file.

All of these run with full agent permissions.
