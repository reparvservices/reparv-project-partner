import {
  LISTING_TYPES,
  PROPERTY_KINDS,
  SALE_CONDITIONS,
  categoriesFor,
  categoryLabel,
} from "../../../utils/propertyListing";

const pillCls = (active) =>
  `px-5 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
    active
      ? "bg-violet-600 text-white border-violet-600 shadow-sm"
      : "bg-white text-gray-600 border-gray-200 hover:border-violet-400 hover:text-violet-700"
  }`;

/**
 * PropertyClassification
 * Sell / Buy / Rent → (New Launch / Resale) → Residential / Commercial / Agriculture → category
 *
 * Props:
 *   listingType      : "Sell" | "Buy" | "Rent"
 *   condition        : "new" | "resale"  (Sell / Buy only)
 *   propertyKind     : "Residential" | "Commercial" | "Agriculture"
 *   propertyCategory : selected category value (e.g. "NewFlat")
 *   onChange         : fn({ listingType, condition, propertyKind, propertyCategory })
 *   bare             : render without the card wrapper / title
 */
export default function PropertyClassification({
  listingType,
  condition,
  propertyKind,
  propertyCategory,
  onChange,
  bare = false,
}) {
  const current = { listingType, condition, propertyKind, propertyCategory };

  // Changing an upper level clears the category if it no longer fits
  const update = (patch) => {
    const next = { ...current, ...patch };
    if (!("propertyCategory" in patch)) {
      const stillValid = categoriesFor(next).some(
        (c) => c.value === next.propertyCategory,
      );
      if (!stillValid) next.propertyCategory = "";
    }
    onChange(next);
  };

  const types = categoriesFor(current);
  // Keep an older/unlisted stored category visible in edit mode
  const showStored =
    propertyCategory && !types.some((c) => c.value === propertyCategory);

  const body = (
    <div className="space-y-5">
      {/* Sell / Buy / Rent */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">
          I want to <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {LISTING_TYPES.map(({ key, label, hint }) => {
            const active = listingType === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => update({ listingType: key })}
                className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                  active
                    ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-violet-400"
                }`}
              >
                <span className="block text-sm font-semibold">{label}</span>
                <span
                  className={`block text-[11px] leading-tight mt-0.5 ${
                    active ? "text-violet-100" : "text-gray-400"
                  }`}
                >
                  {hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* New Launch / Resale (Sell & Buy) */}
      {listingType !== "Rent" && (
        <div>
          <p className="text-xs text-gray-500 font-medium mb-2">
            {listingType === "Buy" ? "Looking for" : "Property is"}
          </p>
          <div className="flex flex-wrap gap-2">
            {SALE_CONDITIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => update({ condition: key })}
                className={pillCls(condition === key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Residential / Commercial / Agriculture */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">
          Property Type <span className="text-red-500">*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_KINDS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => update({ propertyKind: key })}
              className={pillCls(propertyKind === key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Category grid — 2 cols on mobile, 4 cols on sm+ */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">
          Category <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {showStored && (
            <button
              type="button"
              className="border rounded-xl p-4 flex flex-col items-center gap-2 bg-violet-600 text-white border-violet-600 shadow-sm"
            >
              <span className="text-xs text-center leading-tight">
                {categoryLabel(propertyCategory)} (current)
              </span>
            </button>
          )}
          {types.map(({ label, value, icon: Icon }) => {
            const active = propertyCategory === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => update({ propertyCategory: value })}
                className={`border rounded-xl p-4 flex flex-col items-center gap-2 transition-all cursor-pointer
                  ${active
                    ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-violet-50 hover:border-violet-300"
                  }`}
              >
                <Icon size={18} />
                <span className="text-xs text-center leading-tight">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (bare) return body;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Property Classification</h3>
      {body}
    </div>
  );
}
