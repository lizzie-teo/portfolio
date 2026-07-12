"use client";

import type { ComponentType } from "react";
import type { WorkCoverId } from "../work/projects";
import { ApTestingPortalCover } from "./ApTestingPortalCover";
import { SymptomCheckerCover } from "./SymptomCheckerCover";

type CoverProps = {
  hovered?: boolean;
  className?: string;
};

/* Registry of bespoke animated covers. Add the component here and reference
   its id from the entry's `media.cover` in `src/app/work/projects.ts`. */
const covers: Record<WorkCoverId, ComponentType<CoverProps>> = {
  "symptom-checker": SymptomCheckerCover,
  "ap-testing-portal": ApTestingPortalCover,
};

type ProjectCoverProps = CoverProps & {
  cover: WorkCoverId;
};

/** Resolves a registry cover id to its animated scene component. */
export function ProjectCover({ cover, ...props }: ProjectCoverProps) {
  const Cover = covers[cover];
  return <Cover {...props} />;
}
