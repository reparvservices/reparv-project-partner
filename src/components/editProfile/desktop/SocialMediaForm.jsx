import { FiInstagram, FiLinkedin, FiYoutube, FiPhone } from "react-icons/fi";

export default function SocialMediaForm() {
  return (
    <>
      {/* ✅ MOBILE VIEW */}
      <div className="md:hidden bg-[#F6F7FB] -mx-4 px-4 pb-24 space-y-6">
        {/* Public Profiles */}
        <div>
          <p className="text-xs tracking-widest text-gray-400 mb-2">
            PUBLIC PROFILES
          </p>

          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
            <IconInput
              icon={<FiInstagram className="text-pink-500" />}
              label="Instagram"
              placeholder="@username"
            />
            <IconInput
              icon={<FiLinkedin className="text-blue-600" />}
              label="LinkedIn"
              placeholder="https://linkedin.com/in/..."
            />
            <IconInput
              icon={<FiYoutube className="text-red-500" />}
              label="YouTube Channel"
              placeholder="https://youtube.com/c/..."
            />
          </div>
        </div>

        {/* Direct Contact */}
        <div>
          <p className="text-xs tracking-widest text-gray-400 mb-2">
            DIRECT CONTACT
          </p>

          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
            <IconInput
              icon={<FiPhone className="text-green-500" />}
              label="WhatsApp Business"
              placeholder="+1 (555) 000-0000"
            />
            <p className="text-xs text-gray-400">
              Used for direct client messaging links.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="mx-4 mt-5">
          <button className="w-full bg-violet-600 text-white py-3 rounded-xl font-medium shadow">
            Save Changes
          </button>
        </div>
        
      </div>

      {/* ✅ DESKTOP VIEW (UNCHANGED GRID) */}
      <div className="hidden md:block bg-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between">
          <div>
            <h3 className="font-semibold">Social Media</h3>
            <p className="text-xs text-[#9CA3AF]">
              Connect your creator profiles so partners can follow your content.
            </p>
          </div>
          <div className="flex items-center justify-center px-4 py-1 text-xs bg-violet-100 text-violet-600 rounded-full">
            Social first
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DesktopInput
            label="Instagram"
            placeholder="https://instagram.com/aarohi.reparv"
          />
          <DesktopInput
            label="WhatsApp Business"
            placeholder="+91 98765 43210"
          />
          <DesktopInput
            label="LinkedIn"
            placeholder="https://linkedin.com/in/aarohi-mehta"
          />
          <DesktopInput
            label="YouTube channel"
            placeholder="https://youtube.com/@aarohiestates"
          />
        </div>
      </div>
    </>
  );
}

/* ------------------ Mobile Components ------------------ */

function IconInput({ label, icon, ...props }) {
  return (
    <div>
      <p className="text-sm font-medium mb-1">{label}</p>
      <div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-white">
        <span className="text-lg">{icon}</span>
        <input
          {...props}
          className="w-full text-sm outline-none bg-transparent placeholder:text-gray-400"
        />
      </div>
    </div>
  );
}

/* ------------------ Desktop Input ------------------ */

function DesktopInput({ label, ...props }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        {...props}
        className="mt-1 w-full rounded-lg border bg-[#F7F7FB] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
      />
    </div>
  );
}
