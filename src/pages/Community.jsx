import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Plus,
  MessageCircle,
  BarChart2,
  MoreHorizontal,
  PlusCircle,
  Heart,
  Bookmark,
  BookmarkCheck,
  Send,
  X,
  ChevronDown,
  Bell,
  Loader2,
  RefreshCw,
  CalendarClock,
} from "lucide-react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getImageURI } from "../utils/helper";
import { Icon, SidebarSkeleton } from "../components/feed/FeedPrimitives";
import { followApi } from "../components/feed/FeedUtils";

// ─────────────────────────────────────────────────────────────
//  CONFIG
//  FIX 1: Use http:// for localhost — browsers silently block
//             https://localhost (mixed-content / certificate error).
//  Change to your production URL when deploying.
// ─────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_BACKEND_URL +"/api/feed";

const GRADIENT = "linear-gradient(110.73deg, #5E23DC 0%, #7C3AED 100%)";

// ─────────────────────────────────────────────────────────────
//  FIX 2: Read actor at CALL TIME, not at module load time.
//  Module-level code runs before React mounts, so localStorage
//  may not have been written yet by your auth logic.
//
//  normaliseRole() on the backend maps:
//    "Project Partner"   → project_partner
//    "Sales Partner"     → sales_partner
//    "Territory Partner" → territory_partner
//  Make sure user_role stored in localStorage matches one of these.
// ─────────────────────────────────────────────────────────────
function getActor() {
  try {
    const entries = [
      { key: "projectPartnerUser", role: "Project Partner" },
      { key: "salesUser", role: "Sales Partner" },
      { key: "territoryUser", role: "Territory Partner" },
    ];
    for (const { key, role } of entries) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const user = JSON.parse(raw);
      if (!user?.id) continue;
      return {
        user_id: user.id,
        // Use whatever role string is stored, fallback to the key-derived one
        user_role: user.role || role,
        fullname: user.fullname || user.username || `User ${user.id}`,
      };
    }
  } catch {
    /* SSR / unavailable */
  }
  return { user_id: null, user_role: null, fullname: "Me" };
}

// Build query-string injecting fresh actor creds every time
function qs(extra = {}) {
  const { user_id, user_role } = getActor();
  return "?" + new URLSearchParams({ user_id, user_role, ...extra }).toString();
}

