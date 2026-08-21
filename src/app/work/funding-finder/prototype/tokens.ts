/**
 * The prototype's OWN design tokens, lifted verbatim from
 * `public/assets/funding-finder/prototype/funding-finder.jsx`.
 *
 * These deliberately do NOT go through the portfolio's semantic tokens. What
 * the hero shows is the product as it was designed — its pink, its greys, its
 * contrast decisions (the WCAG notes below are the prototype author's own,
 * kept because they are part of the artefact). Re-skinning the prototype in
 * portfolio colours would be showing a picture of the portfolio, not of the
 * work. The page's own surfaces around the handset stay on shell tokens.
 */

export const PINK = "#E8196A";

/**
 * WCAG AA notes carried over from the prototype:
 *   #09090B on #FFF = 19.5:1  (text)
 *   #3F3F46 on #FFF =  9.7:1  (textMd)
 *   #6B6B6B on #FFF =  4.6:1  (textSm)
 *   #52525B on #FFF =  7.4:1  (textXs, decorative only)
 */
export const LIGHT = {
  page: "#FFFFFF",
  pageBg: "#F7F7F8",
  surface: "#FFFFFF",
  surfaceEl: "#F2F2F4",
  border: "#D4D4D8",
  divider: "#F0F0F0",
  text: "#09090B",
  textMd: "#3F3F46",
  textSm: "#6B6B6B",
  textXs: "#52525B",
  tint: PINK,
  tintBg: "#FFF0F5",
  tintSoft: "rgba(232,25,106,0.08)",
  green: "#166534",
  greenBg: "#F0FDF4",
  greenText: "#166534",
  amber: "#92400E",
  amberBg: "#FFFBEB",
  amberText: "#92400E",
  red: "#991B1B",
  redBg: "#FEF2F2",
  redText: "#991B1B",
  shadow: "0 2px 6px rgba(0,0,0,0.07), 0 8px 24px rgba(0,0,0,0.09)",
  shadowMd: "0 6px 32px rgba(0,0,0,0.14)",
  btnBg: "#09090B",
  btnText: "#FFFFFF",
} as const;

export type Theme = typeof LIGHT;

/**
 * The handset's own pixel dimensions in the prototype. Everything in the port
 * is authored at this size and the whole board is then scaled by one transform,
 * so the screens stay pixel-identical to the source and the demo can do all its
 * geometry in prototype pixels.
 */
export const SCREEN_WIDTH = 390;
export const SCREEN_HEIGHT = 800;
