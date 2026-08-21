/**
 * The prototype's inline icon set, ported verbatim from the source JSX. Only
 * the glyphs the mobile happy path actually uses are carried across; the
 * broker-dashboard and web-layout glyphs stayed behind.
 *
 * Signature is the prototype's own — `c` for colour, `s` for size — so the
 * screen bodies below read the same as the file they came from and stay easy
 * to diff against it.
 */

export type IconProps = { c: string; s?: number };
export type Icon = (props: IconProps) => React.ReactElement;

export const Ic = {
  ArrowLeft: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ArrowRight: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14M13 6l6 6-6 6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Check: ({ c, s = 16 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M4 12l5 5L20 7" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  X: ({ c, s = 14 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18M6 6l12 12" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Upload: ({ c, s = 24 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  CheckCircle: ({ c, s = 28 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.8" />
      <path d="M7 12l3.5 3.5L17 9" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  AlertCircle: ({ c, s = 16 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.8" />
      <path d="M12 8v4M12 16h.01" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Shield: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Target: ({ c, s = 30 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="6" stroke={c} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="2" fill={c} />
    </svg>
  ),
  Dollar: ({ c, s = 20 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Building: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke={c} strokeWidth="1.8" />
      <path d="M9 3v18M3 9h6M3 15h6M15 9h3M15 13h3M15 17h3" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Briefcase: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke={c} strokeWidth="1.8" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M12 12v.01" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Hash: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Clock: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={c} strokeWidth="1.8" />
      <path d="M12 6v6l4 2" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  User: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={c} strokeWidth="1.8" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  TrendUp: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M23 6l-9.5 9.5-5-5L1 18" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 6h6v6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Banknote: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke={c} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.5" />
      <path d="M6 12h.01M18 12h.01" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Home: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={c} strokeWidth="1.8" />
      <path d="M9 22V12h6v10" stroke={c} strokeWidth="1.8" />
    </svg>
  ),
  CreditCard: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="1" y="4" width="22" height="16" rx="2" stroke={c} strokeWidth="1.8" />
      <path d="M1 10h22" stroke={c} strokeWidth="2" />
      <path d="M7 15h2M11 15h6" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  FileText: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={c} strokeWidth="1.8" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Badge: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.8" />
      <path d="M9 12l2 2 4-4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Bank: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M3 10h18M3 14h18M12 2L3 7h18L12 2zM5 10v4M9 10v4M15 10v4M19 10v4M3 18h18" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Receipt: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 7h8M8 11h8M8 15h5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  ChevRight: ({ c, s = 16 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M9 18l6-6-6-6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Menu: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <path d="M3 6h18M3 12h18M3 18h18" stroke={c} strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  Lock: ({ c, s = 18 }: IconProps) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke={c} strokeWidth="1.8" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1.5" fill={c} />
    </svg>
  ),
} as const;
