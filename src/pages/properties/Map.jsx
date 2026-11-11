import { useState, useCallback, useEffect } from "react";
import LeafletCityMap from "../../components/map/LeafletCityMap";
import { useAuth } from "../../store/auth";
import Select from "react-select";
import propertyPicture from "../../assets/propertyPicture.svg";
import FormatPrice from "../../components/FormatPrice";
import { getImageURI } from "../../utils/helper";
import {
  FiSearch,
  FiFilter,
  FiMap,
  FiPhone,
  FiMail,
  FiHeart,
  FiList,
  FiChevronDown,
  FiArrowLeft,
  FiMoreHorizontal,
  FiBookmark,
  FiX,
  FiCheck,
} from "react-icons/fi";
import { MdLocationOn } from "react-icons/md";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

const TYPE_FILTERS = ["For Sale", "For Rent", "New Projects", "Plots"];

const STATUS_STYLE = {
  READY: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  "READY TO MOVE": {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
  },
  NEW: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  "NEW LAUNCH": {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  RESALE: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  "COMM.": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
  };
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border} whitespace-nowrap`}
    >
      {status}
    </span>
  );
}

// ── City Select Popup (Mobile) ────────────────────────────────────────────────
function CitySelectPopup({ cities, selectedCity, onSelect, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[900] backdrop-blur-[2px] cursor-pointer" onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[901] shadow-2xl city-popup-enter">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="font-bold text-[17px] text-gray-900">Select City</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* City list */}
        <div className="overflow-y-auto max-h-[55vh] px-4 py-3 pb-8">
          {cities.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">
              No cities available
            </p>
          ) : (
            cities.map((city) => (
              <button
                key={city}
                onClick={() => onSelect(city)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl mb-2 text-left transition-all cursor-pointer ${
                  selectedCity === city
                    ? "bg-violet-50 border border-[#7C3AED]"
                    : "border border-transparent hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MdLocationOn
                    size={18}
                    className={
                      selectedCity === city ? "text-[#7C3AED]" : "text-gray-400"
                    }
                  />
                  <span
                    className={`text-[15px] font-medium ${
                      selectedCity === city ? "text-[#7C3AED]" : "text-gray-800"
                    }`}
                  >
                    {city}
                  </span>
                </div>
                {selectedCity === city && (
                  <FiCheck size={16} className="text-[#7C3AED]" />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes cityPopupEnter {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .city-popup-enter {
          animation: cityPopupEnter 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }
      `}</style>
    </>
  );
}

