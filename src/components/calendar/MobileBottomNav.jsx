import { PlusIcon } from "./CalendarIcons";

const HomeIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const GridIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const CalIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const UserIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const NAV_ITEMS = [
  { label: "Feed",      icon: <HomeIcon />, key: "feed" },
  { label: "Dashboard", icon: <GridIcon />, key: "dashboard" },
  { label: "Calendar",  icon: <CalIcon />,  key: "calendar" },
  { label: "Profile",   icon: <UserIcon />, key: "profile" },
];

/**
 * MobileBottomNav
 * Fixed bottom nav bar with center FAB.
 * Props:
 *   active   : string  — active nav key
 *   onChange : fn(key)
 *   onFAB    : fn()
 */
export default function MobileBottomNav({ active = "calendar", onChange, onFAB }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* FAB sits above bar */}
      <div className="relative flex justify-center -mb-0">
        <button
          onClick={onFAB}
          className="absolute -top-6 w-14 h-14 rounded-full bg-violet-600 hover:bg-violet-700 active:scale-90 flex items-center justify-center text-white shadow-xl shadow-violet-400/50 transition-all cursor-pointer z-10 border-4 border-white"
        >
          <PlusIcon size={22} />
        </button>
      </div>

      {/* Nav bar */}
      <div className="bg-white border-t border-gray-100 px-2 pt-3 pb-5 flex items-end justify-around">
        {NAV_ITEMS.map((item, i) => {
          const isActive = item.key === active;
          // Leave center gap for FAB
          const isCenterLeft  = i === 1;
          const isCenterRight = i === 2;

          return (
            <button
              key={item.key}
              onClick={() => onChange?.(item.key)}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors min-w-[56px]
                ${isCenterLeft  ? "mr-6" : ""}
                ${isCenterRight ? "ml-6" : ""}
                ${isActive ? "text-violet-600" : "text-gray-400 hover:text-gray-600"}
              `}
            >
              {item.icon}
              <span className={`text-[11px] font-medium ${isActive ? "text-violet-600" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}