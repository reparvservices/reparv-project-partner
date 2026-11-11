import React, { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { useAuth } from "../store/auth"; // make sure you have this hook

function AccountCancellation() {
  const { URI, setSuccessScreen } = useAuth();

  const [partner, setPartner] = useState({
    role: "",
    fullname: "",
    contact: "",
    email: "",
    username: "",
    password: "",
    reason: "",
  });

  const [confirmText, setConfirmText] = useState("");
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);

  const confirmValid = confirmCheckbox && confirmText.trim() === "DELETE";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${URI}/api/partner/account/cancellation`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(partner),
        }
      );

      if (response.ok) {
        setSuccessScreen({
          show: true,
          label: "Account Cancellation Requested",
          description:
            "Our team will process it shortly.",
        });
      } else {
        const errorRes = await response.json();
        alert(
          errorRes.message ||
            "Failed to send cancellation request. Please try again."
        );
      }
    } catch (err) {
      console.error("Network Error:", err.message);
      alert("Network Error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b pb-4">
          <FaTrashAlt className="text-red-600 text-2xl" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Cancel Your Account
          </h1>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="text-sm leading-relaxed">
            Deleting your account is <strong>permanent</strong>. All your data
            will be erased, and you won’t be able to recover it. Please confirm
            carefully before proceeding.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name + Contact */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              required
              placeholder="Your Full Name"
              value={partner.fullname}
              onChange={(e) =>
                setPartner({ ...partner, fullname: e.target.value })
              }
              className="flex-1 bg-white text-sm font-medium px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
            />
            <select
              required
              value={partner.role}
              onChange={(e) => setPartner({ ...partner, role: e.target.value })}
              className="flex-1 bg-white text-sm font-medium px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 appearance-none"
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="Promoter">Promoter</option>
              <option value="Sales Partner">Sales Partner</option>
              <option value="Project Partner">Project Partner</option>
              <option value="Territory Partner">Territory Partner</option>
              <option value="Onboarding Partner">Onboarding Partner</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              required
              minLength={10}
              maxLength={10}
              placeholder="Phone Number"
              value={partner.contact}
              onChange={(e) => {
                const input = e.target.value;
                if (/^\d{0,10}$/.test(input)) {
                  setPartner({ ...partner, contact: input });
                }
              }}
              className="w-full bg-white text-sm font-medium px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
            />

            {/* Email */}
            <input
              type="email"
              required
              placeholder="Your Email"
              value={partner.email}
              onChange={(e) =>
                setPartner({ ...partner, email: e.target.value })
              }
              className="w-full bg-white text-sm font-medium px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Username */}
            <input
              type="text"
              required
              placeholder="Username"
              value={partner.username}
              onChange={(e) =>
                setPartner({ ...partner, username: e.target.value })
              }
              className="w-full bg-white text-sm font-medium px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
            />

            {/* Password */}
            <input
              type="password"
              required
              placeholder="Password"
              value={partner.password}
              onChange={(e) =>
                setPartner({ ...partner, password: e.target.value })
              }
              className="w-full bg-white text-sm font-medium px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
            />
          </div>
          {/* Reason */}
          <textarea
            required
            placeholder="Reason for account cancellation"
            value={partner.reason}
            onChange={(e) => setPartner({ ...partner, reason: e.target.value })}
            className="w-full bg-white text-sm font-medium px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
            rows={3}
          />

          {/* Confirmation */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={confirmCheckbox}
              onChange={(e) => setConfirmCheckbox(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <p className="text-sm text-gray-700">
              I understand this will <strong>permanently</strong> delete my
              account and all associated data.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type <span className="text-red-600">DELETE</span> to confirm
            </label>
            <input
              type="text"
              placeholder="DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={!confirmValid}
              className={`flex-1 py-3 rounded-lg font-semibold text-white transition ${
                confirmValid
                  ? "bg-red-600 hover:bg-red-700 active:scale-95"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Permanently Delete Account
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-95 transition"
            >
              Cancel
            </button>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 text-center">
            Once deleted, your account cannot be restored.
          </p>
        </form>
      </div>
    </div>
  );
}

export default AccountCancellation;
