/**
 * BuilderModals.jsx
 * Add/Edit and View modals for the Builders page.
 * API: /project-partner/builders/
 */
import { X, ChevronDown } from "lucide-react";
import Loader from "../../components/Loader";
import TagsInput from "./TagsInput";

const GRADIENT    = "linear-gradient(110.73deg, #5E23DC 0%, #7C3AED 100%)";
const inputCls    = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#5323DC] focus:ring-2 focus:ring-[#5323DC10] transition-all bg-white placeholder:text-slate-300";
const textareaCls = `${inputCls} resize-none`;
const btnPrimary  = "px-5 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all";
const btnSecondary= "px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all";

/* ── Shared primitives ─────────────────────────────────────── */
function Modal({ show, onClose, title, children, wide }) {
  if (!show) return null;
  return (
    <>
      <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      {/* Mobile: bottom-sheet */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-[71] bg-white rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        <ModalInner title={title} onClose={onClose}>{children}</ModalInner>
        <div className="h-6" />
      </div>
      {/* Desktop: centered modal */}
      <div className="hidden md:flex fixed inset-0 z-[71] items-center justify-center px-4">
        <div className={`bg-white rounded-3xl shadow-2xl w-full ${wide ? "max-w-3xl" : "max-w-xl"} max-h-[90vh] overflow-y-auto`}>
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

function Field({ label, required, children, fullWidth }) {
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? "sm:col-span-2" : ""}`}>
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function ReadField({ label, value, fullWidth }) {
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? "sm:col-span-2" : ""}`}>
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
      <div className={`${inputCls} bg-slate-50 text-slate-700 pointer-events-none min-h-[42px]`}>{value || "—"}</div>
    </div>
  );
}

