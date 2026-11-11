import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, flexRender,
} from "@tanstack/react-table";
import {
  ChevronUp, ChevronDown, Phone, BarChart2, MapPin,
  Briefcase, Clock, AlertTriangle, CheckCircle2, Zap, X,
} from "lucide-react";
import { MdDone } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";

const GRADIENT = "linear-gradient(110.73deg, #5E23DC 0%, #7C3AED 100%)";

/* ── Badges ─────────────────────────────────────────────────── */
function TerritoryBadge({ value }) {
  return (
    <span className="inline-flex items-center text-[12px] font-semibold px-3 py-1.5 rounded-full bg-violet-100 text-violet-600 whitespace-nowrap">
      {value}
    </span>
  );
}

function FollowupBadge({ status }) {
  const s = {
    "Pending":   "bg-amber-50 text-amber-600",
    "Overdue":   "bg-red-50 text-red-500",
    "Completed": "bg-emerald-50 text-emerald-600",
    "Scheduled": "bg-orange-50 text-orange-500",
    "None":      "bg-gray-100 text-gray-400",
  };
  return <span className={`inline-flex text-[11.5px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${s[status] || "bg-gray-100 text-gray-400"}`}>{status || "—"}</span>;
}

function PaymentBadge({ status }) {
  const s = {
    "Paid":      "bg-emerald-100 text-emerald-600",
    "Pending":   "bg-amber-100 text-amber-600",
    "Unpaid":    "bg-amber-100 text-amber-600",
    "Free":      "bg-slate-100 text-slate-500",
    "Follow Up": "bg-blue-100 text-blue-600",
  };
  return <span className={`inline-flex text-[11.5px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide whitespace-nowrap ${s[status] || "bg-gray-100 text-gray-500"}`}>{status || "—"}</span>;
}

