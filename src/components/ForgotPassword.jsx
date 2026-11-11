import React, { useState, useEffect } from "react";
import { IoMail } from "react-icons/io5";
import { IoArrowBack } from "react-icons/io5";
import axios from "../lib/apiClient";
import { useAuth } from "../store/auth";
import { PARTNER_ROLE_CONFIG } from "../lib/partnerAuth";
import Loader from "../components/Loader";

function ForgotPassword({ setShowForgotPassword, roleId = "project-partner" }) {
  const { URI, setLoading } = useAuth();
  const roleConfig = PARTNER_ROLE_CONFIG[roleId] || PARTNER_ROLE_CONFIG["project-partner"];
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const gateNewPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email) {
      setErrorMessage("Email is required.");
      return;
    }
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${URI}${roleConfig.forgotPasswordEndpoint}`,
        { email },
        { withCredentials: true }
      );
      setSuccessMessage(response.data.message);
      setEmail("");
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-3xl shadow-2xl shadow-[#3a12c0]/40">

      {/* ── Compact Gradient Header ── */}
      <div
        className="relative overflow-hidden px-7 py-6"
        style={{
          background: "linear-gradient(145deg, #ffffff 0%, #ede8ff 60%, #d8ccff 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#8E61FF]/10 pointer-events-none" />
        <div className="absolute -bottom-8 -left-5 w-24 h-24 rounded-full bg-[#5323DC]/5 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xl font-semibold text-[#1a0f3c] leading-tight">Forgot Password</p>
            <p className="text-xs text-[#8E61FF] font-medium mt-0.5">We'll send a reset link to your email</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[linear-gradient(135deg,#5323DC,#8E61FF)] flex items-center justify-center shrink-0">
            <IoMail size={20} className="text-white" />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="bg-white px-7 pt-6 pb-7 flex flex-col gap-4">

        {/* Error */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-500 text-xs px-4 py-2.5 rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* Success */}
        {successMessage && (
          <div className="bg-[#f5f1ff] border border-[#c4b8f5] text-[#5323DC] text-xs px-4 py-2.5 rounded-xl">
            {successMessage}
          </div>
        )}

        {/* Email input */}
        <div className={`group flex items-center border-2 rounded-2xl px-4 h-12 transition-all
          ${email ? "border-[#5323DC]" : "border-[#ede8ff] focus-within:border-[#5323DC]"}`}>
          <IoMail className="text-[#c4b8f5] w-4 h-4 mr-3 group-focus-within:text-[#5323DC] transition-colors shrink-0" />
          <input
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email address"
            className="w-full border-none outline-none text-sm text-gray-700 placeholder:text-[#c4b8f5] bg-transparent"
          />
          <Loader />
        </div>

        {/* Submit */}
        <button
          onClick={gateNewPassword}
          className="w-full h-12 bg-[linear-gradient(135deg,#5323DC,#8E61FF)] text-white rounded-2xl text-sm font-semibold transition hover:opacity-90 active:scale-95 shadow-lg shadow-purple-200"
        >
          Send Reset Link
        </button>

        {/* Back to login */}
        <button
          onClick={() => setShowForgotPassword(false)}
          className="flex items-center justify-center gap-2 text-xs text-[#8E61FF] font-medium hover:underline transition-all"
        >
          <IoArrowBack size={14} />
          Back to Login
        </button>

      </div>
    </div>
  );
}

export default ForgotPassword;