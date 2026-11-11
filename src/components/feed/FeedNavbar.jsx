// components/feed/FeedNavbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { getImageURI } from "../../utils/helper";
import { Icon } from "./FeedPrimitives";
import { FiMenu } from "react-icons/fi";

export default function FeedNavbar({ actor, unread, onBell }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-white backdrop-blur-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate("/app/menu")}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <FiMenu className="text-2xl text-gray-700" />
          </button>
          <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">
            Reparv Feed
          </span>
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-sm">
          <div className="relative w-full">
            <Icon
              name="search"
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search posts, people, projects…"
              className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-violet-200 transition-all"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <button className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
            <Icon name="search" size={20} />
          </button>
          <button
            onClick={onBell}
            className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Icon name="bell" size={20} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white animate-pulse" />
            )}
          </button>
          <Link
            to="/app/profile"
            className="ml-1 w-8 h-8 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ring-2 ring-violet-200"
          >
            <img
              src={getImageURI(actor?.user?.userImage)}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
