import { FiSearch, FiBell, FiLogOut, FiMenu } from "react-icons/fi";
import { useAuth } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import { getImageURI } from "../../utils/helper";

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="w-full flex items-center justify-between py-3 md:py-4 bg-white md:bg-transparent px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/app/menu")}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <FiMenu className="text-2xl text-gray-700" />
        </button>

        <h1 className="hidden md:block text-2xl font-semibold text-gray-900">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="relative hidden md:block">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="pl-10 pr-4 py-2 w-72 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-violet-400 transition-colors text-sm"
            placeholder="Search anything..."
          />
        </div>

        <button
          type="button"
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
        >
          <FiSearch className="text-2xl text-gray-700" />
        </button>

        <button
          type="button"
          className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <FiBell className="text-2xl text-gray-700" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <img
          onClick={() => navigate("/app/profile")}
          src={getImageURI(user?.userImage || user?.userimage)}
          alt="avatar"
          className="hidden md:block w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-gray-100 hover:border-violet-400 transition-colors"
        />

        {user?.id && (
          <FiLogOut
            onClick={userLogout}
            className="hidden md:block w-6 h-6 text-gray-500 cursor-pointer hover:text-red-500 transition-colors"
          />
        )}
      </div>
    </header>
  );
}
