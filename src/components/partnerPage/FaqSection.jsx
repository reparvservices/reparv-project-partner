import React, { useState, useEffect } from "react";
import FAQLeftImage from "../../assets/FAQLeftImage.svg";
import { FiPlusCircle, FiMinusCircle } from "react-icons/fi";
import ContactForm from "../ContactForm";
import ScheduleForm from "../ScheduleForm";
import { useAuth } from "../../store/auth";

function FAQSection({ location = "Partners Project Partner Page" }) {
  const { URI } = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const toggleFAQ = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  // Fetch Real FAQs
  const fetchData = async () => {
    try {
      const response = await fetch(
        `${URI}/admin/faqs/active/${encodeURIComponent(location)}`,
      );

      if (!response.ok) throw new Error("Failed to fetch FAQs");

      const data = await response.json();
      setFaqs(data);
    } catch (err) {
      console.error("Error fetching FAQs:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location]);

  return (
    <>
      {/* FAQ SECTION (Constrained Width) */}
      <section className="w-full max-w-[1380px]  mx-auto grid md:grid-cols-2 gap-10 p-4 md:p-8 md:pb-15  ">
        {/* LEFT SIDE */}
        <div className="hidden md:flex items-center">
          <img
            src={FAQLeftImage}
            alt="FAQ Image"
            className="w-full object-cover"
          />
        </div>

        {/* RIGHT SIDE FAQ */}
        <div className="w-full flex flex-col gap-4 mr-4 md:pt-10">
          <h2 className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold font-segoe">
            Frequently Ask Questions
          </h2>

          <p className="font-normal text-[18px] leading-[28px] text-[#6A7282] md:mb-4">
            Everything you need to know about becoming a partner
          </p>

          <div className="space-y-2 md:space-y-4 max-h-[500px] overflow-y-auto scrollbar-hide">
            {faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={`${
                  activeIndex === index
                    ? "bg-white shadow-[0_4px_18px_2px_rgba(138,56,245,0.18)] rounded-3xl p-5 m-2 md:m-5"
                    : "py-2"
                }`}
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3 className="font-semibold text-base sm:text-lg lg:text-xl xl:text-2xl">
                    {faq.question}
                  </h3>

                  {activeIndex === index ? (
                    <FiMinusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-[#5E23DC]" />
                  ) : (
                    <FiPlusCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                </div>

                {activeIndex === index && (
                  <p className="mt-4 text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FULL WIDTH CTA SECTION */}
      <section className="w-full mt-20 px-2 sm:px-4 md:px-20 mb-20">
        <div className="w-full rounded-[32px] bg-gradient-to-r from-[#5E23DC] to-[#1C1C2E] py-14 px-6 md:px-16 text-center text-white">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold">
            Still have questions?
          </h3>

          <p className="text-sm md:text-lg text-white/80 mt-4 mb-10">
            Our support team is here to help you get started
          </p>

          <div className="flex flex-row justify-center gap-6">
            <button
              onClick={() => setShowContactForm(true)}
              className="p-3 whitespace-nowrap
 sm:px-8 sm:py-4 rounded-2xl bg-gradient-to-r from-[#6D28FF] to-[#5E23DC] text-white font-medium text-[16px] sm:text-lg shadow-lg hover:opacity-90 transition-all duration-300"
            >
              Contact Support
            </button>

            <button
              onClick={() => setShowScheduleForm(true)}
              className="p-3 sm:px-8 whitespace-nowrap
 sm:py-4 rounded-2xl bg-white text-[#5E23DC] font-medium text-[16px] sm:text-lg shadow-md border border-white/30 hover:bg-gray-100 transition-all duration-300"
            >
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      {showContactForm && (
        <ContactForm onClose={() => setShowContactForm(false)} />
      )}

      {showScheduleForm && (
        <ScheduleForm onClose={() => setShowScheduleForm(false)} />
      )}
    </>
  );
}

export default FAQSection;
