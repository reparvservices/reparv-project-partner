import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { ChevronDown } from "lucide-react";
import Loader from "../Loader";
import { getImageURI } from "../../utils/helper";
import { useAuth } from "../../store/auth";
import { uploadToS3 } from "../../utils/s3";
import {
  ALL_IMAGE_SECTIONS,
  imageSectionsFor,
  maxPhotosFor,
} from "../../utils/propertyListing";

const GRADIENT = "linear-gradient(94.94deg, #5323DC -8.34%, #8E61FF 97.17%)";
const inputCls =
  "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#5323DC] focus:ring-2 focus:ring-[#5323DC10] transition-all bg-white";
const selectCls = `${inputCls} appearance-none cursor-pointer pr-9`;
const btnPrimary =
  "px-5 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all";
const btnSecondary =
  "px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all";
const btnDanger =
  "px-5 py-2.5 text-white text-sm font-semibold rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 transition-all";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

const IMAGE_OPTIONS = ALL_IMAGE_SECTIONS.map(({ key, label }) => ({
  value: key,
  label,
}));

function parseImages(property, field) {
  try {
    return JSON.parse(property?.[field] || "[]");
  } catch {
    return [];
  }
}

function ExistingImages({ images }) {
  if (!images.length) return null;
  return (
    <div className="grid grid-cols-3 gap-2 mb-2">
      {images.map((img, i) => (
        <div
          key={i}
          className={`relative cursor-pointer rounded-xl overflow-hidden border-2 ${i === 0 ? "border-[#5323DC]" : "border-slate-100"}`}
          onClick={() => window.open(getImageURI(img), "_blank")}
        >
          <img
            src={getImageURI(img)}
            alt=""
            className="w-full h-24 object-cover"
          />
          {i === 0 && (
            <span className="absolute bottom-1 left-1 text-[9px] bg-[#5323DC] text-white px-1.5 py-0.5 rounded-full font-bold">
              Main
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function NewImagePreviews({ files, category, onRemove }) {
  if (!files.length) return null;
  return (
    <div className="grid grid-cols-3 gap-2 mt-2">
      {files.map((file, i) => (
        <div
          key={i}
          className="relative rounded-xl overflow-hidden border border-slate-100"
        >
          <img
            src={URL.createObjectURL(file)}
            alt=""
            className="w-full h-24 object-cover"
          />
          <button
            type="button"
            onClick={() => onRemove(category, i)}
            className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] rounded-full"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

function FilePicker({ category, imageFiles, onAdd }) {
  return (
    <>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => onAdd(e, category)}
        className="hidden"
        id={`picker-${category}`}
      />
      <label
        htmlFor={`picker-${category}`}
        className="flex items-center justify-between border border-slate-200 rounded-xl cursor-pointer overflow-hidden hover:border-[#5323DC] transition-colors"
      >
        <span className="px-4 py-2.5 text-sm text-slate-400">
          {imageFiles[category]?.length
            ? `${imageFiles[category].length} file(s) selected`
            : `Upload images (max ${maxPhotosFor(category)}, 2MB each)`}
        </span>
        <span
          className="text-white px-4 py-2.5 text-sm font-medium shrink-0"
          style={{ background: GRADIENT }}
        >
          Browse
        </span>
      </label>
    </>
  );
}

export default function UpdateImagesForm({
  fetchImages,
  propertyId,
  setPropertyId,
  newProperty,
  imageFiles,
  setImageFiles,
}) {
  const { URI, setLoading, showUpdateImagesForm, setShowUpdateImagesForm } =
    useAuth();
  const [selectedType, setSelectedType] = useState("");

  if (!showUpdateImagesForm) return null;

  const category = selectedType;
  const existingImages = category ? parseImages(newProperty, category) : [];
  const filteredOptions = imageSectionsFor(newProperty?.propertyCategory).map(
    ({ key, label }) => ({ value: key, label }),
  );

  const handleAdd = (e, cat) => {
    const files = Array.from(e.target.files);
    const valid = [],
      rejected = [];
    files.forEach((f) =>
      f.size > MAX_SIZE ? rejected.push(f.name) : valid.push(f),
    );
    if (rejected.length) alert(`Files over 2MB:\n${rejected.join(", ")}`);

    setImageFiles((prev) => {
      const merged = [...(prev[cat] || []), ...valid];
      const max = maxPhotosFor(cat);
      if (merged.length > max) {
        alert(`Max ${max} images in this category.`);
        return { ...prev, [cat]: merged.slice(0, max) };
      }
      return { ...prev, [cat]: merged };
    });
    e.target.value = "";
  };

  const handleRemove = (cat, index) => {
    setImageFiles((prev) => {
      const updated = [...prev[cat]];
      updated.splice(index, 1);
      return { ...prev, [cat]: updated };
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!propertyId) {
      alert("Property ID missing");
      return;
    }
    try {
      setLoading(true);

      const uploadedData = {};

      // Upload each category to S3
      for (const { value } of IMAGE_OPTIONS) {
        const files = imageFiles[value] || [];

        if (files.length > 0) {
          uploadedData[value] = [];

          for (const file of files) {
            const url = await uploadToS3(file);
            if (!url) throw new Error(`Could not upload ${file.name}`);
            uploadedData[value].push(url);
          }
        }
      }

      // Send ONLY URLs to backend
      const res = await fetch(
        `${URI}/project-partner/properties/images/v2/edit/${propertyId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(uploadedData),
        },
      );

      if (!res.ok) throw new Error("Upload failed");

      alert("Images uploaded successfully!");

      setImageFiles({
        frontView: [],
        sideView: [],
        kitchenView: [],
        hallView: [],
        bedroomView: [],
        bathroomView: [],
        balconyView: [],
        nearestLandmark: [],
        developedAmenities: [],
      });

      await fetchImages(propertyId);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedType) return alert("Select an image type first.");
    if (!window.confirm(`Delete all ${selectedType} images?`)) return;
    try {
      const res = await fetch(
        `${URI}/admin/properties/images/delete/${propertyId}?type=${selectedType}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await res.json();
      res.ok
        ? alert(data.message || "Deleted!")
        : alert(data.message || "Delete failed.");
      await fetchImages(propertyId);
    } catch (e) {
      console.error(e);
      alert("Error deleting images.");
    }
  };

  return (
    <div className="fixed inset-0 z-[61] flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
          onClick={() => setShowUpdateImagesForm(false)}
      />

      <div className="relative z-10 bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl md:rounded-t-2xl z-10">
          <h2 className="text-base font-semibold text-slate-900">
            Update Property Images
          </h2>
          <button
            onClick={() => setShowUpdateImagesForm(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <IoMdClose size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-6 space-y-5">
          {/* Image type selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Select Image Type <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={selectCls}
              >
                <option value="" disabled>
                  Choose image category...
                </option>
                {filteredOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Selected type content */}
          {selectedType && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  {filteredOptions.find((o) => o.value === selectedType)?.label}
                </p>
                {existingImages.length > 0 && (
                  <span className="text-xs text-slate-400">
                    {existingImages.length} existing
                  </span>
                )}
              </div>

              {/* Existing images */}
              {existingImages.length > 0 ? (
                <>
                  <p className="text-xs text-slate-400 font-medium">
                    Current images (click to open)
                  </p>
                  <ExistingImages images={existingImages} />
                </>
              ) : (
                <div className="bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-400 text-center">
                  No existing images for this category.
                </div>
              )}

              {/* Upload new */}
              <p className="text-xs text-slate-400 font-medium">
                Upload new images
              </p>
              <FilePicker
                category={selectedType}
                imageFiles={imageFiles}
                onAdd={handleAdd}
              />
              <NewImagePreviews
                files={imageFiles[selectedType] || []}
                category={selectedType}
                onRemove={handleRemove}
              />
            </div>
          )}

          {/* Summary of all pending uploads */}
          {Object.entries(imageFiles).some(([, files]) => files.length > 0) && (
            <div className="bg-[#F5F1FF] border border-[#D4C5FF] rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-[#5323DC] mb-2">
                Pending uploads
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(imageFiles)
                  .filter(([, files]) => files.length > 0)
                  .map(([key, files]) => (
                    <span
                      key={key}
                      className="text-xs bg-white text-[#5323DC] border border-[#D4C5FF] px-2.5 py-1 rounded-full font-medium"
                    >
                      {IMAGE_OPTIONS.find((o) => o.value === key)?.label}:{" "}
                      {files.length}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDelete}
              disabled={!selectedType}
              className={`${btnDanger} ${!selectedType ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              Delete{" "}
              {selectedType
                ? `${filteredOptions.find((o) => o.value === selectedType)?.label}`
                : ""}{" "}
              Images
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowUpdateImagesForm(false)}
                className={btnSecondary}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={btnPrimary}
                style={{ background: GRADIENT }}
              >
                Upload Images
              </button>
              <Loader />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
