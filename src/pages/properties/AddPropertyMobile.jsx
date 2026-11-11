import { useState } from "react";
import {
  FiArrowLeft,
  FiHome,
  FiUploadCloud,
  FiMapPin,
  FiCheckCircle,
  FiEdit,
} from "react-icons/fi";

export default function AddPropertyMobile() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-sm bg-white min-h-screen flex flex-col">

        {/* Header */}
        <header className="sticky top-0 bg-white z-20 border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => setStep((s) => Math.max(1, s - 1))}>
              <FiArrowLeft />
            </button>
            <h1 className="font-semibold text-sm">Add New Property</h1>
            <button className="text-xs text-violet-600">Save Draft</button>
          </div>

          <div className="h-1 bg-gray-200">
            <div
              className="h-1 bg-violet-600 transition-all"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </header>

        {/* Steps */}
        <main className="flex-1 p-4 space-y-4">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <h3 className="font-semibold">Property Classification</h3>

              <div className="flex gap-2">
                {["New Launch", "Resale", "Rental"].map((t, i) => (
                  <button
                    key={t}
                    className={`px-3 py-1 rounded-full text-xs border ${
                      i === 0 ? "bg-violet-600 text-white" : ""
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["Flat / Apt", "Plot", "Shop", "Row House", "Industrial", "Farm Land"].map(
                  (item, i) => (
                    <button
                      key={item}
                      className={`border rounded-xl p-4 flex flex-col items-center gap-2 ${
                        i === 0
                          ? "bg-violet-600 text-white"
                          : "hover:bg-violet-50"
                      }`}
                    >
                      <FiHome />
                      <span className="text-xs">{item}</span>
                    </button>
                  )
                )}
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <h3 className="font-semibold">Basic Information</h3>

              {[
                "Property Name / Project",
                "Built Up Area (sq ft)",
                "Carpet Area (sq ft)",
                "Total Sales Price",
                "Offer Price",
              ].map((label) => (
                <div key={label}>
                  <label className="text-xs text-gray-500">{label}</label>
                  <input
                    className="mt-1 w-full h-10 rounded-xl border px-3 text-sm"
                    placeholder={label}
                  />
                </div>
              ))}
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <h3 className="font-semibold">Location Details</h3>

              {["State", "City", "Address / Locality"].map((label) => (
                <div key={label}>
                  <label className="text-xs text-gray-500">{label}</label>
                  <input
                    className="mt-1 w-full h-10 rounded-xl border px-3 text-sm"
                    placeholder={label}
                  />
                </div>
              ))}

              <div className="h-40 border rounded-xl flex flex-col items-center justify-center text-sm text-gray-500 gap-2">
                <FiMapPin className="text-violet-600" />
                Location Pinned
                <button className="text-violet-600 text-xs border px-2 py-1 rounded-lg">
                  Change
                </button>
              </div>
            </>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <>
              <h3 className="font-semibold">Media Gallery</h3>

              <div className="border-2 border-dashed rounded-xl p-6 text-center text-sm text-gray-500">
                <FiUploadCloud className="mx-auto text-violet-600 mb-2" size={24} />
                Click to upload or drag & drop
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["Front View", "Nearest Landmark"].map((label) => (
                  <div
                    key={label}
                    className="h-24 border rounded-xl flex items-center justify-center text-xs text-gray-400"
                  >
                    {label}
                  </div>
                ))}

                <button className="h-24 border rounded-xl grid place-items-center text-violet-600">
                  +
                </button>
              </div>
            </>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <>
              <div className="bg-violet-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-violet-600">65%</p>
                <p className="text-xs text-gray-500">
                  Good Start! Add more photos to improve.
                </p>
              </div>

              <div className="bg-white border rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500">LISTING CHECKLIST</p>

                {[
                  "Basic Details",
                  "Location Info",
                  "Price & Payment",
                  "Floor Plan",
                  "Amenities",
                ].map((t, i) => (
                  <div key={t} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <FiCheckCircle
                        className={i < 4 ? "text-green-500" : "text-gray-300"}
                      />
                      {t}
                    </div>
                    <button className="text-violet-600 text-xs flex items-center gap-1">
                      <FiEdit /> {i < 4 ? "Edit" : "Add"}
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-white border rounded-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?w=400"
                  className="h-32 w-full object-cover"
                />
                <div className="p-3">
                  <p className="font-semibold">₹2,500 /mo</p>
                  <p className="text-xs text-gray-500">Sunnyvale Modern Apartment</p>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Footer CTA */}
        <footer className="p-4 border-t bg-white">
          {step < 5 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="w-full h-12 rounded-xl bg-violet-600 text-white font-semibold"
            >
              Next
            </button>
          ) : (
            <div className="space-y-2">
              <button className="w-full h-12 rounded-xl bg-violet-600 text-white font-semibold">
                Publish Property
              </button>
              <button className="w-full h-10 rounded-xl border text-sm">
                Save Draft
              </button>
              <button className="w-full text-xs text-gray-500">Cancel</button>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}