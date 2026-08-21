# Perspective — building a 3D scene that reads as a view, not a graphic

Everything here was derived from one build: a parallax wall of Funding Finder
prototype screens, raked back in 3D and unfurling on hover, tuned over three
rounds against live screenshots. **That component was deleted afterwards.** This
doc is what survived it, and it is the point of the exercise.

The whole doc reduces to five ideas: **focal length is the main control, not
angle**, **rotate Z is not perspective**, **focal length only means something
against subject size**, **centre the projection, not the box**, and **a tall
subject's width is a composition control**.

Starting notes for §1 and §2 are Lizzie's; everything marked "measured" came out
of the build.

---

## 1. The CSS setup

Perspective lives on the **parent**, rotation on the **child**. This is the whole
hierarchy — an element cannot apply perspective to itself.

```css
.scene {
  perspective: 800px;              /* the focal length — see §2 */
  perspective-origin: 50% 50%;     /* the vanishing point */
}
.wall {
  transform-style: preserve-3d;    /* only needed if children have their own z */
  transform: rotateY(-30deg) rotateX(10deg);
}
```

Animate the **group**, not the individual screens. Turning a grid of tiles into a
receding wall is one `rotateY` on the container; doing it per tile gives every
tile its own vanishing point, which is not a thing.

For canvas or generated SVG paths there is no parent to hang perspective on, so
the projection is done by hand — rotate the vertex about Y, push it away from the
camera, then divide:

```js
function project(x, y, z, angle, w, h) {
  const focal = 400;
  const rx = x * Math.cos(angle) - z * Math.sin(angle);
  const rz = x * Math.sin(angle) + z * Math.cos(angle);
  const fz = rz + 500;                    // push in front of the camera
  return {                                 // the perspective divide
    x: (rx * focal) / fz + w / 2,
    y: (y * focal) / fz + h / 2,
    scale: focal / fz,
  };
}
```

The DOM path is preferable when the subject is flat rectangles. Reach for the
matrix only when there is no element to transform.

## 2. Focal length is the main control

`perspective` is focal length, and it decides whether a scene reads as a
photograph or as a graphic. Angle is the *second* control, not the first.

- **Short (a wide-angle lens)** — strong convergence, and past a point, visible
  keystoning and shear.
- **Long (a telephoto)** — flattens the subject toward isometric. Depth
  disappears: the far edge is barely smaller than the near one, so there is
  nothing to read as distance.

Both ends were hit in the same build, in that order. The first pass was far too
short and read as a synthetic Dribbble tile; correcting it went to nearly twice
too long and read as flat. **A scene that "has no depth" is usually a lens that
is too long, not an angle that is too small** — reach for focal length before
reaching for degrees.

### The ratio is what matters, not the px value

**Measured, and the most useful thing in this doc.** A px figure for
`perspective` is meaningless on its own. What the eye reads is

```
focal length ÷ subject width
```

i.e. how many subject-widths back the camera is standing. From the build:

| ratio | what it looked like |
| --- | --- |
| 0.85 | far column near edge-on, near column near frontal — sheared, not turned |
| ~1.2 | usable, still slightly wide |
| **~1.4** | **landed here** — clear convergence, nothing keystoning |
| 2.5 | flat. Reads as isometric; the turn is visible but the depth is not |

So set it as `perspective: <1.3 to 1.6 × the subject's own width>` and let the px
value fall out. On the build that was `150cqw` against a matrix `111cqw` wide.

### Which is why it belongs in container units

A cover or card scene is never the viewport, and it is usually hosted at more
than one size. A fixed `perspective: 800px` is a *different lens on every host*:
about 2.8 subject-widths back on a 220px card and 0.7 on a 900px feature panel —
telephoto in the grid and fisheye in the feature, from one number.

**State perspective in `cqw` against an `@container` root.** The ratio then holds
at every size, and the two hosts get the same lens. This is the same argument
`cover-effects.md` makes for type inside a cover, applied to depth.

## 3. Rotate Z is not perspective

**The single biggest offender, and the easiest to miss**, because it sits in the
same `transform` as the two rotations that *are* perspective.

`rotateZ` is a **roll** — the whole image tipped on the page plane. It survives
untouched at any focal length, because nothing about it is a projection. At 13°
it was doing more to the silhouette than either real rotation, and a roll that
size is something a camera almost never does. Dropping it to ~2° did more for
"this looks like a photograph" than any other single change.

Keep a degree or two so the composition is not mechanically square to the frame.
Past about 4° it reads as a tilted graphic.

## 4. One dominant axis

Rake (`rotateX`) and turn (`rotateY`) at full strength at once means the subject
is skewed on both axes and neither reads as the dominant one. An off-axis
photograph is not composed that way.

Pick the dominant axis — usually Y, the turn — and use a **fraction** of the
other. The build landed on 34° of turn against 14° of rake.

And note the coupling: **focal length and angle are one decision, not two.** A
short lens on a nearly frontal wall shows no more depth than a long one, because
convergence needs an angle to act on. When a scene reads flat, check both before
changing either.

