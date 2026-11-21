import { useState, useEffect } from "react";
import { FaHandshake, FaBriefcase } from "react-icons/fa";
import { IoEye, IoEyeOff, IoMailOutline } from "react-icons/io5";
import { LuLockKeyhole, LuUser, LuPhone } from "react-icons/lu";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../lib/apiClient";
import { useAuth } from "../store/auth";
import { PARTNER_ROLE_CONFIG } from "../lib/partnerAuth";
import {
  sendPartnerJoinOtp,
  completePartnerJoin,
} from "../lib/partnerJoinApi";
import ForgotPassword from "../components/ForgotPassword";
import LoginBrandPanel from "../components/login/LoginBrandPanel";
import reparvLogo from "../assets/layout/reparvMainLogo.svg";

// Sign-in can pick either partner type. Sign-up is project partners only:
// sales partners are created by their project partner from the panel.
const SIGN_IN_ROLES = [
  { id: "project-partner", label: "Project Partner", shortLabel: "Project", icon: FaBriefcase },
  { id: "sales-partner", label: "Sales Partner", shortLabel: "Sales", icon: FaHandshake },
];

const PHONE_RE = /^[6-9]\d{9}$/;
const MIN_PASSWORD = 8;
const EMPTY_SIGNUP = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirm: "",
};

const inputCls =
  "w-full border-none outline-none text-sm text-gray-800 placeholder:text-gray-400 bg-transparent";

function AuthGateLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f4ff]">
      <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
    </div>
  );
}

