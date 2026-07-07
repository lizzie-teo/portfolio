"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { motionDuration, motionEase } from "../lib/motion";

type MotionRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function MotionReveal({ children, className, delay = 0 }: MotionRevealProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: shouldReduce ? 0 : 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: shouldReduce ? 0.01 : motionDuration.fast,
        ease: motionEase.out,
        delay: shouldReduce ? 0 : delay,
      }}
    >
      {children}
    </motion.div>
  );
}
