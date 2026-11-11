// components/feed/ReelsSection.jsx
// Horizontal scrollable reel thumbnails in the feed - tap to open full viewer
import { useState } from "react";
import { parseMedia, isVideo, timeAgo } from "./FeedUtils";
import { Icon, Avatar } from "./FeedPrimitives";
import ReelsViewer from "./ReelsViewer";

function ReelThumb({ post, onOpen }) {
  let mediaUrls = [];
  try { mediaUrls = JSON.parse(post.media_urls || "[]"); } catch { mediaUrls = post.media_urls ? [post.media_urls] : []; }
  const thumb = post.thumbnail_url || mediaUrls[0] || null;

  return (
    <button
      onClick={onOpen}
      className="flex flex-col shrink-0 focus:outline-none group"
      style={{ width: 120 }}
    >
      <div className="relative rounded-2xl overflow-hidden bg-gray-900" style={{ width: 120, height: 200 }}>
        {thumb && !isVideo(thumb)
          ? <img src={thumb} alt="" className="w-full h-full object-contain transition-transform group-hover:scale-105 duration-300" />
          : <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <Icon name="film" size={32} className="text-gray-600" />
            </div>}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />

        {/* Play icon */}
        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <Icon name="play" size={12} className="text-white ml-0.5" />
        </div>

        {/* Reel badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-gradient-to-r from-violet-600 to-pink-500 px-1.5 py-0.5 rounded-md">
          <Icon name="film" size={9} className="text-white" />
          <span className="text-white text-[9px] font-bold">REEL</span>
        </div>

        {/* Author + likes at bottom */}
        <div className="absolute bottom-0 inset-x-0 p-2">
          <div className="flex items-center gap-1 mb-1">
            <svg width={12} height={12} viewBox="0 0 24 24" fill="#f43f5e">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span className="text-white text-[11px] font-semibold">{post.likes_count || 0}</span>
          </div>
          <p className="text-white text-[11px] font-semibold leading-tight truncate">
            {post.author_name?.split(" ")[0] || "User"}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function ReelsSection({ reels, actor }) {
  const [viewerOpen, setViewerOpen]   = useState(false);
  const [startIndex, setStartIndex]   = useState(0);

  if (!reels.length) return null;

  const openReel = (idx) => {
    setStartIndex(idx);
    setViewerOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Icon name="film" size={14} className="text-white" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Reels</h3>
            <span className="text-xs text-gray-400 font-medium">{reels.length} videos</span>
          </div>
          <button
            onClick={() => openReel(0)}
            className="text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-1"
          >
            View all <Icon name="chevright" size={13} className="text-violet-600" />
          </button>
        </div>

        {/* Horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-4">
          {reels.map((post, idx) => (
            <ReelThumb key={post.id} post={post} onOpen={() => openReel(idx)} />
          ))}
        </div>
      </div>

      {viewerOpen && (
        <ReelsViewer
          reels={reels} actor={actor}
          startIndex={startIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
}