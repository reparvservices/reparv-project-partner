import { MapPin } from "lucide-react";

/**
 * LocationNotes
 * Maps to controller fields: location, note
 *
 * Props:
 *   data     : { location, note }
 *   onChange : fn(field, value)
 */
export default function LocationNotes({ data, onChange }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden border">
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
        <MapPin className="w-4 h-4 text-[#5E23DC]" />
        <span className="text-sm font-semibold text-gray-900">Location & notes</span>
      </div>

      <div className="px-5 py-5 flex flex-col gap-5">

        {/* Location → maps to controller field: location */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={data.location}
              onChange={e => onChange("location", e.target.value)}
              placeholder="Enter address or meeting link"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#5E23DC] focus:ring-2 focus:ring-[#5E23DC]/10 transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Note → maps to controller field: note */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Notes
          </label>
          <textarea
            value={data.note}
            onChange={e => onChange("note", e.target.value)}
            placeholder="Add any relevant details about the event..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#5E23DC] focus:ring-2 focus:ring-[#5E23DC]/10 transition-all placeholder:text-gray-300 resize-none"
          />
        </div>
      </div>
    </div>
  );
}