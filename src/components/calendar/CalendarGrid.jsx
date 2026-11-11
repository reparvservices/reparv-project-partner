import { useMemo } from "react";
import { getDaysInMonth, getDay, startOfMonth, format } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";

// ── Constants ─────────────────────────────────────────────────────────────────
const CALENDAR_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const CAL_FILTERS = ["All", "Meetings", "Site Visits", "Notes"];

export const FILTER_TYPE_MAP = {
  All:           "all",
  Meetings:      "meeting",
  "Site Visits": "site_visit",
  Notes:         "note",
};

const IST = "Asia/Kolkata";

// ── IST helpers ───────────────────────────────────────────────────────────────
const toIST = (date) => {
  try {
    const d = new Date(date);
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

// ── Event chip (UI UNCHANGED) ─────────────────────────────────────────────────
function EventChip({ label, color, bg }) {
  return (
    <div
      className="text-[10px] font-medium px-1.5 py-0.5 rounded truncate border-l-2 leading-tight"
      style={{ background: bg, color, borderColor: color }}
    >
      {label}
    </div>
  );
}

/**
 * CalendarGrid
 *
 * Props:
 *   currentDate  : Date (IST-zoned) — controlled by parent
 *   selectedDay  : number
 *   onSelectDay  : fn(day)
 *   onPrev       : fn()
 *   onNext       : fn()
 *   activeFilter : string
 *   onFilter     : fn(filter)
 *   meetings     : array  — already filtered by parent (filteredMeetings)
 *   notes        : array  — already filtered by parent (filteredNotes)
 *   tileContent  : fn({ date, view }) — optional dot fallback (kept for compat)
 */
export default function CalendarGrid({
  currentDate  = new Date(),
  selectedDay,
  onSelectDay,
  onPrev,
  onNext,
  activeFilter = "All",
  onFilter,
  meetings     = [],
  notes        = [],
  tileContent,
}) {
  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth    = getDaysInMonth(currentDate);
  const firstDayOffset = getDay(startOfMonth(currentDate));
  const monthLabel     = format(currentDate, "MMMM yyyy");

  // Today in IST
  const todayIST    = toIST(new Date());
  const isThisMonth = todayIST && todayIST.getMonth() === month && todayIST.getFullYear() === year;
  const todayNum    = todayIST ? todayIST.getDate() : -1;

  // ── Build calendar rows ────────────────────────────────────────────────────
  const rows = useMemo(() => {
    const cells = [];
    const prevLast = new Date(year, month, 0).getDate();
    for (let i = 0; i < firstDayOffset; i++)
      cells.push({ day: prevLast - firstDayOffset + i + 1, current: false });
    for (let d = 1; d <= daysInMonth; d++)
      cells.push({ day: d, current: true });
    let next = 1;
    while (cells.length % 7 !== 0)
      cells.push({ day: next++, current: false });

    const chunked = [];
    for (let i = 0; i < cells.length; i += 7)
      chunked.push(cells.slice(i, i + 7));
    return chunked;
  }, [year, month, daysInMonth, firstDayOffset]);

  // ── Index meetings by IST day number ──────────────────────────────────────
  const meetingsByDay = useMemo(() => {
    const map = {};
    meetings.forEach(m => {
      try {
        const d = toIST(m.visitdate);
        if (!d || d.getMonth() !== month || d.getFullYear() !== year) return;
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push({
          id:    m.followupid,
          label: (m.customer || "Meeting").split(" ")[0],
          color: m.type === "site_visit" ? "#059669" : "#5E23DC",
          bg:    m.type === "site_visit" ? "#d1fae5" : "#ede9fe",
          type:  m.type === "site_visit" ? "site_visit" : "meeting",
        });
      } catch {}
    });
    return map;
  }, [meetings, month, year]);

  // ── Index notes by IST day number ─────────────────────────────────────────
  const notesByDay = useMemo(() => {
    const map = {};
    notes.forEach(n => {
      try {
        const d = toIST(n.date);
        if (!d || d.getMonth() !== month || d.getFullYear() !== year) return;
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push({
          id:    n.id,
          label: n.note,
          color: "#b45309",
          bg:    "#fef3c7",
          type:  "note",
        });
      } catch {}
    });
    return map;
  }, [notes, month, year]);

  const filterType = FILTER_TYPE_MAP[activeFilter] ?? "all";

  // ── UI (unchanged from original) ──────────────────────────────────────────
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden flex-1 shadow-sm">

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span className="text-base font-semibold min-w-[150px] text-center select-none">
            {monthLabel}
          </span>
          <button
            onClick={onNext}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {CAL_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => onFilter?.(f)}
              className={`px-3 py-1 rounded-full text-xs border transition-all cursor-pointer ${
                f === activeFilter
                  ? "bg-[#5E23DC] border-[#5E23DC] text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-[#5E23DC]/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {CALENDAR_DAYS.map(d => (
          <div key={d} className="py-2 text-center text-[11px] font-semibold text-gray-400 tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Rows */}
      {rows.map((row, ri) => (
        <div key={ri} className="grid grid-cols-7 border-b border-gray-100 last:border-b-0">
          {row.map((cell, ci) => {
            const isToday    = cell.current && isThisMonth && cell.day === todayNum;
            const isSelected = cell.current && cell.day === selectedDay && !isToday;

            const meetEvts = (cell.current && meetingsByDay[cell.day]) || [];
            const noteEvts = (cell.current && notesByDay[cell.day])    || [];
            const allEvts  = [...meetEvts, ...noteEvts];

            const visible =
              filterType === "all"       ? allEvts :
              filterType === "meeting"   ? meetEvts.filter(e => e.type === "meeting") :
              filterType === "site_visit"? meetEvts.filter(e => e.type === "site_visit") :
              filterType === "note"      ? noteEvts :
              allEvts;

            const dots = visible.length === 0 && cell.current && tileContent
              ? tileContent({ date: new Date(year, month, cell.day), view: "month" })
              : null;

            return (
              <div
                key={ci}
                onClick={() => cell.current && onSelectDay?.(cell.day)}
                className={`min-h-[88px] p-1.5 flex flex-col gap-1 transition-colors
                  ${ci < 6 ? "border-r border-gray-100" : ""}
                  ${cell.current ? "cursor-pointer" : "cursor-default"}
                  ${isSelected ? "bg-[#5E23DC]/5" : cell.current ? "hover:bg-gray-50" : ""}
                `}
              >
                {/* Day number */}
                <div className="mb-0.5 flex-shrink-0">
                  {isToday ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#5E23DC] text-white text-[12px] font-semibold">
                      {cell.day}
                    </span>
                  ) : (
                    <span className={`text-[12px] ${
                      cell.current
                        ? isSelected
                          ? "font-semibold text-[#5E23DC]"
                          : "font-medium text-gray-700"
                        : "text-gray-300"
                    }`}>
                      {cell.day}
                    </span>
                  )}
                </div>

                {/* Event chips */}
                {visible.slice(0, 2).map((e, ei) => (
                  <EventChip key={ei} {...e} />
                ))}
                {visible.length > 2 && (
                  <span className="text-[9px] text-gray-400 pl-1">+{visible.length - 2} more</span>
                )}

                {/* Dot fallback */}
                {dots}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}