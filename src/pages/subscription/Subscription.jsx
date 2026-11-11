import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Check,
  ArrowRight,
  Loader2,
  Sparkles,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CreditCard,
  Crown,
  LayoutGrid,
  LockKeyhole,
  AlertTriangle,
} from "lucide-react";
import {
  cancelPartnerSubscription,
  fetchPartnerTrialStatus,
  isTrialPlan,
} from "../../lib/partnerSubscription";
import { getPartnerPlansLabel } from "../../lib/partnerAuth";
import { motion } from "framer-motion";
import { useAuth } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import SubscriptionPlan from "../../components/subscription/SubscriptionPlan";
import FormatPrice from "../../components/FormatPrice";

const DEFAULT_FEATURES = [
  "Leads Included",
  "Site Visits",
  "CRM & Follow-up",
  "AI Lead Filtration",
];

const TRUST_ITEMS = [
  { icon: Zap, label: "Razorpay autopay" },
  { icon: Shield, label: "Secure billing" },
  { icon: Sparkles, label: "Full platform access" },
];

function recommendedPlanIndex(plans) {
  if (!plans?.length) return -1;
  const byHighlight = plans.findIndex((p) => p?.highlight === "True");
  if (byHighlight >= 0) return byHighlight;
  const byName = plans.findIndex((p) =>
    /standard|pro|premium/i.test(String(p?.planName || "")),
  );
  if (byName >= 0) return byName;
  return Math.min(1, plans.length - 1);
}

function parseFeatures(plan) {
  if (typeof plan?.features === "string" && plan.features.trim()) {
    return plan.features
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
  }
  if (Array.isArray(plan?.features) && plan.features.length) {
    return plan.features;
  }
  return DEFAULT_FEATURES;
}

function gridClass(count) {
  if (count <= 1) return "max-w-md mx-auto grid-cols-1";
  if (count === 2) return "max-w-3xl mx-auto grid-cols-1 md:grid-cols-2";
  return "max-w-6xl mx-auto grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
}

function PlanCardSkeleton() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-7 animate-pulse min-h-[380px] flex flex-col">
      <div className="h-4 bg-gray-100 rounded w-2/3 mb-4" />
      <div className="h-10 bg-gray-100 rounded w-1/2 mb-8" />
      <div className="space-y-3 flex-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 bg-gray-50 rounded w-full" />
        ))}
      </div>
      <div className="h-11 bg-gray-100 rounded-xl mt-6" />
    </div>
  );
}

