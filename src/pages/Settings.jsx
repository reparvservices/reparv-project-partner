import { Link, useNavigate } from "react-router-dom";
import { FiLogOut, FiUser, FiBell, FiUsers, FiChevronRight } from "react-icons/fi";
import { useAuth } from "../store/auth";

const SETTINGS_LINKS = [
  { label: "Edit profile", description: "Name, photo, contact and business details", to: "/app/edit-profile", icon: FiUser },
  { label: "Notifications", description: "Enquiries, bookings and account alerts", to: "/app/notifications", icon: FiBell },
  { label: "Invite & refer", description: "Share Reparv with other partners", to: "/app/invite", icon: FiUsers },
];

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8 md:px-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your account and preferences</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 cursor-pointer"
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </header>

      <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {SETTINGS_LINKS.map(({ label, description, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#F6F3FF]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3EDFF] text-[#5E23DC]">
              <Icon size={18} />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-gray-900">{label}</span>
              <span className="block text-xs text-gray-500">{description}</span>
            </span>
            <FiChevronRight className="text-gray-400" size={18} />
          </Link>
        ))}
      </div>
    </div>
  );
}
