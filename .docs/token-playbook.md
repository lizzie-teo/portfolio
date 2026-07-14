# Token playbook

How to spend fewer tokens in Claude Code without working slower. Grounded in an
analysis of this project's 44 sessions from 4–12 July 2026.

## What the transcripts showed

| Signal | Number | Why it matters |
|---|---|---|
| Turns on Fable 5 (premium model) | ~89% of 4,659 | Mechanical work (typecheck loops, screenshot capture, tiny CSS nudges) ran at premium price |
| Cache-read tokens | ~525M in a week | The dominant cost. Long sessions re-read their whole history on every single turn |
| Screenshots pulled into context | 1,020 (one session had 230) | Each image costs ~1–1.6k tokens **and stays in the session**, re-billed on every later turn |
| Subagents used | 0 | All exploration and screenshot loops happened in the expensive main loop |
| Same Playwright script rewritten inline | ~50+ times | Pure output-token waste; now replaced by `scripts/screenshot.mjs` |
| Longest session | ~157 messages, 30MB | By the end, every small request cost as much as a huge one |

## The one mental model

**Every turn re-sends the entire conversation.** Cached history is ~10× cheaper
than fresh input, but 150 turns × a giant context still dwarfs everything else.
Two corollaries:

1. **Session length compounds.** Turn 100 costs far more than turn 10, even for
   a one-line question. Keep sessions short and single-purpose.
2. **Images are permanent residents.** A screenshot pasted or captured in the
   main session is paid for again on every subsequent turn. Let a subagent look
   at images and report back in text — the images die with the subagent.

## When to use what

| Situation | Use | Model | Why |
|---|---|---|---|
| Design judgment, ambiguous problems, architecture, copywriting | Main session | Fable | This is what the premium model is for |
| Well-specified mechanical work (apply a known pattern, batch rename, config) | Main session after `/model sonnet` | Sonnet | Same outcome at a fraction of the price; switch back with `/model` |
| "Where does X live / how does Y work" codebase questions | Ask Claude to *use an Explore agent* | inherits | The agent reads dozens of files in its own context; only the answer returns |
| Verifying a UI change looks right | `visual-qa` agent (`.claude/agents/visual-qa.md`) | Sonnet | Captures via `scripts/screenshot.mjs`, looks at the images itself, returns text findings. Zero images in your session |
| Wanting an opinion on a design, not just a check | `design-crit` agent (`.claude/agents/design-crit.md`) | Fable | Same screenshot machinery, but gives peer-level critique: hierarchy, type, rhythm, composition |
| New UI where the design isn't settled yet | `fd` agent (`.claude/agents/fd.md`, the frontend designer) | Opus | Designs and builds: explores existing components, implements, iterates against its own screenshots. Opus has strong design instincts at half Fable's price — the right trade for a long screenshot-heavy loop; escalate a single run to Fable by asking for it |
| Motion-heavy work: animated covers, hero shaders, scroll-linked or canvas/WebGL effects | `ms` agent (`.claude/agents/ms.md`, the motion designer) | Opus | Same design-and-build loop as `fd`, specialised in the site's three motion surfaces (Motion for React, Canvas 2D covers, Paper Shaders); always verifies reduced-motion and dark passes |
| Reviewing or rewriting prose across a whole case study | `writer` agent (`.claude/agents/writer.md`) | Fable | Reads the full pages in its own context, applies the ux-writer skill's tests, returns only findings. For a one-line copy tweak mid-conversation, use the skill inline instead |
| Big feature you haven't scoped | `/plan` first | Fable | A researched plan makes the build session short and linear instead of exploratory |
| A workflow you repeat (copy review, visual check, release steps) | A skill in `.claude/skills/` | n/a | Instructions load only when invoked, instead of being re-explained every time |
| Multi-step work inside one session | Ask for a task list (TaskCreate) | n/a | Keeps long work on rails; fewer wasted detour turns |

## Fable vs Opus: the judgment-density rule

Model choice follows one heuristic: **weigh how judgment-dense the work is
against how many tokens the run burns.** Fable costs exactly 2× Opus
($10/$50 vs $5/$25 per million tokens), so the premium only pays off where
the tokens are few and the judgment is everything.

- `design-crit` is the Fable case: a run is short and bounded (capture,
  look, write a critique — roughly a dollar on Fable vs fifty cents on
  Opus), and the entire value of the agent *is* the judgment. Paying a few
  extra cents for the best available taste on the thing the agent exists
  to judge is the right trade.
- `fd` is the Opus case: a long design → build → screenshot
  → refine loop where every iteration re-reads code and images. The 2×
  premium compounds across the whole loop, and Opus's design taste is
  nearly as good — so the premium buys little. Escalate a single run to
  Fable by asking for it ("design this with fable").

| Work profile | Model | Examples here |
|---|---|---|
| Judgment-dense, short output | Fable | `design-crit`, main-session decisions, copy and voice, "which direction should this go" |
| Capable execution, long token-heavy loops | Opus | `fd`, most build-and-iterate agent work |
| Well-specified implementation | Sonnet | `visual-qa`, applying a known pattern |
| Mechanical | Haiku | renames, capture, formatting sweeps |

