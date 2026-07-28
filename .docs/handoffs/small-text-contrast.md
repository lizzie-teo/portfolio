# Hand-off: fix washed-out small text (contrast) across the case study

## Problem

Small supporting text throughout the Healthdirect case study (captions, figure
legends, crop notes, eyebrows, the finding tags) is set in `text-muted-foreground`.
That token is `#6B6459` (a warm grey), which measures roughly **5.3–5.8:1**
depending on surface. That *clears* WCAG AA (4.5:1) — so nothing here is a hard
failure — but AA's floor is calibrated for body-size text, and at `text-xs`/`text-sm`
this grey reads as washed out and hard to read. The design currently puts the
lightest grey on the smallest type, which is the inverse of what legibility wants.

New rule (added to `.docs/style-rules.md` §4, "Small text needs more contrast, not
less"): meaningful text at `text-sm` (14px) or below must clear **7:1 (AAA)** on its
surface. `text-muted-foreground` is the quiet tone for small text, so the token
itself must clear 7:1 everywhere.

Scope of the problem (case study only, ~15 small-text muted usages):
`UsabilityFindings.tsx` (crop note, "Full screen" figcaption, outline tag),
`IaFlow.tsx` (6), `EngineAudit.tsx`, `JourneyMap.tsx` (2), `LandscapeReview.tsx`,
`CriteriaScorecard.tsx`, `page.tsx` (3). This is systemic, so fix the token, not
15 call sites.

## Step 1 — Darken the `--muted-foreground` token (the systemic lever)

In `src/app/theme.css`, the global `:root` value (line ~50) is:

```
--muted-foreground: oklch(0.5064 0.0191 79.25); /* #6B6459 — 5.3:1 on muted, 5.8:1 on bg */
```

This token is **inherited** by the Healthdirect, AP+, and Macquarie project scopes
(none override it), so one change fixes every light theme. Darken it to land at
**≥7:1 on each theme's reading surfaces**. Target neighbourhood: around `#55504A`
(≈ `oklch(0.4341 0.0117 72.51)`), which measures ~7.5:1 on the Healthdirect card
`#F6F9F9` and ~7.9:1 on the neutral `#FEFEFC`. Keep it a warm grey (do not shift
hue); it must stay visibly quieter than `--foreground` (`#3A3733`, ~11.7:1) so the
body-vs-supporting hierarchy still reads — 7:1 vs 11.7:1 is a clear step.

Then:

- **Verify per theme** and record the ratio in a comment on the token, on each
  theme's lightest reading surface: neutral/default (`#FEFEFC` bg, `#FFFFFF` card),
  Healthdirect (`#F6F9F9` card, `#F3F7F7` bg), AP+ (`#f6f4fd` bg), Macquarie
  (`#f5f7f8` bg). All must clear 7:1.
- **Dark theme has its own value** (line ~397: `--muted-foreground: oklch(0.76 0.012 80)`).
  Check it against the dark card (`#292521`) and bg (`#211E1B`); if it is below 7:1,
  lighten it until it clears, and record the ratio. Do not assume the light-theme
  change covers dark.
- Confirm nothing that pairs muted-foreground *with* a tint surface (e.g. an
  outline chip on `--secondary`) drops below 7:1 after the change.

## Step 2 — Sweep for small text that should be foreground, not muted

Darkening the token makes muted comfortably legible, but some small text is
*essential reading*, not supporting metadata, and should be `text-foreground`
outright. Walk the list below and promote to `text-foreground` where the copy is
load-bearing (a note the reader must read to get the point), leaving genuinely
secondary text on the now-darker muted:

```
grep -rn "text-muted-foreground" src/app/work/healthdirect-symptom-checker/ \
  | grep -E "text-xs|text-sm"
```

Known call sites to judge: the `CropExhibit` note in `UsabilityFindings.tsx:260`
(this is essential — it carries the argument — so `text-foreground`); the "Full
screen" figcaption (`:213`, supporting — muted is fine once darkened); figure
legends in `LandscapeReview`/`JourneyMap`, scorecard cell text in
`CriteriaScorecard`, and the `page.tsx` blockquotes (judge each: quote/legend =
muted OK; a sentence the reader needs = foreground).

## Step 3 — Rethink the finding tags in `UsabilityFindings.tsx`

The judgment tags ("The outcome", "Too wordy", "Misfired", "What worked") are
currently pills: the emphasis one is a filled `bg-primary text-primary-foreground`
teal pill, the rest are outline pills in `text-muted-foreground`. Two problems —
the outline pill uses the washed grey, and white-on-teal / teal-tinted small text
sits at ~4.6:1, which fails the new 7:1 small-text bar. The pill chrome also reads
as generic next to the case study's established editorial label system.

Replace the pills with the codebase's existing eyebrow/kicker convention (§3):

- Every tag becomes a small uppercase tracked kicker (`text-xs`, tracking
  0.16–0.18em) in **`text-foreground font-semibold`** (~11:1 — crisp at that size).
  No pill background, no border.
- Carry emphasis **not by colouring the letters** (teal text fails 7:1 small) but
  with a *decorative* primary mark: a short `bg-primary` bar or dot before the
  emphasis tag, echoing the signature accent bar already at the head of each claim
  (`UsabilityFindings.tsx:276`). Same teal bar marks "the claim" and "the crop that
  proves it" — one consistent emphasis language, and the mark is contrast-exempt so
  the label stays 11:1.
- Keep the `emphasis` data flag; it now drives whether the accent mark renders,
  not a colour swap on the text.

(If the reviewer prefers to keep a filled chip for the single emphasis tag, that
is acceptable **only** if its text clears 7:1 — i.e. not white-on-`#007f78`. The
accent-mark approach above avoids the problem entirely and is the recommendation.)

## Acceptance

- `--muted-foreground` clears **7:1** on every light theme's reading surface and
  the dark theme's; ratios recorded in comments on the token(s).
- No meaningful `text-sm`/`text-xs` text in the case study sits below 7:1; essential
  small copy is `text-foreground`.
- Finding tags read as crisp uppercase kickers; emphasis is a primary accent mark,
  not tinted small text or a low-contrast pill.
- Hierarchy still reads: supporting text is visibly quieter than body/foreground.
- Verify with `visual-qa` on `/work/healthdirect-symptom-checker` (page the
  usability carousel through all three findings) in light and dark, plus a spot
  contrast check of the darkened token on each theme.
- No change to type sizes, spacing, or layout — this is a colour/contrast pass only.
