// components/feed/StoriesRow.jsx
import { useState, useEffect, useRef } from "react";
import { api } from "./FeedUtils";
import { Avatar, Icon, ProgressRing } from "./FeedPrimitives";
import { getImageURI } from "../../utils/helper";
import { uploadToS3 } from "../../utils/s3";
import { timeAgo } from "./FeedUtils";

// ─── Story Viewer Modal ───────────────────────────────────────────────────────
function StoryViewer({ groups, gIdx, sIdx, onAdvance, onClose }) {
  const group = groups[gIdx];
  const story = group?.stories[sIdx];
  if (!story) return null;
  const dur = story.duration_sec || 5;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 cursor-pointer" onClick={onClose}
    >
      <div
        className="relative bg-black overflow-hidden"
          onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bars */}
        <div className="absolute top-3 inset-x-3 flex gap-1 z-20">
          {group.stories.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-[3px] rounded-full bg-white/30 overflow-hidden"
            >
              {i < sIdx && <div className="h-full w-full bg-white" />}
              {i === sIdx && (
                <div
                  key={`${gIdx}-${sIdx}`}
                  className="h-full bg-white rounded-full"
                  style={{ animation: `sbar ${dur}s linear forwards` }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 inset-x-3 flex items-center gap-2.5 z-20">
          <Avatar
            src={group.author_image}
            name={group.author_name}
            size={34}
            ring
            ringHex="#fff"
          />
          <div>
            <p className="text-white text-sm font-semibold leading-none">
              {group.author_name}
            </p>
            <p className="text-white/50 text-[11px] mt-0.5">
              {timeAgo(story.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-white/80 hover:text-white p-1"
          >
            <Icon name="x" size={20} className="text-white" />
          </button>
        </div>

        {/* Media */}
        {story.media_type === "video" ? (
          <video
            src={story.media_url}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={story.media_url}
            className="w-full h-full object-contain"
            alt=""
          />
        )}

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-16 inset-x-0 px-5 py-3 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white text-sm text-center font-medium">
              {story.caption}
            </p>
          </div>
        )}

        {/* Nav zones */}
        <button
          className="absolute left-0 top-0 bottom-0 w-1/3 opacity-0"
          onClick={() => onAdvance(gIdx, sIdx - 2)}
        />
        <button
          className="absolute right-0 top-0 bottom-0 w-1/3 opacity-0"
          onClick={() => onAdvance(gIdx, sIdx)}
        />

        {/* Reply bar */}
        <div className="absolute bottom-4 inset-x-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2.5">
            <input
              placeholder="Reply to story…"
              className="flex-1 bg-transparent text-white text-sm placeholder-white/50 outline-none"
            />
            <Icon name="send" size={16} className="text-white/70" />
          </div>
        </div>
      </div>
      <style>{`@keyframes sbar { from { width:0 } to { width:100% } }`}</style>
    </div>
  );
}

// ─── Story Upload Modal ───────────────────────────────────────────────────────
function StoryUploadModal({ actor, onClose, onUploaded }) {
  const [step, setStep] = useState("pick");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview({
      url: URL.createObjectURL(f),
      type: f.type.startsWith("video") ? "video" : "image",
    });
    setStep("preview");
  };

  const submit = async () => {
    setUploading(true);
    try {
      const url = await uploadToS3(file, setProgress);
      await api("/stories", {
        method: "POST",
        body: JSON.stringify({
          user_id: actor.user_id,
          user_role: actor.user_role,
          media_url: url,
          media_type: preview.type,
          caption: caption.trim() || undefined,
          duration_sec: preview.type === "video" ? 15 : 5,
        }),
      });
      onUploaded?.();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 cursor-pointer" onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="x" size={20} />
          </button>
          <h2 className="text-sm font-bold text-gray-900 tracking-wide">
            New Story
          </h2>
          {step === "preview" ? (
            <button
              onClick={() => setStep("caption")}
              className="text-violet-600 text-sm font-bold"
            >
              Next →
            </button>
          ) : step === "caption" ? (
            <button
              onClick={submit}
              disabled={uploading}
              className="text-violet-600 text-sm font-bold disabled:opacity-40"
            >
              {uploading ? `${progress}%` : "Share"}
            </button>
          ) : (
            <span className="w-10" />
          )}
        </div>

        {step === "pick" && (
          <div className="flex flex-col items-center justify-center py-14 gap-5 px-8 bg-gradient-to-b from-violet-50 to-white">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Icon name="plus" size={32} className="text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-800">
                Add to your story
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Photos and videos disappear after 24 hours
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  fileRef.current.accept = "image/*";
                  fileRef.current.click();
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-2xl text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm"
              >
                <Icon name="image" size={15} /> Photo
              </button>
              <button
                onClick={() => {
                  fileRef.current.accept = "video/*";
                  fileRef.current.click();
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-2xl text-sm font-semibold hover:bg-black transition-colors shadow-sm"
              >
                <Icon name="video" size={15} /> Video
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={pickFile}
            />
          </div>
        )}

        {step === "preview" && preview && (
          <div
            className="relative bg-black"
            style={{ aspectRatio: "9/16", maxHeight: 440 }}
          >
            {preview.type === "video" ? (
              <video
                src={preview.url}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={preview.url}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
            <button
              onClick={() => setStep("pick")}
              className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        )}

        {step === "caption" && preview && (
          <div>
            <div className="relative bg-black" style={{ height: 240 }}>
              {preview.type === "video" ? (
                <video
                  src={preview.url}
                  muted
                  className="w-full h-full object-cover opacity-70"
                />
              ) : (
                <img
                  src={preview.url}
                  alt=""
                  className="w-full h-full object-cover opacity-70"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 p-4">
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption…"
                  className="w-full bg-black/40 backdrop-blur-sm text-white placeholder-white/50 text-sm px-3 py-2.5 rounded-xl border border-white/20 outline-none"
                />
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <ProgressRing progress={progress} size={64} />
                    <span className="text-white text-sm font-bold z-10">
                      {progress}%
                    </span>
                  </div>
                  <p className="text-white/70 text-xs">Uploading story…</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stories Row ──────────────────────────────────────────────────────────────
export default function StoriesRow({ actor }) {
  const [groups, setGroups] = useState([]);
  const [active, setActive] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const timerRef = useRef(null);

  const load = () =>
    api(
      `/stories?user_id=${actor.user_id}&user_role=${encodeURIComponent(actor.user_role)}`,
    )
      .then((d) => setGroups(d.stories || []))
      .catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const markViewed = (id) =>
    api(`/stories/${id}/view`, {
      method: "POST",
      body: JSON.stringify({
        user_id: actor.user_id,
        user_role: actor.user_role,
      }),
    }).catch(() => {});

  const startTimer = (gIdx, sIdx) => {
    clearTimeout(timerRef.current);
    const dur = (groups[gIdx]?.stories[sIdx]?.duration_sec || 5) * 1000;
    timerRef.current = setTimeout(() => advance(gIdx, sIdx), dur);
  };

  const openStory = (gIdx, sIdx = 0) => {
    setActive({ gIdx, sIdx });
    markViewed(groups[gIdx].stories[sIdx].id);
    startTimer(gIdx, sIdx);
  };

  const advance = (gIdx, sIdx) => {
    const grp = groups[gIdx];
    if (!grp) return setActive(null);
    const next = sIdx + 1;
    if (next < grp.stories.length) {
      setActive({ gIdx, sIdx: next });
      markViewed(grp.stories[next].id);
      startTimer(gIdx, next);
    } else if (gIdx + 1 < groups.length) {
      openStory(gIdx + 1, 0);
    } else {
      setActive(null);
    }
  };

  const normalizeRole = (role) => role?.toLowerCase().replace(/\s+/g, "_");

  const myGroup = groups.find(
    (g) =>
      g.author_id === actor.user_id &&
      normalizeRole(g.author_role) === normalizeRole(actor.user_role),
  );

  const myStoryMedia = myGroup?.stories?.[0]?.media_url;
  const isVideo = myGroup?.stories?.[0]?.media_type === "video";

  return (
    <>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide py-1 px-1">
        {/* Add story */}
        <div className="flex flex-col items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              if (myGroup) {
                const idx = groups.findIndex(
                  (g) =>
                    g.author_id === actor.user_id &&
                    normalizeRole(g.author_role) ===
                      normalizeRole(actor.user_role),
                );
                openStory(idx);
              } else {
                //setShowUpload(true);
              }
            }}
            className="relative"
          >
            <Avatar
              src={
                myGroup
                  ? myStoryMedia // show story thumbnail
                  : getImageURI(actor.user?.userImage) // fallback
              }
              name={actor.user?.fullname || "Me"}
              size={60}
              ring
              ringGradient={myGroup?.has_unseen}
              ringHex={!myGroup ? "#d1d5db" : undefined}
            />

            {/* ➕ Always visible add button */}
            <div
              onClick={(e) => {
                e.stopPropagation(); //prevent opening story
                setShowUpload(true);
              }}
              className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center border-2 border-white cursor-pointer"
            >
              <Icon name="plus" size={10} className="text-white" />
            </div>
          </button>

          <span className="text-[11px] text-gray-500 font-medium truncate max-w-[60px] text-center">
            Your Story
          </span>
        </div>

        {/* Story groups */}
        {groups
          .filter(
            (g) =>
              !(
                g.author_id === actor.user_id &&
                normalizeRole(g.author_role) === normalizeRole(actor.user_role)
              ),
          )
          .map((grp) => {
            const realIndex = groups.findIndex(
              (g) =>
                g.author_id === grp.author_id &&
                normalizeRole(g.author_role) === normalizeRole(actor.user_role),
            );

            return (
              <button
                key={`${grp.author_role}_${grp.author_id}`}
                onClick={() => openStory(realIndex)}
                className="flex flex-col items-center gap-1.5 shrink-0 focus:outline-none"
              >
                <div className="relative">
                  <Avatar
                    src={grp.author_image}
                    name={grp.author_name}
                    size={60}
                    ring
                    ringGradient={grp.has_unseen}
                    ringHex={grp.has_unseen ? undefined : "#d1d5db"}
                  />
                </div>
                <span className="text-[11px] text-gray-600 font-medium max-w-[60px] truncate text-center">
                  {grp.author_name?.split(" ")[0] || "User"}
                </span>
              </button>
            );
          })}
      </div>

      {active && (
        <StoryViewer
          groups={groups}
          gIdx={active.gIdx}
          sIdx={active.sIdx}
          onAdvance={advance}
          onClose={() => {
            clearTimeout(timerRef.current);
            setActive(null);
          }}
        />
      )}
      {showUpload && (
        <StoryUploadModal
          actor={actor}
          onClose={() => setShowUpload(false)}
          onUploaded={load}
        />
      )}
    </>
  );
}
