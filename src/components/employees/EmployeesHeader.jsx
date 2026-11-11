import {
  Search,
  Calendar,
  Download,
  Plus,
  ArrowLeft,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomDateRangePicker from "../CustomDateRangePicker";
import DownloadCSV from "../DownloadCSV";

const GRADIENT = "linear-gradient(110.73deg, #5E23DC 0%, #7C3AED 100%)";

export default function EmployeesHeader({
  search,
  onSearch,
  onAdd,
  filteredData,
  range,
  setRange,
}) {
  const navigate = useNavigate();
  return (
    <div className="border-b">
      {/* ── DESKTOP ── */}
      <div className="hidden md:flex flex-wrap items-center justify-between gap-6 px-8 py-4 bg-white">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 tracking-tight leading-tight">
            Employees
          </h1>
          <p className="text-[12.5px] text-gray-400 mt-0.5">
            Dashboard / Employees
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 flex-1 justify-end">
          <div className="flex items-center gap-2 border border-gray-200 rounded-[6px] px-3.5 py-[8px] bg-white min-w-[300px]">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search anything..."
              className="outline-none text-[13px] text-gray-700 placeholder:text-gray-400 bg-transparent w-full"
            />
          </div>

          {/* Date Range */}
          {range && setRange && (
            <div className="shrink-0 z-50">
              <CustomDateRangePicker range={range} setRange={setRange} />
            </div>
          )}
          <button className="flex items-center gap-2 border border-gray-200 rounded-[6px] px-3.5 py-[8px] text-[12px] text-gray-700 font-medium bg-white hover:bg-gray-50 whitespace-nowrap">
            <Download size={14} className="text-gray-500" /> Export CSV
          </button>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-[8px] text-white text-[12px] font-bold rounded-[6px] whitespace-nowrap hover:opacity-90 transition-opacity shadow-[0_4px_12px_rgba(94,35,220,0.28)]"
            style={{ background: GRADIENT }}
          >
            <Plus size={14} strokeWidth={2.5} /> Add Employee
          </button>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="flex flex-col gap-4 md:hidden pb-4">
        <div className="relative flex items-center justify-between px-4 p-4 border-b bg-white">
          <button
            onClick={() => navigate(-1)}
            className="p-0 bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={20} className="text-gray-900" strokeWidth={2.2} />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold text-gray-900">
            Employees
          </h1>
          <button
            onClick={onAdd}
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(94,35,220,0.4)] hover:opacity-90 transition-opacity"
            style={{ background: GRADIENT }}
          >
            <Plus size={18} className="text-white" strokeWidth={2.5} />
          </button>
        </div>
        <div className="px-4">
          <div className="flex items-center gap-2 bg-white border rounded-[12px] px-4 py-[11px]">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search employees..."
              className="outline-none text-[13.5px] text-gray-700 placeholder:text-gray-400 bg-transparent w-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-4">
          {/* Date picker */}
          {range && setRange && (
            <div className="shrink-0 z-50">
              <CustomDateRangePicker range={range} setRange={setRange} />
            </div>
          )}
          <div className="flex-1" />
          <DownloadCSV data={filteredData} filename="Employees.csv" />
          <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-[10px] hover:bg-gray-50">
            <SlidersHorizontal size={16} className="text-violet-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
