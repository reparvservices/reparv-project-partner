import React, { useEffect, useState } from "react";

const ROLE_CONFIG = {
  sales: {
    label: "Sales Partner",
    partnerType: "Sales Partner",
    downloadLink:
      "https://play.google.com/store/apps/details?id=com.reparvnewsalesapp",
    apiUrl: "https://aws-api.reparv.in/sales/profile/",
    tokenKey: "salesPartnerToken",
    themeColor: "#0BB501",
    gradient: ["#0BB501", "#059669"],
  },
  territory: {
    label: "Territory Partner",
    partnerType: "Territory Partner",
    downloadLink:
      "https://play.google.com/store/apps/details?id=com.newreparvterritory_app",
    apiUrl: "https://aws-api.reparv.in/territory-partner/profile/",
    tokenKey: "tPersonToken",
    themeColor: "#0078DB",
    gradient: ["#0078DB", "#0047AB"],
  },
  project: {
    label: "Project Partner",
    partnerType: "Project Partner",
    downloadLink: "https://partners.reparv.in/#registrationForm",
    apiUrl: "https://aws-api.reparv.in/project-partner/profile/",
    tokenKey: "projectpartnerPersonToken",
    themeColor: "#5B3EFF",
    gradient: ["#1A0A4F", "#2D1B8E", "#3D2AC4"],
  },
};

export default function ReferScreen({ role = "sales" }) {
    
  const theme = ROLE_CONFIG[role];

  const [referData, setReferData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(theme.tokenKey);

      const res = await fetch(theme.apiUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setReferData(data);
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  const referCode = referData?.referral || "------";

  const referralText =
    role === "project"
      ? `Join me on Reparv as a ${theme.partnerType}: ${theme.downloadLink}`
      : `Join Reparv as ${theme.partnerType}. Use my code: ${referCode}. Download: ${theme.downloadLink}`;

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ text: referralText });
    } else {
      await navigator.clipboard.writeText(referralText);
      alert("Copied to clipboard!");
    }
  };

  const whatsapp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      referralText
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#F5F3FF] pb-24">
      
      {/* HERO */}
      <div
        className="relative text-white px-6 pt-10 pb-8 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.gradient.join(",")})`,
        }}
      >
        {/* Glow effects */}
        <div className="absolute w-40 h-40 bg-white/10 rounded-full -top-10 -right-10" />
        <div className="absolute w-28 h-28 bg-white/10 rounded-full bottom-4 -left-6" />

        <p className="text-xs bg-white/10 inline-block px-3 py-1 rounded-full mb-4">
          Partner Referral Program
        </p>

        <h1 className="text-3xl font-extrabold leading-tight mb-2">
          Invite Partners <br />
          <span className="opacity-80">Earn Together</span>
        </h1>

        <p className="text-sm opacity-80 mb-6">
          Refer a {theme.partnerType} & earn ₹500 instantly
        </p>

        {/* STATS */}
        <div className="flex gap-2">
          {[
            { label: "Per Referral", value: "₹500" },
            { label: "No Limit", value: "∞" },
            { label: "Fast Payout", value: "24h" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex-1 text-center bg-white/10 border border-white/20 rounded-lg py-2"
            >
              <p className="font-bold">{item.value}</p>
              <p className="text-[10px] opacity-70">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* REFERRAL CARD */}
      <div className="px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center relative">
          <p className="text-xs text-gray-400 mb-2 tracking-widest">
            YOUR REFERRAL CODE
          </p>

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <div
              className="inline-block border-2 border-dashed px-6 py-3 rounded-xl text-2xl font-bold tracking-widest"
              style={{
                borderColor: theme.themeColor,
                color: theme.themeColor,
              }}
            >
              {referCode}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-3">
            Share this code with friends
          </p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="px-4 mt-6 flex gap-3">
        <button
          onClick={whatsapp}
          className="flex-1 py-3 rounded-xl text-white font-semibold shadow"
          style={{
            background: `linear-gradient(90deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
          }}
        >
          WhatsApp
        </button>

        <button
          onClick={share}
          className="w-14 rounded-xl bg-[#EDE9FE] flex items-center justify-center"
        >
          🔗
        </button>
      </div>

      {/* HOW IT WORKS */}
      <div className="px-4 mt-8">
        <div className="bg-white rounded-xl p-5 shadow">
          <h2 className="font-bold mb-4 text-gray-800">How It Works</h2>

          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-xs font-bold">
                1
              </div>
              <p>Share your referral code</p>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-xs font-bold">
                2
              </div>
              <p>Friend signs up as {theme.partnerType}</p>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <p>You earn ₹500 🎉</p>
            </div>
          </div>
        </div>
      </div>

      {/* PERKS */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: "Instant Reward", desc: "₹500 per referral" },
            { title: "No Limit", desc: "Unlimited invites" },
            { title: "Fast Payout", desc: "Within 24h" },
            { title: "Grow Network", desc: "Expand reach" },
          ].map((p, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-xl border border-[#DDD6FE]"
            >
              <p className="font-semibold text-sm">{p.title}</p>
              <p className="text-xs text-gray-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}