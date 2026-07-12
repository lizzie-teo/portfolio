"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";

const navItems = [
  ["Work", "/#work"],
  ["Contact", "/#contact"],
] as const;

type SiteHeaderProps = {
  /**
   * light — the neutral shell (home). dark — pages whose surface is the
   * grout token (the case-study tile system), where the bar tints to the
   * grout and its text goes light.
   */
  tone?: "light" | "dark";
};

/**
 * Sticky top bar that gets out of the reader's way: scrolling down slides
 * it off (exit — instant/ease-in), scrolling back up returns it (entry —
 * fast/ease-out). It never hides near the top of the page, and keyboard
 * focus entering the bar always reveals it so tabbing can't land on an
 * off-screen link. Under reduced motion the slide collapses to an
 * effectively instant change.
 */
export function SiteHeader({ tone = "light" }: SiteHeaderProps) {
  const [hidden, setHidden] = useState(false);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      if (y < 96) {
        setHidden(false);
      } else if (y > lastY + 2) {
        setHidden(true);
      } else if (y < lastY - 2) {
        setHidden(false);
      }
      lastY = y;
    };
    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const isDark = tone === "dark";
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
    <motion.header
      initial={false}
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={
        shouldReduce
          ? { duration: 0.01 }
          : hidden
            ? { duration: motionDuration.instant, ease: motionEase.in }
            : { duration: motionDuration.fast, ease: motionEase.out }
      }
      onFocus={() => setHidden(false)}
      className={`sticky top-0 z-40 mx-auto flex w-full max-w-[1800px] items-center justify-between px-4 py-4 backdrop-blur-md sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 ${barTone}`}
    >
      <Link
        href="/"
        className={`text-[0.72rem] font-bold uppercase tracking-[0.18em] outline-none focus-visible:ring-2 focus-visible:ring-offset-4 ${brandTone}`}
        aria-label="Lizzie Teo homepage"
      >
        Lizzie Teo
      </Link>
      <nav aria-label="Primary navigation">
        <ul className="flex items-center gap-5 text-[0.72rem] font-bold uppercase tracking-[0.14em] sm:gap-8">
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
    </motion.header>
  );
}
