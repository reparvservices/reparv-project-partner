// Feed.jsx — Main feed page
// Imports all sub-components, manages feed state, splits reels from posts
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../store/auth";
import { api, normaliseRole } from "../components/feed/FeedUtils.js";

// Sub-components
import FeedNavbar from "../components/feed/FeedNavbar";
import StoriesRow from "../components/feed/StoriesRow";
import Composer from "../components/feed/Composer";
import PostCard from "../components/feed/PostCard";
import ReelsSection from "../components/feed/ReelsSection";
import NotificationsPanel from "../components/feed/NotificationsPanel";
import RightSidebar from "../components/feed/RightSidebar";
import { PostSkeleton } from "../components/feed/FeedPrimitives";

// ─── useActor hook ────────────────────────────────────────────────────────────
{/*function useActor() {
  const { user, role } = useAuth();
  return {
    user_id: user?.id,
    user_role: user?.role,
    normalisedRole: normaliseRole(role),
    user,
  };
}*/}

function useActor() {
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
        user,
      };
    }
  } catch {
    /* SSR / unavailable */
  }
  return { user_id: null, user_role: null, fullname: "Me" };
}

// ─── Loading screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F4F5F9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-bounce"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </div>
        <p className="text-sm text-gray-400 font-medium">Loading your feed…</p>
      </div>
    </div>
  );
}

// ─── Feed Page ────────────────────────────────────────────────────────────────
export default function Feed() {
  const actor = useActor();

  const [allPosts, setAllPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unread, setUnread] = useState(0);

  const loaderRef = useRef(null);
  const loadingRef = useRef(false);
  const actorReady = !!actor.user_id && !!actor.user_role;

  // Separate reels vs regular posts
  const reelPosts = allPosts.filter(
    (p) => p.post_type === "video" || p.tag_label === "🎬 Reel",
  );
  const regularPosts = allPosts.filter(
    (p) => p.post_type !== "video" && p.tag_label !== "🎬 Reel",
  );

  // ── Fetch posts ─────────────────────────────────────────────────────────────
  const loadPosts = useCallback(
    async (p = 1) => {
      if (loadingRef.current || !actorReady) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const d = await api(
          `/posts?user_id=${actor.user_id}&user_role=${encodeURIComponent(actor.user_role)}&page=${p}&limit=10`,
        );
        const fresh = d.posts || [];
        setAllPosts((prev) => (p === 1 ? fresh : [...prev, ...fresh]));
        setHasMore(fresh.length === 10);
      } catch (err) {
        console.error("[Feed]", err.message);
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [actorReady, actor.user_id, actor.user_role],
  );

  // ── Unread notifications count ──────────────────────────────────────────────
  useEffect(() => {
    if (!actorReady) return;
    api(
      `/notifications/unread-count?user_id=${actor.user_id}&user_role=${encodeURIComponent(actor.user_role)}`,
    )
      .then((d) => setUnread(d.count || 0))
      .catch(() => {});
  }, [actorReady]);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    loadPosts(1);
  }, [loadPosts]);

  // ── Infinite scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingRef.current) {
          setPage((prev) => {
            const next = prev + 1;
            loadPosts(next);
            return next;
          });
        }
      },
      { threshold: 0.1 },
    );
    const el = loaderRef.current;
    if (el) obs.observe(el);
    return () => {
      if (el) obs.unobserve(el);
    };
  }, [hasMore, loadPosts]);

  if (!actorReady) return <LoadingScreen />;

  // ── Build feed: inject ReelsSection after 3rd regular post ─────────────────
  const buildFeedItems = () => {
    if (initialLoad) {
      return [0, 1, 2].map((i) => <PostSkeleton key={i} />);
    }

    const items = [];
    let reelsInjected = false;

    regularPosts.forEach((post, idx) => {
      items.push(
        <PostCard
          key={post.id}
          post={post}
          actor={actor}
          onDeleted={(id) => setAllPosts((p) => p.filter((x) => x.id !== id))}
          onUpdated={(id, updated) =>
            setAllPosts((p) => p.map((x) => (x.id === id ? updated : x)))
          }
        />,
      );
      // Inject reels section after 3rd regular post
      if (idx === 2 && reelPosts.length > 0 && !reelsInjected) {
        items.push(
          <ReelsSection key="reels-section" reels={reelPosts} actor={actor} />,
        );
        reelsInjected = true;
      }
    });

    // If fewer than 3 posts or reels not yet injected
    if (!reelsInjected && reelPosts.length > 0) {
      items.push(
        <ReelsSection key="reels-section" reels={reelPosts} actor={actor} />,
      );
    }

    return items;
  };

  return (
    <div className="min-h-screen">
      <FeedNavbar
        actor={actor}
        unread={unread}
        onBell={() => {
          setShowNotifs(true);
          setUnread(0);
        }}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">
          {/* ── Main feed column ── */}
          <div className="min-w-0 space-y-4">
            {/* Stories */}
            <div className="bg-white rounded-lg border px-4 py-4">
              <StoriesRow actor={actor} />
            </div>

            {/* Composer */}
            <Composer
              actor={actor}
              onPosted={() => {
                setPage(1);
                loadPosts(1);
              }}
            />

            {/* Posts + Reels injected */}
            {buildFeedItems()}

            {/* Infinite scroll sentinel */}
            <div
              ref={loaderRef}
              className="flex items-center justify-center py-6"
            >
              {loading && !initialLoad && (
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
              {!hasMore && allPosts.length > 0 && !loading && (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-px bg-gray-200" />
                  <p className="text-[13px] text-gray-400 font-medium">
                    You're all caught up ✓
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="hidden xl:block sticky top-20">
            <RightSidebar actor={actor} />
          </div>
        </div>
      </main>

      {showNotifs && (
        <NotificationsPanel
          actor={actor}
          onClose={() => setShowNotifs(false)}
        />
      )}
    </div>
  );
}
