import {
  FiArrowLeft,
  FiChevronRight,
  FiImage,
  FiUser,
  FiShare2,
  FiBriefcase,
  FiSliders,
  FiCamera,
} from "react-icons/fi";

export default function MobileMenu({ setStep }) {
  const items = [
    {
      label: "Profile Header",
      desc: "Update profile photo and cover banner",
      step: 1,
      icon: FiImage,
    },
    {
      label: "Basic Information",
      desc: "Name, bio, location, and role",
      step: 2,
      icon: FiUser,
    },
    {
      label: "Social Media",
      desc: "Linked accounts and website",
      step: 3,
      icon: FiShare2,
    },
    {
      label: "Business Category",
      desc: "Required to complete profile",
      step: 4,
      icon: FiBriefcase,
      danger: true,
    },
    {
      label: "Content Preferences",
      desc: "Manage feed topics and tags",
      step: 5,
      icon: FiSliders,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      <div className="mt-4 space-y-3">
        <ProfileSummaryCard />

        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => setStep(item.step)}
            className="w-full flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm active:scale-[0.99] transition"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  item.danger
                    ? "bg-red-50 text-red-500"
                    : "bg-violet-50 text-violet-600"
                }`}
              >
                <item.icon />
              </div>

              <div className="text-left">
                <p className="font-medium">{item.label}</p>
                <p
                  className={`text-xs ${
                    item.danger ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  {item.desc}
                </p>
              </div>
            </div>

            <FiChevronRight className="text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfileSummaryCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Cover */}
      <div className="h-28 bg-[linear-gradient(135deg,#E9D5FF,#DDD6FE)]" />

      {/* Avatar */}
      <div className="relative -mt-10 flex justify-center">
        <div className="relative">
          <img
            src="https://i.pravatar.cc/150?img=47"
            className="w-20 h-20 rounded-full border-4 border-white object-cover"
          />
          <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs">
            <FiCamera />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="text-center px-4 pb-4">
        <h3 className="mt-2 font-semibold text-base">Maria Gonzalez</h3>

        <span className="inline-block mt-1 text-xs bg-violet-100 text-violet-600 px-3 py-1 rounded-full">
          Territory Partner
        </span>

        {/* Profile Strength */}
        <div className="mt-4 bg-[#E9EDF2] rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-violet-600">
              Profile Strength
            </p>
            <p className="text-sm font-semibold">85%</p>
          </div>

          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-[85%] bg-violet-600 rounded-full" />
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Add your business category to reach 100%
          </p>
        </div>
      </div>
    </div>
  );
}