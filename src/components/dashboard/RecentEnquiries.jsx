import { useState } from "react";
import { FiPhone, FiMessageSquare, FiCalendar, FiCheckCircle } from "react-icons/fi";
import { Tag, MapPin, ChevronDown, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getImageURI } from "../../utils/helper";

/* ── Status config ─────────────────────────────────────── */
const STATUS = {
  "New":             { bg: "bg-blue-50",    text: "text-blue-600",   label: "NEW" },
  "Follow Up":       { bg: "bg-yellow-50",  text: "text-yellow-700", label: "FOLLOW UP" },
  "Visit Scheduled": { bg: "bg-purple-50",  text: "text-purple-700", label: "SITE VISIT" },
  "Token":           { bg: "bg-green-50",   text: "text-green-700",  label: "TOKEN" },
  "Cancelled":       { bg: "bg-red-50",     text: "text-red-500",    label: "CANCELLED" },
  "Enquired":        { bg: "bg-blue-50",    text: "text-blue-600",   label: "NEW LEAD" },
  "Booked":          { bg: "bg-green-50",   text: "text-green-700",  label: "BOOKED" },
};

const MOBILE_FILTERS = ["All", "New", "Follow Up", "Visit Scheduled", "Token"];

/* ── helpers ────────────────────────────────────────────── */
function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "??";
}

function fmtBudget(min, max) {
  const fmt = (v) => {
    const n = Number(v);
    if (!n) return null;
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
    if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${(n / 1000).toFixed(0)}k`;
  };
  const a = fmt(min), b = fmt(max);
  if (a && b) return `${a} – ${b}`;
  if (a)      return `${a}+`;
  return null;
}

function timeAgo(dateStr = "") {
  if (!dateStr) return "";
  const [datePart] = dateStr.split("|");
  const d = new Date(datePart?.trim());
  if (isNaN(d)) return dateStr.split("|")[0]?.trim() || "";
  const diff = Math.floor((Date.now() - d) / 60000);
  if (diff < 60)  return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function StatusBadge({ status, small }) {
  const s = STATUS[status] || { bg: "bg-slate-100", text: "text-slate-500", label: status?.toUpperCase() || "NEW" };
  return (
    <span className={`font-bold rounded-full whitespace-nowrap ${s.bg} ${s.text} ${small ? "text-[10px] px-2 py-0.5" : "text-[10px] px-3 py-1"}`}>
      {s.label}
    </span>
  );
}

function ActionIcons({ contact, size = 17 }) {
  return (
    <>
      <a href={`tel:${contact}`}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-50 hover:bg-violet-100 transition-colors text-violet-600 cursor-pointer">
        <FiPhone size={size} />
      </a>
      <button className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-50 hover:bg-violet-100 transition-colors text-violet-600">
        <FiMessageSquare size={size} />
      </button>
      <button className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-50 hover:bg-violet-100 transition-colors text-violet-600">
        <FiCalendar size={size} />
      </button>
      <button className="w-10 h-10 flex items-center justify-center rounded-full bg-violet-50 hover:bg-violet-100 transition-colors text-violet-600">
        <FiCheckCircle size={size} />
      </button>
    </>
  );
}

/**
 * RecentEnquiries
 * Props: enquiries — real API array
 */
export default function RecentEnquiries({ enquiries = [] }) {
  const navigate = useNavigate();
  const [mobileFilter, setMobileFilter] = useState("All");

  const data = enquiries.slice(0, 6);

  const mobileData = mobileFilter === "All"
    ? data
    : data.filter((i) => i.status === mobileFilter);

  return (
    <div className="xl:col-span-2 w-full">

      {/* ══════════════════════════════════════════
          DESKTOP — white card with table rows
      ══════════════════════════════════════════ */}
      <div className="hidden md:block bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-900">Recent Enquiries</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/app/enquiries")}
              className="text-violet-600 text-sm font-semibold hover:text-violet-800 transition-colors"
            >
              View All
            </button>
          </div>
        </div>

        {/* Rows */}
        {data.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No enquiries found.</div>
        ) : data.map((item, i) => {
          const budget = fmtBudget(item.minbudget, item.maxbudget);
          const ago    = timeAgo(item.created_at);

          return (
            <div
              key={item.enquirersid || i}
              onClick={() => navigate("/app/enquiries")}
              className="flex items-center gap-5 px-6 py-5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors overflow-scroll scrollbar-hide"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-[#5323DC] to-[#8E61FF]">
                {getInitials(item.customer)}
              </div>

              {/* Name + property */}
              <div className="min-w-[150px] flex-1">
                <p className="font-bold text-slate-900 text-[15px] leading-tight">{item.customer}</p>
                <p className="text-sm text-violet-500 mt-0.5 truncate">{item.location || item.city}</p>
              </div>

              {/* Category + budget + city */}
              <div className="min-w-[150px] hidden lg:block">
                <p className="text-sm font-semibold text-slate-700">
                  {item.category}
                  {budget && <span className="text-slate-400 font-normal"> • {budget}</span>}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{item.city}, {item.state}</p>
              </div>

              {/* Time ago + Status Badge */}
              <div className="min-w-[120px] text-xs text-slate-400 text-right hidden xl:flex flex-col gap-2 ">
                <div>{ago}</div>
                <div><StatusBadge status={item.status} /></div>
              </div>

              {/* Action icons */}
              <div className="flex items-center gap-3 text-slate-300 shrink-0">
                <a href={`tel:${item.contact}`} className="hover:text-violet-600 transition-colors cursor-pointer"><FiPhone size={17} /></a>
                <button className="hover:text-violet-600 transition-colors"><FiMessageSquare size={17} /></button>
                <button className="hover:text-violet-600 transition-colors"><FiCalendar size={17} /></button>
                <button className="hover:text-green-500 transition-colors"><FiCheckCircle size={17} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
          MOBILE — filter pills + cards stack
      ══════════════════════════════════════════ */}
      <div className="md:hidden">

        {/* Mobile header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-900">Recent Enquiries</h3>
          <button
            onClick={() => navigate("/app/enquiries")}
            className="text-violet-600 text-sm font-semibold"
          >
            View All
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {MOBILE_FILTERS.map((f) => {
            const isActive = mobileFilter === f;
            return (
              <button
                key={f}
                onClick={() => setMobileFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all
                  ${isActive
                    ? "bg-[#5323DC] text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-500 hover:border-violet-300"
                  }`}
              >
                {f === "Visit Scheduled" ? "Site Visit" : f}
              </button>
            );
          })}
        </div>

        {/* Cards */}
        {mobileData.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 py-10 text-center text-slate-400 text-sm">
            No enquiries found.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {mobileData.map((item, i) => {
              const budget = fmtBudget(item.minbudget, item.maxbudget);

              return (
                <div
                  key={item.enquirersid || i}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4"
                >
                  {/* Top: avatar + name + property + status */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-[#5323DC] to-[#8E61FF]">
                      {getInitials(item.customer)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-base leading-tight">{item.customer}</p>
                      <p className="text-sm text-violet-500 mt-0.5 truncate">{item.location || item.city}</p>
                    </div>
                    <StatusBadge status={item.status} small />
                  </div>

                  {/* Middle: category + budget + location */}
                  <div className="flex items-center gap-4 text-sm text-slate-500 pb-3 border-b border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <Tag size={13} className="text-slate-400" />
                      {item.category}
                      {budget && <span className="text-slate-700 font-semibold"> • {budget}</span>}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" /> {item.city}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3">
                    <ActionIcons contact={item.contact} size={18} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}