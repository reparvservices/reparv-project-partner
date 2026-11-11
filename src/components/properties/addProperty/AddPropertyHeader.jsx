import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/**
 * AddPropertyHeader
 * Props: onSaveDraft, onCancel, onPublish, canPublish, title
 */
export default function AddPropertyHeader({ onSaveDraft, onCancel, onPublish, canPublish, title = "Add New Property" }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 bg-white border-b z-30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">

        {/* Left: back + title */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onCancel || (() => navigate(-1))}
            className="h-9 w-9 grid place-items-center rounded-xl border border-gray-200 hover:border-violet-400 hover:text-violet-600 text-gray-500 transition-colors shrink-0"
          >
            <FiArrowLeft size={18} />
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{title}</h1>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onSaveDraft}
            className="hidden sm:hidden text-sm text-gray-500 hover:text-violet-600 font-medium transition-colors px-2"
          >
            Save Draft
          </button>
          <button
            onClick={onCancel}
            className="hidden md:block h-9 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onPublish}
            disabled={canPublish === false}
            className={`hidden md:block h-9 px-5 rounded-xl text-white text-sm font-semibold shadow-md transition-all
              ${canPublish !== false
                ? "bg-[#5323DC] hover:bg-violet-700 active:scale-95 shadow-violet-200 cursor-pointer"
                : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            <span className="hidden md:inline">{title === "Update Property" ? "Save Changes" : "Publish Property"}</span>
            <span className="md:hidden">{title === "Update Property" ? "Save" : "Publish"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}