// components/feed/Composer.jsx
import { useState, useRef } from "react";
import { api, isVideo } from "./FeedUtils";
import { Icon, Avatar, ProgressRing } from "./FeedPrimitives";
import { getImageURI } from "../../utils/helper";
import { uploadToS3 } from "../../utils/s3";

const TABS = [
  { id: "post", label: "Post",     icon: "grid"  },
  { id: "reel", label: "Reel",     icon: "film"  },
];

export default function Composer({ actor, onPosted }) {
  const [open, setOpen]               = useState(false);
  const [tab, setTab]                 = useState("post");
  // Post state
  const [content, setContent]         = useState("");
  const [tag, setTag]                 = useState("");
  const [visibility, setVisibility]   = useState("all");
  const [files, setFiles]             = useState([]);
  const [previews, setPreviews]       = useState([]);
  const [uploadProg, setUploadProg]   = useState({});
  // Reel state
  const [reelFile, setReelFile]       = useState(null);
  const [reelPreview, setReelPreview] = useState(null);
  const [reelCaption, setReelCaption] = useState("");
  const [reelProg, setReelProg]       = useState(0);
  // Shared
  const [uploading, setUploading]     = useState(false);
  const [posting, setPosting]         = useState(false);
  const fileRef = useRef();
  const reelRef = useRef();

  const canPost = tab === "reel" ? !!reelFile : content.trim().length > 0 || files.length > 0;

  const addFiles = (sel) =>
    Array.from(sel).forEach(file => {
      setFiles(f => [...f, file]);
      setPreviews(p => [...p, { url: URL.createObjectURL(file), type: file.type.startsWith("video") ? "video" : "image" }]);
    });

  const removeFile = (idx) => {
    setFiles(f => f.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  const pickReel = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setReelFile(f);
    setReelPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setContent(""); setTag(""); setFiles([]); setPreviews([]); setUploadProg({});
    setReelFile(null); setReelPreview(null); setReelCaption(""); setReelProg(0);
    setOpen(false); setTab("post"); setUploading(false); setPosting(false);
  };

  const submitPost = async () => {
    if (!canPost || posting) return;
    setPosting(true);
    try {
      let mediaUrls = [];
      if (files.length) {
        setUploading(true);
        mediaUrls = await Promise.all(
          files.map((f, i) => uploadToS3(f, p => setUploadProg(prev => ({ ...prev, [i]: p }))))
        );
        setUploading(false);
      }
      await api("/posts", {
        method: "POST",
        body: JSON.stringify({
          user_id: actor.user_id, user_role: actor.user_role,
          content: content.trim() || undefined,
          tag_label: tag.trim() || undefined,
          visibility, media_urls: mediaUrls,
          post_type: mediaUrls.some(isVideo) ? "video" : mediaUrls.length ? "image" : "text",
        }),
      });
      reset(); onPosted?.();
    } catch (err) { alert(err.message); }
    finally { setPosting(false); setUploading(false); }
  };

  const submitReel = async () => {
    if (!reelFile || posting) return;
    setPosting(true);
    try {
      setUploading(true);
      const url = await uploadToS3(reelFile, setReelProg);
      setUploading(false);
      await api("/posts", {
        method: "POST",
        body: JSON.stringify({
          user_id: actor.user_id, user_role: actor.user_role,
          content: reelCaption.trim() || undefined,
          tag_label: "🎬 Reel", tag_color: "#111827", tag_bg: "#f3f4f6",
          visibility, media_urls: [url], post_type: "video",
        }),
      });
      reset(); onPosted?.();
    } catch (err) { alert(err.message); }
    finally { setPosting(false); setUploading(false); }
  };

  // ── Collapsed ────────────────────────────────────────────────────────────
  if (!open) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <Avatar src={getImageURI(actor.user?.userImage)} name={actor.user?.fullname || "Me"} size={40} />
          <button
            onClick={() => setOpen(true)}
            className="flex-1 text-left bg-gray-50 hover:bg-violet-50/50 border border-gray-200 hover:border-violet-200 rounded-full px-4 py-2.5 text-sm text-gray-400 transition-all duration-150"
          >
            Share update, lead requirement or project progress...
          </button>
        </div>
        <div className="flex gap-1 mt-3 pt-3 border-t border-gray-100">
          {[
            ["image", "Photo"],
            ["film",  "Reel"],
            ["home",  "Property"],
            ["tag",   "Lead"],
          ].map(([icon, label]) => (
            <button key={label}
              onClick={() => { setOpen(true); if (label === "Reel") setTab("reel"); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 hover:text-violet-600 transition-colors"
            >
              <Icon name={icon} size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Post
          </button>
        </div>
      </div>
    );
  }

  // ── Expanded ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-gray-100">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-colors border-b-2
              ${tab === t.id ? "border-violet-600 text-violet-700" : "border-transparent text-gray-400 hover:text-gray-600"}`}
          >
            <Icon name={t.icon} size={15} /> {t.label}
          </button>
        ))}
        <button onClick={reset} className="px-4 text-gray-400 hover:text-gray-600 border-b-2 border-transparent transition-colors">
          <Icon name="x" size={16} />
        </button>
      </div>

      {/* ── POST ── */}
      {tab === "post" && (
        <div className="p-5 space-y-4">
          <div className="flex gap-3">
            <Avatar src={getImageURI(actor.user?.userImage)} name={actor.user?.fullname || "Me"} size={42} />
            <div className="flex-1 space-y-3">
              <textarea value={content} onChange={e => setContent(e.target.value)}
                placeholder="What's on your mind?" autoFocus rows={3}
                className="w-full resize-none bg-gray-50 border border-gray-200 focus:border-violet-300 focus:bg-white rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all leading-relaxed" />
              <input value={tag} onChange={e => setTag(e.target.value)}
                placeholder="Tag label (e.g. Hot Lead Requirement)"
                className="w-full bg-gray-50 border border-gray-200 focus:border-violet-300 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all" />
            </div>
          </div>

          {/* Media previews */}
          {previews.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {previews.map((p, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {p.type === "video"
                    ? <video src={p.url} className="w-full h-full object-contain" />
                    : <img src={p.url} alt="" className="w-full h-full object-contain" />}
                  {uploading && uploadProg[i] !== undefined && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{uploadProg[i]}%</span>
                    </div>
                  )}
                  {!uploading && (
                    <button onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                      <Icon name="x" size={10} className="text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-1 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {[["image","Photo","image/*"],["video","Video","video/*"]].map(([icon, label, accept]) => (
                <button key={label}
                  onClick={() => { fileRef.current.accept = accept; fileRef.current.click(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-violet-50 text-gray-600 hover:text-violet-600 text-xs font-semibold transition-colors">
                  <Icon name={icon} size={13} /> {label}
                </button>
              ))}
              <select value={visibility} onChange={e => setVisibility(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs text-gray-600 outline-none cursor-pointer">
                <option value="all">Everyone</option>
                <option value="sales_partner">Sales only</option>
                <option value="territory_partner">Territory only</option>
                <option value="project_partner">Project only</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={reset} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={submitPost} disabled={!canPost || posting}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-all active:scale-95">
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
          <input ref={fileRef} type="file" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
        </div>
      )}

      {/* ── REEL ── */}
      {tab === "reel" && (
        <div className="p-5 space-y-4">
          {!reelPreview ? (
            <button onClick={() => reelRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-4 py-14 rounded-2xl border-2 border-dashed border-gray-200 hover:border-violet-300 bg-gray-50 hover:bg-violet-50/30 transition-all">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Icon name="film" size={28} className="text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">Upload a Reel</p>
                <p className="text-xs text-gray-400 mt-1">MP4, MOV or WebM • Portrait videos look best</p>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-2xl text-sm font-bold shadow-sm">
                <Icon name="plus" size={14} /> Choose Video
              </div>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black mx-auto" style={{ maxWidth: 260, aspectRatio: "9/16" }}>
                <video src={reelPreview} controls className="w-full h-full object-contain" />
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <ProgressRing progress={reelProg} size={64} />
                      <span className="text-white text-sm font-bold z-10">{reelProg}%</span>
                    </div>
                    <p className="text-white/70 text-xs">Uploading reel…</p>
                  </div>
                )}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Icon name="film" size={10} className="text-white" />
                  <span className="text-white text-[10px] font-bold">REEL</span>
                </div>
                <button onClick={() => { setReelFile(null); setReelPreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white">
                  <Icon name="x" size={13} />
                </button>
              </div>

              <textarea value={reelCaption} onChange={e => setReelCaption(e.target.value)}
                placeholder="Write a caption for your reel…" rows={3}
                className="w-full resize-none bg-gray-50 border border-gray-200 focus:border-violet-300 focus:bg-white rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none transition-all" />

              <div className="flex items-center gap-2 justify-between">
                <select value={visibility} onChange={e => setVisibility(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-600 outline-none cursor-pointer">
                  <option value="all">Everyone</option>
                  <option value="sales_partner">Sales only</option>
                  <option value="territory_partner">Territory only</option>
                  <option value="project_partner">Project only</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={reset} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
                  <button onClick={submitReel} disabled={!canPost || posting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 hover:opacity-90 disabled:opacity-50 text-white text-sm font-bold transition-all active:scale-95 flex items-center gap-2">
                    <Icon name="film" size={14} />
                    {posting ? "Sharing…" : "Share Reel"}
                  </button>
                </div>
              </div>
            </div>
          )}
          <input ref={reelRef} type="file" accept="video/*" className="hidden" onChange={pickReel} />
        </div>
      )}
    </div>
  );
}