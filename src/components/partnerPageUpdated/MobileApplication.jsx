import React from "react";
import mobileAppImage from "../../assets/company/mobile.svg";
import { AiOutlineLineChart, AiOutlineWallet } from "react-icons/ai";
import ios from "../../assets/company/apple.png";
import android from "../../assets/company/android.png";
import mobileBack from "../../assets/mobileback.png";
const MobileAppSection = () => {
  return (
    <section
      className="relative lg:mt-[-140px] text-white py-16 px-4 md:px-12 lg:px-24 flex flex-col items-center overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #5E23DC 0%, #1F1B2E 100%)",
      }}
    >
      {" "}
      {/* Badge */}
      <span className="bg-white text-[#5E23DC] text-xs px-3 py-1 rounded-full mb-4">
        Mobile App
      </span>
      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
        Manage Everything On The Go
      </h2>
      {/* Subheading */}
      <p className="text-center text-sm md:text-base mb-12 max-w-2xl text-white/90">
        Our mobile app puts complete control in your hands with powerful
        features designed for partners.
      </p>
      {/* Main Layout */}
      <div className="relative w-full mt-10 flex flex-col md:flex-row items-center justify-center gap-12">
        {/* LEFT FEATURES (Desktop only) */}
        <div className="hidden md:flex flex-col lg:space-y-24 md:space-y-12 md:mr-8 text-left">
          <Feature
            title="Easy Project Management"
            desc="Track all your projects in one intuitive dashboard"
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#5E23DC"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            }
          />
          <Feature
            title="Real-time Notifications"
            desc="Never miss an opportunity with instant alerts"
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.2681 21C10.4436 21.304 10.6961 21.5565 11.0001 21.732C11.3041 21.9075 11.649 21.9999 12.0001 21.9999C12.3511 21.9999 12.696 21.9075 13 21.732C13.3041 21.5565 13.5565 21.304 13.7321 21"
                  stroke="#5E23DC"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M3.262 15.326C3.13137 15.4692 3.04516 15.6472 3.01386 15.8385C2.98256 16.0298 3.00752 16.226 3.08571 16.4034C3.1639 16.5807 3.29194 16.7316 3.45426 16.8375C3.61658 16.9434 3.80618 16.9999 4 17H20C20.1938 17.0001 20.3834 16.9438 20.5459 16.8381C20.7083 16.7324 20.8365 16.5817 20.9149 16.4045C20.9933 16.2273 21.0185 16.0311 20.9874 15.8398C20.9564 15.6485 20.8704 15.4703 20.74 15.327C19.41 13.956 18 12.499 18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 12.499 4.589 13.956 3.262 15.326Z"
                  stroke="#5E23DC"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            }
          />
        </div>

        {/* MOBILE IMAGE */}
        <div className="relative flex justify-center items-center z-10">
          {/* MAIN MOBILE IMAGE */}
          <img
            src={mobileAppImage}
            alt="Mobile App"
            className="
      relative

      sm:w-[300px]
      md:w-[340px]
      lg:w-[400px]
      scale-150  
      z-10
    "
          />

          {/* Growth Badge */}
          <div className="absolute left-[-45px] md:-left-12 bottom-[140px] bg-white text-[#5E23DC] px-3 py-2 rounded-xl shadow-lg z-20">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#DBEAFE] rounded-full flex items-center justify-center">
                <AiOutlineLineChart size={18} />
              </div>
              <div>
                <p className="text-[12px] text-gray-500">Growth</p>
                <p className="font-bold text-sm">+24%</p>
              </div>
            </div>
          </div>

          {/* Earned Badge */}
          <div className="absolute right-[-50px] md:-right-12 bottom-[20px] bg-white text-[#5E23DC] px-3 py-2 rounded-xl shadow-lg z-20">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#DBEAFE] rounded-full flex items-center justify-center">
                <AiOutlineWallet size={18} />
              </div>
              <div>
                <p className="text-[12px] text-gray-500">Earned</p>
                <p className="font-bold text-sm">₹2.4L</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT FEATURES (Desktop only) */}
        <div className="hidden md:flex flex-col lg:space-y-24 md:space-y-12 md:ml-8 text-left">
          <Feature
            title="Analytics & Insights"
            desc="Data-driven insights to grow your business"
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 3V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H21"
                  stroke="#5E23DC"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M18 17V9"
                  stroke="#5E23DC"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M13 17V5"
                  stroke="#5E23DC"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M8 17V14"
                  stroke="#5E23DC"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            }
          />
          <Feature
            title="Seamless Payments"
            desc="Fast and secure payment processing"
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 7V4C19 3.73478 18.8946 3.48043 18.7071 3.29289C18.5196 3.10536 18.2652 3 18 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5C3 5.53043 3.21071 6.03914 3.58579 6.41421C3.96086 6.78929 4.46957 7 5 7H20C20.2652 7 20.5196 7.10536 20.7071 7.29289C20.8946 7.48043 21 7.73478 21 8V12M21 12H18C17.4696 12 16.9609 12.2107 16.5858 12.5858C16.2107 12.9609 16 13.4696 16 14C16 14.5304 16.2107 15.0391 16.5858 15.4142C16.9609 15.7893 17.4696 16 18 16H21C21.2652 16 21.5196 15.8946 21.7071 15.7071C21.8946 15.5196 22 15.2652 22 15V13C22 12.7348 21.8946 12.4804 21.7071 12.2929C21.5196 12.1054 21.2652 12 21 12Z"
                  stroke="#5E23DC"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H20C20.2652 21 20.5196 20.8946 20.7071 20.7071C20.8946 20.5196 21 20.2652 21 20V16"
                  stroke="#5E23DC"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            }
          />
        </div>
      </div>
      {/* MOBILE FEATURES (Only Mobile) */}
      <div className="md:hidden mt-12 flex flex-col gap-8 w-full max-w-sm">
        <Feature
          title="Easy Project Management"
          desc="Track all your projects in one intuitive dashboard"
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5E23DC"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          }
        />
        <Feature
          title="Real-time Notifications"
          desc="Never miss an opportunity with instant alerts"
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.2681 21C10.4436 21.304 10.6961 21.5565 11.0001 21.732C11.3041 21.9075 11.649 21.9999 12.0001 21.9999C12.3511 21.9999 12.696 21.9075 13 21.732C13.3041 21.5565 13.5565 21.304 13.7321 21"
                stroke="#5E23DC"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M3.262 15.326C3.13137 15.4692 3.04516 15.6472 3.01386 15.8385C2.98256 16.0298 3.00752 16.226 3.08571 16.4034C3.1639 16.5807 3.29194 16.7316 3.45426 16.8375C3.61658 16.9434 3.80618 16.9999 4 17H20C20.1938 17.0001 20.3834 16.9438 20.5459 16.8381C20.7083 16.7324 20.8365 16.5817 20.9149 16.4045C20.9933 16.2273 21.0185 16.0311 20.9874 15.8398C20.9564 15.6485 20.8704 15.4703 20.74 15.327C19.41 13.956 18 12.499 18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 12.499 4.589 13.956 3.262 15.326Z"
                stroke="#5E23DC"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          }
        />
        <Feature
          title="Analytics & Insights"
          desc="Data-driven insights to grow your business"
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 3V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H21"
                stroke="#5E23DC"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M18 17V9"
                stroke="#5E23DC"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M13 17V5"
                stroke="#5E23DC"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8 17V14"
                stroke="#5E23DC"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          }
        />
        <Feature
          title="Seamless Payments"
          desc="Fast and secure payment processing"
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 7V4C19 3.73478 18.8946 3.48043 18.7071 3.29289C18.5196 3.10536 18.2652 3 18 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5C3 5.53043 3.21071 6.03914 3.58579 6.41421C3.96086 6.78929 4.46957 7 5 7H20C20.2652 7 20.5196 7.10536 20.7071 7.29289C20.8946 7.48043 21 7.73478 21 8V12M21 12H18C17.4696 12 16.9609 12.2107 16.5858 12.5858C16.2107 12.9609 16 13.4696 16 14C16 14.5304 16.2107 15.0391 16.5858 15.4142C16.9609 15.7893 17.4696 16 18 16H21C21.2652 16 21.5196 15.8946 21.7071 15.7071C21.8946 15.5196 22 15.2652 22 15V13C22 12.7348 21.8946 12.4804 21.7071 12.2929C21.5196 12.1054 21.2652 12 21 12Z"
                stroke="#5E23DC"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H20C20.2652 21 20.5196 20.8946 20.7071 20.7071C20.8946 20.5196 21 20.2652 21 20V16"
                stroke="#5E23DC"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          }
        />
      </div>
      {/* Store Buttons */}
      <div className="flex gap-4 mt-20 flex-wrap justify-center">
        <img
          src={ios}
          alt="App Store"
          className="h-12 sm:h-15 cursor-pointer transition-transform hover:scale-110"
        />
        <a
          href="https://play.google.com/store/apps/details?id=com.reparvprojectpartner"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={android}
            alt="Google Play"
            className="h-12 sm:h-15 cucursor-pointer transition-transform hover:scale-110"
          />
        </a>
      </div>
    </section>
  );
};

/* Reusable Feature */
const Feature = ({ title, desc, icon }) => (
  <div className="flex items-start gap-3">
    <div className="bg-white p-3 rounded-lg">{icon}</div>
    <div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-white/80">{desc}</p>
    </div>
  </div>
);

export default MobileAppSection;
