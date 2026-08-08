"use client";

/*
 * DEVELOP CARD — the frame both card shells sit inside.
 *
 * The extraction is deliberately WIDER than just the plate. Pulling only the
 * media out would leave two shells independently owning a radius, a hairline, a
 * shadow, a link wrapper, a focus ring and an entrance — six things that must
 * match and that nothing would keep matching. Those all live here, so the shells
 * own exactly one thing between them: their own typography, which is the one
 * place a project card and a writing card are SUPPOSED to diverge.
 *
 * ONE LINK, ONE TAB STOP. The whole card is the target. Nothing inside it is
 * separately interactive (§8 bans competing nested targets inside a card link),
 * which is why the shells receive no click handlers and why the accessible name
 * is assembled here from the caller's own words rather than read off the markup.
 *
 * THE REF LIVES ON THE ANCHOR, and it has to. `useDevelopActivation` listens for
 * focus as well as hover, and focus lands on the anchor — a ref one level lower
 * would work perfectly with a mouse and do nothing on Tab. Held in state rather
 * than a `useRef` so the hook re-runs when the node actually attaches; a ref
 * object's `.current` mutation does not re-render and the effect would run once
 * against `null` and never again.
 */

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { motionDuration, motionEase } from "../../lib/motion";
import { loFiInk } from "../loFiInk";
import { DevelopPlate } from "./DevelopPlate";
import type { PlateMedia } from "./plateMedia";
import { useDevelopActivation } from "./useDevelopActivation";

export function DevelopCard({
  href,
  external = false,
  ariaLabel,
  cursorLabel,
  media,
  index,
  children,
}: {
  href: string;
  /** Opens in a new tab. The caller states it rather than the card sniffing the
      URL: leaving the site is a fact a reader deserves in the accessible name,
      and a heuristic on `https://` would get it wrong for absolute internal
      links. */
  external?: boolean;
  ariaLabel: string;
  cursorLabel: string;
  media: PlateMedia;
  index: number;
  /** The type block. The only thing a shell owns. */
  children: React.ReactNode;
}) {
  const shouldReduce = useReducedMotion();
  const [node, setNode] = useState<HTMLElement | null>(null);
  const active = useDevelopActivation(node);

  const card = (
    <motion.article
      initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: shouldReduce ? 0.01 : motionDuration.fast,
        ease: motionEase.out,
        /* The grid's stagger recipe, unchanged: 0.05s interval capped at 0.15s,
           which keeps the whole cascade inside the under-500ms list budget
           (§7 stagger table). */
        delay: shouldReduce ? 0 : Math.min(index * 0.05, 0.15),
      }}
      /* `rounded-2xl` — the house card radius, kept. Only the plate inside takes
         the square-cornered screenshot treatment; the card it sits in is still a
         card and still belongs to the grid around it. */
      className="relative flex h-full flex-col overflow-hidden rounded-2xl border p-4 shadow-card transition-shadow duration-100 group-hover:shadow-elevated sm:p-5"
      style={{ backgroundColor: loFiInk.paper, borderColor: loFiInk.rule }}
    >
      <DevelopPlate media={media} active={active} />
      {children}
    </motion.article>
  );

  const linkClass =
    "group block h-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:ring-offset-grout";

  return external ? (
    <a
      ref={setNode}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-explore-card
      data-cursor-label={cursorLabel}
      aria-label={ariaLabel}
      className={linkClass}
    >
      {card}
    </a>
  ) : (
    <Link
      ref={setNode}
      href={href}
      data-explore-card
      data-cursor-label={cursorLabel}
      aria-label={ariaLabel}
      className={linkClass}
    >
      {card}
    </Link>
  );
}
