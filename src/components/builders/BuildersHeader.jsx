import { useState } from "react";
import {
  Search, Plus, ChevronDown, ArrowLeft,
  SlidersHorizontal, X, Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomDateRangePicker from "../../components/CustomDateRangePicker";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 97.17%)";

/* ── Toggle ─────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)}
      className={`relative w-10 h-[22px] rounded-full transition-all duration-200 focus:outline-none flex-shrink-0 ${
        checked ? "bg-[#5323DC]" : "bg-gray-200"
      }`}>
      <span className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${
        checked ? "left-[21px]" : "left-[3px]"
      }`} />
    </button>
  );
}

/* ── Shared popup shell (bottom-sheet mobile / centered desktop) ── */
function FilterPopup({ onClose, children }) {
  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      {/* Mobile */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-[71] bg-white rounded-t-3xl shadow-2xl max-h-[75vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        {children}
        <div className="h-6 shrink-0" />
      </div>
      {/* Desktop */}
      <div className="hidden md:flex fixed inset-0 z-[71] items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[75vh] flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </>
  );
}

/* ── Searchable list popup content ──────────────────────── */
function SearchableListContent({ title, searchPlaceholder, options, value, onChange, onClose, allLabel }) {
  const [search, setSearch] = useState("");
  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
          <X size={18} className="text-gray-400" />
        </button>
      </div>
      {/* Search */}
      <div className="px-5 py-3 shrink-0">
        <div className="flex items-center gap-2.5 bg-gray-100 rounded-xl px-4 py-[9px] focus-within:ring-2 focus-within:ring-violet-100 transition-all">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent w-full" />
          {search && (
            <button onClick={() => setSearch("")} className="shrink-0">
              <X size={13} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>
      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-2 scrollbar-hide">
        {/* All option */}
        <button
          onClick={() => { onChange(""); onClose(); }}
          className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1
            ${!value ? "bg-[#F2F4FF] text-[#5323DC]" : "text-gray-700 hover:bg-gray-50"}`}>
          <span>{allLabel}</span>
          {!value && <Check size={15} className="text-[#5323DC]" />}
        </button>
        {filtered.length === 0
          ? <p className="text-center text-gray-400 text-sm py-6">No results found</p>
          : filtered.map(o => (
            <button key={o}
              onClick={() => { onChange(o); onClose(); }}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1
                ${value === o ? "bg-[#F2F4FF] text-[#5323DC]" : "text-gray-700 hover:bg-gray-50"}`}>
              <span>{o}</span>
              {value === o && <Check size={15} className="text-[#5323DC]" />}
            </button>
          ))
        }
      </div>
      {/* Clear */}
      <div className="px-5 pb-5 pt-2 shrink-0">
        <button onClick={() => { onChange(""); onClose(); }}
          className="w-full h-10 rounded-2xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
          Clear Selection
        </button>
      </div>
    </>
  );
}

/* ── Filter chip button ──────────────────────────────────── */
function FilterChip({ label, active, onClick, mobile }) {
  const base = `flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors`;
  if (mobile) {
    return (
      <button onClick={onClick}
        className={`${base} rounded-[10px] px-3.5 py-2 text-[13px] font-medium shrink-0
          ${active ? "bg-[#5323DC] text-white" : "bg-gray-100 text-gray-700"}`}>
        {label} <ChevronDown size={12} className={active ? "text-white/80" : "text-gray-500"} />
      </button>
    );
  }
  return (
    <button onClick={onClick}
      className={`${base} border rounded-[6px] px-3.5 py-[6px] text-[12px] font-medium bg-white hover:border-gray-300
        ${active ? "border-[#5323DC] text-[#5323DC]" : "border-gray-200 text-gray-700"}`}>
      {label} <ChevronDown size={13} className={active ? "text-[#5323DC]" : "text-gray-400"} />
    </button>
  );
}

