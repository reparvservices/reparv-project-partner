import { Crown } from "lucide-react";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 100%)";

const countStyle = {
  white:  "bg-white/20 text-white",
  dark:   "bg-slate-100 text-slate-600",
  blue:   "bg-blue-50 text-blue-600",
  green:  "bg-green-50 text-green-600",
  red:    "bg-red-50 text-red-500",
  purple: "bg-violet-50 text-violet-600",
};

export default function CustomersTabs({ tabs, active, onChange }) {
  return (
    <div
      className="flex items-center gap-1.5 overflow-x-auto py-3"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              isActive
                ? "text-white shadow-sm"
                : "bg-transparent border text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
            style={isActive ? { background: GRADIENT } : {}}
          >
            {tab.label}
            {tab.count !== null ? (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center ${
                isActive ? "bg-white/25 text-white" : countStyle[tab.countColor] || countStyle.dark
              }`}>
                {tab.count}
              </span>
            ) : (
              <Crown size={12} className={isActive ? "text-white" : "text-violet-500"} />
            )}
          </button>
        );
      })}
    </div>
  );
}