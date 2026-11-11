import { Info } from "lucide-react";

const EVENT_TYPES = ["Site Visit", "Meeting", "Follow-up", "Inspection", "Task", "Other"];
const PRIORITIES  = [
  { label: "Low",    color: "text-blue-600  bg-blue-50  border-blue-300"  },
  { label: "Medium", color: "text-amber-600 bg-amber-50 border-amber-300" },
  { label: "High",   color: "text-red-600   bg-red-50   border-red-300"   },
];

/**
 * EventBasicInfo
 * Props:
 *   data     : { title, eventType, priority }
 *   onChange : fn(field, value)
 */
export default function EventBasicInfo({ data, onChange }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden border">
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
        <Info className="w-4 h-4 text-[#5E23DC]" />
        <span className="text-sm font-semibold text-gray-900">Event basic info</span>
      </div>

      <div className="px-5 py-5 flex flex-col gap-5">

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Event title <span className="text-red-400 normal-case tracking-normal font-normal">*</span>
          </label>
          <input
            type="text"
            value={data.title}
            onChange={e => onChange("title", e.target.value)}
            placeholder="e.g. Site visit with Mr. Johnson"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-[#5E23DC] focus:ring-2 focus:ring-[#5E23DC]/10 transition-all placeholder:text-gray-300"
          />
        </div>

        {/* Event type chips */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Event type
          </label>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => onChange("eventType", t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  data.eventType === t
                    ? "bg-[#5E23DC] border-[#5E23DC] text-white"
                    : "bg-white border-gray-200 text-gray-500 hover:border-[#5E23DC]/40 hover:text-[#5E23DC]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Priority
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITIES.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => onChange("priority", p.label)}
                className={`py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  data.priority === p.label
                    ? p.color
                    : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}