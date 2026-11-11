import { Trash2, Loader2 } from "lucide-react";

export default function AddEventHeader({ onBack, isEditMode = false, onDelete, deleting = false }) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b px-4 md:px-8 h-18 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
          aria-label="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h1 className="text-[17px] font-semibold text-gray-900">
          {isEditMode ? "Edit event" : "Add event"}
        </h1>
      </div>

      {/* Delete button — edit mode only */}
      {isEditMode && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 border border-red-200 text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
        >
          {deleting
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Trash2  className="w-4 h-4" />
          }
          {deleting ? "Deleting..." : "Delete"}
        </button>
      )}
    </div>
  );
}