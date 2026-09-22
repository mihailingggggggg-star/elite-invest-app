/**
 * Liquid glass material.
 *
 * Assembled from three open implementations:
 *
 * 1. nikdelvin/liquid-glass (MIT, © 2025 Nikita Stadnik)
 *    https://github.com/nikdelvin/liquid-glass
 *    The displacement map fed to `backdrop-filter`, so the glass refracts the
 *    real page behind it instead of faking it with blur.
 *
 * 2. Kyant0/AndroidLiquidGlass (Apache-2.0, © Kyant)
 *    https://github.com/Kyant0/AndroidLiquidGlass
 *    Its material vocabulary — `refractionHeight` (how wide the bending rim
 *    is), `refractionAmount` (how hard it bends) and corner-weighted
 *    dispersion, which is what keeps the chromatic fringe in the corners
 *    where a real lens puts it.
 *
 * 3. rdev/liquid-glass-react (MIT, © 2025 Max Rovensky)
 *    https://github.com/rdev/liquid-glass-react
 *    The two masked gradient bezels (screen + overlay) and the radial press
 *    highlight — see Bezel in components/Glass.tsx.
 */

type MapOptions = {
  width: number;
  height: number;
  radius: number;
  /** Width of the refracting rim in px (Kyant0: refractionHeight). */
  refractionHeight: number;
};

type FilterOptions = MapOptions & {
  /** How hard the rim bends the backdrop (Kyant0: refractionAmount). */
  refractionAmount?: number;
  /** Chromatic dispersion, strongest at the corners. */
  dispersion?: number;
};

const displacementMap = ({ width, height, radius, refractionHeight: d }: MapOptions) =>
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
    <rect x="${d}" y="${d}" height="${height - 2 * d}" width="${width - 2 * d}" fill="#808080" rx="${radius}" ry="${radius}" filter="blur(${d}px)" />
  </g>
</svg>`);

export const displacementFilter = ({
  width,
  height,
  radius,
  refractionHeight,
  refractionAmount = 46,
  dispersion = 0,
}: FilterOptions) => {
  const map = displacementMap({ width, height, radius, refractionHeight });
  const channel = (scale: number, matrix: string, result: string) => `
    <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${scale}" xChannelSelector="R" yChannelSelector="G" />
    <feColorMatrix type="matrix" values="${matrix}" result="${result}" />`;

  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="displace" color-interpolation-filters="sRGB">
      <feImage x="0" y="0" height="${height}" width="${width}" href="${map}" result="displacementMap" />
      ${channel(refractionAmount + dispersion * 2, "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0", "dR")}
      ${channel(refractionAmount + dispersion, "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0", "dG")}
      ${channel(refractionAmount, "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0", "dB")}
      <feBlend in="dR" in2="dG" mode="screen" />
      <feBlend in2="dB" mode="screen" />
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
  return (
    el.style.backdropFilter === "url(#x)" ||
    (el.style as CSSStyleDeclaration & { webkitBackdropFilter?: string })
      .webkitBackdropFilter === "url(#x)"
  );
};
