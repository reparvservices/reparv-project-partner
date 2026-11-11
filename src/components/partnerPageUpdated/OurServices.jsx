import React, { useRef, useState } from "react";
import backgroundimage from "../../assets/company/bgofourservices.png";
import { services } from "../../utils";

const ServicesSection = () => {
  const [showAll, setShowAll] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(null);

  const visibleServices = showAll ? services : services.slice(0, 10);
  const slidesCount = Math.ceil(services.length / 8);

  /* 🟣 UPDATE DOTS ON MANUAL SCROLL */
  const handleScroll = () => {
    if (!sliderRef.current) return;
    const index = Math.round(
      sliderRef.current.scrollLeft / sliderRef.current.offsetWidth,
    );
    setActiveIndex(index);
  };

  return (
    <section className="relative bg-[#EDE9FF] text-white py-10 lg:py-20 px-4 md:px-16 lg:px-24 overflow-hidden">
      {/* 🔥 BACKGROUND */}
      <div
        className="absolute inset-0"
        style={{
          // background: `
          //   linear-gradient(106.52deg, rgba(0,153,102,0.5) 12.59%,
          //   rgba(0,188,125,0) 61.68%,
          //   rgba(0,166,62,0.5) 99.8%),
          //   url(${backgroundimage})
          // `,
          backgroundColor: "#EDE9FF",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.3,
          pointerEvents: "none",
        }}
      />

      {/* CONTENT */}
      <div className="relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-[#1F1B2E]">
          Our Services
        </h2>
        <p className="mb-10 text-sm md:text-base text-[#6A7282]">
          Partnering across diverse project categories to serve every need
        </p>

        {/* ================= MOBILE SLIDER ================= */}
        <div className="block sm:hidden">
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          >
            {Array.from({ length: slidesCount }).map((_, slideIdx) => (
              <div key={slideIdx} className="min-w-full snap-center px-2">
                {/* 2 rows x 4 columns */}
                <div className="grid grid-cols-4 grid-rows-2 gap-2 ">
                  {services
                    .slice(slideIdx * 8, slideIdx * 8 + 8)
                    .map((service, idx) => {
                      const IconComponent = service.icon;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            window.open(
                              "https://www.reparv.in" + service.url,
                              "_blank",
                            );
                          }}
                          className="flex flex-col items-center cursor-pointer"
                        >
                          <div className="bg-white w-[70px] h-[60px] rounded-xl flex items-center justify-center">
                            <div className="w-[36px] h-[36px] [&>svg]:w-full [&>svg]:h-full">
                              <IconComponent />
                            </div>
                          </div>
                          <span className="mt-1 text-[10px] text-[#1F1B2E] text-center">
                            {service.title}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {/* DOTS */}
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: slidesCount }).map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition ${
                  activeIndex === idx ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ================= DESKTOP GRID ================= */}
        <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-3 sm:gap-x-8 gap-y-4 sm:gap-y-12">
          {visibleServices.map((service, idx) => {
            const IconComponent = service.icon;

            return (
              <div
                key={idx}
                onClick={() => {
                  window.open("https://www.reparv.in" + service.url, "_blank");
                }}
                className="flex flex-col items-center w-full cursor-pointer"
              >
                <div className="bg-white w-[90px] h-[70px] sm:w-full sm:max-w-[160px] sm:h-[100px] rounded-xl sm:rounded-2xl border border-gray-200 flex items-center justify-center">
                  <div className="w-[42px] h-[42px] sm:w-[56px] sm:h-[56px] [&>svg]:w-full [&>svg]:h-full">
                    <IconComponent />
                  </div>
                </div>
                <span className="mt-1 sm:mt-4 text-[11px] sm:text-[20px] font-medium text-[#1F1B2E] text-center">
                  {service.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 hidden sm:block">
          <p className="text-sm text-[#6A7282] mb-3">
            Can't find what you're looking for?
          </p>

          {!showAll && services.length > 10 && (
            <button
              onClick={() => setShowAll(true)}
              className="bg-white text-purple-700 font-semibold px-6 py-2 rounded-lg shadow hover:bg-white/90 transition flex items-center gap-2 mx-auto"
            >
              View All Services →
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
