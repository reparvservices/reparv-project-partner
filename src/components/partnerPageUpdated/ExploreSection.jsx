import React, { useEffect, useRef, useState } from "react";
import { FaHeadphones, FaUserCheck, FaUsers } from "react-icons/fa";
import { TbLayoutDashboard } from "react-icons/tb";
import Ex1 from "../../assets/projectpartner/ex1.png";
import Ex2 from "../../assets/projectpartner/ex2.png";
import StateBg from "../../assets/projectpartner/states.png";
import { services } from "../../utils";
import MyAndroid from "../../assets/projectpartner/image.png";
import StatsSection from "./StateSection";
import ServicesSection from "./OurServices";
import JoinStepsSection from "./JoinSteps";
import MobileAppSection from "./MobileApplication";

const cards = [
  {
    icon: FaHeadphones,
    svg: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.3335 14.1666H4.8335C5.45233 14.1666 6.04583 14.4125 6.48341 14.8501C6.921 15.2876 7.16683 15.8811 7.16683 16.5V20C7.16683 20.6188 6.921 21.2123 6.48341 21.6499C6.04583 22.0875 5.45233 22.3333 4.8335 22.3333H3.66683C3.04799 22.3333 2.4545 22.0875 2.01691 21.6499C1.57933 21.2123 1.3335 20.6188 1.3335 20V11.8333C1.3335 9.04854 2.43974 6.37782 4.40887 4.40869C6.37801 2.43956 9.04872 1.33331 11.8335 1.33331C14.6183 1.33331 17.289 2.43956 19.2581 4.40869C21.2272 6.37782 22.3335 9.04854 22.3335 11.8333V20C22.3335 20.6188 22.0877 21.2123 21.6501 21.6499C21.2125 22.0875 20.619 22.3333 20.0002 22.3333H18.8335C18.2147 22.3333 17.6212 22.0875 17.1836 21.6499C16.746 21.2123 16.5002 20.6188 16.5002 20V16.5C16.5002 15.8811 16.746 15.2876 17.1836 14.8501C17.6212 14.4125 18.2147 14.1666 18.8335 14.1666H22.3335"
          stroke="#155DFC"
          strokeWidth="2.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Developer’s Sales Support Partner",
    desc: "Helps developers sell their project faster using Reparv’s technology and market network.",
    active: true,

    color: "bg-[#DBEAFE] text-violet-600",
  },
  {
    svg: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_297_1694)">
          <path
            d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
            stroke="#009966"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
            stroke="#009966"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 11L19 13L23 9"
            stroke="#009966"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_297_1694">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
    icon: FaUserCheck,
    title: "Gets Verified Buyer Leads",
    desc: "Receives high-quality, high-intent leads from Reparv to boost sales conversions.",
    active: false,
    color: "bg-green-100 text-green-600",
  },
  {
    svg: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11.6667 3.5H3.5V11.6667H11.6667V3.5Z"
          stroke="#9810FA"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24.5002 3.5H16.3335V11.6667H24.5002V3.5Z"
          stroke="#9810FA"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24.5002 16.3333H16.3335V24.5H24.5002V16.3333Z"
          stroke="#9810FA"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.6667 16.3333H3.5V24.5H11.6667V16.3333Z"
          stroke="#9810FA"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    icon: TbLayoutDashboard,
    title: "Access to Tech Dashboard",
    desc: "Manages inventory, project updates, and lead tracking in one platform with full transparency.",
    active: false,
    color: "bg-purple-100 text-purple-600",
  },
  {
    svg: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_297_1703)">
          <path
            d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
            stroke="#E17100"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
            stroke="#E17100"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
            stroke="#E17100"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
            stroke="#E17100"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_297_1703">
            <rect width="24" height="24" fill="white" />
          </clipPath>
        </defs>
      </svg>
    ),
    icon: FaUsers,
    title: "Builds Their Own Sales Team",
    desc: "Can create and manage a team to increase reach, close more deals, and scale like a business.",
    active: false,
    color: "bg-yellow-100 text-yellow-600",
  },
];

