import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import {
  ArrowLeft, User, MapPin, Briefcase, Settings,
  ImagePlus, Check, ChevronDown,
} from "lucide-react";
import Loader from "../../components/Loader";

const GRADIENT = "linear-gradient(110.73deg, #5E23DC 0%, #7C3AED 100%)";

/* ── Internal UI primitives (original design) ── */
function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none flex-shrink-0 ${checked ? "bg-violet-600" : "bg-gray-200"}`}>
      <span className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all duration-200 ${checked ? "left-[22px]" : "left-[3px]"}`} />
    </button>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2.5 pb-5 border-b border-gray-100 mb-6">
      <Icon size={17} className="text-violet-600 shrink-0" />
      <h2 className="text-[15px] font-bold text-gray-900">{title}</h2>
    </div>
  );
}

function Label({ children, required }) {
  return (
    <label className="block text-[13px] font-medium text-gray-700 mb-2">
      {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function Input({ label, required, error, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <input
        className={`w-full border rounded-[6px] px-3.5 py-2.5 text-[13.5px] text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 transition-all
          ${error ? "border-red-400 focus:border-red-400 focus:ring-red-50" : "border-gray-200 focus:border-violet-400 focus:ring-violet-50"}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SelectField({ label, required, value, onChange, disabled, children }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <div className="relative">
        <select
          value={value} onChange={onChange} disabled={disabled}
          className={`w-full border border-gray-200 rounded-[6px] px-3.5 py-2.5 text-[13.5px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all appearance-none bg-white cursor-pointer pr-9
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {children}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function Textarea({ label, required, rows = 4, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <textarea rows={rows}
        className="w-full border border-gray-200 rounded-[6px] px-3.5 py-2.5 text-[13.5px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all resize-none"
        {...props}
      />
    </div>
  );
}

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

export default function AddSalesPartner() {
  const navigate = useNavigate();
  const { URI, setLoading } = useAuth();

  /* ── form state ── */
  const [form, setForm] = useState({
    fullname: "", contact: "", email: "", state: "", city: "", intrest: "",
    experience: "", previousbrokerage: "", bio: "", status: "Active",
  });
  const [errors, setErrors]         = useState({});
  const [photoFile, setPhotoFile]   = useState(null);
  const [leadSharing, setLeadSharing]     = useState(true);
  const [netVisibility, setNetVisibility] = useState(true);
  const [commission, setCommission]       = useState(true);
  const [states, setStates]   = useState([]);
  const [cities, setCities]   = useState([]);

  /* ── fetch states ── */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${URI}/admin/states`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
        if (r.ok) setStates(await r.json());
      } catch (e) { console.error(e); }
    })();
  }, []);

  /* ── fetch cities on state change ── */
  useEffect(() => {
    if (!form.state) { setCities([]); return; }
    (async () => {
      try {
        const r = await fetch(`${URI}/admin/cities/${form.state}`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
        if (r.ok) setCities(await r.json());
      } catch (e) { console.error(e); }
    })();
  }, [form.state]);

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (field === "state") setForm((p) => ({ ...p, state: value, city: "" }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullname.trim())  e.fullname = "Name is required";
    if (!form.email.trim())     e.email    = "Email is required";
    if (!form.contact.trim() || !/^[6-9]\d{9}$/.test(form.contact)) e.contact = "Enter valid 10-digit number";
    if (!form.state)            e.state    = "State is required";
    if (!form.city)             e.city     = "City is required";
    if (!form.intrest)          e.intrest  = "Please select your interest";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, leadSharing, netVisibility, commission };
      const r = await fetch(`${URI}/project-partner/sales/add`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.status === 409) { alert("Sales partner already exists!"); return; }
      if (!r.ok) throw new Error(`Status: ${r.status}`);
      alert("Sales partner added successfully!");
      navigate("/app/sales-partners");
    } catch (e) { console.error(e); alert("Please check all fields and try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Header (original design) ── */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-5 md:px-8 py-4 border-b border-gray-100 bg-white">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-[6px] hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <h1 className="text-[17px] font-bold text-gray-900">Add Sales Partners</h1>
      </div>

      {/* ── Body ── */}
      <form id="add-sp-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="max-w-6xl px-5 md:px-8 py-8 space-y-8 bg-white">

          {/* Partner Basic Information */}
          <section>
            <SectionHeader icon={User} title="Partner Basic Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Full Name" required placeholder="e.g. Rahul Sharma"
                value={form.fullname} onChange={(e) => handleChange("fullname", e.target.value)}
                error={errors.fullname} />
              <Input label="Contact Number" required placeholder="9876543210" maxLength={10}
                value={form.contact}
                onChange={(e) => { if (/^\d{0,10}$/.test(e.target.value)) handleChange("contact", e.target.value); }}
                error={errors.contact} />
              <Input label="Email Address" required type="email" placeholder="rahul@example.com"
                value={form.email} onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email} />

              {/* Profile Photo */}
              <div>
                <Label>Profile Photo</Label>
                <label className="block cursor-pointer">
                  <div className="border border-dashed border-gray-200 rounded-[6px] px-4 py-[11px] flex items-center gap-3 text-gray-400 hover:border-violet-300 hover:bg-violet-50/30 transition-all">
                    <ImagePlus size={17} className="text-gray-400 shrink-0" />
                    <span className="text-[13.5px] text-gray-400">{photoFile ? photoFile.name : "Upload profile photo..."}</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
          </section>

          {/* Location Details */}
          <section>
            <SectionHeader icon={MapPin} title="Location Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField label="State" required value={form.state} onChange={(e) => handleChange("state", e.target.value)}>
                <option value="">Select State</option>
                {states.map((s, i) => <option key={i} value={s.state}>{s.state}</option>)}
              </SelectField>
              {errors.state && <p className="text-xs text-red-500 -mt-4">{errors.state}</p>}

              <SelectField label="City" required value={form.city} onChange={(e) => handleChange("city", e.target.value)} disabled={!form.state}>
                <option value="">Select City</option>
                {cities.map((c, i) => <option key={i} value={c.city}>{c.city}</option>)}
              </SelectField>
              {errors.city && <p className="text-xs text-red-500 -mt-4">{errors.city}</p>}
            </div>
          </section>

          {/* Partner Intent and Background */}
          <section>
            <SectionHeader icon={Briefcase} title="Partner Intent and Background" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <SelectField label="Why are You Interested?" required value={form.intrest} onChange={(e) => handleChange("intrest", e.target.value)}>
                  <option value="" disabled>Select reason</option>
                  {INTEREST_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </SelectField>
                {errors.intrest && <p className="text-xs text-red-500 mt-1">{errors.intrest}</p>}
              </div>
              <Input label="Years of Experience" placeholder="e.g. 5"
                value={form.experience} onChange={(e) => handleChange("experience", e.target.value)} />
              <Input label="Previous Brokerage" placeholder="e.g. Century Real Estate"
                value={form.previousbrokerage} onChange={(e) => handleChange("previousbrokerage", e.target.value)} />
              <div className="md:col-span-2">
                <Textarea label="Short Bio" rows={3} placeholder="Professional biography..."
                  value={form.bio} onChange={(e) => handleChange("bio", e.target.value)} />
              </div>
            </div>
          </section>

          {/* Network Settings */}
          <section>
            <SectionHeader icon={Settings} title="Network Settings" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField label="Partner Status" value={form.status} onChange={(e) => handleChange("status", e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </SelectField>

              {/* Commission Agreement */}
              <div>
                <Label>Commission Agreement</Label>
                <button type="button" onClick={() => setCommission(!commission)}
                  className="w-full flex items-center gap-3 border border-gray-200 rounded-[6px] px-3.5 py-2.5 hover:border-gray-300 transition-colors">
                  <span className={`w-5 h-5 rounded-[4px] flex items-center justify-center border transition-all flex-shrink-0 ${commission ? "border-violet-600 bg-violet-600" : "border-gray-300 bg-white"}`}>
                    {commission && <Check size={12} className="text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-[13.5px] text-gray-700 font-medium">Signed and Verified</span>
                </button>
              </div>

              {/* Lead Sharing Toggle */}
              <div>
                <Label>Lead Sharing</Label>
                <div className="flex items-center justify-between border border-gray-200 rounded-[6px] px-3.5 py-2.5">
                  <span className="text-[13.5px] text-gray-700 font-medium">Lead Sharing Permission</span>
                  <Toggle checked={leadSharing} onChange={setLeadSharing} />
                </div>
              </div>

              {/* Network Visibility Toggle */}
              <div>
                <Label>Network Visibility</Label>
                <div className="flex items-center justify-between border border-gray-200 rounded-[6px] px-3.5 py-2.5">
                  <span className="text-[13.5px] text-gray-700 font-medium">Visible in Network</span>
                  <Toggle checked={netVisibility} onChange={setNetVisibility} />
                </div>
              </div>
            </div>
          </section>

          <div className="h-2" />
        </div>
      </form>

      {/* ── Footer (original design) ── */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 md:px-8 py-4 flex items-center justify-between gap-4">
        <button type="button" onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-[6px] border border-gray-200 text-[13.5px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <Loader />
          <button type="submit" form="add-sp-form"
            className="flex items-center gap-2 px-6 py-2.5 rounded-[6px] text-[13.5px] font-bold text-white shadow-[0_4px_14px_rgba(94,35,220,0.3)] hover:opacity-90 transition-opacity"
            style={{ background: GRADIENT }}>
            <Check size={14} strokeWidth={2.5} />
            Save Sales Partner
          </button>
        </div>
      </div>
    </div>
  );
}