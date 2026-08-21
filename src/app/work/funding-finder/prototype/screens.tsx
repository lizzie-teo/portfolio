"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LOGOS, FF_LOGO } from "./brand";
import { GROUPS, LENDERS, QUESTIONS } from "./data";
import { Ic, type Icon } from "./icons";
import type { Theme } from "./tokens";

/* ─────────────────────────────────────────────────────────────────────────────
   The mobile prototype's screens, ported from
   `public/assets/funding-finder/prototype/funding-finder.jsx`.

   PORTED, NOT RE-BUILT. The inline styles, the magic numbers, the pink, the
   copy and the odd bit of prototype shorthand are all the source file's. This
   is the artefact the case study is about, so it is reproduced rather than
   rewritten in the portfolio's own idiom — a version tidied into Tailwind and
   shell tokens would be a picture of the portfolio, not of the product. Keep it
   diffable against the source.

   Four deliberate departures, all of them things a live embed needs and a
   standalone prototype does not:

   1. `demo` — the auto-demo's press targets (`data-demo`), on the pressable
      element ITSELF so the sequencer's synthetic pointer/click events land on
      the same handler a thumb would hit. Never on a wrapper.
   2. `allowFocus` — the question screen autofocuses its input on mount, which
      inside a page would drag the viewport to the hero while someone is
      reading three sections below it. Suppressed until the reader has taken
      the prototype over (see useFlowDemo's handover).
   3. `still` — reduced motion. The source's entrance and spinner animations
      are switched off at the board (see MobilePrototype), so no screen here
      needs a special case.
   4. The screens are a CURATED slice of the flow (see data.ts) — the
      walkthrough the hero makes, not the twenty-question whole.
─────────────────────────────────────────────────────────────────────────────── */

export const FONT = "var(--font-ff-prototype), 'Inter', system-ui, sans-serif";

export type ScreenId =
  | "home"
  | "bank-link"
  | "prefilled"
  | "questions"
  | "matching"
  | "lenders"
  | "my-card";

export type ScreenProps = {
  go: (screen: ScreenId) => void;
  t: Theme;
};

/* ── Atoms ────────────────────────────────────────────────────────────────── */

function Btn({
  label,
  onClick,
  disabled,
  secondary,
  IconLeft,
  IconRight,
  t,
  demo,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  secondary?: boolean;
  IconLeft?: Icon;
  IconRight?: Icon;
  t: Theme;
  /** Auto-demo press target. Lands on the <button>, never on a wrapper. */
  demo?: string;
}) {
  const [p, setP] = useState(false);
  return (
    <button
      type="button"
      data-demo={demo}
      onPointerDown={() => setP(true)}
      onPointerUp={() => {
        setP(false);
        if (!disabled) onClick?.();
      }}
      onPointerLeave={() => setP(false)}
      disabled={!!disabled}
      style={{
        width: "100%",
        height: 52,
        borderRadius: 14,
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: FONT,
        fontSize: 16,
        fontWeight: 700,
        background: disabled ? t.surfaceEl : secondary ? t.surfaceEl : t.btnBg,
        color: disabled ? t.textSm : secondary ? t.text : t.btnText,
        cursor: disabled ? "not-allowed" : "pointer",
        transform: p ? "scale(0.97)" : "scale(1)",
        transition: "transform .1s",
        boxShadow: "none",
      }}
    >
      {IconLeft && (
        <IconLeft c={disabled ? t.textSm : secondary ? t.text : t.btnText} s={18} />
      )}
      {label}
      {IconRight && (
        <IconRight c={disabled ? t.textSm : secondary ? t.text : t.btnText} s={18} />
      )}
    </button>
  );
}

function Logo() {
  /* eslint-disable-next-line @next/next/no-img-element -- an inline data URI
     carried over from the prototype; there is nothing for the optimizer to do. */
  return <img src={FF_LOGO} alt="Funding Finder" style={{ height: 28, width: "auto" }} />;
}

/* ── Home ─────────────────────────────────────────────────────────────────── */

