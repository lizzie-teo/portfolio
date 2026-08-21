"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { motionDuration, motionEase } from "@/app/lib/motion";
import {
  anchorScrollOffset,
  cornerClasses,
  readingTilePadding,
  sectionContentGap,
  sectionHeading,
  sectionLede,
  type TileCorners,
} from "@/app/components/Chapter";
import { CollapsingLeaf } from "@/app/components/CollapsingLeaf";
import { MaskReveal } from "@/app/components/MaskReveal";

/**
 * The platform's two operators, and the four places their work meets.
 *
 * This is the one module in the chapter about a user the case study otherwise
 * never introduces: the Funding Finder team who onboard lenders, tune the
 * matching and audit what comes through. They have no persona and no journey
 * because they are not who the product is for, but they are who it runs on, and
 * the four shared steps in the middle column are the reason the borrower app
 * and the broker dashboard had to be one system rather than two products with a
 * handover between them.
 *
 * The shared column is the diagram's whole argument, so it sits between the two
 * task lists at desktop and between them in DOM order too, which means the
 * mobile stack reads admin, shared, broker with no reordering and no
 * `order-*` classes that would split the visual sequence from the spoken one.
 *
 * Semantics: two ordered lists, because the steps are sequences, and one
 * unordered list for the shared surfaces, because those four are a set rather
 * than an order.
 */

type Step = {
  /** The task, as the operator would name it. */
  task: string;
  /** What the task actually involves. */
  detail: string;
};

const adminSteps: Step[] = [
  {
    task: "Onboard lender profiles",
    detail: "Criteria, rates and eligibility, entered once per lender",
  },
  {
    task: "Configure the matching",
    detail: "Weighting rules set per loan type",
  },
  {
    task: "Review flagged applications",
    detail: "Audit whatever came through incomplete or mismatched",
  },
  {
    task: "Maintain the catalogue",
    detail: "Keep every lender listing current",
  },
  {
    task: "Generate reports",
    detail: "Conversion, deal flow, and where applications fall away",
  },
];

const brokerSteps: Step[] = [
  {
    task: "Register and verify",
    detail: "Create the account against licence details",
  },
  {
    task: "Invite the client",
    detail: "Send a secure link into the borrower application",
  },
  {
    task: "Review the application",
    detail: "Watch progress, flag what is still missing",
  },
  {
    task: "Assess matched products",
    detail: "Compare what the algorithm returned for this client",
  },
  {
    task: "Submit and manage",
    detail: "Track the deal from submission through to settlement",
  },
];

const shared = [
  "Application review",
  "Deal matching",
  "Status updates",
  "Settlement",
];

const columnLabel =
  "rounded-xl bg-leaf px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-leaf-foreground";

function StepList({
  label,
  steps,
  variant,
}: {
  label: string;
  steps: Step[];
  variant: Variants;
}) {
  return (
    <div>
      <motion.p variants={variant} className={columnLabel}>
        {label}
      </motion.p>
      <ol aria-label={label} className="mt-4">
        {steps.map((step, index) => (
          <motion.li key={step.task} variants={variant}>
            <div className="flex gap-3 rounded-xl border border-border bg-card p-4 shadow-card">
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-semibold tabular-nums text-secondary-foreground"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-base font-semibold leading-snug text-leaf">
                  {step.task}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {step.detail}
                </p>
              </div>
            </div>
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className="mx-auto block h-3 w-px bg-rule"
              />
            ) : null}
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

export function TaskAnalysis({
  id,
  corners = "all",
}: {
  id?: string;
  corners?: TileCorners;
}) {
  const shouldReduce = useReducedMotion();

  const v: { map: Variants; cell: Variants } = {
    map: {
      hidden: {},
      visible: { transition: { staggerChildren: shouldReduce ? 0 : 0.05 } },
    },
    cell: {
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
  };

  return (
    <section
      id={id}
      aria-label="Task analysis"
      className={anchorScrollOffset}
    >
      <CollapsingLeaf
        pinTopPx={0}
        className={`flex flex-col justify-start ${cornerClasses[corners]} border border-border bg-card shadow-card ${readingTilePadding}`}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -80px 0px" }}
          variants={v.map}
        >
          <MaskReveal
            as="h2"
            mode="word"
            duration="fast"
            className={sectionHeading}
            text="Task analysis"
          />

          <motion.p variants={v.cell} className={sectionLede}>
            Funding Finder has its own team who add the lenders and set up the
            matching rules. I listed their tasks next to a broker&apos;s and
            found four places where the two overlap.
          </motion.p>

          <div
            className={`${sectionContentGap} grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,11rem)_minmax(0,1fr)] lg:items-start lg:gap-6 xl:gap-8`}
          >
            <StepList
              label="Funding Finder team"
              steps={adminSteps}
              variant={v.cell}
            />

            <div>
              <motion.p
                variants={v.cell}
                className="rounded-xl border border-border bg-secondary px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-secondary-foreground"
              >
                Shared
              </motion.p>
              <ul
                aria-label="Places both of them overlap"
                className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-1 lg:pt-10"
              >
                {shared.map((item) => (
                  <motion.li
                    key={item}
                    variants={v.cell}
                    className="rounded-xl bg-accent px-4 py-3 text-center text-sm font-semibold leading-snug text-accent-foreground"
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            </div>

            <StepList label="Broker" steps={brokerSteps} variant={v.cell} />
          </div>

          <motion.p
            variants={v.cell}
            className="mt-8 max-w-prose text-sm leading-relaxed text-foreground"
          >
            <span
              aria-hidden="true"
              className="mr-2 inline-block size-2.5 translate-y-px rounded-[0.25rem] bg-accent"
            />
            Those four places are why this is one platform and not two. When
            the team updates a lender&apos;s criteria or flags an application,
            the broker has to see it straight away, without anyone sending an
            email.
          </motion.p>
        </motion.div>
      </CollapsingLeaf>
    </section>
  );
}
