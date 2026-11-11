const ACTION_LABELS = {
  "New Launch": "Follow Update",
  "Site Progress": "View Reel",
  "Deal Closed": "Congratulate",
  "Brochure": "Download",
};

export default function LiveActivityCard({ item }) {
  const actionLabel = ACTION_LABELS[item.tag] || "View Update";

  return (
    <div className="bg-white rounded-xl border p-3.5 flex flex-col gap-3 shadow-[0_2px_16px_rgba(0,0,0,0.07)] w-full">

      {/* Avatar + Name + Time */}
      <div className="flex items-center gap-3">
        <img
          src={item.image}
          alt={item.name}
          className="w-12 h-12 rounded-[14px] object-cover shrink-0"
        />
        <div>
          <p className="text-[15px] font-bold text-gray-900 leading-tight">{item.name}</p>
          <p className="text-[12.5px] text-gray-400 mt-0.5">{item.time}</p>
        </div>
      </div>

      {/* Property Image with overlay tag */}
      <div className="relative rounded-[14px] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-[125px] object-cover block"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
        <span className="absolute bottom-2.5 left-3 text-xs font-semibold text-white bg-black/45 backdrop-blur-sm px-2.5 py-1 rounded-[7px]">
          {item.tag}
        </span>
      </div>

      {/* Action Button */}
      <button className="w-full py-[6px] rounded-[8px] border-[1.5px] border-gray-200 bg-white text-sm font-bold text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-colors">
        {actionLabel}
      </button>

    </div>
  );
}