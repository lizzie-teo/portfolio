"use client";

import { ChevronDownIcon, RotateCwIcon } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { motionDuration, motionEase } from "@/app/lib/motion";
import { cornerClasses, type TileCorners } from "@/app/components/Chapter";
import { CollapsingLeaf } from "@/app/components/CollapsingLeaf";

/**
 * The Symptom Checker information architecture, rebuilt as a native
 * animated flow instead of a static diagram export. Node styles carry the
 * original artefact's legend (screen / modal / menu / system action) via
 * semantic tokens; each stage reveals once on scroll with drawn
 * connectors — an explanatory sequence, so per-stage cascades may run up
 * to the 1s budget. DOM order is flow order, and every edge label is
 * visible text, so the diagram reads correctly without motion or vision.
 */

type NodeKind = "screen" | "modal" | "menu" | "system" | "decision";

const nodeStyles: Record<NodeKind, string> = {
  screen: "rounded-md border border-foreground/30 bg-card",
  // Dashed edge drawn as an SVG rect in FlowNode — CSS border-dashed
  // can't control dash length/gap.
  modal: "rounded-md bg-muted",
  menu: "rounded-md border border-foreground/30 bg-secondary",
  system: "rounded-md bg-primary text-primary-foreground",
  // Rendered as a rotated square (flowchart diamond) in FlowNode.
  decision: "rounded-md border border-foreground/30 bg-card",
};

