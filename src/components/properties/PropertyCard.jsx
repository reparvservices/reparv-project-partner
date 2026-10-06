import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEdit, FiMapPin, FiCheckCircle, FiMoreVertical, FiX } from "react-icons/fi";
import { FaFire, FaEye, FaHeart, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import propertyPicture from "../../assets/propertyPicture.svg";
import { getImageURI } from "../../utils/helper";
import FormatPrice from "../FormatPrice";
import {
  prefetchPropertyPhoto,
  sharePropertyOnWhatsApp,
} from "../../utils/propertyShare";

const GRADIENT = "linear-gradient(94.94deg, #5323DC -8.34%, #8E61FF 97.17%)";

const APPROVE_STYLE = {
  "Approved":     { bg: "bg-emerald-50", text: "text-emerald-600", icon: <FiCheckCircle size={13} /> },
  "Not Approved": { bg: "bg-blue-50",    text: "text-blue-600",    icon: null },
  "Rejected":     { bg: "bg-red-50",     text: "text-red-500",     icon: null },
};

function fmt(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000)    return (n / 1000).toFixed(0) + "k";
  return String(n);
}

function buildActions(row) {
  const cats       = row.propertyCategory;
  const isFlat     = ["NewFlat", "CommercialFlat"].includes(cats);
  const isPlot     = ["NewPlot", "CommercialPlot"].includes(cats);
  const hasAddInfo = isFlat || isPlot;
  return [
    { label: "View on Website",          value: "view",                icon: "🌐" },
    { label: "Toggle Status",            value: "status",              icon: "🔄" },
    { label: "Edit Property",            value: "update",              icon: "✏️",  navigate: true },
    { label: "Set Hot Deal",             value: "hotdeal",             icon: "🔥" },
    ...(isFlat     ? [{ label: "Additional Info (Flat)", value: "additionalinfo",        icon: "📋" }] : []),
    ...(isPlot     ? [{ label: "Additional Info (Plot)", value: "additionalinfoforplot", icon: "📋" }] : []),
    ...(hasAddInfo ? [{ label: "View Additional Info",   value: "gotoadditionalinfo",    icon: "📄" }] : []),
    { label: "SEO Details",              value: "SEO",                 icon: "🔍" },
    { label: "Reject Reason",            value: "rejectReason",        icon: "❌" },
    { label: "Update Images",            value: "updateImages",        icon: "🖼️" },
    { label: "Set Commission",           value: "setCommission",       icon: "💰" },
    { label: "Brochure & Video",         value: "videoUpload",         icon: "📹" },
    { label: "Location (Lat/Lng)",       value: "updateLocation",      icon: "📍" },
    { label: "Delete",                   value: "delete",              icon: "🗑️", danger: true },
  ];
}

