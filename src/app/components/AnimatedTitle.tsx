"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { motionDuration, motionEase } from "../lib/motion";

type AnimatedTitleProps = {
  text: string;
  className?: string;
};

const WORD_DURATION = motionDuration.slow;
const WORD_STAGGER = 0.05;

export function AnimatedTitle({ text, className }: AnimatedTitleProps) {
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
            staggerChildren: WORD_STAGGER,
          },
        },
      }}
    >
      {words.map((word, index) => {
        const fromX = index % 2 === 0 ? 40 : -40;

        return (
          <motion.span
            aria-hidden="true"
            className="inline-block"
            key={`${word}-${index}`}
            variants={{
              hidden: { x: fromX, opacity: 0 },
              visible: {
                x: 0,
                opacity: 1,
                transition: { duration: WORD_DURATION, ease: motionEase.out },
              },
            }}
          >
            {word}
            {index < words.length - 1 ? " " : null}
          </motion.span>
        );
      })}
    </motion.h1>
  );
}
