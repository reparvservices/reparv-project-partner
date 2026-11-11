import { useState, useEffect } from "react";
import { useAuth } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getApiPrefixForRole } from "../lib/partnerAuth";
import { getLockState } from "../lib/subscriptionLock";

// ── Icons (inline SVG components to avoid extra deps) ──────────────────────
const QRIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect
      x="3"
      y="3"
      width="7"
      height="7"
      rx="1"
      stroke="#333"
      strokeWidth="1.5"
    />
    <rect x="5" y="5" width="3" height="3" fill="#333" />
    <rect
      x="14"
      y="3"
      width="7"
      height="7"
      rx="1"
      stroke="#333"
      strokeWidth="1.5"
    />
    <rect x="16" y="5" width="3" height="3" fill="#333" />
    <rect
      x="3"
      y="14"
      width="7"
      height="7"
      rx="1"
      stroke="#333"
      strokeWidth="1.5"
    />
    <rect x="5" y="16" width="3" height="3" fill="#333" />
    <rect x="14" y="14" width="3" height="3" fill="#333" />
    <rect x="19" y="14" width="2" height="2" fill="#333" />
    <rect x="14" y="19" width="2" height="2" fill="#333" />
    <rect x="17" y="17" width="2" height="2" fill="#333" />
    <rect x="19" y="19" width="2" height="2" fill="#333" />
  </svg>
);

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 18l6-6-6-6"
      stroke="#C0C0C8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.73 21a2 2 0 0 1-3.46 0"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M12 20h9"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="2"
      stroke="#6C5CE7"
      strokeWidth="1.8"
    />
    <line x1="2" y1="10" x2="22" y2="10" stroke="#6C5CE7" strokeWidth="1.8" />
  </svg>
);

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="9" cy="7" r="4" stroke="#6C5CE7" strokeWidth="1.8" />
    <path
      d="M23 21v-2a4 4 0 0 0-3-3.87"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M16 3.13a4 4 0 0 1 0 7.75"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 21h18M9 8h1m-1 4h1m4-4h1m-1 4h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HandshakeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l1.06 1.06L12 21.23l7.36-7.94 1.06-1.06a5.4 5.4 0 0 0 0-7.65z"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <polygon
      points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="8" y1="2" x2="8" y2="18" stroke="#6C5CE7" strokeWidth="1.8" />
    <line x1="16" y1="6" x2="16" y2="22" stroke="#6C5CE7" strokeWidth="1.8" />
  </svg>
);

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polyline
      points="9 22 9 12 15 12 15 22"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HelpCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="#6C5CE7" strokeWidth="1.8" />
    <path
      d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="12"
      y1="17"
      x2="12.01"
      y2="17"
      stroke="#6C5CE7"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const UserCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="8.5" cy="7" r="4" stroke="#6C5CE7" strokeWidth="1.8" />
    <polyline
      points="17 11 19 13 23 9"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TicketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      stroke="#6C5CE7"
      strokeWidth="1.8"
    />
    <line
      x1="16"
      y1="2"
      x2="16"
      y2="6"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="8"
      y1="2"
      x2="8"
      y2="6"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line x1="3" y1="10" x2="21" y2="10" stroke="#6C5CE7" strokeWidth="1.8" />
  </svg>
);

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <polygon
      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="2"
      stroke="#6C5CE7"
      strokeWidth="1.8"
    />
    <line x1="2" y1="10" x2="22" y2="10" stroke="#6C5CE7" strokeWidth="1.8" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke="#6C5CE7" strokeWidth="1.8" />
    <path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke="#6C5CE7"
      strokeWidth="1.8"
    />
  </svg>
);

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="18" cy="5" r="3" stroke="#6C5CE7" strokeWidth="1.8" />
    <circle cx="6" cy="12" r="3" stroke="#6C5CE7" strokeWidth="1.8" />
    <circle cx="18" cy="19" r="3" stroke="#6C5CE7" strokeWidth="1.8" />
    <line
      x1="8.59"
      y1="13.51"
      x2="15.42"
      y2="17.49"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="15.41"
      y1="6.51"
      x2="8.59"
      y2="10.49"
      stroke="#6C5CE7"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const LogOutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
      stroke="#E74C3C"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polyline
      points="16 17 21 12 16 7"
      stroke="#E74C3C"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="21"
      y1="12"
      x2="9"
      y2="12"
      stroke="#E74C3C"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

