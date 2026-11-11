import { Search, Calendar, Download, MessageCircle, Plus, ChevronDown, SlidersHorizontal, ArrowLeft } from "lucide-react";
import CustomDateRangePicker from "../CustomDateRangePicker";
import { useNavigate } from "react-router-dom";
import DownloadCSV from "../DownloadCSV";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 100%)";

export default function CustomersHeader({ search, onSearch, filteredData, range, setRange, total }) {
  const navigate = useNavigate();
  return (
    <div className=" border-b ">

      {/* ── Desktop ── */}
      <div className="hidden md:flex flex-wrap items-center justify-between gap-4 px-8 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Customers</h1>
          <p className="text-xs text-slate-400 mt-0.5">Overview · Client Management · {total} total</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-md px-3.5 py-2 bg-white min-w-[260px]">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search customers..."
              className="outline-none text-xs text-slate-700 placeholder:text-slate-400 bg-transparent w-full"
            />
          </div>

          <CustomDateRangePicker range={range} setRange={setRange} />

          <DownloadCSV data={filteredData} filename="Customers.csv" />

          <button
            className="flex items-center gap-2 border border-[#5323DC] rounded-md px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity"
            style={{ color: "#5323DC" }}
          >
            <MessageCircle size={14} /> Post Update
          </button>
        </div>
      </div>

      {/* ── Mobile ── */}
      <div className="flex flex-col gap-3 md:hidden pb-4">
        <div className="relative flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
          <button onClick={()=>{navigate(-1)}} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} className="text-slate-900" strokeWidth={2.2} />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-slate-900">Customers</h1>
          <button
            className="opacity-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: GRADIENT }}
          >
            <Plus size={17} className="text-white" />
          </button>
        </div>

        <div className="px-4">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search customers..."
              className="outline-none text-sm text-slate-700 placeholder:text-slate-400 bg-transparent w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 px-4">
          <div className="flex-1" />
          <button className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
            <Download size={15} className="text-[#5323DC]" />
          </button>
          <CustomDateRangePicker range={range} setRange={setRange} />
        </div>
      </div>
    </div>
  );
}