"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motionDuration, motionEase } from "../lib/motion";
import { workEntryHref, type WorkEntry } from "../work/projects";
import { PixelResolve } from "./PixelResolve";
import { ProjectCover } from "./ProjectCover";

type ProjectCardProps = {
  entry: WorkEntry;
  fillRow: boolean;
  index: number;
};

/** Tag chips stay tonal — project colour lives on the case-study page, not the shell. */
const tagStyle = "bg-secondary text-secondary-foreground";

export function ProjectCard({ entry, fillRow, index }: ProjectCardProps) {
  const shouldReduce = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

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

  const card = (
    <motion.article
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
      <Card className="gap-0 rounded-none bg-transparent p-0 text-foreground ring-0">
        <div
          aria-hidden="true"
          className={cn(
            "relative mb-5 overflow-hidden rounded-3xl border border-border bg-secondary p-0 shadow-card transition-[border-color,box-shadow] duration-100 group-hover:border-foreground/25 group-hover:shadow-elevated group-focus-visible:border-foreground/35",
            entry.size === "tall" ? "aspect-[4/5]" : "aspect-[1.18/1]",
            entry.size === "wide" && "md:aspect-[1.45/1]",
            fillRow && "lg:aspect-[2.2/1]"
          )}
        >
          <motion.div
            className="project-card-media absolute inset-0 bg-secondary"
            animate={{ scale: isHovered && !shouldReduce ? 1.04 : 1 }}
            transition={motionEase.spring}
          >
            {entry.media ? (
              "cover" in entry.media ? (
                <ProjectCover
                  cover={entry.media.cover}
                  hovered={isHovered}
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
        </div>
        <CardHeader className="gap-2 p-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {isArticle ? (
              <>
                Writing · Substack<span aria-hidden="true"> ↗</span>
              </>
            ) : (
              "Case study"
            )}
          </p>
          <CardTitle className="text-2xl font-semibold leading-[1] tracking-[-0.04em] md:text-4xl">
            {entry.title}
          </CardTitle>
          <CardDescription className="max-w-xl text-base leading-[1.35] tracking-[-0.02em] text-muted-foreground md:text-xl">
            {entry.tagline}
          </CardDescription>
          {entry.tags?.length ? (
            <ul className="mt-1 flex flex-wrap gap-1.5">
              {entry.tags.map((tag) => (
                <li
                  key={tag}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-medium leading-none",
                    tagStyle
                  )}
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </CardHeader>
      </Card>
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
