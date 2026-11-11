// components/feed/RightSidebar.jsx
import { useState, useEffect } from "react";
import {
  api,
  followApi,
  normaliseRole,
  parseMedia,
  isVideo,
  timeAgo,
} from "./FeedUtils";
import { Icon, Avatar, SidebarSkeleton } from "./FeedPrimitives";
import { getImageURI } from "../../utils/helper";
import { Link, useNavigate } from "react-router-dom";

// ── Card shell ────────────────────────────────────────────────────────────────
function SideCard({ title, children, action, icon }) {
  const navigate = useNavigate();
  const goToPage = (action) => {
    if (title === "Trending Posts") {
      navigate("/app/community");
    } else {
      navigate("/app/network");
    }
  };
  return (
    <div
      onClick={goToPage}
      className="bg-white rounded-lg border overflow-hidden cursor-pointer"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        </div>
        {action && (
          <button className="text-[12px] font-bold text-violet-600 hover:text-violet-800 transition-colors">
            {action}
          </button>
        )}
      </div>
      <div className="px-4 pb-4 space-y-3.5">{children}</div>
    </div>
  );
}

// ── Network stats ─────────────────────────────────────────────────────────────
function MyNetworkStats({ actor }) {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    followApi(
      `/counts?user_id=${actor.user_id}&user_role=${encodeURIComponent(actor.user_role)}`,
    )
      .then((d) =>
        setCounts({ followers: d.followers, following: d.following }),
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex gap-3 animate-pulse">
        <div className="flex-1 h-14 bg-gray-100 rounded-xl" />
        <div className="flex-1 h-14 bg-gray-100 rounded-xl" />
      </div>
    );
  if (!counts) return null;

  return (
    <div className="flex gap-3">
      {[
        {
          label: "Followers",
          value: counts.followers,
          color: "text-violet-600",
        },
        { label: "Following", value: counts.following, color: "text-blue-600" },
      ].map(({ label, value, color }) => (
        <Link
          to="/app/network"
          key={label}
          className="flex-1 bg-gray-50 rounded-xl px-3 py-3 text-center hover:bg-violet-50/50 transition-colors cursor-pointer"
        >
          <p className={`text-lg font-black ${color} leading-tight`}>
            {value ?? "—"}
          </p>
          <p className="text-[11px] text-gray-400 font-semibold mt-0.5">
            {label}
          </p>
        </Link>
      ))}
    </div>
  );
}

