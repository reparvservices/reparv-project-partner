import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { uploadToS3 } from "../../utils/s3";
import Loader from "../../components/Loader";
import AddPropertyHeader from "../../components/properties/addProperty/AddPropertyHeader";
import ListingQualitySidebar from "../../components/properties/addProperty/ListingQualitySidebar";
import StepOne from "../../components/properties/addProperty/StepOne";
import StepTwo from "../../components/properties/addProperty/StepTwo";
import StepThree from "../../components/properties/addProperty/StepThree";
import VideoLinksForm, { youtubeRegex, instagramReelRegex } from "../../components/properties/addProperty/VideoLinksForm";

const VIDEO_LINK_FIELDS = { videoLink: youtubeRegex, instagramReelLink: instagramReelRegex };
const VIDEO_LINK_ERRORS = { videoLink: "Enter a valid YouTube video link", instagramReelLink: "Enter a valid Instagram reel link" };

const EMPTY_PROPERTY = {
  propertyid: "",
  builderid: "",
  projectBy: "",
  possessionDate: "",
  propertyCategory: "",
  propertyApprovedBy: "",
  propertyName: "",
  address: "",
  state: "",
  city: "",
  pincode: "",
  location: "",
  distanceFromCityCenter: "",
  latitude: "",
  longitude: "",
  totalSalesPrice: "",
  totalOfferPrice: "",
  stampDuty: "",
  registrationFee: "",
  gst: "",
  advocateFee: "",
  msebWater: "",
  maintenance: "",
  other: "",
  tags: "",
  propertyType: "",
  builtYear: "",
  ownershipType: "",
  builtUpArea: "",
  carpetArea: "",
  parkingAvailability: "",
  totalFloors: "",
  floorNo: "",
  loanAvailability: "",
  propertyFacing: "",
  reraRegistered: "",
  furnishing: "",
  waterSupply: "",
  powerBackup: "",
  locationFeature: [],
  sizeAreaFeature: "",
  parkingFeature: "",
  terraceFeature: "",
  ageOfPropertyFeature: "",
  amenitiesFeature: [],
  propertyStatusFeature: "",
  smartHomeFeature: [],
  securityBenefit: [],
  primeLocationBenefit: [],
  rentalIncomeBenefit: [],
  qualityBenefit: [],
  capitalAppreciationBenefit: [],
  ecofriendlyBenefit: [],
  videoLink: "",
  instagramReelLink: "",
};

const EMPTY_IMAGES = {
  frontView: [],
  sideView: [],
  kitchenView: [],
  hallView: [],
  bedroomView: [],
  bathroomView: [],
  balconyView: [],
  nearestLandmark: [],
  developedAmenities: [],
};

const REQUIRED_STEP1 = [
  "propertyCategory",
  "propertyName",
  "address",
  "state",
  "city",
  "pincode",
  "location",
  "distanceFromCityCenter",
  "latitude",
  "longitude",
  "totalSalesPrice",
  "totalOfferPrice",
  "stampDuty",
  "other",
  "tags",
];

const REQUIRED_STEP2 = [
  "carpetArea",
  "loanAvailability",
  "propertyFacing",
  "waterSupply",
  "powerBackup",
  "securityBenefit",
  "primeLocationBenefit",
  "rentalIncomeBenefit",
  "capitalAppreciationBenefit",
  "ecofriendlyBenefit",
];

const STEPS = [
  { label: "Property Details", desc: "Category, location & pricing" },
  { label: "Overview & Features", desc: "Specs, amenities & benefits" },
  { label: "Media Gallery", desc: "Upload property photos" },
];

