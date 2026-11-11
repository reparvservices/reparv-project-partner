import { useAuth } from "../store/auth";
import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import SubscriptionOutlet from "../components/subscription/SubscriptionOutlet";
import { getLockState } from "../lib/subscriptionLock";
import { FiLock } from "react-icons/fi";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import reparvMainLogo from "../assets/layout/reparvMainLogo.svg";
import { useLocation } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { IoIosListBox } from "react-icons/io";
import { HiUsers } from "react-icons/hi2";
import { PiBuildingsFill } from "react-icons/pi";
import { FaUserTie, FaHandshake, FaTicket } from "react-icons/fa6";
import { BiSolidDiamond } from "react-icons/bi";
import { FaUserCircle } from "react-icons/fa";
import { IoMdMenu } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import {
  FiMoreHorizontal,
  FiBell,
  FiBookmark,
  FiPlus,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import {
  HiOutlineUserCircle,
  HiOutlineShieldCheck,
  HiOutlineChartBar,
} from "react-icons/hi";

export default function Layout() {
  const navigate = useNavigate();
  const { logout, role, user, subscription } = useAuth();
  // Lock icon for menu items the partner's plan doesn't unlock
  const isLocked = (to) => getLockState(subscription, to, role).locked;
  const { moreOpen, setMoreOpen } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const topMenu = [
    { label: "Feed", to: "/app/feed", icon: <AiFillHome size={18} /> },
    {
      label: "Dashboard",
      to: "/app/dashboard",
      icon: <MdDashboard size={18} />,
    },
    { label: "Community", to: "/app/community", icon: <HiUsers size={18} /> },
    {
      label: "Calendar",
      to: "/app/calendar",
      icon: <IoIosListBox size={18} />,
    },
  ];

  const middleMenu = [
    {
      label: "Builders",
      to: "/app/builders",
      icon: <PiBuildingsFill size={18} />,
      hide: user?.role !== "Project Partner",
    },
    {
      label: "Customers",
      to: "/app/customers",
      icon: <HiUsers size={18} />,
      hide: false,
    },
    {
      label: "Sales Partners",
      to: "/app/sales-partners",
      icon: <FaHandshake size={18} />,
      hide: user?.role !== "Project Partner",
    },
    {
      label: "Territory Partners",
      to: "/app/territory-partners",
      icon: <FaUserTie size={18} />,
      hide: user?.role !== "Project Partner",
    },
    {
      label: "Tickets",
      to: "/app/tickets",
      icon: <FaTicket size={18} />,
      hide: false,
    },
  ];

  const bottomMenu = [
    { label: "Profile", to: "/app/profile", icon: <FaUserCircle size={18} /> },
    {
      label: "Subscription",
      to: "/app/subscription",
      icon: <BiSolidDiamond size={18} />,
    },
  ];

  const dashboardPaths = [
    "/app/dashboard",
    "/app/properties",
    "/app/enquiries",
    "/app/employees",
  ];

  const linkClass = ({ isActive }, itemPath) => {
    const isCustomActive =
      dashboardPaths.includes(itemPath) &&
      dashboardPaths.some((path) => location.pathname.startsWith(path));

    return `flex items-center gap-3 px-4 py-2.5 rounded-full text-sm transition cursor-pointer
    ${
      isActive || isCustomActive
        ? "bg-[linear-gradient(93.29deg,#5E23DC_5.34%,#8B5CF6_102.64%)] text-white font-semibold shadow-sm"
        : "text-[#4B5563] hover:bg-gray-100"
    }`;
  };

  const mobileTabClass = ({ isActive }) =>
    `flex flex-col items-center text-[11px] cursor-pointer ${
      isActive ? "text-[#5323DC]" : "text-[#8F86A8]"
    }`;

  const userLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex h-screen bg-[#F6F7FB] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex !w-[260px] bg-white border-r flex-col h-screen">
        <div className="h-[100px] flex items-center justify-center pt-5">
          <img src={reparvMainLogo} className="h-13" />
        </div>

        <nav className="px-4 space-y-2 mt-2">
          {topMenu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={(props) => linkClass(props, item.to)}
            >
              {item.icon}
              {item.label}
              {isLocked(item.to) ? (
                <FiLock size={13} className="ml-auto opacity-70" aria-label="Locked" />
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="my-5 mx-6 h-[1px] bg-gray-200" />

        <nav className="px-4 space-y-2 flex-1 overflow-y-auto">
          {middleMenu
            .filter((item) => !item.hide)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={(props) => linkClass(props, item.to)}
              >
                {item.icon}
                {item.label}
                {isLocked(item.to) ? (
                  <FiLock size={13} className="ml-auto opacity-70" aria-label="Locked" />
                ) : null}
              </NavLink>
            ))}
        </nav>

        <div className="my-5 mx-6 h-[1px] bg-gray-200" />

        <nav className="px-4 space-y-2 tall:flex-1 pb-2">
          {bottomMenu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={(props) => linkClass(props, item.to)}
            >
              {item.icon}
              {item.label}
              {isLocked(item.to) ? (
                <FiLock size={13} className="ml-auto opacity-70" aria-label="Locked" />
              ) : null}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setMoreOpen(true)}
          className="mx-4 mb-4 mt-2 flex items-center gap-3 px-4 py-2.5 rounded-full text-sm text-[#7C3AED] hover:bg-[#F3EDFF] cursor-pointer"
        >
          <IoMdMenu className="w-5 h-5" />
          More
        </button>
      </aside>

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
              <div className="h-[100px] flex items-center justify-center pt-5">
                <img src={reparvMainLogo} className="h-13" />
              </div>

              <nav className="px-4 space-y-2 mt-2">
                {topMenu.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={(props) => linkClass(props, item.to)}
                  >
                    {item.icon}
                    {item.label}
                    {isLocked(item.to) ? (
                      <FiLock size={13} className="ml-auto opacity-70" aria-label="Locked" />
                    ) : null}
                  </NavLink>
                ))}
              </nav>

              <div className="my-5 mx-6 h-[1px] bg-gray-200" />

              <nav className="px-4 space-y-2 flex-1 overflow-y-auto">
                {middleMenu
                  .filter((item) => !item.hide)
                  .map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={(props) => linkClass(props, item.to)}
                    >
                      {item.icon}
                      {item.label}
                      {isLocked(item.to) ? (
                        <FiLock size={13} className="ml-auto opacity-70" aria-label="Locked" />
                      ) : null}
                    </NavLink>
                  ))}
              </nav>

              <div className="my-5 mx-6 h-[1px] bg-gray-200" />

              <nav className="px-4 space-y-2 tall:flex-1 pb-2">
                {bottomMenu.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={(props) => linkClass(props, item.to)}
                  >
                    {item.icon}
                    {item.label}
                    {isLocked(item.to) ? (
                      <FiLock size={13} className="ml-auto opacity-70" aria-label="Locked" />
                    ) : null}
                  </NavLink>
                ))}
              </nav>

              {/* MORE BUTTON */}
              <button
                onClick={() => setMoreOpen(true)}
                className="mx-4 mb-4 mt-2 flex items-center gap-3 px-4 py-2.5 rounded-full text-sm text-[#7C3AED] hover:bg-[#F3EDFF]"
              >
                <IoMdMenu className="w-5 h-5" />
                More
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 bg-[radial-gradient(98.95%_98.95%_at_50%_1.05%,_#EEEAFF_0%,_#FFFFFF_36.12%)]">
        {/* Locks pages the partner's plan doesn't include */}
          <motion.main
          className="flex-1 scroll-container overflow-y-auto pb-25 md:pb-0"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SubscriptionOutlet />
        </motion.main>
        

        {/* Mobile Bottom Bar */}
        <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t z-40">
          <div className="flex items-center justify-around h-18">
            <NavLink to="/app/feed" className={mobileTabClass}>
              <AiFillHome size={20} />
              Feed
            </NavLink>

            <NavLink to="/app/dashboard" className={mobileTabClass}>
              <MdDashboard size={20} />
              Dashboard
            </NavLink>

            <NavLink
              to={
                user?.role === "Project Partner"
                  ? "/app/property/add"
                  : "/app/enquiry/add"
              }
              className={
                "w-14 h-14 flex items-center justify-center -mt-10 bg-[#5323DC] text-white border-4 border-[#F3F0FF] rounded-full shadow-[0px_4px_10px_0px_#7C3AED66]"
              }
            >
              <FaPlus size={20} />
            </NavLink>

            <NavLink to="/app/calendar" className={mobileTabClass}>
              <IoIosListBox size={20} />
              Calendar
            </NavLink>

            <NavLink to="/app/profile" className={mobileTabClass}>
              <FaUserCircle size={20} />
              Profile
            </NavLink>
          </div>
        </nav>
      </div>

      {/* MORE PANEL */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />

            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="fixed bottom-24 left-4 right-4 md:left-[280px] md:w-[320px] bg-white rounded-2xl shadow-2xl z-[60] p-5"
            >
              <h4 className="text-xs text-gray-400 mb-3">QUICK ACTIONS</h4>

              <div className="space-y-3">
                <Link
                  to="/app/feed"
                  onClick={() => {
                    setMoreOpen(false);
                  }}
                  className="flex gap-3 items-center w-full p-2 rounded-lg hover:bg-gray-100"
                >
                  <FiPlus /> Create Post
                </Link>
                <Link
                  to="/app/notifications"
                  onClick={() => {
                    setMoreOpen(false);
                  }}
                  className="flex gap-3 items-center w-full p-2 rounded-lg hover:bg-gray-100"
                >
                  <FiBell /> Notifications
                </Link>
                <button className="hidden lex gap-3 items-center w-full p-2 rounded-lg hover:bg-gray-100">
                  <FiBookmark /> Saved
                </button>
              </div>

              <h4 className="text-xs text-gray-400 mt-5 mb-3">MANAGEMENT</h4>

              <div className="space-y-3">
                <Link to="/app/edit-profile"
                  onClick={() => {
                    setMoreOpen(false);
                  }}
                  className="flex gap-3 items-center w-full p-2 rounded-lg hover:bg-gray-100">
                  <FiSettings /> Settings
                </Link>
                <Link
                  to="/app/profile"
                  onClick={() => {
                    setMoreOpen(false);
                  }}
                  className="flex gap-3 items-center w-full p-2 rounded-lg hover:bg-gray-100"
                >
                  <HiOutlineUserCircle /> Profile
                </Link>
                <button className="hidden gap-3 items-center w-full p-2 rounded-lg hover:bg-gray-100">
                  <HiOutlineShieldCheck /> Permissions
                </button>
                <button className="hidden gap-3 items-center w-full p-2 rounded-lg hover:bg-gray-100">
                  <HiOutlineChartBar /> Reports
                </button>
                <button
                  onClick={userLogout}
                  className="flex gap-3 items-center w-full p-2 rounded-lg text-red-500 hover:bg-red-50"
                >
                  <FiLogOut /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
