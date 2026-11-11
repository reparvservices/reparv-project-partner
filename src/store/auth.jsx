import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { fetchPartnerSubscription } from "../lib/partnerSubscription";

const SUBSCRIPTION_RECHECK_MS = 30000;
import {
  clearPartnerSession,
  getStoredPartnerSession,
  logoutPartner,
  persistPartnerSession,
  validatePartnerSession,
} from "../lib/partnerAuth";
import { registerUnauthorizedHandler } from "../lib/apiClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const URI = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  const initialSession = getStoredPartnerSession();
  const [user, setUser] = useState(initialSession?.user ?? null);
  const [role, setRole] = useState(initialSession?.user?.role ?? null);
  const [authReady, setAuthReady] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successScreen, setSuccessScreen] = useState({
    show: false,
    label: "Thank You For Registering!",
    description: "Our Representative will call you shortly",
  });
  const [moreOpen, setMoreOpen] = useState(false);
  const [isActiveSubscription, setIsActiveSubacription] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionReady, setSubscriptionReady] = useState(false);

  const handleUnauthorized = useCallback(() => {
    clearPartnerSession();
    setUser(null);
    setRole(null);
    setSubscription(null);
    setIsActiveSubacription(false);
    setSubscriptionReady(true);
    if (!window.location.pathname.startsWith("/login")) {
      window.location.replace("/login");
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutPartner(URI, user);
    setUser(null);
    setRole(null);
    setSubscription(null);
    setIsActiveSubacription(false);
    setSubscriptionReady(true);
  }, [URI, user]);

  useEffect(() => {
    registerUnauthorizedHandler(handleUnauthorized);
  }, [handleUnauthorized]);

  /** Bootstrap: validate stored user against server session */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = getStoredPartnerSession();
      if (!stored?.user?.id) {
        if (!cancelled) {
          setUser(null);
          setRole(null);
          setAuthReady(true);
        }
        return;
      }

      const result = await validatePartnerSession(
        URI,
        stored.roleId,
        stored.user,
      );

      if (cancelled) return;

      if (result.ok) {
        setUser(result.user);
        setRole(result.user.role);
        persistPartnerSession(stored.roleId, result.user);
      } else {
        clearPartnerSession();
        setUser(null);
        setRole(null);
      }
      setAuthReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [URI]);

  const refreshSubscription = useCallback(
    async (overrideUser, options = {}) => {
      const silent = options?.silent === true;
      const currentUser = overrideUser || user || getStoredPartnerSession()?.user;
      if (!currentUser?.id) {
        setSubscription(null);
        setIsActiveSubacription(false);
        setSubscriptionReady(true);
        return { active: false };
      }

      if (!silent) setSubscriptionReady(false);
      try {
        const status = await fetchPartnerSubscription(URI, currentUser);
        // A failed background check must not lock a partner out
        if (status.failed && silent) return status;
        setSubscription((prev) =>
          JSON.stringify(prev) === JSON.stringify(status) ? prev : status,
        );
        setIsActiveSubacription(Boolean(status.active));
        return status;
      } catch {
        const fallback = { active: false };
        setSubscription(fallback);
        setIsActiveSubacription(false);
        return fallback;
      } finally {
        setSubscriptionReady(true);
      }
    },
    [URI, user?.id, user?.role],
  );

  useEffect(() => {
    if (!authReady || !user?.id) {
      if (authReady) {
        setSubscription(null);
        setIsActiveSubacription(false);
        setSubscriptionReady(true);
      }
      return;
    }
    refreshSubscription();
  }, [authReady, user?.id, user?.role, refreshSubscription]);

  // A plan can be activated from admin or another device while this tab is
  // open, so keep checking instead of waiting for the next login.
  useEffect(() => {
    if (!authReady || !user?.id) return undefined;
    const check = () => {
      if (document.visibilityState === "visible") {
        refreshSubscription(undefined, { silent: true });
      }
    };
    const timer = setInterval(check, SUBSCRIPTION_RECHECK_MS);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [authReady, user?.id, refreshSubscription]);

  const loginPartner = useCallback((roleId, loggedInUser, _token) => {
    const normalized = persistPartnerSession(roleId, loggedInUser);
    setUser(normalized);
    setRole(normalized?.role ?? null);
    return normalized;
  }, []);

  const isLoggedIn = useMemo(
    () => Boolean(authReady && user?.id),
    [authReady, user?.id],
  );

  const [showSubscription, setShowSubscription] = useState(false);
  const [dashboardFilter, setDashboardFilter] = useState("Booked");
  const [showProfile, setShowProfile] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [showEmployee, setShowEmployee] = useState(false);
  const [showEplDetailsForm, setShowEplDetailsForm] = useState(false);
  const [showBuilderForm, setShowBuilderForm] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showPropertyAddForm, setShowPropertyAddForm] = useState(false);
  const [showUpdateImagesForm, setShowUpdateImagesForm] = useState(false);
  const [showAdditionalInfoForm, setShowAdditionalInfoForm] = useState(false);
  const [showNewPlotAdditionalInfoForm, setShowNewPlotAdditionalInfoForm] =
    useState(false);
  const [showPropertyInfo, setShowPropertyInfo] = useState(false);
  const [showSeoForm, setShowSeoForm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showInfoForm, setShowInfoForm] = useState(false);
  const [showTicketInfo, setShowTicketInfo] = useState(true);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [showCustomer, setShowCustomer] = useState(false);
  const [showCustomerPaymentForm, setShowCustomerPaymentForm] = useState(false);
  const [showPaymentIdForm, setShowPaymentIdForm] = useState(false);
  const [showFollowUpList, setShowFollowUpList] = useState(false);
  const [action, setAction] = useState("Save Details");
  const [isActive, setIsActive] = useState("Builders");
  const [giveAccess, setGiveAccess] = useState(false);
  const [filterStatus, setFilterStatus] = useState("New");
  const [enquiryFilter, setEnquiryFilter] = useState("New");
  const [propertyFilter, setPropertyFilter] = useState("Approved");
  const [showAssignSalesForm, setShowAssignSalesForm] = useState(false);
  const [showEnquiryStatusForm, setShowEnquiryStatusForm] = useState(false);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [showCSVEnquiryForm, setShowCSVEnquiryForm] = useState(false);
  const [showEnquiryUpdateForm, setShowEnquiryUpdateForm] = useState(false);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [showEnquirerPropertyForm, setShowEnquirerPropertyForm] =
    useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showVideoUploadForm, setShowVideoUploadForm] = useState(false);
  const [showRejectReasonForm, setShowRejectReasonForm] = useState(false);
  const [showCommissionForm, setShowCommissionForm] = useState(false);
  const [showPropertyLocationForm, setShowPropertyLocationForm] =
    useState(false);

  const [showSalesForm, setShowSalesForm] = useState(false);
  const [showSalesPerson, setShowSalesPerson] = useState(false);
  const [showPartner, setShowPartner] = useState(false);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [partnerPaymentStatus, setPartnerPaymentStatus] = useState("Unpaid");
  const [showAssignTaskForm, setShowAssignTaskForm] = useState(false);
  const [showNotePopup, setShowNotePopup] = useState(false);

  const [showSliderForm, setShowSliderForm] = useState(false);
  const [showAddMobileImage, setShowAddMobileImage] = useState(false);
  const [showContentUploadForm, setShowContentUploadForm] = useState(false);

  const [projectPartner, setProjectPartners] = useState([]);
  const [currentProjectPartner, setCurrentProjectPartner] = useState(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);

  return (
    <AuthContext.Provider
      value={{
        URI,
        user,
        setUser,
        role,
        setRole,
        authReady,
        loading,
        setLoading,
        isLoggedIn,
        loginPartner,
        logout,
        successScreen,
        setSuccessScreen,
        moreOpen,
        setMoreOpen,
        showSubscription,
        setShowSubscription,
        delTokenInCookie: clearPartnerSession,
        isActiveSubscription,
        setIsActiveSubacription,
        subscription,
        subscriptionReady,
        refreshSubscription,
        showRoleForm,
        setShowRoleForm,
        showDepartmentForm,
        setShowDepartmentForm,
        showEmployee,
        setShowEmployee,
        showEplDetailsForm,
        setShowEplDetailsForm,
        showBuilder,
        setShowBuilder,
        showBuilderForm,
        setShowBuilderForm,
        showPropertyForm,
        setShowPropertyForm,
        showPropertyAddForm,
        setShowPropertyAddForm,
        showUpdateImagesForm,
        setShowUpdateImagesForm,
        showAdditionalInfoForm,
        setShowAdditionalInfoForm,
        showNewPlotAdditionalInfoForm,
        setShowNewPlotAdditionalInfoForm,
        showPropertyInfo,
        setShowPropertyInfo,
        showTicketInfo,
        setShowTicketInfo,
        showTicketForm,
        setShowTicketForm,
        showTicket,
        setShowTicket,
        showCustomer,
        setShowCustomer,
        showCustomerPaymentForm,
        setShowCustomerPaymentForm,
        showResponseForm,
        setShowResponseForm,
        isActive,
        setIsActive,
        giveAccess,
        setGiveAccess,
        filterStatus,
        setFilterStatus,
        enquiryFilter,
        setEnquiryFilter,
        propertyFilter,
        setPropertyFilter,
        showSeoForm,
        setShowSeoForm,
        showAssignSalesForm,
        setShowAssignSalesForm,
        showEnquiryStatusForm,
        setShowEnquiryStatusForm,
        showEnquiryForm,
        setShowEnquiryForm,
        showCSVEnquiryForm,
        setShowCSVEnquiryForm,
        showEnquiryUpdateForm,
        setShowEnquiryUpdateForm,
        showEnquiry,
        setShowEnquiry,
        showEnquirerPropertyForm,
        setShowEnquirerPropertyForm,
        showPaymentIdForm,
        setShowPaymentIdForm,
        showFollowUpList,
        setShowFollowUpList,
        showCart,
        setShowCart,
        showOrder,
        setShowOrder,
        showProductForm,
        setShowProductForm,
        showOrderForm,
        setShowOrderForm,
        showVideoUploadForm,
        setShowVideoUploadForm,
        showPropertyLocationForm,
        setShowPropertyLocationForm,
        showRejectReasonForm,
        setShowRejectReasonForm,
        showCommissionForm,
        setShowCommissionForm,
        dashboardFilter,
        setDashboardFilter,
        showSalesForm,
        setShowSalesForm,
        showSalesPerson,
        setShowSalesPerson,
        partnerPaymentStatus,
        setPartnerPaymentStatus,
        showPartner,
        setShowPartner,
        showPartnerForm,
        setShowPartnerForm,
        showAssignTaskForm,
        setShowAssignTaskForm,
        showInfo,
        setShowInfo,
        showInfoForm,
        setShowInfoForm,
        showNotePopup,
        setShowNotePopup,
        showSliderForm,
        setShowSliderForm,
        showAddMobileImage,
        setShowAddMobileImage,
        showContentUploadForm,
        setShowContentUploadForm,
        projectPartner,
        setProjectPartners,
        currentProjectPartner,
        setCurrentProjectPartner,
        showInquiryForm,
        setShowInquiryForm,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
