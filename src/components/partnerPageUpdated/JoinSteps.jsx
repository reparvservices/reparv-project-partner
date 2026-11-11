import React, { useCallback } from "react";
import mobileView from "../../assets/joinmobile.png";

const steps = [
  {
    step: "1",
    title: "Register your business",
    desc: "Create an account and upload your business credentials and insurance documents.",
  },
  {
    step: "2",
    title: "Set your preferences",
    desc: "Define your service area, hours of operation, and pricing structure.",
  },
  {
    step: "3",
    title: "Go live",
    desc: "Download the app and turn on availability to start receiving job requests instantly.",
  },
];

const scrollToPricing = () => {
  const element = document.getElementById("pricing");
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const JoinStepsSection = () => {
  return (
    <section className="relative w-full bg-white overflow-hidden  lg:px-24 py-1 lg:py-24">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative mb-20">
        {/* LEFT CARD */}
        <div
          className="
            relative bg-white
             sm:rounded-[36px] lg:rounded-[44px]
          
            px-6 sm:px-10 py-10 sm:py-14
             lg:shadow-none
            z-10
          "
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#0F172A]">
            Join in 3 easy steps
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[#64748B] max-w-md leading-relaxed">
            We've streamlined the onboarding process so you can start accepting
            jobs in less than 24 hours.
          </p>

          {/* STEPS */}
          <div className="mt-8 sm:mt-10  sm:space-y-1">
            {steps.map((item, index) => (
              <div key={index} className="flex gap-5 items-start">
                {/* NUMBER */}
                <div className="flex flex-col items-center">
                  <div
                    className="
                      w-8 h-8
                      rounded-full
                      bg-[#6D28D9]
                      text-white
                      flex items-center justify-center
                      text-sm font-semibold
                    "
                  >
                    {item.step}
                  </div>

                  {index !== steps.length - 1 && (
                    <div className="w-[2px] h-26 bg-[#00000014] " />
                  )}
                </div>

                {/* TEXT */}
                <div>
                  <h4 className="text-base sm:text-lg font-semibold text-[#0F172A]">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-sm text-[#64748B] leading-relaxed max-w-sm">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={scrollToPricing}
            className="
              mt-10
              bg-[#6D28D9]
              text-white
              px-8 py-3.5
              rounded-xl
              font-semibold
              shadow-lg
              hover:bg-[#5B21B6]
              transition
            "
          >
            Get Started Now →
          </button>
        </div>

        {/* RIGHT ABSTRACT FIGMA GRAPHIC */}
        <div className="relative flex lg:justify-center items-center w-full">
          <div
            className="
      w-full            /* full width on mobile */
      max-w-[670px]     /* max width matches Figma */
      aspect-[668/684]  /* exact Figma ratio */
      lg:-translate-x-10
       sm:scale-110   /* scales 10% bigger */

    "
          >
            <img
              src={mobileView}
              alt="Mobile App Preview"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinStepsSection;
