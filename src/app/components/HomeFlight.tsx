"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { anchorLandingTarget } from "../lib/use-anchor-scroll";
import { ScrollWorld } from "../world/ScrollWorld";
import { WorldGlassCard } from "../world/WorldGlassCard";
import { FlightExit } from "./FlightExit";
import { FlightFork } from "./FlightFork";
import { SiteHeader } from "./SiteHeader";
import "../world/world.css";

/* ─────────────────────────────────────────────────────────────────────────
   THE FLIGHT, AS THE FRONT DOOR — and the handover to the bands below it.

   `/` opens on the garden walk (world/ScrollWorld.tsx): the floppy assembling
   over the frosted desk, nine legs of scrubbed cinematic, and the Macintosh
   lettering `hello world` at the end of it. Selected work, Explorations and
   Writing follow in ordinary flow. This component is the join.

   ── IT WAS DEAD FOR A DAY, AND IT IS THE REASON THE JOIN WORKS ────────────
   The walk moved to its own route for one iteration; `/` opened on a static
   picture and nothing needed a handover, so this file sat unreferenced. Then
   the owner's flow put the walk back at the top of `/` with the bands under it,
   which is the exact arrangement this component was written for. Nothing about
   it had to be redesigned — only the SEO mirror's ending and the flight's
   anchor id moved. Deleting it would have cost a rebuild.

   ── THE PROBLEM THIS FILE EXISTS TO SOLVE ─────────────────────────────────
   Every layer of the flight is `position: fixed` — the paper, the picture,
   the panel, the copy, the trail, the glass. With nothing under them that is
   free. Put three bands underneath and they would hang over the rest of the
   page for the whole of it.

   So the flight has to HAND OVER. This component measures exactly one thing:
   how far the top of the work section has travelled up the window, and it
   publishes that as `--sw-handoff` (0 → 1) on the document element. world.css
   reads it back and fades the flight's fixed layers out across that window
   (THE HANDOVER). The engine is untouched, as it must be — it is the vendored
   upstream file and knows nothing about anything below its own track.

   ── WHY A SENTINEL AND NOT THE TRACK'S OWN HEIGHT ─────────────────────────
   The obvious alternative is to measure the engine's track: it sets its own
   height to `totalW * vh + vh` and the flight is over at the end of it. That
   number is computed inside the engine, re-computed on every resize, and is
   not published anywhere — reading it would mean either reaching into the
   engine's DOM for a height it owns, or duplicating the section-weight sum
   that world.css already warns must never be duplicated (THE WAYMARKERS).

   The work section's own top edge is the same instant expressed as a thing
   the DOM already knows, and it stays correct if a leg's `scroll` weight ever
   changes. `offset: ["start end", "start start"]` runs the value from 0 when
   that edge touches the bottom of the window to 1 when it reaches the top —
   which is precisely the viewport of scrolling during which the bands arrive.

   ── AND THE FLIGHT'S OWN PERCENTAGES DO NOT DRIFT ─────────────────────────
   Worth stating because it is the thing that used to break when the walk
   shared a page: every ranged animation in world.css is a percentage OF THE
   FLIGHT, and those used to resolve against the root scroller's whole range —
   which on `/` includes the bands, so every chapter's copy landed late by that
   ratio. It is solved and it is not solved here: `.sw-root` carries a VIEW
   timeline (world.css, THE FLIGHT IS ITS OWN TIMELINE), so the denominator is
   the track's own contain range and nothing rendered below it can move that.
   That machinery was built for exactly this arrangement; this file only has to
   fade things out.

   ── THE MASTHEAD DOES NOT FADE ────────────────────────────────────────────
   It is the only piece of the flight's chrome that is site chrome rather than
   scenery, and a portfolio that hides its own navigation for the fourteen
   viewports a reader spends in the walk is a portfolio betting everything on
   the walk. So it stays fixed across the handover and simply acquires a
   surface: `tone="bare"` paints nothing while it stands on the artwork, and
   world.css keys an opaque `--secondary` plate to `--sw-handoff` so the bar has
   a ground by the time band content can reach the row (THE PLATE ARRIVES WITH
   THE PAPER). It does not flip INK — the bands are light paper, so a light-ink
   masthead over them would be an invisible navigation.

   ── AND IT DOES NOT STRADDLE THE FILM WHEN A READER NAVIGATES ─────────────
   Every masthead anchor on this page crosses the track, and easing across
   ~11,000px of scrub plays seven scenes backwards at roughly 15x. The rule and
   its implementation live in lib/use-anchor-scroll.ts (THE FILM IS NOT SCRUBBED
   BY A NAVIGATION); ScrollWorld publishes the `data-sw-scrub-track` attribute
   it tests against. Nothing here has to know about it, which is the point of
   putting the rule in the hook. */
