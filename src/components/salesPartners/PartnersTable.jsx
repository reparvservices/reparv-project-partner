import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, flexRender,
} from "@tanstack/react-table";
import {
  ChevronUp, ChevronDown, Phone, MessageSquare,
  BarChart2, MapPin, X, Mail, Building2,
  CreditCard, Activity,
} from "lucide-react";
import { MdDone } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";

const GRADIENT = "linear-gradient(110.73deg, #5E23DC 0%, #7C3AED 100%)";

/* ── Badges ─────────────────────────────────────────────── */
function FollowupBadge({ status }) {
  const styles = {
    "Proposal Sent": "bg-violet-50 text-violet-600 border-violet-100",
    "Follow Up":     "bg-teal-50 text-teal-600 border-teal-100",
    "Closed":        "bg-gray-100 text-gray-500 border-gray-200",
    "Negotiation":   "bg-orange-50 text-orange-600 border-orange-100",
    "Interested":    "bg-blue-50 text-blue-600 border-blue-100",
    "New":           "bg-gray-100 text-gray-500 border-gray-200",
    "Active":        "bg-teal-50 text-teal-600 border-teal-100",
    "Payment Done":  "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-[6px] border tracking-wide uppercase whitespace-nowrap ${styles[status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {status || "New"}
    </span>
  );
}

function PaymentBadge({ status }) {
  const styles = {
    "Paid":      "bg-emerald-100 text-emerald-600",
    "Pending":   "bg-amber-100 text-amber-600",
    "Unbilled":  "bg-gray-100 text-gray-400",
    "Free":      "bg-slate-100 text-slate-500",
    "Unpaid":    "bg-amber-100 text-amber-600",
    "Follow Up": "bg-blue-100 text-blue-600",
  };
  return (
    <span className={`inline-flex items-center text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide whitespace-nowrap ${styles[status] || "bg-gray-100 text-gray-500"}`}>
      {status || "—"}
    </span>
  );
}

function ProjectTags({ projects = [] }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {projects.map((p, i) => (
        <span key={i}
          className={`text-[12px] font-semibold px-3 py-1 rounded-[6px] border whitespace-nowrap ${
            p.startsWith("+") ? "bg-violet-50 text-violet-500 border-violet-100" : "bg-white text-gray-700 border-gray-200"
          }`}
        >{p}</span>
      ))}
    </div>
  );
}

/* ── View Details popup ──────────────────────────────────── */
function ViewDetailsPopup({ partner, onClose, getPaymentStatus }) {
  const initials  = partner.fullname?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "?";
  const payStatus = getPaymentStatus(partner);

  const fields = [
    { icon: Phone,      label: "Phone",        value: partner.contact },
    { icon: Mail,       label: "Email",         value: partner.email },
    { icon: MapPin,     label: "City",          value: partner.city },
    { icon: Building2,  label: "State",         value: partner.state },
    { icon: CreditCard, label: "Payment",       value: payStatus },
    { icon: Activity,   label: "Login Status",  value: partner.loginstatus || "—" },
    { icon: Activity,   label: "Follow Up",     value: partner.followUp    || "—" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className="md:hidden fixed inset-x-0 bottom-0 z-[71] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>
        <ViewDetailsContent initials={initials} partner={partner} fields={fields} payStatus={payStatus} onClose={onClose} />
        <div className="h-6" />
      </div>
      <div className="hidden md:flex fixed inset-0 z-[71] items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
          <ViewDetailsContent initials={initials} partner={partner} fields={fields} payStatus={payStatus} onClose={onClose} />
        </div>
      </div>
    </>
  );
}

function ViewDetailsContent({ initials, partner, fields, payStatus, onClose }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h2 className="text-base font-bold text-gray-900">Partner Details</h2>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100"><X size={18} className="text-gray-400" /></button>
      </div>
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0" style={{ background: GRADIENT }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-gray-900 leading-tight">{partner.fullname}</p>
            <p className="text-sm text-gray-400 mt-0.5 truncate">{partner.email}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <PaymentBadge status={payStatus} />
              <FollowupBadge status={partner.followUp || "New"} />
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 py-4 space-y-3">
        {fields.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F2F4FF] flex items-center justify-center shrink-0">
              <f.icon size={14} className="text-violet-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{f.label}</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{f.value || "—"}</p>
            </div>
          </div>
        ))}
      </div>
      {partner.created_at && (
        <div className="px-5 pb-3">
          <p className="text-xs text-gray-400">Joined: {partner.created_at?.split("|")[0]?.trim()}</p>
        </div>
      )}
      <div className="px-5 pb-5 pt-2 grid grid-cols-2 gap-3 border-t border-gray-100">
        <a href={`tel:${partner.contact}`}
          className="flex items-center justify-center gap-2 h-11 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          <Phone size={15} /> Call
        </a>
        <button onClick={onClose} className="h-11 rounded-2xl text-white text-sm font-bold hover:opacity-90" style={{ background: GRADIENT }}>
          Close
        </button>
      </div>
    </>
  );
}