export function HomeScreen({ go, t }: ScreenProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: t.page,
        animation: "ffp-fadeUp .3s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <Logo />
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: t.surfaceEl,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ic.Menu c={t.text} s={18} />
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 42,
              fontWeight: 900,
              color: t.text,
              letterSpacing: "-.03em",
              lineHeight: 1.05,
              marginBottom: 10,
            }}
          >
            Get funded in
            <br />
            <span style={{ color: t.tint }}>48 hours</span>
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 16,
              fontWeight: 700,
              color: t.tint,
              letterSpacing: "-.01em",
            }}
          >
            The way to get approved
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {[
            { v: "$0", I: Ic.Dollar, l: "Cost to apply" },
            { v: "240+", I: Ic.Building, l: "Lenders" },
            { v: "$2.4B", I: Ic.Banknote, l: "Funded" },
            { v: "94%", I: Ic.Target, l: "Match rate" },
          ].map((s) => (
            <div
              key={s.l}
              style={{
                background: t.surface,
                borderRadius: 16,
                padding: "16px",
                boxShadow: t.shadow,
              }}
            >
              <s.I c={t.tint} s={20} />
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 22,
                  fontWeight: 800,
                  color: t.text,
                  letterSpacing: "-.02em",
                  lineHeight: 1,
                  marginTop: 8,
                }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 13,
                  color: t.textSm,
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>

        <div
          data-demo="home-how"
          style={{
            background: t.surface,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: t.shadow,
          }}
        >
          <div
            style={{
              padding: "14px 18px 10px",
              borderBottom: `1px solid ${t.divider}`,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 700,
                color: t.textSm,
                letterSpacing: ".06em",
                textTransform: "uppercase",
              }}
            >
              How it works
            </div>
          </div>
          {[
            { n: "01", I: Ic.Bank, l: "Connect your bank", s: "Open banking pre-fills your financials" },
            { n: "02", I: Ic.FileText, l: "Complete your application", s: "Most people finish in under 15 minutes" },
            { n: "03", I: Ic.Target, l: "Get matched", s: "AI scores 240+ lenders in real time" },
            { n: "04", I: Ic.CreditCard, l: "Receive funds", s: "Virtual Mastercard via Mastercard Send" },
          ].map((s, i, arr) => (
            <div
              key={s.n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                borderBottom: i < arr.length - 1 ? `1px solid ${t.divider}` : "none",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: t.tintBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <s.I c={t.tint} s={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: t.text }}>
                  {s.l}
                </div>
                <div style={{ fontFamily: FONT, fontSize: 13, color: t.textMd, marginTop: 1 }}>
                  {s.s}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 22px 22px" }}>
        <Btn
          t={t}
          demo="home-start"
          label="Start application"
          IconRight={Ic.ArrowRight}
          onClick={() => go("bank-link")}
        />
        <div style={{ marginTop: 14, textAlign: "center" }}>
          <span style={{ fontFamily: FONT, fontSize: 13, color: t.textSm }}>
            Are you a broker?{" "}
          </span>
          <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: t.tint }}>
            Log in
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Bank link ────────────────────────────────────────────────────────────── */

export function BankLinkScreen({ go, t }: ScreenProps) {
  const [step, setStep] = useState(0); // 0 = explanation, 1 = bank selection
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const banks = [
    { id: "anz", name: "ANZ", logo: LOGOS.anz },
    { id: "commonwealth", name: "Commonwealth Bank", logo: LOGOS.commonwealth },
    { id: "nab", name: "NAB", logo: LOGOS.nab },
    { id: "westpac", name: "Westpac", logo: LOGOS.westpac },
  ];

  const timerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    []
  );

  const handleTap = (id: string) => {
    if (connecting || connected) return;
    setConnecting(id);
    timerRef.current = window.setTimeout(() => {
      setConnected(true);
      setConnecting(null);
    }, 2000);
  };

  const canSee = [
    "Annual revenue",
    "Monthly expenses",
    "Cash and account balances",
    "Existing debt balances",
    "Mortgage details and security property",
  ];

  // ── Step 0: what open banking can see ──────────────────────────────────────
  if (step === 0)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: t.page,
          animation: "ffp-fadeUp .3s ease",
        }}
      >
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px 0" }}>
          <button
            type="button"
            onClick={() => go("home")}
            aria-label="Back"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: t.surfaceEl,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Ic.ArrowLeft c={t.textMd} s={18} />
          </button>

          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 34,
                fontWeight: 900,
                color: t.text,
                letterSpacing: "-.02em",
                lineHeight: 1.1,
              }}
            >
              What open
              <br />
              <span style={{ color: t.tint }}>banking sees</span>
            </div>
          </div>

          <div
            data-demo="bank-sees"
            style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}
          >
            {canSee.map((label) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
                  <path
                    d="M4 11l5 5 9-9"
                    stroke={t.text}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 15,
                    fontWeight: 500,
                    color: t.text,
                    lineHeight: 1.4,
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: `1px solid ${t.divider}`,
              paddingTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: t.tintBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                <Ic.Lock c={t.tint} s={16} />
              </div>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 14, color: t.textMd, lineHeight: 1.55 }}>
                  <span style={{ fontWeight: 700, color: t.text }}>Read-only.</span> We can never
                  move money from your account.
                </div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 14,
                    color: t.textMd,
                    lineHeight: 1.55,
                    marginTop: 6,
                  }}
                >
                  Your data is protected under the{" "}
                  <a
                    href="https://www.cdr.gov.au"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: t.tint, fontWeight: 600, textDecoration: "none" }}
                  >
                    Australian Consumer Data Right (CDR)
                  </a>{" "}
                  so you stay in control and can revoke access anytime.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{ padding: "12px 22px 22px", display: "flex", flexDirection: "column", gap: 10 }}
        >
          <Btn
            t={t}
            demo="bank-continue"
            label="Continue"
            IconRight={Ic.ArrowRight}
            onClick={() => setStep(1)}
          />
          <Btn t={t} label="I'll fill in manually" secondary onClick={() => go("questions")} />
        </div>
      </div>
    );

  // ── Step 1: select a bank ──────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: t.page,
        animation: "ffp-slideInR .25s ease",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px 0" }}>
        <button
          type="button"
          onClick={() => setStep(0)}
          aria-label="Back"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: t.surfaceEl,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Ic.ArrowLeft c={t.textMd} s={18} />
        </button>

        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 34,
              fontWeight: 900,
              color: t.text,
              letterSpacing: "-.02em",
              lineHeight: 1.1,
            }}
          >
            Link your
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 34,
              fontWeight: 900,
              color: t.tint,
              letterSpacing: "-.02em",
              lineHeight: 1.1,
              marginBottom: 6,
            }}
          >
            bank account
          </div>
          <div style={{ fontFamily: FONT, fontSize: 14, color: t.textMd, lineHeight: 1.5 }}>
            Select your bank to connect via open banking.
          </div>
        </div>

        {connected && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 16px",
              background: t.greenBg,
              borderRadius: 14,
              marginBottom: 20,
              animation: "ffp-fadeUp .3s ease",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: t.green,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Ic.Check c="#fff" s={18} />
            </div>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: t.greenText }}>
                Bank connected
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 12,
                  color: t.greenText,
                  opacity: 0.8,
                  marginTop: 2,
                }}
              >
                Your financials have been pre-filled
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
          {banks.map((bank) => {
            const isConnecting = connecting === bank.id;
            return (
              <div
                key={bank.id}
                data-demo={`bank-${bank.id}`}
                onClick={() => handleTap(bank.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 18px",
                  background: t.surface,
                  borderRadius: 16,
                  cursor: connecting ? "default" : "pointer",
                  boxShadow: t.shadow,
                  transition: "all .15s",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- inline
                      data URI from the prototype; nothing for the optimizer to do. */}
                  <img
                    src={bank.logo}
                    alt={bank.name}
                    style={{ width: 52, height: 36, objectFit: "contain" }}
                  />
                </div>
                <div style={{ flex: 1, fontFamily: FONT, fontSize: 16, fontWeight: 600, color: t.text }}>
                  {bank.name}
                </div>
                {isConnecting ? (
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: `2px solid ${t.border}`,
                      borderTop: `2px solid ${t.tint}`,
                      animation: "ffp-spin .8s linear infinite",
                      flexShrink: 0,
                    }}
                  />
                ) : connected ? (
                  <Ic.Check c={t.green} s={18} />
                ) : (
                  <Ic.ChevRight c={t.textSm} s={16} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: t.tint }}>
            Show more banks
          </span>
        </div>
      </div>

      <div style={{ padding: "12px 22px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* The id changes with the state, which is how the demo WAITS for the
            connection: it goes looking for `bank-view-prefilled` and simply does
            not find it until the two-second handshake has finished. */}
        <Btn
          t={t}
          demo={connected ? "bank-view-prefilled" : "bank-connect"}
          label={connected ? "View pre-filled data" : "Connect with open banking"}
          IconRight={connected ? Ic.ArrowRight : undefined}
          onClick={() => (connected ? go("prefilled") : handleTap("anz"))}
        />
        <Btn t={t} label="I'll fill in manually" secondary onClick={() => go("questions")} />
      </div>
    </div>
  );
}

/* ── Pre-filled ───────────────────────────────────────────────────────────── */

export function PrefilledScreen({ go, t }: ScreenProps) {
  const prefilled = [
    { label: "Annual revenue", value: "$3,200,000", icon: Ic.TrendUp },
    { label: "Monthly expenses", value: "$148,000", icon: Ic.Receipt },
    { label: "Existing debt", value: "$1,100,000", icon: Ic.FileText },
    { label: "Cash reserves", value: "$380,000", icon: Ic.Dollar },
    { label: "Security property", value: "22 Horizon St, Penrith NSW", icon: Ic.Building },
    { label: "Property value", value: "$2,800,000", icon: Ic.Building },
  ];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: t.page,
        animation: "ffp-fadeUp .3s ease",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: t.greenBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Ic.Check c={t.green} s={20} />
          </div>
          <div>
            <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: t.greenText }}>
              Bank connected
            </div>
            <div style={{ fontFamily: FONT, fontSize: 12, color: t.greenText, opacity: 0.8 }}>
              Commonwealth Bank · Read-only
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 28,
              fontWeight: 900,
              color: t.text,
              letterSpacing: "-.02em",
              lineHeight: 1.1,
              marginBottom: 8,
            }}
          >
            We&apos;ve pre-filled
            <br />
            <span style={{ color: t.tint }}>your financials</span>
          </div>
          <div style={{ fontFamily: FONT, fontSize: 14, color: t.textMd, lineHeight: 1.55 }}>
            Review what we pulled from your bank. You can edit anything before submitting.
          </div>
        </div>

        <div
          data-demo="prefilled-values"
          style={{
            background: t.surface,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: t.shadow,
            marginBottom: 20,
          }}
        >
          {prefilled.map((item, i, arr) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                borderBottom: i < arr.length - 1 ? `1px solid ${t.divider}` : "none",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: t.tintBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <item.icon c={t.tint} s={15} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 11,
                    fontWeight: 600,
                    color: t.textMd,
                    letterSpacing: ".04em",
                    textTransform: "uppercase",
                    marginBottom: 1,
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: t.text }}>
                  {item.value}
                </div>
              </div>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: t.green,
                  flexShrink: 0,
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ background: t.tintBg, borderRadius: 14, padding: "14px 16px", marginBottom: 8 }}>
          <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: t.tint, marginBottom: 4 }}>
            What&apos;s next
          </div>
          <div style={{ fontFamily: FONT, fontSize: 13, color: t.textMd, lineHeight: 1.55 }}>
            We&apos;ll ask a few more questions about your loan purpose and security property. It
            takes about 2 minutes.
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 22px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
        <Btn
          t={t}
          demo="prefilled-continue"
          label="Continue to questions"
          IconRight={Ic.ArrowRight}
          onClick={() => go("questions")}
        />
      </div>
    </div>
  );
}

