import { useState, useMemo } from "react";
import {
  format,
  startOfDay,
  endOfDay,
  isWithinInterval,
  parseISO,
  isSameMonth,
} from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { Trash2, Plus, MapPin, Building2, MoreHorizontal } from "lucide-react";

// ── IST helpers ───────────────────────────────────────────────────────────────
const IST = "Asia/Kolkata";

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

const toISTStr = (date) => {
  const d = toIST(date);
  return d ? formatIST(d, "yyyy-MM-dd") : null;
};

// ── Panel filter options ──────────────────────────────────────────────────────
const PANEL_FILTERS = ["Day", "Month", "Date Range"];

// ── Sub-icon (UI UNCHANGED) ───────────────────────────────────────────────────
function SubIcon({ type }) {
  if (type === "location") return <MapPin className="w-3 h-3 flex-shrink-0" />;
  if (type === "building") return <Building2 className="w-3 h-3 flex-shrink-0" />;
  return null;
}

// ── Event Row (UI UNCHANGED) ──────────────────────────────────────────────────
function EventRow({ time, period, title, sub, subIcon, accent }) {
  return (
    <div className="flex gap-2.5 items-start py-2.5 border-b border-gray-50 last:border-0">
      <div
        className="w-[3px] flex-shrink-0 self-stretch min-h-[40px]"
        style={{ background: accent }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        {sub && (
          <div className="flex items-center gap-1 mt-0.5 text-gray-400 text-[11px]">
            <SubIcon type={subIcon} />
            <span className="truncate">{sub}</span>
          </div>
        )}
        <p className="text-[10px] text-gray-400 mt-0.5">{time} {period}</p>
      </div>
    </div>
  );
}

// ── Note Row (UI UNCHANGED) ───────────────────────────────────────────────────
function NoteRow({ note, onDelete }) {
  return (
    <div className="flex items-start justify-between gap-2 py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex gap-2.5 items-start flex-1 min-w-0">
        <div className="w-[3px] self-stretch min-h-[36px] flex-shrink-0 bg-yellow-500" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{note.note}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {note.date}{note.time ? ` · ${note.time}` : ""}
          </p>
        </div>
      </div>
      <button
        onClick={() => onDelete?.(note.id)}
        className="mt-1 text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Section (UI UNCHANGED) ────────────────────────────────────────────────────
function Section({ title, children, empty }) {
  return (
    <div className="mb-1">
      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5 mt-4 first:mt-0">
        {title}
      </p>
      {children || <p className="text-[11px] text-gray-300 italic pb-1">{empty}</p>}
    </div>
  );
}

// ── Date group label — IST-correct ────────────────────────────────────────────
function DateGroupLabel({ dateStr }) {
  try {
    // parseISO gives midnight UTC; toIST shifts to IST before formatting
    const d = toIST(parseISO(dateStr));
    if (!d) return <p className="text-[10px] text-gray-400 mt-3 mb-1">{dateStr}</p>;
    return (
      <p className="text-[10px] font-semibold text-[#5E23DC] uppercase mt-4 mb-1 first:mt-0">
        {formatIST(d, "EEE, MMM d")}
      </p>
    );
  } catch {
    return <p className="text-[10px] text-gray-400 mt-3 mb-1">{dateStr}</p>;
  }
}

// ── Transform a raw meeting → EventRow props ──────────────────────────────────
function meetingToRow(m) {
  const d = toIST(m.visitdate);
  const isSiteVisit = m.type === "site_visit";
  return {
    type:    isSiteVisit ? "site_visit" : "meeting",
    time:    d ? formatIST(d, "hh:mm") : "",
    period:  d ? formatIST(d, "a")     : "",
    title:   m.customer || (isSiteVisit ? "Site Visit" : "Meeting"),
    sub:     m.remark   || "",
    subIcon: isSiteVisit ? "building" : "location",
    accent:  isSiteVisit ? "#059669"  : "#5E23DC",
  };
}

/**
 * DayPanel — UI unchanged, logic fixed:
 *   - IST-correct date grouping for Month and Date Range views
 *   - site_visit type correctly separated from meeting
 *   - activeFilter respected in all three panel tabs
 *
 * Props:
 *   selectedDate : Date (IST-zoned)
 *   currentDate  : Date (IST-zoned) — drives "Month" view
 *   data         : { meetings[], siteVisits[], tasks[] } — pre-transformed for "Day" view
 *   dailyNotes   : array  — raw notes for selected day
 *   allMeetings  : array  — filteredMeetings from parent (for Month/Range)
 *   allNotes     : array  — filteredNotes from parent    (for Month/Range)
 *   onQuickAdd   : fn()
 *   onDeleteNote : fn(id)
 *   activeFilter : string — "All"|"Meetings"|"Site Visits"|"Notes"
 */
export default function DayPanel({
  selectedDate = new Date(),
  currentDate  = new Date(),
  data         = { meetings: [], siteVisits: [], tasks: [] },
  dailyNotes   = [],
  allMeetings  = [],
  allNotes     = [],
  onQuickAdd,
  onDeleteNote,
  activeFilter = "All",
}) {
  const [panelFilter, setPanelFilter] = useState("Day");
  const [rangeFrom,   setRangeFrom]   = useState(() => toISTStr(new Date()) || format(new Date(), "yyyy-MM-dd"));
  const [rangeTo,     setRangeTo]     = useState(() => toISTStr(new Date()) || format(new Date(), "yyyy-MM-dd"));

  // ── Type matching with activeFilter ──────────────────────────────────────────
  const typeMatch = (type) => {
    if (activeFilter === "All")         return true;
    if (activeFilter === "Meetings")    return type === "meeting";
    if (activeFilter === "Site Visits") return type === "site_visit";
    if (activeFilter === "Notes")       return type === "note";
    return true;
  };

  // ── Month groups: IST-correct, activeFilter-aware ─────────────────────────────
  const monthGroups = useMemo(() => {
    const groups = {};

    allMeetings.forEach(m => {
      try {
        const d = toIST(m.visitdate);
        if (!d) return;
        // isSameMonth using IST-zoned dates
        if (!isSameMonth(d, toIST(currentDate))) return;

        const mType = m.type === "site_visit" ? "site_visit" : "meeting";
        if (!typeMatch(mType)) return;

        const ds = formatIST(d, "yyyy-MM-dd");
        if (!groups[ds]) groups[ds] = [];
        groups[ds].push({ type: mType, _meeting: m });
      } catch {}
    });

    allNotes.forEach(n => {
      try {
        const d = toIST(n.date);
        if (!d) return;
        if (!isSameMonth(d, toIST(currentDate))) return;
        if (!typeMatch("note")) return;

        const ds = formatIST(d, "yyyy-MM-dd");
        if (!groups[ds]) groups[ds] = [];
        groups[ds].push({ type: "note", _raw: n });
      } catch {}
    });

    return Object.keys(groups).sort().reduce((acc, k) => { acc[k] = groups[k]; return acc; }, {});
  }, [allMeetings, allNotes, currentDate, activeFilter]);

  // ── Range groups: IST-correct, activeFilter-aware ────────────────────────────
  const rangeGroups = useMemo(() => {
    if (!rangeFrom || !rangeTo) return {};
    const from = toIST(parseISO(rangeFrom));
    const to   = toIST(parseISO(rangeTo));
    if (!from || !to || from > to) return {};

    const interval = { start: startOfDay(from), end: endOfDay(to) };
    const groups   = {};

    allMeetings.forEach(m => {
      try {
        const d = toIST(m.visitdate);
        if (!d || !isWithinInterval(d, interval)) return;
        const mType = m.type === "site_visit" ? "site_visit" : "meeting";
        if (!typeMatch(mType)) return;
        const ds = formatIST(d, "yyyy-MM-dd");
        if (!groups[ds]) groups[ds] = [];
        groups[ds].push({ type: mType, _meeting: m });
      } catch {}
    });

    allNotes.forEach(n => {
      try {
        const d = toIST(n.date);
        if (!d || !isWithinInterval(d, interval)) return;
        if (!typeMatch("note")) return;
        const ds = formatIST(d, "yyyy-MM-dd");
        if (!groups[ds]) groups[ds] = [];
        groups[ds].push({ type: "note", _raw: n });
      } catch {}
    });

    return Object.keys(groups).sort().reduce((acc, k) => { acc[k] = groups[k]; return acc; }, {});
  }, [allMeetings, allNotes, rangeFrom, rangeTo, activeFilter]);

  // ── Panel title — IST-safe ────────────────────────────────────────────────────
  const panelTitle = () => {
    try {
      if (panelFilter === "Day")        return formatIST(selectedDate, "EEE, MMM d");
      if (panelFilter === "Month")      return formatIST(currentDate,  "MMMM yyyy");
      if (panelFilter === "Date Range") return `${rangeFrom} → ${rangeTo}`;
    } catch {}
    return "";
  };

  // ── Render grouped list (Month / Date Range) ──────────────────────────────────
  const renderGroups = (groups) => {
    const keys = Object.keys(groups);
    if (!keys.length) return <p className="text-xs text-gray-400 mt-3">No events found.</p>;

    return keys.map(ds => (
      <div key={ds}>
        <DateGroupLabel dateStr={ds} />
        {groups[ds].map((e, i) =>
          e.type === "note"
            ? <NoteRow key={i} note={e._raw} onDelete={onDeleteNote} />
            : <EventRow key={i} {...meetingToRow(e._meeting)} />
        )}
      </div>
    ));
  };

  // ── "Day" view filtering by activeFilter ─────────────────────────────────────
  const dayMeetings   = (activeFilter === "All" || activeFilter === "Meetings")    ? data.meetings    : [];
  const daySiteVisits = (activeFilter === "All" || activeFilter === "Site Visits") ? data.siteVisits  : [];
  const dayNotes      = (activeFilter === "All" || activeFilter === "Notes")       ? dailyNotes       : [];

  // ── UI (unchanged from original) ──────────────────────────────────────────────
  return (
    <div className="bg-white border rounded-xl w-[290px] flex flex-col max-h-[calc(100vh-200px)]">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b">
        <div className="flex justify-between mb-3">
          <span className="text-sm font-semibold">{panelTitle()}</span>
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex gap-1.5">
          {PANEL_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setPanelFilter(f)}
              className={`px-3 py-1.5 rounded-full text-[11px] border cursor-pointer transition-all ${
                f === panelFilter
                  ? "bg-[#5E23DC] border-[#5E23DC] text-white"
                  : "bg-white border-gray-200 text-gray-500 hover:border-[#5E23DC]/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {panelFilter === "Date Range" && (
          <div className="mt-3 flex items-center gap-1.5">
            <input
              type="date"
              value={rangeFrom}
              onChange={e => setRangeFrom(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 outline-none focus:border-[#5E23DC]"
            />
            <span className="text-gray-400 text-xs">→</span>
            <input
              type="date"
              value={rangeTo}
              min={rangeFrom}
              onChange={e => setRangeTo(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 outline-none focus:border-[#5E23DC]"
            />
          </div>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">

        {panelFilter === "Day" && (
          <>
            <Section title="Meetings" empty="No meetings today">
              {dayMeetings.length > 0 && dayMeetings.map((m, i) => <EventRow key={i} {...m} />)}
            </Section>
            <Section title="Site Visits" empty="No site visits">
              {daySiteVisits.length > 0 && daySiteVisits.map((v, i) => <EventRow key={i} {...v} />)}
            </Section>
            <Section title="Notes" empty="No notes for this day">
              {dayNotes.length > 0 && dayNotes.map((n, i) => (
                <NoteRow key={n.id ?? i} note={n} onDelete={onDeleteNote} />
              ))}
            </Section>
          </>
        )}

        {panelFilter === "Month"      && renderGroups(monthGroups)}
        {panelFilter === "Date Range" && renderGroups(rangeGroups)}

        <button
          onClick={onQuickAdd}
          className="w-full mt-4 border-dashed border-[1.5px] border-gray-200 rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-xs text-gray-400 cursor-pointer hover:border-[#5E23DC] hover:text-[#5E23DC] transition-colors bg-transparent"
        >
          <Plus className="w-3.5 h-3.5" />
          Quick add note
        </button>
      </div>
    </div>
  );
}