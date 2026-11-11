// components/feed/NotificationsPanel.jsx
import { useState, useEffect } from "react";
import { api, timeAgo } from "./FeedUtils";
import { Icon, Avatar } from "./FeedPrimitives";

const NOTIF_CFG = {
  like:        { icon: "heart-fill", dot: "bg-rose-500"     },
  comment:     { icon: "comment",    dot: "bg-violet-600"   },
  story_reply: { icon: "send",       dot: "bg-blue-500"     },
  follow:      { icon: "users",      dot: "bg-emerald-500"  },
};

export default function NotificationsPanel({ actor, onClose }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/notifications?user_id=${actor.user_id}&user_role=${encodeURIComponent(actor.user_role)}`)
      .then(d => setItems(d.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = items.filter(n => !n.is_read).length;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 cursor-pointer" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-violet-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full bg-violet-300 animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
                ))}
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Icon name="bell" size={32} className="text-gray-200" />
              <span className="text-sm text-gray-400">No notifications yet</span>
            </div>
          ) : (
            <>
              {unreadCount > 0 && (
                <div className="px-5 pt-3 pb-1">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">New</p>
                </div>
              )}
              {items.map(n => {
                const cfg = NOTIF_CFG[n.type] || { icon: "bell", dot: "bg-gray-400" };
                return (
                  <div key={n.id}
                    className={`flex gap-3 px-5 py-3.5 border-b border-gray-50 transition-colors
                      ${!n.is_read ? "bg-violet-50/50" : "hover:bg-gray-50"}`}>
                    <div className="relative shrink-0">
                      <Avatar src={n.actor_image} name={n.actor_name} size={44} />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 ${cfg.dot} rounded-full flex items-center justify-center border-2 border-white`}>
                        <Icon name={cfg.icon} size={9} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-gray-800 leading-snug">
                        <span className="font-bold">{n.actor_name}</span>{" "}{n.message}
                      </p>
                      <span className="text-[11px] text-gray-400 mt-0.5 block">{timeAgo(n.created_at)}</span>
                    </div>
                    {!n.is_read && <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 shrink-0" />}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}