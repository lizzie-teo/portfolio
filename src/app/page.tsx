import type { Metadata } from "next";
import { anchorScrollOffset } from "./components/Chapter";
import { ExploreCursor } from "./components/ExploreCursor";
import { ExplorationsBand } from "./components/ExplorationsBand";
import { GraphDesk } from "./components/GraphDesk";
import { HomeFlight } from "./components/HomeFlight";
import { HomeWorkBand } from "./components/HomeWorkBand";
import { bandHeading } from "./components/typography";
import { WorkGrid } from "./components/WorkGrid";
import { workEntries } from "./work/projects";

/* ─────────────────────────────────────────────────────────────────────────
   THE WALK IS THE FRONT DOOR, AND THE BANDS FOLLOW IT

   `/` opens on the garden flight — the floppy assembling over the frosted desk,
   then nine legs of scrub through the engraved garden, ending on the Macintosh
   lettering `hello world` with the closing sentence and "See the work" standing
   beside it. Selected work, Explorations and Writing sit underneath in ordinary
   flow. HomeFlight is the join: it mounts the engine, the glass pane, the site
   masthead and the arrival fork, and fades the flight's fixed layers out as the
   work band rises (world.css, THE HANDOVER).

   THIS PAGE OWNS NO CHROME OF ITS OWN. The masthead is mounted INSIDE the
   flight (HomeFlight → `.sw-masthead`), because that is where the route's
   --sw-* tokens are declared and the bar has to be drawn from them. A second
   `SiteHeader` here would be two fixed bars stacked.

   WHAT THIS REPLACED, twice over, because the arrangement has moved and come
   back. The flight was the front door; then it moved to `/world` and this page
   opened on `HomeHero`, a frameless picture of the walk's last frame with a
   headline and two controls above it. The owner's FigJam flow (20 Aug) put the
   walk back at the top of `/` — start on the floppy, scroll the legs, come to
   rest on the Macintosh with the sentence and the CTA, keep scrolling into the
   bands. `HomeHero` and `WorldTransition` are consequently unmounted; both are
   left on disk with notes rather than deleted, because that call is Lizzie's.
   `/world` is a redirect to `/` (next.config.ts) so old links survive.

   THE PAGE IS STILL THE SITE'S TABLE OF CONTENTS, and now all four masthead
   labels are places on it: `skills` (the flight's own container, which starts
   at scroll 0 and is exactly as tall as the scrub track), then work,
   explorations, writing. The bar highlights whichever one the reader is inside
   (lib/site-nav.ts, SiteHeader). That is the whole reason writing has its own
   band rather than sitting inside the work section as it used to: a contents
   line with a label that can never light up reads as broken.

   ANY JUMP THAT TOUCHES THE FILM IS INSTANT. A 520 to 920ms eased glide across
   the track plays seven scenes backwards at roughly 15x. The rule lives in
   lib/use-anchor-scroll.ts (THE FILM IS NOT SCRUBBED BY A NAVIGATION) and keys
   off the `data-sw-scrub-track` attribute ScrollWorld publishes, so band-to-band
   jumps below the flight keep the site's ordinary eased landing and everything
   that crosses the track does not. The arrival's skip and the ending's button
   carry the same rule in their own files.

   THE INDEXES STILL EXIST AND STILL MATTER. `/work` is the address to paste
   into a job application and `/explorations` is the full library. The masthead
   points at the BANDS rather than at either index — and as of Aug 2026 the work
   band's own "All work" link is gone too (see the note at that section), so
   `/work` currently has no door on this page. The explorations band still links
   through to its library.

   NO BAND ON THIS PAGE CARRIES A FILTER. The work band grew a rail for a
   stretch and it has come back off — not on the old grounds (that a filter
   inside one band of a page whose masthead is already a contents line is one
   navigation arguing with another) but on arithmetic: four projects today, six
   planned, and a control that narrows six items to two puts a decision in front
   of the content instead of a way through it. Both reversals are recorded in
   HomeWorkBand rather than deleted.

   THE THREE BANDS ARE THEREFORE ONE GRID, three across from `lg` — see
   gridColumns.ts. `/work` keeps its rail and waits until `xl` for the third
   column, because the rail has taken the width a third card would need.

   The statement hero this all replaced is kept whole and unlisted at
   /home-original — nothing about it was edited, so the compositions can be
   opened side by side for as long as that is useful.
────────────────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Lizzie Teo — Product designer",
  /* The walk is the page again, so the description describes the walk again.
     It was rewritten to describe a static hero while the flight lived at
     /world; this is the copy that stood before that, unchanged. */
  description:
    "Lizzie Teo is a product designer who makes complicated products simpler to use. What she does, told as one continuous walk through an engraved garden, with the case studies underneath it.",
};

/* Split once, on the server, for the writing band. The work band takes no slice
   from here — it filters the whole registry itself for case studies. It used to
   do that in the client, because a rail changed what was shown; the rail is
   gone and the band is a server component again, but the split stays in two
   places because the two bands are complementary halves of one registry and
   neither should need to know about the other. */
const articles = workEntries.filter((entry) => entry.kind === "article");

