import { FiMenu, FiSearch, FiBell } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function MobileTopBar({ onMenuClick }) {
  return (
    <div className="md:hidden sticky top-0 z-50 bg-white border-b-2">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/app/menu"
          className="w-10 h-10 flex items-center justify-center rounded-xl border bg-gray-50 active:scale-95 transition">
          <FiMenu className="text-xl text-gray-700" />
        </Link>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 flex items-center justify-center rounded-xl border bg-gray-50 active:scale-95 transition">
            <FiSearch className="text-lg text-gray-600" />
          </button>
          <Link to="/app/notifications" className="relative w-10 h-10 flex items-center justify-center rounded-xl border bg-gray-50 active:scale-95 transition">
            <FiBell className="text-lg text-gray-700" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </Link>
        </div>
      </div>
    </div>
  );
}