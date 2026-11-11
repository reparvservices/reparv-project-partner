import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { getImageURI } from "../../utils/helper";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600";

function getImage(item) {
  if (!item) return FALLBACK_IMG;
  try {
    const parsed = JSON.parse(item.frontView);
    if (Array.isArray(parsed) && parsed[0]) return getImageURI(parsed[0]);
  } catch {}
  return FALLBACK_IMG;
}

function fmtPrice(val) {
  const n = Number(val);
  if (!n) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "??";
}

/* ── status → badge style ── */
const STATUS_BADGE = {
  "Token":           { bg: "bg-yellow-100", text: "text-yellow-700", label: "BOOKED"  },
  "Booked":          { bg: "bg-yellow-100", text: "text-yellow-700", label: "BOOKED"  },
  "Visit Scheduled": { bg: "bg-purple-100", text: "text-purple-700", label: "VISITED" },
  "Follow Up":       { bg: "bg-blue-100",   text: "text-blue-600",   label: "FOLLOW UP" },
  "Cancelled":       { bg: "bg-red-100",    text: "text-red-500",    label: "CANCELLED" },
};

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || { bg: "bg-green-100", text: "text-green-700", label: (status || "BOOKED").toUpperCase() };
  return (
    <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wide ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function PropertyCard({ item }) {
  const img      = getImage(item);
  const price    = fmtPrice(item.dealamount || item.tokenamount);
  const initials = getInitials(item.customer);

  return (
    <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
      {/* Image */}
      <div
        className="w-full h-42 overflow-hidden cursor-pointer"
        onClick={() => item.seoSlug && window.open("https://www.reparv.in/property-info/" + item.seoSlug, "_blank")}
      >
        <img src={img} alt={item.category} className="w-full h-full object-contain" />
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Status badge */}
        <StatusBadge status={item.status} />

        {/* Property name / category */}
        <p className="font-bold text-slate-900 text-lg mt-3 leading-tight">
          {item.category}
          {item.source && <span className="text-slate-400 font-normal text-sm"> · {item.source}</span>}
        </p>

        {/* Price */}
        <p className="text-slate-500 text-sm mt-1 font-medium">{price}</p>

        {/* Location */}
        {(item.city || item.state) && (
          <p className="flex items-center gap-1 text-xs text-slate-400 mt-1">
            <MapPin size={11} /> {[item.location, item.city, item.state].filter(Boolean).join(", ")}
          </p>
        )}

        <hr className="my-4 border-slate-100" />

        {/* Booked by */}
        <div className="flex items-center gap-3">
          {/* Initials avatar */}
          <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-[#5323DC] to-[#8E61FF]">
            {initials}
          </div>
          <p className="text-sm text-slate-400">
            Booked by{" "}
            <span className="font-semibold text-slate-700">{item.customer || "Customer"}</span>
          </p>
        </div>

        {/* Sales + Territory info */}
        {(item.assign || item.territoryName) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {item.assign && item.assign !== "No Assign" && (
              <span className="text-[10px] bg-green-50 text-green-600 font-semibold px-2.5 py-1 rounded-full">
                Sales: {item.assign.split(" - ")[0]}
              </span>
            )}
            {item.territoryName && (
              <span className="text-[10px] bg-violet-50 text-violet-600 font-semibold px-2.5 py-1 rounded-full">
                Territory: {item.territoryName}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * BookedProperty
 * Props:
 *   properties : array — full API response; shows items with status "Token" or "Booked"
 */
export default function BookedProperty({ properties = [] }) {
  const navigate  = useNavigate();
  const booked    = properties.filter((p) => p.status === "Token" || p.status === "Booked");
  const primary   = booked[0];

  if (!primary) return null;

  return (
    <>
      {/* ── Desktop XL sidebar ── */}
      <div className="hidden xl:flex flex-col bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-bold text-base text-slate-900">Booked Properties</h3>
          <button
            onClick={() => navigate("/app/properties")}
            className="text-violet-600 text-sm font-semibold hover:text-violet-800 transition-colors"
          >
            View All
          </button>
        </div>

        {/* Card */}
        <div className="p-4 flex-1 overflow-y-auto scrollbar-hide">
          <PropertyCard item={primary} />
        </div>
      </div>

      {/* ── Mobile / Tablet ── */}
      <div className="xl:hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-bold text-lg text-slate-900">Booked Properties</h3>
          <button
            onClick={() => navigate("/app/properties")}
            className="text-violet-600 text-sm font-semibold"
          >
            View All
          </button>
        </div>

        {/* Cards — horizontal scroll on mobile if multiple */}
        {booked.length === 1 ? (
          <PropertyCard item={primary} />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {booked.map((item) => (
              <div key={item.enquirersid} className="min-w-[280px] max-w-[320px] shrink-0">
                <PropertyCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}