/** Fine-dash rounded outline for modal nodes: short dashes, small gaps. */
function DashedEdge({
  rx = 6,
  dash = "3 2",
  className = "",
}: {
  rx?: number;
  dash?: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full overflow-visible text-foreground/35 ${className}`}
    >
      <rect
        width="100%"
        height="100%"
        rx={rx}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray={dash}
      />
    </svg>
  );
}

const legend = [
  { name: "Screen", swatch: "border border-foreground/30 bg-card" },
  { name: "Modal", swatch: "bg-muted", dashed: true },
  { name: "Menu", swatch: "border border-foreground/30 bg-secondary" },
  {
    name: "Decision",
    swatch: "rotate-45 rounded-[2px] border border-foreground/30 bg-card",
  },
  { name: "System", swatch: "bg-primary" },
] as const;

const dispositions = [
  { label: "Self-care at home", chip: "border-foreground/30 bg-card" },
  { label: "Speak to a nurse", chip: "border-foreground/30 bg-secondary" },
  { label: "See a GP soon", chip: "border-foreground/30 bg-muted" },
  { label: "Go to an emergency department", chip: "border-foreground/30 bg-foreground/10" },
  { label: "Call an ambulance", chip: "border-primary bg-primary text-primary-foreground" },
] as const;

type FlowVariants = {
  stage: Variants;
  node: Variants;
  line: Variants;
  draw: Variants;
};

function FlowNode({
  v,
  kind = "screen",
  title,
  sub,
  className = "",
}: {
  v: FlowVariants;
  kind?: NodeKind;
  title: string;
  sub?: string;
  className?: string;
}) {
  if (kind === "decision") {
    return (
      <motion.div
        variants={v.node}
        className={`relative flex aspect-square items-center justify-center ${className}`}
      >
        <span
          aria-hidden="true"
          className={`absolute inset-[15%] rotate-45 ${nodeStyles.decision}`}
        />
        <div className="relative max-w-[62%] text-center">
          <p className="text-sm font-semibold leading-snug">{title}</p>
          {sub ? (
            <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
              {sub}
            </p>
          ) : null}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      variants={v.node}
      className={`${nodeStyles[kind]} relative px-4 py-3 text-center ${className}`}
    >
      {kind === "modal" ? <DashedEdge /> : null}
      <p className="text-sm font-semibold leading-snug">{title}</p>
      {sub ? (
        <p
          className={`mt-1 text-[13px] leading-relaxed ${
            kind === "system"
              ? "text-primary-foreground/75"
              : "text-muted-foreground"
          }`}
        >
          {sub}
        </p>
      ) : null}
    </motion.div>
  );
}

/** Vertical connector with arrowhead and an optional edge label. */
function FlowDown({ v, label }: { v: FlowVariants; label?: string }) {
  return (
    <div className="flex flex-col items-center py-1">
      <motion.span
        variants={v.line}
        style={{ originY: 0 }}
        aria-hidden="true"
        className="block h-6 w-[1.5px] bg-foreground/20"
      />
      <motion.span variants={v.node} className="flex flex-col items-center">
        <ChevronDownIcon
          aria-hidden="true"
          className="-mt-2 size-3.5 text-foreground/45"
        />
        {label ? (
          <span className="mt-1 text-center text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </span>
        ) : null}
      </motion.span>
    </div>
  );
}

/**
 * Fork / merge connector built from CSS borders with rounded elbows —
 * not scaled SVG paths, which strobe or vanish in some browsers.
 * A centre stem meets a bar whose left/right borders drop into (or rise
 * from) the branch columns.
 */
function ForkSplit({
  v,
  bar,
  merge = false,
  center = false,
  className = "",
}: {
  v: FlowVariants;
  /** Width class for the elbow bar, e.g. "w-1/2" to span two columns. */
  bar: string;
  merge?: boolean;
  /** Also run a straight drop through the centre (three-way fork). */
  center?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      variants={v.draw}
      aria-hidden="true"
      className={`relative h-7 ${className}`}
    >
      <span
        className={`absolute left-1/2 h-[11px] w-[1.5px] -translate-x-1/2 bg-foreground/20 ${
          merge ? "bottom-0" : "top-0"
        }`}
      />
      <span
        className={`absolute left-1/2 -translate-x-1/2 border-[1.5px] border-foreground/20 ${bar} ${
          merge
            ? "bottom-[10px] top-0 rounded-b-[10px] border-t-0"
            : "bottom-0 top-[10px] rounded-t-[10px] border-b-0"
        }`}
      />
      {center ? (
        <span className="absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 bg-foreground/20" />
      ) : null}
    </motion.div>
  );
}

/** A scroll-revealed segment of the flow; purely a reveal group. */
function FlowStage({
  v,
  title,
  children,
}: {
  v: FlowVariants;
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      variants={v.stage}
      aria-label={title}
    >
      {children}
    </motion.section>
  );
}

export function IaFlow({
  id,
  corners = "all",
}: {
  id?: string;
  corners?: TileCorners;
}) {
  const shouldReduce = useReducedMotion();

  const v: FlowVariants = {
    stage: {
      hidden: {},
      visible: {
        transition: { staggerChildren: shouldReduce ? 0 : 0.06 },
      },
    },
    node: {
      hidden: { opacity: 0, y: shouldReduce ? 0 : 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: shouldReduce ? 0.01 : motionDuration.fast,
          ease: motionEase.out,
        },
      },
    },
    line: {
      hidden: { opacity: 0, scaleY: shouldReduce ? 1 : 0 },
      visible: {
        opacity: 1,
        scaleY: 1,
        transition: {
          duration: shouldReduce ? 0.01 : motionDuration.fast,
          ease: motionEase.out,
        },
      },
    },
    // Solid connector fade. Do not animate pathLength here: it drives
    // stroke-dasharray, which the non-uniformly scaled fork/merge SVGs
    // render as permanently broken dashes in some browsers.
    draw: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: shouldReduce ? 0.01 : motionDuration.base,
          ease: motionEase.out,
        },
      },
    },
  };

  const sideInfoSub = "Plain language info on risk factors and medical terms";
  const sideHistorySub = "View or edit any earlier answer";

  return (
    <section
      id={id}
      aria-label="Information architecture — one flow from first tap to care action"
      className="scroll-mt-24"
    >
      <CollapsingLeaf
        pinTopPx={0}
        className={`flex flex-col justify-start ${cornerClasses[corners]} border border-border bg-card p-5 shadow-card sm:p-8 md:p-10`}
      >
        <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Information architecture
          </h3>
          <ul aria-label="Legend" className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {legend.map((item) => (
              <li
                key={item.name}
                className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
              >
                <span
                  aria-hidden="true"
                  className={`relative size-2.5 rounded-[0.25rem] ${item.swatch}`}
                >
                  {"dashed" in item ? <DashedEdge rx={4} dash="1.5 1.5" /> : null}
                </span>
                {item.name}
              </li>
            ))}
          </ul>
        </header>

        <div className="mx-auto mt-8 w-full max-w-2xl space-y-2 md:mt-10">
          <FlowStage
            v={v}
            title="The way in"
          >
            <motion.div variants={v.node} className="flex justify-center">
              <span className="rounded-full border border-foreground/30 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.14em]">
                Start
              </span>
            </motion.div>
            <FlowDown v={v} />
            <FlowNode
              v={v}
              title="Tool introduction"
              sub="What the check does — and doesn't do"
              className="mx-auto w-full max-w-sm"
            />
            <FlowDown v={v} label="accept terms and start" />
            <FlowNode
              v={v}
              title="Basic questions"
              sub="Who the check is for — age, sex at birth"
              className="mx-auto w-full max-w-sm"
            />
          </FlowStage>

          <FlowStage
            v={v}
            title="Two ways to say what's wrong"
          >
            <FlowDown v={v} label="select / input answers" />
            <FlowNode
              v={v}
              kind="decision"
              title="Indicate symptoms"
              sub="Free text or body diagram"
              className="mx-auto w-44"
            />
            <ForkSplit v={v} bar="w-1/2" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex flex-col">
                <FlowNode
                  v={v}
                  title="Type a symptom"
                  sub="Natural-language search"
                  className="flex-1"
                />
                <FlowDown v={v} label="view" />
                <FlowNode v={v} kind="modal" title="Suggested symptoms" />
              </div>
              <div className="flex flex-col">
                <FlowNode
                  v={v}
                  title="Body diagram"
                  sub="Select a point on the body"
                  className="flex-1"
                />
                <FlowDown v={v} label="select" />
                <FlowNode v={v} kind="modal" title="Symptoms for that body part" />
              </div>
            </div>
            <ForkSplit v={v} bar="w-1/2" merge />
            <FlowNode
              v={v}
              title="Selected symptoms"
              className="mx-auto w-full max-w-sm"
            />
          </FlowStage>

          <FlowStage
            v={v}
            title="The question loop"
          >
            <FlowDown v={v} label="next" />
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)_auto_minmax(0,1fr)] lg:items-center">
              <FlowNode
                v={v}
                kind="modal"
                title="Why am I being asked this?"
                sub={sideInfoSub}
                className="hidden lg:block"
              />
              <motion.span
                variants={v.node}
                aria-hidden="true"
                className="hidden h-[1.5px] w-6 bg-foreground/20 lg:block"
              />
              <div className="flex flex-col items-center gap-2">
                <FlowNode
                  v={v}
                  title="Question"
                  sub="“x of total questions” — one at a time"
                  className="w-full max-w-sm"
                />
                <motion.p
                  variants={v.node}
                  className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
                >
                  <RotateCwIcon aria-hidden="true" className="size-3" />
                  adaptive loop, until done
                </motion.p>
              </div>
              <motion.span
                variants={v.node}
                aria-hidden="true"
                className="hidden h-[1.5px] w-6 bg-foreground/20 lg:block"
              />
              <FlowNode
                v={v}
                kind="menu"
                title="Answer history"
                sub={sideHistorySub}
                className="hidden lg:block"
              />
              <div className="grid grid-cols-2 gap-3 lg:hidden">
                <FlowNode
                  v={v}
                  kind="modal"
                  title="Why am I being asked this?"
                  sub={sideInfoSub}
                />
                <FlowNode
                  v={v}
                  kind="menu"
                  title="Answer history"
                  sub={sideHistorySub}
                />
              </div>
            </div>
          </FlowStage>

          <FlowStage
            v={v}
            title="Where it lands"
          >
            <FlowDown v={v} label="done" />
            <FlowNode
              v={v}
              title="Disposition + reference number"
              sub="The outcome, in plain language"
              className="mx-auto w-full max-w-sm"
            />
            <FlowDown v={v} />
            <ol className="flex flex-wrap justify-center gap-2">
              {dispositions.map((item, itemIndex) => (
                <motion.li
                  key={item.label}
                  variants={v.node}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-medium ${item.chip}`}
                >
                  <span className="tabular-nums opacity-60">{itemIndex + 1}</span>
                  {item.label}
                </motion.li>
              ))}
            </ol>
          </FlowStage>

          <FlowStage
            v={v}
            title="Into care"
          >
            <FlowDown v={v} label="views" />
            <FlowNode
              v={v}
              kind="decision"
              title="Care advice"
              className="mx-auto w-36"
            />
            <ForkSplit v={v} bar="w-2/3" center className="hidden sm:block" />
            <div className="sm:hidden">
              <FlowDown v={v} label="choose a channel" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              <FlowNode
                v={v}
                title="Service Finder"
                sub="Search services by need, fee, and distance"
              />
              <FlowNode v={v} title="Web chat" sub="Get help via texting" />
              <FlowNode
                v={v}
                kind="system"
                title="System dials the number"
                sub="Healthdirect nurse, or ambulance"
              />
            </div>
            <motion.p
              variants={v.node}
              className="mt-5 text-center text-[13px] leading-relaxed text-muted-foreground"
            >
              From here the result can be saved to a user account, or shared by
              email, print, or SMS.
            </motion.p>
          </FlowStage>
        </div>
      </CollapsingLeaf>
    </section>
  );
}
