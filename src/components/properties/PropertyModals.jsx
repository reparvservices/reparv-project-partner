import { IoMdClose } from "react-icons/io";
import Loader from "../Loader";
import DownloadCSV from "../DownloadCSV";
import UpdateImagesForm from "./UpdateImagesForm";
const GRADIENT = "linear-gradient(94.94deg, #5323DC -8.34%, #8E61FF 97.17%)";
const inputCls =
  "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#5323DC] focus:ring-2 focus:ring-[#5323DC10] transition-all bg-white placeholder:text-slate-300";
const selectCls = `${inputCls} appearance-none cursor-pointer`;
const btnPrimary =
  "px-5 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all";
const btnSecondary =
  "px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all";

function Modal({ show, onClose, title, children, wide }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[61] flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer" onClick={onClose}
      />
      <div
        className={`relative z-10 bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full ${wide ? "md:max-w-2xl" : "md:max-w-md"} max-h-[90vh] overflow-y-auto scrollbar-hide`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl md:rounded-t-2xl z-10">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100"
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
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function FilePicker({ label, accept, file, onChange, hint }) {
  return (
    <Field label={label}>
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files[0])}
        className="hidden"
        id={`fp-${label}`}
      />
      <label
        htmlFor={`fp-${label}`}
        className="flex items-center justify-between border border-slate-200 rounded-xl cursor-pointer overflow-hidden"
      >
        <span className="px-4 py-2.5 text-sm text-slate-400 truncate">
          {file ? file.name : "Choose file..."}
        </span>
        <span
          className="text-white px-4 py-2.5 text-sm font-medium shrink-0"
          style={{ background: GRADIENT }}
        >
          Browse
        </span>
      </label>
      {hint && <p className="text-xs text-red-400">{hint}</p>}
      {file && file.type?.startsWith("image/") && (
        <div className="relative mt-2">
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="w-full rounded-xl object-cover max-h-40"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
          >
            ✕
          </button>
        </div>
      )}
    </Field>
  );
}