// ── Desktop property card ─────────────────────────────────────────────────────
function DesktopPropertyCard({ row, isActive, onClick }) {
  let imageSrc = propertyPicture;
  try {
    const parsed = JSON.parse(row.frontView);
    if (parsed?.[0]) imageSrc = getImageURI(parsed[0]);
  } catch {}

  return (
    <div
      onClick={onClick}
      className={`flex gap-3 p-3 rounded-2xl border cursor-pointer transition-all duration-200 group
        ${
          isActive
            ? "border-[#7C3AED] bg-violet-50/60 shadow-md shadow-violet-100"
            : "border hover:border-[#7C3AED]/40 hover:shadow-sm bg-white"
        }`}
    >
      <div className="relative flex-shrink-0">
        <img
          src={imageSrc}
          onError={(e) => {
            e.target.src = propertyPicture;
          }}
          className="w-20 h-20 rounded-xl object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <h4 className="font-bold text-sm text-gray-900 leading-tight truncate">
            {row.propertyName}
          </h4>
          <StatusBadge status={row.status || "READY"} />
        </div>
        <p className="text-xs text-gray-400 mb-1">{row.company_name}</p>
        <p className="text-[#7C3AED] font-bold text-sm">
          <FormatPrice price={row.totalOfferPrice} />
        </p>
        <div className="flex gap-3 text-gray-400 mt-2">
          <button
            onClick={(e) => e.stopPropagation()}
            className="hover:text-[#7C3AED] transition-colors cursor-pointer"
          >
            <FiPhone size={14} />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="hover:text-[#7C3AED] transition-colors cursor-pointer"
          >
            <FiMail size={14} />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="hover:text-red-500 transition-colors cursor-pointer"
          >
            <FiHeart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mobile property card ──────────────────────────────────────────────────────
function MobilePropertyCard({ row }) {
  let imageSrc = propertyPicture;
  try {
    const parsed = JSON.parse(row.frontView);
    if (parsed?.[0]) imageSrc = getImageURI(parsed[0]);
  } catch {}

  const [bookmarked, setBookmarked] = useState(false);

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      <img
        src={imageSrc}
        onError={(e) => {
          e.target.src = propertyPicture;
        }}
        className="w-[90px] h-[90px] rounded-2xl object-cover flex-shrink-0 cursor-pointer"
        onClick={() =>
          window.open(
            "https://www.reparv.in/property-info/" + row.seoSlug,
            "_blank",
          )
        }
      />
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() =>
          window.open(
            "https://www.reparv.in/property-info/" + row.seoSlug,
            "_blank",
          )
        }
      >
        <div className="mb-1">
          <StatusBadge status={row.status || "READY"} />
        </div>
        <h4 className="font-bold text-[16px] text-gray-900 leading-tight truncate">
          {row.propertyName}
        </h4>
        <p className="text-sm text-gray-400 mb-1.5">{row.company_name}</p>
        <p className="text-[#7C3AED] font-bold text-[15px]">
          <FormatPrice price={row.totalOfferPrice} />
        </p>
      </div>
      <div className="flex flex-col gap-2 justify-center flex-shrink-0">
        <button
          onClick={(e) => e.stopPropagation()}
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-[#7C3AED] hover:bg-violet-50 active:scale-95 transition-all cursor-pointer"
        >
          <FiPhone size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setBookmarked((v) => !v);
          }}
          className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
            bookmarked
              ? "border-[#7C3AED] bg-violet-50 text-[#7C3AED]"
              : "border-gray-200 text-[#7C3AED] hover:bg-violet-50"
          }`}
        >
          <FiBookmark
            size={16}
            className={bookmarked ? "fill-[#7C3AED]" : ""}
          />
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const Map = () => {
  const { URI, setLoading } = useAuth();
  const navigate = useNavigate();

  const [allProperties, setAllProperties] = useState([]); // full dataset across all cities
  const [properties, setProperties] = useState([]); // city-filtered properties
  const [selectedCity, setSelectedCity] = useState("");
  const [activeFilter, setActiveFilter] = useState("For Sale");
  const [search, setSearch] = useState("");
  const [activePropertyId, setActivePropertyId] = useState(null);
  const [showList, setShowList] = useState(true);
  const [showMobileList, setShowMobileList] = useState(false);
  const [showCityPopup, setShowCityPopup] = useState(false);

  // ── Derive unique cities from allProperties ───────────────────────────────
  const cities = [
    ...new Set(
      allProperties
        .map((p) => p.city || p.location?.split(",").slice(-1)[0]?.trim())
        .filter(Boolean),
    ),
  ].sort();

  // ── Fetch city list, then all properties in parallel ─────────────────────
  const fetchAllProperties = useCallback(async () => {
    setLoading(true);
    try {
      const cityRes = await fetch(
        `${URI}/project-partner/map/properties/cities`,
        {
          credentials: "include",
        },
      );
      if (!cityRes.ok) throw new Error("Failed to fetch cities");
      const cityList = await cityRes.json(); // string[]

      if (Array.isArray(cityList) && cityList.length) {
        const results = await Promise.all(
          cityList.map((city) =>
            fetch(`${URI}/project-partner/map/properties/get/${city}`, {
              credentials: "include",
            })
              .then((r) => (r.ok ? r.json() : []))
              .catch(() => []),
          ),
        );
        const merged = results.flat().filter(Boolean);
        setAllProperties(merged);

        // Default to first city
        const first = cityList[0];
        setSelectedCity(first);
        setProperties(merged.filter((p) => matchesCity(p, first)));
      }
    } catch (err) {
      console.error("Error fetching map data:", err);
    } finally {
      setLoading(false);
    }
  }, [URI, setLoading]);

  useEffect(() => {
    fetchAllProperties();
  }, [fetchAllProperties]);

  // ── Match property to a city string ──────────────────────────────────────
  const matchesCity = (p, city) => {
    if (!city) return true;
    const haystack = (p.city || p.location || "").toLowerCase();
    return haystack.includes(city.toLowerCase());
  };

  // ── Handle city selection ─────────────────────────────────────────────────
  const handleCityChange = (city) => {
    setSelectedCity(city);
    setProperties(allProperties.filter((p) => matchesCity(p, city)));
    setShowCityPopup(false);
    setActivePropertyId(null);
    setSearch("");
  };

  // ── Search filter (applied on top of city filter) ─────────────────────────
  const filteredProperties = properties.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.propertyName?.toLowerCase().includes(q) ||
      p.company_name?.toLowerCase().includes(q) ||
      p.location?.toLowerCase().includes(q)
    );
  });

  // ── Desktop select styles ─────────────────────────────────────────────────
  const cityOptions = cities.map((c) => ({ value: c, label: c }));
  const selectStyles = {
    control: (base) => ({
      ...base,
      fontSize: "13px",
      cursor: "pointer",
      border: "none",
      boxShadow: "none",
      background: "transparent",
      minHeight: "unset",
    }),
    valueContainer: (base) => ({ ...base, padding: "0" }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: "0 0 0 2px",
      color: "#7C3AED",
    }),
    menu: (base) => ({ ...base, fontSize: "13px", zIndex: 9999 }),
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* City popup (mobile only) */}
      {showCityPopup && (
        <CitySelectPopup
          cities={cities}
          selectedCity={selectedCity}
          onSelect={handleCityChange}
          onClose={() => setShowCityPopup(false)}
        />
      )}

      {/* ════════════════════════════════════════════════════
          DESKTOP (md+)
      ════════════════════════════════════════════════════ */}
      <div className="hidden md:flex flex-col h-full">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 shrink-0 border-b">
          <div className="flex gap-4 text-xs text-gray-700 whitespace-nowrap">
            <button onClick={() => navigate(-1)}>
              <FiArrowLeft className="text-2xl text-gray-900" />
            </button>
            <div>
              <div>
                <span className="text-gray-500">Properties</span>
                <span className="mx-1.5">›</span>
                <span className="text-black font-semibold">Map View</span>
              </div>
              <h1 className="text-lg font-bold text-black">Property Map</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={15}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search location or project..."
                  className="w-full bg-white text-black placeholder:text-gray-500 border rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:border-[#7C3AED] transition-colors"
                />
              </div>
            </div>

            {/* Desktop city dropdown */}
            <div className="bg-white rounded-lg font-medium px-3 py-1.5 flex items-center gap-1 cursor-pointer border">
              <Select
                styles={selectStyles}
                options={cityOptions}
                value={
                  cityOptions.find((o) => o.value === selectedCity) || null
                }
                onChange={(opt) => handleCityChange(opt.value)}
                isSearchable={false}
                placeholder="Select City"
              />
            </div>

            <button className="hidden border text-black rounded-md px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer">
              <FiFilter size={14} /> Filters
            </button>
            <button
              onClick={() => setShowList((v) => !v)}
              className={`${showList ? "border-[#5323DC] text-[#5323Dc]" : "text-black"} border rounded-md px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer`}
            >
              <FiList size={16} />
            </button>
            <button className="bg-[#5323DC] text-white rounded-md px-4 py-2 text-sm flex items-center gap-2 cursor-pointer">
              <FiMap size={14} /> Map
            </button>
          </div>
        </div>

        {/* Map + Right panel */}
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 relative flex xl:justify-center">
            {/* Floating filter pills */}
            <div className="absolute top-5 right-0 xl:right-auto xl:bg-white xl:rounded-full z-[1010] xl:border flex flex-col xl:flex-row items-center gap-2 px-3 py-2 shrink-0">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                    f === activeFilter
                      ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                      : "border-gray-200 text-gray-600 hover:border-[#7C3AED]/40 bg-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/*
              LeafletCityMap receives `filteredProperties` which include lat/lng.
              The map component should render a price-tag marker for each property
              using property.lat and property.lng.
            */}
            <LeafletCityMap
              properties={filteredProperties}
              selectedCity={selectedCity}
              activePropertyId={activePropertyId}
              onSelectProperty={setActivePropertyId}
            />
          </div>

          {/* Right panel */}
          <div
            className={`bg-white border-l flex flex-col ${
              showList ? "w-90 shrink-0" : "w-0"
            }`}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
              <p className="font-bold text-gray-900">
                Found {filteredProperties.length} properties
              </p>
              <span className="text-sm text-gray-400 font-medium">
                {selectedCity}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {filteredProperties.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">
                  No properties found
                </div>
              ) : (
                filteredProperties.map((row) => (
                  <DesktopPropertyCard
                    key={row.propertyid}
                    row={row}
                    isActive={activePropertyId === row.propertyid}
                    onClick={() => {
                      setActivePropertyId(row.propertyid);
                      window.open(
                        "https://www.reparv.in/property-info/" + row.seoSlug,
                        "_blank",
                      );
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          MOBILE (< md)
      ════════════════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col h-full">
        {/* Mobile top bar */}
        <div className="bg-white px-4 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-100 text-gray-700 cursor-pointer"
            >
              <FiArrowLeft size={18} />
            </button>
            <h1 className="font-bold text-[17px] text-gray-900">
              Property Map
            </h1>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-100 text-gray-700 cursor-pointer">
              <FiMoreHorizontal size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <FiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={15}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search location, project or builder..."
              className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#7C3AED] transition-colors"
            />
          </div>

          {/* City pill button (opens popup) + action buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowCityPopup(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-[#7C3AED] transition-colors cursor-pointer"
            >
              <MdLocationOn size={16} className="text-[#7C3AED]" />
              <span className="font-semibold text-[13px] text-gray-900">
                {selectedCity || "Select City"}
              </span>
              <FiChevronDown size={13} className="text-gray-500" />
            </button>

            <div className="flex gap-2">
              <button className="hidden w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#7C3AED] transition-colors cursor-pointer">
                <HiOutlineAdjustmentsHorizontal size={17} />
              </button>
              <button
                onClick={() => setShowMobileList((v) => !v)}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                  showMobileList
                    ? "border-[#7C3AED] bg-violet-50 text-[#7C3AED]"
                    : "border-gray-200 text-gray-600 hover:border-[#7C3AED]"
                }`}
              >
                <FiList size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="bg-white px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide flex-shrink-0">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                f === activeFilter
                  ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                  : "border-gray-200 text-gray-500"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Map + Bottom Sheet */}
        <div className="flex-1 relative min-h-0">
          {/*
            Properties passed here include lat/lng.
            LeafletCityMap should render a marker/price tag at each
            property.lat, property.lng position on the map.
          */}
          <LeafletCityMap
            properties={filteredProperties}
            selectedCity={selectedCity}
            activePropertyId={activePropertyId}
            onSelectProperty={setActivePropertyId}
          />

          {/* Bottom Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.10)] z-[500] transition-all duration-300 ease-in-out"
            style={{
              maxHeight: showMobileList ? "68vh" : "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Drag handle */}
            <div
              className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing flex-shrink-0"
              onClick={() => setShowMobileList((v) => !v)}
            >
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header — always visible */}
            <div
              className="px-5 py-3 flex items-center justify-between flex-shrink-0 cursor-pointer"
              onClick={() => setShowMobileList((v) => !v)}
            >
              <p className="text-[15px] text-gray-500">
                Found{" "}
                <span className="font-bold text-gray-900">
                  {filteredProperties.length}
                </span>{" "}
                properties in this area
              </p>
              <FiChevronDown
                size={20}
                className={`text-gray-400 transition-transform duration-300 ${showMobileList ? "rotate-180" : ""}`}
              />
            </div>

            {/* Scrollable property list */}
            {showMobileList && (
              <div className="overflow-y-auto px-5 pb-8 scrollbar-hide flex-1">
                {filteredProperties.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-sm">
                    No properties found
                  </div>
                ) : (
                  filteredProperties.map((row) => (
                    <MobilePropertyCard key={row.propertyid} row={row} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
