import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../store/auth";

function GateLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f4fb]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-[#EDE9FE] border-t-[#5E23DC] animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Checking subscription…</p>
      </div>
    </div>
  );
}

/** Blocks app routes until partner has an active subscription in `user_subscriptions`. */
export default function RequireSubscription() {
  const { subscription, subscriptionReady } = useAuth();
  const location = useLocation();

  if (!subscriptionReady) {
    return <GateLoader />;
  }

  if (!subscription?.active) {
    return (
      <Navigate
        to="/app/subscription"
        replace
        state={{ from: location.pathname, reason: "subscription_required" }}
      />
    );
  }

  return <Outlet />;
}
