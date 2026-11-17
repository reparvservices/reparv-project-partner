import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../store/auth";
import { uploadToS3 } from "../../utils/s3";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 97.17%)";
const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#5323DC] bg-white";
const TYPES = ["villa", "hall", "banquet", "farmhouse", "resort", "lawn", "other"];
const AMENITIES = ["Wi-Fi", "Parking", "Pool", "AC", "Kitchen", "Garden", "Stage", "Sound system", "Power backup", "Catering"];
const STATUS = {
  draft: "bg-gray-100 text-gray-700",
  pending: "bg-yellow-100 text-yellow-800",
  live: "bg-green-100 text-green-700",
  paused: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-gray-200 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};
const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const EMPTY = {
  title: "", type: "villa", price_model: "night", base_price: "", weekend_price: "", cleaning_fee: "",
  capacity: "", bedrooms: "", city: "", state: "", address: "", description: "", rules: "",
  deposit_percent: 100, min_nights: 1, max_nights: 30, cancellation_policy: "moderate",
  amenities: [], images: [],
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-gray-800 mb-1">{label}</span>
      {children}
    </label>
  );
}

export default function Venues() {
  const { URI, setLoading } = useAuth();
  const [tab, setTab] = useState("listings");
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(null); // null = list view, object = editing/creating
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const call = useCallback(
    async (path, options = {}) => {
      const res = await fetch(`${URI}/projectpartner/venues${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.message || "Request failed");
      return data;
    },
    [URI],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "listings") setListings((await call("")).listings || []);
      else setBookings((await call("/bookings")).bookings || []);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [call, tab, setLoading]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openEdit = (l) => {
    const parse = (v) => (typeof v === "string" ? JSON.parse(v || "[]") : v || []);
    setEditingId(l.id);
    setForm({ ...EMPTY, ...l, weekend_price: l.weekend_price ?? "", bedrooms: l.bedrooms ?? "", amenities: parse(l.amenities), images: parse(l.images) });
  };

  const onPickImages = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 10);
    if (!files.length) return;
    setLoading(true);
    const urls = [];
    for (const f of files) {
      const url = await uploadToS3(f);
      if (url) urls.push(url);
    }
    setLoading(false);
    if (urls.length < files.length) alert("Some photos could not be uploaded.");
    set("images", [...form.images, ...urls].slice(0, 20));
    e.target.value = "";
  };

  const save = async () => {
    const body = {
      ...form,
      base_price: Number(form.base_price),
      weekend_price: form.weekend_price === "" ? null : Number(form.weekend_price),
      cleaning_fee: Number(form.cleaning_fee || 0),
      capacity: Number(form.capacity),
      bedrooms: form.bedrooms === "" ? null : Number(form.bedrooms),
      deposit_percent: Number(form.deposit_percent),
      min_nights: Number(form.min_nights),
      max_nights: Number(form.max_nights),
    };
    ["id", "owner_id", "owner_role", "status", "reject_reason", "created_at", "updated_at", "slug", "commission_percent", "gst_percent"].forEach((k) => delete body[k]);
    setSaving(true);
    try {
      await (editingId ? call(`/${editingId}`, { method: "PUT", body: JSON.stringify(body) }) : call("", { method: "POST", body: JSON.stringify(body) }));
      setForm(null);
      setEditingId(null);
      load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const action = async (l, a) => {
    try {
      await call(`/${l.id}/${a}`, { method: "POST" });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const block = async (l, unblock) => {
    const from = window.prompt(`${unblock ? "Unblock" : "Block"} from date (YYYY-MM-DD)`);
    if (!from) return;
    const to = window.prompt("To date (YYYY-MM-DD, inclusive)", from);
    if (!to) return;
    try {
      const data = await call(`/${l.id}/${unblock ? "unblock" : "block"}`, {
        method: "POST",
        body: JSON.stringify({ from, to, reason: unblock ? undefined : "Blocked by owner" }),
      });
      alert(unblock ? `${data.unblocked} date(s) unblocked.` : `${data.blocked} date(s) blocked.`);
    } catch (err) {
      alert(err.message);
    }
  };

  const cancelBooking = async (b) => {
    if (!window.confirm(`Cancel ${b.booking_ref}? The guest gets a full refund (₹${b.amount_paid}).`)) return;
    try {
      const data = await call(`/bookings/${b.id}/cancel`, { method: "POST", body: JSON.stringify({ reason: "Cancelled by owner" }) });
      alert(`Cancelled. Refund: ₹${data.refund_amount} (${data.refund_status}).`);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  // ── form view ──
  if (form) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <button className="text-sm text-gray-600 mb-3" onClick={() => { setForm(null); setEditingId(null); }}>← Back</button>
        <h1 className="text-xl font-semibold mb-4">{editingId ? "Edit venue" : "Add a venue"}</h1>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title *"><input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Type *">
            <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Pricing *">
            <select className={inputCls} value={form.price_model} onChange={(e) => set("price_model", e.target.value)}>
              <option value="night">Per night (stays)</option>
              <option value="slot">Per day / slot (halls, lawns)</option>
            </select>
          </Field>
          <Field label="Base price (₹) *"><input type="number" className={inputCls} value={form.base_price} onChange={(e) => set("base_price", e.target.value)} /></Field>
          <Field label="Weekend price (₹, Fri/Sat)"><input type="number" className={inputCls} value={form.weekend_price} onChange={(e) => set("weekend_price", e.target.value)} /></Field>
          <Field label="Cleaning fee (₹)"><input type="number" className={inputCls} value={form.cleaning_fee} onChange={(e) => set("cleaning_fee", e.target.value)} /></Field>
          <Field label="Max guests *"><input type="number" className={inputCls} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} /></Field>
          <Field label="Bedrooms"><input type="number" className={inputCls} value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} /></Field>
          <Field label="City *"><input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="State"><input className={inputCls} value={form.state || ""} onChange={(e) => set("state", e.target.value)} /></Field>
          <div className="md:col-span-2"><Field label="Address"><input className={inputCls} value={form.address || ""} onChange={(e) => set("address", e.target.value)} /></Field></div>
          <Field label="Pay now at booking (% of total)"><input type="number" min={10} max={100} className={inputCls} value={form.deposit_percent} onChange={(e) => set("deposit_percent", e.target.value)} /></Field>
          <Field label="Cancellation policy">
            <select className={inputCls} value={form.cancellation_policy} onChange={(e) => set("cancellation_policy", e.target.value)}>
              <option value="flexible">Flexible: full refund until 2 days before</option>
              <option value="moderate">Moderate: full refund until 7 days before</option>
              <option value="strict">Strict: 50% until 14 days before</option>
            </select>
          </Field>
          {form.price_model === "night" && (
            <>
              <Field label="Minimum nights"><input type="number" className={inputCls} value={form.min_nights} onChange={(e) => set("min_nights", e.target.value)} /></Field>
              <Field label="Maximum nights"><input type="number" className={inputCls} value={form.max_nights} onChange={(e) => set("max_nights", e.target.value)} /></Field>
            </>
          )}
          <div className="md:col-span-2"><Field label="Description"><textarea rows={4} className={inputCls} value={form.description || ""} onChange={(e) => set("description", e.target.value)} /></Field></div>
          <div className="md:col-span-2"><Field label="House rules"><textarea rows={2} className={inputCls} value={form.rules || ""} onChange={(e) => set("rules", e.target.value)} /></Field></div>
        </div>

        <div className="mt-4">
          <span className="block text-sm font-semibold mb-2">Amenities</span>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((a) => {
              const on = form.amenities.includes(a);
              return (
                <button key={a} type="button" onClick={() => set("amenities", on ? form.amenities.filter((x) => x !== a) : [...form.amenities, a])}
                  className={`px-3 py-1 rounded-full text-sm border ${on ? "bg-[#5323DC] text-white border-[#5323DC]" : "bg-white"}`}>{a}</button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <span className="block text-sm font-semibold mb-2">Photos (at least 1 to submit)</span>
          <div className="flex flex-wrap gap-3">
            {form.images.map((u) => (
              <div key={u} className="relative">
                <img src={u} alt="" className="h-24 w-32 object-cover rounded-lg border" />
                <button type="button" onClick={() => set("images", form.images.filter((x) => x !== u))} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs">×</button>
              </div>
            ))}
            <label className="h-24 w-32 flex items-center justify-center border-2 border-dashed rounded-lg text-sm text-gray-500 cursor-pointer">
              + Add
              <input type="file" accept="image/*" multiple className="hidden" onChange={onPickImages} />
            </label>
          </div>
        </div>

        <button disabled={saving} onClick={save} style={{ background: GRADIENT }} className="mt-6 px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-60">
          {saving ? "Saving…" : "Save venue"}
        </button>
      </div>
    );
  }

  // ── list view ──
  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-semibold">Venues &amp; Stays</h1>
        <div className="flex gap-2">
          {["listings", "bookings"].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? "text-white" : "bg-white border"}`} style={tab === t ? { background: GRADIENT } : undefined}>
              {t === "listings" ? "My venues" : "Bookings"}
            </button>
          ))}
          {tab === "listings" && (
            <button onClick={() => { setEditingId(null); setForm({ ...EMPTY }); }} className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white">+ Add venue</button>
          )}
        </div>
      </div>

      {tab === "listings" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {listings.length === 0 && <p className="text-gray-500">You haven't added a venue yet.</p>}
          {listings.map((l) => {
            const imgs = typeof l.images === "string" ? JSON.parse(l.images || "[]") : l.images || [];
            return (
              <div key={l.id} className="bg-white border rounded-2xl overflow-hidden">
                {imgs[0] ? <img src={imgs[0]} alt="" className="h-40 w-full object-cover" /> : <div className="h-40 bg-gray-100" />}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{l.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS[l.status]}`}>{l.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 capitalize">{l.type} · {l.city} · up to {l.capacity} guests</p>
                  <p className="text-sm mt-1">{rupees(l.base_price)} / {l.price_model === "night" ? "night" : "slot"}</p>
                  {l.reject_reason && <p className="text-xs text-red-600 mt-1">Rejected: {l.reject_reason}</p>}
                  <div className="flex flex-wrap gap-2 mt-3 text-sm">
                    <button onClick={() => openEdit(l)} className="px-3 py-1 rounded border">Edit</button>
                    {["draft", "rejected"].includes(l.status) && <button onClick={() => action(l, "submit")} className="px-3 py-1 rounded bg-[#5323DC] text-white">Submit for approval</button>}
                    {l.status === "live" && <button onClick={() => action(l, "pause")} className="px-3 py-1 rounded border">Pause</button>}
                    {l.status === "paused" && <button onClick={() => action(l, "resume")} className="px-3 py-1 rounded border">Resume</button>}
                    {["live", "paused"].includes(l.status) && (
                      <>
                        <button onClick={() => block(l, false)} className="px-3 py-1 rounded border">Block dates</button>
                        <button onClick={() => block(l, true)} className="px-3 py-1 rounded border">Unblock</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "bookings" && (
        <div className="overflow-x-auto bg-white rounded-xl border">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr><th className="p-3">Ref</th><th className="p-3">Venue</th><th className="p-3">Dates</th><th className="p-3">Guest</th><th className="p-3">Guests</th><th className="p-3">Paid</th><th className="p-3">Status</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {bookings.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-gray-500">No bookings yet.</td></tr>}
              {bookings.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="p-3 font-mono">{b.booking_ref}</td>
                  <td className="p-3">{b.listing_title}</td>
                  <td className="p-3 whitespace-nowrap">{b.start_date} → {b.end_date}{b.slot !== "full" ? ` (${b.slot})` : ""}</td>
                  <td className="p-3">{b.guest_name}<div className="text-xs text-gray-500">{b.guest_phone}</div></td>
                  <td className="p-3">{b.guests}</td>
                  <td className="p-3">{rupees(b.amount_paid)} <span className="text-xs text-gray-500">of {rupees(b.total_amount)}</span></td>
                  <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS[b.status]}`}>{b.status}</span></td>
                  <td className="p-3">{b.status === "confirmed" && <button onClick={() => cancelBooking(b)} className="px-3 py-1 rounded bg-red-600 text-white">Cancel</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
