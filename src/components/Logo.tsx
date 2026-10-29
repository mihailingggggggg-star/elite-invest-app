import { ESMAR_LOGO_PATH } from "../assets/esmar-logo";

/**
 * Логотип ESMAR. Контур один: эмблема — это тот же путь, обрезанный
 * viewBox-ом 0 0 149 149, а полный логотип — 0 0 586 149 (как в шапке
 * esmar.kg). Цвет наследуется от `currentColor`, поэтому знак работает
 * и на тёмной, и на светлой теме.
 */
export function LogoEsmar({ width = 92 }: { width?: number }) {
  return (
    <svg
      width={width}
      height={(width * 149) / 586}
      viewBox="0 0 586 149"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ESMAR"
    >
      <path d={ESMAR_LOGO_PATH} fill="currentColor" />
    </svg>
  );
}

/** Только эмблема — для сплэша, пуш-подтверждения и печати ЭЦП. */
export function MarkEsmar({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 149 149"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d={ESMAR_LOGO_PATH} fill="currentColor" />
    </svg>
  );
}
