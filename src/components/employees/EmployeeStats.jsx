import { Users, UserCheck, HardHat, IndianRupee, TrendingUp } from "lucide-react";

function StatCard({ s }) {
  return (
    <div className="bg-white rounded-[14px] border border-gray-100 px-5 py-5 shadow-sm hover:shadow-md transition-shadow shrink-0">
      <div className="flex items-start justify-between mb-4">
        <p className="text-[13px] text-gray-400 font-medium">{s.label}</p>
        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${s.iconBg}`}>
          <s.Icon size={18} className={s.iconColor} />
        </div>
      </div>
      <p className="text-[28px] font-extrabold text-gray-900 leading-none tracking-tight mb-2">{s.value}</p>
      <p className={`text-[12.5px] font-semibold flex items-center gap-1.5 ${s.subColor}`}>
        {s.subIcon && <s.subIcon size={13} />}
        {s.sub}
      </p>
    </div>
  );
}

/**
 * EmployeeStats
 * @param {Array} employees - live employee array from parent
 */
export default function EmployeeStats({ employees = [] }) {
  const total = employees.length;
  const active = employees.filter(e => e.status === "Active").length;
  const engineers = employees.filter(e => e.role?.toLowerCase().includes("engineer")).length;
  const salaryTotal = employees.reduce((s, e) => s + parseFloat(e.salary || 0), 0);

  const stats = [
    {
      label: "Total Employees",
      value: String(total),
      sub: "All records",
      subColor: "text-gray-400",
      subIcon: null,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      Icon: Users,
    },
    {
      label: "Active Employees",
      value: String(active),
      sub: "Currently working",
      subColor: "text-emerald-500",
      subIcon: TrendingUp,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      Icon: UserCheck,
    },
    {
      label: "Engineers",
      value: String(engineers),
      sub: "Across all sites",
      subColor: "text-gray-400",
      subIcon: null,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      Icon: HardHat,
    },
    {
      label: "Monthly Salary",
      value: `₹${(salaryTotal / 100000).toFixed(1)}L`,
      sub: "Total payroll",
      subColor: "text-gray-400",
      subIcon: null,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-500",
      Icon: IndianRupee,
    },
  ];

  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="flex md:hidden gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
        {stats.map((s, i) => (
          <div key={i} className="snap-start w-[52vw] min-w-[180px] max-w-[220px] shrink-0">
            <StatCard s={s} />
          </div>
        ))}
      </div>
      {/* Desktop: 4-col grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} s={s} />)}
      </div>
    </>
  );
}