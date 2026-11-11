import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, ChevronDown, Sparkles } from "lucide-react";
import { useAuth } from "../../store/auth";
import SubscriptionPlan from "../../components/subscription/SubscriptionPlan";
import { getPartnerPlansLabel } from "../../lib/partnerAuth";
import FormatPrice from "../../components/FormatPrice";
import {
  parsePlanFeatures,
  planIncludesFeature,
  collectFeatureNames,
  findPlanByRef,
} from "../../lib/subscriptionPlans";

const PRIMARY = "#5E23DC";

function Cell({ included }) {
  return included ? (
    <Check size={18} className="text-[#5E23DC] mx-auto" strokeWidth={2.5} />
  ) : (
    <X size={18} className="text-gray-300 mx-auto" />
  );
}

function PlanSelector({ label, plans, selectedName, onChange }) {
  const [open, setOpen] = useState(false);
  const current =
    plans.find((p) => p.planName === selectedName) || plans[0] || null;

  if (!current) return null;

  return (
    <div className="relative">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
        {label}
      </p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-left"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 leading-tight truncate">
            {current.planName}
          </p>
          <p className="text-[11px] text-[#5E23DC] font-medium">
            <FormatPrice price={current.totalPrice} /> • {current.planDuration}
          </p>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
          {plans.map((plan) => (
            <button
              key={plan.id ?? plan.planName}
              type="button"
              onClick={() => {
                onChange(plan.planName);
                setOpen(false);
              }}
              className={`w-full px-3 py-2.5 text-left hover:bg-purple-50 transition ${
                plan.planName === selectedName ? "bg-purple-50" : ""
              }`}
            >
              <p className="text-sm font-semibold text-gray-800">{plan.planName}</p>
              <p className="text-[11px] text-[#5E23DC]">
                <FormatPrice price={plan.totalPrice} /> • {plan.planDuration}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanDetailView({ plan, onSubscribe, onCompare }) {
  const features = parsePlanFeatures(plan);

  return (
    <div className="px-4 py-6 max-w-lg mx-auto space-y-5 pb-28">
      <div className="rounded-2xl border border-[#5E23DC]/20 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5E23DC]">
              Plan details
            </p>
            <h2 className="text-xl font-bold text-gray-900 mt-1">{plan.planName}</h2>
          </div>
          <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full text-white bg-[#5E23DC]">
            {plan.planDuration}
          </span>
        </div>

        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-3xl font-extrabold text-gray-900">
            <FormatPrice price={plan.totalPrice} />
          </span>
          <span className="text-gray-400 text-sm">/plan</span>
        </div>
        {plan.billing_cycle && (
          <p className="text-xs text-gray-500 capitalize mb-5">
            Billed {plan.billing_cycle}
          </p>
        )}

        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-[#5E23DC]" />
          Included features ({features.length})
        </h3>

        {features.length === 0 ? (
          <p className="text-sm text-gray-500 rounded-xl bg-gray-50 px-4 py-6 text-center">
            No features linked to this plan yet. Contact support or choose another plan.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 text-sm text-gray-700 rounded-xl bg-[#f6f4fb] px-3 py-2.5"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE] mt-0.5">
                  <Check size={12} className="text-[#5E23DC]" strokeWidth={3} />
                </span>
                <span className="leading-snug">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => onSubscribe(plan)}
          className="w-full mt-6 py-3 rounded-xl font-semibold text-sm text-white shadow-md hover:opacity-95 transition"
          style={{
            background: `linear-gradient(135deg, ${PRIMARY}, #7c3aed)`,
          }}
        >
          Subscribe to {plan.planName}
        </button>
      </div>

      {onCompare && (
        <button
          type="button"
          onClick={onCompare}
          className="w-full text-center text-sm font-semibold text-[#5E23DC] hover:underline"
        >
          Compare with other plans →
        </button>
      )}
    </div>
  );
}

export default function ComparePlans() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { showSubscription, setShowSubscription, URI, user, role } = useAuth();

  const partnerLabel = getPartnerPlansLabel(user || role);

  const initialMode = state?.mode === "compare" ? "compare" : "detail";
  const [mode, setMode] = useState(initialMode);
  const [plans, setPlans] = useState(state?.plans || []);
  const [planA, setPlanA] = useState("");
  const [planB, setPlanB] = useState("");
  const [selectedPlan, setSelectedPlan] = useState({});
  const [detailPlan, setDetailPlan] = useState(() =>
    findPlanByRef(state?.plans || [], state?.focusPlan),
  );

  useEffect(() => {
    if (plans.length) return;
    let cancelled = false;
    (async () => {
      try {
        const label = encodeURIComponent(partnerLabel);
        const res = await fetch(`${URI}/api/subscription/partner-plans/${label}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!cancelled && res.ok && Array.isArray(data)) setPlans(data);
      } catch {
        if (!cancelled) setPlans([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [URI, partnerLabel, plans.length]);

  useEffect(() => {
    if (!plans.length) return;
    const focus = findPlanByRef(plans, state?.focusPlan);
    if (focus) setDetailPlan(focus);

    setPlanA((cur) =>
      cur && plans.some((p) => p.planName === cur)
        ? cur
        : focus?.planName || plans[0].planName,
    );
    setPlanB((cur) => {
      const others = plans.filter((p) => p.planName !== (focus?.planName || plans[0].planName));
      const fallback = others[0]?.planName || plans[1]?.planName || plans[0].planName;
      return cur && plans.some((p) => p.planName === cur) ? cur : fallback;
    });
  }, [plans, state?.focusPlan]);

  const planAObj = plans.find((p) => p.planName === planA);
  const planBObj = plans.find((p) => p.planName === planB);
  const compareFeatures = useMemo(() => collectFeatureNames(plans), [plans]);

  const headerTitle = mode === "detail" ? detailPlan?.planName || "Plan details" : "Compare plans";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6f4fb] to-white">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <div className="flex-1 text-center min-w-0 px-2">
            <h1 className="text-base font-bold text-gray-900 truncate">{headerTitle}</h1>
            {mode === "detail" && (
              <p className="text-[11px] text-gray-500 mt-0.5">Features included in this plan</p>
            )}
          </div>
          <div className="w-9" />
        </div>

        {mode === "compare" && plans.length >= 2 && (
          <div className="px-4 pb-4 grid grid-cols-2 gap-3">
            <PlanSelector
              label="Plan A"
              plans={plans}
              selectedName={planA}
              onChange={setPlanA}
            />
            <PlanSelector
              label="Plan B"
              plans={plans}
              selectedName={planB}
              onChange={setPlanB}
            />
          </div>
        )}
      </div>

      {mode === "detail" && detailPlan ? (
        <PlanDetailView
          plan={detailPlan}
          onSubscribe={(plan) => {
            setSelectedPlan(plan);
            setShowSubscription(true);
          }}
          onCompare={
            plans.length >= 2
              ? () => {
                  setMode("compare");
                  setPlanA(detailPlan.planName);
                  const other = plans.find((p) => p.planName !== detailPlan.planName);
                  if (other) setPlanB(other.planName);
                }
              : null
          }
        />
      ) : mode === "detail" ? (
        <p className="text-center text-sm text-gray-500 py-16">Plan not found.</p>
      ) : (
        <div className="px-4 py-6 pb-28 max-w-3xl mx-auto">
          {compareFeatures.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-12">
              No features configured for these plans yet.
            </p>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="grid grid-cols-[1fr_72px_72px] gap-0 bg-gray-50 border-b border-gray-100 px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                <span>Feature</span>
                <span className="text-center truncate px-1">{planAObj?.planName || "A"}</span>
                <span className="text-center truncate px-1">{planBObj?.planName || "B"}</span>
              </div>
              {compareFeatures.map((feature, ri) => (
                <div
                  key={feature}
                  className={`grid grid-cols-[1fr_72px_72px] items-center px-4 py-3 ${
                    ri !== compareFeatures.length - 1 ? "border-b border-gray-50" : ""
                  }`}
                >
                  <p className="text-sm text-gray-700 leading-snug pr-2">{feature}</p>
                  <Cell included={planIncludesFeature(planAObj, feature)} />
                  <Cell included={planIncludesFeature(planBObj, feature)} />
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                if (planAObj) {
                  setSelectedPlan(planAObj);
                  setShowSubscription(true);
                }
              }}
              className="py-3 rounded-xl border-2 border-[#5E23DC] text-[#5E23DC] font-semibold text-sm hover:bg-purple-50 transition"
            >
              Get {planAObj?.planName || "Plan A"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (planBObj) {
                  setSelectedPlan(planBObj);
                  setShowSubscription(true);
                }
              }}
              className="py-3 rounded-xl bg-[#5E23DC] text-white font-semibold text-sm hover:opacity-95 transition shadow-md"
            >
              Get {planBObj?.planName || "Plan B"}
            </button>
          </div>
        </div>
      )}

      <SubscriptionPlan
        showModal={showSubscription}
        setShowModal={setShowSubscription}
        plan={selectedPlan}
      />
    </div>
  );
}
