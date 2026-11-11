import { HiArrowTrendingUp } from "react-icons/hi2";

/**
 * StatCards
 * Props:
 *   counts  : object  — from API /project-partner/dashboard/count
 *   loading : boolean
 */
export default function StatCards({ counts = {}, loading = false }) {
  const stats = [
    {
      icon: (
        <svg className="w-9 h-9 md:w-11 md:h-11" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#EEF2FF" />
          <path d="M13.5 11.25H22.5M13.5 15H22.5M13.5 18.75L19.875 24.75M13.5 18.75H15.75M15.75 18.75C20.7502 18.75 20.7502 11.25 15.75 11.25" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      value: counts?.totalDealAmount
        ? (Number(counts.totalDealAmount) / 10000000).toFixed(2) + " Cr"
        : "0",
      label: "Total Deal Amount",
      growth: "12.5%",
      prefix: "₹",
    },
    {
      icon: (
        <svg className="w-9 h-9 md:w-11 md:h-11" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#ECFDF5" />
          <path d="M10.5 18C10.5 22.1394 13.8606 25.5 18 25.5C22.1394 25.5 25.5 22.1394 25.5 18C25.5 13.8606 22.1394 10.5 18 10.5C13.8606 10.5 10.5 13.8606 10.5 18" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M15.75 18L17.25 19.5L20.25 16.5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      value: counts?.totalCustomer ?? "0",
      label: "No. of Deals Done",
      growth: "4.2%",
      prefix: "",
    },
    {
      icon: (
        <svg className="w-9 h-9 md:w-11 md:h-11" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#FFFBEB" />
          <path d="M23.25 14.25V12C23.25 11.5861 22.9139 11.25 22.5 11.25H12.75C11.9221 11.25 11.25 11.9221 11.25 12.75C11.25 13.5779 11.9221 14.25 12.75 14.25H24C24.4139 14.25 24.75 14.5861 24.75 15V18H22.5C21.6721 18 21 18.6721 21 19.5C21 20.3279 21.6721 21 22.5 21H24.75C25.1639 21 25.5 20.6639 25.5 20.25V18.75C25.5 18.3361 25.1639 18 24.75 18" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11.25 12.75V23.25C11.25 24.0779 11.9221 24.75 12.75 24.75H24C24.4139 24.75 24.75 24.4139 24.75 24V21" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      value: counts?.selfEarning
        ? (Number(counts.selfEarning) / 100000).toFixed(2) + " L"
        : "0",
      label: "Self Earnings",
      growth: "8.1%",
      prefix: "₹",
    },
    {
      icon: (
        <svg className="w-9 h-9 md:w-11 md:h-11" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#FEF2F2" />
          <path d="M15 11.25H12.75C11.9221 11.25 11.25 11.9221 11.25 12.75V15M24.75 15V12.75C24.75 11.9221 24.0779 11.25 23.25 11.25H21M11.25 21V23.25C11.25 24.0779 11.9221 24.75 12.75 24.75H15M21 24.75H23.25C24.0779 24.75 24.75 24.0779 24.75 23.25V21" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      value: counts?.totalDealInSquareFeet ?? "0",
      label: "Deal in Sq. Ft.",
      growth: "0%",
      prefix: "",
    },
  ];

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:overflow-visible scrollbar-hide mx-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="min-w-[220px] h-[150px] md:h-auto bg-white rounded-3xl md:rounded-2xl p-5 md:p-6 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-gray-200 mb-4" />
            <div className="h-7 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:overflow-visible scrollbar-hide mx-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className="min-w-[220px] h-[150px] bg-white rounded-2xl p-5 flex flex-col justify-between md:min-w-0 md:h-auto md:border md:rounded-xl md:p-6"
        >
          {/* Top */}
          <div className="flex justify-between items-start">
            <div className="flex items-center justify-center pb-2 sm:pb-4">
              {item.icon}
            </div>
            <span className="hidden lg:hidden text-xs bg-green-100 text-green-600 px-2.5 py-1 rounded-full items-center gap-1 font-medium">
              <HiArrowTrendingUp className="w-3 h-3" /> {item.growth}
            </span>
          </div>

          {/* Value + Label */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              {item.prefix}{item.value}
            </h2>
            <p className="text-gray-500 text-sm lg:text-base mt-0.5">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}