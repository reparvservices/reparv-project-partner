import { useState, useEffect } from "react";
import { hasFeature, PARTNER_FEATURES } from "../../lib/subscriptionLock";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { uploadToS3 } from "../../utils/s3";
import Loader from "../../components/Loader";
import AddPropertyHeader from "../../components/properties/addProperty/AddPropertyHeader";
import PropertyClassification from "../../components/properties/addProperty/PropertyClassification";
import BasicInfoForm from "../../components/properties/addProperty/BasicInfoForm";
import LocationForm from "../../components/properties/addProperty/LocationForm";
import MediaGallery from "../../components/properties/addProperty/MediaGallery";
import VideoLinksForm, { youtubeRegex, instagramReelRegex } from "../../components/properties/addProperty/VideoLinksForm";
import ListingQualitySidebar from "../../components/properties/addProperty/ListingQualitySidebar";

const nameRegex  = /^[A-Za-z\s]+$/;
const phoneRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_FORM = {
  propertyCategory: "", propertyName: "", builtUpArea: "", carpetArea: "",
  totalSalesPrice: "", totalOfferPrice: "", address: "", state: "", city: "",
  pincode: "", latitude: "", longitude: "", locationLabel: "",
  projectBy: "", contact: "", email: "",
  videoLink: "", instagramReelLink: "",
};

const EMPTY_IMAGES = {
  frontView: [], sideView: [], kitchenView: [], hallView: [],
  bedroomView: [], bathroomView: [], balconyView: [],
  nearestLandmark: [], developedAmenities: [],
};

const REQUIRED = [
  "propertyCategory", "propertyName", "address", "state", "city",
  "carpetArea", "totalSalesPrice", "totalOfferPrice",
];

