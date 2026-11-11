import LiveActivityCard from "./LiveActivitycard";

export default function LiveActivitySection({ items }) {
  return (
    <div className="py-7">
      <p className="text-[11px] font-bold tracking-[0.12em] text-gray-500 uppercase mb-5 px-5 md:px-8">
        Live Activity
      </p>

      {/* Mobile: horizontal scroll row */}
      <div className="flex md:hidden gap-3 overflow-x-auto px-5 pb-1 scrollbar-none snap-x snap-mandatory">
        {items.map((item, index) => (
          <div key={index} className="shrink-0 w-[72vw] max-w-[280px] snap-start">
            <LiveActivityCard item={item} />
          </div>
        ))}
      </div>

      {/* Tablet / Desktop: grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 px-8">
        {items.map((item, index) => (
          <LiveActivityCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
}