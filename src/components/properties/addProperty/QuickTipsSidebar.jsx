import { FaLightbulb, FaLock } from "react-icons/fa";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";

const GRAD = "linear-gradient(94.94deg,#5E23DC -8.34%,#8B5CF6 97.17%)";

/**
 * QuickTipsSidebar
 * Sticky left panel shown on md+ screens.
 * Matches old design: tips, security badge, "Need Help?" CTA.
 */
export default function QuickTipsSidebar() {
  return (
    <aside className="hidden md:block w-full md:w-[38%] lg:w-[32%] xl:w-[28%] flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm lg:sticky lg:top-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
            <FaLightbulb style={{ color: "#5323DC" }} size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Quick Tips</h3>
            <p className="text-xs text-gray-400">Get the best value for your property</p>
          </div>
        </div>

        {/* Tips */}
        <ul className="space-y-3">
          {[
            "Add high-quality photos to get 3x more inquiries",
            "Accurate details help buyers find your property faster",
            "Verified listings get 5x more visibility",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-500">
              <IoCheckmarkDoneCircleSharp size={18} className="flex-shrink-0 mt-0.5" style={{ color: "#5323DC" }} />
              {tip}
            </li>
          ))}
        </ul>

        <div className="h-px bg-gray-100 my-5" />

        {/* Security badge */}
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <FaLock style={{ color: "#5323DC" }} size={13} />
          100% Secure & Private
        </div>

        {/* Need Help CTA */}
        <div className="mt-5 rounded-2xl p-4 border border-violet-100" style={{ background: "linear-gradient(135deg,#f5f3ff,#ede9fe)" }}>
          <h4 className="font-bold text-gray-900 text-sm">Need Help?</h4>
          <p className="text-xs text-gray-500 mt-1 mb-3">
            Our property experts are here to assist you
          </p>
          <button
            type="button"
            onClick={() => { window.location.href = "tel:+918010881965"; }}
            className="w-full h-9 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 active:scale-95 transition-all"
            style={{ background: GRAD }}
          >
            Talk to Expert
          </button>
        </div>
      </div>
    </aside>
  );
}