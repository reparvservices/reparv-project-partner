import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiPlus, FiEdit2, FiKey, FiPower, FiTrash2, FiDownload, FiRefreshCw, FiEye, FiEyeOff, FiX } from "react-icons/fi";
import { FaHandshake } from "react-icons/fa";
import { useAuth } from "../../store/auth";
import { getImageURI } from "../../utils/helper";
import { confirmDialog } from "../../components/ui/Dialogs.jsx";

const STATUS_FILTERS = ["All", "Active", "Inactive"];

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "SP";

// "21 Nov 2026 | 04:39 PM" → "21 Nov 2026"
const dateOnly = (value) => String(value || "").split("|")[0].trim() || "—";

function StatCard({ label, value, hint, tone = "text-gray-900" }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${tone}`}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

/** Set the username and password a sales partner signs in with */
function SignInModal({ partner, onClose, onSave }) {
  const [username, setUsername] = useState(partner.username || "");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const generate = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    const bytes = crypto.getRandomValues(new Uint32Array(10));
    setPassword(Array.from(bytes, (b) => chars[b % chars.length]).join(""));
    setShow(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() && !password) return setError("Enter a username, a password, or both.");
    if (password && password.length < 8) return setError("Password must be at least 8 characters.");
    setSaving(true);
    try {
      await onSave({ username: username.trim(), password });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const inputCls =
    "mt-1 h-11 w-full rounded-full border border-gray-200 bg-white px-4 text-sm text-gray-800 outline-none transition focus:border-[#6C35DE] focus:ring-4 focus:ring-[#6C35DE]/15";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Sign-in details</h3>
            <p className="mt-0.5 text-sm text-gray-500">{partner.fullname} signs in to the partner panel with these.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 cursor-pointer" aria-label="Close">
            <FiX size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Username</label>
            <input className={inputCls} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. rahul.sharma" autoFocus />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">New password</label>
              <button type="button" onClick={generate} className="text-xs font-semibold text-[#5323DC] hover:underline cursor-pointer">Generate</button>
            </div>
            <div className="relative">
              <input
                className={`${inputCls} pr-11`}
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep the current password"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#5323DC] cursor-pointer" aria-label={show ? "Hide password" : "Show password"}>
                {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-gray-400">At least 8 characters. Share it with them yourself: it can&apos;t be viewed again.</p>
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-full bg-[#5323DC] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#6C35DE]/25 hover:brightness-110 disabled:opacity-60 cursor-pointer">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SalesPartners() {
  const navigate = useNavigate();
  const { URI } = useAuth();

  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [signInFor, setSignInFor] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const call = useCallback(
    async (path = "", options = {}) => {
      const res = await fetch(`${URI}/project-partner/sales${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
      return data;
    },
    [URI],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await call("");
      setPartners(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Could not load your sales partners.");
    } finally {
      setLoading(false);
    }
  }, [call]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const active = partners.filter((p) => p.status === "Active").length;
    return {
      total: partners.length,
      active,
      inactive: partners.length - active,
      enquiries: partners.reduce((n, p) => n + (Number(p.enquiryCount) || 0), 0),
      deals: partners.reduce((n, p) => n + (Number(p.dealCount) || 0), 0),
    };
  }, [partners]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return partners.filter((p) => {
      if (statusFilter !== "All" && p.status !== statusFilter) return false;
      if (!q) return true;
      return [p.fullname, p.contact, p.email, p.city, p.state, p.username].some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [partners, query, statusFilter]);

  const run = async (id, fn) => {
    setBusyId(id);
    try {
      await fn();
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const toggleStatus = async (p) => {
    const next = p.status === "Active" ? "deactivate" : "activate";
    const extra = p.status === "Active" ? " They won't be able to sign in until you activate them again." : "";
    if (!(await confirmDialog(`${next[0].toUpperCase() + next.slice(1)} ${p.fullname}?${extra}`))) return;
    run(p.salespersonsid, () => call(`/status/${p.salespersonsid}`, { method: "PUT" }));
  };

  const remove = async (p) => {
    if (!(await confirmDialog(`Delete ${p.fullname}? This can't be undone.`))) return;
    run(p.salespersonsid, () => call(`/delete/${p.salespersonsid}`, { method: "DELETE" }));
  };

  const saveSignIn = async (values) => {
    await call(`/credentials/${signInFor.salespersonsid}`, {
      method: "PUT",
      body: JSON.stringify({ username: values.username || undefined, password: values.password || undefined }),
    });
    setSignInFor(null);
    alert("Sign-in details updated.");
    load();
  };

  const exportCsv = () => {
    const header = ["Name", "Contact", "Email", "City", "State", "Username", "Status", "Enquiries", "Deals", "Joined"];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = rows.map((p) => [p.fullname, p.contact, p.email, p.city, p.state, p.username, p.status, p.enquiryCount, p.dealCount, dateOnly(p.created_at)].map(esc).join(","));
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "sales-partners.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const iconBtn = "flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-[#6C35DE]/40 hover:text-[#5E23DC] disabled:opacity-50 cursor-pointer";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Partners</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your own sales team. You create their sign-in, assign them enquiries, and track their deals.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone, city, username"
              className="h-11 w-full rounded-full border border-gray-200 bg-white pl-11 pr-5 text-sm text-gray-800 outline-none transition focus:border-[#6C35DE] focus:ring-4 focus:ring-[#6C35DE]/15 sm:w-72"
            />
          </div>
          <button type="button" onClick={exportCsv} disabled={!rows.length} className="flex h-11 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:border-[#6C35DE]/40 disabled:opacity-50 cursor-pointer">
            <FiDownload size={15} /> Export
          </button>
          <button type="button" onClick={() => navigate("/app/sales-partner/add")} className="flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#5E23DC] to-[#7c3aed] px-5 text-sm font-semibold text-white shadow-md shadow-[#6C35DE]/25 transition hover:brightness-110 cursor-pointer">
            <FiPlus size={16} /> Add partner
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Total partners" value={stats.total} />
        <StatCard label="Active" value={stats.active} tone="text-emerald-600" hint="Can sign in" />
        <StatCard label="Inactive" value={stats.inactive} tone={stats.inactive ? "text-amber-600" : "text-gray-900"} hint="Sign-in blocked" />
        <StatCard label="Enquiries assigned" value={stats.enquiries} />
        <StatCard label="Deals closed" value={stats.deals} tone="text-[#5323DC]" />
      </div>

      {/* Status filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition cursor-pointer ${
              statusFilter === s ? "bg-[#5E23DC] text-white shadow-md shadow-[#6C35DE]/20" : "border border-gray-200 bg-white text-gray-600 hover:border-[#6C35DE]/40 hover:text-[#5E23DC]"
            }`}
          >
            {s}
          </button>
        ))}
        <button type="button" onClick={load} className="ml-auto flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-gray-500 hover:text-[#5E23DC] cursor-pointer">
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-[#FAF9FF] text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Partner</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Sign-in</th>
                <th className="px-5 py-3 text-right">Enquiries</th>
                <th className="px-5 py-3 text-right">Deals</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={9} className="px-5 py-14 text-center text-gray-400">Loading sales partners…</td></tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center">
                    <p className="text-red-600">{error}</p>
                    <button onClick={load} className="mt-3 text-sm font-semibold text-[#5E23DC] hover:underline cursor-pointer">Try again</button>
                  </td>
                </tr>
              )}

              {!loading && !error && partners.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F3EDFF] text-[#5323DC]"><FaHandshake size={22} /></span>
                    <p className="font-semibold text-gray-900">No sales partners yet</p>
                    <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500">
                      Add a partner and set their username and password. They sign in on the partner panel under &quot;Sales Partner&quot;, and you can assign them enquiries.
                    </p>
                    <button onClick={() => navigate("/app/sales-partner/add")} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#5323DC] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 cursor-pointer">
                      <FiPlus size={15} /> Add your first partner
                    </button>
                  </td>
                </tr>
              )}

              {!loading && !error && partners.length > 0 && rows.length === 0 && (
                <tr><td colSpan={9} className="px-5 py-14 text-center text-gray-400">No partners match this search.</td></tr>
              )}

              {!loading &&
                !error &&
                rows.map((p) => {
                  const active = p.status === "Active";
                  const busy = busyId === p.salespersonsid;
                  return (
                    <tr key={p.salespersonsid} className="hover:bg-[#F6F3FF]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {p.userimage ? (
                            <img src={getImageURI(p.userimage)} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover bg-gray-100" />
                          ) : (
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3EDFF] text-xs font-bold text-[#5323DC]">{initials(p.fullname)}</span>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">{p.fullname}</p>
                            <p className="truncate text-xs text-gray-500">{p.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{p.contact || "—"}</td>
                      <td className="px-5 py-3 text-gray-700">{[p.city, p.state].filter(Boolean).join(", ") || "—"}</td>
                      <td className="px-5 py-3">
                        {p.username ? (
                          <span className="font-mono text-xs text-gray-700">{p.username}</span>
                        ) : (
                          <button type="button" onClick={() => setSignInFor(p)} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200 hover:bg-amber-100 cursor-pointer">
                            Set sign-in
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-700">{p.enquiryCount ?? 0}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-700">{p.dealCount ?? 0}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${active ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-gray-100 text-gray-600 ring-gray-200"}`}>
                          {active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{dateOnly(p.created_at)}</td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" title="Edit details" className={iconBtn} onClick={() => navigate(`/app/sales-partner/update/${p.salespersonsid}`)}><FiEdit2 size={14} /></button>
                          <button type="button" title="Sign-in details" className={iconBtn} onClick={() => setSignInFor(p)}><FiKey size={14} /></button>
                          <button type="button" title={active ? "Deactivate" : "Activate"} className={iconBtn} disabled={busy} onClick={() => toggleStatus(p)}><FiPower size={14} /></button>
                          <button type="button" title="Delete" className={`${iconBtn} hover:!border-red-300 hover:!text-red-600`} disabled={busy} onClick={() => remove(p)}><FiTrash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        {!loading && !error && partners.length > 0 && (
          <p className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
            Showing {rows.length} of {partners.length} partner{partners.length === 1 ? "" : "s"}
          </p>
        )}
      </div>

      {signInFor && <SignInModal partner={signInFor} onClose={() => setSignInFor(null)} onSave={saveSignIn} />}
    </div>
  );
}
