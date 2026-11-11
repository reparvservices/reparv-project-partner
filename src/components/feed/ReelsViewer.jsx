// components/feed/ReelsViewer.jsx
// Full-screen Instagram-like Reels with vertical snap scrolling
import { useState, useEffect, useRef, useCallback } from "react";
import { api, timeAgo } from "./FeedUtils";
import { Icon, Avatar, ProgressRing } from "./FeedPrimitives";
import { getImageURI } from "../../utils/helper";

// ─── Single Reel Slide ────────────────────────────────────────────────────────
function ReelSlide({ post, actor, isActive, onLikeChange }) {
  const videoRef  = useRef(null);
  const [playing, setPlaying]   = useState(false);
  const [muted, setMuted]       = useState(true);
  const [liked, setLiked]       = useState(!!post.has_liked);
  const [likes, setLikes]       = useState(post.likes_count || 0);
  const [saved, setSaved]       = useState(!!post.is_saved);
  const [showComment, setShowComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingCmt, setLoadingCmt] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);

  // Parse first video URL
  let mediaUrls = [];
  try { mediaUrls = JSON.parse(post.media_urls || "[]"); } catch { mediaUrls = post.media_urls ? [post.media_urls] : []; }
  const videoUrl = mediaUrls.find(u => /\.(mp4|webm|mov)/i.test(u) || u.includes("video")) || mediaUrls[0];
  const thumbUrl = post.thumbnail_url || null;

  // Autoplay when active
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isActive) {
      v.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
      setPlaying(false);
      setProgress(0);
    }
  }, [isActive]);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    const prev = liked; setLiked(!liked); setLikes(l => l + (liked ? -1 : 1));
    try {
      await api(`/posts/${post.id}/like`, { method: "POST", body: JSON.stringify({ user_id: actor.user_id, user_role: actor.user_role }) });
      onLikeChange?.();
    } catch { setLiked(prev); setLikes(l => l + (liked ? 1 : -1)); }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    const prev = saved; setSaved(!saved);
    try { await api(`/posts/${post.id}/save`, { method: "POST", body: JSON.stringify({ user_id: actor.user_id, user_role: actor.user_role }) }); }
    catch { setSaved(prev); }
  };

  const openComments = async (e) => {
    e.stopPropagation();
    setShowComment(true);
    setLoadingCmt(true);
    try {
      const d = await api(`/posts/${post.id}/comments?user_id=${actor.user_id}&user_role=${encodeURIComponent(actor.user_role)}`);
      setComments(d.comments || []);
    } catch {}
    setLoadingCmt(false);
  };

  const submitComment = async () => {
    const text = commentText.trim(); if (!text) return;
    const temp = { id: `t_${Date.now()}`, author_name: actor.user?.fullname || "Me", content: text, created_at: new Date().toISOString() };
    setComments(c => [...c, temp]); setCommentText("");
    try {
      await api(`/posts/${post.id}/comments`, { method: "POST", body: JSON.stringify({ user_id: actor.user_id, user_role: actor.user_role, content: text, partner_name: actor.user?.fullname || "Me" }) });
    } catch {}
  };

  // Double-tap like heart animation
  const [heartAnim, setHeartAnim] = useState(false);
  const lastTap = useRef(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setHeartAnim(true);
      setTimeout(() => setHeartAnim(false), 900);
      if (!liked) { setLiked(true); setLikes(l => l + 1); api(`/posts/${post.id}/like`, { method: "POST", body: JSON.stringify({ user_id: actor.user_id, user_role: actor.user_role }) }).catch(() => {}); }
    }
    lastTap.current = now;
  };

  return (
    <div className="relative w-full max-w-lg mx-auto flex-shrink-0 cursor-pointer" onClick={handleDoubleTap}>
      {/* Video */}
      <video
        ref={videoRef} src={videoUrl} loop muted={muted} playsInline
        poster={thumbUrl || undefined}
        onTimeUpdate={handleTimeUpdate}
        className="w-full h-full object-cover"
        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
        style={{ position: "absolute", inset: 0 }}
      />

      {/* Progress bar */}
      <div className="absolute top-0 inset-x-0 h-[3px] bg-white/20 z-20">
        <div className="h-full bg-white/80 transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

      {/* Play/Pause indicator */}
      {!playing && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Icon name="play" size={28} className="text-white ml-1" />
          </div>
        </div>
      )}

      {/* Double-tap heart */}
      {heartAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <svg width={80} height={80} viewBox="0 0 24 24" fill="white" className="animate-ping opacity-90">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
      )}

      {/* Right action bar */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-20">
        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-transform active:scale-90 ${liked ? "scale-110" : ""}`}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill={liked ? "#f43f5e" : "white"}
              className={`drop-shadow-lg transition-all duration-200 ${liked ? "scale-125" : ""}`}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <span className="text-white text-xs font-semibold drop-shadow">{likes > 0 ? likes : ""}</span>
        </button>

        {/* Comment */}
        <button onClick={openComments} className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-full flex items-center justify-center">
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span className="text-white text-xs font-semibold drop-shadow">{post.comments_count > 0 ? post.comments_count : ""}</span>
        </button>

        {/* Save */}
        <button onClick={handleSave} className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-full flex items-center justify-center">
            <svg width={24} height={24} viewBox="0 0 24 24"
              fill={saved ? "white" : "none"} stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
              className="drop-shadow-lg">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
        </button>

        {/* Share */}
        <button onClick={e => e.stopPropagation()} className="flex flex-col items-center gap-1">
          <div className="w-11 h-11 rounded-full flex items-center justify-center">
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </div>
        </button>

        {/* Mute */}
        <button onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            {muted
              ? <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              : <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>}
          </svg>
        </button>
      </div>

      {/* Author info (bottom left) */}
      <div className="absolute left-3 bottom-6 right-16 z-20">
        <div className="flex items-center gap-2.5 mb-2">
          <Avatar src={post.author_image} name={post.author_name} size={36} ring ringHex="#fff" />
          <div>
            <p className="text-white font-bold text-sm leading-none drop-shadow">{post.author_name || "Unknown"}</p>
            <p className="text-white/60 text-[11px] mt-0.5">{timeAgo(post.created_at)}</p>
          </div>
          <button onClick={e => e.stopPropagation()}
            className="ml-2 px-3 py-1 border border-white/60 rounded-full text-white text-xs font-semibold hover:bg-white/20 transition-colors">
            Follow
          </button>
        </div>
        {post.content && (
          <p className="text-white text-sm leading-relaxed drop-shadow line-clamp-2">{post.content}</p>
        )}
        {post.tag_label && (
          <span className="inline-block mt-1 text-white/80 text-xs font-medium">{post.tag_label}</span>
        )}
        {/* Music row */}
        <div className="flex items-center gap-1.5 mt-2">
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
          </svg>
          <p className="text-white/70 text-[11px] truncate">Original sound • {post.author_name}</p>
        </div>
      </div>

      {/* Comments bottom sheet */}
      {showComment && (
        <div
          className="absolute inset-x-0 bottom-0 z-40 bg-white rounded-t-3xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Comments</h3>
            <button onClick={() => setShowComment(false)} className="text-gray-400 hover:text-gray-600">
              <Icon name="x" size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: "calc(55vh - 120px)" }}>
            {loadingCmt
              ? <p className="text-xs text-gray-400 text-center py-4">Loading…</p>
              : comments.length === 0
                ? <p className="text-xs text-gray-400 text-center py-4">No comments yet</p>
                : comments.map(c => (
                    <div key={c.id} className="flex gap-2.5">
                      <Avatar src={c.author_image} name={c.author_name || c.partner_name} size={28} />
                      <div>
                        <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-3 py-2">
                          <span className="text-xs font-bold text-gray-800">{c.author_name || c.partner_name} </span>
                          <span className="text-xs text-gray-600">{c.content}</span>
                        </div>
                        <span className="text-[11px] text-gray-400 mt-0.5 ml-2 block">{timeAgo(c.created_at)}</span>
                      </div>
                    </div>
                  ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 flex gap-2 items-center">
            <Avatar src={getImageURI(actor.user?.userImage)} name={actor.user?.fullname || "Me"} size={30} />
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
              <input value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && submitComment()}
                placeholder="Add a comment…" className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" />
              <button onClick={submitComment} disabled={!commentText.trim()} className="text-violet-500 disabled:opacity-30">
                <Icon name="send" size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reels Viewer (full-screen container with vertical snap) ──────────────────
export default function ReelsViewer({ reels, actor, onClose, startIndex = 0 }) {
  const containerRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(startIndex);

  useEffect(() => {
    // Scroll to start index
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: startIndex * window.innerHeight, behavior: "instant" });
  }, []);

  // Track which slide is active via IntersectionObserver
  useEffect(() => {
    const slides = containerRef.current?.querySelectorAll("[data-reel-slide]");
    if (!slides) return;
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            const idx = parseInt(entry.target.dataset.reelSlide);
            setActiveIdx(idx);
          }
        });
      },
      { threshold: 0.5 }
    );
    slides.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, [reels.length]);

  if (!reels.length) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black">
      {/* Close button */}
      <button onClick={onClose}
        className="absolute top-4 left-4 z-[100] w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors">
        <Icon name="x" size={18} className="text-white" />
      </button>

      {/* Reels label */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2">
        <Icon name="film" size={16} className="text-white" />
        <span className="text-white text-sm font-bold tracking-wide">Reels</span>
      </div>

      {/* Vertical scroll container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollSnapType: "y mandatory", WebkitOverflowScrolling: "touch" }}
      >
        {reels.map((post, idx) => (
          <div key={post.id} data-reel-slide={idx} className="snap-start snap-always" style={{ height: "100dvh" }}>
            <ReelSlide post={post} actor={actor} isActive={idx === activeIdx} />
          </div>
        ))}
      </div>
    </div>
  );
}