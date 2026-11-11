import { FiMapPin, FiGlobe, FiX, FiPlus, FiHome } from "react-icons/fi";

export default function BasicInfoForm() {
  const territories = ["Downtown", "North Loop", "Hyde Park"];

  return (
    <>
      {/* ✅ MOBILE VIEW */}
      <div className="md:hidden bg-[#F6F7FB] -mx-4 px-4 pb-24 space-y-6">

        {/* Identity */}
        <Section title="IDENTITY">
          <InputMobile label="Full Name" defaultValue="Elena Rodriguez" />
          <IconInputMobile label="Company Name" icon={<FiHome />} defaultValue="Rodriguez Repairs LLC" />
          <InputMobile label="Role / Title" defaultValue="Mobile Repair Specialist" />
        </Section>

        {/* Location & Bio */}
        <Section title="LOCATION & BIO">
          <IconInputMobile label="Location" icon={<FiMapPin />} defaultValue="Austin, TX" />
          <TextareaMobile
            label="Bio"
            defaultValue="Certified tech with 5+ years experience fixing smartphones, tablets, and laptops. I come to you!"
            max={150}
          />
        </Section>

        {/* Details */}
        <Section title="DETAILS">
          <div>
            <p className="text-sm font-medium mb-2">Service Territory</p>
            <div className="flex flex-wrap gap-2">
              {territories.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 text-xs bg-violet-100 text-violet-600 px-3 py-1.5 rounded-full"
                >
                  {t}
                  <FiX className="cursor-pointer" />
                </span>
              ))}
              <button className="flex items-center gap-1 text-xs bg-gray-100 px-3 py-1.5 rounded-full text-gray-500">
                <FiPlus /> Add
              </button>
            </div>
          </div>

          <IconInputMobile
            label="Website"
            icon={<FiGlobe />}
            defaultValue="https://rodriguez-repairs.com"
          />
        </Section>

        {/* Save Button */}
        <div className="mx-4 mt-5">
          <button className="w-full bg-violet-600 text-white py-3 rounded-xl font-medium shadow">
            Save Changes
          </button>
        </div>
      </div>

      {/* ✅ DESKTOP VIEW (UNCHANGED) */}
      <div className="hidden md:block bg-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Basic Information</h3>
            <p className="text-xs text-[#9CA3AF]">
              Tell partners who you are and where you operate.
            </p>
          </div>
          <span className="text-xs text-violet-600 bg-violet-100 px-2 py-1 rounded-full">
            Required
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DesktopInput label="Full name" placeholder="Aarohi Mehta" />
          <DesktopInput label="Company name" placeholder="Aarohi Estates Collective" />
          <DesktopInput label="Role / title" placeholder="Founder • Lead Sales Partner" />
          <DesktopInput label="Location" placeholder="Mumbai • Navi Mumbai Cluster" />
        </div>

        <DesktopTextarea
          label="Bio"
          placeholder="Helping builders and brokers close premium inventory with short-form video..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DesktopInput label="Territory tags" placeholder="Mumbai Central, Navi Mumbai, Thane" />
          <DesktopInput label="Website link" placeholder="https://aarohiestates.in" />
        </div>
      </div>
    </>
  );
}

/* ---------------- Mobile Components ---------------- */

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs tracking-widest text-gray-400 mb-2">{title}</p>
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

function InputMobile({ label, ...props }) {
  return (
    <div>
      <p className="text-sm font-medium mb-1">{label}</p>
      <input
        {...props}
        className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
      />
    </div>
  );
}

function IconInputMobile({ label, icon, ...props }) {
  return (
    <div>
      <p className="text-sm font-medium mb-1">{label}</p>
      <div className="flex items-center gap-2 border rounded-xl px-3 py-2">
        <span className="text-gray-400">{icon}</span>
        <input
          {...props}
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>
    </div>
  );
}

function TextareaMobile({ label, max = 150, defaultValue }) {
  return (
    <div>
      <p className="text-sm font-medium mb-1">{label}</p>
      <textarea
        defaultValue={defaultValue}
        maxLength={max}
        rows={4}
        className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
      />
      <p className="text-xs text-gray-400 text-right mt-1">
        {defaultValue.length}/{max}
      </p>
    </div>
  );
}

/* ---------------- Desktop Inputs ---------------- */

function DesktopInput({ label, ...props }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        {...props}
        className="mt-1 w-full rounded-lg bg-[#F7F7FB] border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
      />
    </div>
  );
}

function DesktopTextarea({ label, ...props }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <textarea
        rows={3}
        {...props}
        className="mt-1 w-full rounded-lg border px-3 py-2 bg-[#F7F7FB] text-sm outline-none focus:ring-2 focus:ring-violet-500"
      />
    </div>
  );
}