# Funding Finder Remotion Hero Video

A Remotion project for a premium fintech phone mockup video: floating phone, matching pink/black/neutral brand palette, and only fintech-style background elements.

## Run

```bash
npm install
npm run start
```

## Render MP4

```bash
npm run render
```

The output will be saved to:

```bash
out/funding-finder-hero.mp4
```

## Replace the screenshot

Replace this file:

```bash
public/assets/funding-finder-screen.png
```

Keep the same filename and the scene will update automatically.

## Tweak brand colours

Edit these values in `src/FundingFinderHero.tsx`:

```ts
const pink = '#ec2d7a';
const dark = '#050505';
const neutral = '#f4f1ee';
```

## Notes

This version uses Remotion + React/CSS 3D so it is lightweight and easy to run. For a more physically realistic Blender/Three.js version, use this as the motion/design reference and replace the CSS phone with a GLB iPhone model mapped with the same screenshot texture.