// ── Menu Item Component ────────────────────────────────────────────────────
function MenuItem({ icon, label, subtitle, onClick, danger = false, locked = false }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#F6F7FB] transition-colors duration-150 group cursor-pointer"
    >
      <span className="w-10 h-10 rounded-xl bg-[#EEE9FF] flex items-center justify-center flex-shrink-0">
        {icon}
      </span>
      <span className="flex-1 text-left">
        <span
          className={`block text-[15px] font-medium leading-tight ${danger ? "text-[#E74C3C]" : "text-[#1A1A2E]"}`}
        >
          {label}
          {locked && (
            <span className="ml-2 inline-flex items-center gap-1 align-middle text-[10px] font-semibold text-[#5E23DC] bg-[#F1EBFF] px-2 py-[2px] rounded-full">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              Upgrade
            </span>
          )}
        </span>
        {subtitle && (
          <span className="block text-[12px] text-[#9898A6] mt-0.5">
            {subtitle}
          </span>
        )}
      </span>
      <ChevronRight />
    </button>
  );
}

// ── Section Component ──────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] font-semibold text-[#9898A6] tracking-widest uppercase px-1 mb-2">
        {title}
      </p>
      <div className="bg-white rounded-2xl overflow-hidden divide-y divide-[#F0F0F5]">
        {children}
      </div>
    </div>
  );
}

