import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { getImageURI } from "../utils/helper";

// ─── API base ─────────────────────────────────────────────────────────────────
const FOLLOW_BASE = import.meta.env.VITE_BACKEND_URL + "/api/follow";

const normaliseRole = (role) => {
  const map = {
    "Sales Person": "sales_partner",
    "Territory Person": "territory_partner",
    "Project Person": "project_partner",
    sales: "sales_partner",
    territory: "territory_partner",
    project: "project_partner",
    sales_partner: "sales_partner",
    territory_partner: "territory_partner",
    project_partner: "project_partner",
    "Sales Partner": "sales_partner",
    "Territory Partner": "territory_partner",
    "Project Partner": "project_partner",
  };
  return map[role] || map[role?.toLowerCase?.()] || null;
};

const fApi = async (path, opts = {}) => {
  const res = await fetch(`${FOLLOW_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Request failed");
  return data;
};

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_CFG = {
  sales_partner: {
    label: "Sales Partner",
    color: "#e11d48",
    bg: "#fff1f2",
    dot: "#f43f5e",
  },
  territory_partner: {
    label: "Territory Partner",
    color: "#0369a1",
    bg: "#e0f2fe",
    dot: "#0ea5e9",
  },
  project_partner: {
    label: "Project Partner",
    color: "#6d28d9",
    bg: "#ede9fe",
    dot: "#7c3aed",
  },
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const ICONS = {
  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  x: "M18 6L6 18M6 6l12 12",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  userPlus:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6",
  userMinus:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 11h-6",
  check: "M20 6L9 17l-5-5",
  location:
    "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  briefcase:
    "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  loader:
    "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83",
  refresh:
    "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15",
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20",
};

function Icon({ name, size = 18, className = "", sw = 1.8 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={ICONS[name] || ICONS.users} />
    </svg>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ src, name = "", size = 48 }) {
  const [imgErr, setImgErr] = useState(false);
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const colors = [
    "#7c3aed",
    "#0369a1",
    "#e11d48",
    "#0891b2",
    "#b45309",
    "#047857",
  ];
  const colorIdx = name.charCodeAt(0) % colors.length;

  if (src && !imgErr) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImgErr(true)}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size, minWidth: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 font-bold text-white select-none"
      style={{
        width: size,
        height: size,
        minWidth: size,
        background: `linear-gradient(135deg, ${colors[colorIdx]}, ${colors[(colorIdx + 2) % colors.length]})`,
        fontSize: size * 0.36,
      }}
    >
      {initials || "?"}
    </div>
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }) {
  const cfg = ROLE_CFG[role] || {
    label: role,
    color: "#6b7280",
    bg: "#f3f4f6",
  };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block"
        style={{ background: cfg.dot || cfg.color }}
      />
      {cfg.label}
    </span>
  );
}

// ─── Person Card ──────────────────────────────────────────────────────────────
function PersonCard({
  person,
  actorId,
  actorRole,
  onFollowChange,
  animate,
  idx,
}) {
  const [following, setFollowing] = useState(!!person.is_following);
  const [pending, setPending] = useState(false);
  const [justFollowed, setJustFollowed] = useState(false);

  const isMe =
    person.id === actorId &&
    normaliseRole(person.role) === normaliseRole(actorRole);

  const handleToggle = async () => {
    if (pending || isMe) return;
    setPending(true);
    const wasFollowing = following;
    setFollowing(!wasFollowing);
    if (!wasFollowing) setJustFollowed(true);
    try {
      await fApi("/toggle", {
        method: "POST",
        body: JSON.stringify({
          user_id: actorId,
          user_role: actorRole,
          target_id: person.id,
          target_role: person.role,
        }),
      });
      onFollowChange?.();
    } catch {
      setFollowing(wasFollowing);
      if (!wasFollowing) setJustFollowed(false);
    } finally {
      setPending(false);
      if (!wasFollowing) setTimeout(() => setJustFollowed(false), 2000);
    }
  };

  const imgSrc = person.userimage ? getImageURI(person.userimage) : null;
  const displayName = person.fullname || person.username || "Unknown";

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3.5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
      style={{
        animation: animate ? `slideUp 0.4s ease forwards` : "none",
        animationDelay: `${idx * 0.05}s`,
        opacity: animate ? 0 : 1,
      }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar src={imgSrc} name={displayName} size={52} />
        {/* Online dot (decorative) */}
        <span
          className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white"
          style={{ background: following ? "#22c55e" : "#d1d5db" }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[14px] font-bold text-gray-900 truncate leading-tight">
            {displayName}
          </p>
          {isMe && (
            <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded-md">
              YOU
            </span>
          )}
        </div>

        <div className="mt-0.5 mb-1.5">
          <RoleBadge role={person.role} />
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {person.location && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Icon
                name="location"
                size={10}
                className="text-gray-400"
                sw={2}
              />
              {person.location}
            </span>
          )}
          {person.companyName && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Icon
                name="briefcase"
                size={10}
                className="text-gray-400"
                sw={2}
              />
              {person.companyName}
            </span>
          )}
          {person.displayRole && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Icon name="globe" size={10} className="text-gray-400" sw={2} />
              {person.displayRole}
            </span>
          )}
        </div>
      </div>

      {/* Follow button */}
      {!isMe && (
        <button
          onClick={handleToggle}
          disabled={pending}
          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all duration-200 active:scale-95 border
            ${
              pending
                ? "opacity-50 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50"
                : following
                  ? "border-gray-200 text-gray-600 bg-white hover:border-red-200 hover:text-red-500 hover:bg-red-50"
                  : "border-violet-600 text-white bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-200"
            }`}
        >
          {pending ? (
            <Icon name="loader" size={13} className="animate-spin" />
          ) : justFollowed && following ? (
            <>
              <Icon name="check" size={13} sw={2.5} /> Following
            </>
          ) : following ? (
            <>
              <Icon name="userMinus" size={13} /> Following
            </>
          ) : (
            <>
              <Icon name="userPlus" size={13} /> Connect
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3.5 animate-pulse">
      <div className="w-[52px] h-[52px] rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded-full w-2/5" />
        <div className="h-3 bg-gray-100 rounded-full w-1/4" />
        <div className="h-2.5 bg-gray-100 rounded-full w-3/5" />
      </div>
      <div className="w-20 h-8 bg-gray-200 rounded-xl shrink-0" />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ tab, search }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6">
      <div className="relative">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#ede9fe,#fce7f3)" }}
        >
          <Icon name="users" size={36} className="text-violet-400" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
          <Icon name="search" size={14} className="text-gray-400" />
        </div>
      </div>
      <div>
        <p className="text-base font-bold text-gray-800 mb-1">
          {search
            ? `No results for "${search}"`
            : tab === "followers"
              ? "No followers yet"
              : "Not following anyone yet"}
        </p>
        <p className="text-sm text-gray-400 max-w-xs">
          {search
            ? "Try a different name or keyword"
            : tab === "followers"
              ? "When people follow you, they'll appear here."
              : "Start connecting with people to build your network."}
        </p>
      </div>
    </div>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────
function SearchBar({ value, onChange, onClear, placeholder }) {
  const ref = useRef();
  return (
    <div className="relative w-full md:min-w-[300px]">
      <Icon
        name="search"
        size={15}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 bg-gray-100 hover:bg-gray-50 focus:bg-white border border-transparent focus:border-violet-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name="x" size={15} sw={2.5} />
        </button>
      )}
    </div>
  );
}

