# Dynamic workflows

How to use Claude Code's Workflow feature: scripted multi-agent orchestration
for work too big for one context. Companion to `token-playbook.md`, which
covers *single*-agent delegation — this doc is for when one agent isn't enough.

## What it is

A workflow is a small JavaScript program Claude writes and the harness
executes: "fan out 6 readers, verify every finding with 3 skeptics, merge the
survivors." It differs from ad-hoc agent spawning in three ways:

1. **Deterministic control flow.** Loops, conditionals, and fan-out are coded
   up front, so a 20-agent audit follows the plan instead of drifting.
2. **Pipelining.** Item A can be in stage 3 while item B is still in stage 1;
   wall-clock time is the slowest single chain, not the sum of stages.
3. **Structured output.** Each agent is forced to return validated JSON, so
   results merge cleanly instead of being parsed out of prose.

Workflows run in the background — the conversation stays usable while one
churns. Watch live progress with `/workflows`.

## How to trigger one

Workflows are strictly opt-in, and the opt-in must come from me — Claude will
not launch one on its own, even for a task that would clearly benefit. Any of:

| Trigger | Effect |
|---|---|
| Say it in my own words: "use a workflow", "fan out agents" | One workflow for that task |
| Put the keyword `ultracode` in a prompt | One-shot opt-in, maximum thoroughness |
| Turn ultracode on for the session | Claude defaults to workflows for every substantive task — expensive, thorough mode |
| Invoke a skill/command that calls Workflow itself | Scoped to what the skill does |

Extras that compose with any trigger:

- **Token budget:** add "+500k" (or similar) to the prompt. The workflow
  scales its depth to that budget and hard-stops at the ceiling.
- **Size guideline:** "Dynamic workflow size" in `/config`. Default is
  *medium* (~15 agents per workflow). Raise it or set it to dynamic for
  bigger sweeps.

## When it earns its cost

Good fits in this repo:

- **Pre-commit review of a big branch** — finders across dimensions (bugs,
  a11y, perf, prose), each finding adversarially verified before it reaches
  me. Right-sized when dozens of files changed.
- **Site-wide rule sweeps** — "check every case study applies the rounded-xs
  screenshot rule", one agent per page, loop until two rounds find nothing new.
- **Design exploration** — N independent approaches from different angles,
  scored by a judge panel, synthesized from the winner.

Bad fits — use the normal delegation table in `token-playbook.md` instead:

- Anything a single `writer` / `fd` / `design-crit` / Explore agent covers.
- One-file changes, quick questions, copy tweaks.
- Work that is mechanical rather than broad (that's a haiku/sonnet agent).

## Why the results are trustworthy

The signature pattern is **adversarial verification**: every finding from the
fan-out stage gets its own verifier agents prompted to *refute* it, and only
findings that survive reach me. Plausible-but-wrong findings — the usual
failure mode of one big review — get killed in stage 2. For thorough audits,
findings are judged by several verifiers with different lenses (correctness,
security, does-it-reproduce) and need a majority to survive.

## Practical notes

- `/workflows` shows the live progress tree, grouped by phase.
- Workflows are **resumable**: if one is killed or the script is edited,
  completed agents' results are cached and only the changed part re-runs.
- A workflow's report arrives as a normal message when it finishes; the
  conversation isn't blocked while it runs.
- A low-stakes first run: "use a workflow to review my uncommitted changes
  across correctness, a11y, and style-rule compliance."
