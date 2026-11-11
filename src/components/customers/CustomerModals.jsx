import { IoMdClose } from "react-icons/io";
import Loader from "../Loader";
import FormatPrice from "../FormatPrice";
import { getImageURI } from "../../utils/helper";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 100%)";
const inputCls  = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none bg-slate-50 placeholder:text-slate-300";
const selectCls = `${inputCls} appearance-none cursor-pointer`;
const btnPrimary    = "px-5 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all";
const btnSecondary  = "px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all";

function Modal({ show, onClose, title, children, wide }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[61] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <div className={`relative z-10 bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full ${wide ? "md:max-w-2xl" : "md:max-w-md"} max-h-[90vh] overflow-y-auto scrollbar-hide`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl md:rounded-t-2xl z-10">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <IoMdClose size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function ReadField({ label, value }) {
  return (
    <Field label={label}>
      <div className="border border-slate-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 bg-slate-50 min-h-[42px] flex items-center">
        {value ?? "—"}
      </div>
    </Field>
  );
}

function PaymentCard({ image, type, amount, date, isToken }) {
  return (
    <div className="border border-slate-100 rounded-2xl p-3 bg-slate-50">
      <div className="flex gap-3">
        <img
          src={image}
          alt="Payment"
          onClick={() => window.open(image, "_blank")}
          className="w-20 h-16 object-cover rounded-xl cursor-pointer shrink-0"
        />
        <div className="flex flex-col gap-1 justify-center min-w-0">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Payment Type</p>
            <p className="text-sm font-bold text-slate-800">{type || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">{isToken ? "Token Amount" : "Amount"}</p>
            <FormatPrice price={amount} />
          </div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-slate-200">
        <p className="text-[10px] text-slate-400 font-semibold uppercase">Date & Time</p>
        <p className="text-xs text-slate-600">{date}</p>
      </div>
    </div>
  );
}

export default function CustomerModals({
  showCustomer, setShowCustomer,
  showCustomerPaymentForm, setShowCustomerPaymentForm,
  customer, paymentList, totalPaid, balancedAmount,
  enquirerId, setEnquirerId,
  customerPayment, setCustomerPayment,
  selectedImage, setSelectedImage,
  onAddPayment,
}) {
  function fmtLac(val) {
    const n = Number(val) || 0;
    return `${(n / 100000).toFixed(2)} Lac`;
  }

  return (
    <>
      {/* ── View Customer ── */}
      <Modal
        show={showCustomer}
        onClose={() => { setShowCustomer(false); }}
        title="Customer Details"
        wide
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReadField label="Customer Name"       value={customer.customer} />
          <ReadField label="Contact"             value={customer.contact} />
          <ReadField label="Sales Partner"       value={customer.assign} />
          <ReadField label="Sales Commission"    value={customer.salescommission?.toFixed(2) || "0"} />
          <ReadField label="Territory Partner"   value={`${customer.territoryName || ""} - ${customer.territoryContact || ""}`} />
          <ReadField label="Territory Commission" value={customer.territorycommission?.toFixed(2) || "0"} />
          <ReadField label="Deal Amount"         value={fmtLac(customer.dealamount)} />
          <ReadField label="Balance Amount"      value={fmtLac(balancedAmount)} />
          <div className="md:col-span-2">
            <ReadField label="Remark"            value={customer.remark} />
          </div>
        </div>

        {/* Payment History */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-slate-900">Payment History</p>
            <p className="text-sm font-bold text-slate-700">
              Total: <FormatPrice price={totalPaid} />
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Token payment */}
            <PaymentCard
              image={getImageURI(customer.paymentimage)}
              type={customer.paymenttype}
              amount={customer.tokenamount}
              date={customer.created_at}
              isToken
            />
            {/* Additional payments */}
            {paymentList?.map((p, i) => (
              <PaymentCard
                key={i}
                image={getImageURI(p.paymentImage)}
                type={p.paymentType}
                amount={p.paymentAmount}
                date={p.created_at}
              />
            ))}
          </div>
        </div>
      </Modal>

      {/* ── Add Payment ── */}
      <Modal
        show={showCustomerPaymentForm}
        onClose={() => setShowCustomerPaymentForm(false)}
        title="Add Payment"
      >
        <form onSubmit={onAddPayment} className="space-y-4">
          <Field label="Payment Type">
            <select
              required
              value={customerPayment.paymentType}
              onChange={(e) => setCustomerPayment({ ...customerPayment, paymentType: e.target.value })}
              className={selectCls}
            >
              <option value="" disabled>Select Payment Type</option>
              {["UPI", "Cash", "Check", "Net Banking"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>

          <Field label="Payment Amount">
            <input
              type="number"
              required
              placeholder="Enter amount"
              value={customerPayment.paymentAmount}
              onChange={(e) => setCustomerPayment({ ...customerPayment, paymentAmount: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Payment Image">
            <input type="file" required accept="image/*" onChange={(e) => setSelectedImage(e.target.files[0])} className="hidden" id="payImg" />
            <label htmlFor="payImg" className="flex items-center justify-between border border-slate-200 rounded-xl cursor-pointer overflow-hidden">
              <span className="px-4 py-2.5 text-sm text-slate-400">{selectedImage ? selectedImage.name : "Upload image (max 2MB)"}</span>
              <span className="text-white px-4 py-2.5 text-sm font-medium" style={{ background: GRADIENT }}>Browse</span>
            </label>
            {selectedImage && (
              <div className="relative mt-2">
                <img src={URL.createObjectURL(selectedImage)} alt="preview" className="w-full rounded-xl object-cover max-h-48" />
                <button type="button" onClick={() => setSelectedImage(null)} className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">✕</button>
              </div>
            )}
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCustomerPaymentForm(false)} className={btnSecondary}>Cancel</button>
            <button type="submit" className={btnPrimary} style={{ background: GRADIENT }}>Add Payment</button>
            <Loader />
          </div>
        </form>
      </Modal>
    </>
  );
}