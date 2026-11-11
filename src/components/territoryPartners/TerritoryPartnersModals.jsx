/**
 * TerritoryPartnerModals.jsx
 * All modal popups for the Territory Partners page.
 * Territory-specific API endpoints: /project-partner/territory/ and /admin/territorypartner/
 */
import { ChevronDown, X } from "lucide-react";
import Loader from "../Loader";

const GRADIENT    = "linear-gradient(110.73deg, #5E23DC 0%, #7C3AED 100%)";
const inputCls    = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#5323DC] focus:ring-2 focus:ring-[#5323DC10] transition-all bg-white placeholder:text-slate-300";
const selectCls   = `${inputCls} appearance-none cursor-pointer pr-9`;
const btnPrimary  = "px-5 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all";
const btnSecondary= "px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all";

/* ── Constants ─────────────────────────────────────────────── */
export const FOLLOWUP_OPTIONS = [
  "CNR1","CNR2","CNR3","CNR4","Switch Off","Call Busy","Call Back",
  "Not Responding (After Follow Up)","Call Cut / Disconnected","Invalid Number",
  "Wrong Number","Form Filled By Mistake","Repeat Lead","Lead Clash",
  "Details Shared","Not Interested",
  "Not Interested (After Details Shared & Explanation)",
  "Interested","Documents Collected","Payment Done",
];

export const FOLLOWUP_COLOR = {
  New:                "bg-blue-100 text-blue-700",
  CNR1:               "bg-red-100 text-red-600",
  CNR2:               "bg-red-100 text-red-600",
  CNR3:               "bg-red-100 text-red-600",
  CNR4:               "bg-red-100 text-red-600",
  "Switch Off":       "bg-red-100 text-red-700",
  "Call Busy":        "bg-yellow-100 text-yellow-600",
  "Call Back":        "bg-yellow-100 text-yellow-600",
  "Not Responding (After Follow Up)":                    "bg-yellow-100 text-yellow-600",
  "Call Cut / Disconnected":                             "bg-orange-100 text-orange-600",
  "Invalid Number":   "bg-red-100 text-red-700",
  "Wrong Number":     "bg-red-100 text-red-700",
  "Form Filled By Mistake":                              "bg-blue-100 text-blue-600",
  "Repeat Lead":      "bg-gray-100 text-gray-600",
  "Lead Clash":       "bg-purple-100 text-purple-500",
  "Details Shared":   "bg-green-100 text-green-600",
  "Not Interested":   "bg-pink-100 text-pink-600",
  "Not Interested (After Details Shared & Explanation)": "bg-orange-100 text-orange-600",
  Interested:         "bg-green-100 text-green-700",
  "Documents Collected": "bg-green-200 text-green-800",
  "Payment Done":     "bg-green-300 text-green-900",
  Success:            "bg-[#EAFBF1] text-[#0BB501]",
  "Follow Up":        "bg-[#E9F2FF] text-[#0068FF]",
};

const INTEREST_OPTIONS = [
  "Passion for Real Estate Industry",
  "Opportunity to Work with a Growing Company",
  "Learning & Career Growth",
  "Strong Communication & Negotiation Skills",
  "Interest in Marketing & Sales",
  "Local Market Knowledge",
  "Financial Rewards & Performance-Driven Role",
  "Helping People Make Life-Changing Decisions",
];

