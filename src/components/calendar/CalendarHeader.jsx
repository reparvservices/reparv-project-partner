import { useState, useEffect } from "react";
import { SearchIcon, FilterIcon, PlusIcon } from "./CalendarIcons";
import { VIEW_OPTIONS } from "./calendarData";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NAV_TABS = ["Schedule", "Notes"];

export default function CalendarHeader({
  activeView,
  onViewChange,
  onAddEvent,
  activeTab,
  onTabChange,

  // NEW (no UI change)
  onSearch,
  activeFilter,
  onFilterChange,
}) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Sync search with parent
  useEffect(() => {
    onSearch?.(search);
  }, [search, onSearch]);

  const FILTER_OPTIONS = ["All", "Meetings", "Site Visits", "Notes"];
  const [showFilter, setShowFilter] = useState(false);
  // Simple filter toggle logic (no UI change)
  const handleFilterClick = () => {
    if (!onFilterChange) return;

    const filters = ["All", "Meetings", "Site Visits", "Notes"];
    const currentIndex = filters.indexOf(activeFilter);
    const nextFilter = filters[(currentIndex + 1) % filters.length];

    onFilterChange(nextFilter);
  };

  return (
    <>
      {/* MOBILE */}
      <div className="md:hidden flex flex-col">
        <div className="flex items-center justify-between px-4 h-16 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-900" strokeWidth={2.2} />
          </button>

          <span className="text-[15px] font-semibold tracking-wide">
            Calendar
          </span>

          <button
            onClick={() => navigate("/app/calendar/event/add")}
            className="w-10 h-10 rounded-full bg-[#5323DC] active:scale-95 flex items-center justify-center text-white shadow-lg shadow-violet-500/40 transition-all cursor-pointer"
          >
            <PlusIcon size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-gray-400 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events, properties..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 outline-none focus:border-violet-400 focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div className="hidden w-full md:flex flex-col">
        <div className="border-b px-7 py-4 md:py-5 flex flex-wrap items-center gap-5">
          <div className="min-w-[170px]">
            <p className="text-lg font-bold text-gray-900 leading-tight">
              Calendar
            </p>
            <p className="text-xs text-violet-600 mt-0.5">
              Meetings • Tasks • Site Visits
            </p>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-sm relative flex flex-wrap items-center">
            <span className="absolute left-3 text-gray-400 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events, properties..."
              className="w-full min-w-[300px] pl-9 pr-3 py-2 border rounded-md text-sm text-gray-700 bg-white outline-none focus:border-violet-500 transition-colors placeholder:text-gray-400"
            />
          </div>

          <div className="flex-1" />

          {/* View Switcher */}
          <div className="hidden items-center bg-white border border-gray-200 rounded-md overflow-hidden divide-x divide-gray-200">
            {VIEW_OPTIONS.map((v) => (
              <button
                key={v}
                onClick={() => onViewChange?.(v)}
                className={`px-4 py-2 text-sm cursor-pointer transition-colors
                  ${
                    v === activeView
                      ? "font-bold text-gray-900"
                      : "font-normal text-gray-400 hover:text-gray-600"
                  }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="min-w-9 h-9 border rounded-md flex px-4 gap-2 items-center justify-center"
            >
              <FilterIcon />
              <span className="text-sm font-semibold">{activeFilter}</span>
            </button>

            {showFilter && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md z-50">
                {FILTER_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => {
                      onFilterChange?.(f);
                      setShowFilter(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      activeFilter === f
                        ? "bg-violet-50 text-violet-600 font-semibold"
                        : ""
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Event */}
          <button
            onClick={() => navigate("/app/calendar/event/add")}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#5323DC] hover:bg-[#5323DC] active:scale-95 text-white rounded-md text-sm font-semibold cursor-pointer shadow-md shadow-violet-200 transition-all"
          >
            <PlusIcon size={15} />
            Add Event
          </button>
        </div>
      </div>
    </>
  );
}