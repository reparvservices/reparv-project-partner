import { FiCamera } from "react-icons/fi";
import { HiOutlinePencil } from "react-icons/hi2";

export default function ProfileHeaderCard() {
  return (
    <>
      {/* ✅ MOBILE VIEW */}
      <div className="md:hidden bg-[#F6F7FB] -mx-4 pb-6">
        {/* Cover */}
        <div className="relative h-40 bg-gray-300 bg-[linear-gradient(135deg,#E5E7EB,#D1D5DB)]">
          <button className="absolute top-3 left-1/2 -translate-x-1/2 bg-white shadow px-4 py-1.5 rounded-full text-xs flex items-center gap-2">
            <FiCamera /> Edit Cover
          </button>
        </div>

        {/* Avatar */}
        <div className="relative -mt-12 flex justify-center">
          <div className="relative">
            <img
              src="https://i.pravatar.cc/150?img=47"
              className="w-24 h-24 rounded-full border-4 border-white object-cover"
            />
            <span className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs">
              <HiOutlinePencil />
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="text-center mt-3 px-4">
          <h3 className="font-semibold text-lg">Sofia Martinez</h3>
          <p className="text-sm text-gray-500">Senior Reparv Partner</p>
        </div>

        {/* Display Info Card */}
        <div className="mt-5 mx-4 bg-white rounded-2xl shadow-sm p-4 space-y-4">
          <p className="text-xs tracking-wide text-gray-400 font-semibold">
            DISPLAY INFO
          </p>

          <Input label="Display Name" value="Sofia Martinez" />
          <Input label="Role / Headline" value="Senior Reparv Partner" />
          <TextArea
            label="Bio"
            value="Experienced technician specializing in smart home installations and repairs. Certified pro since 2018."
          />
        </div>

        {/* Toggles */}
        <div className="mt-4 mx-4 bg-white rounded-2xl shadow-sm divide-y">
          <ToggleRow
            title="Profile Visibility"
            desc="Visible to all customers on Reparv"
            defaultChecked
          />

          <ToggleRow
            title='Show "Open for Work" Badge'
            desc="Adds a purple ring to your avatar"
            icon
          />
        </div>

        {/* Save Button */}
        <div className="mx-4 mt-5">
          <button className="w-full bg-violet-600 text-white py-3 rounded-xl font-medium shadow">
            Save Changes
          </button>
        </div>
      </div>

      {/* ✅ DESKTOP VIEW (UNCHANGED) */}
      <div className="hidden md:block bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold">Profile header</h3>
            <p className="text-xs text-gray-500">
              Photo, banner and creator handle for your Reparv profile.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-violet-100 text-violet-600">
            Visible on public profile
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <img
            src="https://i.pravatar.cc/150?img=47"
            className="w-16 h-16 rounded-full object-cover"
          />

          <div
            style={{
              background:
                "radial-gradient(100.93% 738.99% at 0% 0%, rgba(167, 139, 250, 0.18) 0%, rgba(108, 76, 243, 0.05) 100%)",
            }}
            className="flex-1 border-2 border-dashed rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium">Add a cover banner</p>
              <p className="text-xs text-gray-500">Recommended 1600 × 400px</p>
            </div>
            <button className="px-3 py-1.5 text-sm rounded-lg border">
              Upload
            </button>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium">Aarohi Estates Collective</h4>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span className="px-2 py-0.5 bg-violet-100 text-violet-600 rounded-full">
              Builder
            </span>
            <span className="px-2 py-0.5 bg-violet-100 text-violet-600 rounded-full">
              Sales Partner
            </span>
            <span>@aarohi.reparv</span>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Profile completeness</span>
              <span>72%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-[72%] bg-violet-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* Reusable Inputs */

function Input({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <input
        value={value}
        readOnly
        className="w-full border rounded-xl px-3 py-2 text-sm bg-gray-50"
      />
    </div>
  );
}

function TextArea({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <textarea
        rows={3}
        value={value}
        readOnly
        className="w-full border rounded-xl px-3 py-2 text-sm bg-gray-50 resize-none"
      />
    </div>
  );
}

function ToggleRow({ title, desc, defaultChecked, icon }) {
  return (
    <div className="flex items-center justify-between p-4">
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>

      {icon ? (
        <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
          ✓
        </div>
      ) : (
        <input
          type="checkbox"
          defaultChecked={defaultChecked}
          className="w-11 h-6 rounded-full appearance-none bg-gray-200 checked:bg-violet-600 relative cursor-pointer transition
          before:content-[''] before:absolute before:w-5 before:h-5 before:bg-white before:rounded-full before:top-0.5 before:left-0.5
          checked:before:translate-x-5 before:transition"
        />
      )}
    </div>
  );
}