import { gorkhaPath } from "@/data/gorkha-path";

/** Inline outline of the Gorkha district, drawn in on scroll over the map image. */
export default function Gorkha({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1728 2529" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <path
        d={gorkhaPath}
        fill="none"
        stroke="#fff"
        strokeOpacity="0.85"
        strokeWidth="3"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset="1"
        data-gorkha-outline
      />
    </svg>
  );
}
