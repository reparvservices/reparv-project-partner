import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { FiMoreVertical } from "react-icons/fi";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import DataTable from "react-data-table-component";
import Loader from "../../components/Loader";
import FormatPrice from "../../components/FormatPrice";
import DownloadCSV from "../../components/DownloadCSV";

const GRADIENT = "linear-gradient(94.94deg, #5323DC -8.34%, #8E61FF 97.17%)";
const inputCls  = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#5323DC] focus:ring-2 focus:ring-[#5323DC10] transition-all bg-white placeholder:text-slate-300";
const readCls   = "w-full border border-slate-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 bg-slate-50 min-h-[42px] flex items-center";
const btnPrimary   = "px-5 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all";
const btnSecondary = "px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all";

const EMPTY_INFO = {
  mouza: "", khasrano: "", wing: "", wingfacing: "", plotfacing: "", plotsize: "",
  floorno: "", flatno: "", plotno: "", flatfacing: "", type: "",
  carpetarea: "", builtuparea: "", superbuiltuparea: "", additionalarea: "",
  payablearea: "", sqftprice: "", basiccost: "", stampduty: "", registration: "",
  advocatefee: "", watercharge: "", maintenance: "", gst: "", other: "", totalcost: "",
};

/* ── Status badge ── */
function StatusBadge({ status }) {
  const map = {
    "Available": "bg-green-100 text-green-600",
    "Reserved":  "bg-blue-100 text-blue-600",
    "Booked":    "bg-red-100 text-red-500",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${map[status] || "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

/* ── Native select action dropdown for TABLE rows ── */
function TableAction({ row, onAction }) {
  const [val, setVal] = useState("");
  return (
    <div className="relative inline-block w-[110px]">
      <div className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer text-sm">
        <span className="text-xs text-slate-500">{val || "Action"}</span>
        <FiMoreVertical className="text-gray-400" size={14} />
      </div>
      <select
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        value={val}
        onChange={(e) => {
          const action = e.target.value;
          setVal("");
          onAction(action, row.propertyinfoid);
        }}
      >
        <option value="" disabled>Select Action</option>
        <option value="view">View</option>
        <option value="status">Status</option>
        <option value="reserved">Reserved</option>
        <option value="update">Update</option>
        <option value="delete">Delete</option>
      </select>
    </div>
  );
}

/* ── Popover action menu for MOBILE CARDS ── */
function CardActionMenu({ row, onAction }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative shrink-0">
      <button onClick={() => setOpen(!open)} className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
        <FiMoreVertical size={16} className="text-slate-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40 cursor-pointer"
          onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-50 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 w-40">
            {[
              { label: "View",     value: "view" },
              { label: "Status",   value: "status" },
              { label: "Reserved", value: "reserved" },
              { label: "Update",   value: "update" },
              { label: "Delete",   value: "delete", danger: true },
            ].map((a) => (
              <button key={a.value}
                onClick={() => { onAction(a.value, row.propertyinfoid); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${a.danger ? "text-red-500 hover:bg-red-50" : "text-slate-700 hover:bg-violet-50"}`}
              >{a.label}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Mobile Info Card ── */
function InfoCard({ row, category, onAction }) {
  const isPlot = category === "Plot";
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <StatusBadge status={row.status} />
          <p className="text-sm font-bold text-slate-900 mt-1">
            {isPlot
              ? `Plot ${row.plotno || "—"}`
              : `${row.wing || ""}${row.floorno ? ` · Floor ${row.floorno}` : ""}${row.flatno ? ` · Flat ${row.flatno}` : ""}`}
          </p>
          {row.mouza && <p className="text-xs text-slate-400">Mouza: {row.mouza} · {row.khasrano}</p>}
        </div>
        <CardActionMenu row={row} onAction={onAction} />
      </div>

      <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3">
        {isPlot ? (
          <>
            <div><p className="text-[9px] uppercase text-slate-400 font-semibold mb-0.5">Plot Facing</p><p className="text-xs font-semibold text-slate-800">{row.plotfacing || "—"}</p></div>
            <div><p className="text-[9px] uppercase text-slate-400 font-semibold mb-0.5">Plot Size</p><p className="text-xs font-semibold text-slate-800">{row.plotsize || "—"}</p></div>
            <div><p className="text-[9px] uppercase text-slate-400 font-semibold mb-0.5">Plot Area</p><p className="text-xs font-semibold text-slate-800">{row.payablearea ? `${row.payablearea} sqft` : "—"}</p></div>
            <div><p className="text-[9px] uppercase text-slate-400 font-semibold mb-0.5">₹/sqft</p><p className="text-xs font-semibold text-slate-800">{row.sqftprice || "—"}</p></div>
          </>
        ) : (
          <>
            <div><p className="text-[9px] uppercase text-slate-400 font-semibold mb-0.5">BHK Type</p><p className="text-xs font-semibold text-slate-800">{row.type || "—"}</p></div>
            <div><p className="text-[9px] uppercase text-slate-400 font-semibold mb-0.5">Flat Facing</p><p className="text-xs font-semibold text-slate-800">{row.flatfacing || "—"}</p></div>
            <div><p className="text-[9px] uppercase text-slate-400 font-semibold mb-0.5">Carpet Area</p><p className="text-xs font-semibold text-slate-800">{row.carpetarea ? `${row.carpetarea} sqft` : "—"}</p></div>
            <div><p className="text-[9px] uppercase text-slate-400 font-semibold mb-0.5">Payable Area</p><p className="text-xs font-semibold text-slate-800">{row.payablearea ? `${row.payablearea} sqft` : "—"}</p></div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div>
          <p className="text-[9px] uppercase text-slate-400 font-semibold">Basic Cost</p>
          <p className="text-sm font-bold text-[#5323DC]"><FormatPrice price={parseInt(row.basiccost)} /></p>
        </div>
        <div className="text-right">
          <p className="text-[9px] uppercase text-slate-400 font-semibold">Total Cost</p>
          <p className="text-sm font-bold text-slate-900"><FormatPrice price={parseInt(row.totalcost)} /></p>
        </div>
      </div>
    </div>
  );
}

/* ── Modal wrapper ── */
function Modal({ show, onClose, title, children, wide }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[61] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className={`relative z-10 bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full ${wide ? "md:max-w-3xl" : "md:max-w-lg"} max-h-[90vh] overflow-y-auto scrollbar-hide`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl md:rounded-t-2xl z-10">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100"><IoMdClose size={18} className="text-slate-500" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function ReadField({ label, value }) {
  return (
    <Field label={label}>
      <div className={readCls}>{value || "—"}</div>
    </Field>
  );
}

/* ── Main component ── */
const PropertiesFlatAndPlotInfo = () => {
  const { propertyid } = useParams();
  const { showInfo, setShowInfo, showInfoForm, setShowInfoForm, URI, setLoading } = useAuth();
  const navigate = useNavigate();

  const [datas, setDatas]           = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [info, setInfo]             = useState({});
  const [category, setCategory]     = useState("");
  const [newInfo, setNewInfo]       = useState(EMPTY_INFO);

  const resetInfo = () => setNewInfo(EMPTY_INFO);

  const recalc = (updated) => {
    const payablearea = parseFloat(updated.payablearea) || 0;
    const sqftprice   = parseFloat(updated.sqftprice)   || 0;
    const basiccost   = payablearea * sqftprice;
    const extras = ["stampduty","registration","advocatefee","watercharge","maintenance","gst","other"]
      .reduce((s, k) => s + (parseFloat(updated[k]) || 0), 0);
    return { ...updated, basiccost, totalcost: basiccost + extras };
  };

  const handleChange = (field, value) => setNewInfo((prev) => recalc({ ...prev, [field]: value }));

  /* ── API ── */
  const fetchCategory = async () => {
    try {
      const res = await fetch(URI + `/project-partner/properties/${propertyid}`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategory(data.propertyCategory?.toLowerCase().includes("flat") ? "Flat" : "Plot");
    } catch (e) { console.error(e); }
  };

  const fetchData = async () => {
    try {
      const res = await fetch(URI + "/project-partner/property/additional-info/" + propertyid, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error();
      setDatas(await res.json());
    } catch (e) { console.error(e); }
  };

  const view = async (id) => {
    try {
      const res = await fetch(URI + `/project-partner/property/additional-info/get/${id}`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error();
      setInfo(await res.json()); setShowInfo(true);
    } catch (e) { console.error(e); }
  };

  const addOrUpdate = async (e) => {
    e.preventDefault();
    const endpoint = newInfo.propertyinfoid ? `edit/${newInfo.propertyinfoid}` : `add/${propertyid}`;
    try {
      setLoading(true);
      const res = await fetch(URI + `/project-partner/property/additional-info/${endpoint}`, {
        method: newInfo.propertyinfoid ? "PUT" : "POST", credentials: "include",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(newInfo),
      });
      if (!res.ok) throw new Error();
      alert(newInfo.propertyinfoid ? "Updated!" : "Added!");
      resetInfo(); setShowInfoForm(false); fetchData();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const editRecord = async (id) => {
    try {
      const res = await fetch(URI + `/project-partner/property/additional-info/get/${id}`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error();
      setNewInfo(await res.json()); setShowInfoForm(true);
    } catch (e) { console.error(e); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      const res = await fetch(URI + `/project-partner/property/additional-info/delete/${id}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      res.ok ? (alert("Deleted!"), fetchData()) : alert(`Error: ${data.message}`);
    } catch (e) { console.error(e); }
  };

  const deleteAll = async () => {
    if (!window.confirm("Delete ALL data?")) return;
    try {
      const res = await fetch(URI + `/project-partner/property/additional-info/all/delete/${propertyid}`, { method: "DELETE", credentials: "include" });
      const data = await res.json();
      res.ok ? (alert("All deleted!"), fetchData()) : alert(`Error: ${data.message}`);
    } catch (e) { console.error(e); }
  };

  const toggleStatus = async (id) => {
    if (!window.confirm("Change status?")) return;
    try {
      const res = await fetch(URI + `/project-partner/property/additional-info/status/${id}`, { method: "PUT", credentials: "include" });
      const data = await res.json();
      alert(res.ok ? `Success: ${data.message}` : `Error: ${data.message}`);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const toggleReserved = async (id) => {
    if (!window.confirm(`Reserve this ${category}?`)) return;
    try {
      const res = await fetch(URI + `/project-partner/property/additional-info/reserved/${id}`, { method: "PUT", credentials: "include" });
      const data = await res.json();
      alert(res.ok ? `Success: ${data.message}` : `Error: ${data.message}`);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleAction = (action, id) => {
    switch (action) {
      case "view":     view(id);           break;
      case "status":   toggleStatus(id);   break;
      case "reserved": toggleReserved(id); break;
      case "update":   editRecord(id);     break;
      case "delete":   del(id);            break;
    }
  };

  useEffect(() => { fetchCategory(); fetchData(); }, []);

  const filteredData = datas?.filter((item) =>
    item.mouza?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ── Table styles ── */
  const customStyles = {
    rows:      { style: { padding: "4px 0", fontSize: "13px", fontWeight: 500, color: "#111827" } },
    headCells: { style: { fontSize: "13px", fontWeight: "600", background: "#00000007", color: "#374151" } },
    cells:     { style: { fontSize: "12px", color: "#1F2937" } },
  };

  const statusCell = (row) => <StatusBadge status={row.status} />;
  const actionCell = (row) => <TableAction row={row} onAction={handleAction} />;

  const flatColumns = [
    { name: "SN",          cell: (r, i) => <span className="text-xs font-bold text-slate-500">{i + 1}</span>, width: "60px" },
    { name: "Status",      cell: statusCell,                                                                   width: "120px" },
    { name: "Mouza",       selector: (r) => r.mouza,      minWidth: "120px" },
    { name: "Khasra",      selector: (r) => r.khasrano,   width: "110px" },
    { name: "Wing",        selector: (r) => r.wing,        width: "90px" },
    { name: "Wing Facing", selector: (r) => r.wingfacing, width: "110px" },
    { name: "Floor",       selector: (r) => r.floorno,    width: "80px" },
    { name: "Flat",        selector: (r) => r.flatno,     width: "80px" },
    { name: "BHK",         selector: (r) => r.type,       width: "80px" },
    { name: "Carpet",      selector: (r) => r.carpetarea  && `${r.carpetarea} sqft`,  width: "110px" },
    { name: "Payable",     selector: (r) => r.payablearea && `${r.payablearea} sqft`, width: "110px" },
    { name: "Basic Cost",  cell: (r) => <FormatPrice price={parseInt(r.basiccost)} />, width: "130px" },
    { name: "Total Cost",  cell: (r) => <FormatPrice price={parseInt(r.totalcost)} />, width: "130px" },
    { name: "Action",      cell: actionCell,               width: "120px" },
  ];

  const plotColumns = [
    { name: "SN",          cell: (r, i) => <span className="text-xs font-bold text-slate-500">{i + 1}</span>, width: "60px" },
    { name: "Status",      cell: statusCell,                                                                   width: "120px" },
    { name: "Mouza",       selector: (r) => r.mouza,      minWidth: "120px" },
    { name: "Khasra",      selector: (r) => r.khasrano,   width: "110px" },
    { name: "Plot No",     selector: (r) => r.plotno,     width: "100px" },
    { name: "Facing",      selector: (r) => r.plotfacing, width: "100px" },
    { name: "Size",        selector: (r) => r.plotsize,   width: "110px" },
    { name: "Area",        selector: (r) => r.payablearea && `${r.payablearea} sqft`, width: "110px" },
    { name: "₹/sqft",      selector: (r) => r.sqftprice,  width: "100px" },
    { name: "Basic Cost",  cell: (r) => <FormatPrice price={parseInt(r.basiccost)} />, width: "130px" },
    { name: "Total Cost",  cell: (r) => <FormatPrice price={parseInt(r.totalcost)} />, width: "130px" },
    { name: "Action",      cell: actionCell,               width: "120px" },
  ];

  const costFields = [
    ["stampduty","Stamp Duty"],["registration","Registration"],["advocatefee","Advocate Fee"],
    ["watercharge","Water Charge"],["maintenance","Maintenance"],["gst","GST"],["other","Other"],
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-8">

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 md:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Back button — mobile only */}
          <button
            onClick={() => navigate(-1)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shrink-0"
          >
            <ArrowLeft size={17} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{category || "Property"} Information</h1>
            <p className="text-xs text-slate-400">{filteredData.length} records</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            <CiSearch size={15} className="text-slate-400 shrink-0" />
            <input type="text" placeholder="Search..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm bg-transparent outline-none w-36 text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <DownloadCSV data={filteredData} filename={`${category}Info.csv`} />
          <button onClick={deleteAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 text-red-500 text-sm font-semibold hover:bg-red-100 transition-colors">
            <Trash2 size={14} /> Delete All
          </button>
          <button onClick={() => { resetInfo(); setShowInfoForm(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            style={{ background: GRADIENT }}>
            <Plus size={15} /> Add {category}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-6 py-5">

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filteredData.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-12 text-center text-slate-400 text-sm">No records found.</div>
          ) : filteredData.map((row) => (
            <InfoCard key={row.propertyinfoid} row={row} category={category} onAction={handleAction} />
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <DataTable
            customStyles={customStyles}
            columns={category === "Flat" ? flatColumns : plotColumns}
            data={filteredData}
            pagination
            paginationPerPage={15}
            paginationComponentOptions={{ rowsPerPageText: "Rows:", rangeSeparatorText: "of", selectAllRowsItem: true, selectAllRowsItemText: "All" }}
          />
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal show={showInfoForm} onClose={() => { setShowInfoForm(false); resetInfo(); }}
        title={`${newInfo.propertyinfoid ? "Edit" : "Add"} ${category} Details`} wide>
        <form onSubmit={addOrUpdate} className="space-y-5">
          <input type="hidden" value={newInfo.propertyinfoid || ""} onChange={(e) => setNewInfo((p) => ({ ...p, propertyinfoid: e.target.value }))} />

          {category === "Flat" ? (
            <>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">General Info</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[["mouza","Mouza",true],["khasrano","Khasra No",true],["wing","Wing",false],
                    ["wingfacing","Wing Facing",false],["floorno","Floor No",false],["flatno","Flat No",false],
                    ["flatfacing","Flat Facing",false],["type","BHK Type",false]].map(([field, label, req]) => (
                    <Field key={field} label={label} required={req}>
                      <input type="text" required={req} placeholder={`Enter ${label}`}
                        value={newInfo[field] || ""} onChange={(e) => handleChange(field, e.target.value)}
                        className={inputCls} />
                    </Field>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Area Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["carpetarea","builtuparea","superbuiltuparea","additionalarea","payablearea","sqftprice"].map((field) => (
                    <Field key={field} label={field.replace(/([A-Z])/g, " $1").trim()}>
                      <input type="number" min={0} placeholder="0"
                        value={newInfo[field] || ""} onChange={(e) => handleChange(field, e.target.value)}
                        className={inputCls} />
                    </Field>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Plot Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[["mouza","Mouza",true],["khasrano","Khasra No",true],["plotno","Plot No",true],
                  ["plotfacing","Plot Facing",false],["plotsize","Plot Size",false],
                  ["payablearea","Plot Area (sqft)",false],["sqftprice","₹ / sqft",false]].map(([field, label, req]) => (
                  <Field key={field} label={label} required={req}>
                    <input type={["payablearea","sqftprice"].includes(field) ? "number" : "text"}
                      min={0} required={req} placeholder={`Enter ${label}`}
                      value={newInfo[field] || ""} onChange={(e) => handleChange(field, e.target.value)}
                      className={inputCls} />
                  </Field>
                ))}
              </div>
            </div>
          )}

          {/* Cost (shared) */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Cost Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Basic Cost (Auto)">
                <div className={`${readCls} text-[#5323DC] font-bold`}>{newInfo.basiccost || 0}</div>
              </Field>
              {costFields.map(([field, label]) => (
                <Field key={field} label={label}>
                  <input type="number" min={0} placeholder="0"
                    value={newInfo[field] || ""} onChange={(e) => handleChange(field, e.target.value)}
                    className={inputCls} />
                </Field>
              ))}
              <Field label="Total Cost (Auto)">
                <div className={`${readCls} font-bold text-slate-900`}>{newInfo.totalcost || 0}</div>
              </Field>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => { setShowInfoForm(false); resetInfo(); }} className={btnSecondary}>Cancel</button>
            <button type="submit" className={btnPrimary} style={{ background: GRADIENT }}>Save Info</button>
            <Loader />
          </div>
        </form>
      </Modal>

      {/* ── View Modal ── */}
      <Modal show={showInfo} onClose={() => setShowInfo(false)} title={`${category} Details`} wide>
        <div className="space-y-5">
          {category === "Flat" ? (
            <>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">General Info</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Status"><div className={readCls}><StatusBadge status={info.status} /></div></Field>
                  {[["mouza","Mouza"],["khasrano","Khasra No"],["wing","Wing"],["wingfacing","Wing Facing"],
                    ["floorno","Floor No"],["flatno","Flat No"],["flatfacing","Flat Facing"],["type","BHK Type"]].map(([f, l]) => (
                    <ReadField key={f} label={l} value={info[f]} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Area Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[["carpetarea","Carpet Area"],["builtuparea","Built-up Area"],["superbuiltuparea","Super Built-up"],
                    ["additionalarea","Additional Area"],["payablearea","Payable Area"],["sqftprice","₹/sqft"]].map(([f, l]) => (
                    <ReadField key={f} label={l} value={info[f]} />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Plot Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Status"><div className={readCls}><StatusBadge status={info.status} /></div></Field>
                {[["mouza","Mouza"],["khasrano","Khasra No"],["plotno","Plot No"],["plotfacing","Plot Facing"],
                  ["plotsize","Plot Size"],["payablearea","Plot Area"],["sqftprice","₹/sqft"]].map(([f, l]) => (
                  <ReadField key={f} label={l} value={info[f]} />
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Cost Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[["basiccost","Basic Cost"],["stampduty","Stamp Duty"],["registration","Registration"],
                ["advocatefee","Advocate Fee"],["watercharge","Water Charge"],["maintenance","Maintenance"],
                ["gst","GST"],["other","Other"],["totalcost","Total Cost"]].map(([f, l]) => (
                <ReadField key={f} label={l} value={info[f]} />
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button onClick={() => setShowInfo(false)} className={btnPrimary} style={{ background: GRADIENT }}>Close</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PropertiesFlatAndPlotInfo;