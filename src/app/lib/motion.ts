export const motionDuration = {
  instant: 0.1,
  fast: 0.2,
  base: 0.3,
  slow: 0.5,
} as const;

export const motionEase = {
  out: [0, 0, 0.2, 1],
  in: [0.4, 0, 1, 1],
  inOut: [0.4, 0, 0.2, 1],
  spring: { type: "spring", stiffness: 320, damping: 28 },
  // Gentle overshoot for layout morphs: expand grows a touch past target and
  // settles; collapse dips just below target and springs back. Small bounce,
  // settles within the interactive ceiling. Use for `transition.layout`.
  springMorph: { type: "spring", visualDuration: 0.3, bounce: 0.25 },
  // Gallery media entrance: incoming screenshots slide in from the right and
  // scale up from their right edge, settling with a small overshoot. Shares
  // springMorph's visualDuration so the media answers the chip morph in the
  // same springy material; lower bounce so large imagery settles without
  // wobble. Use for the `x`/`scale` entrance of swapped-in screenshots.
  springMedia: { type: "spring", visualDuration: 0.3, bounce: 0.18 },
} as const;
