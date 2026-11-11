import { UsersIcon, MapPinIcon, PhoneCallIcon, CheckSquareIcon } from "./CalendarIcons";
import { STAT_CARDS } from "./calendarData";

const ICON_MAP = {
  users: <UsersIcon />,
  map:   <MapPinIcon />,
  phone: <PhoneCallIcon />,
  check: <CheckSquareIcon />,
};

/**
 * StatCard
 */
function StatCard({ label, value, iconBg, iconKey }) {
  return (
    <div className="bg-white border rounded-2xl p-5 flex-1 min-w-0 flex flex-col gap-2.5">
      <span className="text-[13px] font-medium text-violet-700">{label}</span>
      <div className="flex items-center justify-between">
        <span className="text-[32px] font-bold text-gray-900 leading-none">{value}</span>
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          {ICON_MAP[iconKey]}
        </div>
      </div>
    </div>
  );
}

/**
 * CalendarStats
 * Props:
 *   stats : array — optional override
 */
export default function CalendarStats({ stats = STAT_CARDS }) {
  return (
    <div className="px-7 py-5 flex gap-4">
      {stats.map((s, i) => (
        <StatCard key={i} {...s} />
      ))}
    </div>
  );
}