const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 100%)";

export default function QuickStats({ counts = {}, total = 0, setActiveTab }) {
  const stats = [
    {
      label: "Total",
      filter: "All",
      value: total,
      bg: "bg-slate-100",
      text: "text-slate-700",
    },
    {
      label: "New",
      filter: "New",
      value: counts.New || 0,
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      label: "Alloted",
      filter: "Alloted",
      value: counts.Alloted || 0,
      bg: "bg-yellow-50",
      text: "text-yellow-600",
    },
    {
      label: "Assigned",
      filter: "Assigned",
      value: counts.Assign || 0,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Digital Broker",
      filter: "Digital Broker",
      value: counts.DigitalBroker || 0,
      bg: "bg-violet-50",
      text: "text-violet-600",
    },
  ];

  return (
    <div className="bg-white rounded-md border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-black">Quick Stats</p>
        <span className="text-xs text-slate-400">Live</span>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {stats?.map((s) => (
          <div
            key={s.label}
            onClick={() => setActiveTab(s.filter)}
            className={`flex items-center justify-between bg-[#F2F4FF] rounded-md px-4 py-3 cursor-pointer`}
          >
            <p className="text-sm mt-0.5">{s.label}</p>
            <p className={`text-base font-bold ${s.text}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
