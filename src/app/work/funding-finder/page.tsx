import type { Metadata } from "next";
import { CaseStudyShell } from "@/app/components/CaseStudyShell";
import { caseStudyMetadata } from "../projects";

export const metadata: Metadata = caseStudyMetadata("funding-finder");

export default function FundingFinderPage() {
  return (
    <CaseStudyShell slug="funding-finder">
      <p className="max-w-prose text-lg leading-relaxed text-foreground md:text-xl">
        Full case study coming soon.
      </p>
    </CaseStudyShell>
  );
}
