import { PhoneIncoming, Mail, CheckCircle, UserPlus } from "lucide-react";

export default function LiveActivity() {
  const activity = [
    {
      title: "Incoming Call",
      subtitle: "From Sarah Jenkins • 2m ago",
      icon: PhoneIncoming,
      active: true,
    },
    {
      title: "Email Opened",
      subtitle: "By David Kim • 15m ago",
      icon: Mail,
    },
    {
      title: "Task Completed",
      subtitle: "Quote sent to Priya P. • 1h ago",
      icon: CheckCircle,
    },
    {
      title: "New Lead",
      subtitle: "John Doe via Website • 2h ago",
      icon: UserPlus,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">
        Live Activity
      </h3>

      <div className="space-y-6">
        {activity.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={index} className="flex gap-4 relative">
              
              {/* Timeline Icon */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full border-2 ${
                    item.active
                      ? "border-purple-500 text-purple-600 bg-purple-50"
                      : "border-slate-200 text-slate-400"
                  }`}
                >
                  <Icon size={16} />
                </div>

                {/* Vertical Line */}
                {index !== activity.length - 1 && (
                  <div className="w-[2px] flex-1 bg-slate-200 mt-1"></div>
                )}
              </div>

              {/* Text */}
              <div>
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-500">{item.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}