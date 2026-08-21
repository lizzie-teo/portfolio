"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { siteNav, siteNavSections } from "../lib/site-nav";
import { useActiveSection } from "../lib/use-active-section";
import { useAnchorScroll } from "../lib/use-anchor-scroll";
import { HERO_VEIL_INK } from "./HeroInkVeil";
import { useHeroTone } from "./HeroToneContext";

type SiteHeaderProps = {
  /**
   * light — the neutral shell: an opaque page-coloured bar. dark — pages whose
   * surface is the grout token (the case-study tile system), where the bar
   * tints to the grout and its text goes light. bare — paints nothing at all,
   * for the garden flight, where a plate would read as chrome laid over the
   * artwork.
   *
   * `bare` is only safe on a route that supplies the bar's ground some other
   * way. /world does: the picture's top edge stops below this row at every
   * width, so the bar stands on the route's own paper (world.css, THE PICTURE
   * STARTS BELOW THE MASTHEAD). It is not a licence to set dark ink on whatever
   * happens to be passing underneath.
   *
   * Omit the prop to let the bar follow the hero's hover tone
   * (HeroToneContext), which is what the parked /hero-original and
   * /home-original compositions still rely on.
   */
  tone?: "light" | "dark" | "bare";
  /**
   * Skip the in-flow spacer. Pass it wherever the page's own first element is
   * already positioned to sit under a fixed bar — the garden flight, whose
   * layers are all fixed and whose track must start at scroll 0 with nothing
   * above it.
   */
  flush?: boolean;
};

/**
 * The drawn segment under a hovered word hangs off the bottom edge of a
 * `leading-none` box: it sits at `top-full` of its label's line box.
 * `leading-none` puts that edge a hair below the baseline — an underline
 * position, never cap-height — and because it is derived from the line box
 * rather than a hand-set offset, it cannot drift into a strikethrough when the
 * type scale changes.
 *
 * Timing: Tailwind's `ease-out`/`ease-in` curves and the 200ms/100ms steps
 * below are literally the `out`/`in` easings and the `fast`/`instant`
 * durations in `src/app/lib/motion.ts`, so the two stay in sync without
 * mirroring the tokens into CSS custom properties.
 *
 * Exported because the masthead's typographic behaviour travels: the site-level
 * return inside the chapter navigation (ChapterNavMasthead) is a fragment of
 * this same line, and reuses the identical drawn segment so the two read as one
 * device rather than two lookalike underlines. Pair it with an `origin-*` class
 * and a `group` ancestor.
 */
export const underlineSegment =
  "pointer-events-none absolute inset-x-0 top-full h-px bg-current " +
  "scale-x-0 transition-transform duration-100 ease-in " +
  "group-hover:scale-x-100 group-hover:duration-200 group-hover:ease-out " +
  "group-focus-visible:scale-x-100 group-focus-visible:duration-200 group-focus-visible:ease-out " +
  // Reduced motion: the segment is already at full width and simply switches
  // on. No scaleX draw to perceive.
  "motion-reduce:scale-x-100 motion-reduce:opacity-0 motion-reduce:transition-opacity motion-reduce:duration-0 " +
  "motion-reduce:group-hover:opacity-100 motion-reduce:group-focus-visible:opacity-100";

/**
 * "YOU ARE HERE" IS AN UNDERLINE, AND WEIGHT IS THE WHOLE SIGNAL.
 *
 * ── THIS MARK USED TO SIT ABOVE THE WORD, AND THE ARGUMENT FOR THAT IS WORTH
 * KEEPING, BECAUSE IT IS WHAT THIS VERSION HAS TO ANSWER ────────────────────
 * The active state was once the hover segment held open, so hovering any
 * inactive label impersonated the active one. The fix taken then was to put the
 * two marks on OPPOSITE SIDES of the word: hover underneath, where an underline
 * has always meant "this is a link and you are touching it", and position above,
 * where nothing else on this site draws. Two marks that cannot be read as
 * degrees of the same thing.
 *
 * It is under the word again (owner's call, Aug 2026). An overline is an unusual
 * mark and it read as one — a rule floating above a word looks like a fragment
 * of a border more than like a position, and the convention it was avoiding is a
 * convention because readers already know it.
 *
 * SO THE COLLISION IS ANSWERED BY WEIGHT AND BY EXCLUSION, NOT BY POSITION.
 * Two differences, and the second is what makes the first sufficient:
 *
 *   TWO PIXELS AGAINST ONE. The hover hairline is 1px and this is 2px, drawn
 *   hard against the line box rather than offset from it. Doubling the weight is
 *   the largest difference available on one edge.
 *
 *   THEY ARE NEVER BOTH DRAWN. The hover segment is suppressed on the active
 *   item (see the call sites). That is what retires the impersonation problem
 *   for good rather than merely making it less likely: a reader hovering an
 *   inactive label sees a 1px rule DRAW ITSELF, and the active label carries a
 *   2px rule that was already there and never animates. Different weight,
 *   different behaviour, and no item ever shows both.
 *
 * WHY NOT DIM THE OTHERS. Because the nav is uppercase tracked and held to 7:1:
 * any treatment that makes one label stand out by lowering the others lands near
 * 4.9:1 and buys legibility with legibility. Every label stays at full ink in all
 * three tones and the mark alone carries the state. It draws in `bg-current`, so
 * it inherits whatever ink the tone already resolved — charcoal on the light
 * glass, `--grout-foreground` on grout, the route's own `--sw-ink` on the bare
 * garden flight — and there is no tone matrix to keep in step.
 *
 * IT DOES NOT TRAVEL BETWEEN LABELS, and that is deliberate. A pip sliding along
 * the row was the obvious flourish and it is the wrong one for a scroll-spy: the
 * state changes as often as the reader scrolls a band, and under a fast scroll of
 * the home page the mark would cross the whole contents line four times. A
 * printed contents line does not animate; it is simply set that way. So the mark
 * cross-fades at `instant` and holds still.
 *
 * `top-full` with no offset, matching `underlineSegment` exactly: `leading-none`
 * puts the box edge a hair below the baseline, which is an underline position and
 * never a strikethrough, and deriving it from the line box means it cannot drift
 * when the type scale moves. Both marks sit well inside the link's 16px touch
 * padding, so neither is clipped.
 */
