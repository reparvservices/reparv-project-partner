import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  CheckCircle2,
  CreditCard,
  Loader2,
  Shield,
  Lock,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../store/auth";
import FormatPrice from "../FormatPrice";
import {
  loadRazorpayScript,
  createPartnerSubscriptionSession,
  openRazorpaySubscriptionCheckout,
  confirmPartnerSubscription,
} from "../../utils/subscriptionAutopay.js";
import {
  activatePartnerTrial,
  isTrialPlan,
} from "../../lib/partnerSubscription.js";
import { getSubscriptionSlugForUser } from "../../lib/partnerAuth.js";

export default function SubscriptionPlan({ plan, trialUsed = false }) {
  const {
    URI,
    user,
    showSubscription,
    setShowSubscription,
    refreshSubscription,
  } = useAuth();
  const navigate = useNavigate();
  const [isPaying, setIsPaying] = useState(false);
  const [showTrialConfirm, setShowTrialConfirm] = useState(false);

  const features =
    typeof plan?.features === "string"
      ? plan.features.split(",").map((f) => f.trim()).filter(Boolean)
      : Array.isArray(plan?.features)
        ? plan.features
        : [];

  const trial = isTrialPlan(plan);

  const handleClose = () => {
    setShowTrialConfirm(false);
    setShowSubscription(false);
  };

  const validateCheckout = () => {
    if (!user?.id) {
      alert("Please log in again to subscribe.");
      return null;
    }
    if (!plan?.id) {
      alert("Invalid plan. Refresh the page and try again.");
      return null;
    }
    const planId = Number(plan.id);
    const userId = Number(user.id);
    if (!Number.isFinite(planId) || planId <= 0) {
      alert("Invalid plan. Refresh the page and try again.");
      return null;
    }
    if (!Number.isFinite(userId) || userId <= 0) {
      alert("Invalid user session. Please log in again.");
      return null;
    }
    return {
      roleSlug: getSubscriptionSlugForUser(user),
      planId,
      userId,
      total: Math.max(0, Number(plan.totalPrice) || 0),
    };
  };

  const handlePayNow = async () => {
    const ctx = validateCheckout();
    if (!ctx) return;

    if (trial) {
      if (trialUsed) {
        alert(
          "Free trial has already been used on this account. Please choose a paid plan.",
        );
        return;
      }
      setShowTrialConfirm(true);
      return;
    }

    const { roleSlug, planId, userId, total } = ctx;

    setIsPaying(true);
    try {

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Failed to load Razorpay. Check your network.");
        return;
      }

      const session = await createPartnerSubscriptionSession({
        api: URI,
        role: roleSlug,
        userId,
        planId,
        discountAmount: 0,
        finalAmount: total,
      });

      const keyId = session.key || import.meta.env.VITE_RAZORPAY_KEY_ID || "";
      if (!keyId) {
        throw new Error("Missing Razorpay key. Set VITE_RAZORPAY_KEY_ID in .env");
      }

      const response = await openRazorpaySubscriptionCheckout({
        keyId,
        subscriptionId: session.razorpay_subscription_id,
        name: "Reparv",
        description: `${plan.planName || "Partner"} — autopay`,
        email: user?.email,
        contact: user?.contact,
      });

      await confirmPartnerSubscription({
        api: URI,
        role: roleSlug,
        userId,
        planId,
        paymentId: response.razorpay_payment_id,
        subscriptionId: response.razorpay_subscription_id,
        signature: response.razorpay_signature,
        email: user?.email,
        discountAmount: 0,
        finalAmount: total,
      });

      setShowSubscription(false);
      await refreshSubscription();
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.message || err?.error?.description || "Payment failed";
      if (msg !== "Checkout closed") {
        console.error(err);
        alert(msg);
      }
    } finally {
      setIsPaying(false);
    }
  };

  const handleConfirmTrial = async () => {
    const ctx = validateCheckout();
    if (!ctx) return;

    setIsPaying(true);
    try {
      const result = await activatePartnerTrial(URI, user, {
        planId: ctx.planId,
      });
      if (!result.success) {
        throw new Error(result.message || "Could not start trial");
      }
      setShowTrialConfirm(false);
      setShowSubscription(false);
      const status = await refreshSubscription(user, { silent: true });
      if (!status?.active) {
        alert(
          result.message ||
            "Trial started. Refresh the page if the dashboard is still locked.",
        );
      }
      navigate("/app/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.message || "Could not start trial";
      console.error(err);
      alert(msg);
    } finally {
      setIsPaying(false);
    }
  };

  if (!showSubscription) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-[#1a1033]/50 backdrop-blur-md cursor-pointer"
        onClick={handleClose}
        aria-hidden
      />

      <div className="fixed inset-0 z-[61] flex items-end md:items-center justify-center p-0 md:p-6 pointer-events-none">
        <div
          className="pointer-events-auto w-full md:max-w-[480px] max-h-[92dvh] flex flex-col bg-white md:rounded-3xl rounded-t-3xl shadow-2xl shadow-[#5E23DC]/20 overflow-hidden border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
            <span className="h-1 w-10 rounded-full bg-gray-200" aria-hidden />
          </div>

          <div
            className="relative shrink-0 px-6 pt-7 pb-6 text-white overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #5E23DC 0%, #7c3aed 50%, #a855f7 100%)",
            }}
          >
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 mb-2">
              {trial ? "Free trial" : "Secure checkout"}
            </p>
            <h2 className="relative text-2xl font-bold tracking-tight pr-10">
              {plan?.planName}
            </h2>
            <div className="relative mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full">
                {plan?.planDuration}
              </span>
              {!trial && plan?.billing_cycle && (
                <span className="text-xs font-medium bg-white/10 px-3 py-1 rounded-full capitalize">
                  {plan.billing_cycle} billing
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 min-h-0">
            {features.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Included in this plan
                </p>
                <ul className="space-y-2.5">
                  {features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-gray-700"
                    >
                      <CheckCircle2
                        size={16}
                        className="text-[#5E23DC] mt-0.5 shrink-0"
                      />
                      <span className="leading-snug">{String(feature).trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-2xl bg-gradient-to-br from-[#f8f6ff] to-[#f3efff] border border-[#5E23DC]/10 p-4 space-y-2">
              {(plan?.basePrice > 0 || plan?.gstAmount > 0) && (
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Base price</span>
                  <span>
                    <FormatPrice price={plan.basePrice || Math.round((plan?.totalPrice || 0) / 1.18)} />
                  </span>
                </div>
              )}
              {(plan?.gstAmount > 0 || plan?.basePrice > 0) && (
                <div className="flex justify-between text-xs text-gray-600">
                  <span>GST (18%)</span>
                  <span>
                    <FormatPrice
                      price={
                        plan.gstAmount ||
                        (plan?.totalPrice || 0) - Math.round((plan?.totalPrice || 0) / 1.18)
                      }
                    />
                  </span>
                </div>
              )}
              <div className="flex justify-between items-end gap-4 pt-1 border-t border-[#5E23DC]/10">
                <div>
                  <p className="text-xs text-gray-500">Total due today</p>
                  <p className="text-3xl font-extrabold text-gray-900 tracking-tight mt-0.5">
                    <FormatPrice price={plan?.totalPrice} />
                  </p>
                </div>
                <p className="text-[11px] text-gray-500 text-right max-w-[140px] leading-snug">
                  {isTrialPlan(plan)
                    ? "No payment required — instant access"
                    : "Recurring via Razorpay autopay per your plan cycle"}
                </p>
              </div>
            </div>
          </div>

          <div className="shrink-0 px-6 pb-6 pt-2 border-t border-gray-100 bg-white">
            <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400 mb-3">
              <span className="inline-flex items-center gap-1">
                <Shield size={12} /> PCI secure
              </span>
              <span className="inline-flex items-center gap-1">
                <Lock size={12} /> Encrypted
              </span>
            </div>
            <button
              type="button"
              onClick={handlePayNow}
              disabled={isPaying}
              className="w-full py-3.5 rounded-xl text-white text-sm font-semibold transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#5E23DC]/25"
              style={{
                background: "linear-gradient(135deg, #5E23DC 0%, #7c3aed 100%)",
              }}
            >
              {isPaying ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isTrialPlan(plan) ? "Starting trial…" : "Opening Razorpay…"}
                </>
              ) : isTrialPlan(plan) ? (
                <>Start free trial</>
              ) : (
                <>
                  <CreditCard size={18} />
                  Continue to payment
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full mt-2 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {showTrialConfirm && trial && (
        <div
          className="fixed inset-0 z-[62] flex items-center justify-center p-4 bg-[#1a1033]/60 backdrop-blur-sm cursor-pointer"
          onClick={() => !isPaying && setShowTrialConfirm(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-2xl shadow-[#5E23DC]/20 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, #5E23DC 0%, #7c3aed 100%)",
                }}
              >
                <Sparkles size={20} className="text-white" />
              </span>
              <div>
                <h3
                  id="trial-confirm-title"
                  className="text-lg font-bold text-gray-900"
                >
                  Start free trial?
                </h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  You are about to activate{" "}
                  <span className="font-medium text-gray-800">
                    {plan?.planName}
                  </span>{" "}
                  for{" "}
                  <span className="font-medium text-gray-800">
                    {plan?.planDuration || "the trial period"}
                  </span>
                  . No payment is required.
                </p>
              </div>
            </div>

            <ul className="text-xs text-gray-600 space-y-1.5 mb-5 rounded-xl bg-[#f8f6ff] border border-[#5E23DC]/10 px-4 py-3">
              <li>• Full access starts immediately after you confirm</li>
              <li>• Free trial can only be used once per account</li>
              <li>• You can upgrade to a paid plan anytime later</li>
            </ul>

            <button
              type="button"
              disabled={isPaying}
              onClick={handleConfirmTrial}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #5E23DC 0%, #7c3aed 100%)",
              }}
            >
              {isPaying ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Starting trial…
                </>
              ) : (
                "Yes, start my free trial"
              )}
            </button>
            <button
              type="button"
              disabled={isPaying}
              onClick={() => setShowTrialConfirm(false)}
              className="w-full mt-2 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 cursor-pointer"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
