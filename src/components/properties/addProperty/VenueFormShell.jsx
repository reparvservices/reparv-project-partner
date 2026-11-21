import { PiBuildingsFill } from "react-icons/pi";
import PropertyClassification from "./PropertyClassification";
import VenueForm from "../../../pages/venues/VenueForm";

/**
 * Venue Booking inside the property flow: the same page header as the other property types,
 * the Property Type chooser (when adding, so the owner can switch type), then the venue form.
 */
export default function VenueFormShell({
  editing,
  initial,
  classification,
  onClassificationChange,
  onSave,
  onCancel,
  setBusy,
}) {
  return (
    <div className="min-h-full bg-[#F4F6F8] pb-16">
      <div className="bg-gradient-to-br from-[#5E23DC] via-[#6C35DE] to-[#3f16a8] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-7 flex items-start gap-3 sm:gap-4">
          <div className="hidden sm:flex h-11 w-11 rounded-xl bg-white/15 items-center justify-center border border-white/20 shrink-0 mt-0.5">
            <PiBuildingsFill size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
              {editing ? "Update property" : "Add new property"}
            </p>
            <h2 className="text-xl sm:text-2xl font-bold">Venue Booking</h2>
            <p className="text-white/70 text-sm mt-0.5">
              Villas, halls, farmhouses and event spaces, booked directly by customers
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {!editing && classification && (
          <PropertyClassification {...classification} onChange={onClassificationChange} />
        )}
        <VenueForm
          embedded
          editing={editing}
          initial={initial}
          setBusy={setBusy}
          onCancel={onCancel}
          onSave={onSave}
        />
      </div>
    </div>
  );
}
