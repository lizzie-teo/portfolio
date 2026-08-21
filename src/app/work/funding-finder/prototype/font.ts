import { Inter } from "next/font/google";

/**
 * Inter, because the prototype is drawn in Inter. The portfolio reads in Geist
 * and headlines in Avant Garde; neither belongs inside the handset, where the
 * type IS part of the product being shown — Funding Finder's 900-weight display
 * numerals and its tight tracking are Inter's, and swapping the family would
 * quietly redraw the thing the case study is about.
 *
 * Scoped to the prototype board by CSS variable, so it never leaks into the
 * page around it. Variable font, latin subset, `display: swap`: one file, and
 * the handset renders in the fallback grotesque until it lands rather than
 * holding the hero blank.
 */
export const prototypeFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ff-prototype",
});
