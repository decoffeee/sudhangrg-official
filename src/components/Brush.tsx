import type { HTMLAttributes } from "react";
import { u } from "@/lib/u";
import s from "./Brush.module.css";

/**
 * Red brush strokes from the design. Each variant records the Figma geometry:
 * the un-rotated layer box, where the SVG sits inside it (the artwork bleeds
 * past the layer), and an estimated centre-line used as a stroked mask so the
 * stroke can be "painted" in along its length.
 */
const VARIANTS = {
  a: {
    file: "/svg/brush-a.svg",
    viewBox: "0 0 2917.41 2340.78",
    box: [2753, 2311.992],
    inset: [-110.68, -28.67],
    size: [2917.41, 2340.78],
    width: 600,
    line: "M83 2402 L142 2256 L171 2184 L237 2049 L298 1908 L381 1798 L481 1712 L601 1655 L702 1570 L835 1532 L919 1423 L1018 1336 L1082 1198 L1187 1120 L1310 1066 L1444 1029 L1566 974 L1683 912 L1791 838 L1910 779 L2022 709 L2162 681 L2299 647 L2431 607 L2528 517 L2596 386 L2663 253 L2735 127 L2784 83 L2903 -21",
  },
  c: {
    file: "/svg/brush-c.svg",
    viewBox: "0 0 2274.31 1799.66",
    box: [2108.508, 1770.742],
    inset: [-110.9, -28.86],
    size: [2274.31, 1799.66],
    width: 493,
    line: "M52 1851 L123 1752 L154 1709 L211 1613 L258 1504 L316 1410 L392 1341 L483 1294 L557 1223 L654 1185 L722 1105 L804 1045 L861 949 L941 886 L1036 845 L1142 820 L1228 765 L1308 702 L1380 629 L1473 584 L1561 533 L1678 522 L1792 507 L1902 487 L1976 417 L2024 308 L2069 196 L2121 94 L2160 61 L2253 -17",
  },
} as const;

type Props = HTMLAttributes<HTMLDivElement> & {
  variant: keyof typeof VARIANTS;
  /** Unique id for the mask (must be stable and valid in `url(#…)`). */
  id: string;
  rotate: number;
  opacity?: number;
  /** Which end of the stroke the paint starts from. */
  from?: "start" | "end";
  /** `load` plays on page load; otherwise it plays when scrolled into view. */
  trigger?: "load" | "scroll";
};

export default function Brush({
  variant,
  id,
  rotate,
  opacity = 1,
  from = "end",
  trigger = "scroll",
  className,
  ...rest
}: Props) {
  const v = VARIANTS[variant];
  const maskId = `brush-mask-${id}`;

  return (
    <div className={`${s.wrap} ${className ?? ""}`} data-brush-root aria-hidden="true" {...rest}>
      <div className={s.box} style={{ width: u(v.box[0]), height: u(v.box[1]), transform: `rotate(${rotate}deg)` }}>
        <svg
          className={s.svg}
          viewBox={v.viewBox}
          preserveAspectRatio="none"
          data-brush
          data-brush-from={from}
          data-brush-trigger={trigger}
          style={{ left: u(v.inset[0]), top: u(v.inset[1]), width: u(v.size[0]), height: u(v.size[1]) }}
        >
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x="-20%" y="-20%" width="140%" height="140%">
              <path
                d={v.line}
                pathLength={1}
                fill="none"
                stroke="#fff"
                strokeWidth={v.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1"
                strokeDashoffset={from === "start" ? 1 : -1}
              />
            </mask>
          </defs>
          <g mask={`url(#${maskId})`} opacity={opacity}>
            <use href={`${v.file}#brush`} />
          </g>
        </svg>
      </div>
    </div>
  );
}
