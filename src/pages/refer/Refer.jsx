import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../store/auth";
import { Check, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ── ROLE MAP FROM API ──
const ROLE_MAP = {
  "Sales Partner": "sales",
  "Territory Partner": "territory",
  "Project Partner": "project",
};

export default function Refer() {
  const { URI, user } = useAuth();
  const navigate = useNavigate();

  // ── ROLE CONFIG ──
  const ROLE_CONFIG = {
    sales: {
      partnerType: "Sales Partner",
      downloadLink:
        "https://play.google.com/store/apps/details?id=com.reparvnewsalesapp",
      apiUrl: URI + "/sales/profile/",
      tokenKey: "salesPartnerToken",
      gradient: "from-[#063A00] via-[#0A6500] to-[#0BB501]",
      accent: "#0BB501",
      light: "#F0FFF4",
      border: "#BBF7D0",
    },
    territory: {
      partnerType: "Territory Partner",
      downloadLink:
        "https://play.google.com/store/apps/details?id=com.newreparvterritory_app",
      apiUrl: URI + "/territory-partner/profile/",
      tokenKey: "tPersonToken",
      gradient: "from-[#00244F] via-[#004170] to-[#0078DB]",
      accent: "#0078DB",
      light: "#EFF6FF",
      border: "#BFDBFE",
    },
    project: {
      partnerType: "Project Partner",
      downloadLink: "https://play.google.com/store/apps/details?id=com.reparvprojectpartner",
      apiUrl: URI + "/project-partner/profile/",
      tokenKey: "projectpartnerPersonToken",
      gradient: "from-[#1A0A4F] via-[#2D1B8E] to-[#3D2AC4]",
      accent: "#5B3EFF",
      light: "#F5F3FF",
      border: "#DDD6FE",
    },
  };

  const roleKey = ROLE_MAP[user?.role];
  const theme = ROLE_CONFIG[roleKey];

  const [referData, setReferData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(theme.apiUrl, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await res.json();
      setReferData(data);
    } catch (e) {
      console.error("Profile error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const referCode = referData?.referral || "------";

  const referralText =
    roleKey === "project"
      ? `Join me on Reparv as ${theme.partnerType}: ${theme.downloadLink}`
      : `Join Reparv as ${theme.partnerType}. Use my code: ${referCode}. Download: ${theme.downloadLink}`;

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ text: referralText });
    } else {
      await navigator.clipboard.writeText(referralText);
      alert("Copied!");
    }
  };

  const whatsapp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(referralText)}`,
      "_blank",
    );
  };

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-6xl">
        {/* HERO */}
        <div
          className={`bg-gradient-to-br ${theme.gradient} text-white px-6 py-10 rounded-b-3xl`}
        >
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 transition mb-4"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            Invite Partners <br />
            <span className="opacity-80">Earn Together</span>
          </h1>

          <p className="text-sm opacity-80 mb-6">
            Refer a {theme.partnerType} & earn ₹500 instantly
          </p>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/10 rounded-lg py-2">
              <p className="font-bold">₹500</p>
              <p className="text-xs opacity-70">Per Referral</p>
            </div>
            <div className="bg-white/10 rounded-lg py-2">
              <p className="font-bold">∞</p>
              <p className="text-xs opacity-70">No Limit</p>
            </div>
            <div className="bg-white/10 rounded-lg py-2">
              <p className="font-bold">24h</p>
              <p className="text-xs opacity-70">Payout</p>
            </div>
          </div>
        </div>

        {/* REFERRAL CARD */}
        <div className="px-4 -mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-xs text-gray-400 mb-2 tracking-widest">
              YOUR REFERRAL CODE
            </p>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <div
                className="inline-block border-2 border-dashed px-6 py-3 rounded-xl text-2xl font-bold tracking-widest"
                style={{
                  borderColor: theme.accent,
                  color: theme.accent,
                }}
              >
                {referCode}
              </div>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="px-4 mt-6 flex gap-3">
          <button
            onClick={whatsapp}
            className="flex-1 py-3 rounded-xl text-white font-semibold"
            style={{
              background: theme.accent,
            }}
          >
            WhatsApp
          </button>

          <button
            onClick={share}
            className="w-14 rounded-xl bg-gray-200 flex items-center justify-center"
          >
            🔗
          </button>
        </div>

        {/* HOW IT WORKS */}
        <div className="px-4 mt-8 grid md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl shadow">
            <h2 className="font-bold mb-4">How It Works</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>1. Share your referral code</li>
              <li>2. Friend signs up</li>
              <li>3. You earn ₹500 🎉</li>
            </ul>
          </div>

          {/* PERKS */}
          <div className="grid grid-cols-2 gap-3">
            {["Instant Reward", "No Limit", "Fast Payout", "Grow Network"].map(
              (p, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border text-sm">
                  {p}
                </div>
              ),
            )}
          </div>
        </div>

        {/* FOOTER SPACE */}
        <div className="h-24" />
      </div>

      {/* STICKY BAR */}
      <div className="md:hidden fixed z-50 bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-5xl mx-auto flex gap-3">
          <button
            onClick={whatsapp}
            className="flex-1 py-3 rounded-xl text-white font-bold"
            style={{ background: theme.accent }}
          >
            Refer via WhatsApp
          </button>

          <button
            onClick={share}
            className="w-14 bg-gray-200 rounded-xl flex items-center justify-center"
          >
            🔗
          </button>
        </div>
      </div>
    </div>
  );
}
