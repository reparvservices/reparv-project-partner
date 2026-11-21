import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiSearch, FiPlus, FiEdit2, FiEye, FiRefreshCw } from "react-icons/fi";
import { useAuth } from "../../store/auth";
import { getImageURI } from "../../utils/helper";
import { kindOfCategory, VENUE_KIND } from "../../utils/propertyListing";
import { venueApi } from "../../lib/venueApi";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300";

// Property types (Venue Booking is one of them)
const TYPE_TABS = [
  { key: "All", label: "All types" },
  { key: "Residential", label: "Residential" },
  { key: "Commercial", label: "Commercial" },
  { key: "Agriculture", label: "Agriculture / Land" },
  { key: VENUE_KIND, label: "Venue Booking" },
];

// Venue listing status → the approval labels properties use
const VENUE_STATUS = {
  live: "Approved",
  pending: "Not Approved",
  rejected: "Rejected",
  draft: "Draft",
  paused: "Paused",
};

const STATUS_TABS = [
  { key: "All", label: "All" },
  { key: "Approved", label: "Approved" },
  { key: "Not Approved", label: "Pending" },
  { key: "Rejected", label: "Rejected" },
  { key: "Draft", label: "Draft", onlyWhenPresent: true },
  { key: "Paused", label: "Paused", onlyWhenPresent: true },
];

const STATUS_STYLE = {
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Not Approved": "bg-amber-50 text-amber-700 ring-amber-200",
  Rejected: "bg-red-50 text-red-600 ring-red-200",
  Draft: "bg-gray-100 text-gray-600 ring-gray-200",
  Paused: "bg-blue-50 text-blue-700 ring-blue-200",
};

function firstImage(value) {
  try {
    const list = Array.isArray(value) ? value : JSON.parse(value);
    if (Array.isArray(list) && list[0]) return getImageURI(list[0]);
  } catch {
    /* fall through to placeholder */
  }
  return FALLBACK_IMG;
}

