import { Ic, type Icon } from "./icons";

/**
 * The question set the hero's prototype runs.
 *
 * The source prototype carries twenty questions across five groups. The hero
 * is not the prototype: it is a ~50 second demonstration of the product's
 * spine, and twenty questions is a loop nobody watches to the end. So this is
 * a CURATED slice — one question per group, in the source's own order and
 * with the source's own copy, chosen so the four beats of the argument land:
 *
 *   term          the borrower's intent, which no bank feed can know, so the
 *                 hand actually answers it
 *   annualRevenue arrived pre-filled from the bank connection two screens ago
 *   propValue     ditto, and the security question the whole loan turns on
 *   doc_id        the one thing open banking cannot supply, so the flow still
 *                 has to ask for it
 *
 * `prefill` is kept exactly where the bank feed would genuinely have supplied
 * the answer and dropped where it would not — which is a truer model than the
 * source file's (it prefills everything so its own demo runs fast), and it is
 * what gives the walkthrough something to press.
 *
 * Everything here stays reachable by hand: a reader who takes over gets this
 * same set, the same controls, the same order.
 */
export type Question = {
  id: string;
  group: string;
  Icon: Icon;
  req: boolean;
  type: "currency" | "text" | "choice" | "upload";
  q: string;
  hint: string;
  options?: string[];
  prefill?: string;
};

export const QUESTIONS: Question[] = [
  {
    id: "term",
    group: "Loan Details",
    Icon: Ic.Clock,
    req: true,
    type: "choice",
    q: "What loan term are you looking for?",
    hint: "Most private term loans range from 12 to 36 months",
    options: ["12 months", "18 months", "24 months", "36 months"],
  },
  {
    id: "annualRevenue",
    group: "Financials",
    Icon: Ic.TrendUp,
    req: true,
    type: "currency",
    q: "What was your annual revenue last year?",
    hint: "One of the most important factors for lenders",
    prefill: "$3,200,000",
  },
  {
    id: "propValue",
    group: "Security",
    Icon: Ic.Home,
    req: true,
    type: "currency",
    q: "Estimated value of your security property?",
    hint: "An independent valuation may be ordered by the lender",
    prefill: "$2,800,000",
  },
  {
    id: "doc_id",
    group: "Documents",
    Icon: Ic.Badge,
    req: true,
    type: "upload",
    q: "Upload a copy of your ID",
    hint: "Driver licence (front & back) or passport photo page",
  },
];

export const GROUPS = [...new Set(QUESTIONS.map((q) => q.group))];

export type Lender = {
  name: string;
  rate: string;
  term: string;
  match: number;
  type: string;
  tag: string;
  tagBg: string;
  why: string;
};

export const LENDERS: Lender[] = [
  {
    name: "Apex Capital",
    rate: "6.2",
    term: "24 mo",
    match: 98,
    type: "Best Match",
    tag: "#166534",
    tagBg: "#F0FDF4",
    why: "Strong match on LVR, revenue and loan term. Specialist in commercial property.",
  },
  {
    name: "Meridian Fund",
    rate: "6.8",
    term: "18 mo",
    match: 91,
    type: "Low Rate",
    tag: "#1E40AF",
    tagBg: "#EFF6FF",
    why: "Lowest rate available for your profile. Shorter term increases monthly repayments.",
  },
  {
    name: "Crest Finance",
    rate: "7.4",
    term: "24 mo",
    match: 84,
    type: "Flexible",
    tag: "#92400E",
    tagBg: "#FFFBEB",
    why: "More flexible drawdown and repayment options. Suits businesses with variable cash flow.",
  },
];
