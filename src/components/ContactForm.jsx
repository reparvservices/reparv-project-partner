import React, { useState } from "react";
import axios from "axios";
import ReactDOM from "react-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useAuth } from "../store/auth";

const ContactForm = ({ onClose }) => {
    const {URI}=useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // store validation errors

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on change
  };

  const validate = () => {
    let tempErrors = {};

  
    // Contact validation - exactly 10 digits
    const contactPattern = /^\d{10}$/;
    if (!contactPattern.test(formData.contact)) {
      tempErrors.contact = "Contact number must be 10 digits";
    }

    // Full Name validation
    if (!formData.fullName.trim()) {
      tempErrors.fullName = "Full Name is required";
    }

    // Message validation
    if (!formData.message.trim()) {
      tempErrors.message = "Message is required";
    }

    setErrors(tempErrors);

    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return; // stop submission if validation fails

    try {
      setLoading(true);
      await axios.post(
        `${URI}/project-partner/profile/contact`,
        formData
      );
      alert("Message sent successfully!");
      setFormData({ fullName: "", email: "", contact: "", message: "" });
      onClose();
    } catch (error) {
     // alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5E23DC] to-[#8F3FFC] p-6 text-center">
          <h2 className="text-2xl font-bold text-white">Contact Us</h2>
          <p className="text-white/80 mt-1 text-sm">
            We'd love to hear from you! Fill the form below.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-700 rounded-full w-9 h-9 flex items-center justify-center shadow-md transition"
        >
          ✕
        </button>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
              required
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

         
          <div>
            <input
              type="tel"
              name="contact"
              placeholder="Contact Number"
              value={formData.contact}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
              required
            />
            {errors.contact && (
              <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
            )}
          </div>

          <div>
            <textarea
              name="message"
              placeholder="Your Message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
              required
            />
            {errors.message && (
              <p className="text-red-500 text-sm mt-1">{errors.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#5E23DC] to-[#8F3FFC] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
          >
            {loading && <AiOutlineLoading3Quarters className="animate-spin" />}
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>
      </div>

      {/* Animations */}
      <style>{`
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease forwards;
  }
  .animate-scaleIn {
    animation: scaleIn 0.3s ease forwards;
  }
`}</style>

    </div>,
    document.body
  );
};

export default ContactForm;