export default function AddProperty() {
  const navigate = useNavigate();
  const { URI, setLoading, refreshSubscription } = useAuth();

  const [propertyTab, setPropertyTab] = useState("new");
  const [form, setForm]               = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles]   = useState(EMPTY_IMAGES);
  const [states, setStates]           = useState([]);
  const [cities, setCities]           = useState([]);
  const [canPublish, setCanPublish]   = useState(false);
  const [errors, setErrors]           = useState({ propertyName: "", projectBy: "", contact: "", email: "", videoLink: "", instagramReelLink: "" });

  const handleChange = (field, value) => {
    if (field === "state") { setForm((p) => ({ ...p, state: value, city: "" })); setCities([]); }
    else setForm((p) => ({ ...p, [field]: value }));
  };

  const validateField = (name, value) => {
    let e = "";
    if (name === "propertyName" && value && !nameRegex.test(value))  e = "Only letters allowed";
    if (name === "projectBy"    && value && !nameRegex.test(value))  e = "Letters only";
    if (name === "contact"      && value && !phoneRegex.test(value)) e = "Enter valid 10-digit number";
    if (name === "email"        && value && !emailRegex.test(value)) e = "Enter valid email";
    if (name === "videoLink"    && value && !youtubeRegex.test(value)) e = "Enter a valid YouTube video link";
    if (name === "instagramReelLink" && value && !instagramReelRegex.test(value)) e = "Enter a valid Instagram reel link";
    setErrors((p) => ({ ...p, [name]: e }));
  };

  useEffect(() => {
    const ok = REQUIRED.every((f) => { const v = form[f]; return v && v.toString().trim() !== ""; })
      && !Object.values(errors).some(Boolean);
    setCanPublish(ok);
  }, [form, errors]);

  const handleAddImages = (category, files) => {
    setImageFiles((prev) => {
      const merged = [...(prev[category] || []), ...files];
      if (merged.length > 3) { alert("Max 3 images per category."); return { ...prev, [category]: merged.slice(0, 3) }; }
      return { ...prev, [category]: merged };
    });
  };

  const handleRemoveImage = (category, index) => {
    setImageFiles((prev) => { const updated = [...prev[category]]; updated.splice(index, 1); return { ...prev, [category]: updated }; });
  };

  useEffect(() => {
    (async () => {
      try { const res = await fetch(`${URI}/admin/states`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } }); if (res.ok) setStates(await res.json()); }
      catch (e) { console.error(e); }
    })();
  }, []);

  useEffect(() => {
    if (!form.state) return;
    (async () => {
      try { const res = await fetch(`${URI}/admin/cities/${form.state}`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } }); if (res.ok) setCities(await res.json()); }
      catch (e) { console.error(e); }
    })();
  }, [form.state]);

  // Publishing needs an active plan (server answers 402 SUBSCRIPTION_REQUIRED otherwise)
  const askToSubscribe = (message) => {
    const go = window.confirm(
      `${message || "An active subscription is required to publish properties."}\n\nOpen the Subscription page to start a plan or free trial?`,
    );
    if (go) navigate("/app/subscription");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!canPublish) return;
    setLoading(true);
    try {
      // Check the plan before uploading photos, so nothing is uploaded for nothing
      const sub = await refreshSubscription?.(undefined, { silent: true });
      if (sub && sub.active === false) {
        askToSubscribe("Your account doesn't have an active subscription, so the property can't be published yet.");
        return;
      }
      if (sub && !hasFeature(sub, PARTNER_FEATURES.PROPERTIES)) {
        askToSubscribe(`Your plan doesn't include "${PARTNER_FEATURES.PROPERTIES}". Upgrade your plan to publish properties.`);
        return;
      }

      const payload = { ...form, videoLink: form.videoLink.trim(), instagramReelLink: form.instagramReelLink.trim() };
      for (const field of Object.keys(EMPTY_IMAGES)) {
        if (imageFiles[field]?.length > 0) {
          const urls = [];
          for (const file of imageFiles[field]) { const url = await uploadToS3(file); if (url) urls.push(url); }
          payload[field] = urls;
        } else { payload[field] = []; }
      }
      const res = await fetch(`${URI}/project-partner/properties/v2/add`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 402 || data.code === "SUBSCRIPTION_REQUIRED" || data.code === "FEATURE_LOCKED") { askToSubscribe(data.message); return; }
      if (res.status === 409) { alert(data.message || "Property already exists!"); return; }
      if (!res.ok) throw new Error(data.message || `Could not publish (status ${res.status})`);
      alert("Property added successfully!");
      setForm(EMPTY_FORM); setImageFiles(EMPTY_IMAGES);
      navigate("/app/properties");
    } catch (e) { console.error(e); alert(e.message || "Please check all fields and try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 sm:pb-10">
      <AddPropertyHeader
        onSaveDraft={() => alert("Saved as draft!")}
        onCancel={() => navigate("/app/properties")}
        onPublish={handleSubmit}
        canPublish={canPublish}
        title="Add New Property"
      />

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <form onSubmit={handleSubmit} id="add-property-form">
          <section className="space-y-5">
            <PropertyClassification
              propertyTab={propertyTab}
              propertyCategory={form.propertyCategory}
              onTabChange={(tab) => { setPropertyTab(tab); handleChange("propertyCategory", ""); }}
              onCategoryChange={(val) => handleChange("propertyCategory", val)}
            />
            <BasicInfoForm form={form} errors={errors} propertyTab={propertyTab} onChange={handleChange} onValidate={validateField} />
            <LocationForm form={form} errors={errors} states={states} cities={cities} onChange={handleChange} onValidate={validateField} />
            <MediaGallery imageFiles={imageFiles} onAdd={handleAddImages} onRemove={handleRemoveImage} />
            <VideoLinksForm form={form} errors={errors} onChange={handleChange} onValidate={validateField} />

            <div className="hidden sm:flex items-center justify-between gap-3 pt-2">
              <button type="button" onClick={() => navigate("/app/properties")} className="h-10 px-5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <div className="flex items-center gap-3">
                <Loader />
                <button type="submit" disabled={!canPublish}
                  className={`h-10 px-8 rounded-xl text-sm font-semibold text-white transition-all shadow-md
                    ${canPublish ? "bg-[#5323DC] hover:bg-violet-700 active:scale-95 shadow-violet-200" : "bg-gray-300 cursor-not-allowed"}`}
                >
                  Publish Property
                </button>
              </div>
            </div>
          </section>
        </form>

        <ListingQualitySidebar form={form} imageFiles={imageFiles} />
      </main>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-gray-100 px-4 py-4 flex gap-3">
        <button type="button" onClick={() => navigate("/app/properties")} className="flex-1 h-11 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600">
          Cancel
        </button>
        <button type="submit" form="add-property-form" disabled={!canPublish}
          className={`flex-1 h-11 rounded-2xl text-sm font-semibold text-white transition-all
            ${canPublish ? "bg-[#5323DC] shadow-lg shadow-violet-200 active:scale-95" : "bg-gray-300 cursor-not-allowed"}`}
        >
          Publish Property
        </button>
      </div>
    </div>
  );
}