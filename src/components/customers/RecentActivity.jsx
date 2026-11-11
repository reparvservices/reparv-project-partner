import { Mail } from "lucide-react";

const activities = [
  {
    type: "avatar",
    avatar: "https://i.pravatar.cc/40?img=47",
    text: "Sarah Jenkins viewed the floor plan for Sunnyvale Heights.",
    time: "15 mins ago",
  },
  {
    type: "icon",
    icon: Mail,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    text: "System sent welcome packet to David Okafor.",
    time: "4 hours ago",
  },
  {
    type: "avatar",
    avatar: "https://i.pravatar.cc/40?img=12",
    text: "Rajesh K. scheduled a site visit with Maria Gonzalez.",
    time: "Yesterday",
  },
];

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-[8px] p-5 border shadow-sm">
      <h3 className="text-[15px] font-extrabold text-gray-900 mb-4">Recent Customer Activity</h3>

      <div className="flex flex-col gap-4">
        {activities.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            {a.type === "avatar" ? (
              <img src={a.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5" />
            ) : (
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${a.iconBg}`}>
                <a.icon size={16} className={a.iconColor} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-gray-800 leading-snug">{a.text}</p>
              <p className="text-[11.5px] text-gray-400 mt-1">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}