/* ── Questions, one at a time ─────────────────────────────────────────────── */

export function QuestionScreen({
  go,
  t,
  allowFocus,
}: ScreenProps & {
  /**
   * The source autofocuses the input on every question. Inside a page that
   * would drag the viewport back to the hero mid-read, so it waits until the
   * reader has actually taken the prototype over.
   */
  allowFocus: boolean;
}) {
  const total = QUESTIONS.length;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const a: Record<string, string> = {};
    QUESTIONS.forEach((q) => {
      if (q.prefill) a[q.id] = q.prefill;
    });
    return a;
  });
  const [inputVal, setInputVal] = useState("");
  const [animDir, setAnimDir] = useState(1);
  const [animKey, setAnimKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = QUESTIONS[idx];
  const current = answers[q.id] || "";
  const isLast = idx === total - 1;

  /* The source reloads the field from `answers` in an effect keyed on the
     question index. Doing it during render instead is React's own
     adjust-state-on-prop-change pattern: an effect that immediately setStates
     costs a second render pass and, on a controlled input, is visible as a
     flash of the previous question's value. */
  const [shownIdx, setShownIdx] = useState(idx);
  if (shownIdx !== idx) {
    setShownIdx(idx);
    setInputVal(answers[q.id] || "");
  }

  useEffect(() => {
    if (!allowFocus) return;
    if (QUESTIONS[idx].type !== "text" && QUESTIONS[idx].type !== "currency") return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 250);
    return () => window.clearTimeout(timer);
  }, [idx, allowFocus]);

  const navigate = (dir: number) => {
    if ((q.type === "text" || q.type === "currency") && inputVal)
      setAnswers((a) => ({ ...a, [q.id]: inputVal }));
    setAnimDir(dir);
    setAnimKey((k) => k + 1);
    if (dir === 1) setIdx((i) => Math.min(i + 1, total - 1));
    else setIdx((i) => Math.max(i - 1, 0));
  };

  const pick = (opt: string) => setAnswers((a) => ({ ...a, [q.id]: opt }));
  const toggle = () => setAnswers((a) => ({ ...a, [q.id]: current ? "" : "Uploaded" }));
  const canContinue = !q.req || !!current || (q.type !== "choice" && !!inputVal);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: t.page,
        animation: "ffp-fadeUp .3s ease",
      }}
    >
      <div style={{ flexShrink: 0, padding: "12px 20px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <button
            type="button"
            aria-label="Back"
            onClick={() => (idx > 0 ? navigate(-1) : go("home"))}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: t.surfaceEl,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ic.ArrowLeft c={t.textMd} s={18} />
          </button>
          {(() => {
            const nextGroup = GROUPS[GROUPS.indexOf(q.group) + 1];
            return nextGroup ? (
              <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, color: t.textSm }}>
                Next: <span style={{ color: t.textMd, fontWeight: 600 }}>{nextGroup}</span>
              </span>
            ) : (
              <div style={{ width: 36 }} />
            );
          })()}
        </div>

        {/* One progress indicator: the group segment strip. The segments give
            both overall and contextual progress, so no separate top bar. */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {GROUPS.map((g) => {
            const gQs = QUESTIONS.filter((x) => x.group === g);
            const done = gQs.filter((x) => answers[x.id]).length;
            const isCur = g === q.group;
            const isComplete = done === gQs.length && !isCur;
            return (
              <div key={g} style={{ flex: 1 }}>
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: isCur ? t.tint : isComplete ? `${t.tint}60` : t.surfaceEl,
                    transition: "background .3s",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div
        key={animKey}
        style={{
          flex: 1,
          padding: "4px 22px 0",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          animation: `${animDir > 0 ? "ffp-slideInR" : "ffp-slideInL"} .22s ease`,
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: FONT,
                fontSize: 16,
                fontWeight: 700,
                color: t.tint,
                letterSpacing: "-.01em",
              }}
            >
              {q.group}
            </span>
            <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: t.textSm }}>
              {QUESTIONS.filter((x) => x.group === q.group).indexOf(q) + 1}
              <span style={{ color: t.textXs }}>
                /{QUESTIONS.filter((x) => x.group === q.group).length}
              </span>
            </span>
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 24,
              fontWeight: 800,
              color: t.text,
              letterSpacing: "-.02em",
              lineHeight: 1.3,
              marginBottom: 8,
            }}
          >
            {q.q}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 14, color: t.textMd, lineHeight: 1.55 }}>
            {q.hint}
          </div>
        </div>

        {q.type === "choice" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {q.options?.map((opt, i) => {
              const sel = current === opt;
              return (
                <div
                  key={opt}
                  data-demo={`q-option-${i}`}
                  onClick={() => pick(opt)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "15px 18px",
                    borderRadius: 14,
                    border: `2px solid ${sel ? t.tint : t.border}`,
                    background: sel ? t.tintBg : t.surface,
                    cursor: "pointer",
                    transition: "all .15s",
                    boxShadow: sel ? `0 4px 16px ${t.tint}20` : t.shadow,
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONT,
                      fontSize: 15,
                      fontWeight: sel ? 600 : 400,
                      color: sel ? t.tint : t.text,
                    }}
                  >
                    {opt}
                  </span>
                  {sel && (
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: t.tint,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Ic.Check c="#fff" s={13} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {(q.type === "text" || q.type === "currency") && (
          <div>
            <div
              style={{
                position: "relative",
                background: t.surfaceEl,
                borderRadius: 14,
                border: `2px solid ${inputVal ? t.tint : t.border}`,
                transition: "border-color .15s",
              }}
            >
              {q.type === "currency" && (
                <span
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontFamily: FONT,
                    fontSize: 26,
                    fontWeight: 700,
                    color: t.textSm,
                    pointerEvents: "none",
                  }}
                >
                  $
                </span>
              )}
              <input
                ref={inputRef}
                aria-label={q.q}
                value={q.type === "currency" ? inputVal.replace(/^\$/, "") : inputVal}
                onChange={(e) => {
                  const v =
                    q.type === "currency"
                      ? "$" + e.target.value.replace(/^\$/, "")
                      : e.target.value;
                  setInputVal(v);
                  setAnswers((a) => ({ ...a, [q.id]: v }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (inputVal || current)) navigate(1);
                }}
                placeholder={q.type === "currency" ? "0" : "Type your answer…"}
                style={{
                  width: "100%",
                  height: 62,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontFamily: FONT,
                  fontSize: 22,
                  fontWeight: 600,
                  color: t.text,
                  paddingLeft: q.type === "currency" ? 44 : 18,
                  paddingRight: inputVal ? 46 : 18,
                }}
              />
              {inputVal && (
                <button
                  type="button"
                  aria-label="Clear answer"
                  onClick={() => {
                    setInputVal("");
                    setAnswers((a) => ({ ...a, [q.id]: "" }));
                  }}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: t.border,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ic.X c={t.textMd} s={13} />
                </button>
              )}
            </div>
          </div>
        )}

        {q.type === "upload" && (
          <div
            data-demo="q-upload"
            onClick={toggle}
            style={{
              border: `2px dashed ${current ? t.tint : t.border}`,
              borderRadius: 18,
              padding: "28px 20px",
              cursor: "pointer",
              background: current ? t.tintBg : t.surface,
              transition: "all .2s",
              textAlign: "center",
            }}
          >
            {current ? (
              <>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: t.tintSoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <Ic.CheckCircle c={t.tint} s={28} />
                </div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 16,
                    fontWeight: 700,
                    color: t.tint,
                    marginBottom: 4,
                  }}
                >
                  Uploaded ✓
                </div>
                <div style={{ fontFamily: FONT, fontSize: 13, color: t.textSm }}>Tap to remove</div>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: t.surfaceEl,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <Ic.Upload c={t.textSm} s={24} />
                </div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 16,
                    fontWeight: 600,
                    color: t.text,
                    marginBottom: 4,
                  }}
                >
                  Tap to upload
                </div>
                <div style={{ fontFamily: FONT, fontSize: 13, color: t.textSm }}>
                  PDF or photo · Max 20MB
                </div>
              </>
            )}
          </div>
        )}

        <div style={{ flex: 1 }} />
      </div>

      <div style={{ flexShrink: 0, padding: "12px 20px 20px" }}>
        <Btn
          t={t}
          demo="q-continue"
          label={isLast ? "Find my lenders" : "Continue"}
          IconRight={Ic.ArrowRight}
          disabled={!canContinue}
          onClick={() => (isLast ? go("matching") : navigate(1))}
        />
      </div>
    </div>
  );
}

