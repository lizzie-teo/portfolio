#!/usr/bin/env bash
# UserPromptSubmit hook — routes the prompt to the right agent/skill/doc.
#
# Reads the hook payload on stdin, matches the prompt against the routing table
# below, and injects the matching lines into Claude's context for that turn.
# Advisory only: it never blocks and never edits the prompt. If nothing matches,
# it emits nothing and the turn proceeds untouched.
#
# The routing table mirrors the delegation rules in CLAUDE.md. When those
# change, change these too — a hook that contradicts CLAUDE.md is worse than
# no hook.
#
# Rules of thumb for editing:
#   - Patterns are extended regex, matched against the lowercased prompt.
#   - Prefer a missed route over a noisy one. Every false positive spends
#     context on every prompt that trips it.
#   - Keep each hint to one or two lines. This is a nudge, not a briefing.

set -uo pipefail

payload=$(cat 2>/dev/null) || exit 0
prompt=$(printf '%s' "$payload" | jq -r '.prompt // empty' 2>/dev/null) || exit 0
[ -z "$prompt" ] && exit 0

# Lowercase for matching.
p=$(printf '%s' "$prompt" | tr '[:upper:]' '[:lower:]')

hits=""
add() { hits="${hits}$1"$'\n'; }
match() { printf '%s' "$p" | grep -Eq "$1"; }

# 1. Motion and animation → the ms agent, not a skill and not inline.
is_motion=0
if match '\b(animat|motion|transition|easing|ease-out|spring|keyframe|parallax|scroll-linked|scroll linked|shader|hover effect|cover effect|dissolve|marquee)'; then
  is_motion=1
  add "- Motion work: route to the \`ms\` agent (CLAUDE.md). Put \`apple-design\` in its brief for gesture/interruptibility/spring questions. Do NOT hand-roll motion inline. Canvas 2D and Paper Shaders surfaces are exempt from the motion skills' sub-300ms and anti-rAF rules — see .docs/taste-skills.md."
fi

# 2. Asking for an opinion on rendered UI → design-crit.
if match '(how (does|do) .{0,30}look|what do you think|your opinion|thoughts on|does (it|this|that) look|critique|too (busy|plain|much|loud|quiet))'; then
  add "- Opinion on rendered UI: route to the \`design-crit\` agent rather than answering from the code."
fi

# 3. New or unsettled UI → fd, and load frontend-design first.
#    Suppressed when rule 1 already fired, unless the prompt is explicitly about
#    something new — "add a hover animation to the card" is motion work on an
#    existing card, not a new component.
if match '\b(build|add|create|redesign|restyle|lay ?out|new) .{0,30}\b(section|component|card|page|layout|grid|nav|header|footer|hero|band|module)'; then
  if [ "$is_motion" -eq 0 ] || match '\b(new|from scratch|another|second)\b'; then
    add "- New/unsettled UI: load the \`frontend-design:frontend-design\` skill (required by CLAUDE.md), then route to the \`fd\` agent. Read .docs/style-rules.md and .docs/type-scale.md before writing UI."
  fi
fi

# 4. Prose. Batch work → writer agent; a single line → ux-writer inline.
if match '\b(copy|prose|lede|caption|headline|wording|tone of voice|rewrite|reword|proofread|voice)\b'; then
  add "- Copy work: a whole page or several sections → the \`writer\` agent. A single line mid-conversation → the \`ux-writer\` skill inline. Voice rules: actor-first (\"I\" for her decisions, \"we\" for the team), no hyphens, no emoji."
fi

# 5. The /world scroll cinematic.
if match '(/world|scroll[- ]?world|camera flight|fly[- ]?through|diorama|higgsfield)'; then
  add "- /world work: the \`scroll-world\` skill owns this (global, self-contained) and \`higgsfield-generate\` is the model catalog. Another terminal session may be working on /world concurrently — check before editing shared files."
fi

# 6. Media assets. The obvious fixes are the wrong ones; the doc explains why.
if match '(\.(mp4|webm|mov|png|jpe?g|webp|avif)\b|\b(video|image|asset|screenshot) (file|weight|size)|re-?encode|recompress|compress|optimi[sz]e .{0,20}(video|image|asset))'; then
  add "- Assets: follow .docs/asset-weight.md. Re-encodes go through \`node scripts/shrink-asset.mjs --blend --write\` (both flags), never hand-rolled ffmpeg. Never crop a supplied image — fix proportions in CSS."
fi

# 7. Visual verification — never screenshot in the main conversation.
if match '(screenshot|visual (check|qa)|does it render|check it looks|see how it looks|take a look at the page)'; then
  add "- Visual check: use the \`visual-qa\` agent, never screenshot in the main conversation (CLAUDE.md). Screenshots are opt-in and cost real money — capture only because the user asked, or because the outcome cannot be derived from the code. Capture goes through \`node scripts/screenshot.mjs\`, which prompts the user for permission every time; don't route around that prompt. Note stills cannot verify hover or live motion — say so rather than implying they can."
fi

# 8. Mechanical batch edits → the batch agent (haiku), not the main session.
if match '(\brename\b|find.?and.?replace|search and replace|(across|in) (all|every) (the )?(file|component|page|route|case stud)|\b(all|every) (file|component|page|route|call site)s?\b|formatting sweep|consistently across)'; then
  add "- Mechanical batch work (renames, repetitive edits, formatting sweeps): route to the \`batch\` agent — it runs on Haiku and costs a fraction of the main session. Give it the exact transformation, the glob, and how to verify. Only if the change is already decided; anything needing a design or copy call goes to \`fd\`/\`ms\`/\`writer\` instead."
fi

[ -z "$hits" ] && exit 0

jq -cn --arg ctx "Routing (from .claude/hooks/route.sh — advisory, override with reason if wrong):
${hits}" '{hookSpecificOutput:{hookEventName:"UserPromptSubmit",additionalContext:$ctx}}'
