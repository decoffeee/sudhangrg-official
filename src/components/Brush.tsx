import type { CSSProperties, HTMLAttributes } from "react";
import { u } from "@/lib/u";
import s from "./Brush.module.css";

/**
 * Red brush strokes from the design. Each variant records the Figma geometry:
 * the un-rotated layer box and where the SVG artwork sits inside it (it
 * bleeds past the layer). The stroke runs bottom-left → top-right at ~49°
 * from vertical; the paint-in sweeps a gradient mask along that direction.
 *
 * Rendered as a plain <img> (rasterized once by the browser) rather than an
 * inline masked SVG, which was far too expensive to composite while scrolling.
 */
const VARIANTS = {
  a: { file: "/svg/brush-a.svg", box: [2753, 2311.992], inset: [-110.68, -28.67], size: [2917.41, 2340.78], angle: 49.3 },
  c: { file: "/svg/brush-c.svg", box: [2108.508, 1770.742], inset: [-110.9, -28.86], size: [2274.31, 1799.66], angle: 49.7 },
} as const;

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
  const angle = from === "start" ? v.angle : v.angle + 180;
  const imgStyle = {
    left: u(v.inset[0]),
    top: u(v.inset[1]),
    width: u(v.size[0]),
    height: u(v.size[1]),
    opacity,
    "--angle": `${angle}deg`,
  } as CSSProperties;

  return (
    <div className={`${s.wrap} ${className ?? ""}`} data-brush-root aria-hidden="true" {...rest}>
      <div className={s.box} style={{ width: u(v.box[0]), height: u(v.box[1]), transform: `rotate(${rotate}deg)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={v.file}
          alt=""
          decoding="async"
          loading={trigger === "load" ? "eager" : "lazy"}
          className={s.img}
          style={imgStyle}
          data-brush
          data-brush-trigger={trigger}
        />
      </div>
    </div>
  );
}
