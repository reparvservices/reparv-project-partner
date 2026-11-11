import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../store/auth";
import {
  ArrowLeft, UploadCloud, Plus, X, Check,
  Building2, Contact, FileText, Award, Settings,
  Globe, Calendar,
} from "lucide-react";
import Loader from "../../components/Loader";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 97.17%)";

/* ── Tag Input ── */
function TagInput({ placeholder, tags, onAdd, onRemove }) {
  const [val, setVal] = useState("");
  const add = () => { if (val.trim()) { onAdd(val.trim()); setVal(""); } };
  return (
    <div className="space-y-3">
      <div className="flex items-center border border-gray-200 rounded-[6px] overflow-hidden focus-within:border-[#5323DC] transition-colors">
        <input value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 text-sm outline-none bg-transparent text-gray-700 placeholder:text-gray-400" />
        <button type="button" onClick={add}
          className="px-3 py-2.5 text-gray-400 hover:text-[#5323DC] transition-colors border-l border-gray-200">
          <Plus size={16} />
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <span key={i} className="flex items-center gap-1.5 bg-violet-50 text-[#5323DC] text-xs font-medium px-3 py-1 rounded-[6px] border border-violet-100">
              {tag}
              <button type="button" onClick={() => onRemove(i)} className="hover:text-violet-900 transition-colors">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-6">
      <div className="w-8 h-8 rounded-[6px] bg-violet-50 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-[#5323DC]" />
      </div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
    </div>
  );
}

/* ── Label ── */
function Label({ children, required }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

/* ── Input ── */
function Input({ error, className = "", ...props }) {
  return (
    <input
      className={`w-full border rounded-[6px] px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 transition-all
        ${error ? "border-red-400 focus:border-red-400 focus:ring-red-50" : "border-gray-200 focus:border-[#5323DC] focus:ring-violet-50"} ${className}`}
      {...props}
    />
  );
}

/* ── Textarea ── */
function Textarea({ className = "", ...props }) {
  return (
    <textarea rows={3}
      className={`w-full border border-gray-200 rounded-[6px] px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#5323DC] focus:ring-2 focus:ring-violet-50 transition-all resize-none ${className}`}
      {...props}
    />
  );
}

/* ── Toggle ── */
function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none flex-shrink-0 ${checked ? "bg-[#5323DC]" : "bg-gray-200"}`}>
      <span className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all duration-200 ${checked ? "left-[22px]" : "left-[3px]"}`} />
    </button>
  );
}

/* ── empty state ── */
const EMPTY = {
  company_name: "", contact_person: "", contact: "", email: "",
  office_address: "", website: "", experience: "",
  registration_no: "", dor: "",
  about: "", vision: "", mission: "", quality: "", expertise: "", why_choose: "",
};

/* ── parse tag string to array ── */
const toArr = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try { return JSON.parse(v); } catch { return v.split(",").map(s => s.trim()).filter(Boolean); }
};
const toStr = (arr) => JSON.stringify(arr);

