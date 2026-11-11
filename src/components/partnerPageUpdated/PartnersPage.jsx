import React, { useEffect, useState } from "react";
import dlogo from "../../assets/company/logo.png";
import { useAuth } from "../../store/auth";
import PartnerRegistrationModal from "./PartnerModel";
import RegistrationSuccessModal from "./RegisterSuccess";

export default function PartnersPage() {
  const { URI, setCurrentProjectPartner, setProjectPartners } = useAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const res = await fetch(`${URI}/projectpartnerRoute/user/`);
        const data = await res.json();

        const filtered = data.filter((user) => user.businessLogo !== null).map((u) => ({
          id: u.id,
          name: u.fullname,
          businessLogo: u.businessLogo,
        }));

        setPartners(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPartners();
  }, [URI]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-lg font-medium text-gray-600">
        Loading partners...
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden">
      {/*  HERO HEADER */}
      <div className="relative sm:mt-10 bg-gradient-to-br from-[#5E23DC] via-[#6D35F2] to-[#8B5CF6] py-20 px-4">
        <div className="max-w-5xl mx-auto text-center text-white">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Our Trusted Project Partners
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Join hands with India’s fastest growing real estate ecosystem and
            scale your business with confidence.
          </p>
        </div>

        {/* Decorative blur */}
    <div className="absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-transparent group-hover:ring-[#5E23DC]/40 transition" />
      </div>

      {/* 🧊 PARTNERS SECTION */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="
                group
                relative
                bg-white/70
                backdrop-blur-xl
                border border-white/40
                rounded-3xl
                p-5
                flex flex-col
                items-center
                text-center
                shadow-[0_20px_40px_rgba(0,0,0,0.08)]
                hover:shadow-[0_30px_60px_rgba(94,35,220,0.25)]
                transition-all duration-300
                hover:-translate-y-2
              "
            >
              {/* LOGO */}
              <div className="h-20 flex items-center justify-center mb-4">
                <img
                  src={
                    partner.businessLogo
                      ? `${URI}/${partner.businessLogo.replace(/^\/+/, "")}`
                      : dlogo
                  }
                  alt={partner.name}
                  className="
                    max-h-full
                    object-contain
                    transition-transform duration-300
                    group-hover:scale-110
                  "
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = dlogo;
                  }}
                />
              </div>

              {/* NAME */}
              <p className="text-sm font-semibold text-gray-800 mb-4 line-clamp-2">
                {partner.name}
              </p>

              {/* CTA */}
              <button
              type="button"
                onClick={() => {

                  
                  setCurrentProjectPartner(partner.id);
                  setProjectPartners(partner.name);
                  setOpenModal(true);
                }}
                 className="
    relative z-10
    mt-auto
    w-full
    py-2.5
    rounded-full
    bg-gradient-to-r from-[#5E23DC] to-[#7C3AED]
    text-white
    text-sm
    font-medium
  "
              >
                Join as Partner
              </button>

              {/* Hover glow */}
              <div className="absolute inset-0 rounded-3xl ring-1 ring-transparent group-hover:ring-[#5E23DC]/40 transition" />
            </div>
          ))}
        </div>
      </div>

      {/* MODALS (LOGIC UNCHANGED) */}
      <PartnerRegistrationModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        setSuccessOpen={() => setSuccessOpen(true)}
      />

      <RegistrationSuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
      />
    </section>
  );
}
