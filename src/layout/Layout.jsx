import { useAuth } from "../store/auth";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import SubscriptionOutlet from "../components/subscription/SubscriptionOutlet";
import { getLockState } from "../lib/subscriptionLock";
import { FiLock, FiSettings, FiPlus, FiLogOut } from "react-icons/fi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import reparvMainLogo from "../assets/layout/reparvMainLogo.svg";
import { MdDashboard } from "react-icons/md";
import { PiBuildingsFill } from "react-icons/pi";
import { FaHandshake, FaTicket } from "react-icons/fa6";
import { BiSolidDiamond, BiMessageRoundedDots } from "react-icons/bi";
import { FaUserCircle } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { HiUsers } from "react-icons/hi2";
import { FaPlus } from "react-icons/fa";

// Sidebar, top to bottom. Each inner array is one group; a divider sits between groups.
function buildSections(user) {
  const isProjectPartner = user?.role === "Project Partner";
  const isSales = user?.role === "Sales Partner";
  return [
    [
      { label: "Dashboard", to: "/app/dashboard", icon: <MdDashboard size={18} /> },
    ],
    [
      // A project partner manages properties; a sales partner works the enquiries assigned to them
      { label: "Properties", to: "/app/properties", icon: <PiBuildingsFill size={18} />, hide: !isProjectPartner },
      { label: "Enquiries", to: "/app/enquiries", icon: <BiMessageRoundedDots size={18} />, hide: isProjectPartner },
    ],
    [
      {
        label: "Sales Partners",
        to: "/app/sales-partners",
        icon: <FaHandshake size={18} />,
        hide: !isProjectPartner,
      },
    ],
    [
      { label: "Feed", to: "/app/feed", icon: <AiFillHome size={18} /> },
      { label: "Community", to: "/app/community", icon: <HiUsers size={18} /> },
      { label: "Tickets", to: "/app/tickets", icon: <FaTicket size={18} /> },
    ],
    [
      { label: "Profile", to: "/app/profile", icon: <FaUserCircle size={18} /> },
      // A sales partner works under their project partner's plan: no subscription of their own
      { label: "Subscription", to: "/app/subscription", icon: <BiSolidDiamond size={18} />, hide: isSales },
      { label: "Settings", to: "/app/settings", icon: <FiSettings size={18} /> },
    ],
  ];
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user, subscription } = useAuth();
  // Lock icon for menu items the partner's plan doesn't unlock
  const isLocked = (to) => getLockState(subscription, to, role).locked;
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections = buildSections(user);

  // Highlight only the item whose route is active (sub-pages like /app/properties/:id keep their parent highlighted).
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-full text-sm transition cursor-pointer
    ${
      isActive
        ? "bg-[linear-gradient(93.29deg,#5E23DC_5.34%,#8B5CF6_102.64%)] text-white font-semibold shadow-sm"
        : "text-[#4B5563] hover:bg-gray-100"
    }`;

  const mobileTabClass = ({ isActive }) =>
    `flex flex-col items-center text-[11px] cursor-pointer ${
      isActive ? "text-[#5323DC]" : "text-[#8F86A8]"
    }`;

  const renderSidebar = (onNavigate) => (
    <>
      <div className="h-[100px] flex items-center justify-center pt-5">
        <img src={reparvMainLogo} className="h-13" alt="Reparv" />
      </div>

      <nav className="px-4 flex-1 overflow-y-auto">
        {sections.map((group, index) => {
          const visible = group.filter((item) => !item.hide);
          if (visible.length === 0) return null;
          return (
            <div key={index}>
              {index > 0 && <div className="my-3 mx-2 h-[1px] bg-gray-200" />}
              <div className="space-y-1.5">
                {visible.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={(props) => linkClass(props, item.to)}
                  >
                    {item.icon}
                    {item.label}
                    {isLocked(item.to) ? (
                      <FiLock size={13} className="ml-auto opacity-70" aria-label="Locked" />
                    ) : null}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex h-screen bg-[#F6F7FB] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex !w-[260px] bg-white border-r flex-col h-screen">
        {renderSidebar(undefined)}
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />

            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="fixed md:hidden left-0 top-0 bottom-0 w-[260px] bg-white border-r z-50 flex flex-col h-screen"
            >
              {renderSidebar(() => setMobileOpen(false))}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 bg-[radial-gradient(98.95%_98.95%_at_50%_1.05%,_#EEEAFF_0%,_#FFFFFF_36.12%)]">
        <motion.main
          className="flex-1 scroll-container overflow-y-auto pb-25 md:pb-0"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SubscriptionOutlet />
        </motion.main>

        {/* Mobile bottom bar */}
        <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t z-40">
          <div className="flex items-center justify-around h-18">
            <NavLink to="/app/dashboard" className={mobileTabClass}>
              <MdDashboard size={20} />
              Dashboard
            </NavLink>

            {user?.role === "Project Partner" ? (
              <NavLink to="/app/properties" className={mobileTabClass}>
                <PiBuildingsFill size={20} />
                Properties
              </NavLink>
            ) : (
              <NavLink to="/app/enquiries" className={mobileTabClass}>
                <BiMessageRoundedDots size={20} />
                Enquiries
              </NavLink>
            )}

            <NavLink
              to={
                user?.role === "Project Partner"
                  ? "/app/property/add"
                  : "/app/enquiries"
              }
              className="w-14 h-14 flex items-center justify-center -mt-10 bg-[#5323DC] text-white border-4 border-[#F3F0FF] rounded-full shadow-[0px_4px_10px_0px_#7C3AED66]"
            >
              <FaPlus size={20} />
            </NavLink>

            <NavLink to="/app/feed" className={mobileTabClass}>
              <AiFillHome size={20} />
              Feed
            </NavLink>

            <NavLink to="/app/profile" className={mobileTabClass}>
              <FaUserCircle size={20} />
              Profile
            </NavLink>
          </div>
        </nav>
      </div>
    </div>
  );
}