/* ════════════════════════════════════════════════════════════
   Main Component
════════════════════════════════════════════════════════════ */
export default function AddBuilder() {
  const navigate = useNavigate();
  const { id }   = useParams();           // present on /app/builder/update/:id
  const isEdit   = !!id;

  const { URI, setLoading } = useAuth();

  /* ── form state ── */
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [logoFile, setLogoFile] = useState(null);

  /* ── tag arrays (local state, serialised on submit) ── */
  const [expertise, setExpertise] = useState([]);
  const [reasons, setReasons]     = useState([]);
  const [standards, setStandards] = useState([]);

  /* ── network settings ── */
  const [visibility, setVisibility] = useState(true);
  const [allowPosts, setAllowPosts] = useState(false);

  const removeTag = (arr, setArr, i) => setArr(arr.filter((_, idx) => idx !== i));
  const addTag    = (arr, setArr, v) => setArr([...arr, v]);

  /* ── fetch existing data on edit ── */
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const r = await fetch(`${URI}/project-partner/builders/${id}`, {
          method: "GET", credentials: "include", headers: { "Content-Type": "application/json" },
        });
        if (!r.ok) throw new Error();
        const d = await r.json();
        setForm(d);
        setExpertise(toArr(d.expertise));
        setReasons(toArr(d.why_choose));
        setStandards(toArr(d.quality));
      } catch (e) { console.error(e); }
    })();
  }, [id]);

  /* ── field change ── */
  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: "" }));
  };

  /* ── validate ── */
  const validate = () => {
    const e = {};
    if (!form.company_name?.trim())    e.company_name    = "Required";
    if (!form.registration_no?.trim()) e.registration_no = "Required";
    if (!form.contact_person?.trim())  e.contact_person  = "Required";
    if (!form.contact?.trim() || !/^\d{10}$/.test(form.contact)) e.contact = "Valid 10-digit number required";
    if (!form.email?.trim())           e.email           = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        expertise: toStr(expertise),
        why_choose: toStr(reasons),
        quality: toStr(standards),
        visibility,
        allowPosts,
      };
      const ep  = isEdit ? `edit/${id}` : "add";
      const mth = isEdit ? "PUT" : "POST";
      const r   = await fetch(`${URI}/project-partner/builders/${ep}`, {
        method: mth, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.status === 409) { alert("Builder already exists!"); return; }
      if (!r.ok) throw new Error();
      alert(isEdit ? "Builder updated!" : "Builder added!");
      navigate("/app/builders");
    } catch (e) { console.error(e); alert("Something went wrong, please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Header ── */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-5 md:px-8 py-4 border-b border-gray-100 bg-white">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-[6px] hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <h1 className="text-[17px] font-bold text-gray-900">{isEdit ? "Edit Builder" : "Add Builder"}</h1>
      </div>

      {/* ── Body ── */}
      <form id="builder-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-6xl px-5 md:px-8 py-8 space-y-10">

          {/* ── Builder Identity ── */}
          <section>
            <SectionHeader icon={Building2} title="Builder Identity" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label required>Company Name</Label>
                <Input placeholder="e.g. Skyline Constructions Ltd." value={form.company_name}
                  onChange={e => set("company_name", e.target.value)} error={errors.company_name} />
                {errors.company_name && <p className="text-xs text-red-500 mt-1">{errors.company_name}</p>}
              </div>
              <div>
                <Label required>Registration Number</Label>
                <Input placeholder="e.g. REG-2024-88392" value={form.registration_no}
                  onChange={e => set("registration_no", e.target.value)} error={errors.registration_no} />
                {errors.registration_no && <p className="text-xs text-red-500 mt-1">{errors.registration_no}</p>}
              </div>
              <div>
                <Label>Date of Registration</Label>
                <div className="relative">
                  <Input type="date" className="pr-10"
                    value={form.dor ? form.dor.split("T")[0] : ""}
                    onChange={e => set("dor", e.target.value)} />
                  <Calendar size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <Label>Experience (Years)</Label>
                <Input placeholder="e.g. 12" value={form.experience}
                  onChange={e => { if (/^\d*$/.test(e.target.value)) set("experience", e.target.value); }} />
              </div>
              <div>
                <Label>Website URL</Label>
                <div className="relative">
                  <Input placeholder="https://" className="pr-10" value={form.website}
                    onChange={e => set("website", e.target.value)} />
                  <Globe size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <Label>Builder Logo</Label>
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-200 rounded-[6px] h-[108px] px-6 py-5 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-[#5323DC] hover:bg-violet-50/40 transition-all">
                    {logoFile
                      ? <p className="text-sm text-[#5323DC] font-medium">{logoFile.name}</p>
                      : (<><UploadCloud size={22} className="text-gray-400" />
                          <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (max. 2MB)</p></>)
                    }
                  </div>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => setLogoFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
          </section>

          {/* ── Contact Information ── */}
          <section>
            <SectionHeader icon={Contact} title="Contact Information" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              <div>
                <Label required>Contact Person</Label>
                <Input placeholder="Full Name" value={form.contact_person}
                  onChange={e => set("contact_person", e.target.value)} error={errors.contact_person} />
                {errors.contact_person && <p className="text-xs text-red-500 mt-1">{errors.contact_person}</p>}
              </div>
              <div>
                <Label required>Contact Number</Label>
                <Input placeholder="10-digit number" maxLength={10} value={form.contact}
                  onChange={e => { if (/^\d{0,10}$/.test(e.target.value)) set("contact", e.target.value); }}
                  error={errors.contact} />
                {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
              </div>
              <div>
                <Label required>Email Address</Label>
                <Input type="email" placeholder="contact@company.com" value={form.email}
                  onChange={e => set("email", e.target.value)} error={errors.email} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
            </div>
            <div>
              <Label>Office Address</Label>
              <Textarea placeholder="Enter complete office address" rows={3} value={form.office_address}
                onChange={e => set("office_address", e.target.value)} />
            </div>
          </section>

          {/* ── Profile Content ── */}
          <section>
            <SectionHeader icon={FileText} title="Profile Content" />
            <div className="mb-5">
              <Label>About Builder</Label>
              <Textarea placeholder="Write a brief description about the builder..." rows={4}
                value={form.about} onChange={e => set("about", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label>Vision</Label>
                <Textarea placeholder="Company vision statement..." value={form.vision}
                  onChange={e => set("vision", e.target.value)} />
              </div>
              <div>
                <Label>Mission</Label>
                <Textarea placeholder="Company mission statement..." value={form.mission}
                  onChange={e => set("mission", e.target.value)} />
              </div>
            </div>
          </section>

          {/* ── Expertise & Highlights ── */}
          <section>
            <SectionHeader icon={Award} title="Expertise & Highlights" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label>Areas of Expertise</Label>
                <TagInput placeholder="Add tag..." tags={expertise}
                  onAdd={v => addTag(expertise, setExpertise, v)}
                  onRemove={i => removeTag(expertise, setExpertise, i)} />
              </div>
              <div>
                <Label>Why Choose Us</Label>
                <TagInput placeholder="Add reason..." tags={reasons}
                  onAdd={v => addTag(reasons, setReasons, v)}
                  onRemove={i => removeTag(reasons, setReasons, i)} />
              </div>
              <div>
                <Label>Quality & Standards</Label>
                <TagInput placeholder="Add standard..." tags={standards}
                  onAdd={v => addTag(standards, setStandards, v)}
                  onRemove={i => removeTag(standards, setStandards, i)} />
              </div>
            </div>
          </section>

          {/* ── Network Settings ── */}
          <section>
            <SectionHeader icon={Settings} title="Network Settings" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
              <div>
                <Label>Builder Status</Label>
                <div className="relative">
                  <select value={form.status || "Active"} onChange={e => set("status", e.target.value)}
                    className="w-full border border-gray-200 rounded-[6px] px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#5323DC] focus:ring-2 focus:ring-violet-50 transition-all appearance-none bg-white cursor-pointer">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
                </div>
              </div>
              <div>
                <Label>Visibility</Label>
                <div className="flex items-center justify-between border border-gray-200 rounded-[6px] px-4 py-2.5">
                  <p className="text-sm font-medium text-gray-800">Visible in Network</p>
                  <Toggle checked={visibility} onChange={setVisibility} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border border-gray-200 rounded-[6px] px-4 py-3.5">
              <div>
                <p className="text-sm font-medium text-gray-800">Permissions</p>
                <p className="text-xs text-gray-400 mt-0.5">Allow Builder Posts</p>
              </div>
              <Toggle checked={allowPosts} onChange={setAllowPosts} />
            </div>
          </section>

          <div className="h-4" />
        </div>
      </form>

      {/* ── Footer ── */}
      <div className="w-full fixed md:sticky bottom-0 z-50 bg-white border-t border-gray-100 px-5 md:px-8 py-4 flex items-center justify-between gap-4">
        <button type="button" onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-md border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <Loader />
          <button type="submit" form="builder-form"
            className="flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-bold text-white shadow-[0_4px_14px_rgba(83,35,220,0.3)] hover:opacity-90 transition-opacity"
            style={{ background: GRADIENT }}>
            <Check size={15} strokeWidth={2.5} />
            {isEdit ? "Update Builder" : "Save Builder"}
          </button>
        </div>
      </div>
    </div>
  );
}