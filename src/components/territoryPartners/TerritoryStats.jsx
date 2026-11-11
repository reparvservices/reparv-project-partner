import { TrendingUp, MapPin, Users, Clock } from "lucide-react";

/* ── Fallback static data (shown until API data loads) ── */
const FALLBACK_STATS = [
  { label: "Total Territory Partners", value: "—", sub: "+8% vs last month",  subColor: "text-emerald-500" },
  { label: "Active Territories",       value: "—", sub: "+3 new zones",        subColor: "text-emerald-500" },
  { label: "Covered Cities",           value: "—", sub: "Across states",       subColor: "text-gray-400"   },
  { label: "Leads Assigned",           value: "—", sub: "+15% growth",         subColor: "text-emerald-500" },
  { label: "Pending Followups",        value: "—", sub: "Requires action",     subColor: "text-amber-500"  },
];

function StatCard({ s }) {
  return (
    <div className="bg-white rounded-[12px] border border-gray-100 px-5 py-5 shadow-sm hover:shadow-md transition-shadow shrink-0">
      <p className="text-[12.5px] text-gray-400 font-medium mb-3 whitespace-nowrap">{s.label}</p>
      <p className="text-[28px] font-extrabold text-gray-900 leading-none tracking-tight mb-3">{s.value ?? "—"}</p>
      <p className={`text-[12.5px] font-semibold flex items-center gap-1.5 ${s.subColor || "text-gray-400"}`}>
        {s.icon && <s.icon size={13} />}
      </p>
    </div>
  );
}

/**
 * TerritoryStats
 * Props: stats — live array from parent (falls back to placeholder)
 */
export default function TerritoryStats({ stats }) {
  const data = stats ?? FALLBACK_STATS;
  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="flex md:hidden gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
        {data.map((s, i) => (
          <div key={i} className="snap-start w-[52vw] min-w-[175px] max-w-[210px]">
            <StatCard s={s} />
          </div>
        ))}
      </div>
      {/* Desktop: grid */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        {data.map((s, i) => <StatCard key={i} s={s} />)}
      </div>
    </>
  );
}