/* One shared measure for all three bands, so the headings stand on the same
   left axis and the page reads as one document rather than three stacked
   sections that happen to be adjacent. */
const bandInner =
  "mx-auto w-full max-w-[1800px] px-4 py-16 sm:px-6 md:px-8 lg:px-12 lg:py-24 xl:px-16 2xl:px-24";

export default function Home() {
  return (
    /* NO HeroToneProvider. It was here so SiteHeader could read the parked
       statement hero's hover inversion, and nothing on this page has written to
       it since the flight stopped flipping the bar. The context has a default
       (`dark: false`), so a provider that no value ever reaches is a wire with
       nothing on either end. /home-original and /hero-original still mount
       their own; the component is untouched. */
    <div className="min-h-screen bg-secondary text-foreground">
      <ExploreCursor />

      <main id="main" tabIndex={-1} className="outline-none">
        <HomeFlight>
          {/* ONE PLANE UNDER THE FLIGHT. The `--secondary` paint is on the page
              wrapper above rather than on each section so the bands read as
              divisions of one sheet; a background per section would put seams
              down the page that say "different surface" when the intended
              reading is "further down the same one".

              WHY --secondary AND NOT --background. The flight's own paper is
              `--sw-paper` (#F6F3EC) and `--secondary` (#F2F0EB) sits within
              1.02:1 of it, so the walk and the bands are one sheet and the
              handover has nothing visible to cross. `--background` (#FEFEFC) is
              a cooler near-white and would put the lower page a step away from
              the artwork above it. `.sw-sky` goes on painting behind everything
              after the handover as well, so there is one continuous ground from
              the first frame to the foot.

              No hairline on any edge, per style-rules §3: the seam at the top is
              carried by the flight dissolving, and the seams between bands are
              carried by their headings. */}

          {/* ── THE RULED SHEET, AND IT RUNS UNDER ALL THREE BANDS ──────────
              It was under the work band alone, and the note here used to argue
              for exactly that: the work band was a ruled WORK SURFACE with
              filters on it and the two below were for READING, so the paper
              changed where the job changed. That reading is retired (owner's
              call, Aug 2026) and the sheet is one sheet from the flight's foot
              to the end of the page.

              AND IT IS A THEME TOKEN NOW (owner's call, Aug 2026), which is the
              fourth thing this ground has been and the first that was not
              sampled off a picture. It was a pale green tint of the Macintosh
              hello-world screen the walk ends on; then nothing at all, GraphDesk
              painting lines and letting this page's --secondary plane show
              through between them; then #FBEEE4, the warm brown off leg-9's
              final frame; and now --accent, the theme's quiet neutral surface.
              It lands on the world pane's own grey anyway — --wgc-pane-solid and
              --accent are 1.010:1 apart — so the sheet still answers to the
              surface the reader was just reading on, without anyone having to go
              and derive it.

              AND IT IS A REAL SHEET NOW, which none of the three before it were.
              Every earlier ground was pinned to --secondary's own lightness by
              one figure — the 7:1 the quiet ink needs — so the paper could never
              be more than a hair off the plane behind it, and the owner's call
              was that it read as nothing. Any darkening breaks that floor, so
              the copy moved instead, exactly as GraphDesk's note has always said
              it would have to. The gain is the cards: they sit 1.085:1 above
              this sheet where they sat 1.019:1 above the last one.

              THE SEAM IT COSTS IS A VALUE STEP, NOT A CHANGE OF PAPER, which is
              the distinction the green's failure was really about. This shares
              its hue with everything it meets — 84.6°, against --sw-paper's
              87.5° and --secondary's 88.6° — so what is left at the flight's
              foot is 1.093:1 of tone on one continuous stock, not a second
              paper. The derivation and every measurement are in GraphDesk.

              WHY NOT THREE COLOURED SHEETS, which was the live alternative
              before the ground went away entirely, and is the thing to reread if
              this ever feels flat:

                A TINT HAS TO BE A TINT OF SOMETHING. The green had a derivation
                — a screen the reader had just walked to. A second and third hue
                would be colour invented to tell bands apart, which is the
                one-off colour style-rules §3 forbids.

                THREE COLOURS WOULD READ AS A CODE. Stacked, differently ruled
                sheets promise that the colour MEANS something, and the reader
                goes looking for a key that does not exist. It is the same
                objection `entries.ts` records against colour coding a verdict.

                MATCHING LUMINANCE ONLY BUYS SO MUCH. Contrast ratio says nothing
                about hue, so sheets matched on luminance still put a visible
                change-of-paper edge at every boundary. That is what made even
                ONE tinted sheet cost a seam, and it is the argument that
                eventually took the ground off altogether.

              WHAT IT COSTS, paid on purpose: the bands are told apart by their
              headings and their content alone, which is what the one-plane rule
              above wanted. If a band ever needs to be a different KIND of
              surface again, change the paper — not the colour of the ruling.

              SMALL TEXT HERE IS --foreground, AND THAT IS THE CONSEQUENCE OF THE
              GROUND RATHER THAN A CONSTRAINT ON IT — which is the reversal this
              pass makes, and the note here argued the opposite for three
              grounds. While the sheet was green the quiet token dropped from
              exactly 7.00:1 to 6.81:1, under the bar §4 holds small text to, and
              every lede and date was moved to --foreground, then moved back when
              the ground came off; the brown and the first grey were both LIFTED
              until they cleared 7.009:1 specifically to avoid making that move a
              third time. The cost of never making it was that the sheet could
              never be more than a hair off --secondary. So it is made: --accent
              reads 6.583:1 under the quiet token, the two ledes on this sheet
              carry --foreground at 9.769:1, and the ground is free to be a value
              rather than a hostage to one. desktopInk.line is the same #55504a
              and does not move — it is a boundary held to 3:1 (§12), not text.
              The Explorations stamp's ink levels are on the card stock, not on
              this sheet, and are untouched. */}
          <div className="relative">
            <GraphDesk />

            <section id="work" className={`relative ${anchorScrollOffset}`}>
              <div className={bandInner}>
                {/* THE BAND'S NAME IS RENDERED HERE, and that is what makes the
                    three headings on this page one set: "Selected work",
                    "Explorations" and "Substack" all sit at the top of
                    `bandInner`, on the same left axis, in the same role
                    (`bandHeading` — the case-study cover's own line, 40 → 88px,
                    so a name on this page and a project's name on its cover are
                    one scale; typography.ts carries the reasoning and the note
                    on what it replaced). While a filter rail ran here the rail
                    had an `h2` of its own — `sr-only` at first, then suppressed
                    outright — because a second `h2` naming `#work` would put two
                    names on one section in the outline. The band opens straight
                    onto the windows now, so only this one exists.

                    NO LEDE UNDER IT, unlike the two bands below. The rail's
                    inventory line said "Four projects and the writing that came
                    out of them", which stopped being true of this band the
                    moment writing moved out of the grid — and the ruled sheet
                    and the windows say the rest without a caption.

                    THE COST, recorded because it is real and did not change:
                    /work is not reachable from this page. The masthead points at
                    `#work` on the page rather than at the index, so the
                    standalone address — the one meant to be pasted into a job
                    application — has no door on the home page. If that matters,
                    the link comes back here; the index itself is untouched. */}
                <h2 className={`${bandHeading} text-foreground`}>
                  Selected work
                </h2>

                <div className="mt-10">
                  <HomeWorkBand />
                </div>
              </div>
            </section>

            <section
              id="explorations"
              className={`relative ${anchorScrollOffset}`}
            >
              <div className={bandInner}>
                <ExplorationsBand />
              </div>
            </section>

            {/* THE WRITING BAND, AS WINDOWS RATHER THAN AS AN INDEX.
                ───────────────────────────────────────────────────────────────
                It shows the same `DesktopProjectCard` the work band shows,
                drawing an article: kind mark "Writing" in the title bar, the
                topic on the sector line, a charcoal flood on hover because there
                is no client colour to reveal. The cards were already in the work
                band's grid; this band is where they went when that grid became
                work only, so nothing new was designed and nothing was lost.

                `WritingIndex` IS NOT GONE AND WAS NOT WRONG. It still runs
                `/work`, and its argument — that an essay is a text object, so
                its index is a list of date, title and deck, which scales to
                twelve posts where twelve tiles would swamp four case studies —
                is the thing to reread if this shelf ever feels like a blog. The
                counter-argument that wins HERE is that this page now sets
                writing beside work as a peer under its own `h2`, and a list
                beneath two bands of cards read as a footnote to them rather than
                as the third thing she does.

                THE HEADING NAMES THE PUBLICATION, not the activity (owner's
                call). The masthead still says "Writing" and lands here — a nav
                label naming the subject over a heading naming where it lives is
                a small mismatch, and the alternative (a nav item reading
                "Substack") is the one lib/site-nav.ts records itself talking out
                of. Flip both together if the mismatch ever reads as a bug.

                NO PLACEHOLDER. `showPlaceholder` stays off: the "coming soon"
                window promises another PROJECT, and there is nothing here for it
                to promise. */}
            <section id="writing" className={`relative ${anchorScrollOffset}`}>
              <div className={bandInner}>
                <h2 className={`${bandHeading} text-foreground`}>Substack</h2>
                {/* --foreground, 9.769:1 on the sheet's --accent. It was the
                    quieter --secondary-foreground, which measures 6.583:1 there
                    and no longer clears the 7:1 bar small text is held to — the
                    cost of a sheet that actually reads, taken deliberately. See
                    the sheet note above. */}
                <p className="mt-5 max-w-prose text-sm leading-relaxed text-foreground md:mt-6">
                  Essays on design engineering, testing and working with AI. Each
                  one opens in a new tab.
                </p>

                {/* `threeFrom="lg"` matches the work band above and the
                    explorations band between them — no rail on any of the
                    three, so the third column arrives at `lg` rather than
                    waiting for `xl` as it does on the railed `/work` shelf.
                    Three articles at three across is one complete row. */}
                <div className="mt-10">
                  <WorkGrid card="desktop" entries={articles} threeFrom="lg" />
                </div>
              </div>
            </section>
          </div>
        </HomeFlight>
      </main>
    </div>
  );
}