export function HomeFlight({ children }: { children?: React.ReactNode }) {
  const workRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: workRef,
    offset: ["start end", "start start"],
  });

  /* The flight is gone by 0.62 rather than by 1.0: the last third of that
     window is the grid genuinely on screen and being read, and a picture
     still dissolving underneath it at that point reads as a page that has not
     finished loading. Eased by the caller's own scroll, so it reverses exactly
     on the way back up. */
  const veil = useTransform(scrollYProgress, [0, 0.62], [0, 1], {
    clamp: true,
  });

  /* Written imperatively from the MotionValue — no React render per scroll
     frame. Same pattern as WorldGlassCard's three published values, and the
     same cleanup: the property is removed on unmount so a client-side
     navigation away can never leave a half-faded flight behind. */
  const hiddenRef = useRef("");
  useMotionValueEvent(veil, "change", (v) => {
    const root = document.documentElement;
    root.style.setProperty("--sw-handoff", String(v));
    /* Hidden means hidden: the sign-off's button keeps its pointer events at
       opacity 0, so a fully faded flight would still be eating clicks over the
       top of the work grid. Only written when it crosses. */
    const vis = v > 0.98 ? "hidden" : "visible";
    if (vis !== hiddenRef.current) {
      hiddenRef.current = vis;
      root.style.setProperty("--sw-handoff-vis", vis);
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--sw-handoff", String(veil.get()));
    root.style.setProperty(
      "--sw-handoff-vis",
      veil.get() > 0.98 ? "hidden" : "visible",
    );
    return () => {
      root.style.removeProperty("--sw-handoff");
      root.style.removeProperty("--sw-handoff-vis");
    };
  }, [veil]);

  /* ── THE HASH IS RE-LANDED ONCE THE TRACK HAS ITS HEIGHT ──────────────────
     ARRIVING AT `/#work` FROM ANYWHERE ELSE USED TO DUMP THE READER AT THE TOP
     OF THE WALK, and intermittently, which is why it read as flaky rather than
     as broken. The mechanism is an ordering one:

       · `#work` is a SIBLING BELOW the flight, and the flight's scroll track is
         built by the engine in ScrollWorld's mount effect (a passive effect —
         it runs after paint). Until it runs, the engine container is the height
         of the hidden SEO copy block and nothing else.
       · The browser's hash landing — and Next's, on a client-side navigation —
         happens BEFORE that, in the commit. At that moment `#work` is a few
         hundred pixels down a short document, so the scroll lands there.
       · The engine then lays the track out and the document grows by eleven
         thousand pixels UNDERNEATH the reader. They are now parked on the
         floppy at the top of the walk, with `#work` in the address bar.

     Whether it looked right afterwards came down to Chrome's scroll anchoring
     deciding whether to compensate for content growing above the viewport,
     which is exactly the kind of thing that lands differently on a warm cache
     than a cold one. Hence "sometimes".

     So the hash is landed again here, once, after the track exists. This effect
     is the right place for it by construction: child effects run before their
     parent's, so ScrollWorld's engine mount and SiteHeader's
     `--site-header-bottom` publish (which the 1cm landing is measured from)
     have both already happened. The rAF gives the growth a frame to settle
     before the position is read.

     INSTANT, NEVER EASED: this is an arrival, not a navigation, and the
     distance it covers is the whole film (use-anchor-scroll.ts, THE FILM IS NOT
     SCRUBBED BY A NAVIGATION).

     BACK/FORWARD IS LEFT ALONE. The browser restores a real scroll position on
     a history traversal and that position is the reader's, not the hash's;
     overriding it would replace one wrong landing with another. */
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const entry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (entry?.type === "back_forward") return;

    const frame = requestAnimationFrame(() => {
      const element = document.getElementById(id);
      if (!element) return;
      const top = anchorLandingTarget(element);
      // Already there: the browser got it right on its own (a hash naming the
      // walk itself, or a page whose track was up before the landing).
      if (Math.abs(top - window.scrollY) < 4) return;
      window.scrollTo({ top, behavior: "instant" });
      // Same keyboard-continuity contract as every other anchor landing on the
      // site: Tab continues from the band, not from the top of the document.
      if (!element.hasAttribute("tabindex")) {
        element.setAttribute("tabindex", "-1");
      }
      element.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      {/* `id="skills"` — the first entry in the masthead's contents line
          (lib/site-nav.ts). The engine's container starts at the top of the
          document and runs the full height of the track, so "My skills" names
          the whole walk, stays lit for it, and returns the reader to the floppy
          when clicked. */}
      <ScrollWorld id="skills">
        {/* Both overlays are `position: fixed`, so neither adds document
            height and the flight still starts at scroll 0 — the engine lays
            its segments out from the top of the document and nothing may sit
            above its track. They render INSIDE the engine container because
            `.sw-root` is where the route's --sw-* tokens are declared, and the
            panel's whole morph is written in calc() against them. */}
        <WorldGlassCard />
        <div className="sw-masthead">
          {/* `bare` — no plate while the bar stands on the picture; anything
              painted behind it there would be a slab laid over the artwork, and
              every plate treatment is on this artwork's rejected list
              (world.css, THE SITE MASTHEAD). The plate arrives with the paper
              instead, keyed to `--sw-handoff`.

              `flush` — the flight's layers are all fixed and its track must
              start at scroll 0, so there is nothing for a spacer to push down.

              THE PANE GROUNDS THE BAR ON PHONES. Below 861px `.sw-stage`'s top
              edge lerps down to a clearance line under this row as the pane
              opens, uncovering `.sw-sky`, so the ink measures 13.4:1 at every
              scene instead of sitting on a night sky (world.css, THE PICTURE
              STARTS BELOW THE MASTHEAD). That machinery rides `--wgc-move` and
              `--site-header-bottom` and comes with the stylesheet; it is listed
              here because it is the reason `bare` is safe at 320px. */}
          <SiteHeader tone="bare" flush />
        </div>
        {/* ── THE LETTERHEAD IS GONE, AND THE MASTHEAD IS THE h1 NOW ────────
            A cover-line "Lizzie Teo" used to stand here, in the band between
            the bar's foot and the head of the plates (`FlightNameplate`, parked
            on disk with its full history). Removed on the owner's call, Aug
            2026: it was the THIRD setting of the same name on one screen. The
            floppy's own archival label prints it — and WorldGlassCard's note
            says that is where it belongs and only belongs — and the masthead
            prints it again a row above. The cover line said nothing the reader
            had not just read, and it was the largest thing on a screen whose
            subject is the disk.

            NOT SIMULTANEOUS, WHICH IS WHY IT SURVIVED THREE PASSES BEFORE
            ANYONE CAUGHT IT: the disk goes into the slot at morph p 0.06 → 0.34
            and `--wgc-move` does not start until 0.54, so the line set well
            after the floppy had gone rather than beside it. It read as an echo
            a beat later instead of as a collision, which is a quieter fault.

            THE h1 DID NOT GO WITH IT. `SiteHeader` renders its wordmark as the
            heading on `/` (ON `/` THE WORDMARK IS THE PAGE'S <h1>), so the name
            the page already shows is the name the outline uses, rather than a
            second invisible one saying the same words. It is in the served HTML
            and in the accessibility tree at every moment — which the
            `[data-sw-seo]` heading below is not, since the engine sets `hidden`
            on that block at mount. */}
        {/* The fork at the foot of the first screen: the walk, or the way past
            it. It mounts here rather than being drawn by the engine for the
            same reason the glass card and the masthead do — `.sw-root` is where
            the route's --sw-* tokens live, and the engine is vendored upstream
            and is not edited. It replaces the engine's own `.sw-hint`, which
            world.css switches off (Deleted chrome).

            AFTER THE MASTHEAD, NOT BEFORE IT, and that is the only reason this
            line is here rather than beside WorldGlassCard. Both are fixed
            layers with explicit z-indexes (30 against the bar's 50), so DOM
            order buys nothing visually and everything for the keyboard: a
            reader tabbing in from the top of the page should meet the site's
            own navigation before an in-page cue, not after it.

            IT IS NOT IN THE HANDOVER. Every other fixed layer here has to be
            faded out over the bands; this one is already at zero, and out of
            the accessibility tree, half a viewport in. */}
        <FlightFork />
        {/* The walk's ONE door — "View selected work", a button flush to the
            foot of the pane, on every leg, from the first paint to the handover
            into the work band (world.css, THE STANDING EXIT). It used to be two
            objects: a quiet sentence-link here that faded out across leg 8, and
            a real button the engine built inside the sign-off's own copy
            article. They are one control as of Aug 2026 (owner's call), so the
            handover at the ending moves nothing.

            IT STANDS ON THE FLOPPY SCREEN, and that reverses a twice-settled
            call. It used to ride `--wgc-copy` and fade up with the pane, on the
            argument that it is furniture PRINTED on the panel; a solid button
            carries its own ground, and the way out has to be visible on the
            first screen. Both sides are in world.css (THE GATE IS GONE).

            AFTER THE FORK, FOR THE SAME KEYBOARD REASON the fork is after the
            masthead: both are fixed layers with their own z-indexes, so DOM
            order costs nothing visually, and a reader tabbing in from the top
            should meet the site's navigation, then the arrival's cue, then the
            exit. The cue holds nothing focusable, so in practice this button is
            the first tab stop inside the flight, and it is one from the first
            frame. */}
        <FlightExit />
        {/* The plain-markup mirror of the flight's copy. The engine hides this
            block on mount; crawlers, link previews and no-JS visitors read it
            from the served HTML. Keep it in sync with the CONFIG copy in
            world/ScrollWorld.tsx: each h3 is a scene's `label` and each p is
            that scene's `title`.

            TWO PARAGRAPHS HAVE NO h3 OVER THEM, and that is the mirror doing
            its job rather than two missing headings. An h3 here is a scene's
            `label`, and `label` is what puts a dot on the trail — so the two
            panes that speak without being stops on the walk have none: leg 1's
            title card and the sign-off. Both DO carry an eyebrow on the page
            ("Product designer" and "In practice"), and neither is mirrored here
            on purpose: an eyebrow is lockup furniture, and an h3 reading
            "Product designer" would put a role heading over a sentence that is
            already the role stated in full.

            Legs 6 and 8 contribute nothing at all, which is also correct. Leg 6
            has no title of its own (chapter 7's sentence spans it on the page)
            and leg 8 is the wordless pull-back. A leg that says nothing to a
            reader says nothing to a crawler.

            IT NO LONGER OWNS THE <h1>, and the whole block stepped down a level
            when it stopped. The masthead's wordmark is the page's heading now
            (SiteHeader, ON `/` THE WORDMARK IS THE PAGE'S <h1>), and unlike this
            block it is in the accessibility tree at every moment — this one is
            `hidden` from mount, which is `display: none` and therefore out of
            the tree entirely, so with JavaScript on the page's only h1 was
            invisible to a screen reader.

            BOTH ARE IN THE SERVED HTML, which is the reason for the step down
            rather than a second h1. A crawler and a no-JS reader see the bar
            AND this block, so an h1 here would ship a second one on every
            render. The outline that ships now is: h1 the page's name, h2 the
            walk, h3 each thing the walk is about, and then the bands' own h2s
            below — which is the same shape a reader with JavaScript gets, minus
            the block. If a heading level moves here, move the whole ladder.

            THE FOOT IS THE ENDING, and it is two things: the sign-off's line
            and the one button. No address — the pane's letterhead
            line was removed and this block mirrors the flight, so it must not
            offer a route the flight has stopped offering. A reader without
            JavaScript meets a finished machine and a reachable set of bands,
            which is the requirement: the walk's rest state has to be a hero
            that works without the film. */}
        <div data-sw-seo>
          <h2>
            A walk through what I do, from the first conversation to the shipped
            screen
          </h2>
          <p>I make complicated products simpler to use.</p>
          <h3>Systems thinking</h3>
          <p>Ten years of improving complex workflows for teams and users.</p>
          <h3>Prototyping</h3>
          <p>Prototyping with paper, Claude Code or Figma.</p>
          <h3>Design systems</h3>
          <p>Building atomic design systems a team can run without me.</p>
          <h3>Bridging design &amp; code</h3>
          <p>Handing over files an engineer or an AI can build from.</p>
          <h3>Start to finish</h3>
          <p>Taking a product from discovery to the shipped screen.</p>
          <p>Each case study shows how I work and what shipped.</p>
          <p>
            <a href="#work">View selected work</a>
          </p>
        </div>
      </ScrollWorld>

      {/* Everything below the flight, and the thing the handover is measured
          against: the first band under here carries the `#work` id the flight's
          own button and the arrival's skip both point at.

          `.sw-below` sits on this wrapper rather than on each band. Every layer
          of the flight is fixed and therefore above ordinary flow content, so
          anything under here needs lifting to z-index 45 — above the trail's
          40, below the masthead's 50. Putting it on the wrapper means a band
          added to page.tsx later cannot forget it and slide under the picture,
          which is a failure that only shows up mid-handover. */}
      <div ref={workRef} className="sw-below">
        {children}
      </div>
    </>
  );
}
