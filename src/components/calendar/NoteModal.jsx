import { format } from "date-fns";
import { X, Clock, FileText, Loader2 } from "lucide-react";

/**
 * NoteModal
 * Replaces the old inline `showNotePopup` slide-up form from CalendarScheduler.
 * Styled to match the purple/violet calendar theme.
 *
 * Props:
 *   show          : boolean
 *   selectedDate  : Date
 *   newNote       : string
 *   noteTime      : string  ("HH:mm")
 *   saving        : boolean
 *   onNoteChange  : fn(value)
 *   onTimeChange  : fn(value)
 *   onSubmit      : fn(e)
 *   onClose       : fn()
 */
export default function NoteModal({
  show,
  selectedDate,
  newNote,
  noteTime,
  saving,
  onNoteChange,
  onTimeChange,
  onSubmit,
  onClose,
}) {
  if (!show) return null;

  const dateLabel = selectedDate
    ? format(selectedDate, "EEE, dd MMM yyyy")
    : "";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm cursor-pointer" onClick={onClose}
      />

      {/* Modal — slides up from bottom on mobile, centered on desktop */}
      <div className="fixed inset-0 z-[61] flex items-end md:items-center justify-center p-0 md:p-6">
        <div className="w-full md:max-w-[480px] bg-white md:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#5E23DC] to-[#7C3AED] px-6 pt-6 pb-5 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
            >
              <X size={16} />
            </button>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-200 mb-1">
              New Note
            </p>
            <h2 className="text-xl font-bold">{dateLabel}</h2>
          </div>

          {/* Form body */}
          <form onSubmit={onSubmit} className="px-6 py-5 flex flex-col gap-4">

            {/* Time picker */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                <Clock size={12} />
                Select Time
              </label>
              <input
                type="time"
                value={noteTime}
                onChange={(e) => onTimeChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
              />
            </div>

            {/* Note textarea */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                <FileText size={12} />
                Note
              </label>
              <textarea
                rows={4}
                placeholder="Write your note here..."
                value={newNote}
                onChange={(e) => onNoteChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1 pb-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !newNote.trim()}
                className="flex-1 py-3 rounded-xl bg-[#5E23DC] text-white text-sm font-semibold hover:bg-[#4c1bb5] transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Add Note"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}