export default function UpdateProperty() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { URI, setLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_PROPERTY);
  const [imageFiles, setImageFiles] = useState(EMPTY_IMAGES);
  const [builderData, setBuilderData] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [nextEnabled, setNextEnabled] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [linkErrors, setLinkErrors] = useState({ videoLink: "", instagramReelLink: "" });
  // Links as loaded — only send a link back if the partner changed it
  const loadedLinks = useRef({ videoLink: "", instagramReelLink: "" });

  /* ── fetch existing property ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${URI}/project-partner/properties/${id}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        loadedLinks.current = {
          videoLink: data.videoLink || "",
          instagramReelLink: data.instagramReelLink || "",
        };
        setForm((prev) => ({ ...prev, ...data, ...loadedLinks.current }));
      } catch (e) {
        console.error(e);
        alert("Failed to load property.");
        navigate("/app/properties");
      } finally {
        setFetchingData(false);
      }
    })();
  }, [id]);

  /* ── reference data ── */
  useEffect(() => {
    Promise.all([
      fetch(`${URI}/admin/authorities`, { credentials: "include" }).then((r) =>
        r.json(),
      ),
      fetch(`${URI}/admin/states`, { credentials: "include" }).then((r) =>
        r.json(),
      ),
      fetch(`${URI}/project-partner/builders/active`, { credentials: "include" }).then(
        (r) => r.json(),
      ),
    ])
      .then(([auth, st, bl]) => {
        setAuthorities(auth);
        setStates(st);
        setBuilderData(bl);
      })
      .catch(console.error);
  }, [URI]);

  /* ── fetch cities when state changes ── */
  useEffect(() => {
    if (!form.state) return;
    fetch(`${URI}/admin/cities/${form.state}`, { credentials: "include" })
      .then((r) => r.json())
      .then(setCities)
      .catch(console.error);
  }, [form.state, URI]);

  /* ── step validation ── */
  useEffect(() => {
    if (step === 1) {
      setNextEnabled(
        REQUIRED_STEP1.every((f) => {
          const v = form[f];
          return typeof v === "number" ? v >= 0 : v && String(v).trim() !== "";
        }),
      );
    } else if (step === 2) {
      setNextEnabled(
        REQUIRED_STEP2.every((f) => {
          const v = form[f];
          if (Array.isArray(v)) return v.length > 0;
          return typeof v === "number" ? v >= 0 : v && String(v).trim() !== "";
        }),
      );
    } else {
      setNextEnabled(false);
    }
  }, [form, step]);

  const handleLinkChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const validateLink = (field, value) =>
    setLinkErrors((p) => ({
      ...p,
      [field]: value && !VIDEO_LINK_FIELDS[field].test(value) ? VIDEO_LINK_ERRORS[field] : "",
    }));

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (Object.values(linkErrors).some(Boolean)) {
      setStep(3);
      alert("Please fix the video links before saving.");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      for (const field of Object.keys(VIDEO_LINK_FIELDS)) {
        const value = (form[field] || "").trim();
        if (value === loadedLinks.current[field]) delete payload[field];
        else payload[field] = value;
      }
      for (const field of Object.keys(EMPTY_IMAGES)) {
        if (imageFiles[field]?.length > 0) {
          const urls = [];
          for (const file of imageFiles[field]) {
            const url = await uploadToS3(file);
            if (url) urls.push(url);
          }
          payload[field] = urls;
        }
        // else keep existing URLs already in form
      }
      const res = await fetch(
        `${URI}/project-partner/properties/v2/edit/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (res.status === 409) {
        alert((await res.json()).message || "Property already exists!");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Status: ${res.status}`);
      }
      alert("Property updated successfully!");
      navigate("/app/properties");
    } catch (e) {
      console.error(e);
      alert(e.message?.startsWith("Status:") ? "Please check all fields and try again." : e.message);
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => setStep((s) => Math.min(s + 1, 3));
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  /* ── loading ── */
  if (fetchingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#5323DC] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Loading property...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 sm:pb-10">
      <AddPropertyHeader
        onSaveDraft={() => alert("Saved as draft!")}
        onCancel={() => navigate("/app/properties")}
        onPublish={handleSubmit}
        canPublish={step === 3}
        title="Update Property"
      />

      {/* ── Step indicator ── */}
      <div className="max-w-7xl mx-auto px-4 pt-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {STEPS.map((s, i) => {
              const idx = i + 1;
              const done = step > idx;
              const active = step === idx;
              return (
                <div
                  key={s.label}
                  className="flex items-center gap-2 flex-1 min-w-0"
                >
                  <button
                    type="button"
                    onClick={() => done && setStep(idx)}
                    className={`flex items-center gap-2 shrink-0 transition-all ${done ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold border-2 transition-all shrink-0 ${
                        active
                          ? "bg-[#5323DC] text-white border-[#5323DC]"
                          : done
                            ? "bg-violet-100 text-[#5323DC] border-violet-300"
                            : "bg-gray-100 text-gray-400 border-gray-200"
                      }`}
                    >
                      {done ? "✓" : idx}
                    </span>
                    <span
                      className={`hidden sm:block text-xs font-semibold whitespace-nowrap ${active ? "text-[#5323DC]" : done ? "text-violet-400" : "text-gray-400"}`}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 rounded-full bg-gray-100 overflow-hidden mx-2">
                      <div
                        className="h-full bg-violet-400 transition-all duration-500"
                        style={{ width: done ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2 pl-0.5">
            {STEPS[step - 1].desc}
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <form onSubmit={handleSubmit} id="update-property-form">
          <section className="space-y-5">
            {/* ── Step 1: Property Details ── */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 sm:px-8 py-6 sm:py-8">
                <StepOne
                  newProperty={form}
                  setPropertyData={setForm}
                  builderData={builderData}
                  authorities={authorities}
                  states={states}
                  cities={cities}
                />
              </div>
            )}

            {/* ── Step 2: Overview & Features ── */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 sm:px-8 py-6 sm:py-8">
                <StepTwo newProperty={form} setPropertyData={setForm} />
              </div>
            )}

            {/* ── Step 3: Media Gallery ── */}
            {step === 3 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 sm:px-8 py-6 sm:py-8">
                <StepThree
                  newProperty={form}
                  imageFiles={imageFiles}
                  setImageFiles={setImageFiles}
                />
                {form.frontView && (
                  <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
                    Existing images are preserved. Upload new ones above only to
                    replace them.
                  </div>
                )}
              </div>
            )}
            {step === 3 && (
              <VideoLinksForm form={form} errors={linkErrors} onChange={handleLinkChange} onValidate={validateLink} />
            )}

            {/* ── Desktop nav buttons ── */}
            <div className="hidden sm:flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/app/properties")}
                className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all"
                  >
                    ← Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextEnabled ? goNext : undefined}
                    disabled={!nextEnabled}
                    className={`h-10 px-8 rounded-xl text-sm font-semibold text-white transition-all shadow-md ${
                      nextEnabled
                        ? "bg-[#5323DC] hover:bg-violet-700 active:scale-95 shadow-violet-200"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    Continue →
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <Loader />
                    <button
                      type="submit"
                      className="h-10 px-8 rounded-xl text-sm font-semibold text-white bg-[#5323DC] hover:bg-violet-700 active:scale-95 shadow-md shadow-violet-200 transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </form>

        <ListingQualitySidebar form={form} imageFiles={imageFiles} />
      </main>

      {/* ── Mobile bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-gray-100 px-4 py-4 flex gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={goPrev}
            className="flex-1 h-11 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600"
          >
            ← Back
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/app/properties")}
            className="flex-1 h-11 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600"
          >
            Cancel
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={nextEnabled ? goNext : undefined}
            disabled={!nextEnabled}
            className={`flex-1 h-11 rounded-2xl text-sm font-semibold text-white transition-all ${
              nextEnabled
                ? "bg-[#5323DC] shadow-lg shadow-violet-200 active:scale-95"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Continue →
          </button>
        ) : (
          <button
            type="submit"
            form="update-property-form"
            className="flex-1 h-11 rounded-2xl text-sm font-semibold text-white bg-[#5323DC] shadow-lg shadow-violet-200 active:scale-95 transition-all"
          >
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
}
