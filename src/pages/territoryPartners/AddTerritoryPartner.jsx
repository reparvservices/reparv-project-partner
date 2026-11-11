import { useState } from "react";
import {
  ArrowLeft, User, MapPin, Briefcase, Settings,
  ImagePlus, Check, ChevronDown
} from "lucide-react";

const GRADIENT = "linear-gradient(110.73deg, #5E23DC 0%, #7C3AED 100%)";

/* ── Toggle ── */
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-all duration-200 focus:outline-none shrink-0 ${
        checked ? "bg-violet-600" : "bg-gray-200"
      }`}
    >
      <span className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all duration-200 ${
        checked ? "left-[22px]" : "left-[3px]"
      }`} />
    </button>
  );
}

/* ── Section Header ── */
function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2.5 pb-5 border-b border-gray-100 mb-6">
      <Icon size={17} className="text-violet-600 shrink-0" />
      <h2 className="text-[15px] font-bold text-gray-900">{title}</h2>
    </div>
  );
}

/* ── Label ── */
function Label({ children, required }) {
  return (
    <label className="block text-[13px] font-medium text-gray-700 mb-2">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

/* ── Input ── */
function Input({ label, required, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <input
        className="w-full border border-gray-200 rounded-[6px] px-3.5 py-2.5 text-[13.5px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all"
        {...props}
      />
    </div>
  );
}

/* ── Select ── */
function SelectField({ label, required, children }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <div className="relative">
        <select className="w-full border border-gray-200 rounded-[6px] px-3.5 py-2.5 text-[13.5px] text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all appearance-none bg-white cursor-pointer pr-9">
          {children}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

/* ── Textarea ── */
function Textarea({ label, required, rows = 4, ...props }) {
  return (
    <div>
      {label && <Label required={required}>{label}</Label>}
      <textarea
        rows={rows}
        className="w-full border border-gray-200 rounded-[6px] px-3.5 py-2.5 text-[13.5px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-50 transition-all resize-none"
        {...props}
      />
    </div>
  );
}

/* ── Main Component ── */
export default function AddTerritoryPartner({ onBack }) {
  const [photoFile, setPhotoFile]         = useState(null);
  const [leadSharing, setLeadSharing]     = useState(true);
  const [netVisibility, setNetVisibility] = useState(true);
  const [commission, setCommission]       = useState(true);

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-5 md:px-8 py-4 border-b border-gray-100 bg-white">
        <button
          onClick={onBack}
          className="p-1.5 rounded-[6px] hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <h1 className="text-[17px] font-bold text-gray-900">Add Territory Partners</h1>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl px-5 md:px-8 py-8 space-y-8">

          {/* ── 1. Partner Basic Information ── */}
          <section>
            <SectionHeader icon={User} title="Partner Basic Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <Input label="Full Name"       required placeholder="e.g. Michael Chen"       />
              <Input label="Contact Number"  required placeholder="+1 (555) 000-0000"        />
              <Input label="Email Address"   required placeholder="michael@example.com" type="email" />

              {/* Profile Photo Upload */}
              <div>
                <Label>Profile Photo</Label>
                <label className="block cursor-pointer">
                  <div className="border border-dashed border-gray-200 rounded-[6px] px-4 py-[11px] flex items-center gap-3 hover:border-violet-300 hover:bg-violet-50/30 transition-all">
                    <ImagePlus size={17} className="text-gray-400 shrink-0" />
                    <span className="text-[13.5px] text-gray-400">
                      {photoFile ? photoFile.name : "Upload profile photo..."}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setPhotoFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

            </div>
          </section>

          {/* ── 2. Location Details ── */}
          <section>
            <SectionHeader icon={MapPin} title="Location Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <SelectField label="State" required>
                <option value="">Select State</option>
                <option>Maharashtra</option>
                <option>Karnataka</option>
                <option>Delhi</option>
                <option>Tamil Nadu</option>
                <option>Telangana</option>
              </SelectField>

              <SelectField label="City" required>
                <option value="">Select City</option>
                <option>Mumbai</option>
                <option>Bangalore</option>
                <option>Delhi</option>
                <option>Chennai</option>
                <option>Hyderabad</option>
              </SelectField>

              <Input label="Service Area / Territory" placeholder="e.g. Greater Bay Area" />

              <SelectField label="Preferred Property Type">
                <option value="">Select Type</option>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
                <option>Mixed Use</option>
              </SelectField>

            </div>
          </section>

          {/* ── 3. Partner Intent and Background ── */}
          <section>
            <SectionHeader icon={Briefcase} title="Partner Intent and Background" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div className="md:col-span-2">
                <Textarea
                  label="Why are You Interested?"
                  required
                  rows={4}
                  placeholder="Describe your interest in joining the Reparv network..."
                />
              </div>

              <Input label="Years of Experience"  placeholder="e.g. 5"                  />
              <Input label="Previous Brokerage"   placeholder="e.g. Century Real Estate" />

              <div className="md:col-span-2">
                <Textarea
                  label="Short Bio"
                  rows={3}
                  placeholder="Professional biography..."
                />
              </div>

            </div>
          </section>

          {/* ── 4. Network Settings ── */}
          <section>
            <SectionHeader icon={Settings} title="Network Settings" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <SelectField label="Partner Status">
                <option>Active</option>
                <option>Inactive</option>
              </SelectField>

              {/* Commission Agreement — custom violet checkbox */}
              <div>
                <Label>Commission Agreement</Label>
                <button
                  type="button"
                  onClick={() => setCommission(!commission)}
                  className="w-full flex items-center gap-3 border border-gray-200 rounded-[6px] px-3.5 py-2.5 hover:border-gray-300 transition-colors"
                >
                  <span className={`w-5 h-5 rounded-[4px] flex items-center justify-center border transition-all shrink-0 ${
                    commission ? "border-violet-600 bg-violet-600" : "border-gray-300 bg-white"
                  }`}>
                    {commission && <Check size={12} className="text-white" strokeWidth={3} />}
                  </span>
                  <span className="text-[13.5px] text-gray-700 font-medium">Signed and Verified</span>
                </button>
              </div>

              {/* Lead Sharing Toggle */}
              <div>
                <Label>Lead Sharing</Label>
                <div className="flex items-center justify-between border border-gray-200 rounded-[6px] px-3.5 py-2.5">
                  <span className="text-[13.5px] text-gray-700 font-medium">Lead Sharing Permission</span>
                  <Toggle checked={leadSharing} onChange={setLeadSharing} />
                </div>
              </div>

              {/* Network Visibility Toggle */}
              <div>
                <Label>Network Visibility</Label>
                <div className="flex items-center justify-between border border-gray-200 rounded-[6px] px-3.5 py-2.5">
                  <span className="text-[13.5px] text-gray-700 font-medium">Visible in Network</span>
                  <Toggle checked={netVisibility} onChange={setNetVisibility} />
                </div>
              </div>

            </div>
          </section>

          <div className="h-2" />
        </div>
      </div>

      {/* ── Sticky Footer ── */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 md:px-8 py-4 flex items-center justify-between gap-4">
        <button
          type="button"
          className="px-6 py-2.5 rounded-[6px] border border-gray-200 text-[13.5px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>

        <button
          type="button"
          className="flex items-center gap-2 px-6 py-2.5 rounded-[6px] text-[13.5px] font-bold text-white shadow-[0_4px_14px_rgba(94,35,220,0.3)] hover:opacity-90 transition-opacity"
          style={{ background: GRADIENT }}
        >
          <Check size={14} strokeWidth={2.5} />
          Save Territory Partner
        </button>
      </div>

    </div>
  );
}