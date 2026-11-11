import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import "./App.css";

// ── Layouts ───────────────────────────────────────────────────────────────────
import Layout from "./layout/Layout";
import LayoutTwo from "./layout/Layout2";

import Menu from "./layout/Menu";

// ── Auth Guard ────────────────────────────────────────────────────────────────
import { useAuth } from "./store/auth";
import Login from "./pages/Login";
import PropertiesFlatAndPlotInfo from "./pages/properties/PropertiesFlatAndPlotInfo";

// for Navigation
import { useNavigate } from "react-router-dom";
import Tickets from "./pages/tickets/Tickets";
import AddTicket from "./pages/tickets/AddTicket";
import EditProfile from "./pages/profile/EditProfile";
import ScrollToTop from "./utils/ScrollToTop";

// Refer
import Refer from "./pages/refer/Refer";
import ReferScreen from "./pages/refer/ReferScreen";

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
// Public
const PartnerPage = lazy(() => import("./pages/PartnerPage"));
const PartnersPage = lazy(
  () => import("./components/partnerPageUpdated/PartnersPage"),
);
import PaymentSuccessModal from "./components/pricingPages/PaymentSuccessModal";
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const AccountCancellation = lazy(() => import("./pages/AccountCancellation"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));

// App — Dashboard & Feed
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Feed = lazy(() => import("./pages/Feed"));
const Community = lazy(() => import("./pages/Community"));
const Network = lazy(() => import("./pages/Network"));
const Notifications = lazy(() => import("./pages/Notifications"));

// App — Properties
const Properties = lazy(() => import("./pages/properties/Properties"));
const AddProperty = lazy(() => import("./pages/properties/AddProperty"));
const AddPropertyMobile = lazy(
  () => import("./pages/properties/AddPropertyMobile"),
);
const UpdateProperty = lazy(() => import("./pages/properties/UpdateProperty"));
const Map = lazy(() => import("./pages/properties/Map"));

// App — Calendar
const Calendar = lazy(() => import("./pages/calendar/Calendar"));
const AddEvent = lazy(() => import("./pages/calendar/AddEvent"));

// App — Enquiries & Customers
const Enquiries = lazy(() => import("./pages/enquiries/Enquiries"));
const AddEnquiry = lazy(() => import("./pages/enquiries/AddEnquiry"));
const Customers = lazy(() => import("./pages/customers/Customers"));

// App — Builders
const Builders = lazy(() => import("./pages/builders/Builders"));
const AddBuilder = lazy(() => import("./pages/builders/AddBuilder"));

// App — Partners
const SalesPartners = lazy(() => import("./pages/salesPartners/SalesPartners"));
const AddSalesPartner = lazy(
  () => import("./pages/salesPartners/AddSalesPartner"),
);
const UpdateSalesPartner = lazy(
  () => import("./pages/salesPartners/UpdateSalesPartner"),
);
const TerritoryPartners = lazy(
  () => import("./pages/territoryPartners/TerritoryPartners"),
);
const AddTerritoryPartner = lazy(
  () => import("./pages/territoryPartners/AddTerritoryPartner"),
);

// App — Employees
const Employees = lazy(() => import("./pages/employees/Employees"));
const AddEmployee = lazy(() => import("./pages/employees/AddEmployee"));

// App — Subscription
const Subscription = lazy(() => import("./pages/subscription/Subscription"));
const ComparePlans = lazy(() => import("./pages/subscription/ComparePlans"));

// App — Profile
const Profile = lazy(() => import("./pages/profile/Profile"));
const EditProfileResponsive = lazy(
  () => import("./pages/profile/EditProfileResponsive"),
);

// ── Fallback loader ───────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Loading…</p>
      </div>
    </div>
  );
}

