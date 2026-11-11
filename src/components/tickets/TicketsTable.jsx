import { useMemo, useState } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, flexRender,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, Eye, Pencil, CheckCircle, UserPlus, RotateCcw, X } from "lucide-react";
import { STATUS_STYLE, PRIORITY_STYLE } from "./TicketsFilters";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 97.17%)";

/* ── Status badge ── */
function StatusBadge({ status }) {
  const cls = STATUS_STYLE[status] || "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center text-[11.5px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap ${cls}`}>
      {status || "—"}
    </span>
  );
}

/* ── Priority badge ── */
function PriorityBadge({ priority }) {
  const cls = PRIORITY_STYLE[priority] || "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-flex items-center text-[11.5px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap ${cls}`}>
      {priority || "—"}
    </span>
  );
}

/* ── Role badge ── */
function RoleBadge({ role }) {
  const styles = {
    "Customer": "bg-blue-50 text-blue-600",
    "Partner":  "bg-violet-50 text-violet-600",
    "Internal": "bg-gray-100 text-gray-600",
    "Tenant":   "bg-teal-50 text-teal-600",
    "Owner":    "bg-amber-50 text-amber-600",
  };
  return (
    <span className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap ${styles[role] || "bg-gray-100 text-gray-500"}`}>
      {role || "—"}
    </span>
  );
}

/* ── Initials avatar ── */
function Avatar({ name, size = "w-7 h-7" }) {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  return (
    <div className={`${size} rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0`}
      style={{ background: GRADIENT }}>
      {initials}
    </div>
  );
}

/* ── Status change popup ── */
function StatusPopup({ row, onClose, onChangeStatus }) {
  const statuses = ["Open", "Closed", "Resolved", "Pending", "In Progress"];
  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className="md:hidden fixed inset-x-0 bottom-0 z-[71] bg-white rounded-t-3xl shadow-2xl">
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>
        <StatusPopupContent row={row} onClose={onClose} onChangeStatus={onChangeStatus} />
        <div className="h-6" />
      </div>
      <div className="hidden md:flex fixed inset-0 z-[71] items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden">
          <StatusPopupContent row={row} onClose={onClose} onChangeStatus={onChangeStatus} />
        </div>
      </div>
    </>
  );
}
function StatusPopupContent({ row, onClose, onChangeStatus }) {
  const statuses = ["Open", "Closed", "Resolved", "Pending", "In Progress"];
  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div>
          <p className="text-sm font-bold text-gray-900">Change Status</p>
          <p className="text-xs text-gray-400 mt-0.5">{row.ticketno}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100"><X size={18} className="text-gray-400" /></button>
      </div>
      <div className="p-4 flex flex-col gap-2">
        {statuses.map(s => {
          const cls = STATUS_STYLE[s] || "bg-gray-100 text-gray-600";
          return (
            <button key={s} onClick={() => { onChangeStatus(row.ticketid, s); onClose(); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-left ${cls}
                ${row.status === s ? "ring-2 ring-offset-1 ring-[#5323DC]" : "hover:opacity-80"}`}>
              <span className="w-2 h-2 rounded-full bg-current flex-shrink-0" />{s}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ── Row action icons (image 2 style: eye / pencil / check/rotate) ── */
function RowActions({ row, onAction }) {
  const isResolved = row.status === "Resolved";
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onAction("view", row)} title="View"
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
        <Eye size={14} className="text-gray-400" />
      </button>
      <button onClick={() => onAction("update", row)} title="Edit"
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
        <Pencil size={13} className="text-gray-400" />
      </button>
      {isResolved
        ? <button onClick={() => onAction("restore", row)} title="Restore"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <RotateCcw size={13} className="text-gray-400" />
          </button>
        : <button onClick={() => onAction("addResponse", row)} title="Mark / Respond"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-50 transition-colors">
            <CheckCircle size={14} className="text-emerald-500" />
          </button>
      }
    </div>
  );
}

