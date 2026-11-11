import React from "react";
import footerLogo from "../assets/footerLogo.svg";
import {
  FaFacebookF,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaRegCopyright,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function Footer({ footerRef }) {
  const usefulLinks = [
    { title: "EMI Calculator", url: "https://www.reparv.in/emi-calculator" },
    { title: "Cost Calculator", url: "https://www.reparv.in/cost-calculator" },
    { title: "Verify 7/12 ", url: "https://www.reparv.in/verify-7/12" },
    { title: "RERA Properties", url: "https://www.reparv.in/rera-properties" },
    {
      title: "Visit Properties on Weekends",
      url: "https://www.reparv.in/visit-properties-on-week-ends",
    },
    {
      title: "Trusted Builders",
      url: "https://www.reparv.in/trusted-builders",
    },
  ];

  return (
    <>
      {/* Desktop Footer */}
      <div ref={footerRef} className="w-full md:block hidden bg-[#5E23DC]">
        <div className="w-full max-w-[1380px] mx-auto flex flex-col gap-6 bg-[#5E23DC] text-white py-8 px-8 lg:px-10">
          <div className="flex items-center justify-start">
            <Link to="/">
              <img src={footerLogo} alt="Reparv Logo" className="w-[160px]" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* 1. Company */}
            <div className="flex flex-col gap-2 text-sm lg:text-base">
              <h3 className="text-lg lg:text-xl font-semibold">Company</h3>
              <Link to="/" className="hover:underline">
                Home
              </Link>
              <Link to="/blogs" className="hover:underline">
                Blogs
              </Link>
              <Link to="/news" className="hover:underline">
                News
              </Link>
              <Link to="/about-us" className="hover:underline">
                About Us
              </Link>
              <Link to="/contact-us" className="hover:underline">
                Contact Us
              </Link>
            </div>

            {/* 2. Become a Professional */}
            <div className="flex flex-col gap-2 text-sm lg:text-base">
              <h3 className="text-lg lg:text-xl font-semibold">
                Become a Professional
              </h3>
              <p
                className="cursor-pointer hover:underline"
                onClick={() =>
                  window.open("https://partners.reparv.in", "_blank")
                }
              >
                Project Partner
              </p>
            </div>

            {/* 3. Download Link */}
            <div className="flex flex-col gap-2 text-sm lg:text-base">
              <h3 className="text-lg lg:text-xl font-semibold">
                Download Link
              </h3>
              <p
                className="cursor-pointer hover:underline"
                onClick={() =>
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.reparvcustomer",
                    "_blank",
                  )
                }
              >
                Customer
              </p>
              <p
                className="cursor-pointer hover:underline"
                onClick={() =>
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.reparvprojectpartner",
                    "_blank",
                  )
                }
              >
                Project Partner
              </p>
            </div>

            {/* 4. Useful Links */}
            <div className="flex flex-col gap-2 text-sm lg:text-base">
              <h3 className="text-lg lg:text-xl font-semibold">Useful Links</h3>
              {usefulLinks.map((link, index) => (
                <p
                  key={index}
                  className="cursor-pointer hover:underline"
                  onClick={() => window.open(link.url, "_blank")}
                >
                  {link.title}
                </p>
              ))}
            </div>

            {/* 5. Social Link (only icons) */}
            <div className="flex flex-col gap-2">
              <h3 className="text-lg lg:text-xl font-semibold">Social Link</h3>
              <div className="flex items-center gap-3 lg:gap-5 text-xl lg:text-2xl">
                <Link
                  to="https://www.facebook.com/reparv/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-[#ffffff28] rounded-full hover:bg-[#ffffff40] transition"
                >
                  <FaFacebookF />
                </Link>
                <Link
                  to="https://www.linkedin.com/company/105339179"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-[#ffffff28] rounded-full hover:bg-[#ffffff40] transition"
                >
                  <FaLinkedin />
                </Link>
                <Link
                  to="https://www.instagram.com/reparv_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-[#ffffff28] rounded-full hover:bg-[#ffffff40] transition"
                >
                  <FaInstagram />
                </Link>
                <Link
                  to="https://www.youtube.com/@reparv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-[#ffffff28] rounded-full hover:bg-[#ffffff40] transition"
                >
                  <FaYoutube />
                </Link>
              </div>
            </div>
          </div>

          <hr className="w-full h-px bg-[#D1D5DC33] border-0 my-5" />

          <div className="text-xs lg:text-sm flex flex-wrap items-center justify-center gap-4 lg:gap-8">
            <span className="flex items-center gap-1.5">
              <FaRegCopyright /> {new Date().getFullYear()} reparv.in All Rights
              Reserved
            </span>
            <Link to="/terms-and-conditions" className="hover:underline">
              Terms & Conditions
            </Link>
            <Link to="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link to="/cancellation-policy" className="hover:underline">
              Cancellation Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Footer - same as before (stacked) */}
      <div className="md:hidden w-full bg-[#5E23DC] text-white py-8 px-5">
        <div className="flex flex-col gap-5 max-w-md mx-auto">
          <div className="flex justify-start">
            <Link to="/">
              <img src={footerLogo} alt="Reparv Logo" className="w-[140px]" />
            </Link>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Company</h3>
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
              <Link to="/" className="hover:underline">
                Home
              </Link>{" "}
              |
              <Link to="/blogs" className="hover:underline">
                Blogs
              </Link>{" "}
              |
              <Link to="/news" className="hover:underline">
                News
              </Link>{" "}
              |
              <Link to="/about-us" className="hover:underline">
                About Us
              </Link>{" "}
              |
              <Link to="/contact-us" className="hover:underline">
                Contact Us
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">
              Become a Professional
            </h3>
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
              
              <span
                className="cursor-pointer hover:underline"
                onClick={() =>
                  window.open("https://partners.reparv.in", "_blank")
                }
              >
                Project Partner
              </span>{" "}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Download Link</h3>
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
              <span
                className="cursor-pointer hover:underline"
                onClick={() =>
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.reparvcustomer",
                    "_blank",
                  )
                }
              >
                Customer
              </span>{" "}
              |
              <span
                className="cursor-pointer hover:underline"
                onClick={() =>
                  window.open(
                    "https://play.google.com/store/apps/details?id=com.reparvprojectpartner",
                    "_blank",
                  )
                }
              >
                Project Partner
              </span>{" "}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Useful Links</h3>
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs">
              {usefulLinks.map((link, index) => (
                <React.Fragment key={index}>
                  <span
                    className="cursor-pointer hover:underline"
                    onClick={() => window.open(link.url, "_blank")}
                  >
                    {link.title}
                  </span>
                  {index < usefulLinks.length - 1 && "|"}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Social Link</h3>
            <div className="flex items-center gap-4 text-xl">
              <Link
                to="https://www.facebook.com/reparv/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-[#ffffff28] rounded-full hover:bg-[#ffffff40]"
              >
                <FaFacebookF />
              </Link>
              <Link
                to="https://www.linkedin.com/company/105339179"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-[#ffffff28] rounded-full hover:bg-[#ffffff40]"
              >
                <FaLinkedin />
              </Link>
              <Link
                to="https://www.instagram.com/reparv_/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-[#ffffff28] rounded-full hover:bg-[#ffffff40]"
              >
                <FaInstagram />
              </Link>
              <Link
                to="https://www.youtube.com/@reparv"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 bg-[#ffffff28] rounded-full hover:bg-[#ffffff40]"
              >
                <FaYoutube />
              </Link>
            </div>
          </div>

          <hr className="w-full h-px bg-[#ffffff33] border-0 my-4" />

          <div className="flex flex-col items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5">
              <FaRegCopyright /> {new Date().getFullYear()} reparv.in All Rights
              Reserved
            </span>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/terms-and-conditions" className="hover:underline">
                Terms & Conditions
              </Link>
              <Link to="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link to="/cancellation-policy" className="hover:underline">
                Cancellation Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Footer;
