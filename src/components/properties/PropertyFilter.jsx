import { useState } from "react";
import { useAuth } from "../../store/auth";

export default function PropertyFilter({ counts = {} }) {
  const { propertyFilter, setPropertyFilter } = useAuth();

  const filters = [
    {
      label: "Approved",
      key: "Approved",
      count: counts?.Approved ?? 0,
    },
    {
      label: "Not Approved",
      key: "NotApproved",
      count: counts?.NotApproved ?? 0,
    },
    {
      label: "Rejected",
      key: "Rejected",
      count: counts?.Rejected ?? 0,
    },
    {
      label: "Draft",
      key: "Draft",
      count: counts?.Draft ?? 0,
    },
    {
      label: "Trending",
      key: "Trending",
      count: counts?.Trending ?? "🔥",
    },
    {
      label: "Recently Updated",
      key: "RecentlyUpdated",
      count: counts?.RecentlyUpdated ?? 0,
    },
  ];

  return (
    <>
      {/* ── Filter Pills ── */}
      <div className="flex items-center gap-2 shrink-0">
        {filters?.map((item) => {
          const isActive = propertyFilter === item.label;
          return (
            <button
              key={item.label}
              onClick={() => setPropertyFilter(item.label)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs whitespace-nowrap font-medium border transition-all cursor-pointer
                  ${
                    isActive
                      ? "text-white border-transparent shadow-md shadow-violet-200"
                      : "bg-white text-gray-600 border-gray-200 hover:border-violet-400 hover:text-violet-600"
                  }`}
              style={
                isActive
                  ? {
                      background:
                        "#5323DC",
                    }
                  : {}
              }
            >
              <span>{item.label}</span>
              {item.count !== undefined && item.count !== "" && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors
                      ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
