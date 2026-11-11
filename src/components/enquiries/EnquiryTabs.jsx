const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 100%)";

export default function EnquiryTabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="flex gap-2 px-4 sm:px-6 py-3 bg-white border-b border-slate-100 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.label;
        return (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0"
            style={isActive ? { background: GRADIENT, color: "white" } : { background: "#F2F4FF", color: "#2B2F3A" }}
          >
            {tab.label}
            <span
              className="text-xs rounded-lg py-0.5 px-1.5 font-semibold"
              style={isActive ? { background: "rgba(255,255,255,0.2)", color: "white" } : { background: "#0000000F", color: "#64748b" }}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}