import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { displacementFilter, supportsGlass } from "../lib/liquidGlass";

/**
 * A liquid-glass surface. Measures itself, builds the matching displacement
 * filter and refracts whatever is behind it. Browsers without
 * `backdrop-filter: url()` (Safari) keep a plain blur, which still reads as
 * glass — just without the rim distortion.
 */
export function Glass({
  children,
  radius = 26,
  depth = 8,
  strength = 46,
  chromaticAberration = 3,
  blur = 12,
  className = "",
  style,
  as: Tag = "div",
  ...rest
}: {
  children?: ReactNode;
  radius?: number;
  depth?: number;
  strength?: number;
  chromaticAberration?: number;
  blur?: number;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "header" | "button" | "span" | "nav";
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
          depth,
          strength,
          chromaticAberration,
        })}") blur(${blur / 10}px) saturate(1.5) brightness(1.06)`
      : `blur(${blur}px) saturate(1.7)`;

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
      {children}
    </Tag>
  );
}
