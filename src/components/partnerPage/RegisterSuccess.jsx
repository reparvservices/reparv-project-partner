import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { BiCheck } from "react-icons/bi";
import { useAuth } from "../../store/auth";

export default function RegistrationSuccessModal({
  isOpen,
  onClose,
 
}) {
    const {role}=useAuth();
  // lock scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4 cursor-pointer" onClick={onClose}
    >
      {/* MODAL */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-[640px]
          bg-[#F7F4FF]
          rounded-[32px]
          shadow-[0_20px_40px_rgba(94,35,220,0.2)]
          p-6 sm:p-10
          text-center
          animate-scaleIn
         cursor-pointer"
      >
        
        {/* SUCCESS ICON */}
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-[#5E23DC] flex items-center justify-center">
            <BiCheck size={28} color="white" strokeWidth={3} />
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-lg sm:text-xl font-semibold text-[#5E23DC] mb-2">
          Registration Successfully placed
        </h2>

        {/* REG ID */}
        {/* <p className="text-sm text-gray-600 mb-3">
          Your Registration Number is{" "}
          <span className="text-[#5E23DC] font-medium">
            {registrationId}
          </span>
        </p> */}

        {/* DESCRIPTION */}
        <p className="text-sm text-gray-500 max-w-md mx-auto leading-6 mb-6">
          You’ll receive an email confirmation shortly to your registered email.
          <br />
          Your favorite project partner will contact you within 24 hours.
        </p>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button

          onClick={()=>{onClose();
            role==='sales' ? window.location.href="https://sales.reparv.in/" : window.location.href="https://territory.reparv.in/"
          }}
            className="
              h-11 px-6 rounded-lg
              bg-black text-white text-sm font-medium
              hover:bg-black/90 transition
            "
          >
            My Account
          </button>

          <button
            className="
            hidden
              h-11 px-6 rounded-lg
              bg-[#5E23DC] text-white text-sm font-medium
              hover:bg-[#4b1bbd] transition
            "
          >
            Sell Your Property
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
