import Image from "next/image";

type MediaSurfaceProps = {
  /** What the artifact is — placeholder text, and alt text once `src` exists. */
  label: string;
  /** CSS aspect-ratio (width / height), e.g. 16/10 or 4/5. */
  ratio?: number;
  /** Real asset path under /public. Omit to render the placeholder frame. */
  src?: string;
  sizes?: string;
  /**
   * How the image meets the frame. Keep the default "cover" when `ratio`
   * matches the asset's intrinsic ratio; use "contain" when mixed-ratio
   * screenshots share one stable frame ratio (e.g. AnnotatedFrame steps),
   * so no interface content is cropped away.
   */
  fit?: "cover" | "contain";
  /**
   * "media" (default) full-bleeds the asset into the rounded frame — for
   * product imagery and diagrams. "document" presents an artifact that is
   * itself a framed page (deck slide, scanned exhibit): inset on a muted
   * mat with a small-radius hairline edge and no shadow, so it reads as
   * an exhibit rather than a frame inside a frame.
   */
  variant?: "media" | "document";
};

/**
 * The bare media surface, shared by MediaFrame and ArtifactViewer. With a
 * `src` it renders the real asset; without one it holds the artifact's
 * aspect ratio as a labeled placeholder so layout stays honest.
 */
export function MediaSurface({
  label,
  ratio = 16 / 10,
  src,
  sizes = "(min-width: 640px) 50vw, 100vw",
  fit = "cover",
  variant = "media",
}: MediaSurfaceProps) {
  if (src && variant === "document") {
    return (
      <div className="w-full rounded-2xl border border-border bg-muted p-3 sm:p-5">
        <div
          style={{ aspectRatio: ratio }}
          className="relative w-full overflow-hidden rounded-md border border-border/60 bg-card"
        >
          <Image
            src={src}
            alt={label}
            fill
            sizes={sizes}
            className={fit === "contain" ? "object-contain" : "object-cover"}
          />
        </div>
      </div>
    );
  }
  if (src) {
    return (
      <div
        style={{ aspectRatio: ratio }}
        className="relative w-full overflow-hidden rounded-2xl border border-border bg-secondary"
      >
        <Image
          src={src}
          alt={label}
          fill
          sizes={sizes}
          className={fit === "contain" ? "object-contain" : "object-cover"}
        />
      </div>
    );
  }
  return (
    <div
      style={{ aspectRatio: ratio }}
      className="flex w-full items-center justify-center rounded-2xl border border-border bg-secondary p-6"
    >
      <span className="max-w-[24ch] text-center text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

type MediaFrameProps = MediaSurfaceProps & {
  caption?: string;
  className?: string;
};

/** Case-study media with optional caption; placeholder until `src` is set. */
export function MediaFrame({
  label,
  caption,
  ratio,
  src,
  sizes,
  fit,
  variant,
  className,
}: MediaFrameProps) {
  return (
    <figure className={className}>
      <MediaSurface
        label={label}
        ratio={ratio}
        src={src}
        sizes={sizes}
        fit={fit}
        variant={variant}
      />
      {caption ? (
        <figcaption className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
