const matches = [
  {
    name: "Sunnyvale Heights",
    match: "98% match for Sarah J.",
    image: null,
  },
  {
    name: "Urban Lofts",
    match: "85% match for David O.",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100&h=80&fit=crop",
  },
];

export default function SuggestedMatches() {
  return (
    <div className="bg-white rounded-[8px] p-5 border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-extrabold text-gray-900">Suggested Matches</h3>
        <span
          className="text-[11px] font-extrabold text-white px-2 py-1 rounded-[6px]"
          style={{ background: "linear-gradient(110.73deg, #5E23DC 0%, #7C3AED 100%)" }}
        >
          AI
        </span>
      </div>

      <div className="flex flex-col divide-y divide-gray-200">
        {matches.map((m, i) => (
          <div key={i} className={`flex items-center gap-3 ${i > 0 ? "pt-3.5 mt-0" : "pb-3.5"}`}>
            {m.image ? (
              <img
                src={m.image}
                alt={m.name}
                className="w-12 h-10 rounded-[8px] object-cover shrink-0"
              />
            ) : (
              <div className="w-12 h-10 rounded-[8px] bg-gray-100 shrink-0" />
            )}
            <div>
              <p className="text-[13.5px] font-bold text-gray-900 leading-tight">{m.name}</p>
              <p className="text-[12px] text-gray-400 mt-0.5">{m.match}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}