// ── Trending posts ────────────────────────────────────────────────────────────
function TrendingPosts({ actor }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(
      `/posts?user_id=${actor.user_id}&user_role=${encodeURIComponent(actor.user_role)}&page=1&limit=10`,
    )
      .then((d) => {
        const sorted = (d.posts || [])
          .filter((p) => p.likes_count > 0 || p.comments_count > 0)
          .sort(
            (a, b) =>
              (b.likes_count || 0) +
              (b.comments_count || 0) -
              ((a.likes_count || 0) + (a.comments_count || 0)),
          )
          .slice(0, 3);
        setPosts(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const badge = {
    sales_partner: { label: "HOT", cls: "bg-rose-500" },
    territory_partner: { label: "NEW", cls: "bg-blue-500" },
    project_partner: { label: "TOP", cls: "bg-violet-500" },
  };

  if (loading) return <SidebarSkeleton rows={3} />;
  if (!posts.length)
    return (
      <div className="flex flex-col items-center py-4 gap-2">
        <Icon name="building" size={24} className="text-gray-200" />
        <p className="text-[12px] text-gray-400">No trending posts yet</p>
      </div>
    );

  return (
    <>
      {posts.map((p) => {
        const b = badge[p.author_role];
        const media = parseMedia(p.media_urls);
        const thumb = media[0] || null;
        return (
          <div
            key={p.id}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative shrink-0">
              {thumb && !isVideo(thumb) ? (
                <img
                  src={thumb}
                  alt=""
                  className="w-11 h-11 rounded-xl object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Avatar src={p.author_image} name={p.author_name} size={44} />
                </div>
              )}
              {b && (
                <span
                  className={`absolute -top-1 -right-1 text-[9px] font-black px-1 py-0.5 rounded-md text-white leading-none ${b.cls}`}
                >
                  {b.label}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-800 group-hover:text-violet-700 transition-colors truncate">
                {p.author_name || "Unknown"}
              </p>
              <p className="text-[12px] text-gray-400 truncate">
                {p.content
                  ? p.content.slice(0, 38) + (p.content.length > 38 ? "…" : "")
                  : `${p.likes_count || 0} likes`}
              </p>
            </div>
            <Icon
              name="chevright"
              size={13}
              className="text-gray-300 group-hover:text-violet-400 transition-colors shrink-0"
            />
          </div>
        );
      })}
    </>
  );
}

// ── Suggested users ───────────────────────────────────────────────────────────
function SuggestedUsers({ actor }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState({});
  const [pendingMap, setPendingMap] = useState({});

  useEffect(() => {
    followApi(
      `/search?q=&user_id=${actor.user_id}&user_role=${encodeURIComponent(actor.user_role)}&limit=6`,
    )
      .then((d) => {
        const filtered = (d.users || [])
          .filter(
            (u) =>
              !(
                u.id === actor.user_id &&
                normaliseRole(u.role) === actor.normalisedRole
              ),
          )
          .slice(0, 3);
        setUsers(filtered);
        const map = {};
        filtered.forEach((u) => {
          map[`${u.id}_${u.role}`] = !!u.is_following;
        });
        setFollowingMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFollow = async (u) => {
    const key = `${u.id}_${u.role}`;
    const was = followingMap[key];
    setPendingMap((prev) => ({ ...prev, [key]: true }));
    setFollowingMap((prev) => ({ ...prev, [key]: !was }));
    try {
      await followApi("/toggle", {
        method: "POST",
        body: JSON.stringify({
          user_id: actor.user_id,
          user_role: actor.user_role,
          target_id: u.id,
          target_role: u.role,
        }),
      });
    } catch {
      setFollowingMap((prev) => ({ ...prev, [key]: was }));
    } finally {
      setPendingMap((prev) => ({ ...prev, [key]: false }));
    }
  };

  const roleLabel = {
    sales_partner: "Sales Partner",
    territory_partner: "Territory Partner",
    project_partner: "Project Partner",
  };

  if (loading) return <SidebarSkeleton rows={3} />;
  if (!users.length)
    return (
      <div className="flex flex-col items-center py-4 gap-2">
        <Icon name="users" size={24} className="text-gray-200" />
        <p className="text-[12px] text-gray-400">No suggestions right now</p>
      </div>
    );

  return (
    <>
      {users.map((u) => {
        const key = `${u.id}_${u.role}`;
        const isFollowing = followingMap[key];
        const isPending = pendingMap[key];
        return (
          <div key={key} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                src={u.userimage ? getImageURI(u.userimage) : null}
                name={u.fullname || u.username || "User"}
                size={36}
              />
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-gray-800 truncate">
                  {u.fullname || u.username || "User"}
                </p>
                <p className="text-[12px] text-gray-400 truncate">
                  {roleLabel[u.role] || u.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleFollow(u)}
              disabled={isPending}
              className={`shrink-0 px-3 py-1 rounded-full border text-[12px] font-bold transition-all ${
                isPending
                  ? "opacity-50 cursor-not-allowed border-gray-200 text-gray-400"
                  : isFollowing
                    ? "border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-500 hover:bg-red-50"
                    : "border-violet-200 text-violet-600 hover:bg-violet-50"
              }`}
            >
              {isPending ? "…" : isFollowing ? "Following" : "Connect"}
            </button>
          </div>
        );
      })}
    </>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────
export default function RightSidebar({ actor }) {
  return (
    <div className="space-y-4">
      {/* My Network */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🌐</span>
            <h3 className="text-sm font-bold text-gray-800">My Network</h3>
          </div>
        </div>
        <div className="px-4 pb-4">
          <MyNetworkStats actor={actor} />
        </div>
      </div>

      <SideCard title="Trending Posts" icon="🔥" action="View all">
        <TrendingPosts actor={actor} />
      </SideCard>

      <SideCard title="Suggested For You" icon="✨" action="See more">
        <SuggestedUsers actor={actor} />
      </SideCard>

      {/* Footer */}
      <p className="text-[11px] text-gray-300 text-center px-2 pb-2">
        © {new Date().getFullYear()} Reparv · All rights reserved
      </p>
    </div>
  );
}
