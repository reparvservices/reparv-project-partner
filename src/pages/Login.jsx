import { useState, useEffect } from "react";
import { MdOutlineMap } from "react-icons/md";
import { FaHandshake, FaBriefcase } from "react-icons/fa";
import { IoEye, IoEyeOff, IoMailOutline } from "react-icons/io5";
import { LuLockKeyhole } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import axios from "../lib/apiClient";
import { useAuth } from "../store/auth";
import { PARTNER_ROLE_CONFIG } from "../lib/partnerAuth";
import ForgotPassword from "../components/ForgotPassword";
import LoginBrandPanel from "../components/login/LoginBrandPanel";
import reparvLogo from "../assets/layout/reparvMainLogo.svg";

const roles = [
  {
    id: "project-partner",
    label: "Project Partner",
    shortLabel: "Project",
    icon: FaBriefcase,
    redirect: "/app/dashboard",
  },
  {
    id: "sales-partner",
    label: "Sales Partner",
    shortLabel: "Sales",
    icon: FaHandshake,
    redirect: "/app/dashboard",
  },
  {
    id: "territory-partner",
    label: "Territory Partner",
    shortLabel: "Territory",
    icon: MdOutlineMap,
    redirect: "/app/dashboard",
  },
];

function AuthGateLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f4ff]">
      <div className="w-10 h-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
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

  const [selectedRole, setSelectedRole] = useState("project-partner");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isPasswordShow, setIsPasswordShow] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (authReady && isLoggedIn) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [authReady, isLoggedIn, navigate]);

  const activeRole = roles.find((r) => r.id === selectedRole);
  const roleConfig = PARTNER_ROLE_CONFIG[selectedRole];

  const userLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedRole || !roleConfig) {
      setErrorMessage("Please select a role to continue.");
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
        navigate(activeRole.redirect, { replace: true });
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

  if (!authReady) {
    return <AuthGateLoader />;
  }

  return (
    <div className="min-h-screen h-screen w-full overflow-hidden">
      {!showForgotPassword ? (
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

            <form
              onSubmit={userLogin}
              className="flex flex-1 flex-col justify-center px-6 py-8 sm:px-10 lg:px-12 xl:px-16"
            >
              <div className="mx-auto w-full max-w-md">
                <div className="mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Sign in
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-gray-500">
                    Choose your partner type and enter your credentials
                  </p>
                </div>

                {errorMessage ? (
                  <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {errorMessage}
                  </div>
                ) : null}

                <div className="mb-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Partner type
                  </p>
                  <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
                    {roles.map((role) => {
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
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-all
                            ${
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
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="login-email"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      Email or username
                    </label>
                    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 h-12 focus-within:border-[#6C35DE] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#6C35DE]/10 transition-all">
                      <IoMailOutline size={18} className="text-gray-400 shrink-0" />
                      <input
                        id="login-email"
                        value={emailOrUsername}
                        required
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        type="text"
                        placeholder="Enter email or username"
                        className="w-full border-none outline-none text-sm text-gray-800 placeholder:text-gray-400 bg-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      Password
                    </label>
                    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 h-12 focus-within:border-[#6C35DE] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#6C35DE]/10 transition-all">
                      <LuLockKeyhole size={17} className="text-gray-400 shrink-0" />
                      <input
                        id="login-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={isPasswordShow ? "text" : "password"}
                        required
                        placeholder="Enter password"
                        className="w-full border-none outline-none text-sm text-gray-800 placeholder:text-gray-400 bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordShow(!isPasswordShow)}
                        className="shrink-0 text-gray-400 hover:text-[#6C35DE] transition-colors"
                        aria-label={
                          isPasswordShow ? "Hide password" : "Show password"
                        }
                      >
                        {isPasswordShow ? (
                          <IoEyeOff size={18} />
                        ) : (
                          <IoEye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
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
                  className="mt-6 w-full h-12 rounded-xl bg-[#6C35DE] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[#5a28c4] disabled:cursor-not-allowed disabled:opacity-70"
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
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex h-full min-h-screen w-full items-center justify-center bg-[#faf8ff] px-4">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_20px_60px_rgba(94,35,220,0.12)]">
            <ForgotPassword
              setShowForgotPassword={setShowForgotPassword}
              roleId={selectedRole}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
