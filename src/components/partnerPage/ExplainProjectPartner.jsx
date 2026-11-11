import { FaHeadphonesAlt } from "react-icons/fa";
import { PiUsersThreeDuotone } from "react-icons/pi";
import { TbLayoutDashboard } from "react-icons/tb";
import { IoPeopleCircleOutline } from "react-icons/io5";
import {
  FiBriefcase,
  FiCheckCircle,
  FiFileText,
  FiHome,
  FiKey,
  FiLock,
  FiMapPin,
  FiPackage,
  FiShoppingBag,
} from "react-icons/fi";
import { FiMonitor } from "react-icons/fi";
import { FiHeadphones } from "react-icons/fi";
import { FiUsers } from "react-icons/fi";
import { FiStar } from "react-icons/fi";
import { FiTrendingUp } from "react-icons/fi";
import StateBg from "../../assets/projectpartner/states.png";
import { services } from "../../utils";
import MyAndroid from "../../assets/projectpartner/image.png";

export default function ProjectPartnerSection() {
  const cards = [
    {
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.5 16.3333H7C7.61884 16.3333 8.21233 16.5792 8.64992 17.0168C9.0875 17.4543 9.33333 18.0478 9.33333 18.6667V22.1667C9.33333 22.7855 9.0875 23.379 8.64992 23.8166C8.21233 24.2542 7.61884 24.5 7 24.5H5.83333C5.21449 24.5 4.621 24.2542 4.18342 23.8166C3.74583 23.379 3.5 22.7855 3.5 22.1667V14C3.5 11.2152 4.60625 8.54451 6.57538 6.57538C8.54451 4.60625 11.2152 3.5 14 3.5C16.7848 3.5 19.4555 4.60625 21.4246 6.57538C23.3938 8.54451 24.5 11.2152 24.5 14V22.1667C24.5 22.7855 24.2542 23.379 23.8166 23.8166C23.379 24.2542 22.7855 24.5 22.1667 24.5H21C20.3812 24.5 19.7877 24.2542 19.3501 23.8166C18.9125 23.379 18.6667 22.7855 18.6667 22.1667V18.6667C18.6667 18.0478 18.9125 17.4543 19.3501 17.0168C19.7877 16.5792 20.3812 16.3333 21 16.3333H24.5"
            stroke="#155DFC"
            stroke-width="2.66667"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      ),
      title: "Developer’s Sales Support Partner",
      desc: "Helps developers sell their project faster using Reparv’s technology and market network.",
      bg: "bg-blue-50",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_438_1619)">
            <path
              d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
              stroke="#009966"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
              stroke="#009966"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M17 11L19 13L23 9"
              stroke="#009966"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_438_1619">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
      ),
      title: "Gets Verified Buyer Leads",
      desc: "Receives high-quality, high-intent leads from Reparv to boost sales conversions.",
      bg: "bg-green-50",
    },
    {
      icon: (
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
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M24.4997 3.5H16.333V11.6667H24.4997V3.5Z"
            stroke="#9810FA"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M24.4997 16.3333H16.333V24.4999H24.4997V16.3333Z"
            stroke="#9810FA"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M11.6667 16.3333H3.5V24.4999H11.6667V16.3333Z"
            stroke="#9810FA"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      ),
      title: "Access to Tech Dashboard",
      desc: "Manages inventory, project updates, and lead tracking in one platform with full transparency.",
      bg: "bg-purple-50",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
            stroke="#E17100"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
            stroke="#E17100"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M23 20.9999V18.9999C22.9993 18.1136 22.7044 17.2527 22.1614 16.5522C21.6184 15.8517 20.8581 15.3515 20 15.1299"
            stroke="#E17100"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M16 3.12988C16.8604 3.35018 17.623 3.85058 18.1676 4.55219C18.7122 5.2538 19.0078 6.11671 19.0078 7.00488C19.0078 7.89305 18.7122 8.75596 18.1676 9.45757C17.623 10.1592 16.8604 10.6596 16 10.8799"
            stroke="#E17100"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      ),
      title: "Builds Their Own Sales Team",
      desc: "Can create and manage a team to increase reach, close more deals, and scale like a business.",
      bg: "bg-yellow-50",
    },
  ];

  const cards2 = [
    {
      title: "Guaranteed High-Quality Leads",
      desc: "Reparv provides continuous verified buyer leads so you spend less time searching and more time closing.",
      icon: FiCheckCircle,
    },
    {
      title: "Personalized Landing Page",
      desc: "Get your personalized brand landing page and attract genuine clients backed by Reparv’s trusted brand.",
      icon: FiMonitor,
      popular: true,
    },
    {
      title: "Complete Tech Support",
      desc: "Use our dashboard for lead tracking, project management, and transparent sales reporting.",
      icon: FiHeadphones,
    },
    {
      title: "Build Your Own Sales Team",
      desc: "Scale like a business—hire, manage, and grow your team with Reparv’s training and support.",
      icon: FiUsers,
    },
    {
      title: "Strong Brand Backing",
      desc: "Work under a trusted, growing real estate tech brand that enhances your credibility with clients.",
      icon: FiStar,
    },
    {
      title: "Growth tools",
      desc: "Analytics dashboard to track performance and optimization.",
      icon: FiTrendingUp,
    },
  ];

  return (
    <div className="w-full px-0">
      <div className="w-full bg-white py-10 px-4 md:px-8 lg:px-20">
        {/* Heading */}
        <h2 className="text-3xl px-10 sm:text-4xl md:text-5xl font-bold text-center text-[#111827] leading-tight">
          What is a Project
          <br className="block md:hidden" /> {/* mobile break */}
          <span className="md:whitespace-nowrap">Partner?</span>
        </h2>

        <p className="text-center text-[14px] md:text-lg sm:text-lg  text-gray-500 mt-3 lg:text-lg">
          Join a network of trusted professionals delivering excellence across
          India
        </p>

        {/* Cards */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cards.map((card, index) => (
            <div
              key={index}
              className="
        group
        border border-[#E5E7EB] rounded-2xl p-8 bg-white shadow-sm
        transition-all duration-300 cursor-pointer
        hover:border-green-500 active:border-green-500
      "
            >
              {/* ICON */}
              <div
                className={`
          w-14 h-14 rounded-xl flex items-center justify-center ${card.bg}
          transition-all duration-300
          origin-bottom-right group-active:scale-110 group-active:translate-x-1 group-active:translate-y-1 group-hover:scale-110 group-hover:translate-x-1 group-hover:translate-y-1
        `}
              >
                {card.icon}
              </div>

              {/* TITLE */}
              <h3
                className="
          mt-5 text-xl font-semibold text-gray-900 leading-snug
          transition-all duration-300
          group-hover:translate-x-1 group-hover:translate-y-1  group-active:translate-x-1 group-active:translate-y-1
        "
              >
                {card.title}
              </h3>

              {/* DESCRIPTION */}
              <p
                className="
          mt-3 text-gray-500 text-[15px] leading-relaxed
          transition-all duration-300
          group-hover:translate-x-1 group-hover:translate-y-1   group-active:translate-x-1 group-active:translate-y-1 
        "
              >
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div
          className="
    mt-20 
    w-[100%] lg:w-[80%]  /* Adjust width for different screens */
    max-w-7xl             /* Optional: limit maximum width */
    rounded-3xl 
    relative 
    overflow-hidden
    bg-gradient-to-r from-[#E6F9F0] via-[#F1FFF8] to-[#E6F9F0]
    p-10 
    flex flex-col md:flex-row 
    items-center justify-between
    text-center md:text-left
    mx-auto              /* Center the container horizontally */
  "
        >
          {/* Content */}
          {/* Background IMAGE with 20% opacity */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${StateBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.2,
            }}
          ></div>

          {/* CONTENT (must be above image) */}
          <div className="relative z-10 w-full flex p-3 flex-col md:flex-row items-center justify-between gap-10 md:gap-0">
            {/* Stat 1 */}
            <div className="transition-all duration-300 group-hover:translate-y-[-3px] group-hover:scale-[1.02] group-active:translate-y-[-3px] group-active:scale-[1.02]">
              <p className="text-4xl font-extrabold text-green-600">500+</p>
              <p className="text-gray-600 mt-1">Active Partners</p>
            </div>

            <div className="hidden md:block h-16 w-[1px] bg-gray-300"></div>

            {/* Stat 2 */}
            <div>
              <p className="text-4xl font-extrabold text-blue-600">10,000+</p>
              <p className="text-gray-600 mt-1">Projects Completed</p>
            </div>

            <div className="hidden md:block h-16 w-[1px] bg-gray-300"></div>

            {/* Stat 3 */}
            <div>
              <p className="text-4xl font-extrabold text-purple-600">₹50Cr+</p>
              <p className="text-gray-600 mt-1">Partner Earnings</p>
            </div>

            <div className="hidden md:block h-16 w-[1px] bg-gray-300"></div>

            {/* Stat 4 */}
            <div>
              <p className="text-4xl font-extrabold text-orange-500">4.8/5</p>
              <p className="text-gray-600 mt-1">Partner Rating</p>
            </div>
          </div>
        </div>
      </div>

      <section
        className="lg:py-20 px-4  "
        style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)",
        }}
      >
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block bg-[#DFFFEF] text-green-700  px-6 py-1 rounded-full mb-4">
            Exclusive Benefits
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-4xl md:text-5xl font-bold text-center text-[#111827]">
            Why Partner with Us?
          </h2>

          <p className="text-[14px] text-gray-500 mt-2 lg:text-lg md:text-lg sm:text-lg">
            Unlock exclusive benefits designed to accelerate your business
            growth
          </p>
        </div>

        {/* Cards Grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cards2.map((card, i) => {
            const IconComponent = card.icon; // get icon component
            return (
              <div
                key={i}
                className={`
        relative group bg-white border border-[#E5E7EB] rounded-2xl p-8 
        shadow-[0_0_16px_rgba(0,0,0,0.03)] transition-all duration-300
        hover:shadow-[0_0_32px_rgba(0,255,160,0.25)] hover:border-green-500 active:shadow-[0_0_32px_rgba(0,255,160,0.25)] active:border-green-500
      `}
                style={
                  card.popular
                    ? {
                        background: "#FFFFFF", // card background
                        border: "2px solid #00D492", // green border
                        borderRadius: "16px", // rounded corners
                        boxShadow:
                          "0px 20px 25px -5px #D0FAE5, 0px 8px 10px -6px #D0FAE5", // bottom shadow
                      }
                    : {}
                }
              >
                {/* Most Popular Badge */}
                {card.popular && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-sm font-medium px-4 py-1 rounded-full shadow-md transition-all duration-300 group-hover:scale-110 group-active:scale-110"
                    style={{
                      background:
                        "linear-gradient(135deg, #00BC7D 0%, #00C950 100%)",
                    }}
                  >
                    Most Popular
                  </div>
                )}

                {/* Icon Box */}

                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300
    group-hover:scale-120 group-hover:-translate-y-2 group-active:scale-120 group-active:-translate-y-2  ${
      card.popular ? "text-white" : "bg-[#E7FFF5] text-green-600"
    }
  `}
                  style={
                    card.popular
                      ? {
                          background:
                            "linear-gradient(135deg, #00BC7D 0%, #00C950 100%)",
                        }
                      : {}
                  }
                >
                  <IconComponent
                    className={`text-3xl ${
                      card.popular ? "text-white" : "text-green-600"
                    }`}
                  />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 leading-snug">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-gray-500 text-[15px] leading-relaxed">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="py-16 px-4 md:px-8 lg:px-16 bg-white">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Our Services
          </h2>
          <p className="mt-2 text-gray-500">
            Partnering across diverse project categories to serve every need
          </p>
        </div>

        {/* Services Grid */}
        <div
          className="
  grid 
  grid-cols-2 
  sm:grid-cols-3 
  md:grid-cols-5 
  gap-6 
  sm:gap-8 
  lg:gap-10 
  max-w-6xl 
  mx-auto 
  place-items-center
"
        >
          {services.map((service, idx) => {
            const IconComponent = service.icon;

            return (
              <div key={idx} className="flex flex-col items-center">
                {/* Card */}
                <div
                  className="
          group relative flex items-center justify-center 
          w-[160px] h-[120px]
          bg-white border border-[#E5E7EB] 
          rounded-[15px] p-4 
          transition-all duration-300 
          hover:bg-[#ECFDF5] hover:border-[#009966]
           active:bg-[#ECFDF5] active:border-[#009966]
        "
                >
                  {/* SVG wrapper */}
                  <div className="relative w-[84px] h-[84px] transition-transform duration-300 group-hover:scale-110 group-active:scale-110">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative w-[64px] h-[64px]">
                        <IconComponent />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <span className="text-gray-900 font-semibold text-md text-center mt-2 group-hover:text-[#009966] group-active:text-[#009966]">
                  {service.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="mt-10 text-center flex flex-col items-center">
          <p className="text-gray-500 mb-4">Want to promote your services?</p>

          <button
            className="
      bg-gray-900 text-white px-6 py-3 rounded-lg font-medium
      hover:bg-gray-800 active:bg-gray-800
      transition-colors duration-300
      flex items-center gap-2
    "
          >
            Promote Now
            <span className="text-xl">→</span>
          </button>
        </div>
      </div>
      <div className="w-full py-20 px-4 md:px-10 lg:px-20 bg-gradient-to-b from-[#ECFFF5] to-[#F5F9FF]">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Join in 3 Easy Steps
          </h2>
          <p className="mt-2 text-gray-500 text-[15px]  lg:text-lg md:text-lg sm:text-lg">
            Start your partnership journey today and unlock new opportunities
          </p>
        </div>
        <div className="relative max-w-6xl mx-auto mt-10">
          {/* SINGLE CENTER BACKGROUND GRADIENT LINE */}
          <div
            className="hidden md:block absolute left-1/2 top-1/2 h-[4px] w-[55%] -translate-x-1/2 -translate-y-1/2 z-0"
            style={{
              background:
                "linear-gradient(90deg, #BEDBFF 0%, #A4F4CF 50%, #E9D4FF 100%)",
            }}
          ></div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* STEP 1 */}
            <div
              className="group relative bg-white 
  px-8 py-12 md:px-10 md:py-14 
  rounded-[30px] shadow-[0px_10px_40px_rgba(0,0,0,0.06)]
  transition-all duration-300 hover:shadow-[0px_14px_50px_rgba(0,0,0,0.12)]
  cursor-pointer overflow-hidden active:shadow-[0px_14px_50px_rgba(0,0,0,0.12)]
  w-full max-w-[360px] md:max-w-[380px] lg:max-w-[400px]
  mx-auto"
            >
              {/* Hover Animated Gradient Bar */}
              <div
                className="absolute bottom-0 left-0 h-[6px] 
    bg-gradient-to-r from-[#2B7FFF] to-[#155DFC] 
    w-0 group-hover:w-full group-active:w-full 
    transition-all duration-500 ease-out"
              />

              {/* SERIAL NUMBER */}
              <div
                className="absolute top-6 left-6 bg-[#E7F0FF] text-[#4A7EEF] font-semibold 
    w-12 h-12 md:w-14 md:h-14 
    rounded-xl flex items-center justify-center 
    text-lg md:text-xl"
              >
                1
              </div>

              {/* ICON */}
              <div
                className="w-13 h-13 md:w-20 md:h-20 mx-auto mb-6 
    rounded-full flex items-center justify-center 
    text-4xl text-[#10B56F] transition-all duration-500 
    group-hover:scale-110 group-hover:rotate-6 group-active:scale-110 group-active:rotate-6"
                style={{
                  background:
                    "linear-gradient(135deg, #2B7FFF 0%, #155DFC 100%)",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.3332 28V25.3333C21.3332 23.9188 20.7713 22.5623 19.7711 21.5621C18.7709 20.5619 17.4143 20 15.9998 20H7.99984C6.58535 20 5.2288 20.5619 4.2286 21.5621C3.22841 22.5623 2.6665 23.9188 2.6665 25.3333V28"
                    stroke="white"
                    strokeWidth="2.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11.9998 14.6667C14.9454 14.6667 17.3332 12.2789 17.3332 9.33333C17.3332 6.38781 14.9454 4 11.9998 4C9.05432 4 6.6665 6.38781 6.6665 9.33333C6.6665 12.2789 9.05432 14.6667 11.9998 14.6667Z"
                    stroke="white"
                    strokeWidth="2.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M25.3335 10.6665V18.6665"
                    stroke="white"
                    strokeWidth="2.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M29.3335 14.6665H21.3335"
                    stroke="white"
                    strokeWidth="2.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* TITLE */}
              <h3 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-3">
                Sign Up
              </h3>

              {/* DESCRIPTION */}
              <p className="text-[12px] text-center text-gray-500 text-sm md:text-base px-4">
                Create your partner account in under 5 minutes with basic
                details
              </p>
            </div>

            {/* STEP 2 */}
            <div
              className="group relative bg-white 
  px-8 py-12 md:px-10 md:py-14 
  rounded-[30px] shadow-[0px_10px_40px_rgba(0,0,0,0.06)]
  transition-all duration-300 hover:shadow-[0px_14px_50px_rgba(0,0,0,0.12)]
  cursor-pointer overflow-hidden active:shadow-[0px_14px_50px_rgba(0,0,0,0.12)]
  w-full max-w-[360px] md:max-w-[380px] lg:max-w-[400px]
  mx-auto"
            >
              {/* Hover Gradient Bar (Green) */}
              <div
                className="absolute bottom-0 left-0 h-[6px]
      bg-gradient-to-r from-[#10B56F] to-[#009B55]
      w-0 group-hover:w-full group-active:w-full 
      transition-all duration-500 ease-out"
              />

              {/* Step Badge */}
              <div
                className="absolute top-6 left-6 bg-[#E0F9EA] text-[#10B56F] font-semibold 
    w-12 h-12 md:w-14 md:h-14 
    rounded-xl flex items-center justify-center 
    text-lg md:text-xl"
              >
                2
              </div>

              {/* Icon */}
              <div
                className="w-13 h-13 md:w-20 md:h-20 mx-auto mb-6 
    rounded-full flex items-center justify-center 
    transition-all duration-500 
    group-hover:scale-110 group-hover:rotate-6 group-active:scale-110 group-active:rotate-6"
                style={{
                  background:
                    "linear-gradient(135deg, #00BC7D 0%, #00A63E 100%)",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M26.667 6.6665H5.33366C3.8609 6.6665 2.66699 7.86041 2.66699 9.33317V22.6665C2.66699 24.1393 3.8609 25.3332 5.33366 25.3332H26.667C28.1398 25.3332 29.3337 24.1393 29.3337 22.6665V9.33317C29.3337 7.86041 28.1398 6.6665 26.667 6.6665Z"
                    stroke="white"
                    strokeWidth="2.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2.66699 13.3335H29.3337"
                    stroke="white"
                    strokeWidth="2.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-3">
                Choose Plan
              </h3>

              <p className="text-[12px] text-center text-gray-500 text-sm md:text-base px-4">
                Select the perfect subscription plan that fits your business
                needs
              </p>
            </div>
            {/* STEP 3 */}
            <div
              className="group relative bg-white 
  px-8 py-12 md:px-10 md:py-14 
  rounded-[30px] shadow-[0px_10px_40px_rgba(0,0,0,0.06)]
  transition-all duration-300 hover:shadow-[0px_14px_50px_rgba(0,0,0,0.12)]
  cursor-pointer overflow-hidden active:shadow-[0px_14px_50px_rgba(0,0,0,0.12)]
  w-full max-w-[360px] md:max-w-[380px] lg:max-w-[400px]
  mx-auto"
            >
              {/* Hover Gradient Bar (Purple) */}
              <div
                className="absolute bottom-0 left-0 h-[6px]
      bg-gradient-to-r from-[#A34CFF] to-[#8A2DE0]
      w-0 group-hover:w-full group-active:w-full 
      transition-all duration-500 ease-out"
              />

              {/* Step Badge */}
              <div
                className="absolute top-6 left-6 bg-[#F1E5FF] text-[#A34CFF] font-semibold 
    w-12 h-12 md:w-14 md:h-14 
    rounded-xl flex items-center justify-center 
    text-lg md:text-xl"
              >
                3
              </div>

              {/* Icon */}
              <div
                className="w-13 h-13 md:w-20 md:h-20 mx-auto mb-6 
    rounded-full flex items-center justify-center 
    transition-all duration-500 
    group-hover:scale-110 group-hover:rotate-6 group-active:scale-110 group-active:rotate-6"
                style={{
                  background:
                    "linear-gradient(135deg, #AD46FF 0%, #9810FA 100%)",
                }}
              >
                <svg
                  width="20"
                  height="28"
                  viewBox="0 0 16 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.3 24L1.33333 14.6667V12H6C7.17778 12 8.19444 11.6167 9.05 10.85C9.90556 10.0833 10.4222 9.13333 10.6 8H0V5.33333H10.2C9.82222 4.55556 9.26111 3.91667 8.51667 3.41667C7.77222 2.91667 6.93333 2.66667 6 2.66667H0V0H16V2.66667H11.6667C11.9778 3.04444 12.2556 3.45556 12.5 3.9C12.7444 4.34444 12.9333 4.82222 13.0667 5.33333H16V8H13.3C13.1222 9.88889 12.3444 11.4722 10.9667 12.75C9.58889 14.0278 7.93333 14.6667 6 14.6667H5.03333L14 24H10.3Z"
                    fill="white"
                  />
                </svg>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-3">
                Start Earning
              </h3>

              <p className="text-[12px] text-center text-gray-500 text-sm md:text-base px-4">
                Get verified and start receiving premium projects immediately
              </p>
            </div>
          </div>
        </div>

        {/* CTA BUTTON */}
        <div className="text-center mt-14">
          <button className="px-10 py-4 bg-[#00A870] hover:bg-[#00945F] active:bg-[#00945F] text-white rounded-xl text-lg font-semibold shadow-[0_8px_30px_rgba(0,168,112,0.3)] transition-all duration-300 flex items-center gap-2 mx-auto">
            Get Started Now →
          </button>

          <p className="text-gray-500 mt-3">
            No credit card required • Free 7-day trial
          </p>
        </div>
      </div>

      <section className=" md:px-12 lg:px-32 xl:px-40 px-2 lg:py-16 bg-white w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* LEFT — IMAGE MOCKUP WITH BADGES */}
          <div className="flex-1 flex justify-center relative w-full">
            <div
              className="
    relative w-full            /* full width on mobile */
    max-w-full                 /* allow full width on mobile */
    sm:max-w-[480px]
    md:max-w-[520px]
    lg:max-w-[580px]
    xl:max-w-[620px]
  "
            >
              <img
                src={MyAndroid}
                alt="My Android"
                className="w-full h-auto relative z-0 object-contain"
              />
            </div>
          </div>

          {/* RIGHT — TEXT CONTENT */}
          <div className="flex-1">
            <span className="bg-[#E8ECFF] text-[#3B59F8] text-sm px-4 py-2 rounded-full">
              Mobile App
            </span>

            <h2 className="mt-4 text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Manage Everything On
              <br />
              The Go
            </h2>

            <p className="text-gray-600 mt-4 max-w-xl">
              Our mobile app puts complete control in your hands with powerful
              features designed for partners.
            </p>

            <div className="mt-8 space-y-5">
              {/* ITEM 1 */}
              <div className="flex items-start gap-3 group cursor-pointer">
                <div
                  className="w-[48px] h-[48px] bg-[#D6F5DD] flex items-center justify-center rounded-lg 
      transition-all duration-300 group-hover:bg-[#009966] group-active:bg-[#009966] "
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="transition-all duration-300 group-hover:stroke-white group-active:stroke-white"
                  >
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      className="stroke-[#009966] group-hover:stroke-white group-active:stroke-white transition-all duration-300"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 12L11 14L15 10"
                      className="stroke-[#009966] group-hover:stroke-white group-active:stroke-white transition-all duration-300"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="transition-all duration-300 group-hover:translate-y-[-3px] group-hover:scale-[1.02] group-active:translate-y-[-3px] group-active:scale-[1.02]">
                  <p className="font-semibold text-gray-900">
                    Easy Project Management
                  </p>
                  <p className="text-gray-600 text-sm">
                    Track all your projects in one intuitive dashboard.
                  </p>
                </div>
              </div>

              {/* ITEM 2 */}
              <div className="flex items-start gap-3 group cursor-pointer">
                <div
                  className="w-[48px] h-[48px] bg-[#D6F5DD] flex items-center justify-center rounded-lg 
      transition-all duration-300 group-hover:bg-[#009966] group-active:bg-[#009966]"
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="transition-all duration-300 group-hover:stroke-white group-active:stroke-white"
                  >
                    <path
                      d="M10.2676 21C10.4431 21.304 10.6956 21.5565 10.9996 21.732C11.3037 21.9075 11.6485 21.9999 11.9996 21.9999C12.3506 21.9999 12.6955 21.9075 12.9995 21.732C13.3036 21.5565 13.556 21.304 13.7316 21"
                      className="stroke-[#009966] group-hover:stroke-white group-active:stroke-white transition-all duration-300"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3.26225 15.326C3.13161 15.4692 3.0454 15.6472 3.0141 15.8385C2.9828 16.0298 3.00777 16.226 3.08595 16.4034C3.16414 16.5807 3.29218 16.7316 3.4545 16.8375C3.61682 16.9434 3.80642 16.9999 4.00025 17H20.0002C20.194 17.0001 20.3837 16.9438 20.5461 16.8381C20.7085 16.7324 20.8367 16.5817 20.9151 16.4045C20.9935 16.2273 21.0187 16.0311 20.9877 15.8398C20.9566 15.6485 20.8707 15.4703 20.7402 15.327C19.4102 13.956 18.0002 12.499 18.0002 8C18.0002 6.4087 17.3681 4.88258 16.2429 3.75736C15.1177 2.63214 13.5915 2 12.0002 2C10.4089 2 8.88282 2.63214 7.75761 3.75736C6.63239 4.88258 6.00025 6.4087 6.00025 8C6.00025 12.499 4.58925 13.956 3.26225 15.326Z"
                      className="stroke-[#009966] group-hover:stroke-white group-active:stroke-white transition-all duration-300"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="transition-all duration-300 group-hover:translate-y-[-3px] group-hover:scale-[1.02] group-active:translate-y-[-3px] group-active:scale-[1.02]">
                  <p className="font-semibold text-gray-900">
                    Real-time Notifications
                  </p>
                  <p className="text-gray-600 text-sm">
                    Never miss an opportunity with instant alerts.
                  </p>
                </div>
              </div>

              {/* ITEM 3 */}
              <div className="flex items-start gap-3 group cursor-pointer">
                <div
                  className="w-[48px] h-[48px] bg-[#D6F5DD] flex items-center justify-center rounded-lg 
      transition-all duration-300 group-hover:bg-[#009966] group-active:bg-[#009966]"
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="transition-all duration-300  group-hover:stroke-white group-active:stroke-white"
                  >
                    <path
                      d="M3 3V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H21"
                      className="stroke-[#009966] group-hover:stroke-white group-active:stroke-white transition-all duration-300"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18 17V9"
                      className="stroke-[#009966] group-hover:stroke-white group-active:stroke-white transition-all duration-300"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13 17V5"
                      className="stroke-[#009966] group-hover:stroke-white group-active:stroke-white transition-all duration-300"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 17V14"
                      className="stroke-[#009966] group-hover:stroke-white group-active:stroke-white transition-all duration-300"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="transition-all duration-300 group-hover:translate-y-[-3px] group-hover:scale-[1.02]">
                  <p className="font-semibold text-gray-900">
                    Analytics & Insights
                  </p>
                  <p className="text-gray-600 text-sm">
                    Data-driven insights to grow your business.
                  </p>
                </div>
              </div>

              {/* ITEM 4 */}
              <div className="flex items-start gap-3 group cursor-pointer">
                <div
                  className="w-[48px] h-[48px] bg-[#D6F5DD] flex items-center justify-center rounded-lg 
      transition-all duration-300 group-hover:bg-[#009966]"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="transition-all duration-300 group-hover:stroke-white group-active:stroke-white"
                  >
                    <path
                      d="M19 7V4C19 3.73478 18.8946 3.48043 18.7071 3.29289C18.5196 3.10536 18.2652 3 18 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5C3 5.53043 3.21071 6.03914 3.58579 6.41421C3.96086 6.78929 4.46957 7 5 7H20C20.2652 7 20.5196 7.10536 20.7071 7.29289C20.8946 7.48043 21 7.73478 21 8V12"
                      className="stroke-[#009966] group-hover:stroke-white group-active:stroke-white transition-all duration-300"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H20"
                      className="stroke-[#009966] group-hover:stroke-white group-active:stroke-white transition-all duration-300"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="transition-all duration-300 group-hover:translate-y-[-3px] group-hover:scale-[1.02]">
                  <p className="font-semibold text-gray-900">
                    Seamless Payments
                  </p>
                  <p className="text-gray-600 text-sm">
                    Fast and secure payment processing.
                  </p>
                </div>
              </div>
            </div>

            {/* App Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
              {/* APP STORE BUTTON */}
              <button
                className="
      flex items-center 
      bg-[#101828] rounded-[14px]
      px-4 py-3 gap-3
      h-[60px]
     
      justify-center sm:justify-start
    "
              >
                {/* Icon */}
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 21 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {" "}
                    <path
                      d="M16.8494 23.04C15.5428 24.3067 14.1161 24.1067 12.7428 23.5067C11.2894 22.8933 9.9561 22.8667 8.42277 23.5067C6.50277 24.3333 5.48944 24.0933 4.34277 23.04C-2.1639 16.3333 -1.2039 6.12 6.18277 5.74667C7.98277 5.84 9.2361 6.73333 10.2894 6.81333C11.8628 6.49333 13.3694 5.57333 15.0494 5.69333C17.0628 5.85333 18.5828 6.65333 19.5828 8.09333C15.4228 10.5867 16.4094 16.0667 20.2228 17.6C19.4628 19.6 18.4761 21.5867 16.8361 23.0533L16.8494 23.04ZM10.1561 5.66667C9.9561 2.69333 12.3694 0.24 15.1428 0C15.5294 3.44 12.0228 6 10.1561 5.66667Z"
                      fill="white"
                    />{" "}
                  </svg>
                </div>

                {/* Text */}
                <div className="flex flex-col leading-tight text-left">
                  <span className="text-white text-[12px] font-light">
                    Download on the
                  </span>
                  <span className="text-white text-[15px] font-semibold">
                    App Store
                  </span>
                </div>
              </button>

              {/* GOOGLE PLAY BUTTON */}
              <button
                className="
      flex items-center 
      bg-[#101828] rounded-[14px]
      px-4 py-3 gap-3
      h-[60px]
      
      justify-center sm:justify-start
    "
              >
                {/* Icon */}
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  <svg
                    width="62"
                    height="62"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {" "}
                    <path
                      d="M4.812 2.41846L18.3893 15.9998L4.81334 29.5811C4.57192 29.4796 4.36591 29.309 4.22119 29.0908C4.07647 28.8725 3.99952 28.6163 4 28.3545V3.64512C4.0001 3.38355 4.07714 3.12779 4.22152 2.90967C4.36591 2.69156 4.57125 2.52073 4.812 2.41846ZM19.332 16.9425L22.4013 20.0118L7.81867 28.4558L19.332 16.9425ZM23.5973 12.6785L27.34 14.8465C27.5421 14.9637 27.7098 15.1319 27.8264 15.3343C27.9429 15.5367 28.0043 15.7662 28.0043 15.9998C28.0043 16.2334 27.9429 16.4629 27.8264 16.6653C27.7098 16.8677 27.5421 17.0359 27.34 17.1531L23.596 19.3211L20.2747 15.9998L23.5973 12.6785ZM7.81867 3.54379L22.4027 11.9865L19.332 15.0571L7.81867 3.54379Z"
                      fill="white"
                    />{" "}
                  </svg>
                </div>

                {/* Text */}
                <div className="flex flex-col leading-tight text-left">
                  <span className="text-white text-[12px] font-light">
                    Get it on
                  </span>
                  <span className="text-white text-[15px] font-semibold whitespace-nowrap">
                    Google Play
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
