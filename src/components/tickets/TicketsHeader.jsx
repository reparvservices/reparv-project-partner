import { Search, Download, Plus, ArrowLeft, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomDateRangePicker from "../CustomDateRangePicker";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 97.17%)";

const generators = ["Self", "Sales Person", "Territory Partner"];

/**
 * TicketsHeader
 * Props: searchTerm, onSearch, onAdd, range, setRange,
 *        selectedGenerator, setSelectedGenerator
 */
export default function TicketsHeader({
  searchTerm = "", onSearch, onAdd,
  range, setRange,
  selectedGenerator = "Select Ticket Generator",
  setSelectedGenerator,
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b border-gray-100">

      {/* ── DESKTOP ── */}
      <div className="hidden md:flex flex-wrap items-center justify-between gap-4 px-8 py-[18px]">
        {/* Left */}
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight">Total Tickets</h1>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
            <span className="hover:text-[#5323DC] cursor-pointer transition-colors">Dashboard</span>
            <span className="text-gray-300">›</span>
            <span className="hover:text-[#5323DC] cursor-pointer transition-colors">Tickets</span>
            <span className="text-gray-300">›</span>
            <span className="text-[#5323DC] font-semibold">Total Tickets</span>
          </p>
        </div>

        {/* Right controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Generator selector */}
          <div className="relative">
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-md px-3.5 py-[7px] bg-white text-[12px] text-gray-700 font-medium cursor-pointer whitespace-nowrap hover:border-gray-300 transition-colors">
              <span>{selectedGenerator === "Select Ticket Generator" ? "All Generators" : selectedGenerator}</span>
              <ChevronDown size={13} className="text-gray-400" />
            </div>
            <select value={selectedGenerator} onChange={e => setSelectedGenerator?.(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
              <option value="Select Ticket Generator">All Generators</option>
              {generators.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3.5 py-[7px] bg-white min-w-[240px] focus-within:border-[#5323DC] transition-colors">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input value={searchTerm} onChange={e => onSearch?.(e.target.value)}
              placeholder="Search ticket ID, issue..."
              className="outline-none text-[12px] text-gray-700 placeholder:text-gray-400 bg-transparent w-full" />
          </div>

          {/* Date Range */}
          {range && setRange && (
            <div className="shrink-0 z-50">
              <CustomDateRangePicker range={range} setRange={setRange} />
            </div>
          )}

          {/* Export */}
          <button className="flex items-center gap-2 border border-gray-200 rounded-md px-3.5 py-[8px] text-[12px] text-gray-700 font-medium bg-white hover:border-gray-300 transition-colors whitespace-nowrap">
            <Download size={14} className="text-gray-500" />
            Export
          </button>

          {/* Create Ticket */}
          <button onClick={onAdd}
            className="flex items-center gap-2 px-5 py-2 bg-[#5323DC] text-white text-[13px] font-bold rounded-md whitespace-nowrap shadow-[0_4px_14px_rgba(83,35,220,0.3)] hover:opacity-90 transition-opacity"
            >
            <Plus size={15} strokeWidth={2.5} />
            Create Ticket
          </button>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="flex flex-col md:hidden">
        {/* Row 1: ← Title + FAB */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-0 bg-transparent border-none cursor-pointer">
              <ArrowLeft size={20} className="text-gray-900" strokeWidth={2.2} />
            </button>
            <div>
              <h1 className="text-[18px] font-bold text-gray-900 leading-tight">Total Tickets</h1>
              <p className="text-[10px] text-gray-400">
                Dashboard › Tickets › <span className="text-[#5323DC] font-semibold">Total Tickets</span>
              </p>
            </div>
          </div>
          <button onClick={onAdd}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(83,35,220,0.35)] hover:opacity-90 shrink-0"
            style={{ background: GRADIENT }}>
            <Plus size={18} className="text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Row 2: Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2.5 border border-gray-200 rounded-xl px-4 py-[11px] focus-within:border-[#5323DC] transition-all">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input value={searchTerm} onChange={e => onSearch?.(e.target.value)}
              placeholder="Search ticket ID, issue..."
              className="outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent w-full" />
          </div>
        </div>

        {/* Row 3: date + export */}
        <div className="flex items-center gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {range && setRange && (
            <div className="shrink-0 z-50">
              <CustomDateRangePicker range={range} setRange={setRange} />
            </div>
          )}
          {/* Generator */}
          <div className="relative shrink-0">
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-[10px] px-3.5 py-2 text-[13px] text-gray-700 font-medium whitespace-nowrap">
              {selectedGenerator === "Select Ticket Generator" ? "All" : selectedGenerator}
              <ChevronDown size={12} className="text-gray-500" />
            </div>
            <select value={selectedGenerator} onChange={e => setSelectedGenerator?.(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
              <option value="Select Ticket Generator">All</option>
              {generators.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <button className="flex items-center justify-center border border-gray-200 rounded-[10px] w-10 h-9 shrink-0 hover:bg-gray-50">
            <Download size={15} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}