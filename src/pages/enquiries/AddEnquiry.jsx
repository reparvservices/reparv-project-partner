import { useState } from "react";
import {
  ArrowLeft, User, Wallet, MapPin, Home, MessageSquare,
  ClipboardList, ChevronDown, Search, X, Calendar, Check, MapPinned
} from "lucide-react";

const GRADIENT = "linear-gradient(110.73deg, #5E23DC 0%, #7C3AED 100%)";

/* ── Reusable: Toggle ── */
function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none shrink-0 ${checked ? "bg-violet-600" : "bg-gray-200"}`}>
      <span className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all duration-200 ${checked ? "left-[22px]" : "left-[3px]"}`} />
    </button>
  );
}

/* ── Reusable: Section Header ── */
function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-[16px] font-extrabold text-gray-900">{title}</h2>
      </div>
      {subtitle && <p className="text-[12.5px] text-gray-400">{subtitle}</p>}
      <div className="mt-4 border-b border-gray-100" />
    </div>
  );
}

/* ── Reusable: Label ── */
function Label({ children, required }) {
  return (
    <label className="block text-[13px] font-medium text-gray-700 mb-2">
      {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

/* ── Reusable: Input ── */
function Input({ label, required, prefix, suffix, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3.5 text-[13px] text-gray-400 select-none">{prefix}</span>
        )}
        <input
          className={`w-full border border-gray-200 rounded-[6px] py-2.5 text-[13.5px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all bg-white ${
            prefix ? "pl-7 pr-3.5" : suffix ? "pl-3.5 pr-10" : "px-3.5"
          }`}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3.5 text-gray-400">{suffix}</span>
        )}
      </div>
    </div>
  );
}

