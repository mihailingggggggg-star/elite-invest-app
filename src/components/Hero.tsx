import { MeshGradient } from "@paper-design/shaders-react";

/**
 * Анимированный градиент шапки.
 *
 * Готовый шейдер из @paper-design/shaders-react
 * (github.com/paper-design/shaders, Apache-2.0) — плавно перетекающие пятна
 * вместо статичной заливки. Палитра перекрашена в бренд: хвоя → бронза.
 */
export function HeroBg() {
  return (
    <div className="hero__bg" aria-hidden>
      <MeshGradient
        width="100%"
        height="100%"
        colors={["#2A1A08", "#8C5A22", "#D08A38"]}
        speed={0.5}
        distortion={0.55}
        swirl={0.2}
        grainOverlay={0.1}
        maxPixelCount={420_000}
      />
    </div>
  );
}

/** Тот же градиент, но статичный — для шапок второстепенных экранов. */
export function HeroFlat() {
  return <div className="hero__flat" aria-hidden />;
}
