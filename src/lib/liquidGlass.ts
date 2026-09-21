/**
 * iOS 26 "liquid glass" displacement filter.
 *
 * Vendored from nikdelvin/liquid-glass (MIT, © 2025 Nikita Stadnik)
 * https://github.com/nikdelvin/liquid-glass
 *
 * The technique: build an SVG displacement map as a data URI, feed it to three
 * feDisplacementMap passes (one per colour channel, at slightly different
 * scales, which is what produces the chromatic fringe along the rim), then use
 * the whole filter as a `backdrop-filter`. The glass therefore refracts the
 * real page behind it rather than faking it with a blur.
 */

type MapOptions = {
  width: number;
  height: number;
  radius: number;
  depth: number;
};

type FilterOptions = MapOptions & {
  strength?: number;
  chromaticAberration?: number;
};

const displacementMap = ({ width, height, radius, depth }: MapOptions) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <style>.mix { mix-blend-mode: screen; }</style>
  <defs>
    <linearGradient id="Y" x1="0" x2="0" y1="${Math.ceil((radius / height) * 15)}%" y2="${Math.floor(100 - (radius / height) * 15)}%">
      <stop offset="0%" stop-color="#0F0" /><stop offset="100%" stop-color="#000" />
    </linearGradient>
    <linearGradient id="X" x1="${Math.ceil((radius / width) * 15)}%" x2="${Math.floor(100 - (radius / width) * 15)}%" y1="0" y2="0">
      <stop offset="0%" stop-color="#F00" /><stop offset="100%" stop-color="#000" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
  <g filter="blur(2px)">
    <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
    <rect x="0" y="0" height="${height}" width="${width}" fill="url(#Y)" class="mix" />
    <rect x="0" y="0" height="${height}" width="${width}" fill="url(#X)" class="mix" />
    <rect x="${depth}" y="${depth}" height="${height - 2 * depth}" width="${width - 2 * depth}" fill="#808080" rx="${radius}" ry="${radius}" filter="blur(${depth}px)" />
  </g>
</svg>`);

export const displacementFilter = ({
  width,
  height,
  radius,
  depth,
  strength = 100,
  chromaticAberration = 0,
}: FilterOptions) => {
  const map = displacementMap({ width, height, radius, depth });
  const pass = (scale: number, matrix: string, result: string) => `
    <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${scale}" xChannelSelector="R" yChannelSelector="G" />
    <feColorMatrix type="matrix" values="${matrix}" result="${result}" />`;

  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="displace" color-interpolation-filters="sRGB">
      <feImage x="0" y="0" height="${height}" width="${width}" href="${map}" result="displacementMap" />
      ${pass(strength + chromaticAberration * 2, "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0", "displacedR")}
      ${pass(strength + chromaticAberration, "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0", "displacedG")}
      ${pass(strength, "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0", "displacedB")}
      <feBlend in="displacedR" in2="displacedG" mode="screen" />
      <feBlend in2="displacedB" mode="screen" />
    </filter>
  </defs>
</svg>`) +
    "#displace"
  );
};

/** Safari cannot use an SVG filter as a backdrop-filter and falls back to blur. */
export const supportsGlass = () => {
  if (typeof document === "undefined") return false;
  const el = document.createElement("div");
  el.style.cssText = "backdrop-filter: url(#x)";
  return el.style.backdropFilter === "url(#x)" ||
    (el.style as CSSStyleDeclaration & { webkitBackdropFilter?: string })
      .webkitBackdropFilter === "url(#x)";
};
