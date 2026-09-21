type P = { className?: string; size?: number };
const s = (n = 22) => ({ width: n, height: n, viewBox: "0 0 24 24", fill: "none" as const });

export const IcHome = ({ size }: P) => (
  <svg {...s(size)} aria-hidden>
    <path d="M4 10.2 12 4l8 6.2V19a1 1 0 0 1-1 1h-4v-5.4H9V20H5a1 1 0 0 1-1-1v-8.8Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

export const IcMarket = ({ size }: P) => (
  <svg {...s(size)} aria-hidden>
    <path d="M4 17.5 9 11l3.4 3.2L20 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.4 6H20v4.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IcStats = ({ size }: P) => (
  <svg {...s(size)} aria-hidden>
    <path d="M12 3a9 9 0 1 0 9 9h-9V3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M14.5 2.6A9 9 0 0 1 21.4 9.5H14.5V2.6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

export const IcUser = ({ size }: P) => (
  <svg {...s(size)} aria-hidden>
    <circle cx="12" cy="8.2" r="3.6" stroke="currentColor" strokeWidth="1.8" />
    <path d="M4.8 20c.6-3.6 3.6-5.6 7.2-5.6s6.6 2 7.2 5.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export const IcPlus = ({ size }: P) => (
  <svg {...s(size)} aria-hidden>
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

export const IcBack = ({ size }: P) => (
  <svg {...s(size)} aria-hidden>
    <path d="M14.5 5.5 8 12l6.5 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IcArrow = ({ size }: P) => (
  <svg {...s(size ?? 16)} aria-hidden>
    <path d="M5 12h13M13 6.5l5.5 5.5-5.5 5.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IcSearch = ({ size }: P) => (
  <svg {...s(size ?? 18)} aria-hidden>
    <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.9" />
    <path d="m15.2 15.2 3.3 3.3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

export const IcClock = ({ size }: P) => (
  <svg {...s(size ?? 18)} aria-hidden>
    <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 7.4V12l3 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IcPie = ({ size }: P) => (
  <svg {...s(size ?? 18)} aria-hidden>
    <path d="M12 4a8 8 0 1 0 8 8h-8V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

export const IcDoc = ({ size }: P) => (
  <svg {...s(size ?? 18)} aria-hidden>
    <path d="M6 3.6h7L18 8.6V20a.8.8 0 0 1-.8.8H6a.8.8 0 0 1-.8-.8V4.4a.8.8 0 0 1 .8-.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M12.8 3.8v5h5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);

export const IcShield = ({ size }: P) => (
  <svg {...s(size ?? 18)} aria-hidden>
    <path d="M12 3.4 19 6v5.4c0 4-2.9 7.3-7 8.6-4.1-1.3-7-4.6-7-8.6V6l7-2.6Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="m9 12 2.2 2.2L15.4 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IcChat = ({ size }: P) => (
  <svg {...s(size ?? 18)} aria-hidden>
    <path d="M20 12c0 3.9-3.6 7-8 7-1 0-2-.2-2.9-.5L4 20l1.6-3.7A6.6 6.6 0 0 1 4 12c0-3.9 3.6-7 8-7s8 3.1 8 7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
  </svg>
);

export const IcOut = ({ size }: P) => (
  <svg {...s(size ?? 15)} aria-hidden>
    <path d="M10 5.5h8.5V14M18 6 9.5 14.5M13 19H5V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IcCheck = ({ size }: P) => (
  <svg {...s(size ?? 18)} aria-hidden>
    <path d="m5.5 12.4 4.2 4.2 8.8-9.2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IcSun = ({ size }: P) => (
  <svg {...s(size ?? 15)} aria-hidden>
    <circle cx="12" cy="12" r="4.4" stroke="currentColor" strokeWidth="1.9" />
    <path d="M12 2.2v2.1M12 19.7v2.1M21.8 12h-2.1M4.3 12H2.2M18.9 5.1l-1.5 1.5M6.6 17.4l-1.5 1.5M18.9 18.9l-1.5-1.5M6.6 6.6 5.1 5.1" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
  </svg>
);

export const IcMoon = ({ size }: P) => (
  <svg {...s(size ?? 15)} aria-hidden>
    <path d="M20 14.5A8.6 8.6 0 0 1 9.5 4 8.6 8.6 0 1 0 20 14.5Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
  </svg>
);
