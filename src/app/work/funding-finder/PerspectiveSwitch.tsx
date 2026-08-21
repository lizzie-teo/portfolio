"use client";

import { useRef, type KeyboardEvent } from "react";

/**
 * The borrower / broker toggle, shared by the journey map and the IA flow.
 *
 * Both artefacts exist twice in this project, once per side of the deal, and
 * both are full width diagrams. Running them back to back would double the
 * length of the approach chapter to make a point the chapter has already made
 * three times — that there are two users — so each artefact is one module the
 * reader switches. The switch is the same control in both places on purpose: by
 * the second one it is a thing the page does, not a thing to work out.
 *
 * It is a real tablist, not two styled buttons: arrow keys move between the
 * options, Home and End jump to the ends, and only the selected tab is in the
 * tab order, so a keyboard user tabs past the control in one press rather than
 * two. The panel is owned by the caller, which passes the id pair.
 */

export type Perspective = "borrower" | "broker";

export const perspectives: Perspective[] = ["borrower", "broker"];

export function PerspectiveSwitch({
  value,
  onChange,
  idBase,
  label,
  labels,
}: {
  value: Perspective;
  onChange: (next: Perspective) => void;
  /** Prefix for the generated tab and panel ids — unique per instance. */
  idBase: string;
  /** What the reader is choosing between, for assistive tech. */
  label: string;
  /** Visible text per option. */
  labels: Record<Perspective, string>;
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  function focusTab(next: Perspective) {
    onChange(next);
    refs.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = perspectives.indexOf(value);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusTab(perspectives[(index + 1) % perspectives.length]);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusTab(
        perspectives[(index - 1 + perspectives.length) % perspectives.length],
      );
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTab(perspectives[0]);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTab(perspectives[perspectives.length - 1]);
    }
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="inline-flex gap-1 rounded-full border border-border bg-secondary p-1"
    >
      {perspectives.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            ref={(node) => {
              refs.current[option] = node;
            }}
            type="button"
            role="tab"
            id={`${idBase}-tab-${option}`}
            aria-selected={selected}
            aria-controls={`${idBase}-panel-${option}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:px-5 ${
              selected
                ? "bg-leaf text-leaf-foreground"
                : "text-secondary-foreground hover:bg-card"
            }`}
          >
            {labels[option]}
          </button>
        );
      })}
    </div>
  );
}
