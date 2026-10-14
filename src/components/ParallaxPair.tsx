import Image from "next/image";
import s from "./ParallaxPair.module.css";

type Props = {
  back: string;
  front: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** CSS object-position for both layers. */
  position?: string;
  /** Lag of the background layer (% of its height, positive = further away). */
  backDepth?: number;
  /** Lead of the foreground layer (negative = closer to the viewer). */
  frontDepth?: number;
};

/**
 * A photo split into a `-back` scene and a `-front` subject cut-out. The two
 * frames are siblings (not nested) so a page-level brush stroke can sit
 * between them: back is z-index 1, front is z-index 4, brushes use 2.
 * Each layer is enlarged by GSAP (`data-parallax-scale`) so its travel never
 * shows an edge.
 */
export default function ParallaxPair({
  back,
  front,
  alt,
  className,
  sizes = "(max-width: 1023px) 100vw, 40vw",
  priority,
  position = "50% 50%",
  backDepth = 4,
  frontDepth = -4,
}: Props) {
  const scale = (depth: number) => (1 + Math.abs(depth) / 50 + 0.02).toFixed(3);
  return (
    <div className={`${s.pair} ${className ?? ""}`}>
      <div className={`${s.frame} ${s.back}`} data-parallax-root>
        <div className={s.layer} data-parallax={backDepth} data-parallax-scale={scale(backDepth)}>
          <Image src={back} alt="" fill sizes={sizes} priority={priority} style={{ objectFit: "cover", objectPosition: position }} />
        </div>
      </div>
      <div className={`${s.frame} ${s.front}`} data-parallax-root>
        <div className={s.layer} data-parallax={frontDepth} data-parallax-scale={scale(frontDepth)}>
          <Image src={front} alt={alt} fill sizes={sizes} priority={priority} style={{ objectFit: "cover", objectPosition: position }} />
        </div>
      </div>
    </div>
  );
}