/* ════════════════════════════════════════════════════════════
   BuildersHeader
   Props: searchTerm, onSearch, onAdd, range, setRange,
          stateFilter, setStateFilter, states,
          cityFilter,  setCityFilter,  cities
════════════════════════════════════════════════════════════ */
export default function BuildersHeader({
  searchTerm = "", onSearch, onAdd,
  range, setRange,
  stateFilter = "", setStateFilter, states = [],
  cityFilter  = "", setCityFilter,  cities  = [],
}) {
  const navigate = useNavigate();
  const [verified, setVerified]   = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen,  setCityOpen]  = useState(false);

  /* When state changes, reset city */
  const handleStateChange = (val) => {
    setStateFilter(val);
    setCityFilter("");
  };

  const stateLabel = stateFilter || "State";
  const cityLabel  = cityFilter  || "City";

  return (
    <div className="bg-white border-b border-gray-100">

      {/* ══════════ DESKTOP ══════════ */}
      <div className="hidden md:flex items-center justify-between gap-4 px-8 py-[18px] flex-wrap">
        {/* Title */}
        <div className="max-w-[280px] shrink-0">
          <h1 className="text-[20px] font-bold text-[#1E293B]">Builders Network</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Manage your construction partnerships and collaborations
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-[6px] px-4 py-[6px] bg-gray-50 min-w-[200px] focus-within:border-[#5323DC] transition-colors">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input value={searchTerm} onChange={e => onSearch?.(e.target.value)}
              placeholder="Search anything..."
              className="outline-none text-[12px] text-gray-700 placeholder:text-gray-400 bg-transparent w-full" />
          </div>

          {/* Date Range */}
          {range && setRange && (
            <div className="shrink-0 z-50">
              <CustomDateRangePicker range={range} setRange={setRange} />
            </div>
          )}

          {/* State filter */}
          <FilterChip label={stateLabel} active={!!stateFilter} onClick={() => setStateOpen(true)} />

          {/* City filter — disabled hint if no state yet */}
          <FilterChip
            label={!stateFilter ? "Select State First" : cityLabel}
            active={!!cityFilter}
            onClick={() => stateFilter && setCityOpen(true)}
          />

          {/* Verified toggle */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-[6px] px-3.5 py-[6px] bg-white text-[12px] text-gray-700 font-medium whitespace-nowrap">
            Verified <Toggle checked={verified} onChange={setVerified} />
          </div>

          {/* Add Builder */}
          <button onClick={onAdd}
            className="flex items-center gap-2 px-5 py-[8px] text-white text-[12px] font-bold rounded-[6px] whitespace-nowrap shadow-[0_4px_14px_rgba(83,35,220,0.3)] hover:opacity-90 transition-opacity"
            style={{ background: GRADIENT }}>
            <Plus size={15} strokeWidth={2.5} />
            Add Builder
          </button>
        </div>
      </div>

      {/* ══════════ MOBILE ══════════ */}
      <div className="flex flex-col md:hidden">
        {/* Row 1: ← Title + FAB */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-0 bg-transparent border-none cursor-pointer">
              <ArrowLeft size={20} className="text-gray-900" strokeWidth={2.2} />
            </button>
            <h1 className="text-[18px] font-semibold text-gray-900 tracking-tight">Builders Network</h1>
          </div>
          <button onClick={onAdd}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(83,35,220,0.35)] hover:opacity-90 transition-opacity shrink-0"
            style={{ background: GRADIENT }}>
            <Plus size={18} className="text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Row 2: Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2.5 bg-gray-100 rounded-xl px-4 py-[11px] focus-within:ring-2 focus-within:ring-violet-100 transition-all">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input value={searchTerm} onChange={e => onSearch?.(e.target.value)}
              placeholder="Search builders, projects..."
              className="outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent w-full" />
          </div>
        </div>

        {/* Row 3: filter chips */}
        <div className="flex items-center gap-2 px-4 pb-3.5 overflow-x-auto scrollbar-hide">
          {/* Date picker */}
          {range && setRange && (
            <div className="shrink-0 z-50">
              <CustomDateRangePicker range={range} setRange={setRange} />
            </div>
          )}

          {/* State chip */}
          <FilterChip label={stateLabel} active={!!stateFilter} onClick={() => setStateOpen(true)} mobile />

          {/* City chip */}
          <FilterChip
            label={!stateFilter ? "City" : cityLabel}
            active={!!cityFilter}
            onClick={() => stateFilter && setCityOpen(true)}
            mobile
          />

          {/* Verified toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-[10px] px-3.5 py-2 text-[13px] text-gray-700 font-medium cursor-pointer whitespace-nowrap shrink-0">
            Verified <Toggle checked={verified} onChange={setVerified} />
          </div>

          {/* Sliders */}
          <div className="flex items-center bg-gray-100 rounded-[10px] px-3 py-2 cursor-pointer shrink-0">
            <SlidersHorizontal size={14} className="text-gray-500" />
          </div>
        </div>
      </div>

      {/* ── State popup ── */}
      {stateOpen && (
        <FilterPopup onClose={() => setStateOpen(false)}>
          <SearchableListContent
            title="Select State"
            searchPlaceholder="Search state..."
            options={states}
            value={stateFilter}
            onChange={handleStateChange}
            onClose={() => setStateOpen(false)}
            allLabel="All States"
          />
        </FilterPopup>
      )}

      {/* ── City popup ── */}
      {cityOpen && stateFilter && (
        <FilterPopup onClose={() => setCityOpen(false)}>
          <SearchableListContent
            title={`Select City — ${stateFilter}`}
            searchPlaceholder="Search city..."
            options={cities}
            value={cityFilter}
            onChange={setCityFilter}
            onClose={() => setCityOpen(false)}
            allLabel="All Cities"
          />
        </FilterPopup>
      )}
    </div>
  );
}