// ─────────────────────────────────────────────────────────────
//  FIX 3: Better fetch wrapper — surfaces real error reason
// ─────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  console.log(`[apiFetch] ${options.method || "GET"} ${url}`);

  let res;
  try {
    res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (networkErr) {
    // ERR_CONNECTION_REFUSED, CORS preflight block, SSL error, etc.
    console.error("[apiFetch] Network/CORS error:", networkErr.message);
    throw new Error(
      `Cannot reach server. Is backend running on port 3000 with CORS enabled? (${networkErr.message})`,
    );
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned non-JSON (HTTP ${res.status})`);
  }

  if (!res.ok || !data.success) {
    console.error("[apiFetch] API error response:", data);
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data;
}

// ─────────────────────────────────────────────────────────────
//  STATIC DATA
// ─────────────────────────────────────────────────────────────
const TABS = [
  { key: "all", label: "All Discussions" },
  { key: "groups", label: "My Groups" },
  { key: "trending", label: "Trending Topics" },
  { key: "questions", label: "Questions" },
  { key: "events", label: "Events & Meetups" },
];

const MEMBERS = [
  "https://i.pravatar.cc/56?img=1",
  "https://i.pravatar.cc/56?img=7",
  null,
  "https://i.pravatar.cc/56?img=11",
  "https://i.pravatar.cc/56?img=13",
  "https://i.pravatar.cc/56?img=16",
  "https://i.pravatar.cc/56?img=27",
  "https://i.pravatar.cc/56?img=31",
  "https://i.pravatar.cc/56?img=35",
];

const GROUPS = [
  {
    name: "Commercial Real Estate",
    members: "12k Members",
    image:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=60&h=60&fit=crop",
  },
  { name: "PropTech Innovators", members: "8.5k Members", image: null },
  { name: "Luxury Listings", members: "5k Members", image: null },
];

// ─────────────────────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────────────────────
function Spinner({ size = 16 }) {
  return <Loader2 size={size} className="animate-spin" />;
}

function Avatar({ src, name, size = 40 }) {
  const [err, setErr] = useState(false);
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0"
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, background: GRADIENT }}
      className="rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 select-none"
    >
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  CREATE POST MODAL
// ─────────────────────────────────────────────────────────────
function CreatePostModal({ onClose, onCreated }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!content.trim()) return;
    const actor = getActor();
    if (!actor.user_id) {
      setError("You must be logged in to post.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiFetch("/posts", {
        method: "POST",
        body: JSON.stringify({
          user_id: actor.user_id,
          user_role: actor.user_role,
          post_type: "text",
          content: content.trim(),
          visibility: "all",
        }),
      });
      onCreated();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 cursor-pointer" onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-extrabold text-gray-900">
            Create Discussion
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Share insights, ask questions..."
          rows={5}
          className="w-full resize-none border border-gray-200 rounded-xl p-3.5 text-[14px] text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-violet-300"
        />
        {error && (
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-gray-500 hover:text-gray-700 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            className="flex items-center gap-2 px-5 py-2 text-white text-[13.5px] font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ background: GRADIENT }}
          >
            {loading ? <Spinner size={14} /> : <Send size={14} />} Post
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  COMMENTS PANEL
// ─────────────────────────────────────────────────────────────
function CommentsPanel({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch(`/posts/${postId}/comments${qs()}`);
      setComments(data.comments || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function handleSend() {
    if (!text.trim()) return;
    const actor = getActor();
    if (!actor.user_id) {
      setError("Log in to comment.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await apiFetch(`/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({
          user_id: actor.user_id,
          user_role: actor.user_role,
          content: text.trim(),
          partner_name: actor.fullname,
        }),
      });
      setText("");
      loadComments();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  const actor = getActor();

  return (
    <div className="border-t border-gray-100 pt-3 mt-1">
      <div className="flex items-center gap-2 mb-3">
        <Avatar src={null} name={actor.fullname} size={32} />
        <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Write a comment..."
            className="flex-1 text-[13px] outline-none bg-transparent placeholder:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="text-violet-600 disabled:opacity-40 hover:text-violet-700 transition-colors"
          >
            {sending ? <Spinner size={14} /> : <Send size={14} />}
          </button>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-400 bg-red-50 rounded-lg px-3 py-1.5 mb-2">
          {error}
        </p>
      )}
      {loading ? (
        <div className="flex justify-center py-4 text-gray-400">
          <Spinner />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-3">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar
                src={c.author_image}
                name={c.author_name || c.partner_name}
                size={30}
              />
              <div className="flex-1">
                <div className="bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-[12.5px] font-bold text-gray-800">
                    {c.author_name || c.partner_name || "User"}
                  </p>
                  <p className="text-[13px] text-gray-600 mt-0.5">
                    {c.content}
                  </p>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 ml-2">
                  {new Date(c.created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  POST CARD
// ─────────────────────────────────────────────────────────────
function PostCard({ post: initialPost, onRefresh }) {
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setPost(initialPost);
  }, [initialPost]);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  async function handleLike() {
    if (likeLoading) return;
    const actor = getActor();
    setLikeLoading(true);
    setPost((p) => ({
      ...p,
      has_liked: !p.has_liked,
      likes_count: p.has_liked
        ? Math.max(0, (p.likes_count || 1) - 1)
        : (p.likes_count || 0) + 1,
    }));
    try {
      // POST /api/feed/posts/:id/like
      const data = await apiFetch(`/posts/${post.id}/like`, {
        method: "POST",
        body: JSON.stringify({
          user_id: actor.user_id,
          user_role: actor.user_role,
        }),
      });
      setPost((p) => ({ ...p, has_liked: data.liked }));
    } catch (e) {
      console.error("[like]", e.message);
      setPost((p) => ({
        ...p,
        has_liked: !p.has_liked,
        likes_count: p.has_liked
          ? Math.max(0, (p.likes_count || 1) - 1)
          : (p.likes_count || 0) + 1,
      }));
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleSave() {
    if (saveLoading) return;
    const actor = getActor();
    const wasSaved = post.is_saved;
    setSaveLoading(true);
    setPost((p) => ({ ...p, is_saved: !p.is_saved }));
    try {
      if (wasSaved) {
        // ✅ FIX 4: Matches your route → DELETE /api/feed/saved/:id
        await apiFetch(`/saved/${post.id}`, {
          method: "DELETE",
          body: JSON.stringify({
            user_id: actor.user_id,
            user_role: actor.user_role,
          }),
        });
      } else {
        // POST /api/feed/posts/:id/save → toggleSavePost
        await apiFetch(`/posts/${post.id}/save`, {
          method: "POST",
          body: JSON.stringify({
            user_id: actor.user_id,
            user_role: actor.user_role,
          }),
        });
      }
    } catch (e) {
      console.error("[save]", e.message);
      setPost((p) => ({ ...p, is_saved: wasSaved }));
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleDelete() {
    setMenuOpen(false);
    if (!window.confirm("Delete this post?")) return;
    const actor = getActor();
    try {
      await apiFetch(`/posts/${post.id}`, {
        method: "DELETE",
        body: JSON.stringify({
          user_id: actor.user_id,
          user_role: actor.user_role,
        }),
      });
      onRefresh();
    } catch (e) {
      alert(`Delete failed: ${e.message}`);
    }
  }

  const actor = getActor();
  const isOwn = post.author_id === actor.user_id;

  let mediaUrls = [];
  if (post.media_urls) {
    try {
      mediaUrls = JSON.parse(post.media_urls);
    } catch {
      mediaUrls = [post.media_urls];
    }
  }

  const timeStr = post.created_at
    ? new Date(post.created_at).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const badgeMap = {
    sales_partner: {
      label: "Sales Partner",
      color: "bg-blue-100 text-blue-700",
    },
    territory_partner: {
      label: "Territory Partner",
      color: "bg-pink-100 text-pink-700",
    },
    project_partner: {
      label: "Project Partner",
      color: "bg-violet-100 text-violet-700",
    },
  };
  const badge = badgeMap[post.author_role] || {
    label: post.author_role || "Member",
    color: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="bg-white rounded-[8px] border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Avatar
            src={post.author_image}
            name={post.author_name || "Partner"}
            size={40}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-bold text-gray-900">
                {post.author_name || "Partner"}
              </span>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${badge.color}`}
              >
                {badge.label}
              </span>
            </div>
            <p className="text-[12px] text-gray-400 mt-0.5">{timeStr}</p>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors shrink-0"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-20 min-w-[140px]">
              {isOwn && (
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                >
                  Delete post
                </button>
              )}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleSave();
                }}
                className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {post.is_saved ? "Unsave post" : "Save post"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        {post.tag_label && (
          <span
            className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full mb-2"
            style={{ color: post.tag_color, backgroundColor: post.tag_bg }}
          >
            {post.tag_label}
          </span>
        )}
        <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Media */}
      {mediaUrls.length > 0 && (
        <div
          className={`grid gap-2 ${mediaUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
        >
          {mediaUrls.slice(0, 4).map((url, i) => (
            <img
              key={i}
              src={url}
              alt="media"
              className="w-full rounded-[10px] object-cover max-h-[260px]"
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1.5 text-[12.5px] font-medium transition-colors px-2.5 py-1.5 rounded-full ${
              post.has_liked
                ? "text-pink-600 bg-pink-50 hover:bg-pink-100"
                : "text-gray-400 hover:text-pink-500 hover:bg-pink-50"
            }`}
          >
            <Heart size={14} fill={post.has_liked ? "currentColor" : "none"} />
            {post.likes_count || 0}
          </button>
          <button
            onClick={() => setShowComments((s) => !s)}
            className={`flex items-center gap-1.5 text-[12.5px] font-medium transition-colors px-2.5 py-1.5 rounded-full ${
              showComments
                ? "text-violet-600 bg-violet-50"
                : "text-gray-400 hover:text-violet-500 hover:bg-violet-50"
            }`}
          >
            <MessageCircle size={14} />
            {post.comments_count || 0} Replies
          </button>
          {post.views_count != null && (
            <span className="flex items-center gap-1.5 text-[12.5px] text-gray-400 font-medium">
              <BarChart2 size={14} /> {post.views_count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saveLoading}
            title={post.is_saved ? "Unsave" : "Save"}
            className={`p-1.5 rounded-full transition-colors ${
              post.is_saved
                ? "text-violet-600 bg-violet-50 hover:bg-violet-100"
                : "text-gray-400 hover:text-violet-500 hover:bg-violet-50"
            }`}
          >
            {saveLoading ? (
              <Spinner size={15} />
            ) : post.is_saved ? (
              <BookmarkCheck size={15} />
            ) : (
              <Bookmark size={15} />
            )}
          </button>
          <button
            onClick={() => setShowComments((s) => !s)}
            className="text-[13px] font-semibold text-violet-600 bg-violet-50 px-4 py-1.5 rounded-full hover:bg-violet-100 transition-colors whitespace-nowrap"
          >
            Join Discussion
          </button>
        </div>
      </div>

      {showComments && <CommentsPanel postId={post.id} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  NOTIFICATIONS PANEL
// ─────────────────────────────────────────────────────────────
function NotificationsPanel({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch(`/notifications${qs()}`)
      .then((data) => setNotifications(data.notifications || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const typeIcon = {
    like: "❤️",
    comment: "💬",
    story_reply: "↩️",
    follow: "👤",
  };

  return (
    <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 w-[340px] max-h-[420px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-[14px] font-extrabold text-gray-900">
          Notifications
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
        >
          <X size={15} />
        </button>
      </div>
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="flex justify-center py-8 text-gray-400">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-center text-red-400 text-[13px] py-8 px-4">
            {error}
          </p>
        ) : notifications.length === 0 ? (
          <p className="text-center text-gray-400 text-[13px] py-8">
            No notifications yet
          </p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex gap-3 px-4 py-3 border-b border-gray-50 ${!n.is_read ? "bg-violet-50/50" : ""}`}
            >
              <Avatar src={n.actor_image} name={n.actor_name} size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-gray-800">
                  <span className="font-semibold">
                    {n.actor_name || "Someone"}
                  </span>{" "}
                  {n.message}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {new Date(n.created_at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span className="text-[16px] shrink-0">
                {typeIcon[n.type] || "🔔"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  SIDEBAR WIDGETS — UI unchanged
// ─────────────────────────────────────────────────────────────
function ActiveMembers() {
  return (
    <div className="bg-white rounded-[8px] border border-gray-100 shadow-sm p-5">
      <h3 className="text-[15px] font-extrabold text-gray-900 mb-4">
        Active Members
      </h3>
      <div className="grid grid-cols-5 gap-2.5">
        {MEMBERS.map((src, i) =>
          src ? (
            <img
              key={i}
              src={src}
              alt=""
              className="w-full aspect-square rounded-full object-cover ring-2 ring-white"
            />
          ) : (
            <div
              key={i}
              className="w-full aspect-square rounded-full border-2 border-gray-200 bg-gray-50"
            />
          ),
        )}
        <div className="w-full aspect-square rounded-full bg-violet-50 flex items-center justify-center">
          <span className="text-[11.5px] font-bold text-violet-600">+2k</span>
        </div>
      </div>
    </div>
  );
}

function SuggestedGroups() {
  return (
    <div className="bg-white rounded-[8px] border border-gray-100 shadow-sm p-5">
      <h3 className="text-[15px] font-extrabold text-gray-900 mb-4">
        Suggested Groups
      </h3>
      <div className="flex flex-col divide-y divide-gray-50">
        {GROUPS.map((g, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            {g.image ? (
              <img
                src={g.image}
                alt={g.name}
                className="w-11 h-11 rounded-[8px] object-cover shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-[8px] bg-gray-100 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-bold text-gray-900 leading-tight">
                {g.name}
              </p>
              <p className="text-[12px] text-gray-400 mt-0.5">{g.members}</p>
            </div>
            <button className="text-violet-600 hover:text-violet-700 transition-colors shrink-0">
              <PlusCircle size={22} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
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
      `/search?q=&user_id=${actor?.user_id}&user_role=${encodeURIComponent(actor?.user_role)}&limit=6`,
    )
      .then((d) => {
        const filtered = (d.users || [])
          .filter(
            (u) =>
              !(
                u.id === actor?.user_id &&
                normaliseRole(u.role) === actor?.normalisedRole
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

  return (
    <div className="bg-white rounded-[8px] border border-gray-100 shadow-sm p-5">
      <h3 className="text-[15px] font-extrabold text-gray-900 mb-4">
        Suggested Users
      </h3>

      <div className="flex flex-col divide-y divide-gray-50">
        {users?.length > 0 ? (
          users.map((u) => {
            const key = `${u.id}_${u.role}`;
            const isFollowing = followingMap[key];
            const isPending = pendingMap[key];
            return (
              <div
                key={key}
                className="flex items-center justify-between gap-2"
              >
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
          })
        ) : (
          <div className="flex flex-col items-center py-4 gap-2">
            <Icon name="users" size={24} className="text-gray-200" />
            <p className="text-[12px] text-gray-400">
              No suggestions right now
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function UpcomingEvents() {
  const [events, setEvents] = useState([]);

  const URI = import.meta.env.VITE_BACKEND_URL;

  // ── API ─────────────────────────────────────────────────────
  const fetchMeetings = useCallback(async () => {
    try {
      const res = await fetch(`${URI}/project-partner/calender/meetings`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();

      if (!Array.isArray(data)) {
        setEvents([]);
        return;
      }

      //  Filter only upcoming events
      const now = new Date();

      const upcoming = data.filter((item) => {
        const meetingDate = new Date(item.date || item.startDate);
        return meetingDate >= now;
      });

      //  Sort by nearest upcoming
      upcoming.sort(
        (a, b) =>
          new Date(a.date || a.startDate).getTime() -
          new Date(b.date || b.startDate).getTime(),
      );

      //  Map to UI format (same as EVENTS)
      const formatted = upcoming.map((e) => {
        const date = new Date(e.date || e.startDate);

        return {
          day: date.getDate(),
          month: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
          title: e.title || e.name,
          sub: e.description || e.location || "",
        };
      });

      setEvents(formatted);
    } catch (err) {
      console.error("fetchMeetings:", err);
    }
  }, [URI]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // ── UI (UNCHANGED) ───────────────────────────────────────────
  return (
    <div className="bg-white rounded-[8px] border border-gray-100 shadow-sm p-5">
      <h3 className="text-[15px] font-extrabold text-gray-900 mb-4">
        Upcoming Events
      </h3>

      <div className="flex flex-col divide-y divide-gray-50">
        {events.length > 0 ? (
          events?.map((e, i) => (
            <div
              key={i}
              className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0"
            >
              <div className="w-14 h-14 rounded-[12px] bg-violet-50 flex flex-col items-center justify-center shrink-0">
                <span className="text-[18px] font-extrabold text-violet-700 leading-none">
                  {e.day}
                </span>
                <span className="text-[10px] font-bold text-violet-500 tracking-wider mt-0.5">
                  {e.month}
                </span>
              </div>

              <div>
                <p className="text-[13.5px] font-bold text-gray-900 leading-tight">
                  {e.title}
                </p>
                <p className="text-[12px] text-gray-400 mt-1">{e.sub}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center py-4 gap-2">
            <CalendarClock size={24} className="text-gray-200" />
            <p className="text-[12px] text-gray-400">
              No Upcoming Events right now
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function Community() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadError, setLoadError] = useState("");
  const notifsRef = useRef(null);
  const actor = getActor();
  // Debug log — tells you immediately if localStorage isn't set
  useEffect(() => {
    const actor = getActor();
    if (!actor.user_id) {
      console.warn(
        "[Community] ⚠️ No logged-in user found in localStorage.\n" +
          "Expected one of: projectPartnerUser, salesUser, territoryUser\n" +
          "API calls will fail with 400 user_id is required.",
      );
    } else {
      console.log(
        `[Community]  Actor: id=${actor.user_id} role=${actor.user_role}`,
      );
    }
  }, []);

  // Close notifs on outside click
  useEffect(() => {
    if (!showNotifs) return;
    const h = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target))
        setShowNotifs(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showNotifs]);

  // Unread count — load once + poll every 60s
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      apiFetch(`/notifications/unread-count${qs()}`)
        .then((d) => {
          if (!cancelled) setUnreadCount(d.count || 0);
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [refreshKey]);

  // Load posts
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    apiFetch(`/posts${qs({ page, limit: 10 })}`)
      .then((data) => {
        if (cancelled) return;
        const incoming = data.posts || [];
        setPosts((prev) => (page === 1 ? incoming : [...prev, ...incoming]));
        setHasMore(incoming.length === 10);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, refreshKey]);

  function handleRefresh() {
    setPosts([]);
    setPage(1);
    setRefreshKey((k) => k + 1);
  }

  const filtered = search.trim()
    ? posts.filter(
        (p) =>
          p.content?.toLowerCase().includes(search.toLowerCase()) ||
          p.author_name?.toLowerCase().includes(search.toLowerCase()),
      )
    : posts;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 md:px-8 pt-5 pb-0 bg-white md:bg-transparent border-b">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <button
            onClick={() => {
              navigate(-1);
            }}
          >
            <FiArrowLeft className="text-2xl text-gray-900 ml-2" />
          </button>
          <h1 className="text-[22px] font-bold tracking-tight shrink-0">
            Community
          </h1>

          <div className="hidden md:flex flex-wrap items-center gap-4 flex-1 justify-end">
            <div className="flex items-center gap-2 bg-white border rounded-[6px] px-3.5 py-[8px] min-w-[300px] max-w-[420px] flex-1">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search topics, members, or groups..."
                className="outline-none text-[12px] placeholder:text-gray-400 bg-transparent w-full"
              />
            </div>

            <div className="relative" ref={notifsRef}>
              <button
                onClick={() => setShowNotifs((s) => !s)}
                className="relative p-2 rounded-full bg-white border hover:bg-gray-50 transition-colors"
              >
                <Bell size={18} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <NotificationsPanel onClose={() => setShowNotifs(false)} />
              )}
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh feed"
              className="p-2 rounded-full bg-white border hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={`text-gray-600 ${loading ? "animate-spin" : ""}`}
              />
            </button>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-[8px] text-white text-[13.5px] font-bold rounded-[6px] whitespace-nowrap hover:opacity-90 transition-opacity shadow-[0_4px_14px_rgba(94,35,220,0.4)]"
              style={{ background: GRADIENT }}
            >
              <Plus size={15} strokeWidth={2.5} /> Create Discussion
            </button>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="flex md:hidden items-center gap-1.5 px-4 py-2.5 text-white text-[13px] font-bold rounded-[10px] whitespace-nowrap"
            style={{ background: GRADIENT }}
          >
            <Plus size={14} strokeWidth={2.5} /> Create
          </button>
        </div>

        <div className="flex md:hidden items-center gap-2 bg-white border rounded-[8px] px-3.5 py-[10px] mb-4">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics, members, or groups..."
            className="outline-none text-[13px] placeholder:text-gray-400 bg-transparent w-full"
          />
        </div>

        <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-3 text-[13.5px] font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "text-[#6B3CE6]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-violet-500 rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 md:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-5 max-w-[1200px] mx-auto">
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* Error banner with actionable tips */}
            {loadError && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-[13px] text-red-600 flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-semibold mb-0.5">Could not load posts</p>
                  <p className="text-red-500 break-all">{loadError}</p>
                  <ul className="text-red-400 text-[11px] mt-1.5 space-y-0.5 list-disc list-inside">
                    <li>
                      Backend running on <code>http://localhost:3000</code>?
                    </li>
                    <li>
                      CORS allows <code>{window.location.origin}</code>?
                    </li>
                    <li>User logged in (check localStorage)?</li>
                  </ul>
                </div>
                <button
                  onClick={handleRefresh}
                  className="text-red-500 hover:text-red-700 font-semibold shrink-0 mt-0.5"
                >
                  Retry
                </button>
              </div>
            )}

            {filtered.length === 0 && !loading && !loadError && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-[15px] font-medium">No discussions yet</p>
                <p className="text-[13px] mt-1">
                  Be the first to start a conversation!
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-white text-[13.5px] font-bold rounded-xl hover:opacity-90 transition-opacity"
                  style={{ background: GRADIENT }}
                >
                  <Plus size={14} /> Create Discussion
                </button>
              </div>
            )}

            {filtered.map((post) => (
              <PostCard key={post.id} post={post} onRefresh={handleRefresh} />
            ))}

            {loading && (
              <div className="flex justify-center py-6 text-gray-400">
                <Spinner size={24} />
              </div>
            )}

            {!loading && hasMore && filtered.length > 0 && (
              <button
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center justify-center gap-2 py-3 text-[13.5px] text-violet-600 font-semibold bg-violet-50 rounded-[10px] hover:bg-violet-100 transition-colors"
              >
                <ChevronDown size={16} /> Load more
              </button>
            )}
          </div>

          <div className="lg:w-[300px] xl:w-[320px] shrink-0 flex flex-col gap-4">
            <SuggestedUsers actor={actor} />
            <UpcomingEvents />
          </div>
        </div>
      </div>

      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={handleRefresh}
        />
      )}
    </div>
  );
}
