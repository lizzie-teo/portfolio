"use client";

import Link from "next/link";
import { HERO_VEIL_INK } from "./HeroInkVeil";
import { useHeroTone } from "./HeroToneContext";

const navItems = [["Work", "/#work"]] as const;

type SiteHeaderProps = {
  /**
   * light — the neutral shell, typeset straight onto the page's paper with no
   * paint of its own. dark — pages whose surface is the grout token (the
   * case-study tile system), where the bar tints to the grout and its text
   * goes light. Omit the prop on the home page to let the bar follow the
   * hero's hover tone (HeroToneContext): hovering a hero keyword inverts the
   * bar and the hero together as one dark stage.
   */
  tone?: "light" | "dark";
};

/**
 * The drawn segment under a hovered word and the leader rule between the
 * wordmark and the nav must land on exactly the same line. Both hang off the
 * bottom edge of a `leading-none` box: the leader wears `border-b` on its own
 * (zero-width-space) line box, each segment sits at `top-full` of its label's
 * line box. `leading-none` puts that edge a hair below the baseline — an
 * underline position, never cap-height — and because it is derived from the
 * line box rather than a hand-set offset, it cannot drift into a strikethrough
 * when the type scale changes.
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
 * Top masthead — line one of the site's table of contents. The wordmark, a
 * leader rule, and the nav links stand on one shared type baseline: ink set on
 * the page, not a translucent app bar. No blur, no alpha, no bottom border —
 * the content below draws the edge.
 *
 * It sits in normal flow and scrolls away with the content rather than chasing
 * the reader down the page: no sticky reveal-on-scroll (which read as a
 * distraction and fought in-page anchor landings), no hide/show motion. It is
 * simply there again when the reader returns to the very top. During reading,
 * the case study's ChapterDock spine carries the persistent wayfinding; the
 * home grid is short enough to scroll back to.
 */
export function SiteHeader({ tone }: SiteHeaderProps) {
  const { dark: heroDark } = useHeroTone();

  // Explicit prop wins (case studies force dark); otherwise the home bar
  // follows the hero's hover tone.
  const isDark = tone ? tone === "dark" : heroDark;

  // The two darks are not the same ink, because the two surfaces beneath them
  // are not the same surface. A case study's page IS the grout token, so the
  // bar takes grout. The home hero's dark state is HeroInkVeil — a deep,
  // grainy shader wash well below grout — so the bar takes the veil's ink
  // instead; flooding it with grout there left a lighter slab on top of the
  // hero rather than one continuous stage.
  const heroInk = isDark && !tone;

  // Light tone paints nothing: the header is static in normal flow, so no
  // content ever passes beneath it — the page's own paper is the background.
  // Only the dark flood (hero inversion / case-study grout head) needs paint.
  const barTone = heroInk
    ? "text-grout-foreground"
    : isDark
      ? "bg-grout text-grout-foreground"
      : "bg-transparent";
  // On the grout the whisper hairline vanishes, so the leader re-inks to the
  // rail's tile border (grout-foreground at 26%) to survive at whisper weight.
  const leaderTone = isDark ? "border-rail-tile-border" : "border-border";
  const focusTone = isDark
    ? "focus-visible:ring-grout-foreground focus-visible:ring-offset-grout"
    : "focus-visible:ring-focus focus-visible:ring-offset-background";
  // The ring stays the guaranteed focus indicator; the drawn segment is
  // garnish that happens to answer focus too.
  const focusRing = `outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${focusTone}`;

  return (
    <header
      className={`relative z-40 w-full transition-colors duration-300 ${barTone}`}
      style={heroInk ? { backgroundColor: HERO_VEIL_INK } : undefined}
    >
      <div className="mx-auto flex w-full max-w-[1800px] items-baseline gap-3 px-4 py-5 sm:gap-5 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <Link
          href="/"
          className={`group relative -my-4 block shrink-0 py-4 ${focusRing}`}
          aria-label="Main tree homepage"
        >
          {/* -mr-0.5 eats the trailing letterspace that tracking leaves after
              the final glyph, so the rule stops at the E rather than hanging
              past it — and so the gap to the leader is optical, not phantom. */}
          <span className="relative -mr-0.5 block font-heading text-sm uppercase leading-none tracking-[0.2em]">
            Main tree
            {/* Origin toward the leader: the rule grows out of the word and
                into the line. */}
            <span aria-hidden className={`${underlineSegment} origin-right`} />
          </span>
        </Link>

        {/* The leader. min-w-6 keeps a visible run of rule at 320px — the nav
            gap compresses before the line does. */}
        <span
          aria-hidden
          className={`min-w-6 flex-1 border-b text-xs leading-none transition-colors duration-300 ${leaderTone}`}
        >
          &#8203;
        </span>

        <nav aria-label="Primary navigation">
          <ul className="flex shrink-0 items-baseline gap-2 text-xs font-medium uppercase leading-none tracking-[0.16em] sm:gap-3 md:gap-4">
            {navItems.map(([label, href], index) => (
              // The li carries the same gap as the ul so the middot sits
              // centred in the space between two words. (`display: contents`
              // would be simpler but costs list semantics in some AT.)
              <li
                key={href}
                className="flex items-baseline gap-2 sm:gap-3 md:gap-4"
              >
                {index > 0 ? (
                  <span aria-hidden className="select-none opacity-40">
                    &middot;
                  </span>
                ) : null}
                <Link
                  className={`group relative -my-4 block py-4 ${focusRing}`}
                  href={href}
                >
                  {/* Trailing-letterspace correction, as on the wordmark. */}
                  <span className="relative -mr-0.5 block leading-none">
                    {label}
                    {/* Origin toward the leader, which sits to the left. */}
                    <span aria-hidden className={`${underlineSegment} origin-left`} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
