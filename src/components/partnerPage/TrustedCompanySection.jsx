import React, { useEffect, useState } from "react";
import dlogo from "../../assets/company/logo.png";
import person from "../../assets/company/person.png";
import handSheck from "../../assets/company/handsheck.png";
import user from "../../assets/company/user.png";
import building from "../../assets/company/building.png";
import like from "../../assets/company/like.png";
import { useAuth } from "../../store/auth";
import PartnerRegistrationModal from "../partnerPageUpdated/PartnerModel";
import RegistrationSuccessModal from "./RegisterSuccess";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { getImageURI } from "../../utils/helper";

export default function TrustedSection() {
  const {
    currentProjectPartner,
    setCurrentProjectPartner,
    URI,
    setProjectPartners,
  } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [partners, setPartner] = useState([]);
  const [centerIndex, setCenterIndex] = useState(0);
  const [successOpen, setSuccessOpen] = useState(false);
  const [role, setRole] = useState("sales");
  async function fetchProjectPartnerLogos() {
    try {
      const response = await fetch(`${URI}/projectpartnerRoute/user/`);

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      const filteredData = data
        .filter((user) => user.businessLogo !== null)
        .map((user) => ({
          id: user.id,
          name: user.fullname,
          businessLogo: user.businessLogo,
        }));

      // ✅ Only repeat if less than 4
      if (filteredData.length > 0 && filteredData.length < 8) {
        return [...filteredData, ...filteredData];
      }

      return filteredData;
    } catch (error) {
      console.error("Error fetching project partner users:", error);
      return [];
    }
  }

  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  useEffect(() => {
    async function getLogos() {
      const logos = await fetchProjectPartnerLogos();
      setPartner(logos);
    }
    getLogos();
  }, []);

  useEffect(() => {
    if (!partners.length) return;

    const interval = setInterval(() => {
      setCenterIndex((prev) => (prev + 1) % partners.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [partners]);

  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = chunkArray(partners, 12);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const visiblePartners = partners.slice(0, 12);

  return (
    <div className="w-full flex flex-col items-center justify-center ">
      <section className="bg-[#5E23DC] mx-auto text-white w-full lg:w-[90%] lg:rounded-[48px] overflow-hidden">
        {/* Top Content */}
        <div
          className="
           max-w-7xl 
           mx-auto 
           px-4 sm:px-6 lg:px-8 
           py-12 sm:py-16 lg:py-20
"
        >
          {/* Heading + Logos Row */}

          <div className="flex flex-col items-center text-center">
            {/* TITLE */}
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Trusted by Leading Organizations
            </h2>

            {/* SUBTITLE */}
            <p className="text-white/80 text-base md:text-lg mb-10 max-w-xl">
              Join a network of industry leaders and innovators
            </p>

            {/* LOGO BLOCK */}
            <div className="max-w-6xl overflow-x-hidden">
              <div className="relative w-full  mx-auto py-6 overflow-visible">
                <Swiper
                  modules={[Autoplay]}
                  autoplay={{ delay: 1500, disableOnInteraction: false }}
                  speed={600}
                  loop={partners.length > 6}
                  centeredSlides={true}
                  slidesPerView={4.4}
                  spaceBetween={6}
                  grabCursor={true}
                  className="logo-swiper"
                  breakpoints={{
                    0: { slidesPerView: 1.6 },
                    640: { slidesPerView: 2.5 },
                    800: { slidesPerView: 3.5 },
                    1024: { slidesPerView: 4.4 },
                    1280: { slidesPerView: 5 },
                  }}
                >
                  {partners.map((logo) => (
                    <SwiperSlide key={logo.id}>
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            setOpenModal(true);
                            setCurrentProjectPartner(logo.id);
                            setProjectPartners(logo.name);
                          }}
                          className="logo-card"
                        >
                          <img
                            src={
                              logo?.businessLogo
                                ? `${getImageURI(logo.businessLogo)}`
                                : dlogo
                            }
                            alt={logo.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </button>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Scoped styles */}
                <style>{`
.logo-swiper {
  padding: 50px 0;
}

.logo-swiper .swiper-slide {
  display: flex;
  justify-content: center;
  transition: all 0.4s ease;
  opacity: 0.5;
  transform: scale(0.9);
}

.logo-swiper .swiper-slide-prev,
.logo-swiper .swiper-slide-next {
  opacity: 0.8;
  transform: scale(0.9);
}

.logo-swiper .swiper-slide-active {
  opacity: 1;
  transform: scale(1.4); /* 40% Bigger */
  z-index: 10;
}

.logo-card {
  width: 140px;
  height: 140px;
  transition: all 0.4s ease;
}
`}</style>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div
          className={`bg-white py-14  relative z-0 ${
            visiblePartners.length <= 4 ? "mt-20" : "mt-0"
          }`}
        >
          {/* PERSON IMAGE – HIDE ON MOBILE  */}
          <img
            src={person}
            alt="Happy Client"
            className={`

        hidden lg:block
        absolute ${visiblePartners.length >= 12 ? "-top-58" : "-top-50"} left-10
        w-130 z-10`}
          />

          <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-2 sm:ml-[40%] md:grid-cols-4 gap-6 sm:gap-8">
            <Stat icon={handSheck} value="100+" label="Active Partners" />
            <Stat icon={building} value="50+" label="Projects Completed" />
            <Stat icon={like} value="₹10Cr+" label="Partner Earnings" />
            <Stat icon={user} value="18+" label="Cities Covered" />
          </div>
        </div>

        {/* Certifications */}
        <div className="py-14 text-center">
          <p className="text-white/80 mb-8">Certified and recognized by</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {[
              "ISO 9001:2015",
              "NSIC Certified",
              "MSME Registered",
              "Startup India",
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-row items-center gap-2 bg-white text-[#5E23DC] px-4 sm:px-6 py-2 sm:py-3 rounded-[14px] font-medium"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0"
                >
                  <path
                    d="M7.5 10L9.16667 11.6667L12.5 8.33333M17.5 10C17.5 10.9849 17.306 11.9602 16.9291 12.8701C16.5522 13.7801 15.9997 14.6069 15.3033 15.3033C14.6069 15.9997 13.7801 16.5522 12.8701 16.9291C11.9602 17.306 10.9849 17.5 10 17.5C9.01509 17.5 8.03982 17.306 7.12987 16.9291C6.21993 16.5522 5.39314 15.9997 4.6967 15.3033C4.00026 14.6069 3.44781 13.7801 3.0709 12.8701C2.69399 11.9602 2.5 10.9849 2.5 10C2.5 8.01088 3.29018 6.10322 4.6967 4.6967C6.10322 3.29018 8.01088 2.5 10 2.5C11.9891 2.5 13.8968 3.29018 15.3033 4.6967C16.7098 6.10322 17.5 8.01088 17.5 10Z"
                    stroke="#5E23DC"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <span className="whitespace-nowrap text-black text-xs sm:text-sm">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PartnerRegistrationModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        setSuccessOpen={() => setSuccessOpen(true)}
      />
      <RegistrationSuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
      />
    </div>
  );
}

function Stat({ icon, value, label }) {
  return (
    <div className="flex items-center sm:items-start gap-4 sm:gap-2 justify-start sm:justify-center w-full">
      {/* ICON BOX (FIXED SIZE) */}
      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#5E23DC] rounded-lg flex items-center justify-center">
        <img
          src={icon}
          alt={label}
          className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
        />
      </div>

      {/* TEXT */}
      <div className="text-left ">
        <p className="text-xl sm:text-2xl font-bold text-[#5E23DC] leading-tight">
          {value}
        </p>
        <p className="text-xs sm:text-sm text-black opacity-80">{label}</p>
      </div>
    </div>
  );
}
