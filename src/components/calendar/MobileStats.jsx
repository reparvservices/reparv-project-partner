import { UsersIcon, MapPinIcon, PhoneCallIcon } from "./CalendarIcons";

const MOBILE_STATS = [
  {
    label: "Today's\nMeetings",
    value: "5",
    icon: <UsersIcon />,
    iconBg: "bg-violet-100",
  },
  {
    label: "Site Visits",
    value: "12",
    icon: <MapPinIcon />,
    iconBg: "bg-emerald-100",
  },
  {
    label: "Follow-ups",
    value: "8",
    icon: <PhoneCallIcon />,
    iconBg: "bg-orange-100",
  },
];

export default function MobileStats({ stats = MOBILE_STATS }) {
  return (
    <div className="flex bg-white border-b">
      {stats.map((s, i) => (
        <div
          key={i}
          className="flex-1 flex items-center gap-2 px-3 py-4 relative"
        >
          {/* Icon */}
          <div
            className={`w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center shrink-0`}
          >
            {s.icon}
          </div>

          {/* Value + Label */}
          <div>
            <p className="text-lg font-bold text-gray-900 leading-tight">
              {s.value}
            </p>
            <p className="text-[11px] text-gray-400 leading-snug whitespace-pre-line">
              {s.label}
            </p>
          </div>

          {/* Divider */}
          {i !== stats.length - 1 && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-px bg-gray-200" />
          )}
        </div>
      ))}
    </div>
  );
}