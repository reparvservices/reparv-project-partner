import {
  FiArrowLeft,
  FiMoreVertical,
  FiCheck,
  FiTrash2,
  FiSliders,
} from "react-icons/fi";
import { HiOutlineUserAdd } from "react-icons/hi";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { MdOutlineVerified } from "react-icons/md";

export default function Notifications() {
  return (
    <div className="bg-[#F6F7FB] min-h-screen">
      {/* Mobile Header */}
      <div className="sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center justify-between md:hidden">
        <div className="flex items-center gap-2">
          <FiArrowLeft className="text-xl" />
          <h1 className="font-semibold">Notifications</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-xs text-violet-600">Mark all as read</button>
          <FiMoreVertical />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 md:grid-cols-[1fr] gap-6">

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between">
          <h1 className="text-xl font-semibold">Notifications</h1>

          <div className="flex items-center gap-3">
            <button className="border px-3 py-2 rounded-lg text-sm">
              ✓ Mark all as read
            </button>
            <button className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm">
              Preferences
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-3 flex flex-wrap gap-2 text-sm">
          <select className="border rounded-lg px-3 py-2">
            <option>Type: All</option>
          </select>
          <select className="border rounded-lg px-3 py-2">
            <option>Status: Unread</option>
          </select>
          <select className="border rounded-lg px-3 py-2">
            <option>Date: Last 7 Days</option>
          </select>

          <div className="ml-auto hidden md:flex items-center gap-2 text-gray-500">
            <span>2 selected</span>
            <button className="border rounded-lg p-2">
              <FiCheck />
            </button>
            <button className="border rounded-lg p-2 text-red-500">
              <FiTrash2 />
            </button>
          </div>

          <button className="ml-auto md:hidden border rounded-lg p-2">
            <FiSliders />
          </button>
        </div>

        {/* Today */}
        <div>
          <p className="text-xs text-gray-400 mb-3">TODAY</p>

          <div className="space-y-3">
            <NotificationCard
              title="New Lead Assigned"
              desc="Robert Fox has been assigned to your team by System Admin."
              time="2 mins ago"
              tag="Lead #4920"
              color="violet"
              icon={<HiOutlineUserAdd />}
            />

            <NotificationCard
              title="Follow-up Required"
              desc="Lead 'Oakridge Villa' has had no activity for 3 days."
              time="1 hour ago"
              tag="High Priority"
              color="yellow"
              icon={<HiOutlineExclamationTriangle />}
            />

            <NotificationCard
              title="Deal Closed"
              desc="The 'Sunset Apartment' deal has been marked as closed."
              time="4 hours ago"
              tag="Closed"
              color="green"
              icon={<MdOutlineVerified />}
            />
          </div>
        </div>

        {/* Yesterday */}
        <div>
          <p className="text-xs text-gray-400 mb-3 mt-6">YESTERDAY</p>

          <div className="space-y-3">
            <NotificationCard
              title="System Maintenance Scheduled"
              desc="Scheduled maintenance will occur Sunday 2:00 AM EST."
              time="Yesterday, 2:00 PM"
              tag="System"
              color="gray"
              icon={<FiSliders />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationCard({ title, desc, time, tag, color, icon }) {
  const colors = {
    violet: "bg-violet-100 text-violet-600",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-600",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="bg-white rounded-xl p-4 flex items-start gap-3 shadow-sm hover:shadow transition">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-sm">{title}</h3>
          <span className="text-xs text-gray-400">{time}</span>
        </div>

        <p className="text-xs text-gray-500 mt-1">{desc}</p>

        {tag && (
          <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {tag}
          </span>
        )}
      </div>

      <input type="checkbox" className="mt-1" />
    </div>
  );
}