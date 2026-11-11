import React, { useContext, useEffect, useState } from "react";
import {
  Check,
  ShieldCheck,
  LayoutDashboard,
  BadgeCheck,
  User,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../store/auth";
import axios from "axios";
import { formatIndianNumber } from "../../utils";

export default function PartnerRegistrationStep1({
  nextStep,
  setPlan,
  selectedPlan,
  routePlanId,
  handleRedeem,
  couponState,
  redeemConfirm,
  confirmRedeem,
  cancelRedeem,
  updateCouponState,
}) {
  const [billing, setBilling] = useState("monthly");

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { URI } = useAuth();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get(
        `${URI}/api/subscription/partner-plans/${encodeURIComponent("Project Partner")}`,
      );
      const rows = Array.isArray(res.data) ? res.data : [];
      const activePlans = rows.map((p) => ({
        ...p,
        partnerType: "Project Partner",
        highlight: p.highlight || "False",
        isTrial: String(p.plan_type || p.planType || "").toLowerCase() === "trial",
      }));

      setPlans(activePlans);

      const highlighted =
        activePlans.find((p) => p.highlight === "True") ||
        activePlans.find((p) => p.isTrial) ||
        activePlans[0];

      setPlan(highlighted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!routePlanId || !plans?.length) return;

    let matchedPlan = null;

    if (routePlanId === "free-trial") {
      matchedPlan = plans.find((plan) => plan.isTrial);
    }
    // 🔥 Case 2: Numeric Plan ID
    else if (!isNaN(routePlanId)) {
      matchedPlan = plans.find((plan) => plan.id === Number(routePlanId));
    }

    if (matchedPlan) {
      setPlan(matchedPlan);
    }
  }, [routePlanId, plans]);

  const currentPlan = selectedPlan;
  const currentCoupon = couponState?.[currentPlan?.id] || {};
  const originalAmount = Math.max(selectedPlan?.totalPrice || 0);
  const discountAmount = Math.max(selectedPlan?.discountApplied || 0);
  const gstAmount = Math.round(originalAmount * 0.18);
  const totalAmount = Math.max(originalAmount + gstAmount);
  const totalWithGST = Math.max(totalAmount - discountAmount, 0);
  return (
    <div className="min-h-screen bg-[#F8F7FC]">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-4 bg-white border-b">
        <h1 className="text-2xl font-bold text-purple-600 tracking-tight">
          reparv
        </h1>
        <div className="text-sm text-gray-600 cursor-pointer flex items-center gap-1">
          Help
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Title */}
        <h2 className="text-3xl font-semibold text-center">
          Complete Your Partner Plan
        </h2>

        {/* Stepper */}
        <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 mt-6 mb-12 px-4">
          <Step active label="Review Plan" completed />
          <Divider />
          <Step label="Details" number={2} />
          <Divider />
          <Step label="Payment" number={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-10">
            {/* Selected Plan */}
            <div>
              <p className="text-xs text-purple-600 font-semibold tracking-widest">
                SELECTED PLAN
              </p>

              <h3 className="text-2xl font-semibold mt-3">
                {currentPlan?.planName}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Perfect for scaling service teams
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-between mt-6 hidden sm:flex">
                {/* <div className="bg-gray-100 p-1 rounded-lg flex">
                  <button
                    onClick={() => setBilling("monthly")}
                    className={`px-4 py-2 text-sm rounded-md transition ${
                      billing === "monthly"
                        ? "bg-white shadow font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    onClick={() => setBilling("yearly")}
                    className={`px-4 py-2 text-sm rounded-md transition ${
                      billing === "yearly"
                        ? "bg-white shadow font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    Yearly -20%
                  </button>
                </div> */}

                <div className="text-3xl font-bold">
                  ₹{formatIndianNumber(currentPlan?.totalPrice)}
                  <span className="text-sm text-gray-500 ml-2">
                    {currentPlan?.planDuration}
                  </span>
                </div>
              </div>

              {/* Includes */}
              <div className="flex flex-col items-start mt-10 btw-2">
                <h4 className="font-inter font-semibold text-[14px] leading-[21px] text-[#0F1724] flex items-center">
                  Plan Includes:
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-sm text-gray-600">
                {currentPlan?.features?.split(",").map((feature, index) => (
                  <Feature key={index} text={feature.trim()} />
                ))}
              </div>
            </div>

            {/* Other Plans */}
            {/* Other Plans */}
            <div className="bg-white border border-[#EAECF0] rounded-xl p-6">
              <h4 className="text-[16px] font-semibold text-[#0F1724]">
                Other Plans to explore
              </h4>
              <p className="text-sm text-[#667085] mt-1 mb-6">
                Flexible pricing designed to scale with your business
              </p>

              {plans.map((plan, i) => (
                <div
                  key={plan.id}
                  onClick={() => {
                    setPlan(plan);
                  }}
                  className={`flex justify-between items-center py-5 ${
                    i !== 0 ? "border-t border-[#EAECF0]" : ""
                  } cursor-pointer`}
                >
                  <p className="font-medium text-[#0F1724]">{plan.planName}</p>

                  <div className="flex items-center gap-6">
                    <span className="font-semibold text-[#0F1724]">
                      ₹{formatIndianNumber(plan.totalPrice)}
                    </span>

                    <div
                      className={`w-11 h-6 rounded-full transition ${
                        selectedPlan?.id === plan.id
                          ? "bg-[#6C4DFF]"
                          : "bg-[#D0D5DD]"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full mt-0.5 transition ${
                          selectedPlan?.id === plan.id ? "ml-5" : "ml-1"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Included */}
            <div>
              <h4 className="font-semibold mb-4">Included with your account</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Included icon={LayoutDashboard} text="Dashboard Access" />
                <Included icon={BadgeCheck} text="Verified Badge" />
                <Included icon={User} text="Dedicated Manager" />
                <Included icon={BarChart3} text="Commission Tracking" />
              </div>
            </div>
          </div>

          {/* RIGHT - ORDER SUMMARY */}
          <div className="bg-white rounded-2xl border border-purple-200 shadow-sm p-6 sm:p-6 h-fit w-full max-w-md mx-auto lg:mx-0">
            <h4 className="font-semibold text-lg mb-6">Order Summary</h4>

            <div className="space-y-4 text-sm">
              <SummaryRow
                label="Selected Plan"
                value={`₹${formatIndianNumber(originalAmount)}`}
              />

              {discountAmount > 0 && (
                <SummaryRow
                  label="Discount"
                  value={`- ₹${formatIndianNumber(discountAmount)}`}
                />
              )}

              <SummaryRow
                label="GST (18%)"
                value={`₹${formatIndianNumber(gstAmount)}`}
              />
            </div>

            <div className="border-t my-6"></div>

            <div className="flex justify-between font-bold text-xl">
              <span>Total due today</span>
              <span>₹{formatIndianNumber(totalWithGST.toFixed(0))}</span>
            </div>

            {/* Promo Code: stack on mobile */}
            <div className="flex flex-col sm:flex-row mt-6 gap-2">
              <div className="flex flex-col sm:flex-row mt-6 gap-2">
                <input
                  type="text"
                  value={currentCoupon?.redeemCode || ""}
                  onChange={(e) =>
                    handleRedeem &&
                    updateCouponState(currentPlan.id, {
                      redeemCode: e.target.value,
                    })
                  }
                  placeholder="Promo code"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                />

                <button
                  onClick={() =>
                    handleRedeem &&
                    handleRedeem(currentPlan, currentCoupon?.redeemCode)
                  }
                  disabled={currentCoupon?.isApplying}
                  className="bg-gray-100 px-4 py-2 rounded-lg text-sm"
                >
                  {currentCoupon?.isApplying ? "Applying..." : "Apply"}
                </button>
              </div>

              {currentCoupon?.couponMsg && (
                <p className="text-xs mt-2 text-green-600">
                  {currentCoupon.couponMsg}
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setPlan(selectedPlan || plans[0]);
                nextStep();
              }}
              className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold shadow-md hover:opacity-90 transition"
            >
              Continue to Payment
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
              <ShieldCheck size={14} />
              Secure SSL Encrypted
            </div>
          </div>
          {redeemConfirm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl w-[350px]">
                <h3 className="text-lg font-semibold mb-2">Apply Coupon?</h3>

                <p className="text-sm text-gray-600 mb-4">
                  You will get ₹{redeemConfirm.discount} OFF
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={cancelRedeem}
                    className="px-4 py-2 text-sm border rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={confirmRedeem}
                    className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */

function Step({ label, active, completed, number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${
          completed
            ? "bg-purple-600 text-white"
            : active
              ? "bg-purple-100 text-purple-600"
              : "bg-gray-200 text-gray-500"
        }`}
      >
        {completed ? "✓" : number || ""}
      </div>
      <span
        className={`text-sm ${
          active || completed ? "text-purple-600 font-medium" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="w-10 h-px bg-gray-300" />;
}

function Feature({ text }) {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="16"
        height="16"
        viewBox="0 0 13 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.08337 6.49998C1.08337 9.48952 3.5105 11.9166 6.50004 11.9166C9.48958 11.9166 11.9167 9.48952 11.9167 6.49998C11.9167 3.51044 9.48958 1.08331 6.50004 1.08331C3.5105 1.08331 1.08337 3.51044 1.08337 6.49998V6.49998"
          stroke="#6C4DFF"
          stroke-width="1.08333"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M4.875 6.50002L5.95833 7.58335L8.125 5.41669"
          stroke="#6C4DFF"
          stroke-width="1.08333"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      {text}
    </div>
  );
}

function Included({ icon: Icon, text }) {
  return (
    <div className="bg-[#F2F4F7] border border-[#EAECF0] rounded-xl p-4 flex items-center gap-3">
      <Icon size={18} className="text-[#6C4DFF]" />
      <span className="text-sm w text-[#0F1724]">{text}</span>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
