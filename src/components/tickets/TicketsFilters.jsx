import { useState } from "react";
import { ChevronDown, X, Check, SlidersHorizontal } from "lucide-react";

const STATUS_OPTIONS   = ["Open", "Closed", "Resolved", "In Progress", "Pending"];
const PRIORITY_OPTIONS = ["High", "Medium", "Low", "Critical"];
const TYPE_OPTIONS     = ["Technical Issue", "Commission Issue", "Lead Issue"];

export const STATUS_STYLE = {
  "Open":        "text-[#0068FF] bg-[#E9F2FF]",
  "Closed":      "text-[#646464] bg-[#ebebeb]",
  "Resolved":    "text-[#0BB501] bg-[#EAFBF1]",
  "In Progress": "text-[#f59e0b] bg-[#fff8e3]",
  "Pending":     "text-[#ef4444] bg-[#FFEAEA]",
};

export const PRIORITY_STYLE = {
  "High":     "text-[#ef4444] bg-red-50",
  "Medium":   "text-[#f59e0b] bg-amber-50",
  "Low":      "text-[#0BB501] bg-emerald-50",
  "Critical": "text-[#7c3aed] bg-violet-50",
};

/* ── Popup shell (bottom-sheet mobile / centered desktop) ── */
function FilterPopup({ onClose, children }) {
  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className="md:hidden fixed inset-x-0 bottom-0 z-[71] bg-white rounded-t-3xl shadow-2xl max-h-[72vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        {children}
        <div className="h-6 shrink-0" />
      </div>
      <div className="hidden md:flex fixed inset-0 z-[71] items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm max-h-[75vh] flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </>
  );
}

/* ── List popup content ─────────────────────────────────── */
function ListContent({ title, options, value, onChange, onClose }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
          <X size={18} className="text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-3 scrollbar-hide">
        {/* All */}
        <button onClick={() => { onChange(""); onClose(); }}
          className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1
            ${!value ? "bg-[#F2F4FF] text-[#5323DC]" : "text-gray-700 hover:bg-gray-50"}`}>
          <span>All</span>
          {!value && <Check size={15} className="text-[#5323DC]" />}
        </button>
        {options.map(o => (
          <button key={o} onClick={() => { onChange(o); onClose(); }}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all mb-1
              ${value === o ? "bg-[#F2F4FF] text-[#5323DC]" : "text-gray-700 hover:bg-gray-50"}`}>
            <span>{o}</span>
            {value === o && <Check size={15} className="text-[#5323DC]" />}
          </button>
        ))}
      </div>
      <div className="px-5 pb-5 pt-2 shrink-0">
        <button onClick={() => { onChange(""); onClose(); }}
          className="w-full h-10 rounded-2xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50">
          Clear Selection
        </button>
      </div>
    </>
  );
}

/* ── Desktop chip ── */
function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 border rounded-[8px] px-3.5 py-[7px] text-[13px] font-medium bg-white whitespace-nowrap hover:border-gray-300 transition-colors
        ${active ? "border-[#5323DC] text-[#5323DC]" : "border-gray-200 text-gray-600"}`}>
      {label} <ChevronDown size={12} className={active ? "text-[#5323DC]" : "text-gray-400"} />
    </button>
  );
}

/* ── Mobile pill ── */
function Pill({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-[12px] font-medium whitespace-nowrap shrink-0 transition-colors
        ${active ? "border-[#5323DC] bg-[#F2F4FF] text-[#5323DC]" : "border-gray-200 bg-white text-gray-500"}`}>
      {label} <ChevronDown size={11} className={active ? "text-[#5323DC]" : "text-gray-400"} />
    </button>
  );
}

/**
 * TicketsFilters
 * Props: statusFilter, setStatusFilter, priorityFilter, setPriorityFilter,
 *        typeFilter, setTypeFilter, employeeOptions, employeeFilter, setEmployeeFilter,
 *        onReset
 */
export default function TicketsFilters({
  statusFilter   = "", setStatusFilter,
  priorityFilter = "", setPriorityFilter,
  typeFilter     = "", setTypeFilter,
  employeeOptions = [], employeeFilter = "", setEmployeeFilter,
  onReset,
}) {
  const [openKey, setOpenKey] = useState(null);

  const filterDefs = [
    { key: "status",   title: "Status",   label: statusFilter   ? `Status: ${statusFilter}`   : "Status: All",   active: !!statusFilter,   options: STATUS_OPTIONS,   set: setStatusFilter   },
    { key: "priority", title: "Priority", label: priorityFilter ? `Priority: ${priorityFilter}`: "Priority: All", active: !!priorityFilter, options: PRIORITY_OPTIONS, set: setPriorityFilter },
    { key: "employee", title: "Employee", label: employeeFilter ? `Employee: ${employeeFilter}`: "Employee: All", active: !!employeeFilter, options: employeeOptions,  set: setEmployeeFilter },
    { key: "type",     title: "Type",     label: typeFilter     ? `Type: ${typeFilter}`       : "Type: All",     active: !!typeFilter,     options: TYPE_OPTIONS,     set: setTypeFilter     },
    { key: "source",   title: "Source",   label: "Source: All",   active: false, options: ["Self", "Sales Person", "Territory Partner"], set: () => {} },
    { key: "project",  title: "Project",  label: "Project: All",  active: false, options: [], set: () => {} },
  ];

  const hasFilters = statusFilter || priorityFilter || typeFilter || employeeFilter;
  const active = filterDefs.find(f => f.key === openKey);

  const getValue = (key) => {
    if (key === "status")   return statusFilter;
    if (key === "priority") return priorityFilter;
    if (key === "type")     return typeFilter;
    if (key === "employee") return employeeFilter;
    return "";
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        <span className="text-[13px] font-semibold text-gray-500 shrink-0">Filters:</span>
        {filterDefs.map(f => (
          <Chip key={f.key} label={f.label} active={f.active} onClick={() => setOpenKey(f.key)} />
        ))}
        {hasFilters && (
          <button onClick={onReset}
            className="text-[13px] font-semibold text-red-500 hover:text-red-700 transition-colors ml-auto">
            Reset
          </button>
        )}
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        <div className="flex items-center gap-1.5 shrink-0">
          <SlidersHorizontal size={13} className="text-[#5323DC]" />
          <span className="text-[12px] font-bold text-gray-600 whitespace-nowrap">Filters</span>
        </div>
        {filterDefs.map(f => (
          <Pill key={f.key} label={f.label} active={f.active} onClick={() => setOpenKey(f.key)} />
        ))}
        {hasFilters && (
          <button onClick={onReset}
            className="text-[12px] font-bold text-red-500 whitespace-nowrap shrink-0 pl-1">
            Reset
          </button>
        )}
      </div>

      {/* Popup */}
      {openKey && active && (
        <FilterPopup onClose={() => setOpenKey(null)}>
          <ListContent
            title={active.title}
            options={active.options}
            value={getValue(openKey)}
            onChange={active.set}
            onClose={() => setOpenKey(null)}
          />
        </FilterPopup>
      )}
    </>
  );
}