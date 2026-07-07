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
} as const;
