import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import houseImage from "../../assets/company/house.png";
import { useAuth } from "../../store/auth";
import ReCAPTCHA from "react-google-recaptcha";

export default function PartnerRegistrationModal({
  isOpen,
  onClose,
  setSuccessOpen,
}) {
  const [activeTab, setActiveTab] = useState("sales");
  const {
    URI,
    setSuccessScreen,
    currentProjectPartner,
    setRole,
    projectPartner,
  } = useAuth();

  const [newPartner, setNewPartner] = useState({
    fullname: "",
    contact: "",
    email: "",
    username: "",
    password: "",
    state: "",
    city: "",
    projectpartnerid: currentProjectPartner || "",
    intrest: "Passion for Real Estate Industry",
    refrence: "",
  });
  const [captchaToken, setCaptchaToken] = useState(null);
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const validateForm = () => {
    const { fullname, contact, email, password, state, city } = newPartner;

    if (!fullname.trim()) return "Full Name is required";
    if (!contact.trim()) return "Phone number is required";
    if (contact.length !== 10) return "Phone number must be 10 digits";
    if (!email.trim()) return "Email is required";
    if (!isValidEmail(email)) return "Invalid email format";
    if (!password.trim()) return "Password is required";

    return null;
  };

  const handleSalesSubmit = async (e) => {
    e.preventDefault();

    const errorMessage = validateForm();
    if (errorMessage) {
      alert(errorMessage);
      return;
    }

    const apiUrl =
      activeTab === "territory"
        ? `${URI}/admin/territorypartner/add`
        : `${URI}/admin/salespersons/add`;

    const payload = {
      ...newPartner,
      projectpartnerid: currentProjectPartner || "",
    };

    setRole(activeTab);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await response.json();
        onClose();
        setSuccessOpen();
        //   setSuccessScreen({
        //     show: true,
        //     label: "Your Data Sent Successfully",
        //     description:
        //       activeTab === "territory"
        //         ? "Join as a Territory Partner"
        //         : "Join as a Sales Partner",
        //   });
      } else {
        const errorRes = await response.json();
        alert(errorRes.message || "Submission failed");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  // 🔒 Lock body scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 cursor-pointer" onClick={onClose}
    >
      {/* MODAL CARD */}
      <div
        className="
    w-full max-w-4xl
    bg-[#F8F5FF]
    rounded-[32px]
    shadow-[0_25px_50px_-12px_rgba(94,35,220,0.28)]
    p-6 sm:p-10
    relative
    animate-fadeIn

    max-h-[90vh] overflow-y-auto   /* ✅ MOBILE SCROLL */
    sm:max-h-none sm:overflow-visible /* ✅ DESKTOP SAME AS BEFORE */
        "
            onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg font-bold"
        >
          ✕
        </button>

        {/* TAB SWITCH */}
        <div className="flex justify-center mb-6">
          <div className="relative flex bg-[#2D136B] rounded-full p-1 w-full max-w-md">
            <span
              className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-[#5E23DC]
                transition-all duration-300 
                ${activeTab === "sales" ? "left-1" : "left-1/2"}
              `}
            />
            <button
              onClick={() => setActiveTab("sales")}
              className={`relative z-10 flex-1 py-3 rounded-full font-semibold
                ${activeTab === "sales" ? "text-white" : "text-white/70"}
              `}
            >
              Sales Partner
            </button>
            <button
              onClick={() => setActiveTab("territory")}
              className={`relative z-10 flex-1 py-3 rounded-full font-semibold
                ${activeTab === "territory" ? "text-white" : "text-white/70"}
              `}
            >
              Territory Partner
            </button>
          </div>
        </div>

        {/* DESCRIPTION */}
        <p
          className="
            max-w-[566px]
            mx-auto
            px-4 sm:px-0
            text-center
            text-[#4A5565]
            text-sm sm:text-base
            leading-[22px] sm:leading-[26px]
            font-normal
            font-['Segoe_UI',system-ui]
            mb-6
          "
        >
          Join{" "}
          <span className="font-semibold text-[#5E23DC]">
            {projectPartner || "our trusted partner"}
          </span>{" "}
          ecosystem and unlock sustainable earning opportunities with Reparv.
        </p>

        {/* VIDEO */}
        <div className="w-full sm:px-20 h-[220px] mb-8">
          <div
            key={activeTab}
            className="
              relative w-full h-full
              rounded-2xl overflow-hidden
              bg-black
              shadow-[0_0_50px_rgba(94,35,220,0.45)]
              animate-tvOn
            "
          >
            <iframe
              className="w-full h-full"
              src={
                activeTab === "sales"
                  ? "https://www.youtube.com/embed/vHwfBBpT9bA"
                  : "https://www.youtube.com/embed/snlG3sFiGaI"
              }
              title="Partner Program Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
        {/* FORM */}
        <div
          className="
  grid
  grid-cols-1
  sm:grid-cols-2
  gap-3 sm:gap-4
  px-0 sm:px-20
  mb-6
"
        >
          <input
            value={newPartner.fullname}
            onChange={(e) =>
              setNewPartner({ ...newPartner, fullname: e.target.value })
            }
            className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E23DC] transition"
            placeholder="Full Name"
            required
          />
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={newPartner.contact}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ""); // allow only digits
              if (value.length <= 10) {
                setNewPartner({ ...newPartner, contact: value });
              }
            }}
            required
            className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E23DC] transition"
            placeholder="Phone Number"
          />

          <input
            value={newPartner.email}
            onChange={(e) =>
              setNewPartner({ ...newPartner, email: e.target.value })
            }
            className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E23DC] transition sm:col-span-2"
            placeholder="Email Address"
            type="email"
            required
          />
          <input
            value={newPartner.password}
            onChange={(e) =>
              setNewPartner({ ...newPartner, password: e.target.value })
            }
            className="border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5E23DC] transition sm:col-span-2"
            placeholder="Password"
            type="password"
            required
          />

          {/* <div className="flex justify-center">
  <ReCAPTCHA
    sitekey="YOUR_SITE_KEY_HERE"
    onChange={(token) => setCaptchaToken(token)}
  />
</div>

{errors.captcha && (
  <p className="text-red-500 text-sm text-center">{errors.captcha}</p>
)} */}

        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <button
            onClick={handleSalesSubmit}
            className="w-full sm:w-auto sm:px-20 bg-[#5E23DC] hover:bg-[#4b1bbd] text-white py-3 rounded-xl font-semibold transition"
          >
            Register Now
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
