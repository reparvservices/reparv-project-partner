/* StatsCards — original design preserved, accepts live `stats` prop */

function SubText({ sub, subSuffix, subGreen }) {
  if (subGreen === "violet") {
    return <p className="text-[12.5px] font-semibold text-violet-600">{sub}{subSuffix}</p>;
  }
  if (subGreen) {
    return (
      <p className="text-[12.5px] font-semibold text-emerald-500 flex items-center gap-1">
        <span>↗</span><span>{sub}</span>
        {subSuffix && <span className="text-gray-400 font-medium">{subSuffix}</span>}
      </p>
    );
  }
  return <p className="text-[12.5px] font-medium text-gray-400">{sub}{subSuffix}</p>;
}

function StatCard({ s }) {
  return (
    <div className="bg-white rounded-[14px] border border-gray-100 px-5 py-5 shadow-sm hover:shadow-md transition-shadow shrink-0">
      <p className="text-[12.5px] text-gray-400 font-medium mb-3 whitespace-nowrap">{s.label}</p>
      <p className="text-[28px] font-extrabold text-gray-900 leading-none tracking-tight mb-3">
        {s.value ?? "—"}
      </p>
      {/*<SubText sub={s.sub} subSuffix={s.subSuffix} subGreen={s.subGreen} />*/}
    </div>
  );
}

/**
 * StatsCards
 * Props:
 *   stats : array — live data from parent (falls back to placeholder when not provided)
 */
export default function StatsCards({ stats }) {
  const data = stats ?? [
    { label: "Total Partners",   value: "—", sub: "+12%",              subSuffix: " from last month", subGreen: true },
    { label: "Active Partners",  value: "—", sub: "72% engaged",       subSuffix: "",                 subGreen: "violet" },
    { label: "Paid Partners",    value: "—", sub: "+5%",               subSuffix: " conversion",      subGreen: true },
    { label: "Pending Payments", value: "—", sub: "— invoices pending",subSuffix: "",                 subGreen: false },
    { label: "Leads Converted",  value: "—", sub: "+24%",              subSuffix: " vs average",      subGreen: true },
  ];

  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="flex md:hidden gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
        {data.map((s, i) => (
          <div key={i} className="snap-start w-[52vw] min-w-[180px] max-w-[220px]">
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