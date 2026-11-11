import { useState } from "react";
import { Filter, ChevronDown, X, Check } from "lucide-react";

const GRADIENT = "linear-gradient(110.73deg, #5E23DC 0%, #7C3AED 100%)";

/* ── Separate popup per filter (bottom-sheet mobile / centered desktop) ── */
function FilterPopup({ title, options, value, onChange, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      {/* Mobile */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-[71] bg-white rounded-t-3xl shadow-2xl">
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>
        <PopupContent title={title} options={options} value={value} onChange={onChange} onClose={onClose} />
        <div className="h-6" />
      </div>
      {/* Desktop */}
      <div className="hidden md:flex fixed inset-0 z-[71] items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto scrollbar-hide">
          <PopupContent title={title} options={options} value={value} onChange={onChange} onClose={onClose} />
        </div>
      </div>
    </>
  );
}

function PopupContent({ title, options, value, onChange, onClose }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100"><X size={18} className="text-gray-400" /></button>
      </div>
      <div className="px-5 py-4 max-h-[55vh] overflow-y-auto scrollbar-hide">
        <div className="flex flex-col gap-1.5">
          <button onClick={() => { onChange("All"); onClose(); }}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${value === "All" ? "bg-[#F2F4FF] text-violet-600" : "text-gray-700 hover:bg-gray-50"}`}>
            <span>All</span>
            {value === "All" && <Check size={15} className="text-violet-600" />}
          </button>
          {options.map((o) => (
            <button key={o} onClick={() => { onChange(o); onClose(); }}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${value === o ? "bg-[#F2F4FF] text-violet-600" : "text-gray-700 hover:bg-gray-50"}`}>
              <span>{o}</span>
              {value === o && <Check size={15} className="text-violet-600" />}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pb-5 pt-2">
        <button onClick={() => { onChange("All"); onClose(); }}
          className="w-full h-10 rounded-2xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50">
          Clear Selection
        </button>
      </div>
    </>
  );
}

const STATUS_OPTIONS   = ["Active", "Inactive"];
const FOLLOWUP_OPTIONS = ["Pending", "Overdue", "Completed", "Scheduled", "None"];
const PERFORMANCE_OPTIONS = ["Very High", "High", "Medium", "Low", "New"];

/**
 * TerritoryFilters
 * Props: filters, onChange, onClear, states, cities
 */
export default function TerritoryFilters({ filters, onChange, onClear, states = [], cities = [] }) {
  const [openKey, setOpenKey] = useState(null);

  const stateOptions   = states.map(s => s.state);
  const cityOptions    = cities.map(c => c.city);

  const filterConfigs = [
    { key: "state",       label: "Territory State", options: stateOptions },
    { key: "city",        label: "Territory City",  options: cityOptions  },
    { key: "status",      label: "Status",          options: STATUS_OPTIONS },
    { key: "followup",    label: "Followup",        options: FOLLOWUP_OPTIONS },
    { key: "performance", label: "Performance",     options: PERFORMANCE_OPTIONS },
  ];

  const getLabel = (cfg) => {
    if (!filters[cfg.key] || filters[cfg.key] === "All") return cfg.label;
    return `${cfg.label}: ${filters[cfg.key]}`;
  };

  const isActive = (key) => filters[key] && filters[key] !== "All";
  const hasFilters = filterConfigs.some(c => isActive(c.key));

  return (
    <>
      <div className="bg-white rounded-[12px] border border-gray-100 shadow-sm overflow-hidden">

        {/* ── MOBILE: horizontal scroll ── */}
        <div className="flex md:hidden items-center gap-0">
          <div className="flex items-center gap-1.5 pl-4 pr-3 py-3.5 border-r border-gray-100 shrink-0">
            <Filter size={14} className="text-violet-500 shrink-0" />
            <span className="text-[12.5px] font-bold text-gray-700 whitespace-nowrap">Filters</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-3 px-3 flex-1 scrollbar-hide">
            {filterConfigs.map(cfg => (
              <button key={cfg.key} onClick={() => setOpenKey(cfg.key)}
                className={`relative shrink-0 appearance-none border rounded-full pl-3 pr-5 py-1.5 text-[12px] bg-white cursor-pointer outline-none whitespace-nowrap transition-colors
                  ${isActive(cfg.key) ? "border-violet-400 text-violet-600 font-semibold" : "border-gray-200 text-gray-400 font-normal"}`}>
                {getLabel(cfg)}
                <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </button>
            ))}
            {hasFilters && (
              <button onClick={onClear} className="text-[12px] font-semibold text-violet-600 whitespace-nowrap shrink-0 pl-1">Clear All</button>
            )}
          </div>
        </div>

        {/* ── DESKTOP: wrapped chips ── */}
        <div className="hidden md:block px-5 py-4">
          <div className="flex items-start gap-3 flex-wrap">
            <div className="flex items-center gap-2 pt-[7px] shrink-0">
              <Filter size={15} className="text-violet-500" />
              <span className="text-[13px] font-bold text-gray-700">Filters:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {filterConfigs.map(cfg => (
                <button key={cfg.key} onClick={() => setOpenKey(cfg.key)}
                  className={`relative inline-flex items-center gap-1.5 appearance-none border rounded-[8px] pl-3 pr-7 py-[7px] text-[13px] bg-white cursor-pointer outline-none hover:border-gray-300 transition-colors
                    ${isActive(cfg.key) ? "border-violet-400 text-violet-700 font-semibold" : "border-gray-200 text-gray-500"}`}>
                  {getLabel(cfg)}
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </button>
              ))}
            </div>
            {hasFilters && (
              <button onClick={onClear} className="text-[13px] font-semibold text-violet-600 hover:text-violet-800 transition-colors whitespace-nowrap pt-[7px] ml-auto">
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Individual filter popups */}
      {filterConfigs.map(cfg => openKey === cfg.key && (
        <FilterPopup
          key={cfg.key}
          title={cfg.label}
          options={cfg.options}
          value={filters[cfg.key] || "All"}
          onChange={(v) => onChange(cfg.key, v)}
          onClose={() => setOpenKey(null)}
        />
      ))}
    </>
  );
}