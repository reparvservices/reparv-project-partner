// components/feed/PostCard.jsx
import { useState, useEffect, useRef } from "react";
import { api, parseMedia, isVideo, timeAgo } from "./FeedUtils";
import { Icon, Avatar, RoleBadge, ActionBtn } from "./FeedPrimitives";
import { getImageURI } from "../../utils/helper";

// ─── Media Grid ───────────────────────────────────────────────────────────────
function MediaGrid({ urls }) {
  if (!urls.length) return null;
  const count = Math.min(urls.length, 4);
  const layouts = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-2",
    4: "grid-cols-2",
  };
  return (
    <div className={`grid ${layouts[count]} gap-0.5`}>
      {urls.slice(0, 4).map((url, i) => {
        const isFirst3 = count === 3 && i === 0;
        return (
          <div key={i}
            className={`relative overflow-hidden bg-gray-100 ${isFirst3 ? "row-span-2" : ""}`}
            style={{ aspectRatio: count === 1 ? "16/9" : "1/1" }}
          >
            {isVideo(url)
              ? <video src={url} controls className="w-full h-full object-contain" />
              : <img src={url} alt="" className="w-full h-full object-contain transition-transform hover:scale-[1.02] duration-300" />}
            {i === 3 && urls.length > 4 && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">+{urls.length - 4}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Comment Item ─────────────────────────────────────────────────────────────
function CommentItem({ c }) {
  return (
    <div className="flex gap-2.5">
      <Avatar src={c.author_image} name={c.author_name || c.partner_name} size={28} />
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-3 py-2">
          <span className="text-xs font-bold text-gray-800">{c.author_name || c.partner_name} </span>
          <span className="text-xs text-gray-600 leading-relaxed">{c.content}</span>
        </div>
        <span className="text-[11px] text-gray-400 mt-0.5 ml-2 block">{timeAgo(c.created_at)}</span>
      </div>
    </div>
  );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────
export default function PostCard({ post, actor, onDeleted, onUpdated }) {
  const [liked, setLiked]               = useState(!!post.has_liked);
  const [likes, setLikes]               = useState(post.likes_count || 0);
  const [saved, setSaved]               = useState(!!post.is_saved);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments]         = useState([]);
  const [commentText, setCommentText]   = useState("");
  const [loadingCmt, setLoadingCmt]     = useState(false);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [editing, setEditing]           = useState(false);
  const [editContent, setEditContent]   = useState(post.content || "");
  const menuRef = useRef();

  const isOwn = post.author_id === actor.user_id;
  const media  = parseMedia(post.media_urls);

  useEffect(() => {
    if (!menuOpen) return;
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  const handleLike = async () => {
    const prev = liked; setLiked(!liked); setLikes(l => l + (liked ? -1 : 1));
    try {
      await api(`/posts/${post.id}/like`, { method: "POST", body: JSON.stringify({ user_id: actor.user_id, user_role: actor.user_role }) });
    } catch { setLiked(prev); setLikes(l => l + (liked ? 1 : -1)); }
  };

  const handleSave = async () => {
    const prev = saved; setSaved(!saved);
    try { await api(`/posts/${post.id}/save`, { method: "POST", body: JSON.stringify({ user_id: actor.user_id, user_role: actor.user_role }) }); }
    catch { setSaved(prev); }
  };

  const toggleComments = async () => {
    if (showComments) return setShowComments(false);
    setLoadingCmt(true); setShowComments(true);
    try {
      const d = await api(`/posts/${post.id}/comments?user_id=${actor.user_id}&user_role=${encodeURIComponent(actor.user_role)}`);
      setComments(d.comments || []);
    } catch {}
    setLoadingCmt(false);
  };

  const submitComment = async () => {
    const text = commentText.trim();
    if (!text) return;
    const temp = { id: `t_${Date.now()}`, author_name: actor.user?.fullname || "Me", content: text, created_at: new Date().toISOString() };
    setComments(c => [...c, temp]); setCommentText("");
    try {
      await api(`/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ user_id: actor.user_id, user_role: actor.user_role, content: text, partner_name: actor.user?.fullname || "Me" }),
      });
      const d = await api(`/posts/${post.id}/comments?user_id=${actor.user_id}&user_role=${encodeURIComponent(actor.user_role)}`);
      setComments(d.comments || []);
    } catch (err) { setComments(c => c.filter(x => x.id !== temp.id)); alert(err.message); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api(`/posts/${post.id}`, { method: "DELETE", body: JSON.stringify({ user_id: actor.user_id, user_role: actor.user_role }) });
      onDeleted?.(post.id);
    } catch (err) { alert(err.message); }
  };

  const handleEditSave = async () => {
    try {
      await api(`/posts/${post.id}`, { method: "PUT", body: JSON.stringify({ user_id: actor.user_id, user_role: actor.user_role, content: editContent }) });
      setEditing(false); onUpdated?.(post.id, { ...post, content: editContent });
    } catch (err) { alert(err.message); }
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* ── Header ── */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex gap-3 min-w-0">
          <Avatar src={post.author_image} name={post.author_name} size={44} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[15px] font-bold text-gray-900 leading-tight truncate">{post.author_name || "Unknown"}</p>
              <RoleBadge role={post.author_role} />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {post.location && (
                <>
                  <Icon name="location" size={11} className="text-gray-400" />
                  <span className="text-[12px] text-gray-400">{post.location} •</span>
                </>
              )}
              <span className="text-[12px] text-gray-400">{timeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="relative shrink-0" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <Icon name="more-h" size={18} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 min-w-[152px] overflow-hidden">
              {isOwn && (
                <>
                  <button onClick={() => { setEditing(true); setMenuOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                    <Icon name="edit" size={14} className="text-gray-400" /> Edit post
                  </button>
                  <button onClick={() => { handleDelete(); setMenuOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
                    <Icon name="trash" size={14} className="text-red-400" /> Delete post
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                </>
              )}
              <button onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors text-left">
                <Icon name="eye" size={14} className="text-gray-400" /> View post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Tag ── */}
      {post.tag_label && (
        <div className="px-4 pb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-bold"
            style={{ background: post.tag_bg || "#ede9fe", color: post.tag_color || "#7c3aed" }}>
            {post.tag_label}
          </span>
        </div>
      )}

      {/* ── Content ── */}
      <div className="px-4 pb-3">
        {editing ? (
          <div className="space-y-2">
            <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={3}
              className="w-full resize-none bg-gray-50 border border-gray-200 focus:border-violet-300 focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all leading-relaxed" />
            <div className="flex gap-2">
              <button onClick={handleEditSave}
                className="px-4 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors">Save</button>
              <button onClick={() => { setEditing(false); setEditContent(post.content || ""); }}
                className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </div>
        ) : (
          post.content && <p className="text-sm text-gray-700 leading-relaxed">{post.content}</p>
        )}
      </div>

      {/* ── Media ── */}
      {media.length > 0 && <MediaGrid urls={media} />}

      {/* ── Actions ── */}
      <div className="flex items-center justify-between px-2 py-1.5 border-t border-gray-100">
        <div className="flex items-center">
          <ActionBtn onClick={handleLike} active={liked} activeCls="text-rose-500"
            label={likes > 0 ? String(likes) : ""}>
            <Icon name={liked ? "heart-fill" : "heart"} size={20}
              className={liked ? "text-rose-500" : "text-gray-400"} />
          </ActionBtn>
          <ActionBtn onClick={toggleComments}
            label={post.comments_count > 0 ? String(post.comments_count) : ""}>
            <Icon name="comment" size={20}
              className={showComments ? "text-violet-500" : "text-gray-400"} />
          </ActionBtn>
          <ActionBtn>
            <Icon name="share" size={18} className="text-gray-400" />
            <span className="text-xs text-gray-400 font-medium">Share</span>
          </ActionBtn>
        </div>
        <ActionBtn onClick={handleSave} active={saved} activeCls="text-violet-600">
          <Icon name={saved ? "bm-fill" : "bookmark"} size={20}
            className={saved ? "text-violet-600" : "text-gray-400"} />
        </ActionBtn>
      </div>

      {/* ── Comments ── */}
      {showComments && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-3">
          {loadingCmt ? (
            <p className="text-xs text-gray-400 text-center py-2">Loading…</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">No comments yet. Be first!</p>
          ) : (
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {comments.map(c => <CommentItem key={c.id} c={c} />)}
            </div>
          )}
          <div className="flex gap-2 items-center pt-1">
            <Avatar src={getImageURI(actor.user?.userImage)} name={actor.user?.fullname || "Me"} size={28} />
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 focus-within:border-violet-300 focus-within:bg-white transition-all">
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && submitComment()}
                placeholder="Add a comment…"
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" />
              <button onClick={submitComment} disabled={!commentText.trim()}
                className="text-violet-500 disabled:opacity-30 hover:text-violet-700 transition-colors">
                <Icon name="send" size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}