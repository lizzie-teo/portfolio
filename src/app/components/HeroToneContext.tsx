"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/* ─────────────────────────────────────────────────────────────────────────
   Hero tone — a tiny shared switch so the home hero can invert the sticky
   site header along with itself. Hovering a hero passage flips `dark` true;
   the header (kept as a page-level sticky element so it still tracks the
   whole page) reads this and tints to its grout tone, so the header and the
   full-bleed hero read as one dark stage. No provider on a page → `dark`
   stays false, so shared chrome elsewhere is unaffected.
──────────────────────────────────────────────────────────────────────────── */

type HeroTone = {
  dark: boolean;
  setDark: (value: boolean) => void;
};

const HeroToneContext = createContext<HeroTone>({
  dark: false,
  setDark: () => {},
});

export function HeroToneProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  return (
    <HeroToneContext.Provider value={{ dark, setDark }}>
      {children}
    </HeroToneContext.Provider>
  );
}

export function useHeroTone() {
  return useContext(HeroToneContext);
}
