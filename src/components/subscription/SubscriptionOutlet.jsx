import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { getFeatureTitleForPath, getLockState } from "../../lib/subscriptionLock";
import SubscriptionGate from "./SubscriptionGate";

function GateLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-[#EDE9FE] border-t-[#5E23DC] animate-spin" />
    </div>
  );
}

/**
 * Renders child routes; blurs and locks a page when the partner has no plan,
 * or their plan doesn't include the feature that page needs.
 */
export default function SubscriptionOutlet() {
  const { subscription, subscriptionReady, refreshSubscription, role } = useAuth();
  const location = useLocation();

  useEffect(() => {
    refreshSubscription(undefined, { silent: true });
  }, [location.pathname, refreshSubscription]);

  if (!subscriptionReady) {
    return <GateLoader />;
  }

  const lock = getLockState(subscription, location.pathname, role);
  if (!lock.locked) {
    return <Outlet />;
  }

  return (
    <SubscriptionGate
      title={getFeatureTitleForPath(location.pathname)}
      reason={lock.reason}
      feature={lock.feature}
    >
      <Outlet />
    </SubscriptionGate>
  );
}
