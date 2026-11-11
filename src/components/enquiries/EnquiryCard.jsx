import { useState } from "react";
import { useAuth } from "../../store/auth";
import {
  MapPin,
  Clock,
  Phone,
  Calendar,
  FileText,
  ArrowRight,
  MoreVertical,
  MoreHorizontal,
  Instagram,
  Globe,
  UserPlus,
  X,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import propertyPicture from "../../assets/propertyPicture.svg";
import { getImageURI } from "../../utils/helper";

const GRADIENT = "linear-gradient(135deg, #6D28D9, #7C3AED)";

/* ── helpers ─────────────────────────────────────────────── */
function fmtBudget(val) {
  const n = Number(val);
  if (!n) return null;
  if (n >= 10000000)
    return (n / 10000000).toFixed(1).replace(/\.0$/, "") + "Cr";
  if (n >= 100000) return (n / 100000).toFixed(1).replace(/\.0$/, "") + "L";
  if (n >= 1000) return (n / 1000).toFixed(0) + "k";
  return n.toLocaleString("en-IN");
}

/* ── Status badge ─────────────────────────────────────────── */
const STATUS = {
  New: { bg: "#EEF2FF", color: "#6366F1", label: "New" },
  "Follow Up": { bg: "#FEE2E2", color: "#EF4444", label: "Follow Up" },
  "Visit Scheduled": {
    bg: "#DCFCE7",
    color: "#16A34A",
    label: "Visit Scheduled",
  },
  Token: { bg: "#FEF9C3", color: "#CA8A04", label: "Token" },
  Cancelled: { bg: "#F1F5F9", color: "#94A3B8", label: "Cancelled" },
};

function StatusBadge({ status }) {
  const s = STATUS[status] || {
    bg: "#F1F5F9",
    color: "#94A3B8",
    label: status || "—",
  };
  return (
    <span
      style={{ background: s.bg, color: s.color }}
      className="text-[11px] px-2.5 py-1 rounded-lg font-bold tracking-wide whitespace-nowrap"
    >
      {s.label.toUpperCase()}
    </span>
  );
}

/* ── Source icon ──────────────────────────────────────────── */
function SourceIcon({ source }) {
  if (!source) return null;
  const sl = source.toLowerCase();
  if (sl.includes("instagram"))
    return (
      <Instagram size={15} style={{ color: "#E1306C" }} className="shrink-0" />
    );
  if (sl.includes("website") || sl.includes("direct") || sl.includes("web"))
    return (
      <Globe size={15} style={{ color: "#6366F1" }} className="shrink-0" />
    );
  return null;
}

/* ── Avatar with initial ──────────────────────────────────── */
function Avatar({ name, imageSrc, size = "md" }) {
  const [imgError, setImgError] = useState(false);
  const initial = name?.charAt(0)?.toUpperCase() || "?";
  const sizeClass = size === "lg" ? "w-14 h-14 text-xl" : "w-11 h-11 text-base";

  if (!imgError && imageSrc && imageSrc !== propertyPicture) {
    return (
      <div
        className={`${sizeClass} rounded-full overflow-hidden shrink-0 border-2 border-slate-100`}
      >
        <img
          src={imageSrc}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Deterministic color from name
  const colors = [
    { bg: "#6D28D9", text: "#fff" },
    { bg: "#0EA5E9", text: "#fff" },
    { bg: "#10B981", text: "#fff" },
    { bg: "#F59E0B", text: "#fff" },
    { bg: "#EF4444", text: "#fff" },
    { bg: "#8B5CF6", text: "#fff" },
  ];
  const colorIdx = (name?.charCodeAt(0) || 0) % colors.length;
  const { bg, text } = colors[colorIdx];

  return (
    <div
      className={`${sizeClass} rounded-full shrink-0 flex items-center justify-center font-bold`}
      style={{ background: bg, color: text }}
    >
      {initial}
    </div>
  );
}

/* ── Shared action list content ───────────────────────────── */
function ActionList({ row, onClose, onAction }) {
  const actions = [
    { label: "View Details", value: "view", icon: "👁️" },
    { label: "Change Status", value: "status", icon: "🔄" },
    ...(row.source !== "Onsite"
      ? [{ label: "Update", value: "update", icon: "✏️" }]
      : []),
    ...(row.source !== "Onsite"
      ? [{ label: "Change Property", value: "property", icon: "🏠" }]
      : []),
    { label: "Assign Sales", value: "assign", icon: "👤" },
    { label: "Digital Broker", value: "todigitalbroker", icon: "🤝" },
    { label: "Delete", value: "delete", icon: "🗑️", danger: true },
  ];

  return (
    <>
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">
            {row.customer}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {row.category || "Enquiry"} · {row.city}
            {row.state ? `, ${row.state}` : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-100 shrink-0 transition-colors"
        >
          <X size={18} className="text-slate-400" />
        </button>
      </div>

      <div className="p-4 grid grid-cols-2 gap-2 overflow-y-auto max-h-[55vh]">
        {actions.map((a) => (
          <button
            key={a.value}
            onClick={() => {
              onClose();
              onAction(a.value, row.enquirersid, row);
            }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium text-left transition-all active:scale-95
              ${
                a.danger
                  ? "bg-red-50 text-red-500 hover:bg-red-100"
                  : a.value === "view"
                    ? "text-white hover:opacity-90 shadow-md"
                    : "bg-slate-50 text-slate-700 hover:bg-[#F2F4FF] hover:text-[#6D28D9]"
              }`}
            style={a.value === "view" ? { background: GRADIENT } : {}}
          >
            <span className="text-base leading-none">{a.icon}</span>
            <span className="leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ── Action menu ── */
function ActionMenu({ row, onAction }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <MoreVertical size={17} className="text-slate-600" />
      </button>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm cursor-pointer"
        onClick={() => setOpen(false)}
      />
      {/* Mobile: bottom-sheet */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-[71] bg-white rounded-t-3xl shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        <ActionList
          row={row}
          onClose={() => setOpen(false)}
          onAction={onAction}
        />
        <div className="h-6" />
      </div>
      {/* Desktop: centered modal */}
      <div className="hidden md:flex fixed inset-0 z-[71] items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          <ActionList
            row={row}
            onClose={() => setOpen(false)}
            onAction={onAction}
          />
        </div>
      </div>
    </>
  );
}

/* ── Mobile Card ──────────────────────────────────────────── */
function MobileCard({ item, onAction, isActiveSubscription, enquiryFilter }) {
  const hasSubscription = isActiveSubscription === true;
  const [showInteraction, setShowInteraction] = useState(false);

  let imageSrc = propertyPicture;
  try {
    const parsed = JSON.parse(item.frontView);
    if (Array.isArray(parsed) && parsed[0]) imageSrc = getImageURI(parsed[0]);
  } catch (e) {}

  const contact = isActiveSubscription ? item.contact : "XXXXXXXXXX";
  const isAssigned = item.assign && item.assign !== "No Assign";
  const isDigitalBroker = enquiryFilter === "Digital Broker";
  const canAct = isActiveSubscription !== false && !isDigitalBroker;

  const minB = fmtBudget(item.minbudget);
  const maxB = fmtBudget(item.maxbudget);
  const budget =
    minB && maxB ? `₹${minB} – ₹${maxB}` : minB ? `₹${minB}+` : "—";

  const locationStr = [item.city, item.state].filter(Boolean).join(", ");
  const timeStr = item.created_at?.trim() || "—";

  return (
    <div
      className="w-full flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
    >
      {/* Main content */}
      <div onClick={() => isActiveSubscription && (onAction("view", item.enquirersid, item))} className="p-4">
        {/* Top row: avatar + name + status + more */}
        <div className="flex items-start gap-3">
          <Avatar name={item.customer} imageSrc={imageSrc} size="lg" />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
                  {item.customer}
                </h2>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5 flex-wrap">
                  <MapPin size={11} className="shrink-0" />
                  <span className="truncate">{locationStr || "—"}</span>
                  <span className="text-slate-300">·</span>
                  <span className="truncate">{timeStr}</span>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row items-end sm:items-center gap-1 shrink-0">
                <StatusBadge status={item.status} />
                <span onClick={(e) => e.stopPropagation()}>
                  {hasSubscription && (
                    <ActionMenu row={item} onAction={onAction} />
                  )}
                </span>
              </div>
            </div>

            {/* Info row */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div>
                <p className="text-[10px] text-slate-400 mb-0.5">
                  Interested In
                </p>
                <p className="font-bold text-slate-800 text-xs leading-tight truncate">
                  {item.category || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 mb-0.5">Budget</p>
                <p className="font-bold text-slate-800 text-xs leading-tight">
                  {budget}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 mb-0.5">Source</p>
                <p className="font-bold text-slate-800 text-xs flex items-center gap-1 leading-tight">
                  <SourceIcon source={item.source} />
                  <span className="truncate">{item.source || "—"}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned row */}
        {isAssigned && (
          <div className="mt-3 bg-violet-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-violet-200 flex items-center justify-center text-xs font-bold text-violet-700 shrink-0">
              {item.assign?.charAt(0)?.toUpperCase()}
            </div>
            <p className="text-xs text-slate-500 truncate">
              Assigned to:{" "}
              <span className="font-bold text-slate-800">{item.assign}</span>
              {item.territoryName && (
                <span className="text-slate-400"> ({item.territoryName})</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Action footer */}
      {canAct && hasSubscription && (
        <div className="border-t border-slate-100">
          {!isAssigned ? (
            <div className="px-4 py-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction("assign", item.enquirersid, item);
                }}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm"
                style={{ background: GRADIENT }}
              >
                Assign Sales Partner
              </button>
            </div>
          ) : (
            <div className="px-4 py-3 flex items-center justify-around">
              <a
                onClick={(e) => e.stopPropagation()}
                href={`tel:${contact}`}
                className="flex flex-col items-center gap-1 text-slate-500 hover:text-violet-700 transition-colors"
              >
                <Phone size={18} />
                <span className="text-[11px] font-medium">Call</span>
              </a>
              <div className="w-px h-8 bg-slate-100" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction("view", item.enquirersid, item);
                }}
                className="flex flex-col items-center gap-1 text-slate-500 hover:text-violet-700 transition-colors"
              >
                <MessageCircle size={18} />
                <span className="text-[11px] font-medium">Message</span>
              </button>
              <div className="w-px h-8 bg-slate-100" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction("status", item.enquirersid, item);
                }}
                className="flex flex-col items-center gap-1 text-slate-500 hover:text-violet-700 transition-colors"
              >
                <MoreHorizontal size={18} />
                <span className="text-[11px] font-medium">More</span>
              </button>
            </div>
          )}

          {/* Show Interaction Details toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowInteraction((v) => !v);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-violet-600 border-t border-slate-100 hover:bg-violet-50 transition-colors"
          >
            {showInteraction
              ? "Hide Interaction Details"
              : "Show Interaction Details"}
            {showInteraction ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>

          {/* Interaction details expanded */}
          {showInteraction && (
            <div className="px-4 pb-4 pt-1 space-y-2 border-t border-slate-100">
              {[
                ["Status", item.status],
                ["Property", item.propertyName],
                [
                  "Location",
                  [item.location, item.city, item.state]
                    .filter(Boolean)
                    .join(", "),
                ],
                ["Message", item.message],
              ]
                .filter(([, v]) => v)
                .map(([label, val]) => (
                  <div key={label} className="flex gap-2">
                    <span className="text-[11px] font-semibold text-slate-400 w-16 shrink-0 pt-0.5">
                      {label}
                    </span>
                    <span className="text-xs text-slate-700">{val}</span>
                  </div>
                ))}
              {!item.status && !item.message && (
                <p className="text-xs text-slate-400 text-center py-2">
                  No interaction details yet.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Desktop Card (unchanged layout) ─────────────────────── */
function DesktopCard({ item, onAction, isActiveSubscription, enquiryFilter }) {
  const hasSubscription = isActiveSubscription === true;
  let imageSrc = propertyPicture;
  try {
    const parsed = JSON.parse(item.frontView);
    if (Array.isArray(parsed) && parsed[0]) imageSrc = getImageURI(parsed[0]);
  } catch (e) {}

  const contact = isActiveSubscription ? item.contact : "XXXXXXXXXX";
  const isAssigned = item.assign && item.assign !== "No Assign";
  const isDigitalBroker = enquiryFilter === "Digital Broker";
  const canAct = isActiveSubscription !== false && !isDigitalBroker;

  const minB = fmtBudget(item.minbudget);
  const maxB = fmtBudget(item.maxbudget);
  const budget =
    minB && maxB ? `₹${minB} – ₹${maxB}` : minB ? `₹${minB}+` : "—";

  const locationStr = [item.location, item.city, item.state]
    .filter(Boolean)
    .join(", ");
  const timeStr = item.created_at?.split("|")[0]?.trim() || "—";

  return (
    <div className="bg-white rounded-md border border-slate-200 w-full min-w-0 max-w-full overflow-hidden">
      <div
        onClick={() => hasSubscription && onAction("view", item.enquirersid, item)}
        className="w-full p-5 md:p-6 cursor-pointer"
      >
        {/* TOP ROW */}
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-slate-100 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              item.seoSlug &&
                window.open(
                  "https://www.reparv.in/property-info/" + item.seoSlug,
                  "_blank",
                );
            }}
          >
            <img
              src={imageSrc}
              alt={item.customer}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-bold text-slate-900 text-lg leading-tight">
                  {item.customer}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                  <MapPin size={11} className="shrink-0" />
                  <span className="truncate max-w-40 md:max-w-none">
                    {locationStr}
                  </span>
                  <span className="text-slate-300">|</span>
                  <Clock size={11} className="shrink-0" />
                  <span>{timeStr}</span>
                </div>
              </div>
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <StatusBadge status={item.status} />
                {hasSubscription && (
                  <ActionMenu row={item} onAction={onAction} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* INFO BLOCK */}
        <div className="bg-[#F2F4FF] rounded-md p-4 mt-4 grid grid-cols-3 gap-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
              Interested In
            </p>
            <p className="font-bold text-slate-800 text-base leading-tight truncate">
              {item.category || "—"}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
              Budget Range
            </p>
            <p className="font-bold text-slate-800 text-base leading-tight">
              {budget}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
              Source
            </p>
            <p className="font-bold text-slate-800 text-base flex items-center gap-1 leading-tight">
              <SourceIcon source={item.source} />
              <span className="truncate">{item.source || "—"}</span>
            </p>
          </div>
        </div>

        {/* ASSIGNED ROW */}
        {isAssigned && (
          <div className="mt-3 bg-violet-50 rounded-md px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center text-xs font-bold text-violet-700 shrink-0">
              {item.assign?.charAt(0)?.toUpperCase()}
            </div>
            <p className="text-sm text-slate-500 truncate">
              Assigned to:{" "}
              <span className="font-bold text-slate-800">{item.assign}</span>
              {item.territoryName && (
                <span className="text-slate-400"> ({item.territoryName})</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* ACTION FOOTER */}
      {canAct && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onAction("view", item.enquirersid, item)}
              className="text-white px-5 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: GRADIENT }}
            >
              View Details
            </button>

            {hasSubscription && (
              <>
                {!isAssigned ? (
                  <button
                    onClick={() => onAction("assign", item.enquirersid, item)}
                  >
                    Assign Partner
                  </button>
                ) : (
                  <>
                    <a href={`tel:${contact}`}>Call</a>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction("status", item.enquirersid, item);
                      }}
                    >
                      Add Note
                    </button>
                  </>
                )}
              </>
            )}
          </div>
          {hasSubscription && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAction("status", item.enquirersid, item);
              }}
            >
              {isAssigned ? "Schedule Visit" : "Quick View"}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main export ────────────────────────────────────────────── */
export default function EnquiryCard({
  item,
  onAction,
  isActiveSubscription,
  enquiryFilter,
}) {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden">
        <MobileCard
          item={item}
          onAction={onAction}
          isActiveSubscription={isActiveSubscription}
          enquiryFilter={enquiryFilter}
        />
      </div>
      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopCard
          item={item}
          onAction={onAction}
          isActiveSubscription={isActiveSubscription}
          enquiryFilter={enquiryFilter}
        />
      </div>
    </>
  );
}