/* ── Shared primitives ─────────────────────────────────────── */
function Modal({ show, onClose, title, children, wide }) {
  if (!show) return null;
  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      {/* Mobile: bottom-sheet */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-[71] bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        <ModalInner title={title} onClose={onClose}>{children}</ModalInner>
        <div className="h-6" />
      </div>
      {/* Desktop: centered modal */}
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
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-3xl">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
          <X size={18} className="text-slate-400" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function SelectWrapper({ children, ...props }) {
  return (
    <div className="relative">
      <select className={selectCls} {...props}>{children}</select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   1. ADD / EDIT TERRITORY PARTNER
════════════════════════════════════════════════════════════ */
export function AddEditTerritoryModal({
  show, onClose, onSubmit,
  newPartner, setNewPartner,
  states, formCities,
}) {
  const isEdit = !!newPartner.id;  return (
    <Modal show={show} onClose={onClose} title={isEdit ? "Edit Territory Partner" : "Add Territory Partner"} wide>
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" value={newPartner.id || ""}
          onChange={(e) => setNewPartner({ ...newPartner, id: e.target.value })} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" required>
            <input type="text" required placeholder="Enter Full Name" value={newPartner.fullname || ""}
              onChange={(e) => setNewPartner({ ...newPartner, fullname: e.target.value })}
              className={inputCls} />
          </Field>

          <Field label="Contact Number" required>
            <input type="text" required placeholder="10-digit number" maxLength={10}
              value={newPartner.contact || ""}
              onChange={(e) => { if (/^\d{0,10}$/.test(e.target.value)) setNewPartner({ ...newPartner, contact: e.target.value }); }}
              className={inputCls} />
          </Field>

          <Field label="Email" required>
            <input type="email" required placeholder="Enter Email" value={newPartner.email || ""}
              onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
              className={inputCls} />
          </Field>

          <Field label="Select State" required>
            <SelectWrapper required value={newPartner.state || ""}
              onChange={(e) => setNewPartner({ ...newPartner, state: e.target.value, city: "" })}>
              <option value="">Select State</option>
              {states.map((s, i) => <option key={i} value={s.state}>{s.state}</option>)}
            </SelectWrapper>
          </Field>

          <Field label="Select City" required>
            <SelectWrapper required value={newPartner.city || ""}
              onChange={(e) => setNewPartner({ ...newPartner, city: e.target.value })}
              disabled={!newPartner.state}
              style={!newPartner.state ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
              <option value="">Select City</option>
              {formCities.map((c, i) => <option key={i} value={c.city}>{c.city}</option>)}
            </SelectWrapper>
          </Field>

          <Field label="Why are You Interested?" required>
            <SelectWrapper required value={newPartner.intrest || ""}
              onChange={(e) => setNewPartner({ ...newPartner, intrest: e.target.value })}>
              <option value="" disabled>Select reason</option>
              {INTEREST_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </SelectWrapper>
          </Field>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className={btnSecondary}>Cancel</button>
          <button type="submit" className={btnPrimary} style={{ background: GRADIENT }}>
            {isEdit ? "Update" : "Save"}
          </button>
          <Loader />
        </div>
      </form>
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════
   2. PAYMENT ID
════════════════════════════════════════════════════════════ */
export function TerritoryPaymentModal({ show, onClose, onSubmit, payment, setPayment }) {
  return (
    <Modal show={show} onClose={onClose} title="Payment Details">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Payment Amount" required>
          <input type="number" required placeholder="Enter Amount" value={payment.amount}
            onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
            className={inputCls} />
        </Field>
        <Field label="Payment ID" required>
          <input type="text" required placeholder="Enter Payment ID" value={payment.paymentid}
            onChange={(e) => setPayment({ ...payment, paymentid: e.target.value })}
            className={inputCls} />
        </Field>
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className={btnSecondary}>Cancel</button>
          <button type="submit" className={btnPrimary} style={{ background: GRADIENT }}>Update Payment</button>
          <Loader />
        </div>
      </form>
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════
   3. FOLLOW UP
════════════════════════════════════════════════════════════ */
export function TerritoryFollowUpModal({
  show, onClose, onSubmit,
  followUp, setFollowUp,
  followUpText, setFollowUpText,
  followUpList,
}) {
  return (
    <Modal show={show} onClose={onClose} title="Partner Follow Up" wide>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Follow Up Status" required>
          <SelectWrapper required value={followUp} onChange={(e) => setFollowUp(e.target.value)}>
            <option value="">Select Follow Up</option>
            {FOLLOWUP_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </SelectWrapper>
        </Field>

        <Field label="Note" required>
          <input type="text" required placeholder="Enter custom follow up note" value={followUpText}
            onChange={(e) => setFollowUpText(e.target.value)} className={inputCls} />
        </Field>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className={btnSecondary}>Cancel</button>
          <button type="submit" className={`w-full ${btnPrimary}`} style={{ background: GRADIENT }}>
            Add Follow Up
          </button>
          <Loader />
        </div>
      </form>

      {/* Follow Up history */}
      {followUpList.length > 0 && (
        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">History</p>
          {followUpList.map((f, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                <span>{f.created_at} →</span>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${FOLLOWUP_COLOR[f.followUp] || "bg-gray-100 text-black"}`}>
                  {f.followUp}
                </span>
              </div>
              <div className={`${inputCls} bg-slate-50 text-slate-500 pointer-events-none`}>
                {f.followUpText}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════
   4. ASSIGN LOGIN
════════════════════════════════════════════════════════════ */
export function TerritoryAssignLoginModal({
  show, onClose, onSubmit,
  username, setUsername,
  password, setPassword,
}) {
  return (
    <Modal show={show} onClose={onClose} title="Assign Login Access">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Username" required>
          <input type="text" required placeholder="Enter username" value={username}
            onChange={(e) => setUsername(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Password" required>
          <input type="password" required placeholder="Enter password" value={password}
            onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </Field>
        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className={btnSecondary}>Cancel</button>
          <button type="submit" className={btnPrimary} style={{ background: GRADIENT }}>Give Access</button>
          <Loader />
        </div>
      </form>
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════
   5. VIEW TERRITORY PARTNER DETAILS
════════════════════════════════════════════════════════════ */
export function ViewTerritoryPartnerModal({ show, onClose, partner, URI }) {
  const detailFields = [
    ["Status",           partner.status],
    ["Login Status",     partner.loginstatus],
    ["Payment Status",   partner.paymentstatus],
    ...(partner.paymentid  ? [["Payment ID",      partner.paymentid]]               : []),
    ...(partner.amount     ? [["Amount",           `₹${partner.amount}`]]            : []),
    ["Full Name",        partner.fullname],
    ["Contact",          partner.contact],
    ["Email",            partner.email],
    ...(partner.experience ? [["Experience",       partner.experience]]              : []),
    ...(partner.bankname   ? [["Bank Name",        partner.bankname]]                : []),
    ...(partner.accountholdername ? [["Account Holder", partner.accountholdername]] : []),
    ...(partner.accountnumber     ? [["Account No",     partner.accountnumber]]      : []),
    ...(partner.ifsc       ? [["IFSC Code",        partner.ifsc]]                    : []),
    ["Address",          partner.address],
    ["State",            partner.state],
    ["City",             partner.city],
    ...(partner.pincode    ? [["Pin Code",         partner.pincode]]                 : []),
    ...(partner.adharno    ? [["Aadhar No",        partner.adharno]]                 : []),
    ...(partner.panno      ? [["PAN No",           partner.panno]]                   : []),
    ...(partner.rerano     ? [["RERA No",          partner.rerano]]                  : []),
  ];

  const kycImages = [
    ["Aadhar Images",   partner.adharimage],
    ["PAN Card Images", partner.panimage],
    ["RERA Images",     partner.reraimage],
  ];

  return (
    <Modal show={show} onClose={onClose} title="Territory Partner Details" wide>
      <div className="space-y-4">

        {/* Interest banner */}
        {partner.intrest && (
          <div className="bg-[#F2F4FF] rounded-xl p-4">
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-1">Why Interested</p>
            <p className="text-sm text-slate-700 font-medium">{partner.intrest}</p>
          </div>
        )}

        {/* Fields grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {detailFields.map(([label, value], i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
              <div className={`${inputCls} bg-slate-50 text-slate-700 pointer-events-none`}>{value || "—"}</div>
            </div>
          ))}
        </div>

        {/* KYC Images */}
        {kycImages.map(([label, raw]) => {
          if (!raw) return null;
          let imgs = [];
          try { imgs = JSON.parse(raw); } catch {}
          if (!imgs.length) return null;
          return (
            <div key={label}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{label}</p>
              <div className="grid grid-cols-2 gap-3">
                {imgs.map((img, i) => (
                  <img key={i} src={`${URI}${img}`} alt={`${label} ${i + 1}`}
                    onClick={() => window.open(`${URI}${img}`, "_blank")}
                    className="w-full rounded-xl object-cover cursor-pointer border border-slate-100" />
                ))}
              </div>
            </div>
          );
        })}

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button onClick={onClose} className={btnPrimary} style={{ background: GRADIENT }}>Close</button>
        </div>
      </div>
    </Modal>
  );
}