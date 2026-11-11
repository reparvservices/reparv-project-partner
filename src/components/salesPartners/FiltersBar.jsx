import { useState } from "react";
import { ChevronDown, X, Check } from "lucide-react";

const GRADIENT = "linear-gradient(110.73deg, #5E23DC 0%, #7C3AED 100%)";

const PAYMENT_OPTIONS  = ["Paid", "Pending", "Free", "Unpaid", "Follow Up"];
const FOLLOWUP_OPTIONS = [
  "New", "CNR1", "CNR2", "CNR3", "CNR4", "Switch Off", "Call Busy",
  "Call Back", "Not Responding (After Follow Up)", "Call Cut / Disconnected",
  "Invalid Number", "Wrong Number", "Form Filled By Mistake", "Repeat Lead",
  "Lead Clash", "Details Shared", "Not Interested", "Interested",
  "Documents Collected", "Payment Done",
];

/* ── Single-filter popup ─────────────────────────────────── */
function FilterPopup({ title, options, value, onChange, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm cursor-pointer" onClick={onClose} />

      {/* Mobile: bottom-sheet */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-[71] bg-white rounded-t-3xl shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <PopupContent title={title} options={options} value={value} onChange={onChange} onClose={onClose} />
        <div className="h-6" />
      </div>

      {/* Desktop: centered modal */}
      <div className="hidden md:flex fixed inset-0 z-[71] items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
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
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
          <X size={18} className="text-gray-400" />
        </button>
      </div>
      <div className="px-5 py-4 max-h-[55vh] overflow-y-auto scrollbar-hide">
        <div className="flex flex-col gap-1.5">
          {/* All option */}
          <button
            onClick={() => { onChange(""); onClose(); }}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all
              ${!value ? "bg-[#F2F4FF] text-violet-600" : "text-gray-700 hover:bg-gray-50"}`}
          >
            <span>All</span>
            {!value && <Check size={15} className="text-violet-600" />}
          </button>
          {options.map((o) => (
            <button key={o}
              onClick={() => { onChange(o); onClose(); }}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${value === o ? "bg-[#F2F4FF] text-violet-600" : "text-gray-700 hover:bg-gray-50"}`}
            >
              <span>{o}</span>
              {value === o && <Check size={15} className="text-violet-600" />}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pb-5 pt-2">
        <button onClick={() => { onChange(""); onClose(); }}
          className="w-full h-10 rounded-2xl border border-gray-200 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
          Clear Selection
        </button>
      </div>
    </>
  );
}

/* ── Filter pill button ──────────────────────────────────── */
function FilterPill({ label, active, onClick, mobile }) {
  if (mobile) {
    return (
      <button onClick={onClick}
        className={`shrink-0 snap-start border rounded-full px-4 py-2 text-[13px] font-medium bg-white whitespace-nowrap transition-colors
          ${active ? "border-violet-400 text-violet-600" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
        {label}
      </button>
    );
  }
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 border rounded-[8px] px-3.5 py-2 text-[13px] font-medium bg-white hover:border-gray-300 transition-colors whitespace-nowrap
        ${active ? "border-violet-400 text-violet-600" : "border-gray-200 text-gray-700"}`}>
      {label}
      <ChevronDown size={13} className={active ? "text-violet-400" : "text-gray-400"} />
    </button>
  );
}

/**
 * FiltersBar
 * Props: paymentFilter, setPaymentFilter, followupFilter, setFollowupFilter,
 *        stateFilter, setStateFilter, cityFilter, setCityFilter,
 *        states, cities, onClear
 */
export default function FiltersBar({
  paymentFilter  = "", setPaymentFilter,
  followupFilter = "", setFollowupFilter,
  stateFilter    = "", setStateFilter,
  cityFilter     = "", setCityFilter,
  states = [], cities = [],
  onClear,
}) {
  /* Each filter has its own open state */
  const [openPayment,  setOpenPayment]  = useState(false);
  const [openFollowup, setOpenFollowup] = useState(false);
  const [openState,    setOpenState]    = useState(false);
  const [openCity,     setOpenCity]     = useState(false);

  const hasFilters = paymentFilter || followupFilter || stateFilter || cityFilter;

  const filters = [
    {
      label:   paymentFilter  || "Payment Status",
      active:  !!paymentFilter,
      onOpen:  () => setOpenPayment(true),
    },
    {
      label:   followupFilter || "Followup Status",
      active:  !!followupFilter,
      onOpen:  () => setOpenFollowup(true),
    },
    {
      label:   stateFilter ? `State: ${stateFilter}` : "State: All",
      active:  !!stateFilter,
      onOpen:  () => setOpenState(true),
    },
    {
      label:   cityFilter ? `City: ${cityFilter}` : "City: All",
      active:  !!cityFilter,
      onOpen:  () => setOpenCity(true),
    },
    {
      label:   "Partner Type",
      active:  false,
      onOpen:  () => {},
    },
  ];

  return (
    <>
      {/* ── MOBILE: horizontal scroll pills ── */}
      <div className="flex md:hidden items-center gap-2.5 overflow-x-auto scrollbar-hide pb-1 snap-x">
        {filters.map((f, i) => (
          <FilterPill key={i} label={f.label} active={f.active} onClick={f.onOpen} mobile />
        ))}
      </div>

      {/* ── DESKTOP: filter buttons + Clear All ── */}
      <div className="hidden md:flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f, i) => (
            <FilterPill key={i} label={f.label} active={f.active} onClick={f.onOpen} />
          ))}
        </div>
        {hasFilters && (
          <button onClick={onClear} className="text-[13px] font-semibold text-violet-600 hover:text-violet-800 transition-colors whitespace-nowrap">
            Clear All Filters
          </button>
        )}
      </div>

      {/* ── Individual filter popups ── */}
      {openPayment && (
        <FilterPopup
          title="Payment Status"
          options={PAYMENT_OPTIONS}
          value={paymentFilter}
          onChange={setPaymentFilter}
          onClose={() => setOpenPayment(false)}
        />
      )}
      {openFollowup && (
        <FilterPopup
          title="Followup Status"
          options={FOLLOWUP_OPTIONS}
          value={followupFilter}
          onChange={setFollowupFilter}
          onClose={() => setOpenFollowup(false)}
        />
      )}
      {openState && (
        <FilterPopup
          title="Select State"
          options={states.map(s => s.state)}
          value={stateFilter}
          onChange={setStateFilter}
          onClose={() => setOpenState(false)}
        />
      )}
      {openCity && (
        <FilterPopup
          title="Select City"
          options={cities.map(c => c.city)}
          value={cityFilter}
          onChange={setCityFilter}
          onClose={() => setOpenCity(false)}
        />
      )}
    </>
  );
}