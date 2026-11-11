import React, { useState, useCallback, memo } from "react";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { GoLocation } from "react-icons/go";
import { FaUsers } from "react-icons/fa";

import homeImg from "../../assets/home.png";
import heroRightImg from "../../assets/laptophome.png";
import { usePartnerJoin } from "../../context/PartnerJoinContext";

/* ---------- SMALL REUSABLE STAT ITEM ---------- */
const StatItem = memo(({ icon: Icon, title, subtitle }) => (
  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3">
    <Icon className="text-[#5E23DC] sm:mx-0 mx-auto" size={18} />

    <div className="text-center sm:text-left">
      <p className="font-bold text-sm sm:text-lg text-[#2E1A6F]">{title}</p>
      <p className="text-[10px] sm:text-sm text-gray-500 leading-tight">
        {subtitle}
      </p>
    </div>
  </div>
));

const HeroSection = () => {
  const { openJoinModal } = usePartnerJoin();
  const [showVideo, setShowVideo] = useState(false);

  const scrollToPricing = useCallback(() => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const openVideo = useCallback(() => setShowVideo(true), []);
  const closeVideo = useCallback(() => setShowVideo(false), []);

  return (
    <section
      className="w-full relative overflow-hidden"
      style={{
        background: `
      radial-gradient(
        1200px 600px at 70% 40%,
        rgba(94, 35, 220, 0.10),
        transparent 60%
      ),
      linear-gradient(
        180deg,
        #F7F5FF 0%,
        #FFFFFF 45%,
        #F4F0FF 100%
      )
    `,
      }}
    >
      <div className="z-10 w-full py-20 sm:py-0 sm:pt-[120px] pb-1 lg:pl-20  grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* ---------- LEFT CONTENT ---------- */}
        <div className="px-4 ">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5E23DC] border border-purple-100">
            <HiOutlineShieldCheck className="text-white" />
            <span className="text-sm text-white font-medium">
              Industry Verified Platform
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-4 xl:mt-6 text-[36px] leading-tight lg:text-[42px] xl:text-[50px] font-extrabold text-[#2E1A6F]">
            Become a Project <br /> Partner Today
          </h1>

          {/* Description */}
          <p className="mt-4 xl:mt-5 max-w-xl text-base xl:text-lg text-[#1F1B2E]">
            Connect with premium projects, grow your business, and earn more
            with India's most trusted partners network.
          </p>

          {/* Buttons */}
          <div className="mt-6 w-full xl:mt-8 flex flex-row gap-2 sm:gap-4 items-center">
            {/* JOIN AS PARTNER */}
            <button
              type="button"
              onClick={openJoinModal}
              className="
              
      bg-[#5E23DC] text-white
      text-sm sm:text-base font-semibold
      px-5 py-2.5 sm:px-8 sm:py-3
      rounded-lg
      hover:bg-[#4b1cc0]
      transition-all active:scale-95
      flex items-center gap-2 justify-center
      whitespace-nowrap
    "
            >
              JOIN AS PARTNER
              <svg
                viewBox="0 0 10 16"
                className="w-[6px] h-[12px] sm:w-[10px] sm:h-[16px]"
              >
                <path d="M0 14L6 8L0 2L2 0L10 8L2 16L0 14Z" fill="white" />
              </svg>
            </button>

            {/* LEARN MORE */}
            <button
              onClick={openVideo}
              className="
               
      group
      border border-[#5E23DC]
      text-[#5E23DC]
      text-sm sm:text-base font-semibold
      px-3 py-2.5 sm:px-8 sm:py-3
      rounded-lg
      flex items-center gap-2 justify-center
      hover:bg-[#5E23DC]/10
      transition-all active:scale-95
      whitespace-nowrap
    "
            >
              <span className="group-hover:translate-x-1 transition-transform">
                Learn More
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z"
                  stroke="#5E23DC"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.5 7L13 10L8.5 13V7Z"
                  stroke="#5E23DC"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-8 border-t pt-5 sm:pt-8 border-purple-100">
            <StatItem icon={FaUsers} title="500+" subtitle="Active Partners" />
            <StatItem
              icon={GoLocation}
              title="Nationwide"
              subtitle="Operating"
            />
            <StatItem
              icon={HiOutlineShieldCheck}
              title="Verified"
              subtitle="Industry Leader"
            />
          </div>
        </div>

        {/* ---------- MOBILE IMAGE ---------- */}
        <div className="block lg:hidden w-full">
          <img src={homeImg} alt="Home" className="w-full object-cover" />
        </div>

        {/* ---------- DESKTOP IMAGE ---------- */}
        <div className="hidden lg:block mt-15">
          <img
            src={heroRightImg}
            alt="Hero Visual"
            className="w-full lg:scale-120 xl:scale-110 object-cover"
          />
        </div>
      </div>

      {/* ---------- VIDEO MODAL ---------- */}
      {showVideo && (
        <div className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center px-4">
          <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden bg-black">
            <button
              onClick={closeVideo}
              className="absolute top-3 right-4 text-white text-xl z-10"
            >
              ✕
            </button>
            <iframe
              className="w-full aspect-video"
              src="https://www.youtube.com/embed/hl8MF7-LlCc?autoplay=1"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Partner Video"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
