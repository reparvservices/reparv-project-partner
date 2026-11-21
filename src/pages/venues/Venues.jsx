import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../store/auth";
import VenueForm from "./VenueForm";
import { confirmDialog, promptDialog } from "../../components/ui/Dialogs.jsx";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 97.17%)";
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


export default function Venues() {
  const { URI, setLoading } = useAuth();
  const [tab, setTab] = useState("listings");
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [formOpen, setFormOpen] = useState(false); // true = wizard visible
  const [editing, setEditing] = useState(null); // listing being edited, or null for a new one

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

  const openEdit = (l) => { setEditing(l); setFormOpen(true); };
  const openNew = () => { setEditing(null); setFormOpen(true); };

  // Create or update, then optionally submit for approval (drafts and rejected listings only).
  const saveListing = async (body, submit) => {
    const res = await (editing
      ? call(`/${editing.id}`, { method: "PUT", body: JSON.stringify(body) })
      : call("", { method: "POST", body: JSON.stringify(body) }));
    const saved = res.listing;
    if (submit && saved && ["draft", "rejected"].includes(saved.status)) {
      await call(`/${saved.id}/submit`, { method: "POST" });
    }
    setFormOpen(false);
    setEditing(null);
    load();
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
    const from = (await promptDialog(`${unblock ? "Unblock" : "Block"} from date (YYYY-MM-DD)`));
    if (!from) return;
    const to = (await promptDialog("To date (YYYY-MM-DD, inclusive)", from));
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
    if (!(await confirmDialog(`Cancel ${b.booking_ref}? The guest gets a full refund (₹${b.amount_paid}).`))) return;
    try {
      const data = await call(`/bookings/${b.id}/cancel`, { method: "POST", body: JSON.stringify({ reason: "Cancelled by owner" }) });
      alert(`Cancelled. Refund: ₹${data.refund_amount} (${data.refund_status}).`);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  // ── form view ──
  if (formOpen) {
    return (
      <VenueForm
        key={editing?.id || "new"}
        initial={editing}
        editing={!!editing}
        setBusy={setLoading}
        onCancel={() => { setFormOpen(false); setEditing(null); }}
        onSave={saveListing}
      />
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
            <button onClick={openNew} className="px-4 py-2 rounded-lg text-sm font-medium bg-black text-white">+ Add venue</button>
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
                  <p className="text-sm text-gray-500 capitalize">{l.type === "other" && l.custom_type ? l.custom_type : l.type} · {l.city} · up to {l.capacity} guests</p>
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
