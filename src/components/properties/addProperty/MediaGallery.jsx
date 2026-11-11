import { FiUploadCloud } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { imageSectionsFor, maxPhotosFor } from "../../../utils/propertyListing";

/** Photo sections follow the property type, same as the partner app. */
export default function MediaGallery({ category, imageFiles, onAdd, onRemove }) {
  if (!category) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-1">Media Gallery</h3>
        <p className="text-sm text-gray-400">Select a property type to add photos.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-5">
      <h3 className="font-semibold text-gray-900">Media Gallery</h3>

      {imageSectionsFor(category).map(({ key, label, required }) => {
        const files = imageFiles?.[key] || [];
        const max = maxPhotosFor(key);
        return (
          <div key={key}>
            <p className="text-xs text-gray-500 font-medium mb-2">
              {label} {required && <span className="text-red-500">*</span>}
              <span className="text-gray-400"> ({files.length}/{max})</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {files.map((file, i) => (
                <div key={i} className="relative h-24 rounded-xl overflow-hidden group border border-gray-100">
                  <img src={URL.createObjectURL(file)} alt={`${label} ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    aria-label={`Remove ${label} photo`}
                    onClick={() => onRemove(key, i)}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500 text-white grid place-items-center"
                  >
                    <RxCross2 size={10} />
                  </button>
                </div>
              ))}
              {files.length < max && (
                <label
                  onDrop={(e) => { e.preventDefault(); onAdd(key, Array.from(e.dataTransfer.files)); }}
                  onDragOver={(e) => e.preventDefault()}
                  className="h-24 border-2 border-dashed border-gray-200 rounded-xl grid place-items-center text-violet-600 cursor-pointer hover:bg-violet-50"
                >
                  <FiUploadCloud size={22} />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { onAdd(key, Array.from(e.target.files)); e.target.value = ""; }}
                  />
                </label>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
