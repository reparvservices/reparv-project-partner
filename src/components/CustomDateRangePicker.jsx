import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { DateRange } from "react-date-range";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

// ── Breakpoints ───────────────────────────────────────────────────────────────
// < MD_BP  → mobile/tablet: bottom sheet
// ≥ MD_BP  → desktop: centered popup modal
const MD_BP = 768;

const shortcuts = [
  { label: "Today",      getValue: () => [new Date(), new Date()] },
  { label: "This week",  getValue: () => [startOfWeek(new Date()), endOfWeek(new Date())] },
  { label: "This month", getValue: () => [startOfMonth(new Date()), endOfMonth(new Date())] },
  {
    label: "This year",
    getValue: () => [
      new Date(new Date().getFullYear(), 0, 1),
      new Date(new Date().getFullYear(), 11, 31, 23, 59, 59),
    ],
  },
  { label: "Set up", getValue: () => [new Date(), new Date()] },
];

const fmt = (d) => {
  if (!d) return "";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const CalIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Violet/purple theme overrides for react-date-range ────────────────────────
const RDR_CSS = `
  .rdrCalendarWrapper,.rdrDateRangePickerWrapper,.rdrDateDisplayWrapper{background:transparent!important}
  .rdrMonthAndYearPickers select{color:#1e1b4b}
  .rdrDayToday .rdrDayNumber span:after{background:#5323DC!important}
  .rdrSelected,.rdrStartEdge,.rdrEndEdge,.rdrInRange{color:#5323DC!important}
  .rdrDay:not(.rdrDayPassive) .rdrInRange~.rdrDayNumber span,
  .rdrDay:not(.rdrDayPassive) .rdrStartEdge~.rdrDayNumber span,
  .rdrDay:not(.rdrDayPassive) .rdrEndEdge~.rdrDayNumber span,
  .rdrDay:not(.rdrDayPassive) .rdrSelected~.rdrDayNumber span{color:#fff!important}
  .rdrDayStartPreview,.rdrDayEndPreview,.rdrDayInPreview{border-color:#8B5CF6!important}
  .rdrMonthAndYearPickers select:hover{background:#ede9fe}
  .rdrPprevButton i{border-color:transparent #5323DC transparent transparent!important}
  .rdrNextButton i{border-color:transparent transparent transparent #5323DC!important}
  .rdrMonthPicker select,.rdrYearPicker select{font-weight:600}
  /* Mobile calendar: shrink to fit 300 px */
  .rdr-mobile .rdrMonth{width:100%!important}
  .rdrCalendarWrapper.rdr-mobile{width:100%!important;font-size:13px!important}
  .rdr-mobile .rdrDay{height:34px!important}
  .rdr-mobile .rdrDayNumber span{font-size:12px!important}
  .rdr-mobile .rdrWeekDay{font-size:11px!important}
  .rdr-mobile .rdrMonthAndYearPickers{font-size:13px!important}
  /* Popup animation */
  @keyframes popupIn {
    from { opacity:0; transform:scale(0.95) translateY(8px); }
    to   { opacity:1; transform:scale(1)   translateY(0);    }
  }
  .rdr-popup { animation: popupIn 0.18s ease-out forwards; }
  /* Bottom-sheet animation */
  @keyframes sheetUp {
    from { transform: translateY(100%); }
    to   { transform: translateY(0);    }
  }
  .rdr-sheet { animation: sheetUp 0.25s cubic-bezier(0.32,0.72,0,1) forwards; }
`;

const GRAD = "linear-gradient(94.94deg,#5E23DC -8.34%,#8B5CF6 97.17%)";

/**
 * CustomDateRangePicker
 *
 * < md  (< 768px) → bottom sheet  (calendar icon-only trigger on small screens)
 * ≥ md  (≥ 768px) → centered popup modal with backdrop blur
 *
 * Props:
 *   range    : [{ startDate, endDate, key }]
 *   setRange : fn(range)
 */
export default function CustomDateRangePicker({ range = [{}], setRange }) {
  const [activeShortcut, setActiveShortcut] = useState(null);
  const [open,     setOpen]     = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= MD_BP);

  const trigRef = useRef(null);
  const dropRef = useRef(null);

  // ── Breakpoint detection ──────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => setIsDesktop(window.innerWidth >= MD_BP);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // ── Outside click / touch ─────────────────────────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if (
        trigRef.current && !trigRef.current.contains(e.target) &&
        dropRef.current && !dropRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    document.addEventListener("touchstart", fn);
    return () => {
      document.removeEventListener("mousedown", fn);
      document.removeEventListener("touchstart", fn);
    };
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggle = () => setOpen(o => !o);

  const pickShortcut = (s) => {
    const [start, end] = s.getValue();
    setActiveShortcut(s.label);
    setRange([{ startDate: start, endDate: end, key: "selection" }]);
  };

  const cancel = () => {
    setOpen(false);
    setActiveShortcut(null);
    setRange([{ startDate: null, endDate: null, key: "selection" }]);
  };

  const apply = () => setOpen(false);

  const hasRange = range[0]?.startDate && range[0]?.endDate;

  // ── Shared: shortcut list ─────────────────────────────────────────────────
  // horizontal=true  → pill row (mobile sheet header)
  // horizontal=false → vertical sidebar (desktop popup)
  const Shortcuts = ({ horizontal = false }) => (
    <div
      className={
        horizontal
          ? "flex flex-wrap gap-1.5 px-3 py-2.5 border-b border-violet-100 bg-violet-50/60"
          : "flex flex-col gap-0.5 p-2 border-r border-violet-100 bg-gradient-to-b from-violet-50 to-white"
      }
      style={!horizontal ? { width: 140, flexShrink: 0 } : {}}
    >
      {shortcuts.map((s, i) => {
        const on = activeShortcut === s.label;
        return (
          <button
            key={i}
            onClick={() => pickShortcut(s)}
            className={`flex items-center gap-2 rounded-lg text-sm cursor-pointer select-none transition-all text-left
              ${horizontal ? "px-3 py-1.5" : "px-2.5 py-2 w-full"}
              ${on ? "text-white font-semibold shadow-sm" : "text-gray-600 hover:bg-violet-100 hover:text-[#5323DC]"}`}
            style={on ? { background: GRAD } : {}}
          >
            <span
              className={`w-3 h-3 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                ${on ? "border-white" : "border-gray-300"}`}
            >
              {on && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            <span className="whitespace-nowrap leading-none">{s.label}</span>
          </button>
        );
      })}
    </div>
  );

  // ── Shared: footer ────────────────────────────────────────────────────────
  const Footer = () => (
    <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-violet-100 bg-white flex-shrink-0">
      <span className="text-xs text-gray-400 truncate flex-1 min-w-0">
        {hasRange
          ? `${fmt(range[0].startDate)} – ${fmt(range[0].endDate)}`
          : "No range selected"}
      </span>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={cancel}
          className="px-3 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={apply}
          className="px-3 py-1.5 text-sm text-white rounded-lg font-semibold cursor-pointer shadow-sm hover:opacity-90 active:scale-95 transition-all"
          style={{ background: GRAD }}
        >
          Apply
        </button>
      </div>
    </div>
  );

  // ── Portal ────────────────────────────────────────────────────────────────
  const portal = open && createPortal(
    <>
      <style>{RDR_CSS}</style>

      {/* ═══════════════════════════════════════════════
          MOBILE / TABLET  (< 768px) — bottom sheet
      ═══════════════════════════════════════════════ */}
      {!isDesktop && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm cursor-pointer" onClick={cancel}
          />

          {/* Sheet */}
          <div
            ref={dropRef}
            className="rdr-sheet fixed bottom-0 left-0 right-0 z-[9999] bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "90vh", minWidth: 300 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 flex-shrink-0">
              <div>
                <p className="text-[15px] font-semibold text-gray-900">Select Date Range</p>
                {hasRange && (
                  <p className="text-xs text-violet-600 mt-0.5">
                    {fmt(range[0].startDate)} – {fmt(range[0].endDate)}
                  </p>
                )}
              </div>
              <button
                onClick={cancel}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <XIcon />
              </button>
            </div>

            {/* Shortcut pills */}
            <div className="flex-shrink-0">
              <Shortcuts horizontal />
            </div>

            {/* Scrollable calendar */}
            <div className="flex-1 overflow-y-auto rdr-mobile">
              <div className="px-2 py-1" style={{ minWidth: 300 }}>
                <DateRange
                  ranges={range}
                  onChange={item => setRange([item.selection])}
                  showSelectionPreview
                  moveRangeOnFirstSelection={false}
                  months={1}
                  direction="vertical"
                  rangeColors={["#5323DC"]}
                  editableDateInputs
                  showDateDisplay={false}
                  className="rdr-mobile"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <Footer />
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════
          DESKTOP  (≥ 768px) — centered popup modal
      ═══════════════════════════════════════════════ */}
      {isDesktop && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm cursor-pointer" onClick={cancel}
          />

          {/* Centered popup */}
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              ref={dropRef}
              className="rdr-popup pointer-events-auto bg-white rounded-2xl shadow-2xl shadow-violet-300/30 border border-violet-200 overflow-hidden flex flex-col"
              style={{ width: "min(560px, calc(100vw - 32px))", maxHeight: "90vh" }}
            >
              {/* Popup header */}
              <div
                className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b border-violet-100"
                style={{ background: "linear-gradient(135deg,#f5f3ff 0%,#ede9fe 100%)" }}
              >
                <div>
                  <p className="text-base font-bold text-gray-900">Select Date Range</p>
                  {hasRange ? (
                    <p className="text-xs font-medium mt-0.5" style={{ color: "#5323DC" }}>
                      {fmt(range[0].startDate)} – {fmt(range[0].endDate)}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-0.5">Choose start and end dates</p>
                  )}
                </div>
                <button
                  onClick={cancel}
                  className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-white/80 hover:text-gray-600 cursor-pointer transition-colors"
                >
                  <XIcon />
                </button>
              </div>

              {/* Body: sidebar + calendar */}
              <div className="flex flex-1 overflow-hidden min-h-0">
                <Shortcuts />
                <div className="flex-1 overflow-y-auto p-2">
                  <DateRange
                    ranges={range}
                    onChange={item => setRange([item.selection])}
                    showSelectionPreview
                    moveRangeOnFirstSelection={false}
                    months={1}
                    direction="vertical"
                    rangeColors={["#5323DC"]}
                    editableDateInputs
                    showDateDisplay={false}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <Footer />
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  );

  // ── Trigger button ────────────────────────────────────────────────────────
  return (
    <>
      <div ref={trigRef} className="inline-flex">
        <button
          onClick={toggle}
          className={`flex items-center justify-between gap-2 h-9 px-3 rounded-md text-xs font-semibold cursor-pointer transition-all border
            ${open
              ? "border-[#5323DC] ring-2 ring-violet-200 text-[#5323DC] bg-violet-50"
              : "border-gray-200 text-gray-600 bg-white hover:border-violet-400 hover:text-violet-600"
            }`}
          style={{ minWidth: isDesktop ? 180 : 36 }}
        >
          {/* Mobile: icon only to save space */}
          {!isDesktop ? (
            <CalIcon />
          ) : (
            <>
              <span className="truncate">
                {hasRange
                  ? `${fmt(range[0].startDate)} – ${fmt(range[0].endDate)}`
                  : "Select Date Range"}
              </span>
              <CalIcon />
            </>
          )}
        </button>
      </div>

      {portal}
    </>
  );
}