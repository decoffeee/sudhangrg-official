import type { CSSProperties, HTMLAttributes } from "react";
import { u } from "@/lib/u";
import s from "./Brush.module.css";

/**
 * Red brush strokes from the design. Each variant records the Figma geometry:
 * the un-rotated layer box and where the artwork sits inside it (it bleeds
 * past the layer). The stroke runs bottom-left → top-right at ~49° from
 * vertical.
 *
 * The artwork is a WebP raster of the Figma SVG (the vector is 120 KB of
 * path data that the browser would otherwise have to tessellate at ~3000 px
 * on the main thread). Moving a bitmap is a compositor-only operation.
 *
 * The paint-in is transform-only too: a box carrying a *static* soft-edged
 * mask slides along the stroke while the artwork inside it slides the other
 * way by the same amount, so the artwork stays put on screen and only the
 * mask edge travels. Nothing is repainted per frame; see PageMotion.brushes.
 */
const VARIANTS = {
  a: { file: "/images/brush-a.webp", px: [2400, 1926], box: [2753, 2311.992], inset: [-110.68, -28.67], size: [2917.41, 2340.78], angle: 49.3 },
  c: { file: "/images/brush-c.webp", px: [2000, 1583], box: [2108.508, 1770.742], inset: [-110.9, -28.86], size: [2274.31, 1799.66], angle: 49.7 },
} as const;

/** Width of the soft reveal edge as a fraction of the stroke's length. */
const EDGE = 0.22;

type Props = HTMLAttributes<HTMLDivElement> & {
  variant: keyof typeof VARIANTS;
  rotate: number;
  opacity?: number;
  /** Which end of the stroke the paint starts from. */
  from?: "start" | "end";
  /** `load` plays on page load; otherwise it plays when scrolled into view. */
  trigger?: "load" | "scroll";
};

export default function Brush({ variant, rotate, opacity = 1, from = "end", trigger = "scroll", className, ...rest }: Props) {
  const v = VARIANTS[variant];
  const [w, h] = v.size;
  // Sweep direction, CSS-gradient style (0° = up, 90° = right).
  const angle = from === "start" ? v.angle : v.angle + 180;
  const rad = (angle * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  // Rotation that turns an element's +x axis into the sweep direction.
  const tilt = angle - 90;
  // Artwork extents along and across the sweep.
  const len = w * Math.abs(sin) + h * Math.abs(cos);
  const perp = w * Math.abs(cos) + h * Math.abs(sin);
  const edge = EDGE * len;
  // The reveal box holds the artwork in its opaque part [0, len] and carries
  // the soft edge after it; sliding it back by its full width hides everything.
  const revealW = len + edge;
  const travel = revealW;

  const boxStyle = {
    width: u(v.box[0]),
    height: u(v.box[1]),
    transform: `rotate(${rotate}deg)`,
  } as CSSProperties;
  const sweepStyle = {
    left: u(v.inset[0] + w / 2),
    top: u(v.inset[1] + h / 2),
    transform: `rotate(${tilt}deg)`,
  } as CSSProperties;
  const revealStyle = {
    left: u(-len / 2),
    top: u(-perp / 2),
    width: u(revealW),
    height: u(perp),
    "--edge": `${(100 * edge) / revealW}%`,
  } as CSSProperties;
  const artStyle = {
    left: u(len / 2 - w / 2),
    top: u(perp / 2 - h / 2),
    width: u(w),
    height: u(h),
    transform: `rotate(${-tilt}deg)`,
    opacity,
  } as CSSProperties;

  return (
    <div className={`${s.wrap} ${className ?? ""}`} data-brush-root aria-hidden="true" {...rest}>
      <div className={s.box} style={boxStyle} data-brush data-brush-trigger={trigger}>
        <div className={s.sweep} style={sweepStyle}>
          {/* Start offsets as % of each element's own width, so they scale with --u. */}
          <div className={s.reveal} style={revealStyle} data-brush-reveal={(-100 * travel) / revealW}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={v.file}
              width={v.px[0]}
              height={v.px[1]}
              alt=""
              decoding="async"
              loading={trigger === "load" ? "eager" : "lazy"}
              className={s.img}
              style={artStyle}
              data-brush-art={(100 * travel) / w}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
