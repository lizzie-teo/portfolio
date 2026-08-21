"use client";

import { forwardRef, useState } from "react";
import { prototypeFont } from "./font";
import {
  BankLinkScreen,
  CardScreen,
  FONT,
  HomeScreen,
  LendersScreen,
  MatchingScreen,
  PrefilledScreen,
  QuestionScreen,
  type ScreenId,
} from "./screens";
import { LIGHT, SCREEN_HEIGHT, SCREEN_WIDTH } from "./tokens";

/**
 * The running prototype: the handset, its status bar, and the screen router.
 *
 * AUTHORED AT LIFE SIZE, SCALED ONCE. The board is a literal 390x800 box — the
 * prototype's own canvas — and the caller scales the whole thing with a single
 * transform. Nothing inside reflows, so the screens stay pixel-identical to the
 * source file at any rendered width, and the auto-demo can do all of its
 * geometry in prototype pixels (see useFlowDemo).
 *
 * The demo's ring is a sibling INSIDE the same scaled box, which is why it needs
 * no coordinate conversion of its own.
 */

export type MobilePrototypeProps = {
  /**
   * Reduced motion. Kills the prototype's own entrance and spinner animations
   * at the board, so no individual screen needs a special case, and the demo is
   * not running anyway.
   */
  still: boolean;
  /**
   * True once the reader has taken over. Until then the question screen's
   * autofocus is suppressed: a hero that grabs focus on its own drags the
   * viewport back up under someone reading further down the page.
   */
  allowFocus: boolean;
};

export const MobilePrototype = forwardRef<HTMLDivElement, MobilePrototypeProps>(
  function MobilePrototype({ still, allowFocus }, ref) {
    const [screen, setScreen] = useState<ScreenId>("home");
    const t = LIGHT;
    const go = (next: ScreenId) => setScreen(next);

    return (
      <div
        ref={ref}
        className={prototypeFont.variable}
        data-still={still ? "true" : undefined}
        style={{
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          position: "relative",
          background: t.page,
          borderRadius: 24,
          border: `1px solid ${t.border}`,
          boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 10px 40px rgba(0,0,0,0.08)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* The prototype's own stylesheet, namespaced and scoped to this board.
            The source declares these keyframes globally; here they would be
            three generic names (`fadeUp`, `spin`) sitting in the page's global
            scope waiting to collide with something. `[data-still]` is the
            reduced-motion switch: it stops every animation inside the handset in
            one place, including the ones the browser is mid-way through. */}
        <style>{`
          @keyframes ffp-fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
          @keyframes ffp-slideInR { from { opacity:0; transform:translateX(30px) } to { opacity:1; transform:translateX(0) } }
          @keyframes ffp-slideInL { from { opacity:0; transform:translateX(-30px) } to { opacity:1; transform:translateX(0) } }
          @keyframes ffp-spin { to { transform:rotate(360deg) } }
          [data-still] *, [data-still] { animation: none !important; transition: none !important; }
          .ffp-screen ::-webkit-scrollbar { display: none }
          .ffp-screen [style*="overflow"] { scrollbar-width: none }
          .ffp-screen * { box-sizing: border-box; -webkit-tap-highlight-color: transparent }
          .ffp-screen input { outline: none }
        `}</style>

        {/* Status bar — 9:41 and a full battery, the prototype's own. It is what
            makes the board read as a handset without a drawn bezel around it. */}
        <div
          aria-hidden="true"
          style={{
            flexShrink: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingInline: 24,
            paddingTop: 14,
            paddingBottom: 4,
          }}
        >
          <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: t.text }}>
            9:41
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="18" height="11" viewBox="0 0 18 11" fill={t.text}>
              <rect x="0" y="7" width="2.5" height="4" rx="0.5" />
              <rect x="3.5" y="5" width="2.5" height="6" rx="0.5" />
              <rect x="7" y="3" width="2.5" height="8" rx="0.5" />
              <rect x="10.5" y="1.5" width="2.5" height="9.5" rx="0.5" />
              <rect x="14" y="0" width="2.5" height="11" rx="0.5" />
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect x=".5" y=".5" width="20" height="11" rx="2.5" stroke={t.text} strokeWidth="1" />
              <rect x="2" y="2" width="15" height="8" rx="1.5" fill={t.text} />
              <path d="M22 4v4c1-.5 1.5-1 1.5-2s-.5-1.5-1.5-2z" fill={t.text} />
            </svg>
          </div>
        </div>

        <div
          className="ffp-screen"
          style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
        >
          {screen === "home" && <HomeScreen go={go} t={t} />}
          {screen === "bank-link" && <BankLinkScreen go={go} t={t} />}
          {screen === "prefilled" && <PrefilledScreen go={go} t={t} />}
          {screen === "questions" && (
            <QuestionScreen go={go} t={t} allowFocus={allowFocus} />
          )}
          {screen === "matching" && <MatchingScreen go={go} t={t} still={still} />}
          {screen === "lenders" && <LendersScreen go={go} t={t} />}
          {screen === "my-card" && <CardScreen go={go} t={t} />}
        </div>
      </div>
    );
  }
);
