import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiEdit2,
  FiLock,
  FiMessageSquare,
  FiRefreshCw,
  FiRepeat,
  FiX,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import popImage from "../../assets/projectpartner/pop-image.png";
import reparvLogo from "../../assets/layout/reparvMainLogo.svg";
import { useAuth } from "../../store/auth";
import { sendPartnerJoinOtp, completePartnerJoin } from "../../lib/partnerJoinApi";

const BENEFITS = [
  "Daily Property Leads",
  "Business Growth Opportunities",
  "Lead Tracking Dashboard",
  "Relationship Manager Support",
  "Marketing Assistance",
];

const RESEND_SECONDS = 60;

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
}

function BrandPanel() {
  return (
    <div className="relative flex h-full min-h-[240px] sm:min-h-[280px] lg:min-h-full flex-col bg-gradient-to-b from-[#7B3FE4] via-[#6B46FE] to-[#6D28D9] px-5 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="w-full shrink-0">
        <img
          src={reparvLogo}
          alt="Reparv"
          className="h-8 sm:h-9 w-auto brightness-0 invert"
        />
        <p className="mt-1 text-[11px] sm:text-xs text-white/80 tracking-wide">
          Truth. Trust. Transparency.
        </p>
      </div>

      <div className="flex w-full flex-1 items-center justify-center py-4">
        <img
          src={popImage}
          alt="Reparv Partner"
          className="h-auto w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[320px] max-h-[240px] sm:max-h-[300px] lg:max-h-[420px] object-contain"
        />
      </div>

      <p className="w-full shrink-0 text-center text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.2em] text-white/60">
        Powering growth for agencies
      </p>
    </div>
  );
}

