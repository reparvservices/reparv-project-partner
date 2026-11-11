import React from "react";
import axios from "axios";
import { handlePayment } from "../../utils/payment";
import { useAuth } from "../../store/auth";
import { useNavigate } from "react-router-dom";

export default function PartnerPaymentStep3({
  prevStep,
  selectedPlan,
  user,
  setForm,
}) {
  const { URI, setSuccessScreen, setPurchaseData, purchaseData } = useAuth();
  const planPrice = parseFloat(selectedPlan?.totalPrice) || 0;
  const originalAmount = Number(selectedPlan?.totalPrice || 0);
  const discountAmount = Number(selectedPlan?.discountApplied || 0);
  const gstAmount = Number((originalAmount * 0.18).toFixed(2));
  const taxableAmount = Number(gstAmount + originalAmount).toFixed(2);
  const subtotalWithGST = Number(originalAmount + gstAmount).toFixed(2);
  const totalWithGST = Number(subtotalWithGST - discountAmount);
  const isTrialPlan =
    selectedPlan?.isTrial === true ||
    String(selectedPlan?.plan_type || selectedPlan?.planType || "").toLowerCase() ===
      "trial" ||
    Number(selectedPlan?.totalPrice) === 0;
  const registrationPrice = isTrialPlan
    ? 0
    : totalWithGST === 0
      ? 1
      : Number(totalWithGST.toFixed(0));

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isTrialPlan && !selectedPlan?.id) {
      alert("Please select a trial plan.");
      return;
    }

    if (!isTrialPlan) {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay. Please check your internet.");
        return;
      }
    }

    try {
      const response = await fetch(`${URI}/admin/projectpartner/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const res = await response.json();

        if (isTrialPlan) {
          setSuccessScreen({
            show: true,
            label: "Registration Successful",
            description:
              "You are now registered as a Project Partner! Your free trial will start shortly.",
          });
          await startTrial(res.Id);
          return;
        }

        setSuccessScreen({
          show: true,
          label: "Your Data Send SuccessFully",
          description: `Pay Rs ${registrationPrice} for Join as a Project Partner`,
        });

        setPurchaseData({
          selectedPlan: selectedPlan,
          userDetails: user,
          paymentDetails: null,
          subscriptionDetails: null,
        });

        try {
          await handlePayment(
            user,
            "Project Partner",
            "https://projectpartner.reparv.in",
            registrationPrice,
            res.Id,
            "projectpartner",
            "id",
            setSuccessScreen,
            setPurchaseData,
            purchaseData,
            navigate,
          );

          // If payment is successful, reset the form
          // setForm({
          //   fullname: "",
          //   contact: "",
          //   email: "",
          //   username: "",
          //   password: "",
          //   state: "",
          //   city: "",
          //   intrest: "",
          //   refrence: "",
          // });
        } catch (paymentError) {
          console.error("Payment Error:", paymentError.message);
          alert("Payment failed. Please contact support.");
        }
      } else {
        const errorRes = await response.json();
        console.error("Submission Error:", errorRes);
        alert(errorRes.message || "Failed to Submit Data. Please try again.");
      }
    } catch (err) {
      console.error("Network Error:", err.message);
      alert("Network Error. Please try again later.");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const startTrial = async (userId) => {
    if (!selectedPlan?.id) {
      alert("Please select a trial plan.");
      return;
    }
    try {
      const res = await axios.post(
        `${URI}/projectpartner/subscription/activate-trial/${userId}`,
        {
          plan_id: Number(selectedPlan.id),
          username: user?.username,
          password: user?.password,
        },
      );

      if (res.data.success) {
        alert(
          "🎉 Success! Your free trial has started. Login details sent to your email.",
        );
      } else {
        alert(res.data.message || "Unable to start trial");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while starting trial");
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-purple-600">reparv</h1>
        <div className="text-gray-600 cursor-pointer">Help ▾</div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Title */}
        <h2 className="text-3xl font-semibold text-center mb-6">
          Partner Registration
        </h2>

        {/* Steps */}
        {/* Stepper */}
        <div className="flex flex-wrap justify-center items-center gap-3 md:gap-6 mt-6 mb-12 px-4">
          <Step active label="Review Plan" completed />
          <Divider />
          <Step label="Details" number={2} completed />
          <Divider />
          <Step label="Payment" number={3} active />
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* Billing Details */}
            <div className="bg-white shadow rounded-xl p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">Billing Details</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Sending receipt to {user.email || ""}
                  </p>
                </div>

                <button
                  onClick={prevStep}
                  className="text-sm border px-3 py-1 rounded-md"
                >
                  Edit
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mt-4 flex flex-col md:flex-row md:justify-between">
                <div>
                  <p className="text-xs text-gray-500">Billed To</p>
                  <p className="font-medium">{user.fullname || "User"}</p>
                  <p className="text-sm text-gray-500">
                    {user?.city || ""}, {user?.state || ""}
                  </p>
                </div>

                <div className="mt-4 md:mt-0">
                  <p className="text-xs text-gray-500">Selected Plan</p>
                  <p className="text-purple-600 font-medium">
                    {selectedPlan?.planName || "None"}
                  </p>
                  <p className="text-sm text-gray-500">
                    ₹{selectedPlan?.totalPrice || 0} /{selectedPlan?.planName}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white shadow rounded-xl p-6 hidden">
              <h3 className="font-semibold text-lg mb-6">Payment Method</h3>

              {/* Tabs */}
              <div className="flex space-x-6 border-b pb-3 mb-6 text-sm">
                <button className="text-purple-600 border-b-2 border-purple-600 pb-2">
                  Card
                </button>
                <button className="text-gray-500">UPI</button>
                <button className="text-gray-500">Net Banking</button>
                <button className="text-gray-500">Wallets</button>
              </div>

              {/* Card Form */}
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM / YY"
                    className="border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="123"
                    className="border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Enter name as shown on card"
                  className="w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />

                {/* Save Card Toggle */}
                <div className="flex items-center space-x-3 mt-4">
                  <div className="w-10 h-5 bg-purple-600 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-0.5"></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    Securely save this card for future billing
                  </span>
                </div>

                {/* SSL Box */}
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-4 mt-4">
                  🔒 Your transaction is secured with 256-bit SSL encryption.
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE SUMMARY */}
          <div className="bg-white shadow-xl rounded-xl overflow-hidden h-fit">
            <div className="bg-purple-900 text-white p-6">
              <p className="text-sm opacity-80">Total Amount Due</p>
              <h3 className="text-3xl font-bold mt-2">
                ₹{registrationPrice.toFixed(2)}
              </h3>
              <p className="text-xs mt-2 opacity-80">
                {/* Offer valid for 14:32 mins */}
              </p>
            </div>

            <div className="p-6 space-y-4 text-sm text-gray-700">
              {/* Original Price */}
              <div className="flex justify-between">
                <span>Base Plan</span>
                <span>₹{originalAmount}</span>
              </div>

              {/* Discount */}
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              )}

              {/* Taxable */}
              <div className="flex justify-between">
                <span>Taxable Amount</span>
                <span>₹{taxableAmount}</span>
              </div>

              {/* GST */}
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span>₹{gstAmount}</span>
              </div>

              {/* Final */}
              <div className="border-t pt-4 flex justify-between font-semibold">
                <span>Payable Amount</span>
                <span>₹{registrationPrice}</span>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full mt-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold shadow-md hover:opacity-95 transition"
              >
                {isTrialPlan
                  ? "Start free trial →"
                  : `Pay ₹${registrationPrice} →`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
