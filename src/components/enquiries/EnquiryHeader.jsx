import { Search, Plus, ArrowLeft, Upload, ChevronDown, SlidersHorizontal } from "lucide-react";
import DownloadCSV from "../DownloadCSV";
import CustomDateRangePicker from "../CustomDateRangePicker";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 100%)";

const sources = ["Select Enquiry Source", "Ads", "Onsite", "Direct", "CSV", "Landing Page", "Digital Broker"];

export default function EnquiryHeader({ search, setSearch, selectedSource, setSelectedSource, onAddEnquiry, onAddCSV, filteredData, range, setRange }) {
  const navigate = useNavigate();
  const {isActiveSubscription} = useAuth();
  return (
    <div className="bg-white border-b border-slate-100">

      {/* ── Mobile ── */}
      <div className="md:hidden p-4 space-y-3">
        <div className="flex items-center justify-between">
          <button onClick={()=>{navigate(-1)}} className="p-1.5 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} className="text-slate-900" strokeWidth={2.2} />
          </button>
          <h1 className="text-xl font-semibold text-slate-900">Enquiries</h1>
          <button onClick={onAddEnquiry} className="text-white p-2.5 rounded-full shadow-lg" style={{ background: GRADIENT }}>
            <Plus size={18} />
          </button>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, contact, source..." className="w-full bg-[#F2F4FF] rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none" />
        </div>

        <div className="flex flex-wrap gap-2">
          <SourceSelect value={selectedSource} onChange={setSelectedSource} />
          <button onClick={onAddCSV} className="bg-[#F2F4FF] p-2.5 rounded-xl"><Upload size={15} className="text-slate-500" /></button>
          {/* Disable Button if Inactive Subscription */}
          {isActiveSubscription && (
            <DownloadCSV data={filteredData} filename="Enquirers.csv" />
          )}
        </div>
      </div>

      {/* ── Desktop ── */}
      <div className="hidden md:flex flex-wrap gap-3 items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-slate-900">Enquiries</h1>
          <SourceSelect value={selectedSource} onChange={setSelectedSource} />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search anything..." className="w-56 pl-9 pr-4 py-2 border rounded-md text-sm outline-none focus:border-[#5323DC] bg-white" />
          </div>
          <CustomDateRangePicker range={range} setRange={setRange} />
          <button onClick={onAddCSV} className="flex items-center gap-2 border px-3.5 py-2 rounded-md bg-white text-sm text-slate-600 hover:bg-slate-50">
            <Upload size={14} /> Import CSV
          </button>
          {/* Disable Button if Inactive Subscription */}
          {isActiveSubscription && (
            <DownloadCSV data={filteredData} filename="Enquirers.csv" />
          )}
          <button onClick={onAddEnquiry} className="flex items-center gap-2 text-white px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity bg-[#5323DC]">
            <Plus size={15} /> Add Enquiry
          </button>
        </div>
      </div>
    </div>
  );
}

function SourceSelect({ value, onChange }) {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-[#F2F4FF] px-3 py-2 md:py-1.5 rounded-md text-sm md:text-xs text-slate-600 cursor-pointer select-none">
        <span>{value === "Select Enquiry Source" ? "All Sources" : value}</span>
        <ChevronDown size={14} />
      </div>
      <select className="absolute inset-0 opacity-0 cursor-pointer w-full" value={value} onChange={(e) => onChange(e.target.value)}>
        {sources.map((s) => <option key={s} value={s}>{s === "Select Enquiry Source" ? "All Sources" : s}</option>)}
      </select>
    </div>
  );
}