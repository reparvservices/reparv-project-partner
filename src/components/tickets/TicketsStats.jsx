import { Ticket, Circle, Timer, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

/* ── status icon map ── */
const ICONS = {
  total:    { Icon: Ticket,       color: "text-[#5323DC]", bg: "bg-violet-50" },
  open:     { Icon: Circle,       color: "text-[#0068FF]", bg: "bg-blue-50"   },
  progress: { Icon: Timer,        color: "text-[#f59e0b]", bg: "bg-amber-50"  },
  resolved: { Icon: CheckCircle2, color: "text-[#0BB501]", bg: "bg-emerald-50"},
  high:     { Icon: AlertTriangle,color: "text-[#ef4444]", bg: "bg-red-50"    },
  overdue:  { Icon: Clock,        color: "text-[#6b7280]", bg: "bg-gray-100"  },
};

function SubText({ text, type }) {
  if (!text) return null;
  const isPositive = text.startsWith("+") || text.includes("this week") || text.includes("completion") || text.includes("fast");
  const isNegative = text.startsWith("-") || text.includes("attention");
  const isNeutral  = text.includes("now") || text.includes("now") || text === "Unassigned";
  return (
    <p className={`text-[12px] font-medium flex items-center gap-1 mt-1
      ${isNegative ? "text-red-500" : isPositive ? "text-emerald-500" : "text-gray-400"}`}>
      {isPositive && <span>↗</span>}
      {isNegative && <span>↘</span>}
      {text}
    </p>
  );
}

function StatCard({ type, label, value, sub }) {
  const { Icon, color, bg } = ICONS[type] || ICONS.total;
  return (
    <div className="bg-white border border-gray-100 rounded-[14px] px-5 py-5 shadow-sm hover:shadow-md transition-shadow shrink-0 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] text-gray-400 font-medium whitespace-nowrap">{label}</p>
        <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={15} className={color} />
        </div>
      </div>
      <p className="text-[28px] font-extrabold text-gray-900 leading-none tracking-tight">{value ?? "—"}</p>
      
    </div>
  );
}

/**
 * TicketsStats
 * Props: stats — { total, open, inProgress, resolved, highPriority, overdue }
 *                computed live in parent from API data
 */
export default function TicketsStats({ stats = {} }) {
  const cards = [
    { type: "total",    label: "Total Tickets", value: stats.total,       sub: "+12% this week" },
    { type: "open",     label: "Open Tickets",  value: stats.open,        sub: "Active now" },
    { type: "progress", label: "In Progress",   value: stats.inProgress,  sub: "→ Moving fast" },
    { type: "resolved", label: "Resolved",      value: stats.resolved,    sub: "+5% completion" },
    { type: "high",     label: "High Priority", value: stats.highPriority,sub: "-2 from yesterday" },
    { type: "overdue",  label: "Overdue",        value: stats.overdue,     sub: "Requires attention" },
  ];

  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="flex md:hidden gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
        {cards.map((c, i) => (
          <div key={i} className="snap-start w-[52vw] min-w-[165px] max-w-[200px]">
            <StatCard {...c} />
          </div>
        ))}
      </div>
      {/* Desktop: 6-col grid */}
      <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c, i) => <StatCard key={i} {...c} />)}
      </div>
    </>
  );
}