import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Check,
  Sparkles,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  Crown,
  BadgeCheck,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { usePartnerJoin } from "../../context/PartnerJoinContext";
import { planIcons } from "../../utils";
import { isTrialPlan } from "../../lib/partnerSubscription";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_FEATURES = [
  "Leads Included",
  "Site Visits",
  "CRM & Follow-up",
  "AI Lead Filtration",
];

const TRUST_ITEMS = [
  { icon: Zap,      label: "Razorpay autopay" },
  { icon: Shield,   label: "Secure billing" },
  { icon: Sparkles, label: "Full platform access" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseFeatures(plan) {
  if (typeof plan?.features === "string" && plan.features.trim()) {
    return plan.features.split(",").map((f) => f.trim()).filter(Boolean);
  }
  if (Array.isArray(plan?.features) && plan.features.length) return plan.features;
  return DEFAULT_FEATURES;
}

function recommendedPlanIndex(plans) {
  if (!plans?.length) return -1;
  const idx = plans.findIndex((p) => p?.mostPopular === true);
  return idx >= 0 ? idx : Math.min(1, plans.length - 1);
}

function gridClass(count) {
  if (count <= 1) return "max-w-md mx-auto grid-cols-1";
  if (count === 2) return "max-w-3xl mx-auto grid-cols-1 md:grid-cols-2";
  return "max-w-6xl mx-auto grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

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

// ─── Flippable Plan Card ──────────────────────────────────────────────────────

function PlanCard({ plan, index, isRecommended }) {
  const [flipped, setFlipped] = useState(false);
  const features   = parseFeatures(plan);
  const PREVIEW    = 4;
  const visible    = features.slice(0, PREVIEW);
  const extraCount = features.length - PREVIEW;

  const accentGradient = plan.isTrial
    ? "linear-gradient(135deg,#059669 0%,#10b981 100%)"
    : "linear-gradient(135deg,#5E23DC 0%,#7c3aed 100%)";

  const accentColor = plan.isTrial ? "#059669" : "#5E23DC";
  const accentBg    = plan.isTrial ? "#dcfce7"  : "#ede9fe";

  return (
    <>
      <style>{`
        .plan-flip-scene {
          perspective: 1200px;
          /* explicit height so children can resolve height:100% */
          height: 460px;
        }
        @media (max-width: 640px) {
          .plan-flip-scene { height: 440px; }
        }
        .plan-flip-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.65s cubic-bezier(0.4,0.2,0.2,1);
          transform-style: preserve-3d;
        }
        .plan-flip-inner.is-flipped {
          transform: rotateY(180deg);
        }
        .plan-flip-front,
        .plan-flip-back {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 24px;
          overflow: hidden;
        }
        .plan-flip-back {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Outer wrapper — explicit height so flip inner resolves correctly */}
      <div
        className={`plan-flip-scene relative ${
          isRecommended ? "scale-[1.02] z-[1]" : ""
        }`}
        style={{
          animation: "ps-fadeUp 0.4s ease both",
          animationDelay: `${index * 70}ms`,
        }}
      >
        {/* Badge — outside the flip so it stays visible on both sides */}
        {isRecommended && !plan.isTrial && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-md bg-gradient-to-r from-[#5E23DC] to-[#7c3aed]">
              <Sparkles size={12} /> Most popular
            </span>
          </div>
        )}
        {plan.isTrial && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow-md bg-emerald-500">
              <Crown size={12} /> Free trial
            </span>
          </div>
        )}

        <div className={`plan-flip-inner ${flipped ? "is-flipped" : ""}`}>

          {/* ─────────────── FRONT ─────────────── */}
          <div
            className={`plan-flip-front flex flex-col bg-white ${
              isRecommended
                ? "ring-2 ring-[#5E23DC] shadow-xl shadow-[#5E23DC]/15"
                : "border border-gray-200/80 shadow-sm"
            }`}
          >
            <div className="p-7 pt-9 flex flex-col flex-1">
              {/* Identity */}
              <div className="flex items-center gap-2 mb-1">
                {plan.icons && (
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
                    style={{ background: plan.iconBg }}
                  >
                    {plan.icons}
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-gray-400 capitalize">{plan.description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="my-5 pb-5 border-b border-gray-100">
                <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  {plan.isTrial
                    ? "Free"
                    : `₹${Number(plan.totalPrice).toLocaleString("en-IN")}`}
                </span>
                {!plan.isTrial && (
                  <p className="text-xs text-gray-400 mt-1">
                    per billing cycle · incl. 18% GST
                  </p>
                )}
              </div>

              {/* Preview features */}
              <ul className="space-y-3 flex-1">
                {visible.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] text-gray-600">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EDE9FE]">
                      <Check size={12} className="text-[#5E23DC]" strokeWidth={3} />
                    </span>
                    <span className="leading-snug pt-0.5">{String(feature)}</span>
                  </li>
                ))}
              </ul>

              {/* Flip trigger */}
              {extraCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFlipped(true)}
                  className="mt-5 flex items-center gap-1.5 text-[13px] font-semibold group transition-colors w-fit cursor-pointer"
                  style={{ color: accentColor }}
                >
                  <span className="underline underline-offset-2 group-hover:no-underline">
                    View all {features.length} features
                  </span>
                  <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                </button>
              )}
            </div>
          </div>

          {/* ─────────────── BACK ─────────────── */}
          <div className="plan-flip-back flex flex-col" style={{ background: "#fff" }}>
            {/* Gradient header strip */}
            <div
              className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{ background: accentGradient }}
            >
              <div className="flex items-center gap-2 min-w-0">
                {plan.icons && (
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    {plan.icons}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate leading-tight">{plan.name}</p>
                  <p className="text-white/60 text-[11px] capitalize">{plan.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-white font-extrabold text-lg leading-none">
                  {plan.isTrial ? "Free" : `₹${Number(plan.totalPrice).toLocaleString("en-IN")}`}
                </span>
                {/* Flip back button */}
                <button
                  type="button"
                  onClick={() => setFlipped(false)}
                  aria-label="Flip back"
                  style={{
                    width: "30px", height: "30px", borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)", border: "none",
                    cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "center", color: "#fff", flexShrink: 0,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.35)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* All features — scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-4"
                style={{ color: "#9ca3af" }}
              >
                All {features.length} Features Included
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {features.map((feature, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: "10px",
                      fontSize: "13px", color: "#374151", lineHeight: "1.5",
                      /* stagger only plays when card is flipped */
                      animation: flipped ? "ps-itemIn 0.3s ease both" : "none",
                      animationDelay: flipped ? `${i * 28}ms` : "0ms",
                    }}
                  >
                    <span style={{
                      flexShrink: 0, width: "19px", height: "19px", borderRadius: "50%",
                      background: accentBg, display: "flex", alignItems: "center",
                      justifyContent: "center", marginTop: "2px",
                    }}>
                      <BadgeCheck size={11} style={{ color: accentColor }} strokeWidth={2.5} />
                    </span>
                    <span>{String(feature)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Back footer hint */}
            <div className="px-6 py-3 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => setFlipped(false)}
                className="text-[12px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                style={{ color: accentColor }}
              >
                ← Back to plan overview
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export default function PricingSection() {
  const { URI }  = useAuth();
  const navigate = useNavigate();
  const { openJoinModal } = usePartnerJoin();

  const [plans,       setPlans]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res  = await axios.get(
        `${URI}/api/subscription/partner-plans/${encodeURIComponent("Project Partner")}`,
      );
      const rows = Array.isArray(res.data) ? res.data : [];

      const formatted = rows.map((item, index) => {
        const isTrial = isTrialPlan({
          ...item,
          planName: item.planName,
          totalPrice: item.totalPrice,
        });
        const features = item.features
          ? item.features.split(",").map((f) => f.trim())
          : DEFAULT_FEATURES;

        return {
          id:          item.id,
          plan_type:   item.plan_type || item.planType,
          isTrial,
          name:        item.planName,
          description: item.planDuration || "",
          totalPrice:  isTrial ? "0" : `${item.totalPrice}`,
          billPrice:   isTrial ? "0" : `${item.totalPrice}`,
          basePrice:   item.basePrice,
          gstAmount:   item.gstAmount,
          features,
          mostPopular: item.highlight === "True",
          iconBg: index % 2 === 1
            ? "linear-gradient(135deg,#5E23DC 0%,#854DFB 100%)"
            : "linear-gradient(135deg,#AD46FF 0%,#9810FA 100%)",
          icons: planIcons[item.planDuration] || (
            <svg width="20" height="20" fill="none">
              <circle cx="10" cy="10" r="7.5" stroke="white" strokeWidth="2" />
            </svg>
          ),
        };
      });

      const trialPlans   = formatted.filter((p) => p.isTrial);
      const popularPlans = formatted.filter((p) => p.mostPopular && !p.isTrial);
      const rest         = formatted.filter((p) => !p.isTrial && !p.mostPopular);
      setPlans([...trialPlans, ...popularPlans, ...rest]);
    } catch (err) {
      console.error(err);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const scrollPlans = (dir) => {
    const el = sliderRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.88, behavior: "smooth" });
  };

  const recIndex = recommendedPlanIndex(plans);

  return (
    <>
      <style>{`
        @keyframes ps-fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes ps-itemIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <section
        id="pricing"
        className="relative w-full bg-[#faf9fc] py-10 sm:py-20 px-4 overflow-hidden"
      >
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#5E23DC]/[0.07] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-[#a855f7]/[0.05] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto">

          {/* Header */}
          <div className="sm:text-center max-w-2xl mx-auto mb-4 md:mb-14">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#5E23DC]/15 bg-white px-4 py-1.5 text-xs font-semibold text-[#5E23DC] shadow-sm mb-5">
              Project Partner Plans
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A]">
              Project Partner Plans
            </h2>
            <p className="mt-3 text-gray-500 text-base sm:text-lg leading-relaxed">
              Flexible pricing designed to scale with your business
            </p>
            <div className="mt-6 flex flex-wrap items-center sm:justify-center gap-2 sm:gap-3">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200/80 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm"
                >
                  <Icon size={14} className="text-[#5E23DC]" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Mobile carousel ── */}
          <div className="lg:hidden relative -mx-4 sm:mx-0">
            <div className="flex justify-end gap-2 px-4 sm:px-0">
              <button type="button" onClick={() => scrollPlans(-1)} aria-label="Previous plan"
                className="w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-600">
                <ChevronLeft size={18} />
              </button>
              <button type="button" onClick={() => scrollPlans(1)} aria-label="Next plan"
                className="w-9 h-9 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-600">
                <ChevronRight size={18} />
              </button>
            </div>
            <div
              ref={sliderRef}
              className="flex items-stretch gap-4 overflow-x-auto snap-x snap-mandatory pb-4 px-4 pt-6 scroll-smooth scrollbar-hide"
              onScroll={(e) => {
                const idx = Math.round(e.target.scrollLeft / (e.target.clientWidth * 0.88));
                setActiveIndex(idx);
              }}
            >
              {loading
                ? [1, 2, 3].map((i) => (
                    <div key={i} className="snap-center shrink-0 w-[min(88vw,340px)]">
                      <PlanCardSkeleton />
                    </div>
                  ))
                : plans.map((plan, index) => (
                    <div key={plan.id ?? index} className="snap-center shrink-0 w-[min(88vw,340px)] h-full">
                      <PlanCard
                        plan={plan}
                        index={index}
                        isRecommended={plan.mostPopular || index === recIndex}
                      />
                    </div>
                  ))}
            </div>
            {!loading && plans.length > 1 && (
              <div className="flex justify-center gap-2 mt-3">
                {plans.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 rounded-full transition-all ${i === activeIndex ? "bg-[#5E23DC] w-6" : "bg-[#D6C8FA] w-2"}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Desktop grid ── */}
          {loading ? (
            <div className={`hidden lg:grid gap-6 ${gridClass(3)}`}>
              {[1, 2, 3].map((i) => <PlanCardSkeleton key={i} />)}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 px-6 max-w-md mx-auto rounded-3xl bg-white border border-gray-100 shadow-sm">
              <p className="text-gray-900 font-semibold text-lg">No plans available</p>
              <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                No active plans for Project Partner. Please contact your admin.
              </p>
            </div>
          ) : (
            <div className={`hidden lg:grid gap-6 ${gridClass(plans.length)}`}>
              {plans.map((plan, index) => (
                <PlanCard
                  key={plan.id ?? index}
                  plan={plan}
                  index={index}
                  isRecommended={plan.mostPopular || index === recIndex}
                />
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          {!loading && plans.length > 0 && (
            <div className="mt-14 text-center space-y-4">
              <button
                type="button"
                onClick={openJoinModal}
                className="inline-flex items-center gap-2 px-10 py-3.5 rounded-2xl text-sm font-bold text-white shadow-lg transition hover:shadow-xl active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#5E23DC 0%,#7c3aed 100%)" }}
              >
                Register as Project Partner →
              </button>
              <p className="text-sm text-gray-400">
                Need a custom plan?{" "}
                <a href="mailto:sales@reparv.in" className="text-[#5E23DC] font-medium hover:underline">
                  Contact Reparv Sales
                </a>
              </p>
            </div>
          )}

        </div>
      </section>
    </>
  );
}