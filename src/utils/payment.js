const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
const api = import.meta.env.VITE_BACKEND_URL;

export const handlePayment = async (
  user_id,
  plan,
  planId,
  planDuration,
  coupon,
  isUsedCoupon,
  partnerIdName,
  amount,
  email,
  userId,
  databaseT,
  updatedId,
  setSuccessScreen
) => {
  // Required fields validation
  const requiredFields = {
    user_id,
    plan,
    planId,
    planDuration,
    partnerIdName,
    amount,
    email,
    userId,
    databaseT,
    updatedId,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(
      ([_, value]) => value === undefined || value === null || value === ""
    )
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return alert(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // Step 1: Create Razorpay Order
  const res = await fetch(`${api}/api/subscription/payment/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount }),
  });

  const order = await res.json();

  // Step 2: Open Razorpay checkout
  const options = {
    key: razorpayKey,
    amount: order.amount,
    currency: order.currency,
    name: "Reparv",
    description: `${plan} Subscription`,
    order_id: order.id,
    handler: async (response) => {
      // Step 3: On Payment Success - verify & save
      const verifyRes = await fetch(
        `${api}/api/subscription/payment/verify-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partnerIdName,
            updatedId: updatedId,
            database: databaseT,
            userId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            email,
            user_id,
            plan,
            planId,
            coupon,
            isUsedCoupon,
            planDuration,
            amount,
          }),
        }
      );

      const result = await verifyRes.json();

      if (result.success) {
        setSuccessScreen({
          show: true,
          label: "Subscription Activated!",
          description: "Check your email for subscription details.",
        });
      } else {
        alert("Payment verification failed!");
      }
    },
    prefill: {
      email: email,
    },
    theme: {
      color: "#28a745",
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};