function FieldShell({ htmlFor, label, icon: Icon, right, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
      >
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 h-14 shadow-sm focus-within:border-[#6C35DE] focus-within:ring-4 focus-within:ring-[#6C35DE]/15 transition-all">
        {Icon ? <Icon size={17} className="text-gray-400 shrink-0" /> : null}
        {children}
        {right}
      </div>
    </div>
  );
}

function Banner({ tone, children }) {
  const cls =
    tone === "error"
      ? "border-red-100 bg-red-50 text-red-600"
      : "border-emerald-100 bg-emerald-50 text-emerald-700";
  return (
    <div className={`mb-5 rounded-xl border px-4 py-3 text-sm ${cls}`}>
      {children}
    </div>
  );
}

function Login() {
  const {
    URI,
    setLoading,
    loading,
    loginPartner,
    refreshSubscription,
    authReady,
    isLoggedIn,
  } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  const [selectedRole, setSelectedRole] = useState("project-partner");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const navigate = useNavigate();

  // Sign-up state
  const [signupStep, setSignupStep] = useState("details"); // "details" | "verify"
  const [signup, setSignup] = useState(EMPTY_SIGNUP);
  const [otp, setOtp] = useState("");
  const [signupBusy, setSignupBusy] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  useEffect(() => {
    if (authReady && isLoggedIn) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [authReady, isLoggedIn, navigate]);

  const switchMode = (next) => {
    setErrorMessage("");
    setInfoMessage("");
    setSignupStep("details");
    if (next === "signup") {
      setSelectedRole("project-partner");
      setSearchParams({ mode: "signup" }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  /* ── Sign in ── */

  const roleConfig = PARTNER_ROLE_CONFIG[selectedRole];

  const userLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    if (!roleConfig) {
      setErrorMessage("Please select a partner type to continue.");
      return;
    }
    if (!emailOrUsername || !password) {
      setErrorMessage("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${URI}${roleConfig.loginEndpoint}`,
        { emailOrUsername, password },
        { headers: { "Content-Type": "application/json" } },
      );

      const loggedInUser = response.data?.user;
      const token = response.data?.token;

      if (loggedInUser?.id) {
        loginPartner(selectedRole, loggedInUser, token);
        await refreshSubscription({
          ...loggedInUser,
          role: loggedInUser.role || roleConfig.displayRole,
        });
        navigate("/app/dashboard", { replace: true });
      } else {
        setErrorMessage("Invalid login credentials.");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Create account (project partner) ── */

  const updateSignup = (field) => (e) =>
    setSignup((prev) => ({ ...prev, [field]: e.target.value }));

  const detailsProblem = () => {
    if (!signup.firstName.trim() || !signup.lastName.trim())
      return "Enter your first and last name.";
    if (!/^\S+@\S+\.\S+$/.test(signup.email.trim()))
      return "Enter a valid email address.";
    if (!PHONE_RE.test(signup.phone))
      return "Enter a valid 10-digit mobile number.";
    if (signup.password.length < MIN_PASSWORD)
      return `Password must be at least ${MIN_PASSWORD} characters.`;
    if (signup.password !== signup.confirm)
      return "Passwords do not match.";
    return "";
  };

  const sendCode = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    setInfoMessage("");
    const problem = detailsProblem();
    if (problem) {
      setErrorMessage(problem);
      return;
    }
    try {
      setSignupBusy(true);
      await sendPartnerJoinOtp(URI, signup.phone, signup.email.trim());
      setOtp("");
      setSignupStep("verify");
      setInfoMessage(`We sent a verification code to ${signup.phone}.`);
    } catch (err) {
      setErrorMessage(err.message || "Could not send the code. Please try again.");
    } finally {
      setSignupBusy(false);
    }
  };

  const createAccount = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");
    if (!otp.trim()) {
      setErrorMessage("Enter the verification code we sent you.");
      return;
    }
    try {
      setSignupBusy(true);
      await completePartnerJoin(URI, {
        firstName: signup.firstName.trim(),
        lastName: signup.lastName.trim(),
        phone: signup.phone,
        otp: otp.trim(),
        email: signup.email.trim(),
        password: signup.password,
      });
      const email = signup.email.trim();
      setSignup(EMPTY_SIGNUP);
      setOtp("");
      switchMode("signin");
      setEmailOrUsername(email);
      setPassword("");
      setInfoMessage("Account created. Sign in with your email and password.");
    } catch (err) {
      setErrorMessage(err.message || "Could not create your account. Please try again.");
    } finally {
      setSignupBusy(false);
    }
  };

  if (!authReady) {
    return <AuthGateLoader />;
  }

  return (
    <div className="min-h-screen h-screen w-full overflow-hidden [&_button:not(:disabled)]:cursor-pointer [&_a]:cursor-pointer">
      {showForgotPassword ? (
        <div className="flex h-full min-h-screen w-full items-center justify-center bg-[#faf8ff] px-4">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_20px_60px_rgba(94,35,220,0.12)]">
            <ForgotPassword
              setShowForgotPassword={setShowForgotPassword}
              roleId={selectedRole}
            />
          </div>
        </div>
      ) : (
        <div className="grid h-full min-h-screen w-full grid-cols-1 lg:grid-cols-2">
          <LoginBrandPanel />

          <div className="flex h-full min-h-screen flex-col bg-white lg:bg-[#faf8ff]">
            <div className="lg:hidden bg-gradient-to-r from-[#5E23DC] to-[#7c3aed] px-6 py-5 text-white">
              <img
                src={reparvLogo}
                alt="Reparv"
                className="h-8 w-auto brightness-0 invert"
              />
              <p className="mt-1 text-xs text-white/75">Partner Portal</p>
            </div>

            <div className="flex flex-1 flex-col justify-center overflow-y-auto px-6 py-8 sm:px-10 lg:px-12 xl:px-16">
              <div className="mx-auto w-full max-w-md">

                {errorMessage ? (
                  <Banner tone="error">{errorMessage}</Banner>
                ) : null}
                {infoMessage ? (
                  <Banner tone="info">{infoMessage}</Banner>
                ) : null}

                {mode === "signin" ? (
                  <form onSubmit={userLogin}>
                    <div className="mb-8">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Welcome back
                      </h1>
                      <p className="mt-2 text-sm sm:text-base text-gray-500">
                        Choose your partner type and enter your credentials
                      </p>
                    </div>

                    <div className="mb-6">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Partner type
                      </p>
                      <div className="flex gap-1 rounded-full bg-gray-100 p-1">
                        {SIGN_IN_ROLES.map((role) => {
                          const Icon = role.icon;
                          const isActive = selectedRole === role.id;
                          return (
                            <button
                              key={role.id}
                              type="button"
                              onClick={() => {
                                setSelectedRole(role.id);
                                setErrorMessage("");
                              }}
                              title={role.label}
                              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-3 text-sm font-semibold transition-all ${
                                isActive
                                  ? "bg-white text-[#6C35DE] shadow-sm"
                                  : "text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              <Icon size={14} className="shrink-0" />
                              <span className="truncate sm:hidden">
                                {role.shortLabel}
                              </span>
                              <span className="truncate hidden sm:inline">
                                {role.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      {selectedRole === "sales-partner" ? (
                        <p className="mt-2 text-xs text-gray-500">
                          Sales partner accounts are created by your project
                          partner. Use the username and password they gave you.
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-4">
                      <FieldShell htmlFor="login-email" label="Email or username" icon={IoMailOutline}>
                        <input
                          id="login-email"
                          value={emailOrUsername}
                          required
                          onChange={(e) => setEmailOrUsername(e.target.value)}
                          type="text"
                          placeholder="Enter email or username"
                          className={inputCls}
                        />
                      </FieldShell>

                      <FieldShell
                        htmlFor="login-password"
                        label="Password"
                        icon={LuLockKeyhole}
                        right={
                          <button
                            type="button"
                            onClick={() => setIsPasswordShow(!isPasswordShow)}
                            className="shrink-0 text-gray-400 hover:text-[#6C35DE] transition-colors"
                            aria-label={isPasswordShow ? "Hide password" : "Show password"}
                          >
                            {isPasswordShow ? <IoEyeOff size={18} /> : <IoEye size={18} />}
                          </button>
                        }
                      >
                        <input
                          id="login-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          type={isPasswordShow ? "text" : "password"}
                          required
                          placeholder="Enter password"
                          className={inputCls}
                        />
                      </FieldShell>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm font-medium text-[#6C35DE] hover:text-[#5a28c4] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-6 w-full h-14 rounded-full bg-gradient-to-r from-[#5E23DC] to-[#7c3aed] text-white text-base font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#6C35DE]/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Signing in…
                        </>
                      ) : (
                        <>Sign in</>
                      )}
                    </button>

                    <p className="mt-6 text-center text-sm text-gray-500">
                      New project partner?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("signup")}
                        className="font-semibold text-[#6C35DE] hover:underline"
                      >
                        Create an account
                      </button>
                    </p>
                  </form>
                ) : signupStep === "details" ? (
                  <form onSubmit={sendCode}>
                    <div className="mb-8">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Create your partner account
                      </h1>
                      <p className="mt-2 text-sm sm:text-base text-gray-500">
                        Sign up as a project partner. Sales partners are added by
                        your project partner.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FieldShell htmlFor="signup-first" label="First name" icon={LuUser}>
                          <input
                            id="signup-first"
                            value={signup.firstName}
                            onChange={updateSignup("firstName")}
                            required
                            placeholder="First name"
                            className={inputCls}
                          />
                        </FieldShell>
                        <FieldShell htmlFor="signup-last" label="Last name" icon={LuUser}>
                          <input
                            id="signup-last"
                            value={signup.lastName}
                            onChange={updateSignup("lastName")}
                            required
                            placeholder="Last name"
                            className={inputCls}
                          />
                        </FieldShell>
                      </div>

                      <FieldShell htmlFor="signup-email" label="Email" icon={IoMailOutline}>
                        <input
                          id="signup-email"
                          type="email"
                          value={signup.email}
                          onChange={updateSignup("email")}
                          required
                          placeholder="you@example.com"
                          className={inputCls}
                        />
                      </FieldShell>

                      <FieldShell htmlFor="signup-phone" label="Mobile number" icon={LuPhone}>
                        <input
                          id="signup-phone"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={signup.phone}
                          onChange={(e) => {
                            if (/^\d{0,10}$/.test(e.target.value))
                              setSignup((p) => ({ ...p, phone: e.target.value }));
                          }}
                          required
                          placeholder="10-digit mobile number"
                          className={inputCls}
                        />
                      </FieldShell>

                      <FieldShell
                        htmlFor="signup-password"
                        label="Password"
                        icon={LuLockKeyhole}
                        right={
                          <button
                            type="button"
                            onClick={() => setShowSignupPassword(!showSignupPassword)}
                            className="shrink-0 text-gray-400 hover:text-[#6C35DE] transition-colors"
                            aria-label={showSignupPassword ? "Hide password" : "Show password"}
                          >
                            {showSignupPassword ? <IoEyeOff size={18} /> : <IoEye size={18} />}
                          </button>
                        }
                      >
                        <input
                          id="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          value={signup.password}
                          onChange={updateSignup("password")}
                          required
                          placeholder={`At least ${MIN_PASSWORD} characters`}
                          className={inputCls}
                        />
                      </FieldShell>

                      <FieldShell htmlFor="signup-confirm" label="Confirm password" icon={LuLockKeyhole}>
                        <input
                          id="signup-confirm"
                          type={showSignupPassword ? "text" : "password"}
                          value={signup.confirm}
                          onChange={updateSignup("confirm")}
                          required
                          placeholder="Re-enter password"
                          className={inputCls}
                        />
                      </FieldShell>
                    </div>

                    <button
                      type="submit"
                      disabled={signupBusy}
                      className="mt-6 w-full h-14 rounded-full bg-gradient-to-r from-[#5E23DC] to-[#7c3aed] text-white text-base font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#6C35DE]/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {signupBusy ? "Sending code…" : "Send verification code"}
                    </button>

                    <p className="mt-6 text-center text-sm text-gray-500">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("signin")}
                        className="font-semibold text-[#6C35DE] hover:underline"
                      >
                        Sign in
                      </button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={createAccount}>
                    <div className="mb-8">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Verify your mobile
                      </h1>
                      <p className="mt-2 text-sm sm:text-base text-gray-500">
                        Enter the code sent to {signup.phone}.
                      </p>
                    </div>

                    <FieldShell htmlFor="signup-otp" label="Verification code" icon={LuLockKeyhole}>
                      <input
                        id="signup-otp"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\s/g, ""))}
                        required
                        placeholder="Enter code"
                        className={`${inputCls} tracking-[0.3em]`}
                      />
                    </FieldShell>

                    <button
                      type="submit"
                      disabled={signupBusy}
                      className="mt-6 w-full h-14 rounded-full bg-gradient-to-r from-[#5E23DC] to-[#7c3aed] text-white text-base font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#6C35DE]/25 transition-all hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {signupBusy ? "Creating account…" : "Create account"}
                    </button>

                    <div className="mt-5 flex items-center justify-between text-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage("");
                          setSignupStep("details");
                        }}
                        className="font-medium text-gray-500 hover:text-gray-700"
                      >
                        ← Edit details
                      </button>
                      <button
                        type="button"
                        onClick={sendCode}
                        disabled={signupBusy}
                        className="font-semibold text-[#6C35DE] hover:underline disabled:opacity-60"
                      >
                        Resend code
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
