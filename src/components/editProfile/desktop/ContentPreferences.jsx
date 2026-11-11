export default function ContentPreferences() {
  return (
    <>
      {/* ✅ MOBILE VIEW */}
      <div className="md:hidden min-h-screen bg-[#F6F7FB] pt-5 pb-28 space-y-4">

        {/* Privacy & Visibility */}
        <Section title="Privacy & Visibility">
          <Toggle
            label="Show posts publicly"
            desc="Visible to everyone on Reparv"
            defaultChecked
          />
          <Toggle
            label="Auto-publish to feed"
            desc="Share directly to community"
            defaultChecked={false}
          />
        </Section>

        {/* Interactions */}
        <Section title="Interactions">
          <Toggle
            label="Allow tagging"
            desc="Builders and partners can tag you in their updates"
            defaultChecked
          />
          <Toggle
            label="Allow reposts"
            desc="Let partners repost your content"
            defaultChecked
          />
        </Section>

        {/* Features */}
        <Section title="Features">
          <Toggle
            label="Enable Stories"
            desc="Share 24h temporary updates"
            defaultChecked={false}
          />
        </Section>

        {/* Save Button */}
        <div className="mx-4 mt-5">
          <button className="w-full bg-violet-600 text-white py-3 rounded-xl font-medium shadow">
            Save preferences
          </button>
        </div>
      </div>

      {/* ✅ DESKTOP VIEW (UNCHANGED DESIGN) */}
      <div className="hidden md:block space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Content preferences</h3>
          <p className="text-sm text-gray-500 mb-6">
            Control how your posts, reels and stories show up across Reparv.
          </p>

          <div className="divide-y">
            <Toggle
              label="Show posts publicly"
              desc="Let anyone on Reparv view your posts grid."
              defaultChecked
            />
            <Toggle
              label="Allow tagging"
              desc="Builders and partners can tag you in their updates."
              defaultChecked
            />
            <Toggle
              label="Allow reposts"
              desc="Let partners repost your content with attribution."
              defaultChecked
            />
            <Toggle
              label="Enable story feature"
              desc="Share quick, time-limited launch updates."
              defaultChecked
            />
            <Toggle
              label="Auto publish to community feed"
              desc="New posts automatically appear in relevant communities."
              defaultChecked={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Helpers ---------- */

function Section({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">
        {title}
      </p>
      <div className="bg-white rounded-2xl shadow-sm divide-y">
        {children}
      </div>
    </div>
  );
}

function Toggle({ label, desc, defaultChecked }) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="pr-4">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>

      <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          defaultChecked={defaultChecked}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-violet-600 transition"></div>
        <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></span>
      </label>
    </div>
  );
}