## 5. Centre the projection, not the box

**Measured, and it looks like a layout bug rather than a perspective one.**

The obvious way to centre a rotated wall is `left: 50%; transform: translateX(-50%)`.
That centres the element's own rectangle — which is the wrong rectangle. Turned
about Y under perspective, the near side scales **up** and the far side **down**,
so the shape actually drawn is a **trapezium whose visual weight sits toward the
near side**, while the far side converges toward the vanishing point and leaves a
wedge of empty ground behind it.

On the build this presented as "the artwork is badly placed in the panel" — an
empty wedge down one side that no amount of re-centring the box could fix.

Fix: offset the box **against the lean**, and ease the offset off as the subject
comes round, because the lean is a function of the turn. A fixed offset that is
right at 34° is an obvious misalignment at 12°.

```
x: rest -57%  →  open -51.5%      (against  rotateY  -34°  →  -12°)
```

Shifting `perspective-origin` instead is the other lever, but it moves the
vanishing point for the *whole* scene, so prefer moving the subject.

## 6. Depth sorting: only if things are actually at different depths

The standard warning is that elements passing in front of each other during a
rotation need re-ordering by computed z. **It does not apply to a coplanar
subject.** If every tile sits at `z = 0` — one plane, with columns sliding
*within* it — paint order is already correct at every angle and stays correct.

Worth an explicit comment in the code, because it is exactly the invariant
someone breaks later by giving one column its own `translateZ` for "a bit more
depth".

## 7. A tall subject's width is a composition control

**Measured, on phone screens, and it generalises to anything with a strong
aspect.** A handset is roughly a 2:1 rectangle, so **whatever a column is wide, a
tile is twice that tall**. Column width is therefore not a detail — it decides
how much of the subject is visible at all.

At `30cqw` a tile stood `61cqw` high in a frame about `100cqw` tall, so a reader
never saw a whole handset — only a long vertical slice of one, and the screens
read as strips. At `24cqw` a tile is `49cqw` and the same frame holds two whole
phones.

The symptom presents as **"the screens look too long"**, which is a trap: the
instinct is to crop to a squarer rectangle. Do not. On that build 390×800 was the
prototype's own canvas and was already *shorter* than a real handset (a 14 Pro is
2.17:1). Cropping would have fixed the symptom by falsifying the artifact. **Size
the subject, never re-cut it** — see the standing rule about using supplied
imagery at its full frame.

## 8. Edge falloff: mask, never a painted vignette

A 3D scene wider than its frame has to dissolve at the edges, or the composition
ends in a row of cut-off tiles and reads as a clipped screenshot.

Two ways, and only one of them is right:

- **A vignette painted in the ground colour.** Only ever correct on one host, and
  it forces the scene to declare a background so it has something to fade to.
- **A mask** — `mask-image` with crossed gradients and `mask-composite: intersect`
  (`-webkit-mask-composite: source-in` for older Safari; note the keyword differs).
  Alpha, so it fades to whatever is actually behind, and the scene needs no ground
  of its own.

**Never use a blurred inset `box-shadow` for this.** A blurred shadow has no flat
region — it only asymptotes toward clear — so at a reach that looks like an edge
treatment in the code it becomes a **tint layer** on screen. On the build,
`inset 22cqw 0 22cqw -12cqw` had the two sides meeting in the middle of a 286px
card and turning every white screen mauve. Use an explicit clear **stop**
(`transparent 0%, #000 15%, #000 85%, transparent 100%`) so the middle is
untouched by construction rather than by tuning.

In gradient *colour* stops, write the clear stop as the ground colour at zero
alpha, never the `transparent` keyword — `transparent` is transparent **black**
and greys the falloff. In a *mask* it is correct, because there is no colour to
interpolate toward.

## What not to reach for

- **More rotation, when the scene looks flat.** Almost always the lens (§2).
- **`rotateZ`, for "a bit more dynamism".** It is not perspective (§3).
- **A px `perspective` value copied from an article.** Meaningless without the
  subject width it was written against (§2).
- **Cropping a subject that "looks too long".** Size it instead (§7).
- **A blurred inset shadow as a vignette.** It is a tint layer (§8).
- **Per-element `translateZ` for depth**, on a subject that is meant to be one
  plane — it buys a little depth and costs you the sorting invariant (§6).

## Checklist for a new 3D scene

1. Perspective on the parent, rotation on the child (§1).
2. Set `perspective` to 1.3 to 1.6 × the subject's width, in `cqw` if the scene
   is hosted at more than one size (§2).
3. `rotateZ` at 2° or less (§3).
4. One dominant rotation axis, a fraction of the other (§4).
5. Offset the subject against the projection's lean, and ease it off with the
   turn (§5).
6. Coplanar? Say so in a comment. Not coplanar? Sort by computed z (§6).
7. Check how much of the subject is actually in frame before touching its aspect
   ratio (§7).
8. Edge falloff as a mask with an explicit clear stop (§8).
9. Look at it at the narrowest host it has, not just the widest — the short-lens
   failures show up small first.