const Card = ({ icon: Icon, title, desc, color, svg }) => (
  <div
    className="
    mt-5 sm:mt-0
      group
      relative mb-10 rounded-2xl cursor-pointer
      bg-[#FCFBFF]
      active:bg-[#5E23DC14]
      border border-[rgba(94,35,220,0.14)]
      transition-all duration-300 ease-out
      hover:-translate-y-2 active:-translate-y-2
      shadow-[0px_1px_4px_0px_#0C0C0D0D,0px_4px_18.6px_0px_#5E23DC47] sm:shadow-none sm:hover:shadow-[0px_1px_4px_0px_#0C0C0D0D,0px_4px_18.6px_0px_#5E23DC47]

      w-full sm:w-[300px] md:w-[320px] lg:w-[345px]
      min-h-[190px]
    "
  >
    {/* CLIPPED CORNERS */}
    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
      {/* Top Right */}
      <div className="absolute top-[2px] right-[2px] w-[68px] h-[61px] border-t-[6px] border-r-[6px] border-[#5E23DC] rounded-tr-2xl opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-active:opacity-100 transition-opacity duration-300" />

      {/* Bottom Left */}
      <div className="absolute bottom-[2px] left-[2px] w-[68px] h-[61px] border-b-[6px] border-l-[6px] border-[#5E23DC] rounded-bl-2xl opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-active:opacity-100 transition-opacity duration-300" />
    </div>

    {/* ICON */}
    <div className="relative sm:absolute top-5 left-5 sm:-top-6 sm:left-8 mb-3 sm:mb-0 z-10">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        {svg ? svg : <Icon className="w-6 h-6" />}
      </div>
    </div>

    {/* CONTENT */}
    <div className="relative z-10 flex flex-col gap-2 px-5 pt-4 sm:pt-10 pb-4">
      <h3 className="font-segoe font-semibold text-[17px] leading-[28px] text-[#101828]">
        {title}
      </h3>
      <p className="font-segoe font-normal text-[14px] leading-[26px] text-[#2F2F2F] opacity-80">
        {desc}
      </p>
    </div>
  </div>
);

export default function ProjectPartnerSection() {
  const sliderRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    if (!sliderRef.current) return;

    const interval = setInterval(() => {
      const slider = sliderRef.current;
      const slideWidth = slider.offsetWidth;

      let nextIndex = activeIndex + 1;
      if (nextIndex >= cards.length) nextIndex = 0;

      slider.scrollTo({
        left: slideWidth * nextIndex,
        behavior: "smooth",
      });

      setActiveIndex(nextIndex);
    }, 3000); //  3 seconds

    return () => clearInterval(interval);
  }, [activeIndex, cards.length]);

  return (
    <div className="w-full bg-white px-1 sm:px-4 ">
      <section className="w-full bg-white mt-5 lg:py-10 px-2 sm:px-8 lg:px-25">
        <div className="mx-auto grid grid-cols-1 lg:grid-cols-2 gap-1 items-start">
          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900">
              What is a Project Partner?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl">
              Join a network of trusted professionals delivering excellence
              across India
            </p>

            {/* CARDS */}
            <div className="mt-10">
              {/*MOBILE SLIDER */}
              <div
                ref={sliderRef}
                onScroll={(e) => {
                  const scrollLeft = e.target.scrollLeft;
                  const width = e.target.offsetWidth;
                  setActiveIndex(Math.round(scrollLeft / width));
                }}
                className="
    flex sm:hidden
    overflow-x-auto
    snap-x snap-mandatory
    gap-4
    scrollbar-hide
  "
              >
                {cards.map((card, i) => (
                  <div key={i} className="min-w-full snap-center px-1">
                    <Card {...card} />
                  </div>
                ))}
              </div>

              {/*  DOTS (Mobile Only) */}
              <div className="flex sm:hidden justify-center gap-2 mb-4">
                {cards.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      activeIndex === i ? "bg-[#5A1EDC] w-4" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* 💻 DESKTOP GRID (UNCHANGED) */}
              <div
                className="
      hidden sm:grid
      grid-cols-2
      gap-y-1
      sm:gap-x-6
      md:gap-x-10
      lg:gap-x-60
      xl:gap-x-40
    "
              >
                {cards.map((card, i) => (
                  <Card key={i} {...card} />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT IMAGES */}
          <div className="relative hidden xl:flex  justify-center  top-28 right-30 lg:justify-end">
            <img
              src={Ex1}
              alt="discussion"
              className="w-full max-w-md
                         object-cover
                         rounded-xl
                         transition-all duration-700 ease-out
                         opacity-0 translate-y-10 animate-[fadeUp_0.8s_ease-out_forwards]
                     
                         /* LG SCREEN – FIGMA EXACT */
                         lg:w-[355px]
                         lg:h-[266px]
                         lg:rounded-[12px]
                       "
            />
            <img
              src={Ex2}
              alt="presentation"
              className="hidden sm:block
    absolute
    w-[85%] max-w-sm
    object-cover
    rounded-xl
    shadow-xl

    opacity-0 translate-y-10
    animate-[fadeUp_0.8s_ease-out_0.2s_forwards]

    /* LG SCREEN – FIGMA EXACT */
    lg:w-[355px]
    lg:h-[301px]
    lg:rounded-[12px]
    lg:border-[9px]
    lg:border-white
    lg:top-[153px]
    lg:right-[-130px]
  "
            />
          </div>
        </div>

        {/* Custom animation keyframes */}
        <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      </section>
    </div>
  );
}
