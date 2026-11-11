export default function CustomerStats({ customers = [] }) {
  const total      = customers.length;
  const totalDeal  = customers.reduce((s, c) => s + (Number(c.dealamount)  || 0), 0);
  const totalToken = customers.reduce((s, c) => s + (Number(c.tokenamount) || 0), 0);

  function fmtCr(val) {
    if (!val) return "₹0";
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000)   return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString("en-IN")}`;
  }

  const stats = [
    { label: "Total Customers",  value: total,           color: "text-slate-900" },
    { label: "Total Deal Value", value: fmtCr(totalDeal), color: "text-violet-600" },
    { label: "Total Token",      value: fmtCr(totalToken), color: "text-green-600" },
    { label: "Balance",          value: fmtCr(totalDeal - totalToken), color: "text-amber-600" },
  ];

  return (
    <div className="bg-white rounded-lg border shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Customer Stats</h3>
      <div className="flex flex-col divide-y divide-slate-100">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <p className="text-xs text-slate-400 font-medium">{s.label}</p>
            <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}