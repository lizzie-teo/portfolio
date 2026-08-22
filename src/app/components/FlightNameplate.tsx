/* ─────────────────────────────────────────────────────────────────────────
   ██ PARKED, AND NOT MOUNTED ANYWHERE (owner's call, Aug 2026) ████████████

   `HomeFlight` no longer renders this, and world.css no longer carries the
   `.sw-nameplate` rules or the `--sw-name-*` tokens it was positioned by. The
   file is kept whole, the way `HomeHero` and `WorldTransition` are, because
   everything below is the record of five placements and the arithmetic behind
   each — re-deriving that is the expensive part, and deleting it is Lizzie's
   call rather than a cleanup.

   WHY IT WENT. It was the THIRD setting of "Lizzie Teo" on one screen. The
   floppy's own archival label prints it, and WorldGlassCard's note says that is
   where the name belongs and only belongs; the masthead prints it a row above.
   This line said nothing the reader had not just read, and it was the largest
   thing on a screen whose subject is the disk.

   NOT A COLLISION, AN ECHO, which is why it survived several passes: the disk
   goes into the slot at morph p 0.06 → 0.34 and `--wgc-move` does not begin
   until 0.54, so this never shared a frame with the floppy. It set a beat after
   the disk had gone. The one exception was first paint and no-JS, where
   `var(--wgc-move, 1)` fails open and it flashed over the object.

   THE h1 DID NOT GO WITH IT. `SiteHeader` renders its wordmark as the heading
   on `/` — the name the page already shows is the name the outline uses. If
   this line ever comes back it must NOT be an h1 as well, or `/` ships two.

   A LONGER LINE WAS CONSIDERED AND NOT TAKEN. With the masthead already naming
   her, the obvious move was to give this slot a useful sentence instead. Two
   things killed it: the pitch is already spoken further down (the ending's "I
   make complicated products simpler to use" is marked final, leg 2 owns "ten
   years", leg 7 owns "first sketch to the shipped screen"), and the measure is
   brutal — `.type-cover` at 88px inside a 34rem column is about twelve
   characters a line, and `--sw-mount-top` reserved exactly ONE line box, so
   every extra line pushed the composition down and shrank the disk. Restoring
   the slot for a sentence means dropping it to the 28 → 36px curve AND making
   `--sw-name-stack` a two-line box. Both are recorded below.

   ─────────────────────────────────────────────────────────────────────────
   THE LETTERHEAD — AND IT WAS THE HOME PAGE'S ONLY <h1>

   "Lizzie Teo", set at the cover line and printed ACROSS the head of the
   composition: the bottom quarter of the letterforms runs over the glass pane
   and the film, so the name and the plates read as one object rather than two
   things stacked. It is not there at first — it sets as the panel takes its
   place, after the floppy has gone into the slot.

   THE GEOMETRY IS ALL IN world.css and it is worth reading before moving this
   by a pixel: the overlap is measured from the BASELINE rather than the line
   box (a box is mostly air, so overlapping the box puts no ink on the plate),
   and the name hangs off `--sw-plate-top` rather than off the masthead,
   because the mount CENTRES itself in the space under the bar. Positioned from
   the masthead the name would sit still while the plates floated down away
   from it. See THE NAME CROSSES THE PLATES' TOP EDGE and THE COMPOSITION IS
   CENTRED AS ONE OBJECT.

   ── THE JOB TITLE IS GONE (owner's call, Aug 2026) ────────────────────────
   It read "Lizzie Teo, Senior Product AI Designer", with the role as a quiet
   second half of the same sentence. The name alone is what a cover carries —
   "Funding Finder" is a name, not a name and a description — and this line is
   now typeset as one. The `<title>` and the meta description still carry the
   role for search and for a link preview, so nothing is lost that a recruiter
   or a crawler was relying on; `layout.tsx` and `page.tsx` are where it lives.
   Putting it back means reopening the measure, since the two halves together
   set to three lines at the 88px cap.

   ── THE PAGE HAD NO h1 AT ALL, WHICH IS WHY THIS EXISTS ───────────────────
   There is one in `HomeFlight`'s `[data-sw-seo]` block, and the engine sets
   `hidden` on that block at mount (scrub-engine.js:174). `hidden` is
   `display: none`, so it is out of the accessibility tree as well as off the
   screen: it serves crawlers, link previews and no-JS visitors, and a screen
   reader with JavaScript on got nothing. Every other route on this site names
   itself in a heading; `/` did not.

   ── WHERE IT SITS, AND THE TWO PLACEMENTS THAT DID NOT WORK ───────────────
   FIRST a 14px byline above the pane's copy column, on the argument that the
   first screen already holds five objects and the only free room on the sheet
   is the band between the masthead's foot and `--sw-copy-top`. It fitted, and
   it read as a credit rather than as the page's name.

   THEN the cover line — `.type-cover`, 40 → 88px, the same class a case study
   wears on its opening plate — set from the film's left edge, because at that
   size it no longer fitted above the copy column and pushing the column down
   is the one thing the pane's height budget cannot pay for. It read as a
   poster lying across the picture.

   BOTH PUT THE h1 INSIDE THE COMPOSITION and made it compete with what it was
   standing over.

   THEN A ROW ABOVE THE MOUNT, which did not compete because nothing else was
   up there — but it belonged to nothing either, and it cost the plates about
   70px of height to hold a band of empty air.

   CROSSING THE EDGE is what resolved it (owner's call, Aug 2026, direction
   "F"): the plates come back up, the name stays at the cover line, and the two
   are bound together by the overlap instead of separated by a gap.

   WHY IT COULD NOT SIT IN THE PANE, which was the other candidate and is the
   one to re-read before anyone proposes it again: the copy column is
   `--sw-copy-col` wide — those numbers were 272px at 861 and 411px at 1440 and
   the ramp has moved twice since (world.css, THE PANE'S TYPE ROLES); re-measure
   before trusting them — and "Lizzie Teo" at the
   cover line's 88px cap needs about 480px. Inside the pane it wraps or it
   drops to roughly 50px. The pane and the cover line are mutually exclusive.

   The type is `--sw-name-*` in world.css: the site's top-level heading curve
   (28 → 36px) with the pane's letterfit. A ROLE IS NOT A HEADING LEVEL
   (typography.ts) — this is an h1 at a section heading's size because of where
   it stands, not because of its tag.

   ── IT ARRIVES WITH THE PANEL, AND THEN IT STAYS ──────────────────────────
   The arrival is `--wgc-move`, WorldGlassCard's own published value, read in
   world.css — see IT ARRIVES WITH THE PANEL, NOT WITH THE PAGE there for why
   that beat and why nothing is measured twice. In short: by the time the sheet
   is travelling into its landed position the disk has already gone into the
   slot, so reading one number that already exists puts the name after the
   floppy exactly.

   ── IT DOES NOT FADE OUT, AND THAT IS PARKED RATHER THAN SETTLED ──────────
   A version before this one had two windows. It stood at scroll 0, left on the
   arrival cue's beat, and came back at the end so the page signed itself. The
   owner has parked the leaving half: being part of the plates, it stays as
   long as they do. The numbers are kept here rather than in git because they
   came off leg 9's actual frames, and re-deriving them is the expensive part:

     IT LEFT ON THE ARRIVAL'S BEAT. `clamp(1 - y / 0.5vh)` — `FlightFork`'s
     curve, which is the engine's own (scrub-engine.js:507). The letterhead and
     the `Scroll` cue both belong to the first screen rather than to the walk,
     so they left together; a name still dissolving while the first chapter set
     read as a third thing arriving.

     IT CAME BACK WHEN THE LETTERING FINISHED, across 95.8 → 98.6% of the
     flight. world.css records the frames: leg 9 is a locked-off shot, its
     screen holds the garden to T≈20%, writes "he" at 31%, "hello wo" at 50%
     and is COMPLETE by 75% of the leg. Leg 9 runs 90.4 → 100% of the flight,
     so complete lands at ~97.6% and the fade was set to finish just under it.
     Earlier and the name competes with the lettering; later and there is no
     scroll left to fade in across.

     THE PROGRESS IT RAN ON was the engine's track — `[data-sw-scrub-track]`,
     the attribute ScrollWorld already publishes for `use-anchor-scroll`. Its
     scrollable span (height less one viewport) is exactly the range every
     `--sw-flight` percentage in world.css is written against, so the numbers
     above and the numbers there are one scale. Measuring it beats duplicating
     the engine's section-weight sum, which world.css warns must never be
     duplicated (THE WAYMARKERS).

   RESTORING IT is a MotionValue on `.sw-nameplate__line` and nothing else. The
   stylesheet already multiplies the handover onto the parent, so a curve here
   composes with it rather than fighting it — and the component goes back to
   being a client component when it does.

   ── THE HANDOVER IS NOT PART OF THAT DECISION ─────────────────────────────
   Every fixed layer on this route has to go as the bands rise or it hangs over
   the work grid forever. That multiplier lives in the stylesheet
   (`1 - --sw-handoff`) and stays whatever else changes.

   ── OPACITY, NEVER `visibility` ───────────────────────────────────────────
   Whatever ends up driving it, the mechanism may not become a `visibility`
   flip the way `FlightFork`'s does. That component leaves the accessibility
   tree on purpose, because an expired cue should not be announced nine scenes
   into the garden. A heading must do the opposite: an h1 out of the tree is an
   h1 a screen-reader user cannot navigate to, which is the fault this
   component was built to fix.

   ── NO "use client" ───────────────────────────────────────────────────────
   With the curve parked there is nothing here but markup, so this renders on
   the server and ships no JavaScript. Add the directive back with the
   MotionValue, not before.
────────────────────────────────────────────────────────────────────────── */
export function FlightNameplate() {
  return (
    /* The outer node is what the stylesheet hangs the handover and the mount
       alignment on; the inner one is the line. Kept as two so a restored
       scroll curve has an element of its own to write to — one element with
       two opacities, one owned by Motion's render loop and one by CSS, is a
       fight with no upside. */
    <div className="sw-nameplate">
      {/* `type-cover` is the shared role (globals.css, from `--type-cover-*` in
          theme.css) — the same class "Funding Finder" wears on its project
          cover and the home page's band names wear further down. Applied here
          rather than in world.css so there is exactly one place the role is
          named, and so this line cannot drift from the covers it rhymes with.
          world.css adds only the ink, the measure and the arrival. */}
      <h1 className="sw-nameplate__line type-cover">Lizzie Teo</h1>
    </div>
  );
}
