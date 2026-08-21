"use client";

import { ChevronDownIcon, RotateCwIcon } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useState, type ReactNode } from "react";
import { motionDuration, motionEase } from "@/app/lib/motion";
import {
  anchorScrollOffset,
  cornerClasses,
  readingTilePadding,
  sectionHeading,
  type TileCorners,
} from "@/app/components/Chapter";
import { CollapsingLeaf } from "@/app/components/CollapsingLeaf";
import { MaskReveal } from "@/app/components/MaskReveal";
import {
  PerspectiveSwitch,
  type Perspective,
} from "./PerspectiveSwitch";

/**
 * Both information architectures, rebuilt as native animated flows and
 * switched by the same control the journey map uses.
 *
 * The node vocabulary is deliberately the site's existing one — screen, modal,
 * menu, decision, system — rather than a new legend invented for this project.
 * A reader who has been through the symptom checker already knows how to read a
 * diamond here, and two case studies agreeing on what a dashed outline means is
 * worth more than a bespoke key.
 *
 * The two flows are not the same shape and should not be forced into one. The
 * borrower's is a line with a single fork in it: one path, walked once, where
 * the only real branch is whether the bank connects or the figures are typed.
 * The broker's is a hub: a pipeline you return to between deals, with four
 * sections hanging off each one. That difference IS the finding — a borrower
 * finishes and leaves, a broker never finishes — so the borrower flow runs
 * vertically to a terminus and the broker flow opens out and comes back.
 *
 * Node text is visible text and DOM order is flow order, so both diagrams read
 * correctly without motion or vision.
 */

type NodeKind = "screen" | "modal" | "menu" | "system" | "decision";

