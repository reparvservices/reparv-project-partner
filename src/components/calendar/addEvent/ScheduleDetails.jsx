import { useState } from "react";
import { Clock, Bell, ChevronDown } from "lucide-react";

const REMINDERS = [
  "5 minutes before",
  "10 minutes before",
  "15 minutes before",
  "30 minutes before",
  "1 hour before",
  "1 day before",
];

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 border-0 ${
        checked ? "bg-[#5E23DC]" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function Dropdown({ value, options, onChange, icon: Icon }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white hover:border-[#5E23DC]/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          <span>{value}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                value === opt
                  ? "bg-[#5E23DC]/5 text-[#5E23DC] font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * ScheduleDetails
 *
 * Maps to controller fields:
 *   eventDate → event_date
 *   startTime → start_time
 *   endTime   → end_time
 *   isAllDay  → is_all_day  (sent as 1/0)
 *   reminder  → reminder
 *
 * Props:
 *   data     : { eventDate, startTime, endTime, isAllDay, reminder }
 *   onChange : fn(field, value)
 */
export default function ScheduleDetails({ data, onChange }) {
  return (
    <div className="bg-white rounded-lg border">
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gray-50 border-b border-gray-100">
        <Clock className="w-4 h-4 text-[#5E23DC]" />
        <span className="text-sm font-semibold text-gray-900">Schedule details</span>
      </div>

      <div className="px-5 py-5 flex flex-col gap-5">

        {/* eventDate */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Date <span className="text-red-400 normal-case tracking-normal font-normal">*</span>
          </label>
          <input
            type="date"
            value={data.eventDate}
            onChange={e => onChange("eventDate", e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#5E23DC] focus:ring-2 focus:ring-[#5E23DC]/10 transition-all cursor-pointer"
          />
        </div>

        {/* startTime + endTime */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Start time
            </label>
            <input
              type="time"
              value={data.startTime}
              disabled={data.isAllDay}
              onChange={e => onChange("startTime", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#5E23DC] focus:ring-2 focus:ring-[#5E23DC]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              End time
            </label>
            <input
              type="time"
              value={data.endTime}
              disabled={data.isAllDay}
              onChange={e => onChange("endTime", e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#5E23DC] focus:ring-2 focus:ring-[#5E23DC]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* isAllDay toggle */}
        <div className="flex items-center justify-between py-1">
          <span className="text-sm font-medium text-gray-700">All day event</span>
          <Toggle checked={data.isAllDay} onChange={v => onChange("isAllDay", v)} />
        </div>

        <div className="h-px bg-gray-100" />

        {/* reminder */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Reminder
          </label>
          <Dropdown
            value={data.reminder}
            options={REMINDERS}
            onChange={v => onChange("reminder", v)}
            icon={Bell}
          />
        </div>
      </div>
    </div>
  );
}