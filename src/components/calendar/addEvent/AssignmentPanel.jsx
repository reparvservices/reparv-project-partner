import { useState, useEffect, useCallback, useMemo } from "react";
import { Users, Search, Check, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "../../../store/auth";

// ── Color pool for avatar rings ───────────────────────────────────────────────
const COLOR_POOL = [
  "bg-violet-100 text-[#5E23DC]",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-blue-100 text-blue-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-red-100 text-red-700",
];

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

const getColor = (index) => COLOR_POOL[index % COLOR_POOL.length];

/**
 * AssignmentPanel
 *
 * Role-based tab logic:
 *   Project Partner login → tab "Sales Partners"    → GET /project-partner/salespartner
 *   Sales Partner login   → tab "Territory Partners"→ GET /project-partner/territorypartner
 *
 * Both tabs are always shown. The active tab is pre-selected based on login role.
 * Search filters by fullname / name in real-time.
 *
 * Passes to parent onChange:
 *   assignedTo   → partner's name string
 *   assignedRole → partner's role / designation
 *   assignedId   → partner's database id (salespersons.id or territorypartner.id)
 *
 * Props:
 *   data     : { assignedTo, assignedRole, assignedId }
 *   onChange : fn(field, value)
 */
export default function AssignmentPanel({ data, onChange }) {
  const { URI, user, role } = useAuth();
  const isProjectPartner = role === "Project Partner";
  const getBasePath = () => {
    if (role === "Project Partner") return "/project-partner";
    if (role === "Territory Partner") return "/territory-partner";
    return "/sales"; // Sales Partner
  };

  const [activeTab, setActiveTab] = useState(
    isProjectPartner ? "sales" : "territory",
  );
  const [salesList, setSalesList] = useState([]);
  const [territoryList, setTerritoryList] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [loadingTerritory, setLoadingTerritory] = useState(false);
  const [errorSales, setErrorSales] = useState("");
  const [errorTerritory, setErrorTerritory] = useState("");
  const [search, setSearch] = useState("");

  // ── Normalize raw API rows → uniform shape ────────────────────────────────────
  const normalize = (list, roleLabel) =>
    list.map((p, i) => ({
      id: p.id || p.salespersonsid,
      name: p.fullname || p.name || p.partnername || "Unknown",
      role: p.role || p.designation || roleLabel,
      contact: p.contact || p.phone || "",
      email: p.email || "",
      initials: getInitials(p.fullname || p.name || p.partnername || "?"),
      color: getColor(i),
    }));

  // ── Fetch Sales Partners ──────────────────────────────────────────────────────
  const fetchSales = useCallback(async () => {
    setLoadingSales(true);
    setErrorSales("");
    try {
      const res = await fetch(`${URI}${getBasePath()}/partner/salespartner`, {
        credentials: "include",
      });
      const raw = await res.json();
      setSalesList(
        normalize(Array.isArray(raw) ? raw : raw.data || [], "Sales Partner"),
      );
    } catch {
      setErrorSales("Could not load sales partners.");
    } finally {
      setLoadingSales(false);
    }
  }, [URI]);

  // ── Fetch Territory Partners ──────────────────────────────────────────────────
  const fetchTerritory = useCallback(async () => {
    setLoadingTerritory(true);
    setErrorTerritory("");
    try {
      const res = await fetch(
        `${URI}${getBasePath()}/partner/territorypartner`,
        {
          credentials: "include",
        },
      );
      const raw = await res.json();
      setTerritoryList(
        normalize(
          Array.isArray(raw) ? raw : raw.data || [],
          "Territory Partner",
        ),
      );
    } catch {
      setErrorTerritory("Could not load territory partners.");
    } finally {
      setLoadingTerritory(false);
    }
  }, [URI]);

  useEffect(() => {
    fetchSales();
    fetchTerritory();
  }, [fetchSales, fetchTerritory]);

  // ── Active list based on tab ──────────────────────────────────────────────────
  const activeList = activeTab === "sales" ? salesList : territoryList;
  const isLoading = activeTab === "sales" ? loadingSales : loadingTerritory;
  const fetchError = activeTab === "sales" ? errorSales : errorTerritory;
  const retryFetch = activeTab === "sales" ? fetchSales : fetchTerritory;

  // ── Search filter ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeList;
    return activeList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.role || "").toLowerCase().includes(q),
    );
  }, [activeList, search]);

  // ── Select a partner ──────────────────────────────────────────────────────────
  const select = (p) => {
    onChange("assignedTo", p.name);
    onChange("assignedRole", p.role);
    onChange("assignedId", p.id); // ← salespersons.id or territorypartner.id
  };

  const selectedId = data.assignedId;

  // ── UI ────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-lg overflow-hidden border">
      {/* Section header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
        <Users className="w-4 h-4 text-[#5E23DC]" />
        <span className="text-sm font-semibold text-gray-900">Assignment</span>
      </div>

      <div className="px-5 py-5 flex flex-col gap-4">
        {/* ── Tab switcher ── */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab("sales");
              setSearch("");
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "sales"
                ? "bg-white text-[#5E23DC] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sales Partners
            {salesList.length > 0 && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === "sales"
                    ? "bg-[#5E23DC]/10 text-[#5E23DC]"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {salesList.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("territory");
              setSearch("");
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "territory"
                ? "bg-white text-[#5E23DC] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Territory Partners
            {territoryList.length > 0 && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === "territory"
                    ? "bg-[#5E23DC]/10 text-[#5E23DC]"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {territoryList.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Search bar ── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab === "sales" ? "sales" : "territory"} partners...`}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#5E23DC] focus:ring-2 focus:ring-[#5E23DC]/10 transition-all placeholder:text-gray-300"
          />
        </div>

        {/* ── Partner list ── */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin text-[#5E23DC]" />
              Loading...
            </div>
          )}

          {/* Error */}
          {!isLoading && fetchError && (
            <div className="flex flex-col items-center gap-2 py-6 px-4">
              <p className="text-xs text-red-500 text-center">{fetchError}</p>
              <button
                type="button"
                onClick={retryFetch}
                className="flex items-center gap-1.5 text-xs text-[#5E23DC] hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !fetchError && filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-400">
              {search ? `No results for "${search}"` : "No partners found"}
            </div>
          )}

          {/* Partner rows */}
          {!isLoading && !fetchError && filtered.length > 0 && (
            <div className="max-h-52 overflow-y-auto divide-y divide-gray-50">
              {filtered.map((p) => {
                const isSelected = selectedId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => select(p)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer text-left ${
                      isSelected ? "bg-[#5E23DC]/5" : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0 ${p.color}`}
                    >
                      {p.initials}
                    </div>

                    {/* Name + role */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium leading-tight truncate ${
                          isSelected ? "text-[#5E23DC]" : "text-gray-800"
                        }`}
                      >
                        {p.name}
                      </p>
                      <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
                        {p.role}
                      </p>
                      {p.contact && (
                        <p className="text-[10px] text-gray-300 leading-tight">
                          {p.contact}
                        </p>
                      )}
                    </div>

                    {/* Selected checkmark */}
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#5E23DC] flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected summary */}
        {data.assignedTo && data.assignedId && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#5E23DC]/5 border border-[#5E23DC]/15 rounded-xl">
            <Check className="w-3.5 h-3.5 text-[#5E23DC] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#5E23DC] truncate">
                {data.assignedTo}
              </p>
              <p className="text-[10px] text-[#5E23DC]/60 leading-tight">
                {data.assignedRole} · ID: {data.assignedId}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onChange("assignedTo", "");
                onChange("assignedRole", "");
                onChange("assignedId", null);
              }}
              className="text-[#5E23DC]/40 hover:text-[#5E23DC] transition-colors cursor-pointer text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