/* ── Matching ─────────────────────────────────────────────────────────────── */

export function MatchingScreen({ go, t, still }: ScreenProps & { still: boolean }) {
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const iv = window.setInterval(
      () =>
        setProg((p) => {
          if (p >= 100) {
            window.clearInterval(iv);
            return 100;
          }
          return p + 2;
        }),
      50
    );
    return () => window.clearInterval(iv);
  }, []);
  const done = prog >= 100;
  const steps = [
    { d: prog > 20, l: "Verifying open banking data" },
    { d: prog > 50, l: "Scoring 240+ lender products" },
    { d: prog > 75, l: "Calculating LVR & DSCR" },
    { d: prog > 90, l: "Ranking your best matches" },
  ];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: t.page,
        animation: "ffp-fadeUp .3s ease",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 28px 60px",
        }}
      >
        <div style={{ width: 80, height: 80, margin: "0 auto 28px", position: "relative" }}>
          <div
            style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${t.surfaceEl}` }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "3px solid transparent",
              borderTopColor: t.tint,
              // Under reduced motion the ring holds still; the progress bar and
              // the checklist still carry the "working" read.
              animation: still ? "none" : "ffp-spin 1s linear infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ic.Target c={t.tint} s={30} />
          </div>
        </div>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 26,
              fontWeight: 800,
              color: t.text,
              letterSpacing: "-.03em",
              marginBottom: 6,
            }}
          >
            Finding your best lenders
          </div>
          <div style={{ fontFamily: FONT, fontSize: 14, color: t.textMd }}>
            Matching to 240+ private lenders
          </div>
        </div>
        <div
          style={{
            background: t.surface,
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: t.shadow,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontFamily: FONT, fontSize: 13, color: t.textSm, fontWeight: 500 }}>
              Matching
            </span>
            <span style={{ fontFamily: FONT, fontSize: 13, color: t.tint, fontWeight: 700 }}>
              {prog}%
            </span>
          </div>
          <div style={{ height: 6, background: t.surfaceEl, borderRadius: 3, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                background: t.tint,
                width: `${prog}%`,
                borderRadius: 3,
                transition: "width .1s",
              }}
            />
          </div>
        </div>
        <div
          style={{ background: t.surface, borderRadius: 16, overflow: "hidden", boxShadow: t.shadow }}
        >
          {steps.map((s, i) => (
            <div
              key={s.l}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 18px",
                borderBottom: i < steps.length - 1 ? `1px solid ${t.divider}` : "none",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: s.d ? t.green : t.surfaceEl,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background .3s",
                  flexShrink: 0,
                }}
              >
                {s.d && <Ic.Check c="#fff" s={13} />}
              </div>
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 14,
                  color: s.d ? t.text : t.textSm,
                  fontWeight: s.d ? 500 : 400,
                  transition: "color .3s",
                }}
              >
                {s.l}
              </span>
            </div>
          ))}
        </div>
        {done && (
          <div style={{ marginTop: 24 }}>
            <Btn
              t={t}
              demo="matching-view"
              label="View matched lenders"
              IconRight={Ic.ArrowRight}
              onClick={() => go("lenders")}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Lenders ──────────────────────────────────────────────────────────────── */

export function LendersScreen({ go, t }: ScreenProps) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: t.pageBg,
        animation: "ffp-fadeUp .3s ease",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 0" }}>
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 32,
              fontWeight: 900,
              color: t.text,
              letterSpacing: "-.03em",
              lineHeight: 1.1,
              marginBottom: 6,
            }}
          >
            3 lenders
            <br />
            <span style={{ color: t.tint }}>matched</span>
          </div>
          <div style={{ fontFamily: FONT, fontSize: 15, color: t.textMd }}>
            Ranked by match score. Select one to proceed.
          </div>
        </div>

        <div
          style={{
            background: t.surface,
            borderRadius: 14,
            boxShadow: t.shadow,
            marginBottom: 20,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "stretch" }}>
            {[
              { l: "Amount", v: "$750,000" },
              { l: "Term", v: "24 months" },
              { l: "Purpose", v: "Expansion" },
            ].map((s, i, arr) => (
              <div
                key={s.l}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRight: i < arr.length - 1 ? `1px solid ${t.divider}` : "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 10,
                    fontWeight: 600,
                    color: t.textSm,
                    letterSpacing: ".05em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.l}
                </div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 14,
                    fontWeight: 700,
                    color: t.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </div>

        {LENDERS.map((l, i) => {
          const isSel = selected === i;
          return (
            <div
              key={l.name}
              data-demo={`lender-${i}`}
              onClick={() => setSelected(i)}
              style={{
                background: t.surface,
                borderRadius: 18,
                padding: "18px",
                marginBottom: 12,
                cursor: "pointer",
                boxShadow: isSel ? t.shadowMd : t.shadow,
                border: `2px solid ${isSel ? t.tint : "transparent"}`,
                transition: "all .15s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 17,
                      fontWeight: 700,
                      color: t.text,
                      marginBottom: 5,
                    }}
                  >
                    {l.name}
                  </div>
                  <span
                    style={{
                      fontFamily: FONT,
                      fontSize: 11,
                      fontWeight: 600,
                      color: l.tag,
                      background: l.tagBg,
                      padding: "3px 10px",
                      borderRadius: 20,
                    }}
                  >
                    {l.type}
                  </span>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 10,
                      fontWeight: 600,
                      color: t.textSm,
                      letterSpacing: ".04em",
                      textTransform: "uppercase",
                      marginBottom: 2,
                    }}
                  >
                    Match
                  </div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 24,
                      fontWeight: 800,
                      color: l.match >= 95 ? t.green : t.text,
                      letterSpacing: "-.02em",
                    }}
                  >
                    {l.match}%
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                  marginBottom: 14,
                  background: t.pageBg,
                  borderRadius: 12,
                  padding: "12px",
                }}
              >
                {[
                  { l: "Rate p.a.", v: `${l.rate}%` },
                  { l: "Term", v: l.term },
                  {
                    l: "Est. monthly",
                    v: `$${Math.round(
                      (750000 * (parseFloat(l.rate) / 100 / 12)) /
                        (1 - Math.pow(1 + parseFloat(l.rate) / 100 / 12, -24))
                    ).toLocaleString()}`,
                  },
                ].map((s) => (
                  <div key={s.l}>
                    <div
                      style={{
                        fontFamily: FONT,
                        fontSize: 10,
                        fontWeight: 600,
                        color: t.textSm,
                        letterSpacing: ".04em",
                        textTransform: "uppercase",
                        marginBottom: 3,
                      }}
                    >
                      {s.l}
                    </div>
                    <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: t.text }}>
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 13,
                  color: t.textMd,
                  lineHeight: 1.5,
                  marginBottom: isSel ? 12 : 0,
                }}
              >
                {l.why}
              </div>

              {isSel && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 12,
                    borderTop: `1px solid ${t.divider}`,
                  }}
                >
                  <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: t.tint }}>
                    Selected
                  </span>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: t.tint,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ic.Check c="#fff" s={13} />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "12px 14px",
            background: t.surface,
            borderRadius: 12,
            boxShadow: t.shadow,
            marginBottom: 8,
          }}
        >
          <Ic.Shield c={t.textSm} s={16} />
          <div style={{ fontFamily: FONT, fontSize: 12, color: t.textSm, lineHeight: 1.5 }}>
            Rates are indicative. Final terms subject to lender credit assessment and valuation.
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 20px 20px" }}>
        <Btn
          t={t}
          demo={selected === null ? undefined : "lenders-proceed"}
          label={
            selected !== null ? `Proceed with ${LENDERS[selected].name}` : "Select a lender to continue"
          }
          disabled={selected === null}
          IconRight={Ic.ArrowRight}
          onClick={() => go("my-card")}
        />
      </div>
    </div>
  );
}

/* ── Card ─────────────────────────────────────────────────────────────────── */

export function CardScreen({ go, t }: ScreenProps) {
  const [appleAdded, setAppleAdded] = useState(false);
  const [googleAdded, setGoogleAdded] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: t.pageBg,
        animation: "ffp-fadeUp .3s ease",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 26,
              fontWeight: 800,
              color: t.text,
              letterSpacing: "-.02em",
            }}
          >
            My Card
          </div>
        </div>

        {/* The card artwork shipped inside the prototype as a 22KB base64 blob;
            it lives as a file here so it goes through the image optimizer like
            every other raster on the site (.docs/asset-weight.md §1). */}
        <div data-demo="card-art" style={{ marginBottom: 20 }}>
          <Image
            src="/assets/funding-finder/prototype/virtual-card.jpg"
            alt="Funding Finder virtual card"
            width={741}
            height={450}
            sizes="350px"
            style={{ width: "100%", height: "auto", display: "block", borderRadius: 16 }}
          />
        </div>

        <div
          style={{
            background: t.surface,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: t.shadow,
            marginBottom: 20,
          }}
        >
          {[
            ["Available", "$750,000"],
            ["Type", "Virtual Mastercard"],
          ].map(([k, v], i, arr) => (
            <div
              key={k}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: i < arr.length - 1 ? `1px solid ${t.divider}` : "none",
              }}
            >
              <span style={{ fontFamily: FONT, fontSize: 13, color: t.textSm, fontWeight: 500 }}>
                {k}
              </span>
              <span style={{ fontFamily: FONT, fontSize: 14, color: t.text, fontWeight: 600 }}>
                {v}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 11,
              fontWeight: 700,
              color: t.textSm,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Add to Wallet
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              {
                id: "apple",
                label: "Apple Pay",
                added: appleAdded,
                add: () => setAppleAdded(true),
                logo: "/assets/funding-finder/prototype/apple-pay.svg",
                ratio: 41.5 / 51,
              },
              {
                id: "google",
                label: "Google Pay",
                added: googleAdded,
                add: () => setGoogleAdded(true),
                logo: "/assets/funding-finder/prototype/google-pay.svg",
                ratio: 2.4,
              },
            ].map((wallet) => (
              <div
                key={wallet.id}
                onClick={wallet.add}
                style={{
                  height: 52,
                  borderRadius: 14,
                  background: wallet.added ? t.greenBg : t.surfaceEl,
                  border: `1.5px solid ${wallet.added ? t.green : t.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: "pointer",
                  transition: "all .2s",
                  boxShadow: t.shadow,
                }}
              >
                {wallet.added ? (
                  <span
                    style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: t.greenText }}
                  >
                    Added ✓
                  </span>
                ) : (
                  <>
                    <Image
                      src={wallet.logo}
                      alt=""
                      width={Math.round(18 * wallet.ratio)}
                      height={18}
                      style={{ height: 18, width: "auto" }}
                    />
                    <span
                      style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: t.text }}
                    >
                      {wallet.label}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{ flexShrink: 0, padding: "12px 20px 20px", boxShadow: `0 -1px 0 ${t.divider}` }}
      >
        <Btn t={t} demo="card-done" label="Done" onClick={() => go("home")} />
      </div>
    </div>
  );
}
