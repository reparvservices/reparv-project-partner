import { IoMdClose } from "react-icons/io";
import Select from "react-select";
import Loader from "../Loader";
import DownloadCSV from "../DownloadCSV";
import { useAuth } from "../../store/auth.jsx";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 100%)";

const inputCls =
  "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#5323DC] focus:ring-2 focus:ring-[#5323DC10] transition-all bg-white placeholder:text-slate-300";
const selectCls = `${inputCls} appearance-none cursor-pointer`;
const btnPrimary =
  "flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all";
const btnSecondary =
  "px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all";

/* ── Shared ── */
function Modal({ show, onClose, title, subtitle, children, wide }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[61] flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      <div
        className={`relative z-10 bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full ${wide ? "md:max-w-2xl" : "md:max-w-md"} max-h-[90vh] overflow-y-auto scrollbar-hide`}
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl md:rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors mt-0.5"
          >
            <IoMdClose size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const STATUS_COLOR = {
  New: "text-green-600 bg-green-100",
  "Visit Scheduled": "text-blue-600 bg-blue-100",
  Token: "text-yellow-600 bg-yellow-100",
  Cancelled: "text-red-500 bg-red-100",
  "Follow Up": "text-violet-600 bg-violet-100",
};

/* ── Enquiry summary card used inside Assign modal ── */
function EnquirySummaryCard({ enquiry }) {
  const { isActiveSubscription } = useAuth();
  if (!enquiry || !enquiry.enquirersid) return null;

  const initial = enquiry.customer?.charAt(0)?.toUpperCase() || "?";
  const colors = [
    "#6D28D9",
    "#0EA5E9",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
  ];
  const bg = colors[(enquiry.customer?.charCodeAt(0) || 0) % colors.length];

  function fmtBudget(val) {
    const n = Number(val);
    if (!n) return "—";
    if (n >= 10000000)
      return "₹" + (n / 10000000).toFixed(1).replace(/\.0$/, "") + "Cr";
    if (n >= 100000)
      return "₹" + (n / 100000).toFixed(1).replace(/\.0$/, "") + "L";
    if (n >= 1000) return "₹" + (n / 1000).toFixed(0) + "k";
    return "₹" + n.toLocaleString("en-IN");
  }

  const budget =
    enquiry.minbudget || enquiry.maxbudget
      ? fmtBudget(enquiry.minbudget) +
        (enquiry.maxbudget ? " – " + fmtBudget(enquiry.maxbudget) : "")
      : enquiry.budget
        ? fmtBudget(enquiry.budget)
        : "—";

  const location =
    [enquiry.location, enquiry.city, enquiry.state]
      .filter(Boolean)
      .join(", ") || "—";

  const getContact = () => {
    if (!enquiry.contact) return "—";
    if (isActiveSubscription) {
      return enquiry.contact;
    } else {
      return "XXXXXXXXXX";
    }
  };

  return (
    <div className="bg-[#F2F4FF] rounded-2xl p-4 mb-5">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
          style={{ background: bg }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 text-base leading-tight truncate">
            {enquiry.customer || "—"}
          </p>
          <p className="text-sm text-slate-500 mt-0.5">{getContact()}</p>
        </div>
      </div>
      <div className="border-t border-slate-200 pt-3 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
            Budget
          </p>
          <p className="text-sm font-bold text-slate-800">{budget}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
            Category
          </p>
          <p className="text-sm font-bold text-slate-800 truncate">
            {enquiry.category || "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold mb-1">
            Location
          </p>
          <p className="text-sm font-bold text-slate-800 truncate">
            {location}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main export ── */
export default function EnquiryModals({
  showEnquiryForm,
  setShowEnquiryForm,
  showCSVEnquiryForm,
  setShowCSVEnquiryForm,
  showAssignSalesForm,
  setShowAssignSalesForm,
  showEnquiryStatusForm,
  setShowEnquiryStatusForm,
  showEnquirerPropertyForm,
  setShowEnquirerPropertyForm,
  showEnquiry,
  setShowEnquiry,
  newEnquiry,
  setNewEnquiry,
  enquiryStatus,
  setEnquiryStatus,
  salesPersonAssign,
  setSalesPersonAssign,
  salesPersonList,
  propertyId,
  setPropertyId,
  propertyList,
  properties,
  error,
  states,
  cities,
  file,
  setFile,
  enquirersCSVFileFormat,
  token,
  setToken,
  visitDate,
  setVisitDate,
  visitRemark,
  setVisitRemark,
  followUpRemark,
  setFollowUpRemark,
  cancelledRemark,
  setCancelledRemark,
  selectedImage,
  setSelectedImage,
  enquiry,
  remarkList,
  onAddEnquiry,
  onAddCsv,
  onAssignSales,
  onChangeStatus,
  onUpdateProperty,
}) {
  const customStyle = {
    menuList: (p) => ({
      ...p,
      maxHeight: "200px",
      paddingTop: 0,
      paddingBottom: 0,
    }),
  };
  const categories = [
    "NewFlat",
    "NewPlot",
    "RentalFlat",
    "RentalShop",
    "RentalOffice",
    "Resale",
    "RowHouse",
    "Lease",
    "FarmLand",
    "FarmHouse",
    "CommercialFlat",
    "CommercialPlot",
    "IndustrialSpace",
  ];

  /* helper: find current enquiry data for the assign modal */
  const assignEnquiryData = enquiry?.enquirersid ? enquiry : null;

  const { isActiveSubscription } = useAuth();

  const getContact = (contact) => {
    if (!contact) return "—";
    if (isActiveSubscription) {
      return contact;
    } else {
      return "XXXXXXXXXX";
    }
  };

  return (
    <>
      {/* ── Add / Edit Enquiry ── */}
      <Modal
        show={showEnquiryForm}
        onClose={() => {
          setShowEnquiryForm(false);
          setNewEnquiry({
            propertyid: null,
            customer: "",
            contact: "",
            minbudget: "",
            maxbudget: "",
            category: "",
            state: "",
            city: "",
            location: "",
            message: "",
          });
        }}
        title={newEnquiry.enquirersid ? "Edit Enquiry" : "Add Enquiry"}
        wide
      >
        <form onSubmit={onAddEnquiry}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input
                required
                type="text"
                placeholder="Customer name"
                value={newEnquiry.customer}
                onChange={(e) =>
                  setNewEnquiry({ ...newEnquiry, customer: e.target.value })
                }
                className={inputCls}
              />
            </Field>
            <Field label="Contact" required>
              <input
                required
                type="text"
                placeholder="10-digit number"
                value={newEnquiry.contact}
                onChange={(e) => {
                  if (/^\d{0,10}$/.test(e.target.value))
                    setNewEnquiry({ ...newEnquiry, contact: e.target.value });
                }}
                className={inputCls}
              />
            </Field>
            <Field label="Min Budget" required>
              <input
                required
                type="number"
                placeholder="e.g. 1000000"
                value={newEnquiry.minbudget}
                onChange={(e) =>
                  setNewEnquiry({ ...newEnquiry, minbudget: e.target.value })
                }
                className={inputCls}
              />
            </Field>
            <Field label="Max Budget" required>
              <input
                required
                type="number"
                placeholder="e.g. 10000000"
                value={newEnquiry.maxbudget}
                onChange={(e) =>
                  setNewEnquiry({ ...newEnquiry, maxbudget: e.target.value })
                }
                className={inputCls}
              />
            </Field>
            <Field label="Category">
              <select
                value={newEnquiry.category}
                onChange={(e) =>
                  setNewEnquiry({ ...newEnquiry, category: e.target.value })
                }
                className={selectCls}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="State" required>
              <select
                required
                value={newEnquiry.state}
                onChange={(e) =>
                  setNewEnquiry({ ...newEnquiry, state: e.target.value })
                }
                className={selectCls}
              >
                <option value="">Select State</option>
                {states?.map((s, i) => (
                  <option key={i} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="City" required>
              <select
                required
                value={newEnquiry.city}
                onChange={(e) =>
                  setNewEnquiry({ ...newEnquiry, city: e.target.value })
                }
                className={selectCls}
              >
                <option value="">Select City</option>
                {cities?.map((c, i) => (
                  <option key={i} value={c.city}>
                    {c.city}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location" required>
              <input
                required
                type="text"
                placeholder="Enter location"
                value={newEnquiry.location}
                onChange={(e) =>
                  setNewEnquiry({ ...newEnquiry, location: e.target.value })
                }
                className={inputCls}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label={error || "Select Property"}>
                <select
                  value={newEnquiry.propertyid || ""}
                  onChange={(e) =>
                    setNewEnquiry({
                      ...newEnquiry,
                      propertyid: e.target.value || null,
                    })
                  }
                  className={selectCls}
                >
                  <option value="">Select Property</option>
                  {properties?.map((p, i) => (
                    <option key={i} value={p.propertyid}>
                      {p.propertyName} | {p.builtUpArea} sqft
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Message" required>
                <textarea
                  required
                  placeholder="Enter message..."
                  value={newEnquiry.message}
                  onChange={(e) =>
                    setNewEnquiry({ ...newEnquiry, message: e.target.value })
                  }
                  rows={3}
                  className={inputCls}
                />
              </Field>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowEnquiryForm(false)}
              className={btnSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={btnPrimary}
              style={{ background: GRADIENT }}
            >
              Save Enquiry
            </button>
            <Loader />
          </div>
        </form>
      </Modal>

      {/* ── CSV Import ── */}
      <Modal
        show={showCSVEnquiryForm}
        onClose={() => setShowCSVEnquiryForm(false)}
        title="Import Enquiries via CSV"
      >
        <form onSubmit={onAddCsv} className="space-y-4">
          <Field label="CSV File">
            <input
              type="file"
              required
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="csvFile"
            />
            <label
              htmlFor="csvFile"
              className="flex items-center justify-between border border-slate-200 rounded-xl cursor-pointer overflow-hidden"
            >
              <span className="px-4 py-2.5 text-sm text-slate-400">
                {file ? file.name : "Choose CSV file..."}
              </span>
              <span
                className="text-white px-4 py-2.5 text-sm font-medium"
                style={{ background: GRADIENT }}
              >
                Browse
              </span>
            </label>
          </Field>
          <div className="flex justify-end gap-3 mt-4">
            <DownloadCSV
              data={enquirersCSVFileFormat}
              filename="Enquirers_File_Format.csv"
            />
            <button
              type="submit"
              className={btnPrimary}
              style={{ background: GRADIENT }}
            >
              Upload
            </button>
            <Loader />
          </div>
        </form>
      </Modal>

      {/* ── Assign Sales Partner (new design) ── */}
      <Modal
        show={showAssignSalesForm}
        onClose={() => setShowAssignSalesForm(false)}
        title="Change Sales Partner"
        subtitle={
          assignEnquiryData?.enquirersid
            ? `IM #LM-${assignEnquiryData.enquirersid} · ${assignEnquiryData.created_at || ""}`
            : undefined
        }
      >
        <form onSubmit={onAssignSales} className="space-y-5">
          {/* Enquiry summary card */}
          <EnquirySummaryCard enquiry={assignEnquiryData} />

          {/* Sales Partner */}
          <Field label="Sales Partner" required>
            <div className="relative">
              <Select
                styles={{
                  ...customStyle,
                  control: (base) => ({
                    ...base,
                    borderRadius: "12px",
                    borderColor: "#e2e8f0",
                    minHeight: "48px",
                    boxShadow: "none",
                    "&:hover": { borderColor: "#5323DC" },
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#94a3b8",
                    fontSize: "14px",
                  }),
                }}
                className="text-sm"
                options={salesPersonList
                  ?.filter((sp) => sp.status === "Active")
                  .map((sp) => ({
                    value: {
                      salespersonid: sp.salespersonsid,
                      salesperson: sp.fullname,
                      salespersoncontact: sp.contact,
                    },
                    label: `${sp.fullname} | ${sp.contact}`,
                  }))}
                placeholder="Select Sales Partner"
                value={
                  salesPersonAssign
                    ? salesPersonList
                        ?.filter((sp) => sp.status === "Active")
                        .map((sp) => ({
                          value: {
                            salespersonid: sp.salespersonsid,
                            salesperson: sp.fullname,
                            salespersoncontact: sp.contact,
                          },
                          label: `${sp.fullname} | ${sp.contact}`,
                        }))
                        .find(
                          (o) =>
                            o.value.salespersonid ===
                            salesPersonAssign.salespersonid,
                        ) || null
                    : null
                }
                onChange={(s) => setSalesPersonAssign(s?.value || null)}
              />
            </div>
          </Field>

          {/* Status */}
          <Field label="Status">
            <select
              value={salesPersonAssign?.status || ""}
              onChange={(e) =>
                setSalesPersonAssign({
                  ...salesPersonAssign,
                  status: e.target.value,
                })
              }
              className={selectCls}
              style={{ borderRadius: "12px", minHeight: "48px" }}
            >
              <option value="">Select Status</option>
              {[
                "New",
                "In Progress",
                "Visit Scheduled",
                "Follow Up",
                "Token",
                "Cancelled",
              ].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          {/* Assignment Notes */}
          <Field label="Assignment Notes">
            <textarea
              rows={4}
              placeholder="Client is interested in..."
              value={salesPersonAssign?.notes || ""}
              onChange={(e) =>
                setSalesPersonAssign({
                  ...salesPersonAssign,
                  notes: e.target.value,
                })
              }
              className={inputCls}
              style={{ borderRadius: "12px", resize: "none" }}
            />
          </Field>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAssignSalesForm(false)}
              className="flex-1 py-3 text-sm font-semibold rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 text-sm font-semibold text-white rounded-2xl hover:opacity-90 active:scale-95 transition-all"
              style={{ background: GRADIENT }}
            >
              Assign Sales Partner
            </button>
          </div>
          <Loader />
        </form>
      </Modal>

      {/* ── Change Status ── */}
      <Modal
        show={showEnquiryStatusForm}
        onClose={() => setShowEnquiryStatusForm(false)}
        title="Change Enquiry Status"
        wide
      >
        <form onSubmit={onChangeStatus}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Enquiry Status">
              <select
                value={enquiryStatus}
                onChange={(e) => setEnquiryStatus(e.target.value)}
                className={selectCls}
              >
                <option value="" disabled>
                  Select Status
                </option>
                {[
                  "New",
                  "Visit Scheduled",
                  "Token",
                  "Follow Up",
                  "Cancelled",
                ].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>

            {enquiryStatus === "Visit Scheduled" && (
              <>
                <Field label="Meeting Date">
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value.split("T")[0])}
                    className={inputCls}
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Remark">
                    <textarea
                      rows={2}
                      value={visitRemark}
                      onChange={(e) => setVisitRemark(e.target.value)}
                      placeholder="Enter remark..."
                      className={inputCls}
                    />
                  </Field>
                </div>
              </>
            )}

            {enquiryStatus === "Token" && (
              <>
                <Field label="Payment Type">
                  <input
                    type="text"
                    value={token.paymenttype}
                    onChange={(e) =>
                      setToken({ ...token, paymenttype: e.target.value })
                    }
                    placeholder="e.g. NEFT"
                    className={inputCls}
                  />
                </Field>
                <Field label="Token Amount">
                  <input
                    type="number"
                    value={token.tokenamount}
                    onChange={(e) =>
                      setToken({ ...token, tokenamount: e.target.value })
                    }
                    placeholder="Amount"
                    className={inputCls}
                  />
                </Field>
                <Field label="Deal Amount">
                  <input
                    type="number"
                    value={token.dealamount}
                    onChange={(e) =>
                      setToken({ ...token, dealamount: e.target.value })
                    }
                    placeholder="Amount"
                    className={inputCls}
                  />
                </Field>
                <Field label="Remark">
                  <textarea
                    rows={2}
                    value={token.remark}
                    onChange={(e) =>
                      setToken({ ...token, remark: e.target.value })
                    }
                    placeholder="Enter remark..."
                    className={inputCls}
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Payment Screenshot">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedImage(e.target.files[0])}
                      className="hidden"
                      id="imgUp"
                    />
                    <label
                      htmlFor="imgUp"
                      className="flex items-center justify-between border border-slate-200 rounded-xl cursor-pointer overflow-hidden"
                    >
                      <span className="px-4 py-2.5 text-sm text-slate-400">
                        Upload image
                      </span>
                      <span className="bg-slate-800 text-white px-4 py-2.5 text-sm">
                        Browse
                      </span>
                    </label>
                    {selectedImage && (
                      <div className="relative mt-2">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="preview"
                          className="w-full rounded-xl object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedImage(null)}
                          className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </Field>
                </div>
              </>
            )}

            {enquiryStatus === "Follow Up" && (
              <>
                <Field label="Visit Date">
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value || null)}
                    className={inputCls}
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Remark">
                    <textarea
                      rows={2}
                      value={followUpRemark}
                      onChange={(e) => setFollowUpRemark(e.target.value)}
                      placeholder="Enter remark..."
                      className={inputCls}
                    />
                  </Field>
                </div>
              </>
            )}

            {enquiryStatus === "Cancelled" && (
              <div className="md:col-span-2">
                <Field label="Cancellation Remark">
                  <textarea
                    rows={2}
                    value={cancelledRemark}
                    onChange={(e) => setCancelledRemark(e.target.value)}
                    placeholder="Enter remark..."
                    className={inputCls}
                  />
                </Field>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowEnquiryStatusForm(false)}
              className={btnSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={btnPrimary}
              style={{ background: GRADIENT }}
            >
              Set Status
            </button>
            <Loader />
          </div>
        </form>
      </Modal>

      {/* ── Update Property ── */}
      <Modal
        show={showEnquirerPropertyForm}
        onClose={() => setShowEnquirerPropertyForm(false)}
        title="Update Property"
      >
        <form onSubmit={onUpdateProperty} className="space-y-4">
          <Field label="Select Property">
            <select
              required
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className={selectCls}
            >
              <option value="">Select Property</option>
              {propertyList?.map((p, i) => (
                <option key={i} value={p.propertyid}>
                  {p.propertyName} | {p.builtUpArea} sqft
                </option>
              ))}
            </select>
          </Field>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowEnquirerPropertyForm(false)}
              className={btnSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={btnPrimary}
              style={{ background: GRADIENT }}
            >
              Update
            </button>
            <Loader />
          </div>
        </form>
      </Modal>

      {/* ── View Enquiry ── */}
      <Modal
        show={showEnquiry}
        onClose={() => setShowEnquiry(false)}
        title="Enquiry Details"
        wide
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ["Customer", enquiry.customer],
            ["Contact", enquiry.contact],
            ["Min Budget", enquiry.minbudget],
            ["Max Budget", enquiry.maxbudget],
            ["Category", enquiry.category],
            ["State", enquiry.state],
            ["City", enquiry.city],
            ["Location", enquiry.location],
            ["Status", enquiry.status],
            ["Sales Partner", enquiry.assign],
          ].map(([label, val]) =>
            val ? (
              <Field key={label} label={label}>
                <div className="border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-slate-50">
                  {val}
                </div>
              </Field>
            ) : null,
          )}
          <div className="md:col-span-2">
            <Field label="Territory Partner">
              <div className="border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-slate-50">
                {(enquiry.territoryName
                  ? enquiry.territoryName + " · "
                  : "No ") + (enquiry.territoryContact || "Assign")}
              </div>
            </Field>
          </div>
          {enquiry.message && (
            <div className="md:col-span-2">
              <Field label="Message">
                <div className="border border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-slate-50">
                  {enquiry.message}
                </div>
              </Field>
            </div>
          )}
        </div>

        {/* Remark history */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-900 mb-3">
            Remark History
          </p>
          <div className="space-y-2">
            {remarkList.length > 0 ? (
              remarkList.map((r, i) => {
                const sc =
                  STATUS_COLOR[r.status] || "text-slate-600 bg-slate-100";
                return (
                  <div
                    key={i}
                    className="border border-slate-100 rounded-xl p-3.5 bg-slate-50"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc}`}
                      >
                        {r.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(r.created_at).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      {r.visitdate && (
                        <span className="text-xs text-slate-400">
                          Visit: {r.visitdate}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700">{r.remark}</p>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-slate-400 text-center py-6">
                No remarks found.
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
