import React from "react";
import { useNavigate } from "react-router-dom";

export default function PricingCard({
  plan,
  expandedPlans,
  toggleFeatures,
  redeemCode,
  setRedeemCode,
  isApplying,
  setSelectedPlan,
  onChoose,
  couponMsg,
  handleRedeem,
}) {
  const navigate = useNavigate();
  return (
    <div
      className={`
      relative overflow-visible 
      rounded-2xl p-8 border flex flex-col
      transition-all duration-300 
      border-0.5 border-[#5E23DC]
      hover:-translate-y-2 hover:shadow-2xl
      ${plan.mostPopular ? "border-2 border-[#5E23DC] shadow-xl" : ""}
    `}
    >
      {/* MOST POPULAR BADGE */}
      {plan.mostPopular && (
        <div className="absolute z-20 -top-1 sm:-top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#5E23DC] to-[#854DFB] text-white px-5 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap shadow-lg">
          Most Popular
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-4 mt-2">
        <div
          className="w-14 h-14 flex items-center justify-center rounded-xl shrink-0"
          style={{ background: plan.iconBg }}
        >
          {plan.icons}
        </div>

        <div className="text-left">
          <h3 className="text-xl font-semibold">{plan.name}</h3>
          <p className="text-sm text-gray-500">Valid for {plan.description}</p>
        </div>
      </div>

      {/* PRICE */}
      <div className="text-3xl font-bold text-left">{plan.monthlyPrice}</div>

      {/* COUPON SECTION */}
      {plan.totalPrice !== "0" && (
        <div className="mt-5 hidden">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={redeemCode || ""}
              onChange={(e) => setRedeemCode(e.target.value)}
              className="w-full p-3 border border-[#5E23DC] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5E23DC]"
            />

            <button
              onClick={() => handleRedeem(plan, redeemCode)}
              disabled={isApplying}
              className="p-3 rounded-lg bg-[#5E23DC] text-white text-sm font-medium hover:bg-[#4a1bc2] disabled:opacity-60 whitespace-nowrap"
            >
              {isApplying ? "Applying..." : "Apply"}
            </button>
          </div>

          {/* COUPON MESSAGE */}
          {couponMsg && (
            <p
              className={`mt-2 text-sm font-medium ${
                couponMsg.includes("Applied")
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {couponMsg}
            </p>
          )}
        </div>
      )}

      {/* CTA BUTTON */}
      <button
        onClick={() => {
          console.log(plan, "plansbs");

          // onChoose(plan);
          navigate(`/subscribe/${plan?.id}`);
        }}
        className={`mt-6 w-full py-3 rounded-xl transition font-medium ${plan.buttonClass}`}
      >
        {plan.buttonText}
      </button>

      {/* FEATURES */}
      <ul className="mt-6 space-y-2 text-left">
        {(expandedPlans[plan.id]
          ? plan.features
          : plan.features.slice(0, 6)
        ).map((feature, idx) => (
          <li key={idx} className="flex gap-3">
            <span className="text-[#5E23DC]">
              {plan.mostPopular ? (
                <svg
                  width="27"
                  height="29"
                  viewBox="0 0 27 29"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    y="2"
                    width="26.4"
                    height="26.4"
                    rx="13.2"
                    fill="#DFD0FF"
                    fillOpacity="0.28"
                  />
                  <path
                    d="M19.0663 10.7998L10.9997 18.8665L7.33301 15.1998"
                    stroke="#5E23DC"
                    strokeWidth="1.46667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="26"
                  viewBox="0 0 24 26"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect y="2" width="24" height="24" rx="12" fill="#EFF6FF" />
                  <path
                    d="M17.3334 10L10.0001 17.3333L6.66675 14"
                    stroke="#4A5565"
                    strokeWidth="1.33333"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className="text-sm text-[#364153]">{feature}</span>
          </li>
        ))}
      </ul>

      {/* SHOW MORE */}
      {plan.features.length > 6 && (
        <button
          onClick={() => toggleFeatures(plan.id)}
          className="mt-3 text-sm font-medium text-[#7C3AED] hover:underline self-start"
        >
          {expandedPlans[plan.id]
            ? "Show less"
            : `View all ${plan.features.length} features`}
        </button>
      )}
    </div>
  );
}