/* ── Shared action panel content ─────────────────────────── */
function ActionList({ row, onClose, onAction, onNavigateUpdate }) {
  const actions = buildActions(row);
  return (
    <>
      {/* Property info header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">{row.propertyName}</p>
          <p className="text-xs text-slate-400 mt-0.5">{row.propertyCategory} · {row.city}{row.state ? `, ${row.state}` : ""}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 shrink-0 transition-colors">
          <FiX size={18} className="text-slate-400" />
        </button>
      </div>

      {/* Actions grid */}
      <div className="p-4 grid grid-cols-2 gap-2 overflow-y-auto max-h-[55vh]">
        {actions.map((a) => (
          <button
            key={a.value}
            onClick={() => {
              onClose();
              a.navigate ? onNavigateUpdate(row.propertyid) : onAction(a.value, row.propertyid, row);
            }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium text-left transition-all active:scale-95
              ${a.danger
                ? "bg-red-50 text-red-500 hover:bg-red-100"
                : a.navigate
                ? "text-white hover:opacity-90 shadow-md shadow-violet-200"
                : "bg-slate-50 text-slate-700 hover:bg-[#F2F4FF] hover:text-[#5323DC]"
              }`}
            style={a.navigate ? { background: GRADIENT } : {}}
          >
            <span className="text-base leading-none">{a.icon}</span>
            <span className="leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ── Action menu — bottom-sheet mobile / centered modal desktop ── */
function ActionMenu({ row, onAction, onNavigateUpdate }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
      >
        <FiMoreVertical size={16} />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm cursor-pointer"
          onClick={() => setOpen(false)} />

      {/* Mobile: bottom-sheet */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-[71] bg-white rounded-t-3xl shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        <ActionList row={row} onClose={() => setOpen(false)} onAction={onAction} onNavigateUpdate={onNavigateUpdate} />
        <div className="h-6" />
      </div>

      {/* Desktop: centered popup */}
      <div className="hidden md:flex fixed inset-0 z-[71] items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          <ActionList row={row} onClose={() => setOpen(false)} onAction={onAction} onNavigateUpdate={onNavigateUpdate} />
        </div>
      </div>
    </>
  );
}

/* ── Main card ───────────────────────────────────────────── */
export default function PropertyCard({ property: p, onAction, onCommissionClick }) {
  const navigate     = useNavigate();
  const approveStyle = APPROVE_STYLE[p.approve] || { bg: "bg-slate-100", text: "text-slate-500", icon: null };
  const goToUpdate   = (id) => navigate(`/app/property/update/${id}`);

  let imageSrc = propertyPicture;
  try {
    const parsed = JSON.parse(p.frontView);
    if (Array.isArray(parsed) && parsed[0]) imageSrc = getImageURI(parsed[0]);
  } catch (e) {}

  return (
    <div className="w-full bg-white rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-shadow">

      {/* Image */}
      <div className="relative">
        <img
          src={imageSrc}
          alt={p.propertyName}
          className="w-full h-48 md:h-64 object-cover cursor-pointer"
          onClick={() => p.seoSlug && window.open("https://www.reparv.in/property-info/" + p.seoSlug, "_blank")}
        />

        {/* Approve badge */}
        <div className={`absolute top-3 left-3 ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm bg-white/90 ${approveStyle.text}`}>
          {approveStyle.icon}
          {p.approve}
        </div>

        {/* Hot deal */}
        {p.hotDeal === "Active" && (
          <div className="absolute top-3 left-28 ml-2 flex items-center gap-1 bg-red-500 text-white px-2.5 py-1.5 rounded-full text-xs font-bold">
            <FaFire size={11} /> Hot Deal
          </div>
        )}

        {/* Top-right buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => sharePropertyOnWhatsApp(p)}
            onMouseEnter={() => prefetchPropertyPhoto(p)}
            onFocus={() => prefetchPropertyPhoto(p)}
            title="Share on WhatsApp"
            aria-label="Share on WhatsApp"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#25D366] text-white hover:bg-[#1ebe5b] transition-colors"
          >
            <FaWhatsapp size={17} />
          </button>
          <button
            onClick={() => p.seoSlug && window.open("https://www.reparv.in/property-info/" + p.seoSlug, "_blank")}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <FiEye size={15} />
          </button>
          <button
            onClick={() => goToUpdate(p.propertyid)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <FiEdit size={15} />
          </button>
          <ActionMenu row={p} onAction={onAction} onNavigateUpdate={goToUpdate} />
        </div>

        {/* Active/Inactive pill */}
        <div className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${p.status === "Active" ? "bg-green-500 text-white" : "bg-slate-600 text-white"}`}>
          {p.status}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

          <div className="flex-1 min-w-0 space-y-1.5">
            {p.company_name && <p className="text-[#5323DC] text-xs font-bold uppercase tracking-wide">{p.company_name}</p>}
            <h2
              className="text-lg sm:text-xl font-bold text-slate-900 leading-tight cursor-pointer hover:text-[#5323DC] transition-colors"
              onClick={onCommissionClick}
            >
              {p.propertyName}
            </h2>
            <p className="flex items-center gap-1.5 text-slate-400 text-sm">
              <FiMapPin size={13} />
              {[p.location, p.city, p.state].filter(Boolean).join(", ")}
              {p.propertyCategory && <><span className="mx-1 text-slate-300">•</span>{p.propertyCategory}</>}
            </p>
            {p.fullname && (
              <p className="text-xs text-slate-400">
                Listed by <span className="font-semibold text-slate-600">{p.fullname}</span>
                {p.contact && ` · ${p.contact}`}
              </p>
            )}
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <p className="text-xl sm:text-2xl font-bold text-slate-900">
              <FormatPrice price={parseInt(p.totalOfferPrice)} />
            </p>
            <div className="grid grid-cols-4 bg-[#F8F6FF] rounded-xl overflow-hidden text-center min-w-[280px]">
              {[
                { icon: <FaEye size={12} />,     val: fmt(p.views),    label: "Views",    color: "text-slate-600" },
                { icon: <FaHeart size={12} />,    val: fmt(p.likes),    label: "Likes",    color: "text-red-500"   },
                { icon: <FaPhoneAlt size={12} />, val: fmt(p.calls),    label: "Calls",    color: "text-blue-500"  },
                { icon: <FaWhatsapp size={12} />, val: fmt(p.whatsapp), label: "WhatsApp", color: "text-green-600" },
              ].map((s, i) => (
                <div key={i} className={`px-3 py-2.5 ${i > 0 ? "border-l border-[#E8E4FF]" : ""}`}>
                  <div className={`flex items-center justify-center gap-1 font-bold text-sm ${s.color}`}>
                    {s.icon} {s.val}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile quick actions */}
        <div className="grid grid-cols-2 gap-3 mt-4 md:hidden">
          <button
            onClick={() => p.seoSlug && window.open("https://www.reparv.in/property-info/" + p.seoSlug, "_blank")}
            className="h-10 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => goToUpdate(p.propertyid)}
            className="h-10 rounded-xl text-white text-sm font-semibold shadow-md shadow-violet-200 hover:opacity-90 transition-opacity"
            style={{ background: GRADIENT }}
          >
            Edit Property
          </button>
        </div>

        {/* Reject reason */}
        {p.rejectreason && p.approve === "Rejected" && (
          <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-xs text-red-500">
            <span className="font-semibold">Reject reason: </span>{p.rejectreason}
          </div>
        )}
      </div>
    </div>
  );
}