// ─── Stats Pill ───────────────────────────────────────────────────────────────
function StatPill({ label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center py-4 transition-all duration-200 relative
        ${active ? "text-violet-700" : "text-gray-500 hover:text-gray-700"}`}
    >
      <span
        className={`text-2xl font-black tabular-nums leading-none transition-all
        ${active ? "text-violet-700" : "text-gray-700"}`}
      >
        {count ?? "—"}
      </span>
      <span
        className={`text-[11px] font-semibold mt-0.5 uppercase tracking-wider
        ${active ? "text-violet-500" : "text-gray-400"}`}
      >
        {label}
      </span>
      {active && (
        <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-violet-600 rounded-full" />
      )}
    </button>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN NETWORK PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function Network() {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const actorId = user?.id;
  const actorRole = role;

  // ── State ─────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState("followers"); // "followers" | "following" | "search"
  const [counts, setCounts] = useState({ followers: null, following: null });
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [localFilter, setLocalFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loaderRef = useRef(null);
  const loadingRef = useRef(false);
  const searchTimer = useRef(null);
  const actorReady = !!actorId && !!actorRole;

  // ── Load counts ───────────────────────────────────────────────────────────
  const loadCounts = useCallback(async () => {
    if (!actorReady) return;
    try {
      const d = await fApi(
        `/counts?user_id=${actorId}&user_role=${encodeURIComponent(actorRole)}`,
      );
      setCounts({ followers: d.followers, following: d.following });
    } catch {}
  }, [actorReady, actorId, actorRole]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  // ── Load followers ────────────────────────────────────────────────────────
  const loadFollowers = useCallback(
    async (p = 1) => {
      if (loadingRef.current || !actorReady) return;
      loadingRef.current = true;
      if (p === 1) setLoading(true);
      try {
        const d = await fApi(
          `/followers?user_id=${actorId}&user_role=${encodeURIComponent(actorRole)}&page=${p}&limit=20`,
        );
        const fresh = d.followers || [];
        setFollowers((prev) => (p === 1 ? fresh : [...prev, ...fresh]));
        setHasMore(fresh.length === 20);
      } catch {
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [actorReady, actorId, actorRole],
  );

  // ── Load following ────────────────────────────────────────────────────────
  const loadFollowing = useCallback(
    async (p = 1) => {
      if (loadingRef.current || !actorReady) return;
      loadingRef.current = true;
      if (p === 1) setLoading(true);
      try {
        const d = await fApi(
          `/following?user_id=${actorId}&user_role=${encodeURIComponent(actorRole)}&page=${p}&limit=20`,
        );
        const fresh = d.following || [];
        setFollowing((prev) => (p === 1 ? fresh : [...prev, ...fresh]));
        setHasMore(fresh.length === 20);
      } catch {
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [actorReady, actorId, actorRole],
  );

  // ── Tab switch ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!actorReady) return;
    setPage(1);
    setHasMore(true);
    setLocalFilter("");
    if (tab === "followers") {
      setFollowers([]);
      loadFollowers(1);
    } else if (tab === "following") {
      setFollowing([]);
      loadFollowing(1);
    } else {
      setSearchResults([]);
      setSearchQuery("");
    }
  }, [tab, actorReady]);

  // ── Infinite scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    if (tab === "search") return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingRef.current) {
          const next = page + 1;
          setPage(next);
          if (tab === "followers") loadFollowers(next);
          else loadFollowing(next);
        }
      },
      { threshold: 0.2 },
    );
    const el = loaderRef.current;
    if (el) obs.observe(el);
    return () => {
      if (el) obs.unobserve(el);
    };
  }, [hasMore, page, tab, loadFollowers, loadFollowing]);

  // ── Search (debounced) ────────────────────────────────────────────────────
  const runSearch = useCallback(
    async (q) => {
      if (!q.trim() || !actorReady) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      try {
        const d = await fApi(
          `/search?q=${encodeURIComponent(q)}&user_id=${actorId}&user_role=${encodeURIComponent(actorRole)}&limit=30`,
        );
        setSearchResults(d.users || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [actorReady, actorId, actorRole],
  );

  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (tab !== "search") return;
    searchTimer.current = setTimeout(() => runSearch(searchQuery), 400);
    return () => clearTimeout(searchTimer.current);
  }, [searchQuery, tab, runSearch]);

  // ── Pull to refresh ───────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await loadCounts();
    if (tab === "followers") {
      setFollowers([]);
      await loadFollowers(1);
    } else if (tab === "following") {
      setFollowing([]);
      await loadFollowing(1);
    }
    setRefreshing(false);
  };

  // ── Filtered local list ───────────────────────────────────────────────────
  const filteredList = (() => {
    const list = tab === "followers" ? followers : following;
    if (!localFilter.trim()) return list;
    const lc = localFilter.toLowerCase();
    return list.filter(
      (p) =>
        (p.fullname || "").toLowerCase().includes(lc) ||
        (p.username || "").toLowerCase().includes(lc) ||
        (p.companyName || "").toLowerCase().includes(lc) ||
        (p.location || "").toLowerCase().includes(lc),
    );
  })();

  const currentList = tab === "search" ? searchResults : filteredList;
  const isSearchMode = tab === "search";

  const onFollowChange = () => {
    loadCounts();
    // Re-fetch active list
    if (tab === "followers") {
      setPage(1);
      setFollowers([]);
      loadFollowers(1);
    } else if (tab === "following") {
      setPage(1);
      setFollowing([]);
      loadFollowing(1);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ── TOP BAR ────────────────────────────────────────────────────────── */}
      <div className="w-full sticky top-0 z-30 bg-white border-b">
        <div className="w-full flex flex-col items-center px-4">
          {/* Title row */}
          <div className="w-full flex pt-4 md:pt-4 gap-4 flex-col md:flex-row">
            <div className="w-full flex items-center justify-center gap-3 h-14">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors shrink-0"
              >
                <Icon name="arrowLeft" size={20} sw={2.2} />
              </button>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">
                  My Network
                </h1>
                {actorReady && (
                  <p className="text-[11px] text-gray-400 font-medium mt-1 truncate">
                    {user?.fullname || user?.username || "Your connections"}
                  </p>
                )}
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-900 hover:bg-gray-100 transition-colors shrink-0"
              >
                <Icon
                  name="refresh"
                  size={17}
                  className={refreshing ? "animate-spin text-violet-500" : ""}
                  sw={2}
                />
              </button>
            </div>

            {/* Search bar */}
            <div className="flex items-center justify-center">
              <SearchBar
                value={isSearchMode ? searchQuery : localFilter}
                onChange={(v) => {
                  if (isSearchMode) setSearchQuery(v);
                  else setLocalFilter(v);
                }}
                onClear={() => {
                  if (isSearchMode) setSearchQuery("");
                  else setLocalFilter("");
                }}
                placeholder={
                  isSearchMode
                    ? "Search all partners by name…"
                    : `Filter ${tab}…`
                }
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="w-full flex flex-col">
            <div className="flex mt-4 md:border-t -mx-4 px-4">
            <StatPill
              label="Followers"
              count={counts.followers}
              active={tab === "followers"}
              onClick={() => setTab("followers")}
            />
            <div className="w-px bg-gray-200 self-stretch my-2" />
            <StatPill
              label="Following"
              count={counts.following}
              active={tab === "following"}
              onClick={() => setTab("following")}
            />
            <div className="w-px bg-gray-200 self-stretch my-2" />
            <button
              onClick={() => setTab("search")}
              className={`flex-1 flex flex-col items-center py-4 transition-all duration-200 relative
                ${tab === "search" ? "text-violet-700" : "text-gray-500 hover:text-gray-700"}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all
                ${tab === "search" ? "bg-violet-100" : "bg-gray-100"}`}
              >
                <Icon
                  name="search"
                  size={16}
                  className={
                    tab === "search" ? "text-violet-600" : "text-gray-500"
                  }
                />
              </div>
              <span
                className={`text-[11px] font-semibold mt-0.5 uppercase tracking-wider
                ${tab === "search" ? "text-violet-500" : "text-gray-400"}`}
              >
                Discover
              </span>
              {tab === "search" && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-violet-600 rounded-full" />
              )}
            </button>
          </div>
        </div>
          </div>
      </div>

      {/* ── BODY ───────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Search tab — discover label */}
        {isSearchMode && !searchQuery && (
          <div className="mb-4 px-1">
            <p className="text-[13px] text-gray-500 font-medium">
              🔍 Search across all sales, territory, and project partners
            </p>
          </div>
        )}

        {/* Search loading */}
        {isSearchMode && searchLoading && (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Main loading */}
        {!isSearchMode && loading && (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* List */}
        {!(loading && !isSearchMode) && !(searchLoading && isSearchMode) && (
          <>
            {/* Filter result note */}
            {!isSearchMode && localFilter && (
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[12px] text-gray-500 font-medium">
                  {filteredList.length} result
                  {filteredList.length !== 1 ? "s" : ""} for "{localFilter}"
                </p>
                <button
                  onClick={() => setLocalFilter("")}
                  className="text-[12px] text-violet-600 font-bold hover:text-violet-800"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Cards */}
            {currentList.length > 0 ? (
              <div className="space-y-3">
                {currentList.map((person, idx) => (
                  <PersonCard
                    key={`${person.id}_${person.role}`}
                    person={person}
                    actorId={actorId}
                    actorRole={actorRole}
                    onFollowChange={onFollowChange}
                    animate={idx < 10}
                    idx={idx}
                  />
                ))}
              </div>
            ) : (
              !loading &&
              !searchLoading && (
                <EmptyState
                  tab={tab}
                  search={isSearchMode ? searchQuery : localFilter}
                />
              )
            )}

            {/* Infinite scroll sentinel */}
            {!isSearchMode && (
              <div ref={loaderRef} className="py-6 flex justify-center">
                {!loading && hasMore && currentList.length > 0 && (
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-violet-300 animate-bounce"
                        style={{ animationDelay: `${i * 0.12}s` }}
                      />
                    ))}
                  </div>
                )}
                {!hasMore && currentList.length > 0 && (
                  <p className="text-[12px] text-gray-400 font-medium">
                    All caught up ✓
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── BOTTOM NAV HINT (mobile) ────────────────────────────────────────── */}
      <div className="h-6" />
    </div>
  );
}