/* ── Mobile card (image 1) ── */
function TicketMobileCard({ row, onAction, onChangeStatus, onViewTicket }) {
  const [statusOpen, setStatusOpen] = useState(false);
  const priorityCls = PRIORITY_STYLE[row.priority] || "text-gray-500";
  const priorityDot = { "High": "●", "Medium": "◎", "Low": "○", "Critical": "◉" };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-3 shadow-sm">
        {/* Row 1: ticket id + status */}
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => onViewTicket(row.ticketid)}
            className="text-[13px] font-bold text-[#5323DC] bg-violet-50 px-2.5 py-1 rounded-lg hover:underline">
            #{row.ticketno}
          </button>
          <button onClick={() => setStatusOpen(true)}>
            <StatusBadge status={row.status} />
          </button>
        </div>

        {/* Row 2: issue title */}
        <p className="text-[15px] font-bold text-gray-900 leading-snug">{row.issue || row.details?.slice(0, 60)}</p>
        {row.project && (
          <p className="text-[12px] text-gray-400">{row.project} {row.unit ? `• ${row.unit}` : ""}</p>
        )}

        {/* Row 3: raised by + role */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar name={row.ticketadder_name || row.employee_name} size="w-8 h-8" />
            <span className="text-[13.5px] font-semibold text-gray-800">{row.ticketadder_name || "—"}</span>
          </div>
          <RoleBadge role={row.ticketadder_role} />
        </div>

        {/* Row 4: priority + assigned to */}
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[12.5px] font-semibold flex items-center gap-1.5 px-2 rounded-md ${priorityCls}`}>
            <span>{priorityDot[row.priority] || "●"}</span>
            {row.priority || "—"} Priority
          </span>
          <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
            <span>Assigned to:</span>
            {row.employee_name
              ? <div className="flex items-center gap-1.5"><Avatar name={row.employee_name} size="w-5 h-5" /><span className="font-medium text-gray-700">{row.employee_name.split(" ")[0]} {row.employee_name.split(" ")[1]?.[0]}.</span></div>
              : <span className="text-gray-400">Unassigned</span>
            }
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Row 5: time + actions */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] text-gray-400">{row.created_at?.split("|")[0]?.trim() || "—"}</span>
          <div className="flex items-center gap-3">
            <button onClick={() => onViewTicket(row.ticketid)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100"><Eye size={15} className="text-gray-400" /></button>
            <button onClick={() => onAction("update", row)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100"><Pencil size={14} className="text-gray-400" /></button>
            <button onClick={() => onAction("addResponse", row)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-50"><CheckCircle size={15} className="text-emerald-500" /></button>
          </div>
        </div>
      </div>

      {statusOpen && (
        <StatusPopup row={row} onClose={() => setStatusOpen(false)} onChangeStatus={onChangeStatus} />
      )}
    </>
  );
}

/* ── Status cell with inline change ── */
function StatusCell({ row, onChangeStatus }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>
        <StatusBadge status={row.status} />
      </button>
      {open && <StatusPopup row={row} onClose={() => setOpen(false)} onChangeStatus={onChangeStatus} />}
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   Main TicketsTable
════════════════════════════════════════════════════════════ */
export default function TicketsTable({ data = [], onAction, onChangeStatus, onViewTicket }) {
  const [sorting, setSorting]       = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const columns = useMemo(() => [
    {
      accessorKey: "ticketno",
      header: "TICKET ID",
      cell: ({ row: r }) => (
        <button onClick={() => onViewTicket(r.original.ticketid)}
          className="text-[12.5px] font-bold text-[#5323DC] hover:underline whitespace-nowrap">
          #{r.original.ticketno}
        </button>
      ),
      size: 100,
    },
    {
      accessorKey: "issue",
      header: "ISSUE TITLE",
      cell: ({ row: r }) => (
        <div className="max-w-[160px]">
          <p className="text-[13px] font-medium text-gray-900 line-clamp-2 leading-snug">{r.original.issue || r.original.details?.slice(0,60)}</p>
        </div>
      ),
      size: 170,
    },
    {
      id: "raisedBy",
      header: "RAISED BY",
      cell: ({ row: r }) => (
        <div className="flex items-center gap-2 min-w-[110px]">
          <Avatar name={r.original.ticketadder_name} size="w-7 h-7" />
          <span className="text-[12.5px] font-medium text-gray-800 leading-tight">{r.original.ticketadder_name || "—"}</span>
        </div>
      ),
      size: 130,
    },
    {
      id: "role",
      header: "ROLE",
      cell: ({ row: r }) => <RoleBadge role={r.original.ticketadder_role} />,
      size: 100,
    },
    {
      accessorKey: "department",
      header: "PROJECT",
      cell: ({ getValue }) => <span className="text-[12.5px] text-gray-700 whitespace-nowrap">{getValue() || "—"}</span>,
      size: 130,
    },
    {
      id: "priority",
      header: "PRIORITY",
      cell: ({ row: r }) => <PriorityBadge priority={r.original.priority} />,
      size: 100,
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row: r }) => <StatusCell row={r.original} onChangeStatus={onChangeStatus} />,
      size: 120,
    },
    {
      id: "assignedTo",
      header: "ASSIGNED TO",
      cell: ({ row: r }) => (
        r.original.employee_name
          ? <div className="flex items-center gap-2 min-w-[110px]">
              <Avatar name={r.original.employee_name} size="w-7 h-7" />
              <span className="text-[12.5px] font-medium text-gray-800">{r.original.employee_name}</span>
            </div>
          : <span className="text-[12.5px] text-gray-400">Unassigned</span>
      ),
      size: 140,
    },
    {
      accessorKey: "created_at",
      header: "CREATED",
      cell: ({ getValue }) => (
        <span className="text-[12px] text-gray-400 whitespace-nowrap">{getValue()?.split("|")[0]?.trim() || "—"}</span>
      ),
      size: 110,
    },
    {
      id: "actions",
      header: "ACTIONS",
      cell: ({ row: r }) => <RowActions row={r.original} onAction={onAction} />,
      size: 100,
      enableSorting: false,
    },
  ], [onAction, onChangeStatus, onViewTicket]);

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
  const pageData = data.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {pageData.length === 0
          ? <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center text-gray-400 text-sm">No tickets found.</div>
          : pageData.map((row, i) => (
            <TicketMobileCard key={row.ticketid || i} row={row}
              onAction={onAction} onChangeStatus={onChangeStatus} onViewTicket={onViewTicket} />
          ))
        }
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-[14px] border border-gray-100 overflow-hidden shadow-sm">
        {data.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No tickets found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
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
                              <ChevronUp   size={8} className={header.column.getIsSorted() === "asc"  ? "opacity-100 text-[#5323DC]" : ""} />
                              <ChevronDown size={8} className={header.column.getIsSorted() === "desc" ? "opacity-100 text-[#5323DC]" : ""} />
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
                  <tr key={row.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 bg-white transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3.5">
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
        <p className="text-[13px] text-gray-400">Showing {total === 0 ? 0 : start}–{end} of {total} tickets</p>
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