function ReadTextarea({ label, value, fullWidth }) {
  return (
    <div className={`flex flex-col gap-1.5 ${fullWidth ? "sm:col-span-2" : ""}`}>
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
      <textarea rows={3} disabled readOnly value={value || ""}
        className={`${textareaCls} bg-slate-50 text-slate-700 pointer-events-none`} />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   1. ADD / EDIT BUILDER
════════════════════════════════════════════════════════════ */
export const EMPTY_BUILDER = {
  company_name: "", contact_person: "", contact: "", email: "",
  office_address: "", website: "", experience: "",
  registration_no: "", dor: "",
  about: "", vision: "", mission: "", quality: "", expertise: "", why_choose: "",
};

export function AddEditBuilderModal({ show, onClose, onSubmit, newBuilder, setNewBuilder }) {
  const isEdit = !!newBuilder.builderid;

  return (
    <Modal show={show} onClose={onClose} title={isEdit ? "Edit Builder" : "Add Builder"} wide>
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" value={newBuilder.builderid || ""} readOnly />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Company Name */}
          <Field label="Company Name" required>
            <input type="text" required placeholder="Enter Company Name"
              value={newBuilder.company_name || ""}
              onChange={(e) => setNewBuilder({ ...newBuilder, company_name: e.target.value })}
              className={inputCls} />
          </Field>

          {/* Contact Person */}
          <Field label="Contact Person" required>
            <input type="text" required placeholder="Enter Contact Person"
              value={newBuilder.contact_person || ""}
              onChange={(e) => setNewBuilder({ ...newBuilder, contact_person: e.target.value })}
              className={inputCls} />
          </Field>

          {/* Contact Number */}
          <Field label="Contact Number" required>
            <input type="text" required maxLength={10} placeholder="10-digit number"
              value={newBuilder.contact || ""}
              onChange={(e) => { if (/^\d{0,10}$/.test(e.target.value)) setNewBuilder({ ...newBuilder, contact: e.target.value }); }}
              className={inputCls} />
          </Field>

          {/* Email */}
          <Field label="Email" required>
            <input type="email" required placeholder="Enter Email"
              value={newBuilder.email || ""}
              onChange={(e) => setNewBuilder({ ...newBuilder, email: e.target.value })}
              className={inputCls} />
          </Field>

          {/* Registration No */}
          <Field label="Registration No." required>
            <input type="text" required placeholder="Enter Registration No."
              value={newBuilder.registration_no || ""}
              onChange={(e) => setNewBuilder({ ...newBuilder, registration_no: e.target.value })}
              className={inputCls} />
          </Field>

          {/* Date of Registration */}
          <Field label="Date of Registration" required>
            <input type="date" required
              value={newBuilder.dor ? newBuilder.dor.split("T")[0] : ""}
              onChange={(e) => setNewBuilder({ ...newBuilder, dor: e.target.value })}
              className={inputCls} />
          </Field>

          {/* Website */}
          <Field label="Website">
            <input type="text" placeholder="Enter Website URL"
              value={newBuilder.website || ""}
              onChange={(e) => setNewBuilder({ ...newBuilder, website: e.target.value })}
              className={inputCls} />
          </Field>

          {/* Experience */}
          <Field label="Experience (Years)">
            <input type="number" min="0" placeholder="e.g. 10"
              value={newBuilder.experience || ""}
              onChange={(e) => { if (/^\d*$/.test(e.target.value)) setNewBuilder({ ...newBuilder, experience: e.target.value }); }}
              className={inputCls} />
          </Field>

          {/* Office Address */}
          <Field label="Office Address" fullWidth>
            <input type="text" placeholder="Enter Office Address"
              value={newBuilder.office_address || ""}
              onChange={(e) => setNewBuilder({ ...newBuilder, office_address: e.target.value })}
              className={inputCls} />
          </Field>

          {/* About */}
          <Field label="About Builder" fullWidth>
            <textarea rows={3} placeholder="Describe the builder..."
              value={newBuilder.about || ""}
              onChange={(e) => setNewBuilder({ ...newBuilder, about: e.target.value })}
              className={textareaCls} />
          </Field>

          {/* Expertise */}
          <div className="sm:col-span-2">
            <TagsInput label="Expertise" name="expertise"
              value={newBuilder.expertise} setField={setNewBuilder} />
          </div>

          {/* Why Choose */}
          <div className="sm:col-span-2">
            <TagsInput label="Why Choose Us" name="why_choose"
              value={newBuilder.why_choose} setField={setNewBuilder} />
          </div>

          {/* Quality */}
          <div className="sm:col-span-2">
            <TagsInput label="Quality & Construction" name="quality"
              value={newBuilder.quality} setField={setNewBuilder} />
          </div>

          {/* Vision */}
          <Field label="Vision">
            <textarea rows={3} placeholder="Builder's vision..."
              value={newBuilder.vision || ""}
              onChange={(e) => setNewBuilder({ ...newBuilder, vision: e.target.value })}
              className={textareaCls} />
          </Field>

          {/* Mission */}
          <Field label="Mission">
            <textarea rows={3} placeholder="Builder's mission..."
              value={newBuilder.mission || ""}
              onChange={(e) => setNewBuilder({ ...newBuilder, mission: e.target.value })}
              className={textareaCls} />
          </Field>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button type="button" onClick={onClose} className={btnSecondary}>Cancel</button>
          <button type="submit" className={btnPrimary} style={{ background: GRADIENT }}>
            {isEdit ? "Update Builder" : "Save Builder"}
          </button>
          <Loader />
        </div>
      </form>
    </Modal>
  );
}

/* ════════════════════════════════════════════════════════════
   2. VIEW BUILDER DETAILS
════════════════════════════════════════════════════════════ */
export function ViewBuilderModal({ show, onClose, builder }) {
  return (
    <Modal show={show} onClose={onClose} title="Builder Details" wide>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReadField label="Company Name"     value={builder.company_name} />
          <ReadField label="Contact Person"   value={builder.contact_person} />
          <ReadField label="Contact Number"   value={builder.contact} />
          <ReadField label="Email"            value={builder.email} />
          <ReadField label="Registration No." value={builder.registration_no} />
          <ReadField label="Registration Date"value={builder.dor?.split("T")[0]} />
          <ReadField label="Status"           value={builder.status} />
          <ReadField label="Website"          value={builder.website} />
          <ReadField label="Experience"       value={builder.experience ? `${builder.experience} years` : ""} />
          <ReadField label="Office Address"   value={builder.office_address} fullWidth />
        </div>

        {/* Textareas */}
        <div className="grid grid-cols-1 gap-4">
          <ReadTextarea label="About"         value={builder.about} />
          <ReadTextarea label="Vision"        value={builder.vision} />
          <ReadTextarea label="Mission"       value={builder.mission} />
          <ReadTextarea label="Quality"       value={builder.quality} />
          <ReadTextarea label="Expertise"     value={builder.expertise} />
          <ReadTextarea label="Why Choose Us" value={builder.why_choose} />
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button onClick={onClose} className={btnPrimary} style={{ background: GRADIENT }}>Close</button>
        </div>
      </div>
    </Modal>
  );
}