"use client";

import { useReducedMotion } from "motion/react";

type HeroVideoProps = {
  src: string;
  width: number;
  height: number;
  className?: string;
};

/* Decorative ambient hero loop. Muted and inline so mobile browsers allow
   autoplay; under reduced motion it stays paused on its first frame, which
   doubles as the useful static state. */
export function HeroVideo({ src, width, height, className }: HeroVideoProps) {
  const reducedMotion = useReducedMotion();

  return (
    <video
      key={reducedMotion ? "static" : "playing"}
      aria-hidden="true"
      autoPlay={!reducedMotion}
      loop
      muted
      playsInline
      preload="auto"
      src={src}
      width={width}
      height={height}
      className={className}
    />
  );
}
