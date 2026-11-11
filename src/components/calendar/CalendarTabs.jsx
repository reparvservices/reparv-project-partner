import { NAV_TABS } from "./calendarData.js";

/**
 * CalendarTabs
 * Props:
 *   activeTab   : string
 *   onTabChange : fn(tab)
 */
export default function CalendarTabs({ activeTab, onTabChange }) {
  return (
    <div className="px-7 flex items-center gap-1 border-b">
      {NAV_TABS.map(tab => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            onClick={() => onTabChange?.(tab)}
            className={`px-4 py-3.5 text-[15px] cursor-pointer transition-colors border-b-2
              ${isActive
                ? "font-semibold text-violet-500 border-violet-500"
                : "font-normal text-gray-500 border-transparent hover:text-gray-300"
              }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}