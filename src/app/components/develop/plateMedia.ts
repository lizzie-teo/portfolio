/*
 * PLATE MEDIA — the three things a developing plate can be given, and the
 * guarantee that it is given exactly one.
 *
 * WHY THREE. The plate exists to make a still picture move, and the obvious
 * implementation — take a video — assumes footage that most of this writing does
 * not have. These are methodology pieces: the hero images are screenshots and
 * diagrams, and a three-second clip of a Figma sidebar is a worse screenshot, not
 * a moving photograph. So the plate is built around the strategies actually
 * available rather than around the one that sounds richest:
 *
 *   clip    real motion footage or a screen recording, with a poster still.
 *   frames  two to four stills that cross-dissolve on a loop. Closer to how the
 *           moving photographs in the source actually behave than video is —
 *           a short gesture repeating, not a scene playing.
 *   media   an arbitrary node that animates itself, for the few pieces whose
 *           idea can be PERFORMED rather than recorded (a token name resolving
 *           from `Color/Background/Primary` to `--color-background-primary`).
 *
 * EXACTLY ONE, ENFORCED BY THE TYPE. The `?: never` arms are what make passing
 * two a compile error rather than a silent precedence bug at runtime — the plate
 * would otherwise have to pick a winner, and every possible choice is wrong. The
 * prop names are the ones in the brief; narrowing is by presence
 * (`"frames" in media`), which is why no `kind` tag is needed.
 *
 * The plate does not care which arm it received: all three render into the same
 * box and take the same treatment layers on top. That is the actual design
 * commitment here — the media strategy is an authoring convenience, never a
 * visual difference the reader can see.
 */

import type { ReactNode } from "react";

/** Real motion footage. Silent, looping, decorative — never the only source of
    information (style-rules §6, and the brief's accessibility bar). */
export type PlateClip = {
  /** Video source. Loaded on first activation, never on mount. */
  src: string;
  /** The still shown at rest and under reduced motion. */
  poster: string;
};

export type PlateMedia =
  | { clip: PlateClip; frames?: never; media?: never }
  | { clip?: never; frames: PlateFrames; media?: never }
  | { clip?: never; frames?: never; media: ReactNode };

/**
 * Two to four stills. The tuple arms are deliberate rather than `string[]`: one
 * frame cannot dissolve into anything, and past four the loop stops reading as a
 * repeating gesture and starts reading as a slideshow, which is a different and
 * much cheaper effect. Bounding it in the type means neither mistake reaches a
 * screenshot.
 */
export type PlateFrames =
  | readonly [string, string]
  | readonly [string, string, string]
  | readonly [string, string, string, string];
