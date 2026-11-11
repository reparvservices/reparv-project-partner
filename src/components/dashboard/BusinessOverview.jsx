import { FiChevronRight, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { getLockState } from "../../lib/subscriptionLock";
/**
 * BusinessOverview
 * Props:
 *   counts : object — from API /project-partner/dashboard/count
 *
 * Renders 8 clickable cards navigating to their respective routes.
 * Matches old dashboard logic: Properties, Customers, Enquiries,
 * Builders, Employees, Sales Partners, Territory Partners, Tickets.
 */
export default function BusinessOverview({ counts = {} }) {
  const navigate = useNavigate();
  const { user, subscription, role } = useAuth();
  const isProjectPartner = user?.role === "Project Partner";
  // Same rule as the page lock: plan must include the page's feature
  const isLocked = (route) => getLockState(subscription, route, role).locked;

  const items = [
    {
      label: "Properties",
      value: counts?.totalProperty,
      route: "/app/properties",
      hide: !isProjectPartner,
      icon: (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#F0F9FF" />
          <path
            d="M16.5 18H19.5M16.5 15H19.5M19.5 24.75V22.5C19.5 21.6721 18.8279 21 18 21C17.1721 21 16.5 21.6721 16.5 22.5V24.75"
            stroke="#0284C7"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.5 16.5H12C11.1721 16.5 10.5 17.1721 10.5 18V23.25C10.5 24.0779 11.1721 24.75 12 24.75H24C24.8279 24.75 25.5 24.0779 25.5 23.25V15.75C25.5 14.9221 24.8279 14.25 24 14.25H22.5"
            stroke="#0284C7"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.5 24.75V12.75C13.5 11.9221 14.1721 11.25 15 11.25H21C21.8279 11.25 22.5 11.9221 22.5 12.75V24.75"
            stroke="#0284C7"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Customers",
      value: counts?.totalCustomer,
      route: "/app/customers",
      hide: false,
      icon: (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#F0FDF4" />
          <path
            d="M21 24.7497V23.2497C21 21.594 19.6557 20.2497 18 20.2497H13.5C11.8443 20.2497 10.5 21.594 10.5 23.2497V24.7497M21 11.3457C22.3232 11.6887 23.2471 12.8828 23.2471 14.2497C23.2471 15.6166 22.3232 16.8107 21 17.1537M25.5 24.7497V23.2497C25.499 21.8825 24.5737 20.689 23.25 20.3472"
            stroke="#16A34A"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.75 14.25C12.75 15.9057 14.0943 17.25 15.75 17.25C17.4057 17.25 18.75 15.9057 18.75 14.25C18.75 12.5943 17.4057 11.25 15.75 11.25C14.0943 11.25 12.75 12.5943 12.75 14.25"
            stroke="#16A34A"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Enquiries",
      value: counts?.totalEnquirer,
      route: "/app/enquiries",
      hide: false,
      icon: (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#FFF7ED" />
          <path
            d="M25.5 21.75C25.5 22.5779 24.8279 23.25 24 23.25H14.121C13.7232 23.2501 13.3417 23.4082 13.0605 23.6895L11.409 25.341C11.2567 25.4933 11.0277 25.5388 10.8287 25.4564C10.6298 25.374 10.5 25.1799 10.5 24.9645V12.75C10.5 11.9221 11.1721 11.25 12 11.25H24C24.8279 11.25 25.5 11.9221 25.5 12.75V21.75"
            stroke="#EA580C"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Builders",
      value: counts?.totalBuilder,
      route: "/app/builders",
      hide: !isProjectPartner,
      icon: (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#FEF2F2" />
          <path
            d="M16.5 16.5V12.75C16.5 12.3361 16.8361 12 17.25 12H18.75C19.1639 12 19.5 12.3361 19.5 12.75V16.5M19.5 13.5C21.9836 13.5 24 15.5164 24 18V20.25M12 20.25V18C12 15.5164 14.0164 13.5 16.5 13.5"
            stroke="#DC2626"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.25 20.25H24.75C25.1639 20.25 25.5 20.5861 25.5 21V22.5C25.5 22.9139 25.1639 23.25 24.75 23.25H11.25C10.8361 23.25 10.5 22.9139 10.5 22.5V21C10.5 20.5861 10.8361 20.25 11.25 20.25"
            stroke="#DC2626"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Employees", value: counts?.totalEmployee, route: "/app/employees",
      icon: (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#F5F3FF" />
          <path d="M21 24V12C21 11.1721 20.3279 10.5 19.5 10.5H16.5C15.6721 10.5 15 11.1721 15 12V24" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 13.5H24C24.8279 13.5 25.5 14.1721 25.5 15V22.5C25.5 23.3279 24.8279 24 24 24H12C11.1721 24 10.5 23.3279 10.5 22.5V15C10.5 14.1721 11.1721 13.5 12 13.5" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      label: "Sales Partners",
      value: counts?.totalSalesPartner,
      route: "/app/sales-partners",
      hide: !isProjectPartner,
      icon: (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#ECFEFF" />
          <path
            d="M17.25 21.75L18.75 23.25C19.3709 23.8709 20.3791 23.8709 21 23.25C21.6209 22.6291 21.6209 21.6209 21 21"
            stroke="#0891B2"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.5002 19.5005L21.3752 21.3755C21.9961 21.9964 23.0043 21.9964 23.6252 21.3755C24.2461 20.7546 24.2461 19.7464 23.6252 19.1255L20.7152 16.2155C19.8367 15.3381 18.4136 15.3381 17.5352 16.2155L16.8752 16.8755C16.2543 17.4964 15.2461 17.4964 14.6252 16.8755C14.0043 16.2546 14.0043 15.2464 14.6252 14.6255L16.7327 12.518C18.1402 11.1141 20.3214 10.8453 22.0277 11.8655L22.3802 12.0755C22.6995 12.2682 23.0792 12.3351 23.4452 12.263L24.7502 12.0005"
            stroke="#0891B2"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24.75 11.25L25.5 19.5H24M11.25 11.25L10.5 19.5L15.375 24.375C15.9959 24.9959 17.0041 24.9959 17.625 24.375C18.2459 23.7541 18.2459 22.7459 17.625 22.125M11.25 12H17.25"
            stroke="#0891B2"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Territory Partners",
      value: counts?.totalTerritoryPartner,
      route: "/app/territory-partners",
      hide: !isProjectPartner,
      icon: (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#FFFBEB" />
          <path
            d="M19.5795 13.1655C20.0016 13.3764 20.4984 13.3764 20.9205 13.1655L23.6648 11.793C23.8974 11.6767 24.1737 11.6893 24.3948 11.8262C24.616 11.9632 24.7504 12.2049 24.75 12.465V22.038C24.7499 22.322 24.5893 22.5815 24.3353 22.7085L20.9205 24.4162C20.4984 24.6272 20.0016 24.6272 19.5795 24.4162L16.4205 22.8367C15.9984 22.6258 15.5016 22.6258 15.0795 22.8367L12.3353 24.2092C12.1025 24.3256 11.826 24.3129 11.6048 24.1758C11.3837 24.0387 11.2494 23.7967 11.25 23.5365V13.9642C11.2502 13.6802 11.4107 13.4207 11.6648 13.2937L15.0795 11.586C15.5016 11.3751 15.9984 11.3751 16.4205 11.586L19.5795 13.1655M20.25 13.3237V24.5737M15.75 11.4277V22.6777"
            stroke="#D97706"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Total Tickets",
      value: counts?.totalTicket,
      route: "/app/tickets",
      hide: false,
      icon: (
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#FDF2F8" />
          <path
            d="M10.5 15.75C11.7418 15.75 12.75 16.7582 12.75 18C12.75 19.2418 11.7418 20.25 10.5 20.25V21.75C10.5 22.5779 11.1721 23.25 12 23.25H24C24.8279 23.25 25.5 22.5779 25.5 21.75V20.25C24.2582 20.25 23.25 19.2418 23.25 18C23.25 16.7582 24.2582 15.75 25.5 15.75V14.25C25.5 13.4221 24.8279 12.75 24 12.75H12C11.1721 12.75 10.5 13.4221 10.5 14.25V15.75M18.75 12.75V14.25M18.75 21.75V23.25M18.75 17.25V18.75"
            stroke="#DB2777"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">
        Business Overview
      </h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items
          .filter((item) => !item.hide)
          .map((item) => {
            const locked = isLocked(item.route);
            const value = locked ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#5E23DC] bg-[#F1EBFF] px-2 py-1 rounded-full">
                <FiLock size={11} /> Upgrade
              </span>
            ) : (
              item.value ?? 0
            );
            return (
              <div
                key={item.label}
                onClick={() =>
                  navigate(locked ? "/app/subscription/compare-plans" : item.route)
                }
                title={locked ? `Upgrade your plan to unlock ${item.label}` : undefined}
                className={`cursor-pointer bg-white rounded-3xl p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:border md:rounded-xl md:p-6 hover:border-violet-300 hover:shadow-sm transition-all ${
                  locked ? "border-dashed md:border-dashed border border-violet-200" : ""
                }`}
              >
                {/* Mobile: icon row + value */}
                <div className="flex items-center justify-between gap-3 md:hidden">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${locked ? "opacity-60" : ""}`}>
                    {item.icon}
                  </div>
                  <div className="text-xl font-semibold text-gray-900">{value}</div>
                </div>

                {/* Label + desktop value */}
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className={`text-sm ${locked ? "text-gray-400" : "text-gray-500"}`}>
                      {item.label}
                    </p>
                    <div className="hidden md:block text-xl font-semibold text-gray-900 mt-0.5">
                      {value}
                    </div>
                  </div>
                  <FiChevronRight className="hidden md:block text-gray-400 text-lg" />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