const nodeStyles: Record<NodeKind, string> = {
  screen: "rounded-md border border-foreground/30 bg-card",
  // Dashed edge drawn as an SVG rect in FlowNode — CSS border-dashed can't
  // control dash length or gap.
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

/** The seven places a deal can sit, plus the one that leaves the track. */
const stages = [
  "New",
  "Submitted",
  "Offered",
  "Signed",
  "Valuation and due diligence",
  "Final terms",
  "Settled",
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
            <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
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
          className={`mt-1 text-sm leading-relaxed ${
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
 * Fork / merge connector built from CSS borders with rounded elbows, not
 * scaled SVG paths, which strobe or vanish in some browsers. A centre stem
 * meets a bar whose left and right borders drop into (or rise from) the
 * branch columns.
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
  /** Also run a straight drop through the centre (three way fork). */
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

function StartPip({ v, label }: { v: FlowVariants; label: string }) {
  return (
    <motion.div variants={v.node} className="flex justify-center">
      <span className="rounded-full border border-foreground/30 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.14em]">
        {label}
      </span>
    </motion.div>
  );
}

function BorrowerFlow({ v }: { v: FlowVariants }) {
  return (
    <>
      <FlowStage v={v} title="The way in">
        <StartPip v={v} label="Start" />
        <FlowDown v={v} />
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.4fr)] lg:items-center">
          <FlowNode
            v={v}
            kind="menu"
            title="Navigation drawer"
            sub="Products, how it works, broker log in"
            className="hidden lg:block"
          />
          <motion.span
            variants={v.node}
            aria-hidden="true"
            className="hidden h-[1.5px] w-6 bg-foreground/20 lg:block"
          />
          <FlowNode
            v={v}
            title="Choose a loan type"
            sub="Short term debt, development finance, or a business loan"
            className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none"
          />
          <FlowNode
            v={v}
            kind="menu"
            title="Navigation drawer"
            sub="Products, how it works, broker log in"
            className="lg:hidden"
          />
        </div>
        <FlowDown v={v} label="get started" />
        <FlowNode
          v={v}
          title="Bank connection"
          sub="Pick a bank, and see exactly what will be shared"
          className="mx-auto w-full max-w-sm"
        />
      </FlowStage>

      <FlowStage v={v} title="Two ways to give the numbers">
        <FlowDown v={v} />
        <FlowNode
          v={v}
          kind="decision"
          title="Connect the account?"
          className="mx-auto w-44"
        />
        <ForkSplit v={v} bar="w-1/2" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="flex flex-col">
            <FlowNode
              v={v}
              kind="system"
              title="Bank pulls through"
              sub="Income, expenses and transaction history"
              className="flex-1"
            />
            <FlowDown v={v} label="review" />
            <FlowNode
              v={v}
              title="Prefilled financials"
              sub="Check what came back, correct anything"
            />
          </div>
          <div className="flex flex-col">
            <FlowNode
              v={v}
              title="Skip for now"
              sub="Type the figures instead"
              className="flex-1"
            />
            <FlowDown v={v} label="continue" />
            <FlowNode v={v} kind="modal" title="What we will ask you for" />
          </div>
        </div>
        <ForkSplit v={v} bar="w-1/2" merge />
      </FlowStage>

      <FlowStage v={v} title="The question loop">
        <FlowDown v={v} label="begin" />
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.2fr)_auto_minmax(0,1fr)] lg:items-center">
          <FlowNode
            v={v}
            kind="modal"
            title="Why is this asked?"
            sub="The term in plain language, and what a lender does with it"
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
              sub="One at a time, with progress shown"
              className="w-full max-w-sm"
            />
            <motion.p
              variants={v.node}
              className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
            >
              <RotateCwIcon aria-hidden="true" className="size-3" />
              loop, until answered
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
            title="Skip this one"
            sub="Parked, and picked up again at the review"
            className="hidden lg:block"
          />
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            <FlowNode
              v={v}
              kind="modal"
              title="Why is this asked?"
              sub="The term in plain language, and what a lender does with it"
            />
            <FlowNode
              v={v}
              kind="menu"
              title="Skip this one"
              sub="Parked, and picked up again at the review"
            />
          </div>
        </div>
      </FlowStage>

      <FlowStage v={v} title="Check, then match">
        <FlowDown v={v} label="done" />
        <FlowNode
          v={v}
          title="Review answers"
          sub="Edit any answer, then come straight back here"
          className="mx-auto w-full max-w-sm"
        />
        <FlowDown v={v} label="submit" />
        <FlowNode
          v={v}
          kind="system"
          title="Matching runs"
          sub="Answers scored against every lender's criteria"
          className="mx-auto w-full max-w-sm"
        />
      </FlowStage>

      <FlowStage v={v} title="The shortlist">
        <FlowDown v={v} />
        <FlowNode
          v={v}
          title="Recommended lenders"
          sub="Three ranked options, best match pinned, rate and monthly cost on the card face"
          className="mx-auto w-full max-w-sm"
        />
        <FlowDown v={v} label="select a lender" />
        <FlowNode
          v={v}
          title="My loan card"
          sub="Full terms, what to prepare, and what happens next"
          className="mx-auto w-full max-w-sm"
        />
        <FlowDown v={v} />
        <StartPip v={v} label="Application with the lender" />
      </FlowStage>
    </>
  );
}

function BrokerFlow({ v }: { v: FlowVariants }) {
  return (
    <>
      <FlowStage v={v} title="The way in">
        <StartPip v={v} label="Start" />
        <FlowDown v={v} />
        <FlowNode
          v={v}
          title="Broker log in"
          sub="Account verified against licence details"
          className="mx-auto w-full max-w-sm"
        />
        <FlowDown v={v} />
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.4fr)] lg:items-center">
          <FlowNode
            v={v}
            kind="menu"
            title="Stage filters"
            sub="Stay on for the session, and show which one is active"
            className="hidden lg:block"
          />
          <motion.span
            variants={v.node}
            aria-hidden="true"
            className="hidden h-[1.5px] w-6 bg-foreground/20 lg:block"
          />
          <FlowNode
            v={v}
            title="Pipeline"
            sub="Every active deal, under a strip of counts by stage"
            className="mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none"
          />
          <FlowNode
            v={v}
            kind="menu"
            title="Stage filters"
            sub="Stay on for the session, and show which one is active"
            className="lg:hidden"
          />
        </div>
      </FlowStage>

      <FlowStage v={v} title="Two ways out of the pipeline">
        <FlowDown v={v} />
        <FlowNode
          v={v}
          kind="decision"
          title="One deal, or the book?"
          className="mx-auto w-48"
        />
        <ForkSplit v={v} bar="w-1/2" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <FlowNode
            v={v}
            title="Deal detail"
            sub="One client, four sections"
            className="flex flex-col justify-center"
          />
          <FlowNode
            v={v}
            title="Offering"
            sub="Lender products across every deal, compared side by side"
            className="flex flex-col justify-center"
          />
        </div>
      </FlowStage>

      <FlowStage v={v} title="Inside a deal">
        <FlowDown v={v} label="four sections" />
        {/* Two by two at every width, not four across. The flow column is
            capped at max-w-2xl, so a four column row leaves each section
            ~150px — narrow enough that every sub wraps to four lines and the
            row stops reading as four peers. */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <FlowNode
            v={v}
            title="Application"
            sub="Financials, loan type, documents"
          />
          <FlowNode
            v={v}
            title="Offering"
            sub="What this client matched, and on what terms"
          />
          <FlowNode
            v={v}
            title="Messages"
            sub="The client thread, attached to the deal"
          />
          <FlowNode
            v={v}
            title="Status"
            sub="Where the deal sits on the track below"
          />
        </div>
        <ForkSplit v={v} bar="w-3/4" merge />
        <FlowNode
          v={v}
          kind="modal"
          title="Confirm before closing"
          sub="Anything that deletes asks first, and can be undone for five seconds"
          className="mx-auto w-full max-w-sm"
        />
      </FlowStage>

      <FlowStage v={v} title="Where a deal can sit">
        <FlowDown v={v} label="stage track" />
        <ol className="flex flex-wrap justify-center gap-2">
          {stages.map((stage, stageIndex) => (
            <motion.li
              key={stage}
              variants={v.node}
              className="flex items-center gap-2 rounded-full border border-foreground/30 bg-card px-3 py-1.5 text-sm font-medium"
            >
              <span className="tabular-nums opacity-60">{stageIndex + 1}</span>
              {stage}
            </motion.li>
          ))}
          <motion.li
            variants={v.node}
            className="flex items-center gap-2 rounded-full border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
          >
            Declined
          </motion.li>
        </ol>
        <motion.p
          variants={v.node}
          className="mt-5 text-center text-sm font-medium leading-relaxed text-leaf"
        >
          A broker returns to the pipeline between every one of these stages.
          That is the difference between the two flows. A borrower finishes
          their application and leaves, and a broker is always mid deal on
          something.
        </motion.p>
      </FlowStage>
    </>
  );
}

const idBase = "funding-finder-ia";

const flowLede: Record<Perspective, string> = {
  borrower:
    "The borrower walks one path, once. The only real branch is whether the bank connects or the figures get typed.",
  broker:
    "The broker works from a hub rather than a line. Every deal starts and ends at the pipeline.",
};

export function IaFlow({
  id,
  corners = "all",
}: {
  id?: string;
  corners?: TileCorners;
}) {
  const shouldReduce = useReducedMotion();
  const [perspective, setPerspective] = useState<Perspective>("borrower");

  const v: FlowVariants = {
    stage: {
      hidden: {},
      visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.06 } },
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
    // stroke-dasharray, which the non-uniformly scaled fork and merge SVGs
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

  return (
    <section
      id={id}
      aria-label="Information architecture"
      className={anchorScrollOffset}
    >
      <CollapsingLeaf
        pinTopPx={0}
        className={`flex flex-col justify-start ${cornerClasses[corners]} border border-border bg-card shadow-card ${readingTilePadding}`}
      >
        <header className="flex flex-col gap-8 md:gap-10">
          <MaskReveal
            as="h2"
            mode="word"
            duration="fast"
            className={sectionHeading}
            text="Information architecture"
          />
          <ul
            aria-label="Legend"
            className="flex flex-wrap items-center gap-x-4 gap-y-1"
          >
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
          <PerspectiveSwitch
            value={perspective}
            onChange={setPerspective}
            idBase={idBase}
            label="Choose a flow"
            labels={{ borrower: "Borrower", broker: "Broker" }}
          />
        </header>

        <div
          role="tabpanel"
          id={`${idBase}-panel-${perspective}`}
          aria-labelledby={`${idBase}-tab-${perspective}`}
          tabIndex={0}
          className="mt-8 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <p className="max-w-prose text-base leading-relaxed text-foreground">
            {flowLede[perspective]}
          </p>

          <div
            /* Keyed on the perspective so switching remounts the stages and the
               new flow draws itself in, rather than swapping node text inside
               connectors that never moved. */
            key={perspective}
            className="mx-auto mt-6 w-full max-w-2xl space-y-2 md:mt-8"
          >
            {perspective === "borrower" ? (
              <BorrowerFlow v={v} />
            ) : (
              <BrokerFlow v={v} />
            )}
          </div>
        </div>
      </CollapsingLeaf>
    </section>
  );
}
