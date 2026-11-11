/**
 * TicketsModals.jsx
 * View Ticket + Add Response modals
 */
import { ChevronDown, X } from "lucide-react";
import Loader from "../../components/Loader";
import { STATUS_STYLE } from "./TicketsFilters";

const GRADIENT    = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 97.17%)";
const inputCls    = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#5323DC] focus:ring-2 focus:ring-violet-50 transition-all bg-white placeholder:text-gray-400";
const textareaCls = `${inputCls} resize-none`;
const btnPrimary  = "px-5 py-2.5 text-white text-sm font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all";
const btnSecondary= "px-5 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition-all";

function Modal({ show, onClose, title, children, wide }) {
  if (!show) return null;
  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className="md:hidden fixed inset-x-0 bottom-0 z-[71] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>
        <ModalInner title={title} onClose={onClose}>{children}</ModalInner>
        <div className="h-6" />
      </div>
      <div className="hidden md:flex fixed inset-0 z-[71] items-center justify-center px-4">
        <div className={`bg-white rounded-3xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto scrollbar-hide`}>
          <ModalInner title={title} onClose={onClose}>{children}</ModalInner>
        </div>
      </div>
    </>
  );
}

function ModalInner({ title, onClose, children }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-3xl">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
          <X size={18} className="text-gray-400" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </>
  );
}

function ReadField({ label, value, wide }) {
  return (
    <div className={`flex flex-col gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</label>
      <div className={`${inputCls} bg-gray-50 pointer-events-none text-gray-700`}>{value || "—"}</div>
    </div>
  );
}

/* ── View Ticket Modal ── */
export function ViewTicketModal({ show, onClose, ticket }) {
  const statusCls = STATUS_STYLE[ticket.status] || "bg-gray-100 text-gray-600";
  return (
    <Modal show={show} onClose={onClose} title="Ticket Details" wide>
      <div className="space-y-4">
        {ticket.status && (
          <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold ${statusCls}`}>
            {ticket.status}
          </span>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReadField label="Ticket No"       value={ticket.ticketno} />
          <ReadField label="Issue"           value={ticket.issue} />
          <ReadField label="Date & Time"     value={ticket.created_at} />
          {ticket.adminid      && <ReadField label="Admin"           value={ticket.admin_name} />}
          {ticket.departmentid && <ReadField label="Department"      value={ticket.department} />}
          {ticket.employeeid   && <ReadField label="Employee"        value={ticket.employee_name} />}
          {(ticket.projectpartnerid && ticket.project_partner) && <ReadField label="Project Partner" value={ticket.project_partner} />}
          {ticket.ticketadder_name && <ReadField label="Raised By" value={ticket.ticketadder_name} />}
          {ticket.ticketadder_role && <ReadField label="Role"       value={ticket.ticketadder_role} />}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Description</label>
          <textarea rows={4} disabled readOnly value={ticket.details || ""}
            className={`${textareaCls} bg-gray-50 pointer-events-none text-gray-700`} />
        </div>
        {ticket.response && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Response</label>
            <div className={`${inputCls} bg-emerald-50 text-emerald-800 pointer-events-none`}>{ticket.response}</div>
          </div>
        )}
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button onClick={onClose} className={btnPrimary} style={{ background: GRADIENT }}>Close</button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Add Response Modal ── */
export function AddResponseModal({
  show, onClose, onSubmit,
  ticketResponse, setTicketResponse,
  selectedStatus, setSelectedStatus,
}) {
  const statusCls = STATUS_STYLE[selectedStatus] || "";
  return (
    <Modal show={show} onClose={onClose} title="Add Response">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Response <span className="text-red-400">*</span>
          </label>
          <textarea rows={4} required placeholder="Enter your response..."
            value={ticketResponse} onChange={e => setTicketResponse(e.target.value)}
            className={textareaCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Change Status</label>
          <div className="relative">
            <div className={`flex items-center justify-between border rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer
              ${selectedStatus ? `${statusCls} border-transparent` : "border-gray-200 text-gray-500"}`}>
              <span>{selectedStatus || "Select Status"}</span>
              <ChevronDown size={14} className="opacity-60" />
            </div>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
              <option value="">Select Status</option>
              <option>Open</option><option>Closed</option><option>Resolved</option>
              <option>Pending</option><option>In Progress</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className={btnSecondary}>Cancel</button>
          <button type="submit" className={btnPrimary} style={{ background: GRADIENT }}>Submit Response</button>
          <Loader />
        </div>
      </form>
    </Modal>
  );
}