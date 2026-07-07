import type { Metadata } from "next";
import { CaseStudyShell } from "@/app/components/CaseStudyShell";
import { caseStudyMetadata } from "../projects";

export const metadata: Metadata = caseStudyMetadata("ap-testing-portal");

export default function ApTestingPortalPage() {
  return (
    <CaseStudyShell slug="ap-testing-portal">
      <p className="max-w-prose text-lg leading-relaxed text-foreground md:text-xl">
        Full case study coming soon.
      </p>
    </CaseStudyShell>
  );
}
