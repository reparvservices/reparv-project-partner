import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { PARTNER_TESTIMONIALS } from "../../data/partnerTestimonials";

export default function TestimonialsSection() {
  const testimonials = PARTNER_TESTIMONIALS;
  const enableLoop = testimonials.length > 5;

  return (
    <section className="lg:py-20 bg-white w-full mt-10">
      <div className="text-center mb-10 px-4">
        <h2 className="lg:text-[40px] md:text-[40px] text-[26px] font-semibold text-[#101828]">
          What Our Partners Say
        </h2>
        <p className="text-[#667085] mt-3 md:text-lg">
          Real stories from real partners who transformed their business with us
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          speed={800}
          loop={enableLoop}
          centeredSlides
          slidesPerView={1.1}
          spaceBetween={24}
          breakpoints={{
            640: { slidesPerView: 1.2 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 2.5 },
            1280: { slidesPerView: 3 },
          }}
          className="testimonial-swiper !overflow-visible py-2"
        >
          {testimonials.map((item) => (
            <SwiperSlide key={item.id} className="!h-auto">
              {({ isActive }) => (
                <div
                  className={`h-full px-1 py-2 transition-all duration-500 ${
                    isActive ? "scale-100 opacity-100" : "scale-[0.92] opacity-60"
                  }`}
                >
                  <TestimonialCard item={item} isActive={isActive} />
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="text-center mt-20 px-4">
        <p className="text-[#667085] text-lg">
          Join 500+ satisfied partners growing their business with us
        </p>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("pricing");
            if (!el) return;
            const y = el.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
          }}
          className="mt-6 bg-[#5E23DC] text-white text-[15px] lg:text-lg font-medium whitespace-nowrap px-10 py-4 rounded-xl shadow-[0px_10px_15px_-3px_rgba(94,35,220,0.28)] flex items-center gap-2 mx-auto transition-all"
        >
          Become a Partner Today
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="white"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </section>
  );
}

function PartnerAvatar({ src, name }) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#EDE9FE] ring-2 ring-[#F3EEFF]">
      <img
        src={src}
        alt={name}
        className="h-full w-full scale-[1.08] object-cover object-[center_18%]"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=5E23DC&color=fff&size=128`;
        }}
      />
    </div>
  );
}

function TestimonialCard({ item, isActive }) {
  return (
    <div className="relative flex h-full max-w-full flex-col overflow-hidden rounded-2xl border border-[#EAECF0] bg-white p-5 pb-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
      {isActive ? (
        <>
          <div
            className="pointer-events-none absolute right-0 top-0 z-0 h-14 w-14 rounded-tr-2xl border-r-[5px] border-t-[5px] border-[#5E23DC]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 z-0 h-10 w-10 rounded-bl-2xl border-b-[5px] border-l-[5px] border-[#5E23DC]"
            aria-hidden
          />
        </>
      ) : null}

      <div className="w-10 h-10 bg-[#5E23DC47] rounded-lg flex items-center justify-center">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M16 3C15.4696 3 14.9609 3.21071 14.5858 3.58579C14.2107 3.96086 14 4.46957 14 5V11C14 11.5304 14.2107 12.0391 14.5858 12.4142C14.9609 12.7893 15.4696 13 16 13C16.2652 13 16.5196 13.1054 16.7071 13.2929C16.8946 13.4804 17 13.7348 17 14V15C17 15.5304 16.7893 16.0391 16.4142 16.4142C16.0391 16.7893 15.5304 17 15 17C14.7348 17 14.4804 17.1054 14.2929 17.2929C14.1054 17.4804 14 17.7348 14 18V20C14 20.2652 14.1054 20.5196 14.2929 20.7071C14.4804 20.8946 14.7348 21 15 21C16.5913 21 18.1174 20.3679 19.2426 19.2426C20.3679 18.1174 21 16.5913 21 15V5C21 4.46957 20.7893 3.96086 20.4142 3.58579C20.0391 3.21071 19.5304 3 19 3H16Z"
            stroke="#5E23DC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 3C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V11C3 11.5304 3.21071 12.0391 3.58579 12.4142C3.96086 12.7893 4.46957 13 5 13C5.26522 13 5.51957 13.1054 5.70711 13.2929C5.89464 13.4804 6 13.7348 6 14V15C6 15.5304 5.78929 16.0391 5.41421 16.4142C5.03914 16.7893 4.53043 17 4 17C3.73478 17 3.48043 17.1054 3.29289 17.2929C3.10536 17.4804 3 17.7348 3 18V20C3 20.2652 3.10536 20.5196 3.29289 20.7071C3.48043 20.8946 3.73478 21 4 21C5.5913 21 7.11742 20.3679 8.24264 19.2426C9.36786 18.1174 10 16.5913 10 15V5C10 4.46957 9.78929 3.96086 9.41421 3.58579C9.03914 3.21071 8.53043 3 8 3H5Z"
            stroke="#5E23DC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex mt-2 gap-1" aria-label="5 star rating">
        {[...Array(5)].map((_, i) => (
          <svg key={i} width="20" height="20" fill="#FEC84B" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 .587l3.668 7.568L24 9.748l-6 5.84 1.416 8.479L12 19.896l-7.416 4.171L6 15.588 0 9.747l8.332-1.593z" />
          </svg>
        ))}
      </div>

      <p className="relative z-10 mt-6 flex-1 text-[#475467] text-[15px] sm:text-[17px] font-normal leading-relaxed">
        &ldquo;{item.quote}&rdquo;
      </p>

      <div className="relative z-10 my-4 border-t border-[#EAECF0]" />

      <div className="relative z-10 flex items-center justify-between gap-3 pt-1">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <PartnerAvatar src={item.avatar} name={item.name} />
          <div className="min-w-0 pr-1">
            <h4 className="text-[15px] sm:text-[16px] font-medium text-[#101828] leading-snug">
              {item.name}
            </h4>
            <p className="mt-0.5 text-[13px] sm:text-[14px] text-[#667085] leading-snug">
              {item.role}
            </p>
          </div>
        </div>

        {item.projects != null ? (
          <div className="flex h-[52px] w-[71px] shrink-0 flex-col items-center justify-center rounded-xl bg-[#5E23DC47]">
            <span className="text-[#5E23DC] text-[18px] font-semibold leading-[28px]">
              {item.projects}
            </span>
            <span className="text-[#5E23DC] text-[12px] leading-[16px]">Projects</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
