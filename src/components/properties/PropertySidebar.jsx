import { FiEye, FiChevronRight } from "react-icons/fi";
import { HiOutlineFire } from "react-icons/hi";
import { getImageURI } from "../../utils/helper";
import propertyPicture from "../../assets/propertyPicture.svg";
import { useAuth } from "../../store/auth";

function getImage(item) {
  try {
    const parsed = JSON.parse(item?.frontView);
    if (Array.isArray(parsed) && parsed[0]) return getImageURI(parsed[0]);
  } catch {}
  return propertyPicture;
}

export default function PropertySidebar({ properties = [], counts = {} }) {
  const {setPropertyFilter} = useAuth();
  const trending = [...properties]
    .sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
    .slice(0, 3);

  const stats = [
    {
      label: "Total Properties",
      filter: "",
      value: properties.length,
      color: "text-slate-900",
    },
    {
      label: "Active Listings",
      filter: "Approved",
      value: properties.filter((p) => p.status === "Active").length,
      color: "text-slate-900",
    },
    {
      label: "Approved",
      filter: "Approved",
      value: counts.Approved || 0,
      color: "text-green-600",
    },
    {
      label: "Pending Approval",
      filter: "NotApproved",
      value: counts.NotApproved || 0,
      color: "text-amber-500",
    },
    {
      label: "Rejected",
      filter: "Rejected",
      value: counts.Rejected || 0,
      color: "text-red-500",
    },
  ];

  return (
    <aside className="flex flex-col gap-5">
      {/* Trending */}
      <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-slate-900">
            Trending Properties
          </h3>
          <HiOutlineFire className="text-orange-500" size={18} />
        </div>
        <div className="space-y-4">
          {trending.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">
              No properties yet.
            </p>
          )}
          {trending.map((item, i) => (
            <div key={item.propertyid || i}>
              <div
                className="flex items-center justify-between cursor-pointer group"
                onClick={() =>
                  item.seoSlug &&
                  window.open(
                    "https://www.reparv.in/property-info/" + item.seoSlug,
                    "_blank",
                  )
                }
              >
                <div className="flex gap-3 items-center">
                  <img
                    src={getImage(item)}
                    alt={item.propertyName}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate max-w-[160px] group-hover:text-[#5323DC] transition-colors">
                      {item.propertyName}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <FiEye size={11} /> {item.views || 0} views
                    </p>
                  </div>
                </div>
                <FiChevronRight className="text-slate-300 shrink-0" />
              </div>
              {i < trending.length - 1 && (
                <div className="border-t border-slate-100 mt-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-5">
        <h3 className="font-bold text-base text-slate-900 mb-4">Quick Stats</h3>
        <div className="flex flex-col divide-y divide-slate-100">
          {stats.map((s, i) => (
            <div
              key={i}
              onClick={() => setPropertyFilter(s?.filter)}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0 cursor-pointer"
            >
              <p className="text-sm text-slate-400 font-medium">{s.label}</p>
              <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
