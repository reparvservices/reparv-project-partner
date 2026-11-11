import React, { useState } from "react";
import houseImage from "../../assets/company/house.png";
import RegistrationForm from "./SalesRegister";
import TRegistrationForm from "./TerritoryRegister";
import { useAuth } from "../../store/auth";

const PartnerRegistrationPage = () => {
    const {projectPartner}=useAuth()
  const [activeTab, setActiveTab] = useState("sales");

  return (
    <section className="bg-gradient-to-b from-[#F9FAFF] to-white py-16 sm:py-18 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-14 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#5E23DC] leading-tight">
            Become a Reparv Partner
          </h1>
         <p className="mt-4 text-gray-600 text-sm sm:text-base lg:text-lg">
  Join <span className="font-semibold text-[#5E23DC]">
    {projectPartner || "our trusted partner"}
  </span>{" "}
  ecosystem and unlock sustainable earning opportunities with Reparv.
</p>

        </div>

        {/* HERO */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl mb-14 group">
          <img
            src={houseImage}
            alt="Reparv Partner"
            className="w-full h-[220px] sm:h-[300px] lg:h-[360px] object-cover
                       transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70 flex items-center justify-center">
            <h2 className="text-white text-xl sm:text-3xl lg:text-4xl font-semibold tracking-wide animate-slide-up">
              Grow with Reparv 🚀
            </h2>
          </div>
        </div>

        {/* TAB SWITCH */}
        <div className="flex justify-center mb-12">
          <div className="relative flex bg-[#2D136B] rounded-full p-1 w-full max-w-lg shadow-lg">

            {/* Animated Indicator */}
            <span
              className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-[#5E23DC]
                transition-all duration-300 ease-in-out
                ${activeTab === "sales" ? "left-1" : "left-1/2"}
              `}
            />

            <button
              onClick={() => setActiveTab("sales")}
              className={`relative z-10 flex-1 py-3 rounded-full text-sm sm:text-base font-medium
                transition-colors duration-300
                ${activeTab === "sales" ? "text-white" : "text-white/70 hover:text-white"}
              `}
            >
              Sales Partner
            </button>

            <button
              onClick={() => setActiveTab("territory")}
              className={`relative z-10 flex-1 py-3 rounded-full text-sm sm:text-base font-medium
                transition-colors duration-300
                ${activeTab === "territory" ? "text-white" : "text-white/70 hover:text-white"}
              `}
            >
              Territory Partner
            </button>
          </div>
        </div>

        {/* FORM (ANIMATED SWITCH) */}
        <div
          key={activeTab}
          className="animate-fade-slide w-full  sm:max-w-4xl mx-auto"
        >
          {activeTab === "sales" && <RegistrationForm />}
          {activeTab === "territory" && <TRegistrationForm />}
        </div>

      </div>
    </section>
  );
};

export default PartnerRegistrationPage;