/* ── Action popup content ────────────────────────────────── */
function ActionPopupContent({ row, onClose, onAction, onViewDetails, navigate }) {
  const actions = [
    { label: "View Details",    value: "view",        icon: "👁️", special: true },
    { label: "Edit Partner",    value: "edit",        icon: "✏️" },
    { label: "Toggle Status",   value: "status",      icon: "🔄" },
    { label: "Payment Details", value: "payment",     icon: "💳" },
    { label: "Follow Up",       value: "followup",    icon: "📋" },
    { label: "Assign Login",    value: "assignlogin", icon: "🔑" },
    { label: "Delete",          value: "delete",      icon: "🗑️", danger: true },
  ];
  return (
    <>
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{row.fullname}</p>
          <p className="text-xs text-gray-400 mt-0.5">{row.contact} · {row.city}, {row.state}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 shrink-0">
          <X size={18} className="text-gray-400" />
        </button>
      </div>
      <div className="p-4 grid grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto scrollbar-hide">
        {actions.map((a) => (
          <button key={a.value}
            onClick={() => {
              onClose();
              if (a.special) return onViewDetails(row);
              onAction(a.value, row);
            }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium text-left transition-all active:scale-95
              ${a.danger   ? "bg-red-50 text-red-500 hover:bg-red-100"
              : a.special  ? "text-white hover:opacity-90 shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-[#F2F4FF] hover:text-violet-600"}`}
            style={a.special ? { background: GRADIENT } : {}}
          >
            <span className="text-base">{a.icon}</span>
            <span className="leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ── Three-dot action menu ───────────────────────────────── */
function ActionMenu({ row, onAction, getPaymentStatus }) {
  const navigate = useNavigate();
  const [open, setOpen]             = useState(false);
  const [viewTarget, setViewTarget] = useState(null);

  return (
    <div className="relative">
      <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="3"  r="1.5" fill="#9CA3AF" />
          <circle cx="8" cy="8"  r="1.5" fill="#9CA3AF" />
          <circle cx="8" cy="13" r="1.5" fill="#9CA3AF" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm cursor-pointer"
          onClick={() => setOpen(false)} />
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[71] bg-white rounded-t-3xl shadow-2xl">
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>
            <ActionPopupContent row={row} onClose={() => setOpen(false)} onAction={onAction} onViewDetails={(r) => { setOpen(false); setViewTarget(r); }} navigate={navigate} />
            <div className="h-6" />
          </div>
          <div className="hidden md:flex fixed inset-0 z-[71] items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
              <ActionPopupContent row={row} onClose={() => setOpen(false)} onAction={onAction} onViewDetails={(r) => { setOpen(false); setViewTarget(r); }} navigate={navigate} />
            </div>
          </div>
        </>
      )}

      {viewTarget && (
        <ViewDetailsPopup partner={viewTarget} getPaymentStatus={getPaymentStatus} onClose={() => setViewTarget(null)} />
      )}
    </div>
  );
}

/* ── Mobile card ─────────────────────────────────────────── */
function PartnerMobileCard({ partner, onAction, getPaymentStatus }) {
  const [viewTarget, setViewTarget] = useState(null);
  const initials  = partner.fullname?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "?";
  const payStatus = getPaymentStatus(partner);

  return (
    <>
      <div className="bg-white rounded-[16px] p-4 flex flex-col gap-4 shadow-sm border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: GRADIENT }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[16px] font-bold text-gray-900 leading-tight">{partner.fullname}</h3>
              <FollowupBadge status={partner.followUp || "New"} />
            </div>
            <p className="text-[12.5px] text-gray-400 mt-1 truncate">{partner.email}</p>
          </div>
          <ActionMenu row={partner} onAction={onAction} getPaymentStatus={getPaymentStatus} />
        </div>
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-1.5 text-[13px] text-gray-500"><Phone size={13} className="text-gray-400 shrink-0" />{partner.contact}</div>
          <div className="flex items-center gap-1.5 text-[13px] text-gray-500"><MapPin size={13} className="text-gray-400 shrink-0" />{partner.city}</div>
        </div>
        {partner.category && (
          <div className="flex flex-wrap gap-2">
            <span className="text-[12px] font-semibold px-3 py-1 rounded-[6px] border border-gray-200 bg-white text-gray-700">{partner.category}</span>
          </div>
        )}
        <div className="flex items-center justify-between bg-gray-50 rounded-[10px] px-4 py-3">
          <PaymentBadge status={payStatus} />
          <div className="text-right">
            <p className="text-[11px] text-gray-400 font-medium">Total Earnings</p>
            <p className="text-[16px] font-extrabold text-gray-900 leading-tight">₹{Number(partner.amount || 0).toLocaleString("en-IN")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewTarget(partner)}
            className="flex-1 py-3 rounded-[10px] text-[14px] font-bold text-white hover:opacity-90 transition-opacity" style={{ background: GRADIENT }}>
            View Details
          </button>
          <a href={`tel:${partner.contact}`} className="w-12 h-12 flex items-center justify-center rounded-[10px] border border-gray-200 bg-white hover:bg-gray-50">
            <Phone size={17} className="text-gray-500" />
          </a>
          <button className="w-12 h-12 flex items-center justify-center rounded-[10px] border border-gray-200 bg-white hover:bg-gray-50">
            <MessageSquare size={17} className="text-gray-500" />
          </button>
          <button className="w-12 h-12 flex items-center justify-center rounded-[10px] border border-gray-200 bg-white hover:bg-gray-50">
            <BarChart2 size={17} className="text-gray-500" />
          </button>
        </div>
      </div>
      {viewTarget && (
        <ViewDetailsPopup partner={viewTarget} getPaymentStatus={getPaymentStatus} onClose={() => setViewTarget(null)} />
      )}
    </>
  );
}

/* ── Main PartnersTable ──────────────────────────────────── */
export default function PartnersTable({
  data = [], onAction, getPaymentStatus = () => "—",
  followUpColorMap = {}, onFollowUpClick, onAssignLoginClick,
}) {
  const [sorting, setSorting]       = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });

  const columns = useMemo(() => [
    {
      id: "sn",
      header: "SN",
      cell: ({ row: r }) => (
        <div className="relative group flex items-center">
          <span className={`min-w-6 flex items-center justify-center px-2 py-1 rounded-md cursor-pointer text-xs font-bold ${r.original.status === "Active" ? "bg-[#EAFBF1] text-[#0BB501]" : "bg-[#FFEAEA] text-[#ff2323]"}`}>
            {r.index + 1}
          </span>
          <div className="absolute w-[65px] text-center -top-10 left-8 -translate-x-1/2 px-2 py-1.5 rounded bg-black text-white text-xs hidden group-hover:block z-10">
            {r.original.status === "Active" ? "Active" : "Inactive"}
          </div>
        </div>
      ),
      size: 70,
    },
    {
      accessorKey: "followUp",
      header: "FOLLOW UP",
      cell: ({ row: r }) => {
        const cls = followUpColorMap[r.original.followUp] || "bg-[#efefef] text-[#000000]";
        return (
          <span onClick={() => onFollowUpClick?.(r.original)}
            className={`px-2 py-1 rounded-md cursor-pointer text-xs font-medium ${cls}`}>
            {r.original.followUp || "- Empty -"}
          </span>
        );
      },
      minSize: 150,
    },
    { accessorKey: "created_at", header: "DATE & TIME", size: 200 },
    {
      accessorKey: "fullname",
      header: "PARTNER NAME",
      cell: ({ row: r }) => (
        <div className="flex gap-1.5 items-center">
          {/* Login status indicator */}
          <div className="relative group cursor-pointer"
            onClick={() => onAssignLoginClick?.(r.original)}>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${r.original.loginstatus === "Active" ? "bg-[#EAFBF1] text-[#0BB501]" : "bg-[#FBE9E9] text-[#FF0000]"}`}>
              {r.original.loginstatus === "Active" ? <MdDone size={12} /> : <RxCross2 size={12} />}
            </div>
            <div className="absolute w-[140px] text-center -top-10 left-8 -translate-x-1/2 px-2 py-1.5 rounded bg-black text-white text-xs hidden group-hover:block z-10">
              {r.original.loginstatus === "Active" ? "Login Active" : "Login Inactive"}
            </div>
          </div>
          {/* Name with KYC tooltip */}
          <div className="relative group cursor-pointer">
            <span className={`text-[13px] font-medium ${r.original.adharno && r.original.panno && r.original.adharimage && r.original.panimage ? "text-green-600" : "text-gray-900"}`}>
              {r.original.fullname}
            </span>
            <div className="absolute w-[140px] text-center -top-10 left-1/2 -translate-x-1/2 px-2 py-1.5 rounded bg-black text-white text-xs hidden group-hover:block z-10">
              {r.original.adharno && r.original.panno && r.original.adharimage && r.original.panimage ? "KYC Completed" : "KYC Incomplete"}
            </div>
          </div>
        </div>
      ),
      size: 200,
    },
    { accessorKey: "contact", header: "CONTACT", size: 150 },
    { accessorKey: "state",   header: "STATE",   size: 150 },
    { accessorKey: "city",    header: "CITY",    size: 150 },
    {
      id: "actions",
      header: "",
      cell: ({ row: r }) => <ActionMenu row={r.original} onAction={onAction} getPaymentStatus={getPaymentStatus} />,
      enableSorting: false,
    },
  ], [onAction, getPaymentStatus, followUpColorMap, onFollowUpClick, onAssignLoginClick]);

  const table = useReactTable({
    data, columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const total = data.length;
  const start = pagination.pageIndex * pagination.pageSize + 1;
  const end   = Math.min(start + pagination.pageSize - 1, total);
  const pageData = data.slice(pagination.pageIndex * pagination.pageSize, (pagination.pageIndex + 1) * pagination.pageSize);

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile */}
      <div className="flex flex-col gap-3 md:hidden">
        {pageData.length === 0
          ? <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center text-gray-400 text-sm">No partners found.</div>
          : pageData.map((p, i) => (
            <PartnerMobileCard key={p.salespersonsid || i} partner={p} onAction={onAction} getPaymentStatus={getPaymentStatus} />
          ))
        }
      </div>

      {/* Desktop */}
      <div className="hidden md:block bg-white rounded-[10px] border border-gray-100 overflow-hidden shadow-sm">
        {data.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No partners found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {table.getHeaderGroups().map(hg =>
                    hg.headers.map(header => (
                      <th key={header.id}
                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                        className={`px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 tracking-widest uppercase whitespace-nowrap select-none
                          ${header.column.getCanSort() ? "cursor-pointer hover:text-gray-600 transition-colors" : ""}`}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="flex flex-col ml-0.5 opacity-40">
                              <ChevronUp size={9} className={header.column.getIsSorted() === "asc" ? "opacity-100 text-violet-600" : ""} />
                              <ChevronDown size={9} className={header.column.getIsSorted() === "desc" ? "opacity-100 text-violet-600" : ""} />
                            </span>
                          )}
                        </div>
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/60 bg-white">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-5 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-[13px] text-gray-400">Showing {total === 0 ? 0 : start}–{end} of {total} partners</p>
        <div className="flex items-center gap-2">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 text-[13px] font-semibold text-gray-700 border border-gray-200 rounded-[7px] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Previous
          </button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
            className="px-4 py-2 text-[13px] font-semibold text-gray-700 border border-gray-200 rounded-[7px] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}