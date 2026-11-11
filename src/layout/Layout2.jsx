import React, { useState, useEffect, useRef } from "react";
import reparvLogo from "../assets/reparvLogo.svg";
import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import { useAuth } from "../store/auth";
import SuccessScreen from "../components/SuccessScreen";
import { Link } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import { MdAddCall } from "react-icons/md";
import Footer from "./Footer";

function LayoutTwo() {
  const { successScreen, URI } = useAuth();
  const location = useLocation();
  const [showSidebar, setShowSidebar] = useState(false);
  const getNavLinkClass = (path) => {
    return location.pathname === path ? "font-semibold" : "font-semibold";
  };

  return (
    <div className="layout w-full flex flex-col bg-white z-20 overflow-hidden ">
      {/* ========= DESKTOP NAVBAR ========= */}
      <div className="w-full bg-white shadow-sm fixed top-0 left-0 z-50 sm:h-[90px]">
        <div className="max-w-[1350px] mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={reparvLogo}
              alt="Reparv Logo"
              className="w-[95px] md:w-[120px] lg:w-[135px]"
            />
          </Link>

          {/* Location */}
          <div className="hidden items-center gap-2 text-[#2b2b2b] font-medium cursor-pointer">
            <IoLocationOutline className="text-xl" />

            <span>Nagpur</span>

            {/* Down Arrow – Light Grey Like Figma */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-gray-400 mt-[1px]"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 9l6 6 6-6"
              />
            </svg>
          </div>

          {/* Nav Links – Desktop */}
          <div className="hidden md:flex items-center gap-10 text-[16px] font-medium">
            {/* <NavLink to="/" className={getNavLinkClass("/")}>Home</NavLink>

            <NavLink to="https://www.reparv.in/properties" className={getNavLinkClass("/properties")}>
              Properties
            </NavLink>

            <NavLink to="https://www.reparv.in/about-us" className={getNavLinkClass("/about")}>
              About Us
            </NavLink>

            <NavLink to="https://www.reparv.in/contact-us" className={getNavLinkClass("/contact")}>
              Contact Us
            </NavLink> */}
            

            <a href="tel:+918237601315">
              <button className="flex items-center gap-2 px-2 md:px-4 py-2 bg-violet-600 text-white rounded-lg font-semibold">
                <MdAddCall size={20} />
                <span className="hidden md:block">Call Now</span>
              </button>
            </a>

            <Link
              to="/login"
              className="
    bg-[#5E23DC] 
    text-white 
    px-6 py-3 
    rounded-lg 
    font-semibold 
    shadow-lg 
    transform 
    transition 
    duration-300 
    ease-in-out
    hover:bg-[#4a0db8] 
    hover:scale-105 
    hover:shadow-2xl
    active:scale-95
  "
            >
              Login As Partner
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex gap-4 items-center justify-center md:hidden">
            <a href="tel:+918237601315">
              <button className="flex items-center gap-2 px-2 md:px-4 py-2 bg-[#5a2ae0] text-white rounded-lg font-semibold">
                <MdAddCall size={20} />
                <span className="hidden md:block">Call Now</span>
              </button>
            </a>
            <Link
              to="/login"
              className="
    bg-[#5E23DC] 
    text-white 
    px-6 py-2
    rounded-lg 
    font-semibold 
    shadow-lg 
    transform 
    transition 
    duration-300 
    ease-in-out
    hover:bg-[#4a0db8] 
    hover:scale-105 
    hover:shadow-2xl
    active:scale-95
  "
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* ========= MOBILE SIDEBAR ========= */}
      {showSidebar && (
        <div className="sidebar w-full fixed md:hidden top-0 right-0 z-30 bg-white flex flex-col items-end gap-5 pb-8 shadow-[0px_1px_3px_1px_#00000026]">
          {/* Sidebar Header */}
          <div className="w-full flex items-center justify-between h-16 shadow-[0px_1px_3px_1px_#00000026] px-6">
            <Link to="/" onClick={() => setShowSidebar(false)}>
              <img src={reparvLogo} alt="Reparv Logo" className="w-[110px]" />
            </Link>

            <RxCross2
              onClick={() => setShowSidebar(false)}
              className="w-7 h-7 cursor-pointer hover:text-[#5E23DC] active:scale-95"
            />
          </div>

          {/* Sidebar Links */}
          <div className="w-full flex flex-col gap-4 px-10 font-semibold text-[#110229] text-[18px]">
            {/* <NavLink
              to="/"
              onClick={() => setShowSidebar(false)}
              className={getNavLinkClass("/")}
            >
              Home
            </NavLink>

            <NavLink
              to="https://www.reparv.in/properties"
              onClick={() => setShowSidebar(false)}
              className={getNavLinkClass("/properties")}
            >
              Properties
            </NavLink>

            <NavLink
              to="https://www.reparv.in/about-us"
              onClick={() => setShowSidebar(false)}
              className={getNavLinkClass("/about")}
            >
              About Us
            </NavLink>

            <NavLink
              to="https://www.reparv.in/contact-us"
              onClick={() => setShowSidebar(false)}
              className={getNavLinkClass("/contact")}
            >
              Contact Us
            </NavLink> */}

            <Link
              to=""
              onClick={() => setShowSidebar(false)}
              className="bg-[#5E23DC] text-white px-5 py-2 rounded-lg font-semibold mt-3 text-center"
            >
              Login
            </Link>
          </div>
        </div>
      )}

      {/* container */}
      <div className="w-full sm:bg-[#FAFAFA]">
        <Outlet />
      </div>

      {/* footer */}
      <Footer />

      {/* Show Success Screen */}
      {successScreen?.show && <SuccessScreen />}
    </div>
  );
}

export default LayoutTwo;