One more Fable case that doesn't apply to this portfolio (yet): very long
autonomous runs — overnight refactors, hard multi-hour agentic work — where
Fable's long-horizon coherence justifies the cost even at volume. Until
something here looks like that, the practical rule stays: **Fable where the
tokens are few and the judgment is everything; Opus where the loop is long.**
(How to actually run work overnight — awake laptop vs cloud — is in
`.docs/overnight-runs.md`.)

## Model switching: three layers

You almost never switch models by hand. The layers, from least to most manual:

1. **Custom agents — automatic.** The model is baked into the agent file's
   frontmatter (`model: sonnet` in `visual-qa.md`, `model: fable` in
   `design-crit.md`). Every run uses that model without you thinking about it.
   This is the main trick: encode the model choice once, and the right model
   becomes the default.
2. **Ad-hoc delegation — just ask.** Claude can assign a model per agent launch.
   "Use a haiku agent to rename these files" or "explore this with a cheap
   agent" is enough. You never touch `/model`.
3. **Your main session — manual, and rare.** `/model sonnet` switches the whole
   session and sticks until changed back. Worth it only for a stretch of purely
   mechanical work (an afternoon of cleanup); otherwise stay on Fable for
   judgment and push the grunt work down to agents.

## Design toolkit

Agents (own context — anything noisy or image-heavy belongs here):

| Agent | Model | Use for |
|---|---|---|
| `visual-qa` (`.claude/agents/`) | Sonnet | Pass/fail checking: overflow, breakpoints, style-rule compliance. Cheap, run often |
| `design-crit` (`.claude/agents/`) | Fable | Opinionated critique: hierarchy, typography, spacing rhythm, composition, motion. Premium, run when you want a peer's opinion |
| `fd` (`.claude/agents/`, frontend designer) | Opus | Design-and-build for new UI: makes the design decisions, implements them, iterates against its own screenshots. Long token-heavy loops, so Opus over Fable; per-run Fable escalation available on request |
| `ms` (`.claude/agents/`, motion designer) | Opus | Design-and-build for motion and shader work: animated covers, hero shaders, scroll-linked and canvas/WebGL effects. Same long-loop economics as `fd` |
| `writer` (`.claude/agents/`, ux writer) | Fable | Batch prose review or rewrite across a case study or the site. Loads the ux-writer skill as its rubric; short judgment-dense runs, the design-crit case |
| Explore (built-in) | inherits | "Where is the card hover animation defined?" codebase questions |
| Plan (built-in) | inherits | Scoping a feature before building |
| `vercel:performance-optimizer` | inherits | Core Web Vitals, image loading, bundle size — run before sharing the site |

Skills (loaded knowledge, run in the main conversation):

| Skill | Use for |
|---|---|
| `ux-writer` (yours) | Case-study prose; whether copy earns its place next to an artifact. Inline for tweaks mid-conversation; the `writer` agent loads this same skill for batch passes |
| `frontend-design` | Design fundamentals when building UI |
| `dataviz` | Charts and stat tiles, if a case study ever needs them |
| Figma suite | `figma-design-to-code` (build from a Figma link), `figma-generate-design` (push a page into Figma), `figma-generate-library` (design system from code), `figma-implement-motion` |
| Mobbin (MCP) | Search real app screens and flows for reference ("onboarding patterns from health apps") |
| `/code-review`, `/simplify` | Quality passes on a diff before committing |

The split to remember: **visual-qa often, design-crit when it matters.** QA on
Sonnet catches defects for cents; crit on Fable spends premium tokens on the
thing premium models are actually for.

## Session hygiene

- **One task per session.** Finished the hero animation? `/clear` before starting
  the case-study copy. A fresh session re-reads CLAUDE.md and a few files — far
  cheaper than dragging 80 turns of dead context along.
- **`/compact` mid-task** when a session must continue but history has grown fat
  (e.g. after a long debugging detour that's now resolved).
- **Don't paste screenshots to ask "does this look right?"** — say "run visual-qa
  on / and /work/…". Same eyes, none of the recurring image cost.
- **Don't re-explain the project.** Anything Claude should always know belongs in
  `CLAUDE.md`; anything about *you* belongs in memory. If you correct the same
  thing twice, say "remember this".
- **Long visual iteration loops are the worst case** (screenshot → nudge →
  screenshot on Fable). Instead: describe the target once, let Claude iterate
  with the `visual-qa` agent, and review the final result yourself.

## What's now wired in

- `scripts/screenshot.mjs` — one canonical Playwright capture script
  (320/768/1440 by default, `--dark`, `--reduced-motion`, overflow detection).
  Nobody writes ad-hoc screenshot code anymore.
- `.claude/agents/visual-qa.md` — the Sonnet screenshot-verifier described above.
- `.claude/agents/design-crit.md` — the Fable design critic described above.
- `.claude/agents/ms.md` — the Opus motion designer described above.
- `CLAUDE.md` — a token-efficiency section telling every future session to use
  the above and to delegate broad exploration to Explore agents.
