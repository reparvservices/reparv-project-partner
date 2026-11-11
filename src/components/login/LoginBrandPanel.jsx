import {
  FiBell,
  FiCheckCircle,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import reparvLogo from "../../assets/layout/reparvMainLogo.svg";

function FloatingCard({ className = "", style, children, delay = "0s" }) {
  return (
    <div
      className={`login-float-card absolute ${className}`}
      style={{ animationDelay: delay, ...style }}
    >
      {children}
    </div>
  );
}

function DashboardMockup() {
  const bars = [42, 68, 55, 82, 64, 90, 72];

  return (
    <div className="login-dashboard-main relative mx-auto w-[220px] rounded-[22px] border border-white/30 bg-white/95 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm xl:w-[250px]">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-gray-800">Dashboard</p>
          <p className="text-[8px] text-gray-400">Today&apos;s overview</p>
        </div>
        <span className="login-pulse-dot h-2 w-2 rounded-full bg-emerald-400" />
      </div>

      <div className="mb-3 grid grid-cols-3 gap-1.5">
        {[
          { label: "Leads", value: "24", tone: "text-[#6C35DE]" },
          { label: "Booked", value: "8", tone: "text-emerald-600" },
          { label: "Revenue", value: "₹2.4L", tone: "text-amber-600" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg bg-gray-50 px-2 py-1.5 text-center"
          >
            <p className={`text-[10px] font-bold ${stat.tone}`}>{stat.value}</p>
            <p className="text-[7px] text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-gradient-to-b from-[#f8f5ff] to-white p-2.5">
        <div className="mb-2 flex items-end justify-between gap-1 h-14">
          {bars.map((height, index) => (
            <div
              key={index}
              className="login-bar flex-1 rounded-t-md bg-gradient-to-t from-[#5E23DC] to-[#9b7bff]"
              style={{
                height: `${height}%`,
                animationDelay: `${index * 0.12}s`,
              }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between text-[7px] text-gray-400">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>

      <div className="mt-2.5 space-y-1.5">
        {["New lead · Pune", "Site visit booked"].map((item, index) => (
          <div
            key={item}
            className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5"
            style={{ animationDelay: `${0.4 + index * 0.2}s` }}
          >
            <span className="login-pulse-dot h-1.5 w-1.5 shrink-0 rounded-full bg-[#6C35DE]" />
            <span className="text-[8px] text-gray-600">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoginBrandPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#5E23DC] via-[#6C35DE] to-[#7c3aed] px-12 xl:px-16 py-12 text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="login-orb login-orb-1 absolute -top-24 -right-16 h-80 w-80 rounded-full bg-white/15 blur-3xl" />
        <div className="login-orb login-orb-2 absolute bottom-20 -left-20 h-72 w-72 rounded-full bg-[#4c1d95]/40 blur-3xl" />
        <div className="login-orb login-orb-3 absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_45%)]" />
      </div>

      <div className="relative z-10 shrink-0 login-fade-down">
        <img
          src={reparvLogo}
          alt="Reparv"
          className="h-10 w-auto brightness-0 invert"
        />
        <p className="mt-3 text-sm text-white/75 tracking-wide">
          Truth. Trust. Transparency.
        </p>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center py-6">
        <div className="relative h-[min(420px,46vh)] w-full max-w-[420px]">
          <div className="absolute inset-0 flex items-center justify-center">
            <DashboardMockup />
          </div>

          <FloatingCard
            className="-left-2 top-[8%] xl:-left-4 login-float-a"
            delay="0s"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-white/25 bg-white/15 px-3 py-2.5 shadow-lg backdrop-blur-md">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/20 text-emerald-300">
                <FiTrendingUp size={15} />
              </span>
              <div>
                <p className="text-[10px] text-white/70">Commission earned</p>
                <p className="text-sm font-bold text-white">₹ 25,000</p>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            className="-right-1 top-[18%] xl:-right-3 login-float-b"
            delay="1.1s"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-white/25 bg-white/15 px-3 py-2.5 shadow-lg backdrop-blur-md">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-400/20 text-blue-200">
                <FiBell size={15} />
              </span>
              <div>
                <p className="text-[10px] text-white/70">New enquiry</p>
                <p className="text-xs font-semibold text-white">Just now</p>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            className="left-[4%] bottom-[18%] login-float-c"
            delay="0.6s"
          >
            <div className="flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-2 shadow-lg backdrop-blur-md">
              <FiCheckCircle size={14} className="text-emerald-300" />
              <span className="text-[11px] font-semibold text-emerald-100">
                Verified Partner
              </span>
            </div>
          </FloatingCard>

          <FloatingCard
            className="-right-2 bottom-[10%] xl:-right-4 login-float-d"
            delay="1.8s"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-white/25 bg-white/15 px-3 py-2.5 shadow-lg backdrop-blur-md">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20 text-amber-200">
                <FiUsers size={15} />
              </span>
              <div>
                <p className="text-[10px] text-white/70">Active leads</p>
                <p className="text-sm font-bold text-white">+12 today</p>
              </div>
            </div>
          </FloatingCard>
        </div>
      </div>

      <div className="relative z-10 max-w-md shrink-0 login-fade-up">
        <h2 className="text-3xl xl:text-4xl font-semibold leading-tight">
          Partner Portal
        </h2>
        <p className="mt-4 text-base text-white/80 leading-relaxed">
          Manage leads, bookings, and your partner network from one secure
          dashboard.
        </p>
      </div>
    </div>
  );
}