export default function PropertyModals({
  showRejectReasonForm,
  setShowRejectReasonForm,
  showSeoForm,
  setShowSeoForm,
  showCommissionForm,
  setShowCommissionForm,
  showVideoUploadForm,
  setShowVideoUploadForm,
  showPropertyLocationForm,
  setShowPropertyLocationForm,
  fetchImages,
  propertyImageData,
  imageFiles,
  setImageFiles,
  showUpdateImagesForm,
  setShowUpdateImagesForm,
  showAdditionalInfoForm,
  setShowAdditionalInfoForm,
  showNewPlotAdditionalInfoForm,
  setShowNewPlotAdditionalInfoForm,
  rejectReason,
  setRejectReason,
  seoSlug,
  setSeoSlug,
  pageTitle,
  setPageTitle,
  seoTittle,
  setSeoTittle,
  seoDescription,
  setSeoDescription,
  propertyDescription,
  setPropertyDescription,
  propertyCommission,
  setPropertyCommission,
  videoUpload,
  setVideoUpload,
  selectedImage,
  setSelectedImage,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  images,
  setImages,
  propertyId,
  setPropertyId,
  propertyKey,
  setPropertyKey,
  file,
  setFile,
  newAddInfo,
  setNewAddInfo,
  selectedScheduledPropertyImage,
  setSelectedScheduledPropertyImage,
  selectedSignedDocumentImage,
  setSelectedSignedDocumentImage,
  selectedSatBaraImage,
  setSelectedSatBaraImage,
  selectedOwnerAdharImage,
  setSelectedOwnerAdharImage,
  selectedOwnerPanImage,
  setSelectedOwnerPanImage,
  selectedEBillImage,
  setSelectedEBillImage,
  onAddRejectReason,
  onAddSeo,
  onAddCommission,
  onUploadVideo,
  onUpdateLocation,
  onAddImages,
  onAddCsv,
  onAddCsvPlot,
}) {
  const additionalInfoCSVFileFormat = [
    {
      Mouza: "Nagpur",
      Khasra_No: "123/ABC",
      Wing: "A",
      Wing_Facing: "East",
      Floor_No: "3",
      Flat_No: "101",
      Flat_Facing: "East",
      BHK_Type: "2 BHK",
      Carpet_Area: 2200,
      Builtup_Area: 1800,
      Super_Builtup_Area: 1800,
      Additional_Area: 100,
      Payable_Area: 2000,
      SQFT_Price: 10000,
      Basic_Cost: "=M2*N2",
      Stamp_Duty: 10000,
      Registration: 30000,
      GST: 500000,
      GOV_Water_Charge: 10000,
      Maintenance: 50000,
      Advocate_Fee: 20000,
      Other_Charges: 50000,
      Total_Cost: "=O2+P2+Q2+R2+S2+T2+U2+V2",
    },
  ];
  const additionalInfoNewPlotCSVFileFormat = [
    {
      Mouza: "Nagpur",
      Khasra_No: "123/ABC",
      Plot_No: "3",
      Facing: "East",
      Plot_Size: "20 X 30",
      Plot_Area: 2200,
      SQFT_Price: 1000,
      Basic_Cost: 2200000,
      Stamp_Duty: 10000,
      Registration: 30000,
      GST: 500000,
      Maintenance: 50000,
      Advocate_Fee: 20000,
      Other_Charges: 50000,
      Total_Cost: 2420000,
    },
  ];

  return (
    <>
      {/* Reject Reason */}
      <Modal
        show={showRejectReasonForm}
        onClose={() => setShowRejectReasonForm(false)}
        title="Add Reject Reason"
      >
        <form onSubmit={onAddRejectReason} className="space-y-4">
          <Field label="Reject Reason" required>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason..."
              className={inputCls}
            />
          </Field>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowRejectReasonForm(false)}
              className={btnSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={btnPrimary}
              style={{ background: GRADIENT }}
            >
              Submit
            </button>
            <Loader />
          </div>
        </form>
      </Modal>
      {/* SEO */}
      <Modal
        show={showSeoForm}
        onClose={() => setShowSeoForm(false)}
        title="SEO Details"
        wide
      >
        <form onSubmit={onAddSeo} className="space-y-4">
          <Field label="SEO Slug">
            <input
              type="text"
              value={seoSlug}
              onChange={(e) => setSeoSlug(e.target.value)}
              className={inputCls}
              placeholder="e.g. property-name-city"
            />
          </Field>
          <Field label="Page Title">
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="SEO Title">
            <input
              type="text"
              value={seoTittle}
              onChange={(e) => setSeoTittle(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="SEO Description">
            <textarea
              rows={3}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Property Description">
            <textarea
              rows={4}
              value={propertyDescription}
              onChange={(e) => setPropertyDescription(e.target.value)}
              className={inputCls}
            />
          </Field>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowSeoForm(false)}
              className={btnSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={btnPrimary}
              style={{ background: GRADIENT }}
            >
              Save SEO
            </button>
            <Loader />
          </div>
        </form>
      </Modal>
      {/* Commission */}
      <Modal
        show={showCommissionForm}
        onClose={() => setShowCommissionForm(false)}
        title="Set Commission"
      >
        <form onSubmit={onAddCommission} className="space-y-4">
          <Field label="Commission Type">
            <select
              value={propertyCommission.commissionType}
              onChange={(e) =>
                setPropertyCommission({
                  ...propertyCommission,
                  commissionType: e.target.value,
                })
              }
              className={selectCls}
            >
              <option value="">Select Type</option>
              <option value="Fixed">Fixed Amount</option>
              <option value="Percentage">Percentage</option>
              <option value="PerSqFt">Per Sq Ft</option>
            </select>
          </Field>
          <Field label="Commission Amount">
            <input
              type="number"
              value={propertyCommission.commissionAmount}
              onChange={(e) =>
                setPropertyCommission({
                  ...propertyCommission,
                  commissionAmount: e.target.value,
                })
              }
              className={inputCls}
              placeholder="Amount"
            />
          </Field>
          <Field label="Commission %">
            <input
              type="number"
              value={propertyCommission.commissionPercentage}
              onChange={(e) =>
                setPropertyCommission({
                  ...propertyCommission,
                  commissionPercentage: e.target.value,
                })
              }
              className={inputCls}
              placeholder="%"
            />
          </Field>
          <Field label="Amount Per Sq Ft">
            <input
              type="number"
              value={propertyCommission.commissionAmountPerSquareFeet}
              onChange={(e) =>
                setPropertyCommission({
                  ...propertyCommission,
                  commissionAmountPerSquareFeet: e.target.value,
                })
              }
              className={inputCls}
              placeholder="₹ per sq ft"
            />
          </Field>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCommissionForm(false)}
              className={btnSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={btnPrimary}
              style={{ background: GRADIENT }}
            >
              Save
            </button>
            <Loader />
          </div>
        </form>
      </Modal>
      {/* Brochure & Video */}
      <Modal
        show={showVideoUploadForm}
        onClose={() => setShowVideoUploadForm(false)}
        title="Brochure & Video"
      >
        <form onSubmit={onUploadVideo} className="space-y-4">
          <FilePicker
            label="Brochure File (PDF/Image, max 300MB)"
            accept="image/*,application/pdf"
            file={selectedImage}
            onChange={setSelectedImage}
          />
          <Field label="YouTube Video Link">
            <input
              type="text"
              value={videoUpload.videoLink || ""}
              onChange={(e) =>
                setVideoUpload({ ...videoUpload, videoLink: e.target.value })
              }
              className={inputCls}
              placeholder="https://youtube.com/..."
            />
          </Field>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowVideoUploadForm(false)}
              className={btnSecondary}
            >
              Cancel
            </button>
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
      {/* Location */}
      <Modal
        show={showPropertyLocationForm}
        onClose={() => setShowPropertyLocationForm(false)}
        title="Update Location"
      >
        <form onSubmit={onUpdateLocation} className="space-y-4">
          <Field label="Latitude">
            <input
              type="text"
              value={latitude || ""}
              onChange={(e) => setLatitude(e.target.value)}
              className={inputCls}
              placeholder="e.g. 21.1458"
            />
          </Field>
          <Field label="Longitude">
            <input
              type="text"
              value={longitude || ""}
              onChange={(e) => setLongitude(e.target.value)}
              className={inputCls}
              placeholder="e.g. 79.0882"
            />
          </Field>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowPropertyLocationForm(false)}
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

      {/* Update Images */}
      <UpdateImagesForm
        fetchImages={fetchImages}
        propertyId={propertyKey}
        setPropertyId={setPropertyKey}
        newProperty={propertyImageData}
        imageFiles={imageFiles}
        setImageFiles={setImageFiles}
      />

      {/* Additional Info — Flat */}
      <Modal
        show={showAdditionalInfoForm}
        onClose={() => setShowAdditionalInfoForm(false)}
        title="Additional Info (Flat CSV)"
      >
        <form onSubmit={onAddCsv} className="space-y-4">
          <Field label="CSV File">
            <input
              type="file"
              required
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="flatCsv"
            />
            <label
              htmlFor="flatCsv"
              className="flex items-center justify-between border border-slate-200 rounded-xl cursor-pointer overflow-hidden"
            >
              <span className="px-4 py-2.5 text-sm text-slate-400">
                {file ? file.name : "Choose CSV..."}
              </span>
              <span
                className="text-white px-4 py-2.5 text-sm font-medium"
                style={{ background: GRADIENT }}
              >
                Browse
              </span>
            </label>
          </Field>
          <div className="flex justify-end gap-3">
            <DownloadCSV
              data={additionalInfoCSVFileFormat}
              filename="FlatAdditionalInfo_Format.csv"
            />
            <button
              type="button"
              onClick={() => setShowAdditionalInfoForm(false)}
              className={btnSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={btnPrimary}
              style={{ background: GRADIENT }}
            >
              Upload CSV
            </button>
            <Loader />
          </div>
        </form>
      </Modal>
      {/* Additional Info — Plot */}
      <Modal
        show={showNewPlotAdditionalInfoForm}
        onClose={() => setShowNewPlotAdditionalInfoForm(false)}
        title="Additional Info (Plot CSV)"
      >
        <form onSubmit={onAddCsvPlot} className="space-y-4">
          <Field label="CSV File">
            <input
              type="file"
              required
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="plotCsv"
            />
            <label
              htmlFor="plotCsv"
              className="flex items-center justify-between border border-slate-200 rounded-xl cursor-pointer overflow-hidden"
            >
              <span className="px-4 py-2.5 text-sm text-slate-400">
                {file ? file.name : "Choose CSV..."}
              </span>
              <span
                className="text-white px-4 py-2.5 text-sm font-medium"
                style={{ background: GRADIENT }}
              >
                Browse
              </span>
            </label>
          </Field>
          <div className="flex justify-end gap-3">
            <DownloadCSV
              data={additionalInfoCSVFileFormat}
              filename="PlotAdditionalInfo_Format.csv"
            />
            <button
              type="button"
              onClick={() => setShowNewPlotAdditionalInfoForm(false)}
              className={btnSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={btnPrimary}
              style={{ background: GRADIENT }}
            >
              Upload CSV
            </button>
            <Loader />
          </div>
        </form>
      </Modal>
    </>
  );
}
