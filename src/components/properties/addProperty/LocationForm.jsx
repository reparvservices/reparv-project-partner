import { FaChevronDown } from "react-icons/fa";
import LocationPicker from "./LocationPicker";

const inputCls =
  "mt-1 w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-gray-400";
const selectCls =
  "mt-1 w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-gray-700 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all appearance-none bg-white cursor-pointer";

/**
 * LocationForm
 * Props:
 *   form       : object  — full form state
 *   errors     : object
 *   states     : [{ state }]
 *   cities     : [{ city }]
 *   onChange   : fn(field, value)
 *   onValidate : fn(field, value)
 */
export default function LocationForm({
  form,
  errors,
  states = [],
  cities = [],
  onChange,
  onValidate,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">Location Details</h3>

      {/* State */}
      <div>
        <label className="text-xs text-gray-500 font-medium">
          State <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={form.state}
            onChange={(e) => onChange("state", e.target.value)}
            className={selectCls}
          >
            <option value="">Select State</option>
            {states.map((s, i) => (
              <option key={i} value={s.state}>
                {s.state}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute right-3 top-[38px] pointer-events-none text-gray-400 text-xs" />
        </div>
      </div>

      {/* City */}
      <div>
        <label className="text-xs text-gray-500 font-medium">
          City <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={form.city}
            onChange={(e) => onChange("city", e.target.value)}
            disabled={!form.state}
            className={`${selectCls} ${!form.state ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <option value="">Select City</option>
            {cities.map((c, i) => (
              <option key={i} value={c.city}>
                {c.city}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute right-3 top-[38px] pointer-events-none text-gray-400 text-xs" />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="text-xs text-gray-500 font-medium">
          Address / Locality <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="e.g. Wakad, Sector 4"
          className={inputCls}
        />
      </div>

      {/* Pin Code — auto-filled from map reverse geocode */}
      <div>
        <label className="text-xs text-gray-500 font-medium">Pin Code <span className="text-red-500">*</span></label>
        <input
          type="text"
          maxLength={6}
          value={form.pincode || ""}
          onChange={(e) =>
            onChange("pincode", e.target.value.replace(/\D/g, ""))
          }
          placeholder="Auto-filled from map or enter manually"
          className={inputCls}
        />
      </div>

      {/* ── Leaflet Map Picker ── */}
      <div>
        <label className="text-xs text-gray-500 font-medium block mb-1.5">
          Pin on Map <span className="text-red-500">*</span>
        </label>
        {/*
          LocationPicker props:
            state, city, pincode  → auto-geocodes to that area
            latitude, longitude   → pre-sets marker if already saved
            onChange({ latitude, longitude, pincode }) → updates form
        */}
        <LocationPicker
          state={form.state} // → triggers auto-geocode
          city={form.city} // → triggers auto-geocode
          pincode={form.pincode} // → triggers auto-geocode
          latitude={form.latitude} // → pre-sets marker on edit
          longitude={form.longitude}
          onChange={({ latitude, longitude, pincode }) => {
            // saves lat/lng to form
            // auto-fills pincode from reverse geocode if not yet filled
          }}
        />
      </div>

      {/* ── Contact Details ── */}
      <div className="pt-3 border-t border-gray-100 space-y-4">
        <h4 className="text-sm font-semibold text-gray-800">Contact Details</h4>

        {/* Owner Name */}
        <div>
          <label className="text-xs text-gray-500 font-medium">
            Owner Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.projectBy}
            onChange={(e) => {
              const v = e.target.value.replace(/[^A-Za-z\s]/g, "");
              onChange("projectBy", v);
              onValidate("projectBy", v);
            }}
            placeholder="e.g. Rajesh Kumar"
            className={`${inputCls} ${errors.projectBy ? "!border-red-400 focus:!ring-red-100" : ""}`}
          />
          {errors.projectBy && (
            <p className="text-xs text-red-500 mt-1">{errors.projectBy}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="text-xs text-gray-500 font-medium">
            Phone <span className="text-red-500">*</span>
           <span className="text-red-500">*</span></label>
          <div className="flex mt-1">
            <span className="h-10 px-3 flex items-center border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500 bg-gray-50 font-medium">
              +91
            </span>
            <input
              type="tel"
              maxLength={10}
              value={form.contact}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                onChange("contact", v);
                onValidate("contact", v);
              }}
              placeholder="9876543210"
              className={`flex-1 h-10 border px-3 text-sm outline-none rounded-r-xl transition-all placeholder:text-gray-400
                ${
                  errors.contact
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                }`}
            />
          </div>
          {errors.contact && (
            <p className="text-xs text-red-500 mt-1">{errors.contact}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-xs text-gray-500 font-medium">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => {
              onChange("email", e.target.value);
              onValidate("email", e.target.value);
            }}
            placeholder="owner@email.com (optional)"
            className={`${inputCls} ${errors.email ? "!border-red-400 focus:!ring-red-100" : ""}`}
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
          )}
        </div>
      </div>
    </div>
  );
}