function OtpInputs({ value, onChange, disabled }) {
  const refs = useRef([]);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  const setDigit = (index, digit) => {
    const next = digits.map((d, i) => (i === index ? digit : d === " " ? "" : d));
    onChange(next.join("").replace(/\s/g, "").slice(0, 6));
    if (digit && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = normalizePhone(e.clipboardData.getData("text")).slice(0, 6);
    if (!pasted) return;
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={digit.trim()}
          onChange={(e) => setDigit(index, normalizePhone(e.target.value).slice(-1))}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="h-10 w-9 sm:h-12 sm:w-10 rounded-lg border border-gray-200 bg-gray-50 text-center text-base sm:text-lg font-bold text-gray-900 focus:border-[#5E23DC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E23DC]/20 disabled:opacity-60"
        />
      ))}
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export default function JoinPartnerModal({ isOpen, onClose }) {
  const { URI } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("phone");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  // Sign-in details: partners log in with email (or username) + password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [whatsappSent, setWhatsappSent] = useState(true);
  const [resendIn, setResendIn] = useState(0);

  const reset = useCallback(() => {
    setStep("phone");
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setOtp("");
    setError("");
    setSuccessMessage("");
    setWhatsappSent(true);
    setLoading(false);
    setResendIn(0);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      reset();
      return undefined;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, reset]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  const handleSendOtp = async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const normalized = normalizePhone(phone);

    if (!trimmedFirst) {
      setError("First name is required");
      return;
    }
    if (!trimmedLast) {
      setError("Last name is required");
      return;
    }
    if (normalized.length !== 10) {
      setError("Enter a valid 10-digit WhatsApp number");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await sendPartnerJoinOtp(URI, normalized, email.trim().toLowerCase());
      setPhone(normalized);
      setOtp("");
      setStep("otp");
      setResendIn(RESEND_SECONDS);
    } catch (e) {
      setError(e.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0 || loading) return;
    setLoading(true);
    setError("");
    try {
      await sendPartnerJoinOtp(URI, phone, email.trim().toLowerCase());
      setResendIn(RESEND_SECONDS);
    } catch (e) {
      setError(e.message || "Could not resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await completePartnerJoin(URI, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone,
        otp,
        email: email.trim().toLowerCase(),
        password,
      });
      setSuccessMessage(
        result.message ||
          "Your partner account is ready. Log in with your email and password.",
      );
      setWhatsappSent(result.whatsappSent !== false);
      setStep("success");
    } catch (e) {
      setError(e.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-[2px] p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
      role="presentation"
    >
      {step === "phone" ? (
        <div
          className="relative w-[calc(100%-1.25rem)] max-w-[400px] sm:max-w-[920px] max-h-[92vh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-2xl sm:rounded-[28px] bg-white shadow-2xl animate-screenPop"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
            aria-label="Close"
          >
            <FiX size={16} />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] lg:min-h-[580px]">
            <div className="hidden lg:block h-full">
              <BrandPanel />
            </div>

            <div className="px-4 py-5 sm:px-8 sm:py-10 lg:px-10">
              <div className="flex items-center gap-2 mb-3 lg:hidden">
                <img src={reparvLogo} alt="Reparv" className="h-6 w-auto" />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3EEFF] px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-[#5E23DC]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5E23DC]" />
                Partner registration
              </span>

              <h2 className="mt-2 sm:mt-4 text-lg sm:text-2xl lg:text-[32px] font-bold text-[#0F172A] leading-snug">
                Become a <span className="text-[#5E23DC]">Reparv Partner</span>
              </h2>
              <p className="hidden sm:block mt-3 text-sm sm:text-base text-gray-500 max-w-lg leading-relaxed">
                Grow your real-estate business with verified property leads, marketing support,
                and advanced business tools.
              </p>

              <ul className="hidden md:grid mt-6 grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                {BENEFITS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <FiCheck size={12} strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-4 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    First name
                  </label>
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1.5 sm:mt-2 w-full rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#5E23DC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E23DC]/15"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Last name
                  </label>
                  <input
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1.5 sm:mt-2 w-full rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#5E23DC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E23DC]/15"
                  />
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  WhatsApp number
                </label>
                <div className="mt-1.5 sm:mt-2 flex items-center gap-2 rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 px-3 py-1.5 sm:py-2 focus-within:border-[#5E23DC] focus-within:ring-2 focus-within:ring-[#5E23DC]/15">
                  <span className="inline-flex items-center gap-1.5 border-r border-gray-200 pr-2.5 text-xs sm:text-sm font-semibold text-gray-700">
                    <span className="text-sm leading-none">🇮🇳</span>
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="WhatsApp number"
                    value={phone}
                    onChange={(e) => setPhone(normalizePhone(e.target.value))}
                    className="min-w-0 flex-1 bg-transparent py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Email (used to log in)
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 sm:mt-2 w-full rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#5E23DC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E23DC]/15"
                />
              </div>

              <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 sm:mt-2 w-full rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#5E23DC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E23DC]/15"
                  />
                </div>
                <div>
                  <label className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Confirm password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1.5 sm:mt-2 w-full rounded-xl sm:rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 sm:px-4 sm:py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#5E23DC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E23DC]/15"
                  />
                </div>
              </div>
              <label className="mt-2 inline-flex items-center gap-2 text-xs text-gray-500 select-none">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="accent-[#5E23DC]"
                />
                Show password
              </label>

              {error ? (
                <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-red-600">{error}</p>
              ) : null}

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={
                  loading ||
                  !firstName.trim() ||
                  !lastName.trim() ||
                  phone.length !== 10 ||
                  !email.trim() ||
                  !password ||
                  !confirmPassword
                }
                className="mt-4 sm:mt-6 flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-[#5E23DC] px-4 py-3 sm:px-6 sm:py-3.5 text-sm font-semibold text-white transition hover:bg-[#4b1cc0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending OTP…" : "Verify Now"}
                {!loading ? <FiArrowRight size={16} /> : null}
              </button>

              <p className="mt-3 sm:mt-5 text-center text-[10px] sm:text-xs text-gray-400 leading-relaxed">
                By continuing, you agree to our{" "}
                <Link to="/terms-and-conditions" onClick={onClose} className="text-[#5E23DC] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" onClick={onClose} className="text-[#5E23DC] hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      ) : step === "otp" ? (
        <div
          className="relative w-[calc(100%-1.25rem)] max-w-[400px] max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-[28px] bg-white px-4 py-6 sm:px-8 sm:py-10 shadow-2xl animate-screenPop"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:text-gray-800"
            aria-label="Close"
          >
            <FiX size={16} />
          </button>

          <div className="mx-auto flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-[#F3EEFF] text-[#5E23DC]">
            <FiMessageSquare size={20} />
          </div>

          <h2 className="mt-4 text-center text-lg sm:text-2xl font-bold text-[#0F172A]">
            Verify WhatsApp Number
          </h2>
          <p className="mt-1.5 text-center text-xs sm:text-sm text-gray-500">
            Enter the 6-digit code sent to your WhatsApp.
          </p>

          <div className="mt-4 mx-auto flex max-w-xs items-center justify-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
            <FaWhatsapp className="text-[#25D366]" size={18} />
            <span className="text-sm font-semibold text-gray-800">+91 {phone}</span>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
              }}
              className="ml-1 text-[#5E23DC] hover:text-[#4b1cc0]"
              aria-label="Change number"
            >
              <FiEdit2 size={15} />
            </button>
          </div>

          <div className="mt-4 sm:mt-6">
            <OtpInputs value={otp} onChange={setOtp} disabled={loading} />
          </div>

          {error ? (
            <p className="mt-2 text-center text-xs sm:text-sm text-red-600">{error}</p>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-2 text-xs sm:text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={loading || resendIn > 0}
              className="inline-flex items-center gap-1.5 font-medium text-[#5E23DC] disabled:text-gray-400"
            >
              <FiRefreshCw size={15} />
              {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
              }}
              className="inline-flex items-center gap-1.5 font-medium text-[#5E23DC]"
            >
              <FiRepeat size={15} />
              Change Number
            </button>
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            className="mt-4 sm:mt-6 flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-[#5E23DC] px-4 py-3 sm:py-3.5 text-sm font-semibold text-white transition hover:bg-[#4b1cc0] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying…" : "Verify & Continue"}
            {!loading ? <FiArrowRight size={16} /> : null}
          </button>

          <p className="mt-3 sm:mt-5 flex items-center justify-center gap-1.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            <FiLock size={12} />
            End-to-end encrypted verification
          </p>
        </div>
      ) : (
        <div
          className="relative w-[calc(100%-1.25rem)] max-w-[400px] max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-[28px] bg-white px-4 py-6 sm:px-8 sm:py-10 shadow-2xl animate-screenPop"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:text-gray-800"
            aria-label="Close"
          >
            <FiX size={16} />
          </button>

          <div className="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <FiCheckCircle size={28} />
          </div>

          <h2 className="mt-4 text-center text-lg sm:text-2xl font-bold text-[#0F172A]">
            You&apos;re all set
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600 leading-relaxed">
            {successMessage}
          </p>

          {whatsappSent ? (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs sm:text-sm text-emerald-800">
              <FaWhatsapp size={18} className="text-[#25D366] shrink-0" />
              <span>
                App link sent to <strong>+91 {phone}</strong>
              </span>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs sm:text-sm text-amber-900">
              Account created. The WhatsApp app link could not be sent — you can still log in on the web.
            </div>
          )}

          <p className="mt-3 text-center text-[10px] sm:text-xs text-gray-500">
            Log in with <strong>{email.trim().toLowerCase()}</strong> and the password you chose.
          </p>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/login");
            }}
            className="mt-4 sm:mt-6 flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-[#5E23DC] px-4 py-3 sm:py-3.5 text-sm font-semibold text-white transition hover:bg-[#4b1cc0]"
          >
            Log in now
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
}
