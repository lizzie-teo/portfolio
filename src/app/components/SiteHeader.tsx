"use client";

import Link from "next/link";
import { useHeroTone } from "./HeroToneContext";

const navItems = [
  ["Work", "/#work"],
  ["Contact", "/#contact"],
] as const;

type SiteHeaderProps = {
  /**
   * light — the neutral shell (home). dark — pages whose surface is the
   * grout token (the case-study tile system), where the bar tints to the
   * grout and its text goes light. Omit the prop on the home page to let the
   * bar follow the hero's hover tone (HeroToneContext): hovering a hero
   * passage inverts the bar and the hero together as one dark stage.
   */
  tone?: "light" | "dark";
};

/**
 * Top masthead — the page's top matter, like the header of a printed page.
 * It sits in normal flow and scrolls away with the content rather than
 * chasing the reader down the page: no sticky reveal-on-scroll (which read as
 * a distraction and fought in-page anchor landings), no hide/show motion. It
 * is simply there again when the reader returns to the very top. During
 * reading, the case study's ChapterDock spine carries the persistent
 * wayfinding; the home grid is short enough to scroll back to.
 */
export function SiteHeader({ tone }: SiteHeaderProps) {
  const { dark: heroDark } = useHeroTone();

  // Explicit prop wins (case studies force dark); otherwise the home bar
  // follows the hero's hover tone.
  const isDark = tone ? tone === "dark" : heroDark;
  const barTone = isDark
    ? "bg-grout/88 text-grout-foreground"
    : "bg-background/88";
  const linkTone = isDark
    ? "hover:border-grout-foreground focus-visible:border-grout-foreground focus-visible:ring-grout-foreground focus-visible:ring-offset-grout"
    : "hover:border-foreground focus-visible:border-foreground focus-visible:ring-focus focus-visible:ring-offset-background";
  const brandTone = isDark
    ? "focus-visible:ring-grout-foreground focus-visible:ring-offset-grout"
    : "focus-visible:ring-focus focus-visible:ring-offset-background";

  return (
    <header
      className={`relative z-40 w-full backdrop-blur-md transition-colors duration-300 ${barTone}`}
    >
      <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between px-4 py-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
        <Link
          href="/"
          className={`text-xs font-bold uppercase tracking-[0.18em] outline-none focus-visible:ring-2 focus-visible:ring-offset-4 ${brandTone}`}
          aria-label="Main tree homepage"
        >
          Main tree
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="flex items-center gap-5 text-xs font-bold uppercase tracking-[0.14em] sm:gap-8">
            {navItems.map(([label, href]) => (
              <li key={href}>
                <Link
                  className={`border-b border-transparent pb-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-4 ${linkTone}`}
                  href={href}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
