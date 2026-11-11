import { FaUser, FaLock } from "react-icons/fa";

const GRAD = "linear-gradient(94.94deg,#5E23DC -8.34%,#8B5CF6 97.17%)";

const inputCls = (err) =>
  `w-full h-10 rounded-xl border px-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400
   ${err ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"}`;

/**
 * ContactForm
 * Props:
 *   form       : object
 *   errors     : { projectBy, contact, email }
 *   onChange   : fn(field, value)
 *   onValidate : fn(field, value)
 */
export default function ContactForm({ form, errors, onChange, onValidate }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm space-y-5">

      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: GRAD }} />
        <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
          <FaUser size={14} style={{ color: "#5323DC" }} />
          Contact Details
        </h3>
      </div>

      {/* Owner Name + Phone row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Owner Name */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Owner Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.projectBy}
            onChange={e => {
              const v = e.target.value.replace(/[^A-Za-z\s]/g, "");
              onChange("projectBy", v);
              onValidate("projectBy", v);
            }}
            placeholder="e.g. Rajesh Kumar"
            className={inputCls(errors.projectBy)}
          />
          {errors.projectBy && <p className="text-xs text-red-500 mt-1">{errors.projectBy}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Phone <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <span className="h-10 px-3 flex items-center border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500 bg-gray-50 font-medium">
              +91
            </span>
            <input
              type="tel"
              maxLength={10}
              placeholder="9876543210"
              value={form.contact}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, "");
                onChange("contact", v);
                onValidate("contact", v);
              }}
              className={`flex-1 h-10 border px-3 text-sm text-gray-800 outline-none rounded-r-xl transition-all placeholder:text-gray-400
                ${errors.contact ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"}`}
            />
          </div>
          {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={e => {
            onChange("email", e.target.value);
            onValidate("email", e.target.value);
          }}
          placeholder="owner@email.com (optional)"
          className={inputCls(errors.email)}
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2.5 bg-violet-50 rounded-xl p-3 text-sm text-violet-800 border border-violet-100">
        <FaLock size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#5323DC" }} />
        <span>Your contact details are secure and shared only with verified buyers.</span>
      </div>
    </div>
  );
}