const activeMark =
  "pointer-events-none absolute inset-x-0 top-full h-0.5 bg-current " +
  "transition-opacity duration-100 ease-out motion-reduce:transition-none";

/**
 * ── BELOW `md` THE CONTENTS LINE IS A MENU ──────────────────────────────────
 *
 * WHAT WAS ACTUALLY BROKEN. Not the type size — the HEIGHT. Four tracked
 * uppercase labels are about 370px of type against 343px of content width at
 * 375px, so the row wrapped twice: wordmark, then the nav across two lines. That
 * is a ~118px bar, and because the bar is fixed it held ~18% of a phone viewport
 * for the whole of every page, and about 45% at 400% zoom (WCAG 1.4.10 Reflow).
 * The 36px touch targets were a real defect too — and an inverted one, since the
 * padding stepped UP at `sm` and gave the precise pointer the bigger target —
 * but they were the cheap half of the fix. Collapsing to one line is the
 * expensive half.
 *
 * ── THERE IS NO ICON FLIGHT ANY MORE, AND THE REASON IS WORTH KEEPING ───────
 * This menu shipped with one: four items are separated by exactly three rules, a
 * hamburger is exactly three rules, so each bar flew down and unfolded into the
 * separator it always was. The identity was the whole justification for the
 * motion — it was not decoration, it was the same three marks in two places.
 *
 * THE DIVIDING LINES ARE GONE (owner's call, Aug 2026), and the flight went with
 * them rather than being kept. With no separators to land on, three rules
 * travelling 100-plus pixels and dissolving would be movement that resolves into
 * nothing — which is precisely the ornament the identity argument existed to
 * avoid. Keeping the animation after removing its destination would have been
 * the worse call. A list of four needs no rules to be read: the 56px rows and
 * the sheet's own foot edge carry it.
 *
 * SO THE TRIGGER IS AN ORDINARY HAMBURGER that cross-fades to the word "Close".
 * §7's frequency gate wants a repeated in-flow control quick and quiet, so the
 * swap is `instant` (100ms) and nothing moves. §3 asks nav states to be "thin
 * underlines or precise text changes, not filled pills" — a labelled close is
 * that, and it beats an X, which would be the only glyph on this site that is
 * not a rule.
 *
 * The delight the flight was carrying moved to where it costs nothing: the
 * labels still arrive in reading order behind the sheet (see `menuContent`).
 *
 * ── THE SHEET IS POSITIONED IN VIEWPORT SPACE OFF A MEASURED BAR ────────────
 * Not off the header's box, and not off padding utilities. `/` mounts this bar
 * inside the garden flight, where world.css pins it to the route's own axis and
 * insets it from both window edges; a sheet on `inset-x-0` of the header there
 * would be a card floating in from 18px and 49px rather than a menu. One
 * measurement of the bar's foot drives the sheet and its labels, so both are
 * correct however a stylesheet chooses to place the bar.
 */
const MOBILE_ROW_H = 44; // h-11 — the touch-target floor, and the pre-measure fallback