/* ── Reusable: Select ── */
function SelectField({ label, required, children, dotColor }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <div className="relative flex items-center">
        {dotColor && (
          <span className={`absolute left-3.5 w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
        )}
        <select
          className={`w-full border border-gray-200 rounded-[6px] py-2.5 text-[13.5px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all appearance-none bg-white cursor-pointer pr-9 ${dotColor ? "pl-8" : "px-3.5"}`}
        >
          {children}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

/* ── Reusable: Textarea ── */
function Textarea({ label, required, rows = 4, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <textarea
        rows={rows}
        className="w-full border border-gray-200 rounded-[6px] px-3.5 py-2.5 text-[13.5px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all resize-none bg-white"
        {...props}
      />
    </div>
  );
}

/* ── Reusable: Section Card ── */
function SectionCard({ children }) {
  return (
    <div className="bg-white rounded-[10px] border border-gray-100 px-6 py-6 shadow-sm">
      {children}
    </div>
  );
}

/* ── Main Component ── */
export default function AddEnquiry({ onBack }) {
  const [propertySearch, setPropertySearch] = useState("Skyline Towers, Unit 402");
  const [selectedProperty, setSelectedProperty] = useState({
    name: "Skyline Towers, Unit 402",
    sub: "Bandra West, Mumbai • 3 BHK",
    price: "₹ 2.4 Cr",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100&h=80&fit=crop",
  });

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-5 md:px-8 py-4 border-b border-gray-100 bg-white">
        <button onClick={onBack} className="p-1.5 rounded-[6px] hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} className="text-gray-800" strokeWidth={2.2} />
        </button>
        <h1 className="text-[17px] font-extrabold text-gray-900">Add Enquiry</h1>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto py-6 px-4 md:px-8">
        <div className="max-w-6xl space-y-4 md:space-y-5">

          {/* ── 1. Customer Details ── */}
          <SectionCard>
            <SectionHeader
              title="Customer Details"
              subtitle="Basic contact information for the lead."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Full Name"       required placeholder="e.g. Anjali Verma" />
              <Input label="Contact Number"  required placeholder="+91 98765 43210" />
              <SelectField label="Preferred Contact Method">
                <option>WhatsApp</option>
                <option>Phone Call</option>
                <option>Email</option>
                <option>SMS</option>
              </SelectField>
              <SelectField label="Lead Source">
                <option>Website Enquiry</option>
                <option>Referral</option>
                <option>Walk-in</option>
                <option>Social Media</option>
                <option>Cold Call</option>
              </SelectField>
            </div>
          </SectionCard>

          {/* ── 2. Budget & Preferences ── */}
          <SectionCard>
            <SectionHeader
              title="Budget & Preferences"
              subtitle="Investment range and property requirements."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Min Budget" required prefix="₹" placeholder="50,00,000" />
              <Input label="Max Budget" required prefix="₹" placeholder="1,50,00,000" />
              <SelectField label="Property Category">
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
                <option>Mixed Use</option>
              </SelectField>
              <SelectField label="Property Type">
                <option>Apartment</option>
                <option>Villa</option>
                <option>Plot</option>
                <option>Office</option>
                <option>Shop</option>
              </SelectField>
              <div className="md:col-span-2">
                <SelectField label="Preferred BHK (Optional)">
                  <option>3 BHK</option>
                  <option>1 BHK</option>
                  <option>2 BHK</option>
                  <option>4 BHK</option>
                  <option>5+ BHK</option>
                </SelectField>
              </div>
            </div>
          </SectionCard>

          {/* ── 3. Location Preferences ── */}
          <SectionCard>
            <SectionHeader
              title="Location Preferences"
              subtitle="Preferred geographic areas."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField label="State">
                <option>Maharashtra</option>
                <option>Karnataka</option>
                <option>Delhi</option>
                <option>Tamil Nadu</option>
                <option>Telangana</option>
              </SelectField>
              <SelectField label="City">
                <option>Mumbai</option>
                <option>Bangalore</option>
                <option>Delhi</option>
                <option>Chennai</option>
                <option>Hyderabad</option>
              </SelectField>
              <Input
                label="Preferred Location"
                placeholder="e.g. Bandra West"
                suffix={<MapPinned size={15} className="text-gray-400" />}
              />
              <Input label="Nearby Landmark" placeholder="e.g. Near Linking Road" />
            </div>
          </SectionCard>

          {/* ── 4. Property Mapping ── */}
          <SectionCard>
            <SectionHeader
              title="Property Mapping"
              subtitle="Link a specific property to this enquiry if applicable."
            />
            <div className="space-y-3">
              <Input
                label="Search Property"
                placeholder="Search by name or location..."
                suffix={<Search size={15} className="text-gray-400" />}
                value={propertySearch}
                onChange={e => setPropertySearch(e.target.value)}
              />

              {/* Selected property card */}
              {selectedProperty && (
                <div className="flex items-center gap-3 border border-gray-100 rounded-[8px] p-3 bg-gray-50">
                  <img
                    src={selectedProperty.image}
                    alt={selectedProperty.name}
                    className="w-14 h-12 rounded-[6px] object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-bold text-gray-900 leading-tight">{selectedProperty.name}</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">{selectedProperty.sub}</p>
                    <p className="text-[13px] font-bold text-violet-600 mt-0.5">{selectedProperty.price}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="p-1.5 rounded-full hover:bg-gray-200 transition-colors shrink-0"
                  >
                    <X size={14} className="text-gray-500" />
                  </button>
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── 5. Enquiry Message ── */}
          <SectionCard>
            <SectionHeader
              title="Enquiry Message"
              subtitle="Detailed requirement or message from the customer."
            />
            <Textarea
              label="Message"
              required
              rows={5}
              placeholder="Client is looking for a sea-facing apartment..."
            />
          </SectionCard>

          {/* ── 6. Lead Management ── */}
          <SectionCard>
            <SectionHeader
              title="Lead Management"
              subtitle="Internal tracking and follow-up details."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SelectField label="Lead Priority" dotColor="bg-red-500">
                <option>Hot</option>
                <option>Warm</option>
                <option>Cold</option>
              </SelectField>
              <Input
                label="Follow-up Date"
                placeholder="DD/MM/YYYY"
                suffix={<Calendar size={15} className="text-gray-400" />}
                type="text"
              />
              <SelectField label="Assigned Agent">
                <option>Select Agent</option>
                <option>Rahul Sharma</option>
                <option>Priya Nair</option>
                <option>Vikram Mehta</option>
              </SelectField>
              <SelectField label="Enquiry Status">
                <option>New</option>
                <option>In Progress</option>
                <option>Site Visit Scheduled</option>
                <option>Negotiation</option>
                <option>Closed</option>
              </SelectField>
            </div>
          </SectionCard>

          <div className="h-2" />
        </div>
      </div>

      {/* ── Sticky Footer ── */}
      <div className="md:sticky bottom-0 z-20 bg-white border-t border-gray-100 px-5 md:px-8 py-4 flex items-center justify-between gap-4">
        <button
          type="button"
          className="px-6 py-2.5 rounded-[8px] border border-gray-200 text-[13.5px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          className="flex items-center gap-2 px-7 py-2.5 rounded-[8px] text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(94,35,220,0.3)] hover:opacity-90 transition-opacity"
          style={{ background: GRADIENT }}
        >
          Save Enquiry
        </button>
      </div>

    </div>
  );
}