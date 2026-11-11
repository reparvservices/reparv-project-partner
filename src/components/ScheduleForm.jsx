import React, { useState } from "react";
import axios from "axios";
import ReactDOM from "react-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useAuth } from "../store/auth";

export const ScheduleForm = ({ onClose }) => {
  const { URI } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    contact: "",
    date: "",
    time: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // allow only numbers for contact
    if (name === "contact" && !/^\d*$/.test(value)) return;

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    let temp = {};

    if (!formData.fullName.trim()) temp.fullName = "Full name is required";

    if (!/^\d{10}$/.test(formData.contact))
      temp.contact = "Contact must be exactly 10 digits";

    if (!formData.date) temp.date = "Date is required";

    if (!formData.time) temp.time = "Time is required";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await axios.post(
        `${URI}/project-partner/profile/schedule`,

        formData,
      );

      alert("Schedule request submitted successfully!");
      onClose();

      setFormData({
        fullName: "",
        contact: "",
        date: "",
        time: "",
        message: "",
      });
    } catch (error) {
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5E23DC] to-[#8F3FFC] p-6 text-center">
          <h2 className="text-2xl font-bold text-white">Schedule a Meeting</h2>
          <p className="text-white/80 mt-1 text-sm">
            Choose a convenient date and time
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
          {/* Full Name */}
          <div>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-400"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Contact */}
          <div>
            <input
              type="tel"
              name="contact"
              placeholder="Contact Number"
              maxLength="10"
              value={formData.contact}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-400"
            />
            {errors.contact && (
              <p className="text-red-500 text-sm mt-1">{errors.contact}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-400"
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          {/* Time */}
          <div>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-400"
            />
            {errors.time && (
              <p className="text-red-500 text-sm mt-1">{errors.time}</p>
            )}
          </div>

          {/* Message */}
          <textarea
            name="message"
            rows="3"
            placeholder="Message (optional)"
            value={formData.message}
            onChange={handleChange}
            className="w-full border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-400"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#5E23DC] to-[#8F3FFC] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {loading && <AiOutlineLoading3Quarters className="animate-spin" />}
            {loading ? "Submitting..." : "Submit Schedule"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
};

export default ScheduleForm;
