import { useAuth } from "../../store/auth";

/**
 * DashboardFilter
 * Reads/writes dashboardFilter from useAuth store.
 * Props:
 *   counts : { Enquired: number, Booked: number }
 */
export default function DashboardFilter({ counts = {}, properties }) {
  const { dashboardFilter, setDashboardFilter } = useAuth();
  console.log(counts);
  const filters = [
    { label: "Enquired", value: "Enquired",  count: counts.Enquired || 0 },
    { label: "Booked",   value: "Booked",    count: counts.Booked   || 0 },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map(f => {
        const isActive = dashboardFilter === f.value;
        return (
          <button
            key={f.value}
            onClick={() => setDashboardFilter?.(f.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all cursor-pointer
              ${isActive
                ? "bg-violet-600 border-violet-600 text-white"
                : "bg-white border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-600"
              }`}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
              ${isActive ? "bg-violet-500 text-white" : "bg-gray-100 text-gray-500"}`}>
              {f.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}