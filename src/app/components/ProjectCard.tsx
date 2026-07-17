"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { motionDuration, motionEase } from "../lib/motion";
import { workEntryHref, type WorkEntry } from "../work/projects";
import { useCoverFilmGrant } from "./CoverPlaybackProvider";
import { PixelResolve } from "./PixelResolve";
import { ProjectCover } from "./ProjectCover";

type ProjectCardProps = {
  entry: WorkEntry;
  fillRow: boolean;
  index: number;
};

export function ProjectCard({ entry, fillRow, index }: ProjectCardProps) {
  const shouldReduce = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const articleRef = useRef<HTMLElement>(null);

  // Bespoke animated covers play one pass on scroll-in, one card at a time,
  // coordinated by CoverPlaybackProvider. Only cover cards register, and only
  // when motion is allowed; everything else (articles, image cards, the
  // "Coming soon" placeholder) stays out of the queue and can never block it.
  const hasCover = !!entry.media && "cover" in entry.media;
  const { filmActive, endFilm } = useCoverFilmGrant(
    articleRef,
    hasCover && !shouldReduce
  );

  const isArticle = entry.kind === "article";
  const href = workEntryHref(entry);
  const cursorLabel = isArticle ? "Read on Substack" : "Take a look";
  const ariaLabel = isArticle
    ? `Read "${entry.title}" on Substack (opens in a new tab): ${entry.tagline}`
    : `Open the ${entry.title} case study: ${entry.tagline}`;
  const linkClassName = cn(
    "group block outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-8 focus-visible:ring-offset-background",
    entry.size === "large" && "md:col-span-2 lg:col-span-1",
    fillRow && "lg:col-span-2"
  );

  // Portrait cards throughout — the glass label floats near the lower edge, so
  // every card holds one upright aspect at every width. `tall` reads a touch
  // taller. (Keep in sync with page.tsx placeholder.)
  const aspect = entry.size === "tall" ? "aspect-[3/4]" : "aspect-[4/5]";

  const card = (
    <motion.article
      ref={articleRef}
      tabIndex={-1}
      initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={shouldReduce ? undefined : { y: -6, transition: motionEase.spring }}
      whileTap={shouldReduce ? undefined : { scale: 0.985, transition: motionEase.spring }}
      transition={{
        duration: shouldReduce ? 0.01 : motionDuration.fast,
        ease: motionEase.out,
        delay: shouldReduce ? 0 : Math.min(index * 0.05, 0.1),
      }}
    >
      <div
        className={cn(
          "@container relative isolate overflow-hidden rounded-3xl border border-border bg-secondary shadow-card transition-[border-color,box-shadow] duration-100 group-hover:border-foreground/25 group-hover:shadow-elevated group-focus-visible:border-foreground/35",
          aspect
        )}
      >
        <motion.div
          aria-hidden="true"
          className="project-card-media absolute inset-0 bg-secondary"
          animate={{ scale: isHovered && !shouldReduce ? 1.04 : 1 }}
          transition={motionEase.spring}
        >
          {entry.media ? (
            "cover" in entry.media ? (
              <ProjectCover
                cover={entry.media.cover}
                hovered={isHovered}
                filmActive={filmActive}
                onFilmEnd={endFilm}
                className="absolute inset-0"
              />
            ) : (
              <PixelResolve
                media={entry.media}
                hovered={isHovered}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="absolute inset-0"
              />
            )
          ) : null}
        </motion.div>

        {isArticle ? (
          <span
            aria-hidden="true"
            className="absolute right-[6cqw] top-[6cqw] flex h-9 w-9 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm transition-transform duration-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          >
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} />
          </span>
        ) : null}

        {/* Frosted-glass label panel, hugging the card's lower edge with a
            smaller corner radius than the card and a fixed 8px gap on its left,
            right, and bottom, so it reads as a caption bar floating over the
            cover art. It hugs its own content (no fixed top), which keeps it
            short while guaranteeing the longest title plus the industry chip
            never clip, at every width from 320px up. The single industry chip
            sits above the title as an eyebrow, categorising the project before
            you read its name.
            On pointer devices it fades out on hover so the animated cover shows
            unobstructed (Tailwind gates `group-hover` behind `@media (hover:
            hover)`, so touch devices keep the panel visible). Keyboard focus
            does NOT hide it: the label is how a keyboard user identifies the
            focused card, and the card's focus ring already marks focus, so the
            panel stays put on focus-visible. Reduced motion shortens the fade to
            near-instant via the global reduced-motion rule.
            The cover shows clearly through the translucent, borderless pane;
            the chip and title render as plain elements on it (see
            .project-card-glass and the glass tokens).
            (Keep glass classes in sync with page.tsx placeholder.) */}
        <div
          className={cn(
            "project-card-glass pointer-events-none absolute inset-x-[8px] bottom-[8px] flex flex-col gap-4 overflow-hidden rounded-xl p-4 transition-opacity duration-200 ease-out group-hover:opacity-0 md:p-6"
          )}
        >
          {entry.industry ? (
            <span className="self-start rounded-full border border-glass-foreground/35 bg-glass-foreground/10 px-2.5 py-1 text-[clamp(0.5625rem,1.9cqw,0.6875rem)] font-medium uppercase leading-none tracking-wide text-glass-foreground">
              {entry.industry}
            </span>
          ) : null}

          <h2 className="font-heading font-semibold leading-[1.05] tracking-[-0.03em] text-glass-foreground text-[clamp(1.2rem,5.6cqw,2.35rem)]">
            {entry.title}
          </h2>
        </div>
      </div>
    </motion.article>
  );

  if (isArticle) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-explore-card
        data-cursor-label={cursorLabel}
        aria-label={ariaLabel}
        className={linkClassName}
      >
        {card}
      </a>
    );
  }

  return (
    <Link
      href={href}
      data-explore-card
      data-cursor-label={cursorLabel}
      aria-label={ariaLabel}
      className={linkClassName}
    >
      {card}
    </Link>
  );
}
