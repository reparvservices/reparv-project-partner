import { useState } from "react";
import { FiCheck } from "react-icons/fi";

export default function BusinessCategory() {
  const tags = [
    "Builder",
    "Sales Partner",
    "Channel Partner",
    "Agency",
    "Territory Partner",
    "Consultant",
    "Developer",
  ];

  const [selected, setSelected] = useState(["Builder", "Agency"]);

  function toggle(tag) {
    setSelected((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  }

  return (
    <>
      {/* ✅ MOBILE VIEW */}
      <div className="md:hidden min-h-screen bg-white px-5 pt-6 pb-28">
        <h2 className="text-xl font-semibold mb-2">
          What describes your business best?
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          Select all categories that apply to your real estate business. This
          helps us match you with the right opportunities.
        </p>

        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => {
            const active = selected.includes(tag);

            return (
              <button
                key={tag}
                onClick={() => toggle(tag)}
                className={`px-5 py-2 rounded-xl border text-sm font-medium flex items-center gap-2 transition ${
                  active
                    ? "bg-violet-600 text-white border-violet-600 shadow"
                    : "bg-white border-gray-200"
                }`}
              >
                {tag}
                {active && <FiCheck className="text-white text-sm" />}
              </button>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button className="w-full bg-violet-600 text-white py-3 rounded-xl font-medium shadow">
            Save Categories
          </button>
        </div>
      </div>

      {/* ✅ DESKTOP VIEW (UNCHANGED STYLE) */}
      <div className="hidden md:block bg-white rounded-2xl p-5 shadow-sm space-y-3">
        <div>
          <h3 className="font-semibold">Business category</h3>
          <p className="text-xs text-[#9CA3AF]">
            Choose how other partners discover you on Reparv.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const active = selected.includes(tag);

            return (
              <button
                key={tag}
                onClick={() => toggle(tag)}
                className={`px-3 py-1.5 rounded-full border text-xs transition ${
                  active
                    ? "bg-violet-100 border-violet-500 text-violet-600"
                    : "hover:bg-violet-50 hover:border-violet-500"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}