// ── Main Menu Page ─────────────────────────────────────────────────────────
export default function Menu() {
  const { URI, logout, user: authUser, subscription, role } = useAuth();
  // Locked items open the plans page instead of a page the plan doesn't include
  const go = (path) => {
    const locked = getLockState(subscription, path, role).locked;
    navigate(locked ? "/app/subscription/compare-plans" : path);
  };
  const lockedFor = (path) => getLockState(subscription, path, role).locked;
  const navigate = useNavigate();

  const [user, setUser] = useState({
    fullname: "",
    username: "",
    role: "",
    company: "",
    userimage: "",
    id: "",
  });
  const [fetching, setFetching] = useState(true);

  const profilePrefix = getApiPrefixForRole(authUser?.role);

  const fetchProfile = async () => {
    if (!authUser?.id) return;
    try {
      setFetching(true);
      const r = await fetch(`${URI}${profilePrefix}/profile`, {
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

  useEffect(() => {
    fetchProfile();
  }, [authUser?.id, authUser?.role, URI]);

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] font-sans">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 px-5 md:px-8 py-4 border-b border-gray-100 bg-white">
        <button
          onClick={() => {
            navigate(-1);
          }}
          className="p-1.5 rounded-[6px] hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-800" strokeWidth={2.2} />
        </button>
        <h1 className="text-[17px] font-extrabold text-gray-900">Menu</h1>
        <button
          onClick={() =>
            window.open(
              "https://play.google.com/store/apps/details?id=com.reparvprojectpartner",
              "_blank",
            )
          }
          className="w-9 h-9 flex items-center justify-center"
        >
          <QRIcon />
        </button>
      </div>

      <div className="px-4 pt-4 pb-24 bg-[#F6F4FB] ">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-5 mb-4 flex flex-col items-center text-center shadow-sm">
          {fetching ? (
            <div className="w-20 h-20 rounded-full bg-[#EEE9FF] animate-pulse mb-3" />
          ) : (
            <img
              src={
                user.userimage ||
                "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(user.fullname || "User") +
                  "&background=6C5CE7&color=fff&size=128"
              }
              alt={user.fullname}
              className="w-20 h-20 rounded-full object-cover mb-3 ring-4 ring-[#EEE9FF]"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || "User")}&background=6C5CE7&color=fff&size=128`;
              }}
            />
          )}

          {fetching ? (
            <>
              <div className="h-5 w-32 bg-[#F0F0F5] rounded animate-pulse mb-2" />
              <div className="h-4 w-48 bg-[#F0F0F5] rounded animate-pulse" />
            </>
          ) : (
            <>
              <h2 className="text-[17px] font-bold text-[#1A1A2E] mb-1.5">
                {user.fullname || "Your Name"}
              </h2>
              <div className="flex items-center gap-2 mb-4">
                {user.role && (
                  <span className="bg-[#5323DC] text-white text-[10px] font-semibold px-3 py-1 rounded-xl uppercase tracking-wide">
                    {user.role}
                  </span>
                )}
                {user.company && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-[#C0C0C8]" />
                    <span className="text-[13px] text-[#6C6C80]">
                      {user.company}
                    </span>
                  </>
                )}
              </div>
            </>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={() => navigate("/app/profile")}
              className="flex-1 bg-[#5323DC] text-white text-[14px] font-semibold py-2.5 rounded-md hover:bg-[#5323DC] transition-colors"
            >
              View Profile
            </button>
            <button
              onClick={() => navigate("/app/edit-profile")}
              className="flex-1 border border-[#E0E0EA] text-[#1A1A2E] text-[14px] font-semibold py-2.5 rounded-md hover:bg-[#F6F7FB] transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-4 overflow-x-auto pb-1 no-scrollbar scrollbar-hide">
          {[
            {
              icon: <BellIcon />,
              label: "Notifications",
              path: "/app/notifications",
            },
            {
              icon: <PenIcon />,
              label: "Create Post",
              path: "/app/feed",
            },
            {
              icon: <CardIcon />,
              label: "Subscription",
              path: "/app/subscription",
            },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl text-[13px] font-medium text-[#1A1A2E] whitespace-nowrap border border-[#F0F0F5] hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-all flex-shrink-0 shadow-sm"
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* NETWORK & CRM */}
        <Section title="Network & CRM">
          <MenuItem
            icon={<UsersIcon />}
            label="Customers"
            subtitle="Manage client database"
            onClick={() => go("/app/customers")}
            locked={lockedFor("/app/customers")}
          />
          <MenuItem
            icon={<BuildingIcon />}
            label="Builders"
            onClick={() => go("/app/builders")}
            locked={lockedFor("/app/builders")}
          />
          <MenuItem
            icon={<HandshakeIcon />}
            label="Sales Partners"
            onClick={() => go("/app/sales-partners")}
            locked={lockedFor("/app/sales-partners")}
          />
          <MenuItem
            icon={<MapIcon />}
            label="Territory Partners"
            onClick={() => go("/app/territory-partners")}
            locked={lockedFor("/app/territory-partners")}
          />
        </Section>

        {/* BUSINESS MODULES */}
        <Section title="Business Modules">
          <MenuItem
            icon={<HomeIcon />}
            label="Properties"
            subtitle="Listings & Inventory"
            onClick={() => go("/app/properties")}
            locked={lockedFor("/app/properties")}
          />
          <MenuItem
            icon={<HelpCircleIcon />}
            label="Enquiries"
            onClick={() => go("/app/enquiries")}
            locked={lockedFor("/app/enquiries")}
          />
          <MenuItem
            icon={<TicketIcon />}
            label="Tickets"
            onClick={() => navigate("/app/tickets")}
          />
        </Section>

        {/* OPERATIONS */}
        <Section title="Operations">
          <MenuItem
            icon={<CalendarIcon />}
            label="Calendar"
            onClick={() => go("/app/calendar")}
            locked={lockedFor("/app/calendar")}
          />
          <MenuItem
            icon={<StarIcon />}
            label="Add Event"
            onClick={() => go("/app/calendar/event/add")}
            locked={lockedFor("/app/calendar/event/add")}
          />
          <MenuItem
            icon={<MessageIcon />}
            label="Community"
            onClick={() => go("/app/community")}
            locked={lockedFor("/app/community")}
          />
        </Section>

        {/* ACCOUNT & SETTINGS */}
        <Section title="Account & Settings">
          <MenuItem
            icon={<CreditCardIcon />}
            label="Subscription Plan"
            onClick={() => navigate("/app/subscription")}
          />
          {/*<MenuItem
            icon={<SettingsIcon />}
            label="Settings"
            onClick={() => navigate("/app/settings")}
          />*/}
          <MenuItem
            icon={<ShareIcon />}
            label="Invite Friends"
            onClick={() => navigate("/app/invite")}
          />
          {/* Log Out — danger style */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#FFF5F5] transition-colors duration-150"
          >
            <span className="w-10 h-10 rounded-xl bg-[#FFF0EE] flex items-center justify-center flex-shrink-0">
              <LogOutIcon />
            </span>
            <span className="flex-1 text-left text-[15px] font-medium text-[#E74C3C]">
              Log Out
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18l6-6-6-6"
                stroke="#E74C3C"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </Section>
      </div>
    </div>
  );
}
