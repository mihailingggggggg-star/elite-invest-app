import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { displacementFilter, supportsGlass } from "../lib/liquidGlass";

/**
 * The bezel: two gradient rings drawn only on the border, one blended with
 * `screen` and one with `overlay`. Lifted from rdev/liquid-glass-react (MIT) —
 * this pair is what makes an edge read as thick glass rather than a 1px line.
 */
function Bezel({ radius }: { radius: number }) {
  const ring: CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: radius,
    padding: 1.5,
    pointerEvents: "none",
    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  };
  const light =
    "linear-gradient(140deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.14) 32%, rgba(255,255,255,0.42) 68%, rgba(255,255,255,0) 100%)";

  return (
    <>
      <span aria-hidden style={{ ...ring, mixBlendMode: "screen", opacity: 0.22, background: light }} />
      <span aria-hidden style={{ ...ring, mixBlendMode: "overlay", background: light }} />
    </>
  );
}

/**
 * A liquid-glass surface: refracting backdrop + bezel + press highlight.
 * Browsers without `backdrop-filter: url()` keep a plain blur, which still
 * reads as glass — only without the rim distortion.
 */
export function Glass({
  children,
  radius = 24,
  /** Width of the refracting rim, px (Kyant0: refractionHeight). */
  refractionHeight = 8,
  /** How hard the rim bends the backdrop (Kyant0: refractionAmount). */
  refractionAmount = 40,
  dispersion = 2,
  blur = 14,
  saturation = 1.6,
  bezel = true,
  className = "",
  style,
  as: Tag = "div",
  ...rest
}: {
  children?: ReactNode;
  radius?: number;
  refractionHeight?: number;
  refractionAmount?: number;
  dispersion?: number;
  blur?: number;
  saturation?: number;
  bezel?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "header" | "button" | "span" | "nav" | "a";
} & Omit<React.HTMLAttributes<HTMLElement>, "style">) {
  const ref = useRef<HTMLElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [rich, setRich] = useState(false);

  useEffect(() => setRich(supportsGlass()), []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox((b) =>
        Math.abs(b.w - width) < 2 && Math.abs(b.h - height) < 2
          ? b
          : { w: Math.round(width), h: Math.round(height) }
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const filter =
    rich && box.w > 0 && box.h > 0
      ? `url("${displacementFilter({
          width: box.w,
          height: box.h,
          radius,
          refractionHeight,
          refractionAmount,
          dispersion,
        })}") blur(${blur / 12}px) saturate(${saturation})`
      : `blur(${blur}px) saturate(${saturation})`;

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={`glass ${className}`}
      style={{
        borderRadius: radius,
        backdropFilter: filter,
        WebkitBackdropFilter: filter,
        ...style,
      }}
      {...rest}
    >
      {bezel && <Bezel radius={radius} />}
      {children}
    </Tag>
  );
}
