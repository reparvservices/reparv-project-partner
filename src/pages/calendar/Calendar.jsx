import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../store/auth";
import {
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

import CalendarHeader from "../../components/calendar/CalendarHeader";
import CalendarStats from "../../components/calendar/CalendarStats";
import CalendarGrid from "../../components/calendar/CalendarGrid";
import DayPanel from "../../components/calendar/DayPanel";
import CalendarFAB from "../../components/calendar/CalendarFAB";
import MobileStats from "../../components/calendar/MobileStats";
import MobileWeekStrip from "../../components/calendar/MobileWeekStrip";
import MobileFilterChips from "../../components/calendar/MobileFilterChips";
import MobileEventCards from "../../components/calendar/MobileEventCards";
import NoteModal from "../../components/calendar/NoteModal";

const IST = "Asia/Kolkata";

// ── IST helpers ───────────────────────────────────────────────────────────────

// Convert any date value to an IST-zoned Date object
const toIST = (date) => {
  if (!date) return null;
  try {
    let raw = date;
    // date-only strings (e.g. "2025-07-15") are UTC midnight in JS → prev day in IST.
    // Append T00:00:00 to treat as local/wall-clock before zoning.
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
  if (!date) return "";
  try {
    return formatInTimeZone(date, IST, fmt);
  } catch {
    return "";
  }
};

// Returns "yyyy-MM-dd" string in IST for any date value
const toISTDateStr = (date) => {
  if (!date) return null;
  const d = toIST(date);
  return d ? formatIST(d, "yyyy-MM-dd") : null;
};

// Generate every "yyyy-MM-dd" string between two IST date strings (inclusive)
const dateStrRange = (fromStr, toStr) => {
  const dates = [];
  const cur = new Date(fromStr + "T00:00:00");
  const end = new Date(toStr + "T00:00:00");
  while (cur <= end) {
    dates.push(formatInTimeZone(cur, IST, "yyyy-MM-dd"));
    cur.setDate(cur.getDate() + 1);
  }
  return new Set(dates);
};

export default function Calendar() {
  const { URI, role, showNotePopup, setShowNotePopup } = useAuth();
  const isProjectPartner = role === "Project Partner";
  const getBasePath = () => {
    if (role === "Project Partner") return "/project-partner";
    if (role === "Territory Partner") return "/territory-partner";
    return "/sales"; // Sales Partner
  };

  const [activeTab, setActiveTab] = useState("Schedule");
  const [activeView, setActiveView] = useState("Month");
  const [calFilter, setCalFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [currentDate, setCurrentDate] = useState(() => toIST(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toIST(new Date()));

  const [mobileFilter, setMobileFilter] = useState("Day");
  const [customFrom, setCustomFrom] = useState(toISTDateStr(new Date()));
  const [customTo, setCustomTo] = useState(toISTDateStr(new Date()));

  const [meetings, setMeetings] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [dailyNotes, setDailyNotes] = useState([]);

  const [newNote, setNewNote] = useState("");
  const [noteTime, setNoteTime] = useState("09:00");
  const [noteSaving, setNoteSaving] = useState(false);

  // ── API ───────────────────────────────────────────────────────────────────
  const fetchMeetings = useCallback(async () => {
    try {
      const res = await fetch(`${URI}${getBasePath()}/calender/meetings`, {
        credentials: "include",
      });
      const data = await res.json();
      setMeetings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchMeetings:", err);
    }
  }, [URI]);

  const fetchAllNotes = useCallback(async () => {
    try {
      const res = await fetch(`${URI}${getBasePath()}/calender/notes`, {
        credentials: "include",
      });
      const data = await res.json();
      setAllNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchAllNotes:", err);
    }
  }, [URI]);

  const fetchDailyNotes = useCallback(
    async (date) => {
      try {
        const d = toISTDateStr(date);
        const url = d
          ? `${URI}${getBasePath()}/calender/notes?date=${d}`
          : `${URI}${getBasePath()}/calender/notes`;
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();
        setDailyNotes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetchDailyNotes:", err);
      }
    },
    [URI],
  );

  useEffect(() => {
    fetchMeetings();
    fetchAllNotes();
    fetchDailyNotes(new Date());
  }, [fetchMeetings, fetchAllNotes, fetchDailyNotes]);

  useEffect(() => {
    fetchDailyNotes(selectedDate);
  }, [selectedDate, fetchDailyNotes]);

  // ── Add / Delete note ─────────────────────────────────────────────────────
  const addNote = async (e) => {
    e?.preventDefault();
    if (!newNote.trim()) return;
    setNoteSaving(true);
    try {
      await fetch(`${URI}${getBasePath()}/calender/note/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          date: toISTDateStr(selectedDate),
          time: noteTime,
          note: newNote,
        }),
      });
      setNewNote("");
      setNoteTime("09:00");
      setShowNotePopup(false);
      fetchAllNotes();
      fetchDailyNotes(selectedDate);
    } catch (err) {
      console.error("addNote:", err);
    } finally {
      setNoteSaving(false);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      const res = await fetch(
        `${URI}${getBasePath()}/calender/note/delete/${id}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await res.json();
      if (res.ok) {
        setAllNotes((prev) => prev.filter((n) => n.id !== id));
        setDailyNotes((prev) => prev.filter((n) => n.id !== id));
      } else {
        alert(data.message || "Failed to delete note");
      }
    } catch (err) {
      console.error("deleteNote:", err);
    }
  };

  // ── Filtered sets ─────────────────────────────────────────────────────────
  const filteredMeetings = useMemo(
    () =>
      meetings?.filter((m) => {
        const text = `${m.customer || ""} ${m.remark || ""}`.toLowerCase();
        if (!text.includes(search.toLowerCase())) return false;
        if (calFilter === "Meetings") return m.type !== "site_visit";
        if (calFilter === "Site Visits") return m.type === "site_visit";
        if (calFilter === "Notes") return false;
        return true;
      }),
    [meetings, search, calFilter],
  );

  // allNotes-backed — used for mobile range filtering & dot indicators
  const filteredNotes = useMemo(
    () =>
      allNotes?.filter((n) => {
        const text = (n.note || "").toLowerCase();
        if (!text.includes(search.toLowerCase())) return false;
        if (calFilter === "Meetings" || calFilter === "Site Visits") return false;
        return true;
      }),
    [allNotes, search, calFilter],
  );

  // dailyNotes-backed — date-scoped for desktop DayPanel only
  const filteredDailyNotes = useMemo(
    () =>
      dailyNotes?.filter((n) => {
        const text = (n.note || "").toLowerCase();
        if (!text.includes(search.toLowerCase())) return false;
        if (calFilter === "Meetings" || calFilter === "Site Visits") return false;
        return true;
      }),
    [dailyNotes, search, calFilter],
  );

  // ── Lookup maps (by IST date string) ─────────────────────────────────────
  const meetingMap = useMemo(() => {
    const map = new Map();
    filteredMeetings.forEach((m) => {
      const ds = toISTDateStr(m.visitdate);
      if (!ds) return;
      if (!map.has(ds)) map.set(ds, []);
      map.get(ds).push(m);
    });
    return map;
  }, [filteredMeetings]);

  const noteMap = useMemo(() => {
    const map = new Map();
    filteredNotes.forEach((n) => {
      const ds = toISTDateStr(n.date || n.event_date);
      if (!ds) return;
      if (!map.has(ds)) map.set(ds, []);
      map.get(ds).push(n);
    });
    return map;
  }, [filteredNotes]);

  const selectedDateStr = toISTDateStr(selectedDate);
  const todayStr = toISTDateStr(new Date());

  const dailyMeetings = meetingMap.get(selectedDateStr) || [];
  const todayMeetings = meetingMap.get(todayStr) || [];

  // ── Stats ─────────────────────────────────────────────────────────────────
  const liveStats = useMemo(() => {
    let siteVisits = 0, followUps = 0;
    meetings.forEach((m) => {
      if (m.type === "site_visit") siteVisits++;
      if (m.status === "scheduled") followUps++;
    });
    return [
      { label: "Today's Meetings", value: String(todayMeetings?.length), iconKey: "users", iconBg: "bg-violet-100" },
      { label: "Site Visits", value: String(siteVisits), iconKey: "map", iconBg: "bg-emerald-100" },
      { label: "Follow-ups", value: String(followUps), iconKey: "phone", iconBg: "bg-orange-100" },
      { label: "Notes", value: String(allNotes?.length), iconKey: "check", iconBg: "bg-blue-100" },
    ];
  }, [meetings, todayMeetings, allNotes]);

  // ── Mobile date range as a Set of "yyyy-MM-dd" strings ───────────────────
  // Using string comparison avoids ALL timezone/interval edge cases entirely.
  const mobileDateSet = useMemo(() => {
    const selStr = toISTDateStr(selectedDate);
    if (!selStr) return new Set();

    if (mobileFilter === "Day") {
      return new Set([selStr]);
    }

    if (mobileFilter === "Week") {
      const sel = toIST(selectedDate);
      const weekBegin = startOfWeek(sel, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(sel, { weekStartsOn: 1 });
      return dateStrRange(
        formatInTimeZone(weekBegin, IST, "yyyy-MM-dd"),
        formatInTimeZone(weekEnd, IST, "yyyy-MM-dd"),
      );
    }

    if (mobileFilter === "Month") {
      const sel = toIST(selectedDate);
      const monthBegin = startOfMonth(sel);
      const monthEnd = endOfMonth(sel);
      return dateStrRange(
        formatInTimeZone(monthBegin, IST, "yyyy-MM-dd"),
        formatInTimeZone(monthEnd, IST, "yyyy-MM-dd"),
      );
    }

    if (mobileFilter === "Custom" && customFrom && customTo && customFrom <= customTo) {
      return dateStrRange(customFrom, customTo);
    }

    return new Set([selStr]);
  }, [mobileFilter, selectedDate, customFrom, customTo]);

  // ── Mobile events — filter meetingMap by mobileDateSet ───────────────────
  const mobileEvents = useMemo(() => {
    const results = [];
    mobileDateSet.forEach((ds) => {
      const dayMeetings = meetingMap.get(ds) || [];
      dayMeetings.forEach((m) => {
        const d = toIST(m.visitdate);
        results.push({
          id: m.followupid,
          date: ds,
          time: m.visittime || (d ? formatIST(d, "hh:mm a") : ""),
          title: m.customer || "Visit",
          sub: m.remark || "",
          accent: m.status === "completed" ? "bg-emerald-500" : "bg-violet-600",
          type: m.type === "site_visit" ? "site_visit" : "meeting",
        });
      });
    });
    // Sort by date string ascending
    return results.sort((a, b) => a.date.localeCompare(b.date));
  }, [meetingMap, mobileDateSet]);

  // ── Mobile notes — filter noteMap by mobileDateSet ────────────────────────
  const mobileNotes = useMemo(() => {
    const results = [];
    mobileDateSet.forEach((ds) => {
      const dayNotes = noteMap.get(ds) || [];
      dayNotes.forEach((n) => results.push(n));
    });
    return results;
  }, [noteMap, mobileDateSet]);

  // ── DayPanel data ─────────────────────────────────────────────────────────
  const dayPanelData = useMemo(
    () => ({
      meetings: dailyMeetings
        .filter((m) => m.type !== "site_visit")
        .map((m) => {
          const d = toIST(m.visitdate);
          return {
            time: d ? formatIST(d, "hh:mm") : "",
            period: d ? formatIST(d, "a") : "",
            title: m.customer || "Meeting",
            sub: m.remark || "",
            subIcon: "location",
            accent: "#5E23DC",
          };
        }),
      siteVisits: dailyMeetings
        .filter((m) => m.type === "site_visit")
        .map((m) => {
          const d = toIST(m.visitdate);
          return {
            time: d ? formatIST(d, "hh:mm") : "",
            period: d ? formatIST(d, "a") : "",
            title: m.customer || "Site Visit",
            sub: m.remark || "",
            subIcon: "building",
            accent: "#059669",
          };
        }),
      tasks: [],
    }),
    [dailyMeetings],
  );

  // ── Navigation ────────────────────────────────────────────────────────────
  const handlePrevMonth = () => setCurrentDate((prev) => toIST(subMonths(prev, 1)));
  const handleNextMonth = () => setCurrentDate((prev) => toIST(addMonths(prev, 1)));

  const handleDaySelect = (day) => {
    const d = toIST(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    setSelectedDate(d);
  };

  const openModal = () => setShowNotePopup(true);

  return (
    <div className="min-h-screen font-sans">
      <CalendarHeader
        activeView={activeView}
        onViewChange={setActiveView}
        onAddEvent={openModal}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSearch={setSearch}
        activeFilter={calFilter}
        onFilterChange={setCalFilter}
      />

      {/* ── Mobile ── */}
      <div className="md:hidden bg-white">
        <MobileStats stats={liveStats.slice(0, 3)} />

        <MobileWeekStrip
          selectedDate={selectedDate}
          onSelectDate={(d) => {
            const ist = toIST(d);
            setSelectedDate(ist);
            setCurrentDate(ist);
          }}
          meetings={filteredMeetings}
          notes={filteredNotes}
          activeFilter={mobileFilter}
          onFilterChange={setMobileFilter}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
        />

        <MobileFilterChips active={calFilter} onChange={setCalFilter} />

        <MobileEventCards
          events={mobileEvents}
          dailyNotes={mobileNotes}
          activeFilter={calFilter}
          onQuickAdd={openModal}
          onDeleteNote={deleteNote}
        />
      </div>

      {/* ── Desktop ── */}
      <div className="hidden md:block">
        <CalendarStats stats={liveStats} />

        <div className="px-7 pb-7 flex gap-4">
          <CalendarGrid
            currentDate={currentDate}
            selectedDay={selectedDate.getDate()}
            onSelectDay={handleDaySelect}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
            activeFilter={calFilter}
            onFilter={setCalFilter}
            meetings={filteredMeetings}
            notes={filteredNotes}
          />

          <DayPanel
            selectedDate={selectedDate}
            currentDate={currentDate}
            data={dayPanelData}
            dailyNotes={filteredDailyNotes}
            allMeetings={filteredMeetings}
            allNotes={filteredNotes}
            onQuickAdd={openModal}
            onDeleteNote={deleteNote}
            activeFilter={calFilter}
          />
        </div>

        <CalendarFAB onClick={openModal} />
      </div>

      <NoteModal
        show={showNotePopup}
        selectedDate={selectedDate}
        newNote={newNote}
        noteTime={noteTime}
        saving={noteSaving}
        onNoteChange={setNewNote}
        onTimeChange={setNoteTime}
        onSubmit={addNote}
        onClose={() => {
          setShowNotePopup(false);
          setNewNote("");
          setNoteTime("09:00");
        }}
      />
    </div>
  );
}