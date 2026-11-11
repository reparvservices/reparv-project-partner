import { CAL_FILTERS } from "./CalendarGrid"; // same source as desktop

export default function MobileFilterChips({ active = "All", onChange }) {
  return (
    <div className="bg-white px-4 py-3 border-b border-gray-100">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {CAL_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => onChange?.(f)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer
              ${f === active
                ? "bg-violet-600 border-violet-600 text-white"
                : "bg-white border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-500"
              }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}