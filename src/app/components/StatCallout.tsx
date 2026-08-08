import { CountUp } from "./CountUp";

type StatCalloutProps = {
  /** Display value, e.g. "86.5%", "60–70%", "4x". Non-numeric values render statically. */
  value: string;
  label: string;
  detail?: string;
  /**
   * lg — the standalone snapshot hero (default). md — a supporting proof
   * row under a larger statement, sized so it never outweighs the line above.
   */
  size?: "lg" | "md";
  /** Offset in seconds, to match a staggered grid's cell cadence. */
  delay?: number;
};

const valueSize = {
  lg: "text-[clamp(2.75rem,5vw,4.5rem)]",
  md: "text-[clamp(2rem,3.4vw,3rem)]",
} as const;

export function StatCallout({
  value,
  label,
  detail,
  size = "lg",
  delay,
}: StatCalloutProps) {
  return (
    <div>
      <CountUp
        value={value}
        delay={delay}
        className={`${valueSize[size]} font-semibold leading-none tracking-[-0.03em]`}
      />
      <p className="mt-3 text-sm font-medium">{label}</p>
      {detail ? (
        <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}
