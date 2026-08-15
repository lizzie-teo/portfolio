"use client";

/*
 * THE ENTRY'S LIVE EVIDENCE — the marks themselves, running, embedded in the
 * prose that judges them.
 *
 * THIS IS NOT THE LAB. The workbench at /explore/graphical-icons renders every
 * specimen at four sizes on two grounds with a progress scrub and capture hooks,
 * because its job was to decide. This component's job is to let a reader SEE the
 * claim the entry makes, so it shows one size, one ground, and pairs the two
 * projects rather than tiling every combination. A published entry that dumped
 * the full matrix would be handing someone a contact sheet.
 *
 * THE PAIRING IS THE ARGUMENT. Each constructed row runs both projects at once
 * from one hover, side by side, because the entry's whole finding is that the
 * two are indistinguishable. Split them across separate hovers and the reader
 * has to hold one in memory to compare it with the other, which is exactly the
 * comparison that fails to land. The glyph rows below run one mark each, since
 * there the claim is about a single figure and its own motion.
 *
 * TOUCH AND KEYBOARD, same contract as the lab: pointer enter is gated to a
 * mouse so a tap never fires a hover it cannot release; a touch or pen tap
 * toggles and stays on; focus drives the same flag. Reduced motion is handled
 * inside the marks — they resolve without moving rather than moving faster.
 */

import { useState } from "react";
import {
  ConstructedMark,
  markStyles,
  type MarkStyleId,
} from "../../components/marks/ConstructedMarks";
import {
  GlyphArgumentMark,
  glyphArguments,
  type GlyphArgumentId,
} from "../../components/marks/GlyphArgumentMarks";
import { workEntries } from "../../work/projects";

/** One render size, chosen rather than swept. 96px is large enough to read the
 *  construction and close enough to the 32px call site that a reader is not
 *  being sold a mark at a size it never ships at. */
const SPECIMEN_PX = 96;

function titleFor(slug: string): string {
  const entry = workEntries.find(
    (candidate) => candidate.kind === "case-study" && candidate.slug === slug,
  );
  return entry?.title ?? slug;
}

/** Shared hover/focus/tap plumbing. Returns the active flag and the props to
 *  spread on whatever element is the run target. */
function useRunTarget() {
  const [active, setActive] = useState(false);
  const [touch, setTouch] = useState(false);

  return {
    active,
    targetProps: {
      onPointerDown: (e: React.PointerEvent) => setTouch(e.pointerType !== "mouse"),
      onPointerEnter: (e: React.PointerEvent) => {
        if (e.pointerType === "mouse") setActive(true);
      },
      onPointerLeave: (e: React.PointerEvent) => {
        if (e.pointerType === "mouse") setActive(false);
      },
      onClick: () => {
        if (touch) setActive((on) => !on);
      },
      onFocus: () => setActive(true),
      onBlur: () => setActive(false),
      "aria-pressed": active,
    },
  };
}

const plateClassName =
  "flex w-full flex-col gap-6 rounded-2xl border border-border bg-card p-6 text-left outline-none transition-colors hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-8";

const specimenLabelClassName =
  "text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground";

/* ── the three constructed families, both projects at once ────────────────── */

function ConstructedRow({ style }: { style: (typeof markStyles)[number] }) {
  const { active, targetProps } = useRunTarget();

  return (
    <button
      type="button"
      className={plateClassName}
      aria-label={`${style.name}, both projects. Hover or tap to run.`}
      {...targetProps}
    >
      <span className="flex flex-col gap-2">
        <span className="font-heading text-lg font-semibold tracking-[-0.02em] text-foreground">
          {style.name}
        </span>
        <span className="max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
          {style.construction}
        </span>
      </span>

      <span className="flex flex-wrap items-end gap-x-12 gap-y-8">
        {(["funding", "triage"] as const).map((project) => (
          <span key={project} className="flex flex-col items-center gap-3">
            <span
              className="flex items-center justify-center"
              style={{ width: SPECIMEN_PX, height: SPECIMEN_PX }}
            >
              <ConstructedMark
                style={style.id as MarkStyleId}
                project={project}
                sizePx={SPECIMEN_PX}
                active={active}
              />
            </span>
            <span className={specimenLabelClassName}>
              {project === "funding" ? "Funding Finder" : "Symptom Checker"}
            </span>
          </span>
        ))}
      </span>
    </button>
  );
}

export function ConstructedSpecimens() {
  return (
    <div className="not-prose grid gap-4">
      {markStyles.map((style) => (
        <ConstructedRow key={style.id} style={style} />
      ))}
    </div>
  );
}

/* ── the shipped glyphs, animated ─────────────────────────────────────────── */

function GlyphRow({
  argument,
}: {
  argument: (typeof glyphArguments)[number];
}) {
  const { active, targetProps } = useRunTarget();
  const title = titleFor(argument.slug);

  return (
    <button
      type="button"
      className={`${plateClassName} sm:flex-row sm:items-center sm:gap-10`}
      aria-label={`${title}. Hover or tap to run.`}
      {...targetProps}
    >
      <span
        className="flex shrink-0 items-center justify-center"
        style={{ width: SPECIMEN_PX, height: SPECIMEN_PX }}
      >
        <GlyphArgumentMark
          id={argument.id as GlyphArgumentId}
          sizePx={SPECIMEN_PX}
          active={active}
        />
      </span>

      <span className="flex flex-col gap-2">
        <span className={specimenLabelClassName}>{title}</span>
        <span className="font-heading text-base font-semibold tracking-[-0.02em] text-foreground">
          {argument.figure}
        </span>
        <span className="max-w-[56ch] text-sm leading-relaxed text-muted-foreground">
          {argument.motion}
        </span>
      </span>
    </button>
  );
}

export function GlyphSpecimens() {
  return (
    <div className="not-prose grid gap-4">
      {glyphArguments.map((argument) => (
        <GlyphRow key={argument.id} argument={argument} />
      ))}
    </div>
  );
}
