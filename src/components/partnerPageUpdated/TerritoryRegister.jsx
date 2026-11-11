import React, { useState, useEffect } from "react";
import { useAuth } from "../../store/auth";
import { handlePayment } from "../../utils/payment.js";

const RegistrationForm = ({ plan }) => {
  const { URI, setSuccessScreen,currentProjectPartner } = useAuth();
  const registrationPrice = plan?.totalPrice;

  console.log(currentProjectPartner,"currentProjectPartner");
  const [newPartner, setNewPartner] = useState({
    fullname: "",
    contact: "",
    email: "",
    username: "",
    password: "",
    state: "",
    city: "",
    projectpartnerid: "",
    intrest: "",
    refrence: "",
  });

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [projectPartners, setProjectPartners] = useState([]);

  /* ================= API ================= */
  useEffect(() => {
    fetch(`${URI}/admin/states`, { credentials: "include" })
      .then((res) => res.json())
      .then(setStates);
  }, []);

  useEffect(() => {
    if (!newPartner.state) return;
    fetch(`${URI}/admin/cities/${newPartner.state}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setCities);
  }, [newPartner.state]);

  useEffect(() => {
    if (!newPartner.city) return;
    fetch(`${URI}/admin/projectpartner/get/in/${newPartner.city}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setProjectPartners);
  }, [newPartner.city]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //  const scriptLoaded = await loadRazorpayScript();

    //   if (!scriptLoaded) {
    //     alert("Failed to load Razorpay. Please check your internet.");
    //     return;
    //   }
  setNewPartner({...newPartner,projectpartnerid:currentProjectPartner || ""});
    try {
      const response = await fetch(`${URI}/admin/territorypartner/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPartner),
      });

      if (response.ok) {
        const res = await response.json();

        setSuccessScreen({
          show: true,
          label: "Your Data Send SuccessFully",
          description: ` Join as a Territory Partner`,
        });

        // try {
        //   await handlePayment(
        //     newPartner,
        //     "Territory Partner",
        //     "https://territory.reparv.in",
        //     registrationPrice,
        //     res.Id,
        //     "territorypartner",
        //     "id",
        //     setSuccessScreen
        //   );

        //   // If payment is successful, reset the form
        //   setNewPartner({
        //     fullname: "",
        //     contact: "",
        //     email: "",
        //     username: "",
        //     password: "",
        //     state: "",
        //     city: "",
        //     projectpartnerid: "",
        //     intrest: "",
        //     refrence: "",
        //   });
        // } catch (paymentError) {
        //   console.error("Payment Error:", paymentError.message);
        //   alert("Payment failed. Please contact support.");
        // }
      } else {
        const errorRes = await response.json();
        console.error("Submission Error:", errorRes);
        alert(errorRes.message || "Failed to Submit Data. Please try again.");
      }
    } catch (err) {
      console.error("Network Error:", err.message);
      alert("Network Error. Please try again later.");
    }
  };

  return (
    <div className="w-full  overflow-y-auto ">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-xl border border-purple-100"
      >
        {/* HEADER */}
        <div className="rounded-t-3xl bg-gradient-to-r from-purple-700 to-purple-500 p-6 text-white text-center">
          <h3 className="text-2xl font-bold">Territory Partner Registration</h3>
          <p className="text-sm text-purple-100 mt-1">
            Join our professional territory network
          </p>
        </div>

        <div className="p-0 sm:p-6 sm:p-8 space-y-6">
          {/* PERSONAL */}
          <Section title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={newPartner.fullname}
                onChange={(v) => setNewPartner({ ...newPartner, fullname: v })}
              />
              <Input
                label="Phone Number"
                value={newPartner.contact}
                onChange={(v) =>
                  /^\d{0,10}$/.test(v) &&
                  setNewPartner({ ...newPartner, contact: v })
                }
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              value={newPartner.email}
              onChange={(v) => setNewPartner({ ...newPartner, email: v })}
            />
          </Section>

          {/* LOCATION */}
          <Section title="Location Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="State"
                value={newPartner.state}
                onChange={(v) => setNewPartner({ ...newPartner, state: v })}
                options={states.map((s) => s.state)}
              />
              <Select
                label="City"
                value={newPartner.city}
                onChange={(v) => setNewPartner({ ...newPartner, city: v })}
                options={cities.map((c) => c.city)}
              />
            </div>
          </Section>

          {/* ACCOUNT */}
          <Section title="Account Credentials">
            <Input
              label="Username"
              value={newPartner.username}
              onChange={(v) => setNewPartner({ ...newPartner, username: v })}
            />

            <Input
              label="Password"
              type="password"
              value={newPartner.password}
              onChange={(v) => setNewPartner({ ...newPartner, password: v })}
            />
          </Section>

          {/* OTHER */}
          <Section title="Additional Information">
            <Select
              label="Why are you interested?"
              value={newPartner.intrest}
              onChange={(v) => setNewPartner({ ...newPartner, intrest: v })}
            options={[
                "Passion for Real Estate Industry",
                "Learning & Career Growth",
                "Opportunity to Work with a Growing Company",
                "Strong Communication & Negotiation Skills",
                "Local Market Knowledge",
                "Interest in Marketing & Sales",
                "Financial Rewards & Performance-Driven Role",
                "Helping People Make Life-Changing Decisions",
                "Financial Rewards",
              ]}
            />

            <div>
              <label className="text-xs font-medium text-gray-600">
                Referral Code (Optional)
              </label>
              <input
                type='text'
                 value={newPartner.refrence}
                onChange={(v) => setNewPartner({ ...newPartner, refrence: v })}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition"
              />
            </div>
          </Section>

          {/* CTA */}
          <button
            type="submit"
            className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-purple-700 to-purple-500 text-white font-semibold text-lg shadow-lg hover:opacity-90 transition"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

/* ================= UI COMPONENTS ================= */

const Section = ({ title, children }) => (
  <div className="bg-purple-50/50 border border-purple-100 sm:rounded-2xl p-3 sm:p-5 space-y-4">
    <h4 className="text-sm font-semibold text-purple-700">{title}</h4>
    {children}
  </div>
);

const Input = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition"
    />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition bg-white"
    >
      <option value="">Select</option>
      {options.map((o, i) => (
        <option key={i} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

export default RegistrationForm;