// ── Protected route guard ─────────────────────────────────────────────────────
function RequireAuth() {
  const { user, authReady } = useAuth();

  if (!authReady) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function RequireRole({ allowedRoles }) {
  const { user, authReady } = useAuth();

  if (!authReady) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}

// ── 404 page ──────────────────────────────────────────────────────────────────
function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <h1 className="text-7xl font-bold text-violet-600">404</h1>
      <p className="text-xl font-semibold text-gray-900">Page Not Found</p>
      <p className="text-gray-400 text-sm max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div
        onClick={() => {
          navigate(-1);
        }}
        className="mt-2 px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors cursor-pointer"
      >
        Go Back
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
const App = () => (
  <Suspense fallback={<PageLoader />}>
    <ScrollToTop />
    <Routes>
      {/* ════════════════════════════════════════════
          PUBLIC ROUTES — no auth required
      ════════════════════════════════════════════ */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<LayoutTwo />}>
        <Route index element={<PartnerPage />} />
        <Route path="partners" element={<PartnersPage />} />
        <Route path="/paymentSuccess" element={<PaymentSuccessModal />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="account-cancellation" element={<AccountCancellation />} />
        <Route path="cancellation-policy" element={<RefundPolicy />} />
      </Route>

      {/* ════════════════════════════════════════════
          PROTECTED ROUTES — must be authenticated
      ════════════════════════════════════════════ */}
      <Route path="/app" element={<RequireAuth />}>
        <Route element={<Layout />}>
          {/* Default redirect */}
          <Route index element={<Navigate to="dashboard" replace />} />
            {/* Mobile Menu */}
            <Route path="menu" element={<Menu />} />

            {/* Dashboard & Feed */}
            <Route path="dashboard" element={<Dashboard />} />
          <Route path="feed" element={<Feed />} />
          <Route path="community" element={<Community />} />
          <Route path="network" element={<Network />} />
          <Route path="notifications" element={<Notifications />} />

          {/* Calendar */}
          <Route path="calendar" element={<Calendar />} />
          <Route path="calendar/event/add" element={<AddEvent />} />

          {/* Enquiries */}
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="enquiry/add" element={<AddEnquiry />} />

          {/* Customers */}
          <Route path="customers" element={<Customers />} />

          <Route element={<RequireRole allowedRoles={["Project Partner"]} />}>
            {/* Properties */}
            <Route path="properties" element={<Properties />} />
            <Route path="properties/map-view" element={<Map />} />
            <Route path="property/add" element={<AddProperty />} />
            <Route path="property/add/mobile" element={<AddPropertyMobile />} />
            <Route path="property/update/:id" element={<UpdateProperty />} />
            <Route
              path="property/additional-info/:propertyid"
              element={<PropertiesFlatAndPlotInfo />}
            />

            {/* Builders */}
            <Route path="builders" element={<Builders />} />
            <Route path="builder/add" element={<AddBuilder />} />
            <Route path="builder/update/:id" element={<AddBuilder />} />

            {/* Sales Partners */}
            <Route path="sales-partners" element={<SalesPartners />} />
            <Route path="sales-partner/add" element={<AddSalesPartner />} />
            <Route
              path="sales-partner/update/:id"
              element={<UpdateSalesPartner />}
            />

            {/* Territory Partners */}
            <Route path="territory-partners" element={<TerritoryPartners />} />
            <Route
              path="territory-partner/add"
              element={<AddTerritoryPartner />}
            />
          </Route>

          {/* Employees */}
          <Route path="employees" element={<Employees />} />
          <Route path="employee/add" element={<AddEmployee />} />

          {/* Tickets */}
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/add" element={<AddTicket />} />
          <Route path="tickets/update/:id" element={<AddTicket />} />

            {/* Profile */}
            <Route path="profile" element={<Profile />} />
            <Route path="edit-profile" element={<EditProfile />} />

          {/* Refer Screen */}
          <Route path="invite" element={<Refer />} />
          <Route path="refer-screen" element={<ReferScreen />} />

          {/* Subscription — unlocked in SubscriptionOutlet */}
          <Route path="subscription" element={<Subscription />} />
          <Route path="subscription/compare-plans" element={<ComparePlans />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default App;
