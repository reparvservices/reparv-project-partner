import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { ArrowLeft, ChevronDown, UploadCloud, Check } from "lucide-react";
import Loader from "../../components/Loader";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 97.17%)";

const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#5323DC] focus:ring-2 focus:ring-violet-50 transition-all bg-white appearance-none";

/* ── Label ── */
function Label({ children, required }) {
  return (
    <label className="block text-sm font-semibold text-gray-800 mb-2">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

/* ── Select wrapper ── */
function SelectField({ label, required, children, disabled, value, onChange }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${inputCls} pr-10 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
}

/* ── Section header ── */
function SectionHeader({ title }) {
  return (
    <div className="pb-4 mb-5 border-b border-gray-100">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.12em]">
        {title}
      </p>
    </div>
  );
}

const EMPTY = {
  adminid: "",
  departmentid: "",
  employeeid: "",
  issue: "",
  details: "",
  priority: "",
};

export default function AddTicket() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { URI, role, setLoading, showTicketForm, setShowTicketForm } =
    useAuth();
  const isProjectPartner = role === "Project Partner";
  const getBasePath = () => {
    if (role === "Project Partner") return "/project-partner";
    if (role === "Territory Partner") return "/territory-partner";
    return "/sales"; // Sales Partner
  };

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [adminData, setAdminData] = useState([]);
  const [departmentData, setDeptData] = useState([]);
  const [employeeData, setEmpData] = useState([]);
  const [screenshot, setScreenshot] = useState(null);

  /* ── fetch dropdowns ── */
  const fetchAdmins = async () => {
    try {
      const r = await fetch(`${URI}/project-partner/tickets/admins`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (r.ok) setAdminData(await r.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDepts = async () => {
    try {
      const r = await fetch(`${URI}/project-partner/tickets/departments`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (r.ok) setDeptData(await r.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEmps = async (deptId) => {
    if (!deptId) {
      setEmpData([]);
      return;
    }
    try {
      const r = await fetch(
        `${URI}/project-partner/tickets/employees/${deptId}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (r.ok) setEmpData(await r.json());
    } catch (e) {
      console.error(e);
    }
  };

  /* ── fetch existing ticket on edit ── */
  useEffect(() => {
    fetchAdmins();
    fetchDepts();
    if (isEdit) {
      (async () => {
        try {
          const r = await fetch(`${URI}${getBasePath()}/tickets/${id}`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });
          if (!r.ok) throw new Error();
          const d = await r.json();
          setForm(d);
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }, [id]);

  useEffect(() => {
    fetchEmps(form.departmentid);
  }, [form.departmentid]);
  useEffect(() => {
    if (form.adminid)
      setForm((p) => ({ ...p, departmentid: "", employeeid: "" }));
  }, [form.adminid]);

  const set = (field, val) => {
    setForm((p) => ({ ...p, [field]: val }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  /* ── validate ── */
  const validate = () => {
    const e = {};
    if (!form.issue) e.issue = "Required";
    if (!form.details) e.details = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const ep = isEdit ? `edit/${id}` : "add";
      const mth = isEdit ? "PUT" : "POST";
      const r = await fetch(`${URI}${getBasePath()}/tickets/${ep}`, {
        method: mth,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (r.status === 409) {
        alert("Ticket already exists!");
        return;
      }
      if (!r.ok) throw new Error();
      alert(isEdit ? "Ticket updated!" : "Ticket created!");
      navigate("/app/tickets");
    } catch (e) {
      console.error(e);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-5 md:px-8 py-4 border-b border-gray-100 bg-white">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-[6px] hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-[17px] font-bold text-gray-900">
            {isEdit ? "Edit Ticket" : "Create New Ticket"}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {isEdit
              ? "Update ticket details below."
              : "Fill in the details below to log a new maintenance or support request."}
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <form id="ticket-form" onSubmit={handleSubmit} className="flex-1">
        <div className="max-w-6xl md:px-6 py-8 space-y-6 md:space-y-8">
          {/* Card */}
          <div className="bg-white p-6 md:p-8">
            {/* ── TICKET DETAILS ── */}
            <SectionHeader title="Ticket Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Issue */}
              <div>
                <Label required>Select Issue</Label>
                <div className="relative">
                  <select
                    value={form.issue}
                    onChange={(e) => set("issue", e.target.value)}
                    className={`${inputCls} pr-10 ${errors.issue ? "border-red-400" : ""}`}
                  >
                    <option value="">Select issue type...</option>
                    <option>Technical Issue</option>
                    <option>Commission Issue</option>
                    <option>Lead Issue</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                {errors.issue && (
                  <p className="text-xs text-red-500 mt-1">{errors.issue}</p>
                )}
              </div>

              {/* Assign Admin */}
              <SelectField
                label="Assign Admin"
                required
                value={form.adminid}
                disabled={!!form.departmentid}
                onChange={(e) => set("adminid", e.target.value)}
              >
                <option value="">Select admin...</option>
                {adminData.map((a, i) => (
                  <option key={i} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </SelectField>

              {/* Department */}
              <SelectField
                label="Department"
                required
                value={form.departmentid}
                disabled={!!form.adminid}
                onChange={(e) => set("departmentid", e.target.value)}
              >
                <option value="">Select department...</option>
                {departmentData.map((d, i) => (
                  <option key={i} value={d.departmentid}>
                    {d.department}
                  </option>
                ))}
              </SelectField>

              {/* Employee */}
              <SelectField
                label="Employee"
                required
                value={form.employeeid}
                disabled={!form.departmentid}
                onChange={(e) => set("employeeid", e.target.value)}
              >
                <option value="">Assign employee...</option>
                {employeeData.map((e, i) => (
                  <option key={i} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </SelectField>

              {/* Priority */}
              <SelectField
                label="Priority"
                required
                value={form.priority || ""}
                onChange={(e) => set("priority", e.target.value)}
              >
                <option value="">Select priority...</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
                <option>Critical</option>
              </SelectField>

              {/* Screenshot upload */}
              <div>
                <Label>Attach Screenshot</Label>
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-200 rounded-xl h-[52px] px-4 flex items-center justify-center gap-2.5 text-gray-400 hover:border-[#5323DC] hover:bg-violet-50/30 transition-all">
                    <UploadCloud size={18} className="text-gray-400 shrink-0" />
                    <span className="text-sm">
                      {screenshot
                        ? screenshot.name
                        : "Click to upload or drag and drop"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            {/* ── TICKET DESCRIPTION ── */}
            <div className="mt-8">
              <SectionHeader title="Ticket Description" />
              <div>
                <Label required>Description</Label>
                <textarea
                  rows={5}
                  required
                  placeholder="Enter detailed description of the issue..."
                  value={form.details}
                  onChange={(e) => set("details", e.target.value)}
                  className={`${inputCls} resize-none ${errors.details ? "border-red-400" : ""}`}
                />
                {errors.details && (
                  <p className="text-xs text-red-500 mt-1">{errors.details}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ── Footer ── */}
      <div className="w-full fixed md:sticky bottom-0 z-50 bg-white border-t border-gray-100 px-5 md:px-8 py-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-md border text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <Loader />
          <button
            type="submit"
            form="ticket-form"
            className="flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-bold text-white bg-[#5323DC] shadow-[0_4px_14px_rgba(83,35,220,0.3)] hover:opacity-90 transition-opacity"
          >
            <Check size={15} strokeWidth={2.5} />
            {isEdit ? "Update Ticket" : "Create Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}
