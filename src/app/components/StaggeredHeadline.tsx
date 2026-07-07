"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";

type StaggeredHeadlineProps = {
  text: string;
  className?: string;
};

export function StaggeredHeadline({ text, className }: StaggeredHeadlineProps) {
  const shouldReduce = useReducedMotion();
  const [hasMounted, setHasMounted] = useState(false);
  const words = text.split(" ");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHasMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  if (!hasMounted || shouldReduce) {
    return <h1 className={className}>{text}</h1>;
  }

  return (
    <motion.h1
      aria-label={text}
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.08,
          },
        },
      }}
    >
      {words.map((word, index) => (
        <span
          aria-hidden="true"
          className="inline-block overflow-hidden align-bottom"
          key={`${word}-${index}`}
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: {
                y: "112%",
              },
              visible: {
                y: 0,
                transition: {
                  duration: motionDuration.slow,
                  ease: motionEase.out,
                },
              },
            }}
          >
            {word}
          </motion.span>
          {index < words.length - 1 ? "\u00a0" : null}
        </span>
      ))}
    </motion.h1>
  );
}