/**
 * Top masthead — line one of the site's table of contents, and now a fixed bar
 * that is on screen for the whole of every page.
 *
 * ── WHY IT IS FIXED AGAIN, AFTER BEING DELIBERATELY STATIC ────────────────
 * It used to sit in normal flow and scroll away, on the argument that a bar
 * chasing the reader is a distraction and that the ChapterDock carries
 * wayfinding during a long read. That held while the labels were four separate
 * addresses. They are not any more: every label names a band of the home page
 * (lib/site-nav.ts), the bar highlights the one the reader is inside, and a
 * table of contents that leaves the room the moment you start reading cannot do
 * that job. The dock still owns chapter-level position inside a case study —
 * the two do not overlap, because the bar's four ids do not exist there and it
 * simply shows nothing.
 *
 * ── THE SPACER IS A HIDDEN COPY OF THE BAR, NOT A MEASURED HEIGHT ─────────
 * A fixed bar takes its own height out of the flow, so every page whose content
 * starts at the top needs that height back. The obvious fix is to measure the
 * bar and pad by the number, and it is wrong here: the row WRAPS onto a second
 * line somewhere near 500px (see the flex-wrap note below), so its height is a
 * function of the viewport and of whatever the labels are renamed to later. A
 * measured value is also only correct after hydration, which means a visible
 * jump on load at any width where the guess was wrong.
 *
 * So the spacer is the same markup rendered again, invisible and inert. It
 * wraps exactly when the real bar wraps, at every width, with no script — the
 * one duplication in this file that is cheaper than the alternative.
 *
 * `--site-header-bottom` is published as well. It began as the anchor-landing
 * offset (Chapter.tsx `anchorScrollOffset`), read once at click time, where
 * being a frame late costs nothing. It has a second reader now: the garden
 * flight sets the picture's top edge from it (world.css, THE PICTURE STARTS
 * BELOW THE MASTHEAD), and reads it continuously rather than on a click. The
 * ResizeObserver below already covers every way this bar's height can change,
 * wrap included, so a frame of lag is still the whole of the exposure — but
 * treat the property as a published contract with two consumers rather than as
 * an internal number.
 *
 * ── SURFACE: THE BAR IS PRINTED ON THE PAPER, NOT LAID OVER IT ────────────
 * A static bar could paint nothing, because no content ever passed beneath it.
 * A fixed one cannot — type would scroll through type — so the light tone is an
 * opaque plate. The design decision is which paper that plate is made of, and
 * the answer is `--secondary` rather than `--background`.
 *
 * `--background` (#FEFEFC) is the shell's cool page ground and it is not a
 * surface this bar ever actually stands over. The two that are: the home page's
 * band plane, which IS `--secondary` (#F2F0EB) end to end below the flight, and
 * the flight's own `--sw-paper` (#F6F3EC), which `--secondary` sits within
 * 1.02:1 of — that near-identity is already the documented reason the bands
 * chose it (page.tsx, WHY --secondary AND NOT --background). So on the page
 * that matters most the plate is not a plate at all: the contents line reads as
 * printed on the sheet, with no rectangle hovering over it, which is exactly
 * what the cheap treatments (frost, scrim, difference blend — all three refused
 * in world.css, THE SITE MASTHEAD) were reaching for and none of them got.
 *
 * On a light route whose own ground is `--background` (`/explorations`, an
 * exploration entry) the same plate lands one whisper step warmer than the page,
 * about 1.05:1. That is a nameplate footing rather than a slab, and it is the
 * site's own quiet-panel token doing the job it is defined for (style-rules §3).
 * No hairline under it: a tonal step is the edge, and drawing a rule as well is
 * the thing §3 explicitly warns against.
 *
 * Ink holds everywhere it matters — `--foreground` measures 10.39:1 on
 * `--secondary`, the value the home bands are already verified at.
 *
 * ON THE GARDEN FLIGHT THE PLATE ARRIVES WITH THE PAPER. The bar is `bare` over
 * the artwork, where any plate would be chrome laid on the picture; it takes the
 * same `--secondary` surface across the handover, driven by the `--sw-handoff`
 * value the page already publishes. See world.css, THE SITE MASTHEAD.
 */
