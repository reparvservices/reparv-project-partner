// ── UI / Navigation icons ──────────────────────────────────────────────────

export const SearchIcon = ({ className = "w-4 h-4 md:w-[15px] md:h-[15px]" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

export const FilterIcon = ({ className = "w-4 h-4 md:w-[15px] md:h-[15px]" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const PlusIcon = ({ className = "w-4 h-4 md:w-5 md:h-5", size }) => (
  // `size` prop kept for backward-compat; className takes priority
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    viewBox="0 0 24 24"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const ChevronLeftIcon = ({ className = "w-4 h-4 md:w-[16px] md:h-[16px]" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const ChevronRightIcon = ({ className = "w-4 h-4 md:w-[16px] md:h-[16px]" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const DotsIcon = ({ className = "w-4 h-4 md:w-[16px] md:h-[16px]" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);

// ── Small inline icons (used inside text / labels) ─────────────────────────

export const LocationPinIcon = ({ className = "w-3 h-3 md:w-[12px] md:h-[12px]" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const BuildingIcon = ({ className = "w-3 h-3 md:w-[12px] md:h-[12px]" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
  </svg>
);

export const PhoneSmIcon = ({ className = "w-3 h-3 md:w-[12px] md:h-[12px]" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6.09 6.09l1.62-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

// ── Stat card icons (coloured strokes) ─────────────────────────────────────

export const UsersIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="#7C3AED" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const MapPinIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="#059669" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const PhoneCallIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="#EA580C" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.35 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6.09 6.09l1.62-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    <polyline points="23 7 16 14 13 11" />
  </svg>
);

export const CheckSquareIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="#6366F1" strokeWidth="2.2" viewBox="0 0 24 24">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);