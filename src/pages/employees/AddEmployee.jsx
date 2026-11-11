import { useState, useEffect } from "react";
import { ArrowLeft, ChevronDown } from "lucide-react";

const GRADIENT = "linear-gradient(110.73deg, #5E23DC 0%, #7C3AED 100%)";

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none shrink-0 ${checked ? "bg-violet-600" : "bg-gray-200"}`}
    >
      <span className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all duration-200 ${checked ? "left-[22px]" : "left-[3px]"}`} />
    </button>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-[16px] font-extrabold text-gray-900">{title}</h2>
      {subtitle && <p className="text-[12.5px] text-gray-400 mt-0.5">{subtitle}</p>}
      <div className="mt-4 border-b border-gray-100" />
    </div>
  );
}

// ── Label ─────────────────────────────────────────────────────────────────────
function Label({ children, required }) {
  return (
    <label className="block text-[13px] font-medium text-gray-700 mb-2">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

// ── Field Error ───────────────────────────────────────────────────────────────
function FieldError({ msg }) {
  return msg ? <p className="text-[11.5px] text-red-500 mt-1">{msg}</p> : null;
}

// ── Input ─────────────────────────────────────────────────────────────────────
function Input({ label, required, prefix, suffix, error, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3.5 text-[13px] text-gray-400 select-none pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          className={`w-full border rounded-[6px] py-[10px] text-[13.5px] text-gray-800 placeholder:text-gray-400 outline-none transition-all bg-white
            ${error
              ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-50"
              : "border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-50"
            }
            ${prefix ? "pl-10 pr-3.5" : suffix ? "pl-3.5 pr-10" : "px-3.5"}`}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3.5 text-gray-400 pointer-events-none">{suffix}</span>
        )}
      </div>
      <FieldError msg={error} />
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
function SelectField({ label, required, error, children, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <div className="relative">
        <select
          className={`w-full border rounded-[6px] px-3.5 py-[10px] text-[13.5px] text-gray-800 outline-none transition-all appearance-none bg-white cursor-pointer pr-9
            ${error
              ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-50"
              : "border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-50"
            }`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      <FieldError msg={error} />
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
function Textarea({ label, required, rows = 3, error, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <textarea
        rows={rows}
        className={`w-full border rounded-[6px] px-3.5 py-[10px] text-[13.5px] text-gray-800 placeholder:text-gray-400 outline-none transition-all resize-none bg-white
          ${error
            ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-50"
            : "border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-50"
          }`}
        {...props}
      />
      <FieldError msg={error} />
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ children }) {
  return (
    <div className="bg-white rounded-[10px] border border-gray-100 px-6 py-6 shadow-sm">
      {children}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const toDateInput = (val) => {
  if (!val) return "";
  try { return new Date(val).toLocaleDateString("en-CA"); } catch { return ""; }
};

// ── AddEmployee ───────────────────────────────────────────────────────────────
/**
 * AddEmployee / EditEmployee Form
 *
 * Props:
 *  @param {Object|null} editData      - Employee object when editing; null for add mode
 *  @param {Array}       states        - Array of state strings from API
 *  @param {Array}       cities        - Array of city strings; parent re-fetches when state changes
 *  @param {Array}       roles         - Array of { roleid, role } from API
 *  @param {Array}       departments   - Array of { departmentid, department } from API
 *  @param {boolean}     loading       - Shows spinner on Save button while API call is in progress
 *  @param {function}    onBack        - Called when Cancel / back arrow is clicked
 *  @param {function}    onSave        - Called with (formData, isEditMode) on valid submit
 *  @param {function}    onStateChange - Called with selected state string so parent can fetch cities
 */
export default function AddEmployee({
  editData = null,
  states = [],
  cities = [],
  roles = [],
  departments = [],
  loading = false,
  onBack,
  onSave,
  onStateChange,
}) {
  const isEditMode = !!editData?.id;

  const emptyForm = {
    name: "", uid: "", contact: "", email: "", address: "",
    state: "", city: "", dob: "", departmentid: "", roleid: "",
    salary: "", doj: "", status: "Active",
    emergencyContact: "", notes: "",
  };

  const [form, setForm] = useState(isEditMode ? { ...emptyForm, ...editData, departmentid: String(editData.departmentid || ""), roleid: String(editData.roleid || "") } : emptyForm);
  const [errors, setErrors] = useState({});
  const [isActive, setIsActive] = useState(isEditMode ? editData.status === "Active" : true);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(editData?.avatar || null);

  // Sync status toggle → form field
  useEffect(() => {
    setForm(f => ({ ...f, status: isActive ? "Active" : "Inactive" }));
  }, [isActive]);

  // Notify parent when state changes (so parent can fetch cities)
  useEffect(() => {
    if (form.state) onStateChange && onStateChange(form.state);
  }, [form.state]);

  // Photo file → preview
  const handlePhoto = (file) => {
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = e => setPhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: "" }));
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.contact || !/^\d{10}$/.test(form.contact)) e.contact = "Enter a valid 10-digit number";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (form.uid && !/^\d{12}$/.test(form.uid)) e.uid = "Aadhaar must be exactly 12 digits";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.state) e.state = "Please select a state";
    if (!form.city) e.city = "Please select a city";
    if (!form.departmentid) e.departmentid = "Please select a department";
    if (!form.roleid) e.roleid = "Please select a role";
    if (!form.salary || isNaN(form.salary) || Number(form.salary) <= 0) e.salary = "Enter a valid salary amount";
    return e;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const payload = { ...form };
    if (photoFile) payload.photoFile = photoFile;
    onSave && onSave(payload, isEditMode);
  };

  const errorCount = Object.keys(errors).length;

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-5 md:px-8 py-4 border-b border-gray-100 bg-white shadow-sm">
        <button onClick={onBack} type="button" className="p-1.5 rounded-[6px] hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} className="text-gray-800" strokeWidth={2.2} />
        </button>
        <div>
          <h1 className="text-[17px] font-extrabold text-gray-900">
            {isEditMode ? "Edit Employee" : "Add Employee"}
          </h1>
          {isEditMode && <p className="text-[11.5px] text-gray-400">Editing: {editData.name}</p>}
        </div>
        {isEditMode && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-violet-100 text-violet-700">
            ✏️ Edit Mode
          </span>
        )}
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto py-6 px-4 md:px-8">
        <form id="emp-form" onSubmit={handleSubmit} noValidate>
          <div className="max-w-6xl space-y-5">

            {/* ── 1. Personal Information ── */}
            <SectionCard>
              <SectionHeader
                title="Personal Information"
                subtitle="Basic identification details as per official documents."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <Input
                  label="Full Name (As per UID)" required
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  error={errors.name}
                />

                <Input
                  label="Date of Birth" type="date"
                  value={toDateInput(form.dob)}
                  onChange={e => set("dob", e.target.value)}
                />

                <Input
                  label="Contact Number" required
                  placeholder="98765 43210" prefix="+91"
                  value={form.contact}
                  onChange={e => { if (/^\d{0,10}$/.test(e.target.value)) set("contact", e.target.value); }}
                  error={errors.contact}
                  maxLength={10}
                />

                <Input
                  label="Email Address" type="email" required
                  placeholder="rahul@company.com"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  error={errors.email}
                />

                <div className="md:col-span-2 md:w-1/2">
                  <Input
                    label="Aadhaar Number"
                    placeholder="000000000000"
                    value={form.uid}
                    onChange={e => { if (/^\d{0,12}$/.test(e.target.value)) set("uid", e.target.value); }}
                    error={errors.uid}
                    maxLength={12}
                  />
                </div>

                <div className="md:col-span-2">
                  <Textarea
                    label="Full Address" required rows={3}
                    placeholder="Enter permanent residential address"
                    value={form.address}
                    onChange={e => set("address", e.target.value)}
                    error={errors.address}
                  />
                </div>

                <SelectField
                  label="State" required
                  error={errors.state}
                  value={form.state}
                  onChange={e => { set("state", e.target.value); set("city", ""); }}
                >
                  <option value="">Select State</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </SelectField>

                <SelectField
                  label="City" required
                  error={errors.city}
                  value={form.city}
                  onChange={e => set("city", e.target.value)}
                >
                  <option value="">{form.state ? "Select City" : "Select a state first"}</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </SelectField>

              </div>
            </SectionCard>

            {/* ── 2. Organization Details ── */}
            <SectionCard>
              <SectionHeader
                title="Organization Details"
                subtitle="Role, department, and compensation information."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <SelectField
                  label="Department" required
                  error={errors.departmentid}
                  value={form.departmentid}
                  onChange={e => set("departmentid", e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.departmentid} value={String(d.departmentid)}>{d.department}</option>
                  ))}
                </SelectField>

                <SelectField
                  label="Role" required
                  error={errors.roleid}
                  value={form.roleid}
                  onChange={e => set("roleid", e.target.value)}
                >
                  <option value="">Select Role</option>
                  {roles.map(r => (
                    <option key={r.roleid} value={String(r.roleid)}>{r.role}</option>
                  ))}
                </SelectField>

                <Input
                  label="Monthly Salary (CTC)" required
                  placeholder="0" prefix="₹" type="text"
                  value={form.salary}
                  onChange={e => { if (/^\d*$/.test(e.target.value)) set("salary", e.target.value); }}
                  error={errors.salary}
                />

                <Input
                  label="Date of Joining" type="date"
                  value={toDateInput(form.doj)}
                  onChange={e => set("doj", e.target.value)}
                />

                {/* Status Toggle */}
                <div>
                  <Label>Employee Status</Label>
                  <div className={`flex items-center gap-3 border rounded-[6px] px-3.5 py-[10px] transition-colors ${isActive ? "border-emerald-200 bg-emerald-50/30" : "border-gray-200 bg-gray-50"}`}>
                    <Toggle checked={isActive} onChange={setIsActive} />
                    <div>
                      <p className="text-[13.5px] font-semibold text-gray-800">
                        {isActive ? "Active Employee" : "Inactive Employee"}
                      </p>
                      <p className="text-[11.5px] text-gray-400">
                        {isActive ? "Will have system access" : "No system access"}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </SectionCard>

            {/* ── 3. Optional Details ── */}
            <SectionCard>
              <SectionHeader
                title="Optional Details"
                subtitle="Additional information and file uploads."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <Input
                  label="Emergency Contact"
                  placeholder="Name & Number"
                  value={form.emergencyContact}
                  onChange={e => set("emergencyContact", e.target.value)}
                />

                {/* Profile Photo Upload */}
                <div>
                  <Label>Profile Photo</Label>
                  <label className="block cursor-pointer">
                    <div className={`border border-dashed rounded-[6px] px-4 py-5 flex items-center gap-4 transition-all ${photoPreview ? "border-violet-300 bg-violet-50/20" : "border-gray-200 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/20"}`}>
                      {photoPreview ? (
                        <>
                          <img src={photoPreview} alt="Preview" className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-violet-200" />
                          <div>
                            <p className="text-[13px] font-semibold text-gray-700 truncate max-w-[180px]">{photoFile?.name || "Current photo"}</p>
                            <p className="text-[11.5px] text-violet-500 mt-0.5">Click to change</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[13px] text-gray-600">
                              <span className="text-violet-600 font-semibold">Click to upload</span> or drag & drop
                            </p>
                            <p className="text-[11.5px] text-gray-400 mt-0.5">PNG, JPG up to 5MB</p>
                          </div>
                        </>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handlePhoto(e.target.files?.[0] || null)} />
                  </label>
                </div>

                <div className="md:col-span-2">
                  <Textarea
                    label="Additional Notes" rows={3}
                    placeholder="Any specific remarks..."
                    value={form.notes}
                    onChange={e => set("notes", e.target.value)}
                  />
                </div>

              </div>
            </SectionCard>

            <div className="h-2" />
          </div>
        </form>
      </div>

      {/* ── Sticky Footer ── */}
      <div className="w-full fixed md:sticky bottom-0 z-50 bg-white border-t border-gray-100 px-5 md:px-8 py-5 flex items-center justify-between gap-4">
        <button type="button" onClick={onBack}
          className="px-6 py-2.5 rounded-[8px] border border-gray-200 text-[13.5px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <div className="flex items-center gap-3">
          {errorCount > 0 && (
            <p className="text-[12px] text-red-500 font-medium hidden sm:block">
              {errorCount} field{errorCount > 1 ? "s" : ""} need attention
            </p>
          )}
          <button
            type="submit" form="emp-form" disabled={loading}
            className="px-7 py-2.5 rounded-[8px] text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(94,35,220,0.3)] hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
            style={{ background: GRADIENT }}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Saving...
              </>
            ) : (isEditMode ? "Update Employee" : "Save Employee")}
          </button>
        </div>
      </div>
    </div>
  );
}