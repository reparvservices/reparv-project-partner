import React, { useState, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Key,
  CreditCard,
  Gift,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { formatIndianNumber } from "../../utils";

export default function PartnerRegistrationStep2({
  nextStep,
  prevStep,
  selectedPlan,
  setPlan,
  setUser,
  form,
  setForm,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);

  const fetchStates = async () => {
    try {
      const response = await fetch(`https://aws-api.reparv.in/admin/states`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      setStates(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch(
        `https://aws-api.reparv.in/admin/cities/${form.state}`,
        { method: "GET", credentials: "include" },
      );
      const data = await response.json();
      setCities(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  useEffect(() => {
    if (form.state) {
      fetchCities();
      setForm((prev) => ({ ...prev, city: "" }));
    }
  }, [form.state]);

  const validateIndianPhone = (phone) => /^[6-9]\d{9}$/.test(phone);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(password);

  const validate = () => {
    let errs = {};
    if (!form.fullname) errs.fullname = "Full Name required";
    if (!form.contact) errs.contact = "Contact required";
    if (!form.email) errs.email = "Email required";
    if (!form.state) errs.state = "Select State";
    if (!form.city) errs.city = "Select City";
    if (!form.username) errs.username = "Username required";
    if (!form.password) errs.password = "Password required";
    if (!form.intrest) errs.intrest = "Please describe your intent";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    const isValid = validate();

    if (!validateIndianPhone(form.contact)) {
      setErrors((prev) => ({
        ...prev,
        contact: "Enter valid 10-digit Indian number",
      }));
      return;
    }

    if (!validateEmail(form.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Enter valid email address",
      }));
      return;
    }

    if (!validatePassword(form.password)) {
      setErrors((prev) => ({
        ...prev,
        password: "Minimum 8 characters with uppercase, lowercase and number",
      }));
      return;
    }

    if (!isValid) return;
    nextStep();
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const getPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.password);
  const baseAmount = Number(selectedPlan?.totalPrice || 0);
  const originalAmount = Math.max(selectedPlan?.totalPrice || 0);
  const discountAmount = Math.max(selectedPlan?.discountApplied || 0);
  const gstAmount = Math.round(originalAmount * 0.18);
  const subtotalWithGST = originalAmount + gstAmount;
  const totalWithGST = Math.max(subtotalWithGST - discountAmount, 0);

  return (
    <div className="min-h-screen bg-[#F8F7FC] overflow-x-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-purple-600 tracking-tight">
          reparv
        </h1>
        <div className="text-gray-600 cursor-pointer text-sm flex items-center gap-1">
          Help ▾
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center text-gray-900 mb-8">
          Partner Registration
        </h2>

        {/* Steps */}
        <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 md:gap-6 mt-6 mb-8 sm:mb-12 px-2 sm:px-4">
          <Step active label="Review Plan" completed />
          <Divider />
          <Step label="Details" number={2} />
          <Divider />
          <Step label="Payment" number={3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
          {/* LEFT FORM */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            <SectionHeader title="Personal Information" step="Step 2 of 3" />

            <InputWithIcon
              placeholder="Enter your full name"
              Icon={User}
              value={form.fullname}
              onChange={(val) => handleChange("fullname", val)}
              error={errors.fullname}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputWithIcon
                placeholder="9100000000"
                Icon={Phone}
                value={form.contact}
                onChange={(val) => handleChange("contact", val)}
                error={errors.contact}
              />
              <InputWithIcon
                placeholder="name@company.com"
                Icon={Mail}
                value={form.email}
                onChange={(val) => handleChange("email", val)}
                error={errors.email}
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              Location Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectWithIcon
                placeholder="Select State"
                Icon={MapPin}
                value={form.state}
                onChange={(val) => handleChange("state", val)}
                options={states}
                error={errors.state}
              />
              <SelectWithIcon
                placeholder="Select City"
                Icon={MapPin}
                value={form.city}
                onChange={(val) => handleChange("city", val)}
                options={cities}
                error={errors.city}
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-4">
              Account Credentials
            </h3>

            <InputWithIcon
              placeholder="Create a unique username"
              Icon={User}
              value={form.username}
              onChange={(val) => handleChange("username", val)}
              error={errors.username}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="SecurePass123"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={`w-full border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg px-10 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none`}
              />
              <Key
                size={18}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              />
              <div
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>

            {form.password && (
              <div className="mt-2">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded ${
                        passwordStrength >= i ? "bg-green-500" : "bg-gray-200"
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-900 mt-4">
              Partnership Intent
            </h3>

            <textarea
              rows="4"
              placeholder="Briefly describe your goals..."
              value={form.intrest}
              onChange={(e) => handleChange("intrest", e.target.value)}
              className={`w-full border ${
                errors.intrest ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none`}
            />

            <InputWithIcon
              placeholder="Enter code if applicable"
              Icon={CreditCard}
              value={form.refrence}
              onChange={(val) => handleChange("refrence", val)}
            />

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between mt-6">
              <button
                onClick={prevStep}
                className="w-full sm:w-auto px-6 py-3 border rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Back
              </button>

              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold shadow-md hover:opacity-90 transition"
              >
                Continue to Payment →
              </button>
            </div>
          </div>

          {/* RIGHT SUMMARY */}
          <div className="bg-white shadow-xl rounded-2xl p-5 sm:p-6 border border-purple-200 h-fit">
            <h4 className="text-lg font-semibold mb-6 text-gray-900">
              Order Summary
            </h4>

            <SummaryRow
              label="Base Plan"
              value={`₹${formatIndianNumber(originalAmount)}`}
            />

            <SummaryRow
              label="GST (18%)"
              value={`₹${formatIndianNumber(gstAmount)}`}
            />

            {discountAmount > 0 && (
              <SummaryRow
                label="Discount"
                value={`- ₹${formatIndianNumber(discountAmount)}`}
              />
            )}
            <div className="border-t my-5"></div>

            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>Total due today</span>
              <span>₹{formatIndianNumber(totalWithGST)}</span>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4 mt-6 text-sm text-gray-600 flex items-start gap-2">
              <ShieldCheck size={18} className="text-green-500 mt-1" />
              <div>
                <p className="font-medium text-gray-700">Secure Transaction</p>
                <p className="text-gray-500 text-xs mt-1">
                  Encrypted payment processing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */
function Step({ label, active, completed, number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${
          completed
            ? "bg-purple-600 text-white"
            : active
              ? "bg-purple-100 text-purple-600"
              : "bg-gray-200 text-gray-500"
        }`}
      >
        {completed ? "✓" : number || ""}
      </div>
      <span
        className={`text-sm ${
          active || completed ? "text-purple-600 font-medium" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="w-8 sm:w-10 h-px bg-gray-300" />;
}

function SectionHeader({ title, step }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {step && <span className="text-sm text-gray-400">{step}</span>}
    </div>
  );
}

function InputWithIcon({
  placeholder,
  Icon,
  value,
  onChange,
  error,
  type = "text",
}) {
  return (
    <div>
      <div className="relative">
        <Icon
          size={18}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
        />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border rounded-lg px-10 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SelectWithIcon({
  placeholder,
  Icon,
  value,
  onChange,
  options = [],
  error,
}) {
  return (
    <div>
      <div className="relative">
        <Icon
          size={18}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
        />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border rounded-lg px-10 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.state || opt.city}>
              {opt.state || opt.city}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}