/* ── Mobile followup/performance badges (original design) ── */
function MobileFollowupBadge({ status }) {
  const cfg = {
    "Pending":   { bg: "bg-amber-50",   border: "border-amber-100",   text: "text-amber-500",   Icon: Clock,         label: "Pending Followup" },
    "Overdue":   { bg: "bg-red-50",     border: "border-red-100",     text: "text-red-500",     Icon: AlertTriangle, label: "Overdue"          },
    "Completed": { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600", Icon: CheckCircle2,  label: "Scheduled"        },
    "Scheduled": { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-600", Icon: CheckCircle2,  label: "Scheduled"        },
    "None":      { bg: "bg-gray-50",    border: "border-gray-200",    text: "text-gray-400",    Icon: null,          label: "None"             },
  };
  const { bg, border, text, Icon: Ico, label } = cfg[status] || cfg["None"];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-[10px] border whitespace-nowrap ${bg} ${border} ${text}`}>
      {Ico && <Ico size={13} />} {label}
    </span>
  );
}

/* ── Action popup content ────────────────────────────────────── */
function ActionPopupContent({ row, onClose, onAction, navigate }) {
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
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 shrink-0"><X size={18} className="text-gray-400" /></button>
      </div>
      <div className="p-4 grid grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto scrollbar-hide">
        {actions.map((a) => (
          <button key={a.value}
            onClick={() => { onClose(); onAction(a.value, row); }}
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

/* ── Three-dot action menu ───────────────────────────────────── */
function ActionMenu({ row, onAction }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
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
            <ActionPopupContent row={row} onClose={() => setOpen(false)} onAction={onAction} navigate={navigate} />
            <div className="h-6" />
          </div>
          <div className="hidden md:flex fixed inset-0 z-[71] items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
              <ActionPopupContent row={row} onClose={() => setOpen(false)} onAction={onAction} navigate={navigate} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Mobile card (original design, real data) ────────────────── */
function MobileCard({ p, onAction, getPaymentStatus, followUpColorMap, onFollowUpClick, onAssignLoginClick }) {
  const initials  = p.fullname?.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase() || "?";
  const payStatus = getPaymentStatus(p);

  return (
    <div className="bg-white border rounded-[20px] p-5 flex flex-col gap-4 shadow-sm">
      {/* Row 1 */}
      <div className="flex items-start gap-3">
        <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0" style={{ background: GRADIENT }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-[18px] font-extrabold text-gray-900 leading-tight">{p.fullname}</h3>
              {/* Login status */}
              <div onClick={() => onAssignLoginClick?.(p)}
                className={`w-5 h-5 rounded-md flex items-center justify-center cursor-pointer ${p.loginstatus === "Active" ? "bg-[#EAFBF1] text-[#0BB501]" : "bg-[#FBE9E9] text-[#FF0000]"}`}>
                {p.loginstatus === "Active" ? <MdDone size={12} /> : <RxCross2 size={12} />}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{p.email}</p>
          </div>
          <span className="flex items-center gap-1.5 bg-violet-50 text-violet-600 text-[12.5px] font-semibold px-3 py-1.5 rounded-[10px] whitespace-nowrap shrink-0">
            <MapPin size={12} /> {p.city}
          </span>
        </div>
      </div>

      {/* Row 2: Phone + Location */}
      <div className="grid grid-cols-2 gap-x-4">
        <div><p className="text-[12px] text-gray-400 font-medium mb-0.5">Mobile</p><p className="text-[15px] font-bold text-gray-900">{p.contact}</p></div>
        <div><p className="text-[12px] text-gray-400 font-medium mb-0.5">State</p><p className="text-[15px] font-bold text-gray-900">{p.state}</p></div>
      </div>

      {/* Row 3: Follow-up status */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span onClick={() => onFollowUpClick?.(p)}
          className={`cursor-pointer inline-flex items-center gap-1.5 text-[13px] font-semibold px-3.5 py-2 rounded-[10px] border whitespace-nowrap ${followUpColorMap[p.followUp] || "bg-gray-50 border-gray-200 text-gray-400"}`}>
          <Clock size={13} /> {p.followUp || "No Follow Up"}
        </span>
        <PaymentBadge status={payStatus} />
      </div>

      <div className="h-px bg-gray-100" />

      {/* Row 4: Actions */}
      <div className="flex items-center gap-2.5">
        <button onClick={() => onAction("view", p)}
          className="flex-1 py-3.5 rounded-[12px] text-[15px] font-bold text-white text-center hover:opacity-90 transition-opacity" style={{ background: GRADIENT }}>
          View Profile
        </button>
        <a href={`tel:${p.contact}`} className="w-[52px] h-[52px] flex items-center justify-center rounded-[12px] border border-gray-200 bg-white hover:bg-gray-50">
          <Phone size={18} className="text-gray-500" />
        </a>
        <button className="w-[52px] h-[52px] flex items-center justify-center rounded-[12px] border border-gray-200 bg-white hover:bg-gray-50">
          <BarChart2 size={18} className="text-gray-500" />
        </button>
        <ActionMenu row={p} onAction={onAction} />
      </div>
    </div>
  );
}

/* ── Main TerritoryTable ─────────────────────────────────────── */
export default function TerritoryTable({
  data = [], onAction, getPaymentStatus = () => "—",
  followUpColorMap = {}, onFollowUpClick, onAssignLoginClick,
}) {
  const [sorting, setSorting]       = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });

  const columns = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <input type="checkbox" checked={table.getIsAllPageRowsSelected()} onChange={table.getToggleAllPageRowsSelectedHandler()} className="w-4 h-4 accent-violet-600 cursor-pointer" />
      ),
      cell: ({ row }) => (
        <input type="checkbox" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} className="w-4 h-4 accent-violet-600 cursor-pointer" />
      ),
      enableSorting: false,
    },
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
      header: "FULL NAME",
      cell: ({ row: r }) => (
        <div className="flex gap-1.5 items-center">
          <div className="relative group cursor-pointer" onClick={() => onAssignLoginClick?.(r.original)}>
            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${r.original.loginstatus === "Active" ? "bg-[#EAFBF1] text-[#0BB501]" : "bg-[#FBE9E9] text-[#FF0000]"}`}>
              {r.original.loginstatus === "Active" ? <MdDone size={12} /> : <RxCross2 size={12} />}
            </div>
            <div className="absolute w-[140px] text-center -top-10 left-8 -translate-x-1/2 px-2 py-1.5 rounded bg-black text-white text-xs hidden group-hover:block z-10">
              {r.original.loginstatus === "Active" ? "Login Active" : "Login Inactive"}
            </div>
          </div>
          <div className="relative group cursor-pointer">
            <span className={`text-[13px] font-medium ${r.original.adharno && r.original.panno ? "text-green-600" : "text-gray-900"}`}>
              {r.original.fullname}
            </span>
            <div className="absolute w-[140px] text-center -top-10 left-1/2 -translate-x-1/2 px-2 py-1.5 rounded bg-black text-white text-xs hidden group-hover:block z-10">
              {r.original.adharno && r.original.panno ? "KYC Completed" : "KYC Incomplete"}
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
      id: "paymentStatus",
      header: "PAYMENT",
      cell: ({ row: r }) => <PaymentBadge status={getPaymentStatus(r.original)} />,
      size: 120,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row: r }) => <ActionMenu row={r.original} onAction={onAction} />,
      enableSorting: false,
    },
  ], [onAction, getPaymentStatus, followUpColorMap, onFollowUpClick, onAssignLoginClick]);

  const table = useReactTable({
    data, columns,
    state: { sorting, rowSelection, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const total = data.length;
  const start = pagination.pageIndex * pagination.pageSize + 1;
  const end   = Math.min(start + pagination.pageSize - 1, total);
  const selectedCount = Object.keys(rowSelection).length;
  const pageData = data.slice(pagination.pageIndex * pagination.pageSize, (pagination.pageIndex + 1) * pagination.pageSize);

  return (
    <div className="flex flex-col gap-4">

      {/* Mobile cards */}
      <div className="flex flex-col gap-4 md:hidden">
        {pageData.length === 0
          ? <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center text-gray-400 text-sm">No partners found.</div>
          : pageData.map((p, i) => (
            <MobileCard key={p.id || i} p={p} onAction={onAction} getPaymentStatus={getPaymentStatus}
              followUpColorMap={followUpColorMap} onFollowUpClick={onFollowUpClick} onAssignLoginClick={onAssignLoginClick} />
          ))
        }
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-[12px] border border-gray-100 overflow-hidden shadow-sm">
        {data.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No partners found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {table.getHeaderGroups().map(hg =>
                    hg.headers.map(header => (
                      <th key={header.id}
                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                        className={`px-4 py-3.5 text-left text-[10.5px] font-bold text-gray-400 tracking-widest uppercase whitespace-nowrap select-none
                          ${header.column.getCanSort() ? "cursor-pointer hover:text-gray-600 transition-colors" : ""}`}>
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="flex flex-col ml-0.5 opacity-40">
                              <ChevronUp   size={8} className={header.column.getIsSorted() === "asc"  ? "opacity-100 text-violet-600" : ""} />
                              <ChevronDown size={8} className={header.column.getIsSorted() === "desc" ? "opacity-100 text-violet-600" : ""} />
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
                  <tr key={row.id}
                    className={`border-b border-gray-50 last:border-0 transition-colors hover:bg-gray-50/50 ${row.getIsSelected() ? "bg-violet-50/30" : "bg-white"}`}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-4">
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
        <p className="text-[13px] text-gray-400">
          Showing {total === 0 ? 0 : start}–{end} of {total} partners
          {selectedCount > 0 && <span className="ml-3 text-violet-600 font-semibold">· {selectedCount} selected</span>}
        </p>
        <div className="flex items-center gap-2">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
            className="px-4 py-2 text-[13px] font-semibold text-gray-700 border border-gray-200 rounded-[7px] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
            Previous
          </button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
            className="px-4 py-2 text-[13px] font-semibold text-gray-700 border border-gray-200 rounded-[7px] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}