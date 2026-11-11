import { useState, useEffect } from "react";
import { getImageURI } from "../../utils/helper";

// ─────────────────────────────────────────────────────────────
// CONFIG — match your Feed.jsx
// ─────────────────────────────────────────────────────────────
const FOLLOW_API_BASE = "/api/follow";
const ACTOR = { user_id: 1411, user_role: "Sales Person" }; // ← from Redux

const followApi = async (path, opts = {}) => {
  const res = await fetch(`${FOLLOW_API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed");
  return data;
};

const ROLE_LABEL = {
  sales_partner: "Sales Partner",
  territory_partner: "Territory Partner",
  project_partner: "Project Partner",
};

// ─────────────────────────────────────────────────────────────
// SKELETON ROW
// ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3 w-28 bg-gray-200 rounded-full" />
          <div className="h-2.5 w-20 bg-gray-100 rounded-full" />
        </div>
      </div>
      <div className="h-5 w-12 bg-gray-100 rounded-full" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function SuggestedPartners() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [followMap, setFollowMap] = useState({}); // key → bool
  const [pendingMap, setPendingMap] = useState({});

  useEffect(() => {
    followApi(
      `/search?q=&user_id=${ACTOR.user_id}&user_role=${encodeURIComponent(ACTOR.user_role)}&limit=5`,
    )
      .then((d) => {
        const list = (d.users || []).slice(0, 3);
        setUsers(list);

        const map = {};
        list.forEach((u) => {
          map[`${u.id}_${u.role}`] = !!u.is_following;
        });
        setFollowMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFollow = async (u) => {
    const key = `${u.id}_${u.role}`;
    const was = followMap[key];
    setPendingMap((p) => ({ ...p, [key]: true }));
    setFollowMap((p) => ({ ...p, [key]: !was }));
    try {
      await followApi("/toggle", {
        method: "POST",
        body: JSON.stringify({
          user_id: ACTOR.user_id,
          user_role: ACTOR.user_role,
          target_id: u.id,
          target_role: u.role,
        }),
      });
    } catch {
      setFollowMap((p) => ({ ...p, [key]: was }));
    } finally {
      setPendingMap((p) => ({ ...p, [key]: false }));
    }
  };

  return (
    <div className="bg-white p-6 border-b border-gray-100">
      <div className="flex justify-between mb-4">
        <h4 className="font-semibold text-gray-900">Suggested Partners</h4>
        <button className="text-[#5323DC] text-sm hover:underline">See All</button>
      </div>

      {loading ? (
        [0, 1, 2].map((i) => <SkeletonRow key={i} />)
      ) : !users.length ? (
        <p className="text-sm text-gray-400 py-4 text-center">No suggestions right now</p>
      ) : (
        users.map((u) => {
          const key = `${u.id}_${u.role}`;
          const isFollowing = followMap[key];
          const isPending   = pendingMap[key];
          const avatarSrc   = u.userimage
            ? getImageURI(u.userimage)
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullname || "U")}&background=5323DC&color=fff&size=100`;

          return (
            <div key={key} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <img
                  src={avatarSrc}
                  alt={u.fullname}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullname || "U")}&background=5323DC&color=fff&size=100`;
                  }}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {u.fullname || u.username || "User"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {u.displayRole || ROLE_LABEL[u.role] || u.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleFollow(u)}
                disabled={isPending}
                className={`text-sm font-medium active:scale-95 transition-all ${
                  isPending
                    ? "text-gray-300 cursor-not-allowed"
                    : isFollowing
                      ? "text-gray-400 hover:text-red-400"
                      : "text-[#5323DC] hover:underline"
                }`}
              >
                {isPending ? "…" : isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}