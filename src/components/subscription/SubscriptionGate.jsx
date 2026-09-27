import { useNavigate } from "react-router-dom";
import { Lock, Crown } from "lucide-react";

const PRIMARY = "#5E23DC";

/**
 * Blurs page content and shows an in-app unlock overlay (CropGen-style).
 * Use inside Layout when the partner has no active subscription.
 */
export default function SubscriptionGate({
  children,
  title = "this feature",
  className = "",
  reason = "subscribe", // "subscribe" = no active plan, "upgrade" = plan lacks the feature
  feature = "",
}) {
  const isUpgrade = reason === "upgrade";
  const navigate = useNavigate();

  return (
    <div className={`relative ${className}`}>
      <div
        className="blur-[6px] opacity-60 pointer-events-none select-none saturate-[0.85]"
        aria-hidden
      >
        {children}
      </div>

      {/* Pin overlay to viewport height so the card centers on screen, not on tall page content */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center p-4 sm:p-8 min-h-[calc(100dvh-5.75rem)] md:min-h-[calc(100dvh-2rem)] bg-white/40 backdrop-blur-[2px]">
        <div className="w-full max-w-md rounded-2xl border border-white/80 bg-white/95 shadow-2xl shadow-[#5E23DC]/15 px-6 py-8 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY}, #7c3aed)`,
            }}
          >
            <Lock size={24} strokeWidth={2.5} />
          </div>

          <span
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-3"
            style={{ color: PRIMARY, backgroundColor: "rgba(94,35,220,0.1)" }}
          >
            <Crown size={12} />
            Premium
          </span>

          <h2 className="text-lg font-bold text-gray-900 leading-snug">
            {isUpgrade ? `Upgrade to unlock ${title}` : `Subscribe to unlock ${title}`}
          </h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            {isUpgrade
              ? `Your current plan doesn't include ${feature ? `"${feature}"` : "this feature"}. Choose a plan that includes it.`
              : `Choose a plan${feature ? ` with "${feature}"` : ""} to use this part of the partner panel.`}
          </p>

          <button
            type="button"
            onClick={() => navigate("/app/subscription")}
            className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-md transition hover:opacity-95 active:scale-[0.98] w-full sm:w-auto"
            style={{
              background: `linear-gradient(135deg, ${PRIMARY}, #7c3aed)`,
            }}
          >
            <Crown size={16} />
            {isUpgrade ? "Upgrade plan" : "Subscribe to unlock"}
          </button>
        </div>
      </div>
    </div>
  );
}
