import { useState, useMemo, useEffect } from "react";
import {
  addDays,
  startOfWeek,
  addWeeks,
  subWeeks,
  isSameDay,
} from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
import { ChevronLeftIcon, ChevronRightIcon } from "./CalendarIcons";

const IST     = "Asia/Kolkata";
const FILTERS = ["Day", "Week", "Month", "Custom"];
const WDAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ── IST helpers ───────────────────────────────────────────────────────────────
const toIST = (date) => {
  try {
    // FIX: date-only strings like "2025-07-15" → append T00:00:00 to avoid UTC shift
    let raw = date;
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      raw = date + "T00:00:00";
    }
    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;
    return toZonedTime(d, IST);
  } catch {
    return null;
  }
};

const formatIST = (date, fmt) => {
  try {
    return formatInTimeZone(date, IST, fmt);
  } catch {
    return "";
  }
};

export default function MobileWeekStrip({
  selectedDate,
  onSelectDate,
  meetings         = [],
  notes            = [],
  activeFilter,
  onFilterChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}) {
  const todayIST = toIST(new Date());

  const [weekStart, setWeekStart] = useState(() => {
    const sel = toIST(selectedDate || new Date());
    return startOfWeek(sel || todayIST, { weekStartsOn: 1 });
  });

  // FIX: when selectedDate changes externally (parent navigates to a different
  // month/day), re-anchor the strip's weekStart to that date's week.
  // Without this, tapping a day in the desktop grid while on mobile view
  // would update selectedDate but leave the strip showing the wrong week.
  useEffect(() => {
    if (!selectedDate) return;
    const sel = toIST(selectedDate);
    if (!sel) return;
    const newWeekStart = startOfWeek(sel, { weekStartsOn: 1 });
    setWeekStart((prev) => {
      // Only update if the selected date falls outside the currently shown week
      const weekEnd = addDays(prev, 6);
      if (sel < prev || sel > weekEnd) return newWeekStart;
      return prev;
    });
  }, [selectedDate]);

  // ── 7 days for the week strip ─────────────────────────────────────────────
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const monthLabel = useMemo(() => formatIST(weekStart, "MMMM yyyy"), [weekStart]);

  // ── Dot sets ──────────────────────────────────────────────────────────────
  const meetingDates = useMemo(() => {
    const set = new Set();
    meetings.forEach(m => {
      const d = toIST(m.visitdate);
      if (d) set.add(formatIST(d, "yyyy-MM-dd"));
    });
    return set;
  }, [meetings]);

  const noteDates = useMemo(() => {
    const set = new Set();
    notes.forEach(n => {
      // Support both field names; toIST handles date-only strings
      const d = toIST(n.date || n.event_date);
      if (d) set.add(formatIST(d, "yyyy-MM-dd"));
    });
    return set;
  }, [notes]);

  const prevWeek = () => setWeekStart(w => subWeeks(w, 1));
  const nextWeek = () => setWeekStart(w => addWeeks(w, 1));

  const selIST = toIST(selectedDate);

  return (
    <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100">

      {/* Month + Nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevWeek} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer transition-colors">
          <ChevronLeftIcon />
        </button>
        <h2 className="text-base font-semibold text-gray-900">{monthLabel}</h2>
        <button onClick={nextWeek} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer transition-colors">
          <ChevronRightIcon />
        </button>
      </div>

      {/* Week strip */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {weekDays.map(day => {
          const dayIST    = toIST(day);
          if (!dayIST) return null;
          const dateStr   = formatIST(dayIST, "yyyy-MM-dd");
          const isToday   = todayIST && isSameDay(dayIST, todayIST);
          const isSelected = selIST && isSameDay(dayIST, selIST) && !isToday;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate?.(dayIST)}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-[12px] text-gray-400">
                {WDAYS[dayIST.getDay()]}
              </span>
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-[15px] font-semibold transition-all ${
                  isToday
                    ? "bg-violet-600 text-white"
                    : isSelected
                      ? "bg-violet-100 text-violet-700"
                      : "text-gray-900 hover:bg-gray-100"
                }`}
              >
                {dayIST.getDate()}
              </span>
              <div className="flex gap-0.5 h-1.5">
                {meetingDates.has(dateStr) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-600" />
                )}
                {noteDates.has(dateStr) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Range filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => onFilterChange?.(f)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              f === activeFilter
                ? "bg-violet-600 border-violet-600 text-white"
                : "bg-white border-gray-200 text-gray-500 hover:border-violet-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Custom date range pickers */}
      {activeFilter === "Custom" && (
        <div className="flex items-center gap-2 mt-3">
          <input
            type="date"
            value={customFrom}
            onChange={e => onCustomFromChange?.(e.target.value)}
            className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-violet-400"
          />
          <span className="text-gray-400 text-xs">→</span>
          <input
            type="date"
            value={customTo}
            min={customFrom}
            onChange={e => onCustomToChange?.(e.target.value)}
            className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none focus:border-violet-400"
          />
        </div>
      )}
    </div>
  );
}