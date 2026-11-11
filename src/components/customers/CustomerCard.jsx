import { useState } from "react";
import { MessageCircle, Phone, FileText, Share2, Building2, Clock, MoreVertical, CreditCard } from "lucide-react";
import propertyPicture from "../../assets/propertyPicture.svg";
import { getImageURI } from "../../utils/helper";
import FormatPrice from "../FormatPrice";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 100%)";

function fmtLac(val) {
  const n = Number(val);
  if (!n) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

/* status badge based on payment type */
function Badge({ paymenttype }) {
  if (!paymenttype) return null;
  const map = {
    "UPI":         { bg: "bg-blue-50",   text: "text-blue-600",   label: "UPI" },
    "Cash":        { bg: "bg-green-50",  text: "text-green-600",  label: "Cash" },
    "Check":       { bg: "bg-amber-50",  text: "text-amber-600",  label: "Cheque" },
    "Net Banking": { bg: "bg-violet-50", text: "text-violet-600", label: "Net Banking" },
  };
  const s = map[paymenttype] || { bg: "bg-slate-100", text: "text-slate-500", label: paymenttype };
  return (
    <span className={`inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function ActionMenu({ row, onAction }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <button onClick={() => setOpen(!open)} className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
        <MoreVertical size={16} className="text-slate-300" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40 cursor-pointer"
          onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-50 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 w-44">
            <button onClick={() => { onAction("view", row.enquirersid); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-violet-50 transition-colors">View Details</button>
            <button onClick={() => { onAction("addPayment", row.enquirersid); setOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-violet-50 transition-colors">Add Payment</button>
          </div>
        </>
      )}
    </div>
  );
}

export default function CustomerCard({ customer: c, onAction }) {
  let imageSrc = propertyPicture;
  try {
    const parsed = JSON.parse(c.frontView);
    if (Array.isArray(parsed) && parsed[0]) imageSrc = getImageURI(parsed[0]);
  } catch (e) {}

  const initials = c.customer?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div className="bg-white rounded-md border shadow-sm hover:shadow-md transition-shadow overflow-hidden">

      {/* ── MOBILE ── */}
      <div className="block md:hidden p-4">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar — initials circle */}
          <div
            className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center text-lg font-bold text-white ring-2 ring-slate-100 cursor-pointer"
            style={{ background: GRADIENT }}
            onClick={() => c.seoSlug && window.open("https://www.reparv.in/property-info/" + c.seoSlug, "_blank")}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-slate-900 text-base leading-tight truncate">{c.customer}</h3>
                <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                  <Clock size={11} /> {c.created_at?.split("|")[0]?.trim()}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Badge paymenttype={c.paymenttype} />
                <ActionMenu row={c} onAction={onAction} />
              </div>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-slate-50 rounded-xl p-3 mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-0.5">Deal Amount</p>
            <p className="text-sm font-bold text-slate-800">{fmtLac(c.dealamount)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-0.5">Token Amount</p>
            <p className="text-sm font-bold text-slate-800">{fmtLac(c.tokenamount)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-0.5">Contact</p>
            <p className="text-sm font-bold text-slate-800">{c.contact || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-0.5">Payment</p>
            <p className="text-sm font-bold text-slate-800">{c.paymenttype || "—"}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onAction("view", c.enquirersid)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
            style={{ background: GRADIENT }}
          >
            <MessageCircle size={15} /> View Details
          </button>
          <button
            onClick={() => onAction("addPayment", c.enquirersid)}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-violet-50 hover:bg-violet-100 transition-colors shrink-0"
          >
            <CreditCard size={17} className="text-violet-600" />
          </button>
          <a
            href={`tel:${c.contact}`}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-violet-50 hover:bg-violet-100 transition-colors shrink-0"
          >
            <Phone size={17} className="text-violet-600" />
          </a>
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:block p-6">
        {/* Top row */}
        <div className="flex items-start gap-4 mb-5">
          {/* Left: initials avatar */}
          <div
            className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center text-lg font-bold text-white ring-2 ring-slate-100 cursor-pointer"
            style={{ background: GRADIENT }}
            onClick={() => c.seoSlug && window.open("https://www.reparv.in/property-info/" + c.seoSlug, "_blank")}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 leading-tight">{c.customer}</h3>
            <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <Building2 size={11} /> {c.contact}
            </p>
            <Badge paymenttype={c.paymenttype} />
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <ActionMenu row={c} onAction={onAction} />
            <p className="text-xs text-slate-400 whitespace-nowrap">{c.created_at?.split("|")[0]?.trim()}</p>
          </div>
        </div>

        {/* Info: 3 col */}
        <div className="grid grid-cols-3 gap-4 mb-5 pt-4 border-t border-slate-100">
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Deal Amount</p>
            <p className="text-sm font-bold text-violet-600">{fmtLac(c.dealamount)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Token Amount</p>
            <p className="text-sm font-bold text-slate-900">{fmtLac(c.tokenamount)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">Payment Type</p>
            <p className="text-sm font-bold text-slate-900">{c.paymenttype || "—"}</p>
          </div>
        </div>

        {/* Actions: 4 col */}
        <div className="grid grid-cols-4 gap-2.5">
          <button
            onClick={() => onAction("view", c.enquirersid)}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
            style={{ background: GRADIENT }}
          >
            <MessageCircle size={14} /> View
          </button>
          <button
            onClick={() => onAction("addPayment", c.enquirersid)}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            <CreditCard size={14} className="text-slate-500" /> Payment
          </button>
          <a
            href={`tel:${c.contact}`}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
          >
            <Phone size={14} className="text-slate-500" /> Call
          </a>
          <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
            <Share2 size={14} className="text-slate-500" /> Share
          </button>
        </div>
      </div>
    </div>
  );
}