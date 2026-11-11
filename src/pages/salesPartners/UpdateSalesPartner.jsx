import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { FiArrowLeft } from "react-icons/fi";
import { ChevronDown } from "lucide-react";
import Loader from "../../components/Loader";

const GRADIENT = "linear-gradient(94.94deg, #5323DC -8.34%, #8E61FF 97.17%)";
const inputCls  = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#5323DC] focus:ring-2 focus:ring-[#5323DC10] transition-all bg-white placeholder:text-slate-300";
const selectCls = `${inputCls} appearance-none cursor-pointer pr-9`;

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

export default function UpdateSalesPartner() {
  const navigate      = useNavigate();
  const { id }        = useParams();
  const { URI, setLoading } = useAuth();

  const [form, setForm]       = useState({});
  const [states, setStates]   = useState([]);
  const [cities, setCities]   = useState([]);
  const [errors, setErrors]   = useState({});
  const [loading2, setLoading2] = useState(true);

  /* fetch existing */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${URI}/project-partner/sales/${id}`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
        if (!res.ok) throw new Error();
        setForm(await res.json());
      } catch (e) { console.error(e); alert("Failed to load partner."); navigate("/app/sales-partners"); }
      finally { setLoading2(false); }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${URI}/admin/states`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
        if (res.ok) setStates(await res.json());
      } catch (e) { console.error(e); }
    })();
  }, []);

  useEffect(() => {
    if (!form.state) { setCities([]); return; }
    (async () => {
      try {
        const res = await fetch(`${URI}/admin/cities/${form.state}`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
        if (res.ok) setCities(await res.json());
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
    if (!form.fullname?.trim())  e.fullname = "Name is required";
    if (!form.email?.trim())     e.email    = "Email is required";
    if (!form.contact?.trim() || !/^[6-9]\d{9}$/.test(form.contact)) e.contact = "Enter valid 10-digit number";
    if (!form.state)             e.state    = "State is required";
    if (!form.city)              e.city     = "City is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${URI}/project-partner/sales/edit/${id}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      alert("Updated successfully!");
      navigate("/app/sales-partners");
    } catch (e) { console.error(e); alert("Please check all fields and try again."); }
    finally { setLoading(false); }
  };

  if (loading2) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#5323DC] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500">Loading partner...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 sm:pb-10">

      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate("/app/sales-partners")}
              className="h-9 w-9 grid place-items-center rounded-xl border border-gray-200 hover:border-violet-400 hover:text-violet-600 text-gray-500 transition-colors shrink-0">
              <FiArrowLeft size={18} />
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Edit Sales Partner</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => navigate("/app/sales-partners")}
              className="h-9 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" form="edit-sp-form"
              className="h-9 px-5 rounded-xl text-white text-sm font-semibold hover:opacity-90 active:scale-95"
              style={{ background: GRADIENT }}>
              <span className="hidden sm:inline">Save Changes</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <form id="edit-sp-form" onSubmit={handleSubmit} className="space-y-5">

          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <input type="text" placeholder="Full name" value={form.fullname || ""}
                  onChange={(e) => handleChange("fullname", e.target.value)}
                  className={`${inputCls} ${errors.fullname ? "border-red-400" : ""}`} />
                {errors.fullname && <p className="text-xs text-red-400">{errors.fullname}</p>}
              </Field>
              <Field label="Email Address" required>
                <input type="email" placeholder="email@example.com" value={form.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`${inputCls} ${errors.email ? "border-red-400" : ""}`} />
                {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
              </Field>
              <Field label="Phone Number" required>
                <div className="flex">
                  <span className="h-[42px] px-3 flex items-center border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-500 bg-slate-50 font-medium shrink-0">+91</span>
                  <input type="tel" maxLength={10} value={form.contact || ""}
                    onChange={(e) => handleChange("contact", e.target.value.replace(/\D/g, ""))}
                    className={`flex-1 h-[42px] border px-3 text-sm outline-none rounded-r-xl transition-all placeholder:text-slate-300 ${errors.contact ? "border-red-400" : "border-slate-200 focus:border-[#5323DC]"}`} />
                </div>
                {errors.contact && <p className="text-xs text-red-400">{errors.contact}</p>}
              </Field>
              <Field label="New Password">
                <input type="password" placeholder="Leave blank to keep current" value={form.password || ""}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={inputCls} />
                <p className="text-[10px] text-slate-400">Leave blank to keep existing password</p>
              </Field>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Location Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="State" required>
                <div className="relative">
                  <select value={form.state || ""} onChange={(e) => handleChange("state", e.target.value)}
                    className={`${selectCls} ${errors.state ? "border-red-400" : ""}`}>
                    <option value="">Select State</option>
                    {states.map((s, i) => <option key={i} value={s.state}>{s.state}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {errors.state && <p className="text-xs text-red-400">{errors.state}</p>}
              </Field>
              <Field label="City" required>
                <div className="relative">
                  <select value={form.city || ""} onChange={(e) => handleChange("city", e.target.value)}
                    disabled={!form.state}
                    className={`${selectCls} ${!form.state ? "opacity-50 cursor-not-allowed" : ""} ${errors.city ? "border-red-400" : ""}`}>
                    <option value="">Select City</option>
                    {cities.map((c, i) => <option key={i} value={c.city}>{c.city}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                {errors.city && <p className="text-xs text-red-400">{errors.city}</p>}
              </Field>
              <Field label="Address">
                <input type="text" placeholder="Street / Area / Locality" value={form.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className={inputCls} />
              </Field>
            </div>
          </div>

          <div className="hidden sm:flex justify-end gap-3">
            <button type="button" onClick={() => navigate("/app/sales-partners")}
              className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <div className="flex items-center gap-3">
              <Loader />
              <button type="submit" className="h-10 px-8 rounded-xl text-white text-sm font-semibold hover:opacity-90 active:scale-95" style={{ background: GRADIENT }}>
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden bg-white border-t border-gray-100 px-4 py-3 flex gap-3">
        <button type="button" onClick={() => navigate("/app/sales-partners")}
          className="flex-1 h-11 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600">Cancel</button>
        <button type="submit" form="edit-sp-form"
          className="flex-1 h-11 rounded-2xl text-white text-sm font-semibold hover:opacity-90 active:scale-95" style={{ background: GRADIENT }}>
          Save Changes
        </button>
      </div>
    </div>
  );
}