import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiCircle, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useAuth } from "../../store/auth";

// Same options the old registration form offered
const INTEREST_OPTIONS = [
  "Mutual Growth Opportunity",
  "Strong Interest in Infrastructure and Development",
  "Complementary Skills and Experience",
  "Market Expansion Vision",
  "Long-Term Value Creation",
  "Collaborative Approach",
  "Technology Integration",
  "Interest in Sustainable and Smart Projects",
];

// Details a partner is asked for after signing up with "Join as Partner"
const REQUIRED_FIELDS = [
  { key: "fullname", label: "Full name" },
  { key: "contact", label: "Phone number" },
  { key: "email", label: "Email" },
  { key: "state", label: "State" },
  { key: "city", label: "City" },
  { key: "intrest", label: "Why you want to partner" },
];

const isFilled = (value) => String(value ?? "").trim() !== "";

export default function ProfileCompletion({ user, onSaved }) {
  const { URI } = useAuth();
  // Initialised from the profile; the parent remounts this card after a save
  const [form, setForm] = useState(() => ({
    email: user?.email || "",
    state: user?.state || "",
    city: user?.city || "",
    intrest: user?.intrest || "",
    refrence: user?.refrence || "",
  }));
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [open, setOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const done = REQUIRED_FIELDS.filter((f) => isFilled(user?.[f.key]));
  const percent = Math.round((done.length / REQUIRED_FIELDS.length) * 100);
  const missing = REQUIRED_FIELDS.filter((f) => !isFilled(user?.[f.key]));

  useEffect(() => {
    if (percent === 100) return;
    fetch(`${URI}/admin/states`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setStates(Array.isArray(d) ? d : []))
      .catch(() => setStates([]));
  }, [URI, percent]);

  useEffect(() => {
    if (!form.state) return;
    fetch(`${URI}/admin/cities/${encodeURIComponent(form.state)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCities(Array.isArray(d) ? d : []))
      .catch(() => setCities([]));
  }, [URI, form.state]);

  // Keep a saved city visible even if it isn't in the city list
  const cityOptions = useMemo(() => {
    const names = form.state ? cities.map((c) => c.city) : [];
    return form.city && !names.includes(form.city) ? [form.city, ...names] : names;
  }, [cities, form.state, form.city]);

  if (!user?.id || percent === 100) return null;

  const save = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim() || !form.state || !form.city || !form.intrest) {
      setError("Please fill email, state, city and interest.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${URI}/project-partner/profile/details`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not save your details");
      await onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[#5E23DC] focus:ring-2 focus:ring-[#5E23DC]/20";

  return (
    <section className="mb-6 rounded-2xl border border-[#5E23DC]/15 bg-gradient-to-br from-[#F5F0FF] to-white p-4 sm:p-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Complete your profile
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            {missing.length} detail{missing.length > 1 ? "s" : ""} left — a complete profile helps
            Reparv verify you and match you with the right leads.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 rounded-full bg-[#5E23DC]/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#5E23DC] transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-[#5E23DC] tabular-nums">{percent}%</span>
          </div>
        </div>
        <span className="text-gray-400 mt-1 shrink-0">
          {open ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </span>
      </button>

      {open ? (
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
          <ul className="space-y-2">
            {REQUIRED_FIELDS.map((f) => {
              const ok = isFilled(user?.[f.key]);
              return (
                <li key={f.key} className="flex items-center gap-2 text-sm">
                  {ok ? (
                    <FiCheckCircle className="text-emerald-600 shrink-0" />
                  ) : (
                    <FiCircle className="text-gray-300 shrink-0" />
                  )}
                  <span className={ok ? "text-gray-500" : "text-gray-900 font-medium"}>{f.label}</span>
                </li>
              );
            })}
          </ul>

          <form onSubmit={save} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="sm:col-span-2 text-xs font-medium text-gray-600">
              Email <span className="text-red-500">*</span>
              <input
                type="email"
                className={`${inputClass} mt-1`}
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                placeholder="you@company.com"
                required
              />
            </label>
            <label className="text-xs font-medium text-gray-600">
              State <span className="text-red-500">*</span>
              <select
                className={`${inputClass} mt-1`}
                value={form.state}
                onChange={(e) => setForm((s) => ({ ...s, state: e.target.value, city: "" }))}
                required
              >
                <option value="">Select state</option>
                {states.map((s) => (
                  <option key={s.id ?? s.state} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-gray-600">
              City <span className="text-red-500">*</span>
              <select
                className={`${inputClass} mt-1`}
                value={form.city}
                onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
                disabled={!form.state}
                required
              >
                <option value="">{form.state ? "Select city" : "Select state first"}</option>
                {cityOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="sm:col-span-2 text-xs font-medium text-gray-600">
              Why do you want to partner with Reparv? <span className="text-red-500">*</span>
              <select
                className={`${inputClass} mt-1`}
                value={form.intrest}
                onChange={(e) => setForm((s) => ({ ...s, intrest: e.target.value }))}
                required
              >
                <option value="">Select a reason</option>
                {INTEREST_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
            <label className="sm:col-span-2 text-xs font-medium text-gray-600">
              Referred by <span className="text-gray-400">(optional)</span>
              <input
                className={`${inputClass} mt-1`}
                value={form.refrence}
                maxLength={30}
                onChange={(e) => setForm((s) => ({ ...s, refrence: e.target.value }))}
                placeholder="Name or code of who referred you"
              />
            </label>

            {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#5E23DC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#4d1cb8] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save details"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