function PlanCard({
  plan,
  index,
  isRecommended,
  isCurrent,
  trialUsed,
  onSubscribe,
  onViewDetails,
}) {
  const features = parseFeatures(plan);
  const visible = features.slice(0, 5);
  const hasMore = features.length > 5;
  const trialPlan = isTrialPlan(plan);
  const trialBlocked = trialPlan && trialUsed && !isCurrent;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className={`relative flex flex-col h-full rounded-3xl bg-white transition-all duration-300 ${
        isRecommended
          ? "ring-2 ring-[#5E23DC] shadow-xl shadow-[#5E23DC]/15 scale-[1.02] z-[1]"
          : "border border-gray-200/80 shadow-sm hover:shadow-lg hover:border-[#5E23DC]/20"
      } ${isCurrent ? "ring-2 ring-emerald-400/80" : ""}`}
    >
      {isRecommended && !isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1.5 text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-md bg-gradient-to-r from-[#5E23DC] to-[#7c3aed]">
            <Sparkles size={12} />
            Most popular
          </span>
        </div>
      )}

      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1.5 text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-md bg-emerald-500">
            <Crown size={12} />
            Current plan
          </span>
        </div>
      )}

      <div className="p-7 pt-9 flex flex-col flex-1">
        <div className="mb-1">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">
            {plan?.planName}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">
            {plan?.billing_cycle
              ? `${plan.billing_cycle} billing`
              : "Partner plan"}
            {plan?.planDuration ? ` · ${plan.planDuration}` : ""}
          </p>
        </div>

        <div className="my-6 pb-6 border-b border-gray-100">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
              <FormatPrice price={plan?.totalPrice} />
            </span>
          </div>
          {(plan?.basePrice > 0 || plan?.gstAmount > 0) && (
            <p className="text-xs text-gray-500 mt-2">
              Base <FormatPrice price={plan.basePrice} /> + GST (18%){" "}
              <FormatPrice price={plan.gstAmount} />
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            per billing cycle · total incl. 18% GST
          </p>
        </div>

        <ul className="space-y-3 mb-8 flex-1">
          {visible.map((feature, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-[13px] text-gray-600"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE]">
                <Check size={12} className="text-[#5E23DC]" strokeWidth={3} />
              </span>
              <span className="leading-snug pt-0.5">{String(feature)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-2">
          {isCurrent ? (
            <button
              type="button"
              disabled
              className="w-full py-3 rounded-xl font-semibold text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
            >
              Active subscription
            </button>
          ) : trialBlocked ? (
            <button
              type="button"
              disabled
              title="Free trial already used on this account"
              className="w-full py-3 rounded-xl font-semibold text-sm bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed"
            >
              Trial already used
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSubscribe(plan)}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] ${
                isRecommended
                  ? "text-white shadow-md hover:shadow-lg bg-gradient-to-r from-[#5E23DC] to-[#7c3aed]"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {trialPlan ? "Start free trial" : "Get started"}
            </button>
          )}
          <button
            type="button"
            onClick={() => onViewDetails(plan)}
            className="w-full text-center text-sm font-medium text-[#5E23DC] py-2 hover:underline underline-offset-2"
          >
            {hasMore
              ? `View all ${features.length} features`
              : "View plan details"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function Subscription() {
  const {
    URI,
    user,
    role,
    authReady,
    setShowSubscription,
    subscription,
    subscriptionReady,
    refreshSubscription,
  } = useAuth();
  const navigate = useNavigate();
  const paywallLocked = subscriptionReady && !subscription?.active;
  const scrollRef = useRef(null);

  const partnerPlansLabel = getPartnerPlansLabel(user || role);

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState({});
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [trialStatus, setTrialStatus] = useState({
    trialUsed: false,
    trialActive: false,
    daysLeft: 0,
  });

  const activeData = subscription?.raw || subscription;
  const trialUsed = Boolean(
    trialStatus.trialUsed ||
      subscription?.trial_used ||
      activeData?.trial_used,
  );
  const isActive = Boolean(subscription?.active || activeData?.active);
  const currentPlanId = activeData?.plan_id;
  const statusLower = String(
    activeData?.status || subscription?.status || "",
  ).toLowerCase();
  const canCancel =
    Boolean(activeData?.razorpay_subscription_id) &&
    ["active", "pending", "halted"].includes(statusLower);

  const handleCancelSubscription = async (cancelAtCycleEnd) => {
    if (!user?.id) return;
    setCancelling(true);
    setCancelError("");
    try {
      const result = await cancelPartnerSubscription(URI, user, {
        cancelAtCycleEnd,
      });
      if (!result.success) {
        setCancelError(result.message || "Could not cancel subscription");
        return;
      }
      setShowCancelModal(false);
      await refreshSubscription(user, { silent: true });
    } catch {
      setCancelError("Could not cancel subscription. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const displayPlans = useMemo(() => {
    if (!trialUsed) return plans;
    return plans.filter((plan) => !isTrialPlan(plan));
  }, [plans, trialUsed]);

  const recIndex = useMemo(
    () => recommendedPlanIndex(displayPlans),
    [displayPlans],
  );

  const fetchPlans = useCallback(async () => {
    try {
      setLoadingPlans(true);
      const label = encodeURIComponent(getPartnerPlansLabel(user || role));
      const response = await fetch(
        `${URI}/api/subscription/partner-plans/${label}`,
        { method: "GET", credentials: "include" },
      );
      const data = await response.json();
      setPlans(response.ok && Array.isArray(data) ? data : []);
    } catch {
      setPlans([]);
    } finally {
      setLoadingPlans(false);
    }
  }, [URI, user, role]);

  useEffect(() => {
    if (!authReady || !user?.id) return;
    fetchPartnerTrialStatus(URI, user).then(setTrialStatus);
  }, [authReady, URI, user]);

  useEffect(() => {
    if (!authReady) return;
    fetchPlans();
    refreshSubscription(undefined, { silent: true });
  }, [authReady, fetchPlans, refreshSubscription]);

  const planTitle = activeData?.plan_name || activeData?.planName;
  const planDurationText = activeData?.planDuration;

  const goCompare = () =>
    navigate("/app/subscription/compare-plans", {
      state: { plans, mode: "compare" },
    });

  const handleSubscribe = (plan) => {
    setShowSubscription(true);
    setSelectedPlan(plan);
  };

  const handleViewDetails = (plan) => {
    navigate("/app/subscription/compare-plans", {
      state: { plans, focusPlan: plan, mode: "detail" },
    });
  };

  const scrollPlans = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#faf9fc]">
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#5E23DC]/[0.07] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#a855f7]/[0.05] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-6 md:pt-10">
        {/* Hero */}
        <header className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#5E23DC]/15 bg-white px-4 py-1.5 text-xs font-semibold text-[#5E23DC] shadow-sm mb-5"
          >
            <CreditCard size={14} />
            {partnerPlansLabel} plans
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-gray-900 tracking-tight leading-[1.15]"
          >
            Grow your business with{" "}
            <span className="bg-gradient-to-r from-[#5E23DC] to-[#a855f7] bg-clip-text text-transparent">
              Reparv
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-gray-500 text-base sm:text-lg leading-relaxed"
          >
            Pick a plan that fits your pipeline. Secure autopay via Razorpay —
            unlock dashboard, properties, enquiries, and more.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200/80 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm"
              >
                <Icon size={14} className="text-[#5E23DC]" />
                {label}
              </span>
            ))}
          </motion.div>
        </header>

        {/* Paywall notice */}
        {paywallLocked && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 max-w-xl mx-auto flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3.5 text-sm text-amber-900"
          >
            <LockKeyhole size={18} className="shrink-0 mt-0.5 text-amber-600" />
            <p className="leading-relaxed">
              Subscribe below to unlock the full partner panel. Locked pages
              show a preview until your plan is active.
            </p>
          </motion.div>
        )}

        {trialUsed && !trialStatus.trialActive && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 max-w-xl mx-auto flex items-start gap-3 rounded-2xl border border-violet-200/80 bg-violet-50/90 px-4 py-3.5 text-sm text-violet-900"
          >
            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-violet-600" />
            <p className="leading-relaxed">
              You have already used your one-time free trial. Choose a paid plan
              to continue.
            </p>
          </motion.div>
        )}

        {/* Active subscription */}
        {subscriptionReady && isActive && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 md:mb-12"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5E23DC] via-[#6d28d9] to-[#9333ea] p-[1px] shadow-xl shadow-[#5E23DC]/20">
              <div className="rounded-[23px] bg-white/95 backdrop-blur-sm overflow-hidden">
                <div className="px-6 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EDE9FE]">
                      <Crown size={22} className="text-[#5E23DC]" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#5E23DC]">
                        Your subscription
                      </p>
                      <h2 className="text-xl font-bold text-gray-900">
                        {planTitle}
                      </h2>
                      {planDurationText && (
                        <p className="text-sm text-gray-500">
                          {planDurationText}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                  </span>
                </div>
                <div className="px-6 sm:px-8 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wide">
                      Amount
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-0.5">
                      <FormatPrice
                        price={parseFloat(activeData?.amount || 0)}
                      />
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wide flex items-center gap-1">
                      <Calendar size={10} /> Started
                    </p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 leading-snug">
                      {activeData?.start_date || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wide flex items-center gap-1">
                      <Calendar size={10} /> Renews
                    </p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 leading-snug">
                      {activeData?.end_date ||
                        activeData?.next_billing_date ||
                        "—"}
                    </p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => navigate("/app/dashboard")}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#5E23DC] hover:bg-[#4c1bb5] transition"
                    >
                      Go to dashboard
                    </button>
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => {
                          setCancelError("");
                          setShowCancelModal(true);
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition"
                      >
                        Cancel subscription
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
            <div
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
              role="dialog"
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <AlertTriangle className="text-red-600" size={20} />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Cancel subscription?
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    Autopay will stop. Choose when access should end.
                  </p>
                </div>
              </div>
              {cancelError && (
                <p className="text-sm text-red-600 mb-3 rounded-lg bg-red-50 px-3 py-2">
                  {cancelError}
                </p>
              )}
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => handleCancelSubscription(true)}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#5E23DC] hover:bg-[#4c1bb5] disabled:opacity-50"
                >
                  {cancelling
                    ? "Cancelling…"
                    : "End of billing period (recommended)"}
                </button>
                <p className="text-xs text-gray-500 px-1">
                  Keep access until{" "}
                  {activeData?.end_date ||
                    activeData?.next_billing_date ||
                    "your renewal date"}
                  . No further charges.
                </p>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => handleCancelSubscription(false)}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                >
                  Cancel immediately
                </button>
                <p className="text-xs text-gray-500 px-1">
                  Ends your subscription and panel access right away.
                </p>
              </div>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setShowCancelModal(false)}
                className="w-full mt-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Keep subscription
              </button>
            </div>
          </div>
        )}

        {/* Section header */}
        {!loadingPlans && displayPlans.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 md:mb-8">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <LayoutGrid size={20} className="text-[#5E23DC]" />
                {isActive ? "Other plans" : "Available plans"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Compare features and choose what works for you
              </p>
            </div>
            <button
              type="button"
              onClick={goCompare}
              className="self-start sm:self-auto inline-flex items-center gap-2 text-sm font-semibold text-[#5E23DC] hover:text-[#4c1bb5] transition"
            >
              Compare all features
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Plans */}
        {loadingPlans ? (
          <div className={`grid gap-6 ${gridClass(3)}`}>
            {[1, 2, 3].map((i) => (
              <PlanCardSkeleton key={i} />
            ))}
          </div>
        ) : displayPlans.length === 0 ? (
          <div className="text-center py-20 px-6 max-w-md mx-auto rounded-3xl bg-white border border-gray-100 shadow-sm">
            <p className="text-gray-900 font-semibold text-lg">
              {trialUsed && plans.length > 0
                ? "Free trial already used"
                : "No plans available"}
            </p>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">
              {trialUsed && plans.length > 0
                ? "Your one-time free trial is no longer available. Choose a paid plan when your admin adds one."
                : `No active plans for ${partnerPlansLabel}. Ask your admin to add plans in Reparv Admin → Subscription Pricing.`}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile carousel */}
            <div className="lg:hidden relative -mx-4 sm:mx-0">
              <div className="flex justify-end gap-2 mb-3 px-4 sm:px-0">
                <button
                  type="button"
                  onClick={() => scrollPlans(-1)}
                  className="w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-600"
                  aria-label="Previous"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollPlans(1)}
                  className="w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-600"
                  aria-label="Next"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-4 scroll-smooth scrollbar-hide"
              >
                {displayPlans.map((plan, index) => (
                  <div
                    key={plan.id ?? index}
                    className="snap-center shrink-0 w-[min(88vw,340px)]"
                  >
                    <PlanCard
                      plan={plan}
                      index={index}
                      isRecommended={
                        plan?.highlight === "True" || index === recIndex
                      }
                      isCurrent={
                        isActive && String(plan.id) === String(currentPlanId)
                      }
                      trialUsed={trialUsed}
                      onSubscribe={handleSubscribe}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop grid */}
            <div
              className={`hidden lg:grid gap-6 ${gridClass(displayPlans.length)}`}
            >
              {displayPlans.map((plan, index) => (
                <PlanCard
                  key={plan.id ?? index}
                  plan={plan}
                  index={index}
                  isRecommended={
                    plan?.highlight === "True" || index === recIndex
                  }
                  isCurrent={
                    isActive && String(plan.id) === String(currentPlanId)
                  }
                  trialUsed={trialUsed}
                  onSubscribe={handleSubscribe}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </>
        )}

        {/* Bottom CTA */}
        {!loadingPlans && displayPlans.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-gray-500 mb-4">
              Not sure which plan fits?
            </p>
            <button
              type="button"
              onClick={goCompare}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold border-2 border-[#5E23DC]/30 text-[#5E23DC] bg-white hover:bg-[#faf8ff] transition shadow-sm"
            >
              Open feature comparison
              <ArrowRight size={18} />
            </button>
          </motion.div>
        )}
      </div>

      <SubscriptionPlan plan={selectedPlan} trialUsed={trialUsed} />
    </div>
  );
}