function formatPrice(value) {
  const n = Number(value);
  if (!value || Number.isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/** One row shape for properties and venues */
function fromProperty(p) {
  return {
    key: `p-${p.propertyid}`,
    id: p.propertyid,
    isVenue: false,
    kind: p.propertyKind || kindOfCategory(p.propertyCategory) || "Residential",
    name: p.propertyName || "Untitled",
    sub: p.company_name || `#${p.propertyid}`,
    category: p.propertyCategory || "—",
    location: [p.city, p.state].filter(Boolean).join(", "),
    price: formatPrice(p.totalOfferPrice),
    status: p.approve,
    views: p.views ?? 0,
    calls: p.calls ?? 0,
    created: p.created_at,
    image: firstImage(p.frontView),
    search: [p.propertyName, p.propertyCategory, p.city, p.state, p.company_name],
  };
}

function fromVenue(v) {
  const type = v.type === "other" && v.custom_type ? v.custom_type : v.type;
  return {
    key: `v-${v.id}`,
    id: v.id,
    isVenue: true,
    kind: VENUE_KIND,
    name: v.title || "Untitled venue",
    sub: `Up to ${v.capacity} guests`,
    category: type ? type[0].toUpperCase() + type.slice(1) : "Venue",
    location: [v.city, v.state].filter(Boolean).join(", "),
    price: `${formatPrice(v.base_price)} / ${v.price_model === "night" ? "night" : "slot"}`,
    status: VENUE_STATUS[v.status] || v.status,
    views: null,
    calls: null,
    created: v.created_at,
    image: firstImage(v.images),
    search: [v.title, type, v.city, v.state, "venue booking"],
  };
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        STATUS_STYLE[status] || "bg-gray-50 text-gray-600 ring-gray-200"
      }`}
    >
      {status === "Not Approved" ? "Pending" : status || "—"}
    </span>
  );
}

export default function PropertiesTable() {
  const navigate = useNavigate();
  const { URI } = useAuth();

  const [properties, setProperties] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [venuesUnavailable, setVenuesUnavailable] = useState(false);
  const [tab, setTab] = useState("All");
  // ?type=Venue (e.g. from the old Venues link) opens the list on that property type
  const [searchParams] = useSearchParams();
  const [typeTab, setTypeTab] = useState(() => {
    const t = searchParams.get("type");
    return TYPE_TABS.some((x) => x.key === t) ? t : "All";
  });
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    setVenuesUnavailable(false);

    // Properties and venues load independently: a venue problem must not hide the properties.
    const propertiesRequest = fetch(`${URI}/project-partner/properties/`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }).then(async (res) => {
      if (!res.ok) throw new Error(`Could not load properties (${res.status})`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    });
    const venuesRequest = venueApi(URI).list();

    const [propsResult, venuesResult] = await Promise.allSettled([propertiesRequest, venuesRequest]);
    if (propsResult.status === "fulfilled") setProperties(propsResult.value);
    else setError(propsResult.reason?.message || "Could not load properties");
    if (venuesResult.status === "fulfilled") setVenues(venuesResult.value);
    else {
      setVenues([]);
      setVenuesUnavailable(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [URI]);

  const all = useMemo(() => [...properties.map(fromProperty), ...venues.map(fromVenue)], [properties, venues]);

  const byType = useMemo(() => all.filter((r) => typeTab === "All" || r.kind === typeTab), [all, typeTab]);

  const typeCounts = useMemo(() => {
    const c = { All: all.length };
    for (const r of all) c[r.kind] = (c[r.kind] || 0) + 1;
    return c;
  }, [all]);

  const statusCounts = useMemo(() => {
    const c = { All: byType.length };
    for (const r of byType) c[r.status] = (c[r.status] || 0) + 1;
    return c;
  }, [byType]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return byType.filter((r) => {
      if (tab !== "All" && r.status !== tab) return false;
      if (!q) return true;
      return r.search.filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [byType, tab, query]);

  const openRow = (r) => navigate(r.isVenue ? `/app/properties/venue/${r.id}` : `/app/properties/${r.id}`);
  const editRow = (r) => navigate(r.isVenue ? `/app/property/venue/${r.id}/edit` : `/app/property/update/${r.id}`);

  const chipCls = (active) =>
    `flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition cursor-pointer ${
      active
        ? "bg-[#5E23DC] text-white shadow-md shadow-[#6C35DE]/20"
        : "border border-gray-200 bg-white text-gray-600 hover:border-[#6C35DE]/40 hover:text-[#5E23DC]"
    }`;
  const countCls = (active) => `rounded-full px-2 py-0.5 text-xs ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="mt-1 text-sm text-gray-500">
            {all.length} listing{all.length === 1 ? "" : "s"} in your portfolio
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, city, category"
              className="h-11 w-full rounded-full border border-gray-200 bg-white pl-11 pr-5 text-sm text-gray-800 outline-none transition focus:border-[#6C35DE] focus:ring-4 focus:ring-[#6C35DE]/15 sm:w-72"
            />
          </div>
          <button
            type="button"
            onClick={() => navigate("/app/property/add")}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#5E23DC] to-[#7c3aed] px-5 text-sm font-semibold text-white shadow-md shadow-[#6C35DE]/25 transition hover:brightness-110 cursor-pointer"
          >
            <FiPlus size={16} />
            Add property
          </button>
        </div>
      </div>

      {venuesUnavailable && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          Venue bookings couldn&apos;t be loaded right now, so only properties are shown.
        </div>
      )}

      {/* Property type */}
      <div className="mb-3 flex flex-wrap gap-2">
        {TYPE_TABS.map((t) => {
          const active = typeTab === t.key;
          return (
            <button key={t.key} type="button" onClick={() => { setTypeTab(t.key); setTab("All"); }} className={chipCls(active)}>
              {t.label}
              <span className={countCls(active)}>{typeCounts[t.key] || 0}</span>
            </button>
          );
        })}
      </div>

      {/* Status */}
      <div className="mb-6 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
        {STATUS_TABS.filter((t) => !t.onlyWhenPresent || statusCounts[t.key] > 0).map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                active ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {t.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {statusCounts[t.key] || 0}
              </span>
            </button>
          );
        })}
        <button type="button" onClick={load} className="ml-auto flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-gray-500 hover:text-[#5E23DC] cursor-pointer">
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-[#FAF9FF] text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Property</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Views</th>
                <th className="px-5 py-3 text-right">Calls</th>
                <th className="px-5 py-3">Listed</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={9} className="px-5 py-14 text-center text-gray-400">Loading properties…</td></tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center">
                    <p className="text-red-600">{error}</p>
                    <button onClick={load} className="mt-3 text-sm font-semibold text-[#5E23DC] hover:underline cursor-pointer">Try again</button>
                  </td>
                </tr>
              )}

              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center text-gray-400">
                    {all.length === 0 ? "No properties yet. Add your first listing." : "No properties match this filter."}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                rows.map((r) => (
                  <tr key={r.key} onClick={() => openRow(r)} className="cursor-pointer transition hover:bg-[#F6F3FF]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={r.image} alt="" loading="lazy" className="h-12 w-16 shrink-0 rounded-lg object-cover bg-gray-100" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900">{r.name}</p>
                          <p className="truncate text-xs text-gray-500">{r.sub}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-gray-700">{r.category}</p>
                      {r.isVenue && (
                        <span className="mt-0.5 inline-block rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">Venue Booking</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-700">{r.location || "—"}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">{r.price}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-right text-gray-700">{r.views ?? "—"}</td>
                    <td className="px-5 py-3 text-right text-gray-700">{r.calls ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-600">{formatDate(r.created)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          title="View details"
                          onClick={() => openRow(r)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-[#6C35DE]/40 hover:text-[#5E23DC] cursor-pointer"
                        >
                          <FiEye size={15} />
                        </button>
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => editRow(r)}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-[#6C35DE]/40 hover:text-[#5E23DC] cursor-pointer"
                        >
                          <FiEdit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
