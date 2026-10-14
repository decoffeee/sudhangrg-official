/**
 * Design unit: the Figma frame is 1728px wide, so `1u = 100vw / 1728`.
 * Sections that must line up with the brush strokes use absolute geometry in
 * these units on desktop; `--u` can be re-scoped per element (see mobile CSS).
 */
export const u = (n: number) => `calc(var(--u) * ${n})`;