export function SiteHeader({ tone, flush }: SiteHeaderProps) {
  const { dark: heroDark } = useHeroTone();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  /**
   * ONE MEASUREMENT DRIVES THE WHOLE MENU, and it is the fix for the bug that
   * shipped first: the geometry was written from the bar's padding utilities and
   * a hardcoded `px-4` gutter, and `/` honours neither. There, world.css pins the
   * bar to the flight's own axis (18px in on the left at 375px, 49px on the right
   * to clear the trail's waymarkers) and flattens the wrapper's padding to zero.
   * Every number the flight was built on moved, so the rules missed the button
   * they are supposed to be folded inside.
   *
   * Measuring the trigger and the bar's foot instead makes the menu correct on
   * any route by construction, however a stylesheet chooses to place the bar —
   * and it deletes the gutter constant rather than teaching it a second value.
   * `null` until the first measure; the flight renders on a sane fallback with
   * transitions suppressed so the correction cannot be seen as a twitch.
   */
  /**
   * ONE MEASUREMENT — THE BAR'S FOOT — and it is the fix for the bug that shipped
   * first: the menu's geometry was written from the bar's padding utilities and a
   * hardcoded `px-4` gutter, and `/` honours neither. There, world.css pins the
   * bar to the flight's own axis and flattens the wrapper's horizontal padding,
   * so every number the sheet was built on moved.
   *
   * Measuring instead makes the menu correct on any route by construction, and it
   * deletes the gutter constant rather than teaching it a second value. `null`
   * until the first measure; the sheet is closed and invisible until then, so the
   * fallback is never seen.
   */
  const [barBottomPx, setBarBottomPx] = useState<number | null>(null);

  // The spy only means anything on the home page — it is the only route whose
  // sections these ids name. Elsewhere the loop finds no elements and returns
  // null, but there is no reason to run it at all.
  const isHome = pathname === "/";
  const activeSection = useActiveSection(isHome ? siteNavSections : []);
  const handleAnchor = useAnchorScroll();

  // Publish the bar's live BOTTOM EDGE for the anchor-landing offset, and for
  // the garden flight's picture inset (see above). Every
  // anchored section lands 1cm below the bar now rather than 1cm below the
  // viewport, so the gap the reader sees is the gap that was designed.
  //
  // The bottom edge and not the height, because the two are not the same number
  // everywhere: on the garden flight the bar is inset from the top of the window
  // (world.css sets `top: clamp(14px, 2.4vw, 26px)`), so padding by its height
  // alone would land every section that much too high. Because the element is
  // fixed, its rect is viewport-relative and this value is constant as the page
  // scrolls.
  useEffect(() => {
    const element = headerRef.current;
    if (!element) {
      return;
    }
    const publish = () => {
      const bar = element.getBoundingClientRect();
      document.documentElement.style.setProperty(
        "--site-header-bottom",
        `${bar.bottom}px`,
      );
      setBarBottomPx(bar.bottom);
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(element);
    // The bar's HEIGHT can hold while the trigger moves horizontally — on `/`
    // both of its ends are viewport-derived — so the observer alone is not quite
    // enough to keep the icon under the rules.
    window.addEventListener("resize", publish);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", publish);
      document.documentElement.style.removeProperty("--site-header-bottom");
    };
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  // THE MENU DOES NOT SURVIVE A NAVIGATION. Every item is a same-page anchor on
  // `/` and a cross-page one everywhere else; the second kind changes `pathname`
  // under an open panel, and a panel still standing over the page it just
  // navigated to is a bug the reader has to close by hand.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // ...NOR A RESIZE PAST THE BREAKPOINT. The whole menu is `sm:hidden`, so a
  // panel left open while the window widens becomes an invisible focus trap over
  // a visible contents line. Closing on the crossing is the fix; matching the
  // media query to Tailwind's `sm` by hand is the one place that value is
  // duplicated outside the class names.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const sync = () => {
      if (query.matches) setMenuOpen(false);
    };
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // Escape closes and returns focus to the trigger; Tab cycles between the
  // trigger and the panel's links and cannot reach the page behind. The panel
  // dims the page, so letting Tab walk out from under the dim into content the
  // reader cannot see is the inconsistency worth preventing.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;
      const trigger = menuButtonRef.current;
      const panel = menuPanelRef.current;
      if (!trigger || !panel) return;
      const stops = [trigger, ...panel.querySelectorAll<HTMLElement>("a[href]")];
      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen, closeMenu]);

  // Explicit prop wins (case studies force dark, the flight forces bare);
  // otherwise the bar follows the hero's hover tone.
  const isDark = tone ? tone === "dark" : heroDark;

  // The two darks are not the same ink, because the two surfaces beneath them
  // are not the same surface. A case study's page IS the grout token, so the
  // bar takes grout. The parked hero's dark state is HeroInkVeil — a deep,
  // grainy shader wash well below grout — so the bar takes the veil's ink
  // instead; flooding it with grout there left a lighter slab on top of the
  // hero rather than one continuous stage.
  const heroInk = isDark && !tone;

  /* THE BAR NEVER PAINTS ITSELF — a `.chrome-glass` plate does, on every route
     and at every width. Two reasons it is a child element rather than a class on
     the <header>:

     1. `backdrop-filter` MAKES AN ELEMENT A CONTAINING BLOCK FOR ITS `position:
        fixed` DESCENDANTS. The mobile menu's sheet, labels and rule flight are
        all fixed children of this header, positioned in viewport space off a
        measured bar. Put the filter on the header and all three would resolve
        against the header's own box instead — exactly the bug the measurement
        rewrite existed to fix.
     2. On the garden flight the bar's box is pinned to the route's axis and
        inset from both window edges. The plate has to bleed past that, and a
        separate element is something world.css can re-box without touching the
        bar's layout.

     ONE MATERIAL, THREE TONES, AND THE TONE ONLY CHOOSES THE TINT. `dark` adds
     `chrome-glass-dark`, which re-points the tint tokens at grout and keeps
     everything else (blur, saturation, edge, fallbacks) inherited. Nothing here
     decides whether there is a fill any more — there always is. */
  const barTone = isDark ? "text-grout-foreground" : "";
  const plateTone = isDark ? "chrome-glass chrome-glass-dark" : "chrome-glass";
  /* The parked hero's veil is a grainy shader wash well below grout and it sets
     the header's background inline; a plate over it would be a second surface on
     top of the artwork it is trying to match. It is the one route with no plate,
     and it is not a live page. */
  const glassPlate = !heroInk;
  // The ring's offset ring has to be the colour of the surface it is punched
  // out of, or it shows as a notch. Three surfaces, three offsets — and `bare`
  // keeps `--background` on purpose, because that is the token world.css
  // re-points to `--sw-paper` inside the flight so the ring belongs to the
  // route's warmer paper rather than the shell's cooler one.
  const focusTone = isDark
    ? "focus-visible:ring-grout-foreground focus-visible:ring-offset-grout"
    : tone === "bare"
      ? "focus-visible:ring-focus focus-visible:ring-offset-background"
      : "focus-visible:ring-focus focus-visible:ring-offset-secondary";
  // The ring stays the guaranteed focus indicator; the drawn segment is
  // garnish that happens to answer focus too.
  const focusRing = `outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${focusTone}`;

  // The panel is the bar's own surface continued, not a card floating on it —
  // same token, so on `/` (whose bands ARE `--secondary`) the sheet reads as more
  // of the same paper rather than a plate. `bare` takes the light surface too:
  // the garden flight has no plate behind the bar, and a menu has to have one.
  /* The sheet is the bar's material continued downward, tone and all, so the
     open menu reads as the masthead having grown rather than as a panel of a
     different stock hanging off it. */
  const panelSurface = isDark
    ? "chrome-glass chrome-glass-dark text-grout-foreground"
    : "chrome-glass";

  /**
   * ON `/` THE WORDMARK IS THE PAGE'S <h1>, and everywhere else it is a span.
   *
   * The home page used to carry its own letterhead — a cover-line "Lizzie Teo"
   * standing above the flight's plates (`FlightNameplate`, now parked). It was
   * removed (owner's call, Aug 2026) because the name was already printed twice
   * on that screen: on the floppy's own archival label, which is where
   * WorldGlassCard's note says it belongs and only belongs, and here in the bar.
   * A third setting of it had no job.
   *
   * Removing it left `/` with no h1 at all — the `[data-sw-seo]` block's
   * heading is `hidden` from mount, which is `display: none` and therefore out
   * of the accessibility tree, so a screen-reader user with JavaScript on had
   * nothing. This is the answer: the name the page already shows IS the page's
   * heading, rather than a second invisible one saying the same words.
   *
   * THE TAG IS THE ONLY THING THAT CHANGES. No type, no spacing, no position —
   * Tailwind's preflight zeroes heading margins and every type property here is
   * set explicitly, so the bar is pixel-identical on every route.
   *
   * WHY THE HEADING IS INSIDE THE LINK rather than around it: the link carries
   * `aria-label="Lizzie Teo homepage"`, and an accessible name is computed DOWN
   * from an element, never inherited from an ancestor. Nested this way the link
   * still announces its destination and the heading announces "Lizzie Teo".
   * Wrapping the link in the heading instead would name the h1 "Lizzie Teo
   * homepage", which is a destination, not a title.
   *
   * `live` ONLY, because the spacer is an invisible second copy of this whole
   * row (see renderRow). `/` passes `flush` so no spacer renders there at all,
   * which makes the guard belt-and-braces — but it is what keeps this true if
   * that ever changes.
   *
   * THE LIVE BAR STILL EMITS TWO, AND THAT IS THE FILE'S EXISTING BARGAIN
   * rather than a new fault. Both breakpoint layouts are always in the DOM and
   * chosen by `display` (renderRow), so the served HTML carries a mobile h1 and
   * a desktop h1 with identical text — exactly as it already carries two `nav`
   * elements and two full label lists. `display: none` keeps the inactive one
   * out of the accessibility tree and the tab order, so a reader is never
   * offered both, and the pair can never disagree because they render from the
   * same function. If the duplication ever has to go, the fix is hoisting one
   * shared wordmark out of the two layouts, not special-casing the tag.
   */
  const renderWordmark = (live: boolean) => {
    const WordmarkTag: "h1" | "span" = isHome && live ? "h1" : "span";
    return (
    <Link
      href="/"
      className={`group relative -my-3 block shrink-0 py-3 md:-my-4 md:py-4 ${focusRing}`}
      aria-label="Lizzie Teo homepage"
    >
        {/* The whole masthead is set in the display face, wordmark and nav
            alike, so nothing on the row reads as a second typeface. That is a
            deliberate carve-out from "Avant Garde is display-only" (style
            rules §; globals.css): the objection to that face is that its
            closed geometric forms fatigue over paragraphs, and a masthead is
            a handful of tracked uppercase words nobody reads twice.

            Rank comes from size and weight rather than from face. Bold here
            against the nav's regular is a real weight change, not a synthetic
            one — layout.tsx maps 300–500 to the Adventor regular file and
            600–900 to the bold, so `font-bold` loads the drawn bold and
            `font-medium` below loads the drawn regular.

            18px → 20px is the subsection step in the type scale ("Below the
            ladder"), which is as large as the masthead may go: the bar is
            chrome, and past this it starts outweighing the first heading on
            whatever page it sits above. 24/30 was tried and read as a
            nameplate shouting over the content. Against the 12px nav it is
            still a clear 1.5× — the rank is legible without the volume.

            Tracking loosens for caps but tightens as size grows, so it runs
            0.14em here against the nav's 0.16em — the 0.16–0.28em band in the
            type scale governs eyebrow-sized labels, and holding 0.2em up here
            opened the name into ten separate letters. The right margin
            cancels exactly one letterspace, so the drawn underline stops at
            the final O instead of hanging past it; keyed to the same em
            value, it tracks any future change to the pair. */}
        <WordmarkTag className="relative -mr-[0.14em] block font-heading text-lg font-bold uppercase leading-none tracking-[0.14em] md:text-xl">
          Lizzie Teo
          {/* Origin toward the nav: the rule grows out of the word and into
              the line. */}
        <span aria-hidden className={`${underlineSegment} origin-right`} />
      </WordmarkTag>
    </Link>
    );
  };

  /* THE CONTENTS LINE, `sm` AND UP. It keeps `flex-wrap` even though the menu
     now catches the narrow case: the labels are editable content and a rename
     could push the row past a mid-size viewport, and wrapping to two lines is a
     far better failure than a horizontal scrollbar. The wrap is a safety net
     now rather than the mobile layout.

     The middot follows its label rather than preceding the next one so that if a
     break does happen it lands after a separator, the way punctuation ends a
     line, rather than opening the next line with an orphaned dot. */
  const contentsLine = (
    // "Primary", not "Primary navigation" — a screen reader appends the role, so
    // the longer label announced as "primary navigation, navigation".
    <nav aria-label="Primary">
      <ul className="flex flex-wrap items-baseline gap-x-3 gap-y-3 font-heading text-sm font-medium uppercase leading-none tracking-[0.16em] lg:gap-x-4">
          {siteNav.map(({ label, href, section }, index) => {
            /* EVERY ITEM IS A PLACE ON `/` AGAIN, so there is one test rather
               than two: an item is "here" when the reader is on the home page
               and the spy says they are inside its band. The route-item branch
               that stood here (`pathname === href`, `aria-current="page"`)
               existed for the one item that pointed at `/world`; the walk is
               the top of this page now and `/world` is a redirect, so nothing
               is left for it to describe — see site-nav.ts. */
            const active = isHome && activeSection === section;
            return (
              // The li carries the same gap as the ul so the middot sits
              // centred in the space between two words. (`display: contents`
              // would be simpler but costs list semantics in some AT.)
              <li
                key={label}
                className="flex items-baseline gap-3 lg:gap-4"
              >
                <Link
                  className={`group relative -my-4 block py-4 ${focusRing}`}
                  // On the home page the hash is what belongs in the URL; from
                  // anywhere else the item has to navigate home first, which is
                  // what the `/#section` form in site-nav.ts is for.
                  href={isHome ? `#${section}` : href}
                  // "location", never "page": the reader is at a place within
                  // this document rather than on a different one.
                  aria-current={active ? "location" : undefined}
                  // Only a same-page anchor is intercepted. The hook decides
                  // for itself whether the jump may be eased — on `/` a jump
                  // that crosses the garden flight is instant, because easing
                  // across it scrubs the film backwards at speed
                  // (use-anchor-scroll.ts, THE FILM IS NOT SCRUBBED BY A
                  // NAVIGATION).
                  onClick={
                    isHome ? (event) => handleAnchor(event, section) : undefined
                  }
                >
                  {/* Trailing-letterspace correction, as on the wordmark. */}
                  <span className="relative -mr-0.5 block leading-none">
                    {label}
                    {/* Both marks are always in the tree, and the active one is
                        switched by opacity rather than mounted. That is what
                        makes the "here" state cross-fade between labels as the
                        spy moves, and it is also why the active item still
                        answers hover: the two devices no longer replace each
                        other, they stack.

                        The opacity is written here rather than as a default in
                        the constant with an override appended. Two utilities of
                        one family in the same class list resolve by their order
                        in Tailwind's generated sheet, not by the order they are
                        written — this component has no `cn()`/twMerge to settle
                        it, so only one of the pair is ever emitted. */}
                    <span
                      aria-hidden
                      className={`${activeMark} ${active ? "opacity-100" : "opacity-0"}`}
                    />
                    {/* The hover hairline is suppressed on the active item: both
                        marks now sit under the word, so drawing them together
                        would stack two rules on one edge. Nothing is lost — the
                        reader is already there. */}
                    {active ? null : (
                      <span aria-hidden className={`${underlineSegment} origin-left`} />
                    )}
                  </span>
                </Link>
                {index < siteNav.length - 1 ? (
                  <span aria-hidden className="select-none opacity-40">
                    &middot;
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>
  );

  /**
   * The row, rendered twice — once live in the fixed bar, once invisible in flow
   * as the spacer. `live` is what keeps the two copies from fighting: only the
   * real one takes the trigger ref and the click handler, so the spacer cannot
   * steal the ref that Escape and the focus trap return focus to.
   *
   * Both breakpoint layouts are always in the DOM and toggled with `display`,
   * which is what lets the spacer keep doing its job (SPACER IS A HIDDEN COPY,
   * above): it wraps and unwraps exactly as the live bar does at every width,
   * menu row included, with nothing measured. `display: none` also keeps the
   * inactive layout out of the accessibility tree and the tab order, so the two
   * navs are never announced together.
   */
  const renderRow = (live: boolean) => (
    /* ALL THE PADDING LIVES HERE, on the header's single direct child, and it
       has to stay that way. world.css flattens `.sw-masthead > header > *` to
       zero padding and margin so the bar sits on the flight's own axis; that
       selector reaches direct children only, so vertical padding pushed down
       onto the rows below would survive on `/` and make the masthead 40px
       taller there than the route expects — which moves `--site-header-bottom`,
       and with it the flight's picture inset and every anchor landing. */
    <div className="mx-auto w-full max-w-[1800px] px-4 py-3 sm:px-6 md:px-8 md:py-5 lg:px-12 xl:px-16 2xl:px-24">
      {/* THE MOBILE CONTROL ROW — and the flight's coordinate space. `h-11`
          fixes it at the touch-target floor so the geometry above holds no
          matter what a route does to the bar around it, and `items-center`
          rather than the contents line's `items-baseline`, because a 44px
          control has no baseline worth hanging a wordmark from.

          `relative` makes it the origin for the menu's own layers; `z-20` puts
          those layers over the sheet (z-10) that bleeds behind them. */}
      <div className="relative z-20 flex h-11 items-center justify-between md:hidden">
        {renderWordmark(live)}
        <button
          ref={live ? menuButtonRef : undefined}
          type="button"
          onClick={
            live
              ? () => (menuOpen ? closeMenu() : setMenuOpen(true))
              : undefined
          }
          aria-expanded={menuOpen}
          aria-controls="site-contents-menu"
          className={`relative z-40 -mr-[0.16em] flex h-11 min-w-11 items-center justify-end font-heading text-sm font-medium uppercase leading-none tracking-[0.16em] ${focusRing}`}
        >
          {/* ICON AND WORD SHARE ONE GRID CELL, which is what keeps the
              button's width from jumping between the two states: the cell sizes
              to "Close" (the wider of the pair) and the hamburger is simply
              right-aligned inside it. A cross-fade with a moving edge would drag
              the wordmark's line with it every time the menu is touched.

              1px rules with 6px air, the same hairline the masthead draws its
              hover underline in — the bar has one line weight and this is it. */}
          <span className="grid justify-items-end">
            <span
              aria-hidden
              className={`col-start-1 row-start-1 flex w-5 flex-col gap-1.5 self-center transition-opacity duration-100 ease-out motion-reduce:transition-none ${menuOpen ? "opacity-0" : "opacity-100"}`}
            >
              <span className="h-px bg-current" />
              <span className="h-px bg-current" />
              <span className="h-px bg-current" />
            </span>
            <span
              aria-hidden
              className={`col-start-1 row-start-1 self-center transition-opacity duration-100 ease-out motion-reduce:transition-none ${menuOpen ? "opacity-100" : "opacity-0"}`}
            >
              Close
            </span>
          </span>
          <span className="sr-only">
            {menuOpen ? "Close contents" : "Open contents"}
          </span>
        </button>
      </div>

      {/* `sm` AND UP. Unchanged from the bar this replaced, minus its own
          padding — that moved up to the wrapper. */}
      <div className="hidden flex-wrap items-baseline justify-between gap-x-6 gap-y-6 md:flex">
        {renderWordmark(live)}
        {contentsLine}
      </div>
    </div>
  );

  /* Everything below is positioned in VIEWPORT space off the measured bar, not
     in the header's box. On `/` the header is inset from both window edges, so a
     sheet on `inset-x-0` of it would be a 308px card floating in from 18px and
     49px rather than a menu. Structure bleeds to the window; the labels keep the
     ordinary `px-4` inset, which is the usual and correct relationship between a
     divider and the content it divides. */
  const barBottom = barBottomPx ?? MOBILE_ROW_H;

  const menuContent = (
    <div
      id="site-contents-menu"
      ref={menuPanelRef}
      inert={!menuOpen}
      className={`fixed inset-x-0 z-20 md:hidden ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      style={{ top: barBottom }}
    >
      <nav aria-label="Contents">
        <ul className="font-heading text-sm font-medium uppercase leading-none tracking-[0.16em]">
          {siteNav.map(({ label, href, section }, index) => {
            const active = isHome && activeSection === section;
            return (
              <li key={label}>
                <Link
                  className={`group relative flex h-14 items-center px-4 transition-[opacity,transform] duration-200 motion-reduce:transition-none ${focusRing} ${
                    menuOpen
                      ? "translate-y-0 opacity-100 ease-out"
                      : "-translate-y-1 opacity-0 ease-in"
                  }`}
                  // The labels arrive after the sheet has started down, in
                  // reading order, inside the 500ms list budget (§7 stagger
                  // budgets: 3 × 50ms + 200ms = 350ms).
                  style={{
                    transitionDelay: menuOpen ? `${120 + index * 50}ms` : "0ms",
                  }}
                  href={isHome ? `#${section}` : href}
                  aria-current={active ? "location" : undefined}
                  // A same-page anchor never changes `pathname`, so the route
                  // effect cannot close the menu for it. Close here BEFORE the
                  // scroll runs, or the sheet rides down the page over the
                  // section it just jumped to.
                  onClick={(event) => {
                    closeMenu();
                    if (isHome) handleAnchor(event, section);
                  }}
                >
                  <span className="relative -mr-[0.16em] block leading-none">
                    {label}
                    <span
                      aria-hidden
                      className={`${activeMark} ${active ? "opacity-100" : "opacity-0"}`}
                    />

                    {/* The hover hairline is suppressed on the active item: both

                        marks now sit under the word, so drawing them together

                        would stack two rules on one edge. Nothing is lost — the

                        reader is already there. */}

                    {active ? null : (

                      <span aria-hidden className={`${underlineSegment} origin-left`} />

                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );


  return (
    <>
      {/* The in-flow copy. `visibility: hidden` (not `opacity`) keeps it out of
          hit-testing, `inert` keeps its links out of the tab order, and
          `aria-hidden` keeps the duplicate nav out of the accessibility tree —
          all three, because each covers a different consumer. */}
      {flush ? null : (
        <div aria-hidden inert className="invisible" data-site-header-spacer>
          {renderRow(false)}
        </div>
      )}

      {/* THE DIM, AND WHY THERE IS ONE. The panel is `--secondary` and so is the
          home page under it, so with no dim the sheet's foot would dissolve into
          the band and the reader could not see where the menu ends. It sits
          below the header's z-50 so the bar and panel stay lit, and it is the
          tap-to-dismiss target. Escape and the Close button are the accessible
          equivalents; the scrim itself is decoration. */}
      <div
        aria-hidden
        onClick={closeMenu}
        className={`fixed inset-0 z-40 bg-foreground/25 transition-opacity duration-300 motion-reduce:transition-none md:hidden ${
          menuOpen ? "opacity-100 ease-out" : "pointer-events-none opacity-0 ease-in"
        }`}
      />

      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 w-full transition-colors duration-300 ${barTone}`}
        style={heroInk ? { backgroundColor: HERO_VEIL_INK } : undefined}
      >
        {/* Behind everything in the bar (`-z-10` keeps it inside the header's own
            stacking context, not behind the page). `inset-0` means it is exactly
            the bar, so its bottom border is the bar's bottom edge. */}
        {glassPlate ? (
          <div aria-hidden className={`${plateTone} absolute inset-0 -z-10`} />
        ) : null}

        {renderRow(true)}

        {/* THE SHEET — the surface only, bleeding to both window edges, sliding
            down out of the bar's foot so the panel reads as having come from the
            masthead rather than in from a screen edge (origin-aware, §7). `h-56`
            is exactly four MENU_ROW_H rows. It carries no content: the labels
            ride in `menuContent` above it so the two can arrive on different
            beats — the surface travels, the type fades up into it.

            The foot hairline is the §3 carve-out rather than a breach of it. "A
            tonal step is the edge" assumes there IS a step, and here the sheet
            and the page can be the very same token (`--secondary` over the home
            page's own bands), so the rule is the guarantee and the step is the
            bonus. */}
        <div
          aria-hidden
          className={`fixed inset-x-0 z-10 h-56 overflow-hidden md:hidden ${
            menuOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
          style={{ top: barBottom }}
        >
          <div
            className={`h-full transition-transform duration-300 motion-reduce:transition-none ${panelSurface} ${
              menuOpen ? "translate-y-0 ease-out" : "-translate-y-full ease-in"
            }`}
          />
        </div>

        {menuContent}
      </header>
    </>
  );
}
