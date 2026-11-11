import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import MobileTopBar from "../../components/profile/MobileTopBar";
import ProfileHeader from "../../components/profile/ProfileHeader";
import PostsGrid from "../../components/profile/PostsGrid";
import SuggestedPartners from "../../components/profile/SuggestedPartners";
import PlatformUpdates from "../../components/profile/PlatformUpdates";
import ProfileCompletion from "../../components/profile/ProfileCompletion";

export default function Profile() {
  const { URI, setLoading, role } = useAuth();
  const navigate = useNavigate();
  const isProjectPartner = role === "Project Partner";
  const store = useAuth();

  const [user, setUser] = useState({
    fullname: "",
    username: "",
    email: "",
    contact: "",
    role: "",
    referral: "",
    userimage: "",
    id: "",
    status: "",
  });
  const [fetching, setFetching] = useState(true);
  const [counts, setCounts] = useState({
    followers: 0,
    following: 0,
    posts: 0,
  });

  const getBasePath = () => {
    if (role === "Project Partner") return "/project-partner";
    if (role === "Territory Partner") return "/territory-partner";
    return "/sales"; // Sales Partner
  };

  /* ── fetch profile (same as old code) ── */
  const fetchProfile = async () => {
    try {
      setFetching(true);
      const r = await fetch(`${URI}${getBasePath()}/profile`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!r.ok) throw new Error(`Error ${r.status}`);
      setUser(await r.json());
    } catch (e) {
      console.error("Error fetching profile:", e);
    } finally {
      setFetching(false);
    }
  };

  const fApi = async (path, opts = {}) => {
    const res = await fetch(`${URI}/api/follow${path}`, {
      headers: { "Content-Type": "application/json" },
      ...opts,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Request failed");
    return data;
  };

  // ── Load counts ───────────────────────────────────────────────────────────
  const loadCounts = useCallback(async () => {
    try {
      const d = await fApi(
        `/counts?user_id=${store?.user?.id}&user_role=${encodeURIComponent(store?.user?.role)}`,
      );
      setCounts({ followers: d.followers, following: d.following });
    } catch {}
  }, [store?.user, role]);

  const api = async (path) => {
    const API_BASE = import.meta.env.VITE_BACKEND_URL + "/api/feed";

    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Request failed");

    return data;
  };

  const parseMedia = (raw) => {
    try {
      return JSON.parse(raw || "[]");
    } catch {
      return raw ? [raw] : [];
    }
  };

  const isVideoUrl = (url = "") =>
  /\.(mp4|webm|mov)/i.test(url) || url.includes("video");

  useEffect(() => {
    if (!user?.id || !role) return;

    api(
      `/posts/my?user_id=${user.id}&user_role=${encodeURIComponent(role)}&page=1&limit=30`,
    )
      .then((d) => {
        // FIX: use d.data (NOT d.posts)
        const posts = d.posts || [];
        console.log("POST", posts.length);
        const imagePosts = posts.filter((p) => {
          const media = parseMedia(p.media_urls);
          if (!media.length) return true;
          return media.some((url) => !isVideoUrl(url));
        });

        // FIX: use functional update (avoid overwrite bug)
        setCounts((prev) => ({
          ...prev,
          posts: imagePosts.length || 0,
        }));
        console.log("len", imagePosts.length);
      })
      .catch((err) => {
        console.error("Posts count error:", err.message);
      })
      .finally(() => setLoading(false));
  }, [user?.id, role]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <MobileTopBar />
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-[1fr_300px]">
        {/* Main */}
        <div className="w-full bg-white p-4 sm:p-8 sm:pr-0 shadow-sm sm:border-r">
          {isProjectPartner && !fetching ? (
            <ProfileCompletion
              key={user?.updated_at || user?.id}
              user={user}
              onSaved={fetchProfile}
            />
          ) : null}
          <ProfileHeader
            user={user}
            loading={fetching}
            counts={counts}
            onEdit={() => navigate("/app/edit-profile")}
            onBusinessDetails={() => navigate(`/business-details/${user?.id}`)}
            onOpenSite={() =>
              user?.contact &&
              window.open(
                `https://www.reparv.in/project-partner/${user.contact}`,
                "_blank",
              )
            }
          />
          <PostsGrid />
        </div>
        {/* Sidebar */}
        <aside className="hidden xl:flex flex-col bg-white">
          <SuggestedPartners />
          <PlatformUpdates />
        </aside>
      </div>
    </div>
  );
}
