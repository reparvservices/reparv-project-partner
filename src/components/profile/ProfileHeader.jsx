import { FiShare2 } from "react-icons/fi";
import { MdOutlineVerified } from "react-icons/md";
import { CgWebsite } from "react-icons/cg";
import { getImageURI } from "../../utils/helper";
import { useNavigate } from "react-router-dom";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 97.17%)";

function Skeleton({ className }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
  );
}

export default function ProfileHeader({
  user = {},
  loading = false,
  counts = {},
  onEdit,
  onBusinessDetails,
  onOpenSite,
}) {
  const navigate = useNavigate();
  const isProjectPartner = user?.role === "Project Partner";
  const avatarSrc = user?.userimage
    ? getImageURI(user.userimage)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullname || "U")}&background=5323DC&color=fff&size=150`;

  const handleShare = () => {
    const url = `https://www.reparv.in/project-partner/${user?.contact}`;
    if (navigator.share) {
      navigator.share({ title: user?.fullname, url });
    } else {
      navigator.clipboard?.writeText(url);
      alert("Profile link copied!");
    }
  };

  return (
    <div className="w-full flex items-start gap-4 sm:gap-6">
      <div className="w-full flex flex-col items-center sm:flex-row sm:items-start gap-5">
        {/* Avatar */}
        {loading ? (
          <Skeleton className="w-[100px] h-[100px] rounded-full flex-shrink-0" />
        ) : (
          <button
            onClick={onOpenSite}
            title="View public profile"
            className="w-[100px] h-[100px] p-1 rounded-full border border-gray-200 shadow-[0_0_0_2px_#00000014] flex-shrink-0 hover:ring-2 hover:ring-violet-400 transition-all cursor-pointer"
          >
            <img
              src={avatarSrc}
              alt={user?.fullname}
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullname || "U")}&background=5323DC&color=fff&size=150`;
              }}
              className="w-full h-full rounded-full object-cover"
            />
          </button>
        )}

        <div className="w-full flex flex-col items-center sm:items-start gap-2 sm:pr-5">
          {loading ? (
            <>
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64 mt-1" />
              <Skeleton className="h-4 w-40 mt-1" />
            </>
          ) : (
            <>
              {/* Name + verified */}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-semibold text-[#0F1724]">
                  {user?.fullname || "—"}
                </h1>
                {user?.status === "Active" && (
                  <MdOutlineVerified className="text-violet-600 w-6 h-6 shrink-0" />
                )}
              </div>

              {/* Role + username + website */}
              <p className="text-sm text-[#9CA3AF] flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                {user?.role && (
                  <span className="font-medium text-gray-600">{user.role}</span>
                )}
                {user?.username && (
                  <>
                    <span>·</span>
                    <span>@{user.username}</span>
                  </>
                )}
                {isProjectPartner && user?.contact && (
                  <button
                    onClick={onOpenSite}
                    className="flex items-center gap-1 text-[#5323DC] hover:underline"
                  >
                    <CgWebsite size={15} /> View Site
                  </button>
                )}
              </p>

              {/* Bio / contact */}
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500 text-center sm:text-left">
                {user?.email && <span>✉ {user.email}</span>}
                {user?.contact && <span>📞 {user.contact}</span>}
              </div>

              {/* Referral */}
              {user?.referral && (
                <p className="text-sm text-gray-500">
                  Referral:{" "}
                  <span className="font-bold text-[#5323DC]">
                    {user.referral}
                  </span>
                </p>
              )}
            </>
          )}

          {/* Stats */}
          <div className="flex gap-6 sm:gap-10 mt-2 sm:mt-4">
            {[
              [counts?.followers ?? "—", "Followers"],
              [counts?.following ?? "—", "Following"],
              [counts?.posts ?? "—", "Posts"],
            ].map(([v, l]) => (
              <div
                onClick={() => {
                  l == "Posts"
                    ? navigate("/app/feed")
                    : navigate("/app/network");
                }}
                key={l}
                className="text-center sm:text-left cursor-pointer"
              >
                <p className="text-sm font-semibold text-[#0F1724]">{v}</p>
                <p className="text-xs text-[#9CA3AF]">{l}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="w-full flex gap-3 justify-center sm:justify-start pt-3 flex-wrap">
            <button
              onClick={onEdit}
              className="px-4 sm:px-5 py-2 rounded-lg bg-violet-50 text-violet-600 text-sm font-medium hover:bg-violet-100 transition-colors active:scale-95"
            >
              Edit Profile
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors active:scale-95"
            >
              <FiShare2 size={16} />
            </button>
            <button
              onClick={() => {
                navigate("/app/feed");
              }}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-white text-sm font-medium shadow hover:opacity-90 transition-opacity active:scale-95"
              style={{ background: GRADIENT }}
            >
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path
                  d="M3.75 9H14.25M9 3.75V14.25"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Create Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
