"use client";

/*
 * PLATE ACTIVE — how a bespoke scene finds out the plate it is sitting in has
 * started developing.
 *
 * The `media` strategy takes an opaque `ReactNode`, which is what makes it useful
 * (the plate never has to know what a scene is) and also what makes this module
 * necessary: the plate cannot pass a prop into a node it was handed already
 * constructed. Context is the seam. `DevelopPlate` publishes its activation state
 * and any scene inside it subscribes, so a scene stays a plain component the
 * caller writes normally rather than something the plate has to clone and inject
 * props into.
 *
 * It defaults to `false` rather than `true`. A scene rendered outside a plate —
 * in a test, a Storybook-style harness, or by mistake — sits still instead of
 * animating forever with no way to stop it.
 */

import { createContext, useContext } from "react";

export const PlateActiveContext = createContext(false);

/** True while this scene's plate is developing. Scenes must still consult
    `useReducedMotion()` themselves — this only reports attention, never
    permission to move. */
export function usePlateActive(): boolean {
  return useContext(PlateActiveContext);
}
