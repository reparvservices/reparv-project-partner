import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PiBuildingsFill } from "react-icons/pi";
import { hasFeature, PARTNER_FEATURES } from "../../lib/subscriptionLock";
import { useAuth } from "../../store/auth";
import { uploadToS3 } from "../../utils/s3";
import { getImageURI } from "../../utils/helper";
import Loader from "../../components/Loader";
import PropertyClassification from "../../components/properties/addProperty/PropertyClassification";
import BasicInfoForm from "../../components/properties/addProperty/BasicInfoForm";
import LocationForm from "../../components/properties/addProperty/LocationForm";
import MediaGallery from "../../components/properties/addProperty/MediaGallery";
import ListingExtras, { EXTRA_DEFAULTS, EXTRA_LIST_KEYS, parseListValue } from "../../components/properties/addProperty/ListingExtras";
import VideoLinksForm, {
  youtubeRegex,
  instagramReelRegex,
} from "../../components/properties/addProperty/VideoLinksForm";
import ListingQualitySidebar from "../../components/properties/addProperty/ListingQualitySidebar";
import PropertyEditView from "../../components/properties/addProperty/PropertyEditView";
import VenueFormShell from "../../components/properties/addProperty/VenueFormShell";
import { venueApi } from "../../lib/venueApi";
import {
  propertyTabFor,
  areaModeFor,
  areaColumnsFor,
  parseLandArea,
  classificationFromProperty,
  basicDetailFieldsFor,
  VENUE_KIND,
  BASIC_DETAIL_KEYS,
  showBhkFor,
  imageSectionsFor,
  maxPhotosFor,
  ALL_IMAGE_SECTIONS,
} from "../../utils/propertyListing";
import { confirmDialog } from "../../components/ui/Dialogs.jsx";

const nameRegex = /^[A-Za-z0-9\s.,'&()-]+$/;
const lettersRegex = /^[A-Za-z\s]+$/;
const pincodeRegex = /^\d{6}$/;
const phoneRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SHOWABLE_IMAGE = /^image\/(jpeg|png|webp|gif)$/;

const EMPTY_FORM = {
  listingType: "Sell",
  propertyKind: "Residential",
  propertyCategory: "",
  propertyType: "",
  propertyName: "",
  builtUpArea: "",
  carpetArea: "",
  plotArea: "",
  landArea: "",
  landUnit: "Acre",
  furnishing: "",
  floorNo: "",
  totalFloors: "",
  propertyFacing: "",
  parkingAvailability: "",
  powerBackup: "",
  waterSupply: "",
  ownershipType: "",
  totalSalesPrice: "",
  totalOfferPrice: "",
  address: "",
  state: "",
  city: "",
  pincode: "",
  latitude: "",
  longitude: "",
  locationLabel: "",
  location: "",
  ...EXTRA_DEFAULTS,
  projectBy: "",
  contact: "",
  email: "",
  videoLink: "",
  instagramReelLink: "",
};

const EMPTY_IMAGES = Object.fromEntries(ALL_IMAGE_SECTIONS.map((s) => [s.key, []]));

const STEPS = [
  { label: "Property Details", desc: "Category, basic info & pricing" },
  { label: "Location & Contact", desc: "Address, map location & contact" },
  { label: "Media Gallery", desc: "Upload photos and video links" },
];

const REQUIRED_STEP1 = ["propertyCategory", "propertyName", "totalSalesPrice", "totalOfferPrice"];
const REQUIRED_STEP2 = ["address", "state", "city", "pincode", "latitude", "longitude", "contact"];
// Required area field for each area mode (built / plot / land)
const AREA_REQUIRED = { built: "carpetArea", plot: "plotArea", land: "landArea" };

const filled = (v) => v !== undefined && v !== null && String(v).trim() !== "";

/** A stored property → the values this form edits (edit mode) */
function formFromProperty(data) {
  const cls = classificationFromProperty(data);
  const next = { ...EMPTY_FORM };
  for (const key of Object.keys(EMPTY_FORM)) {
    if (data[key] !== undefined && data[key] !== null) next[key] = data[key];
  }
  next.listingType = cls.listingType;
  next.propertyKind = cls.propertyKind;
  // Stored lists (features, benefits) arrive as JSON text
  EXTRA_LIST_KEYS.forEach((k) => {
    next[k] = parseListValue(data[k]);
  });
  if (data.possessionDate) next.possessionDate = String(data.possessionDate).slice(0, 10);

  // The property's own contact / email: the joined partner columns overwrite `contact` / `email`
  if (data.propertyContact !== undefined) next.contact = data.propertyContact ?? "";
  if (data.propertyEmail !== undefined) next.email = data.propertyEmail ?? "";

  // propertyType is stored as a JSON list; this form edits a single value
  try {
    const parsed = Array.isArray(data.propertyType) ? data.propertyType : JSON.parse(data.propertyType);
    next.propertyType = Array.isArray(parsed) ? parsed[0] || "" : String(parsed || "");
  } catch {
    next.propertyType = data.propertyType ? String(data.propertyType) : "";
  }

  // Area columns → the area field for this property's mode
  const mode = areaModeFor({ propertyKind: next.propertyKind, propertyCategory: next.propertyCategory });
  if (mode === "land") {
    const { value, unit } = parseLandArea(data.builtUpArea);
    next.landArea = value;
    next.landUnit = unit;
  } else if (mode === "plot") {
    next.plotArea = data.carpetArea || data.builtUpArea || "";
  }
  return { form: next, condition: cls.condition };
}

/** The photos stored for one section, exactly as stored (so a save sends back the same values) */
function storedPhotoList(value) {
  let v = value;
  for (let i = 0; i < 3 && typeof v === "string"; i++) {
    try {
      v = JSON.parse(v || "[]");
    } catch {
      return [];
    }
  }
  return Array.isArray(v) ? v.filter(Boolean) : [];
}

/** Photos already saved for a property, per photo section, as full URLs (edit mode) */
function savedPhotosBySection(data) {
  if (!data) return {};
  const parse = (value) => {
    let v = value;
    for (let i = 0; i < 3 && typeof v === "string"; i++) {
      try {
        v = JSON.parse(v || "[]");
      } catch {
        return [];
      }
    }
    return Array.isArray(v) ? v.filter(Boolean) : [];
  };
  return Object.fromEntries(
    ALL_IMAGE_SECTIONS.map((s) => [s.key, parse(data[s.key]).map((src) => getImageURI(src)).filter(Boolean)]),
  );
}

export default function PropertyFormPage() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const isEdit = Boolean(editId);
  const { URI, setLoading, refreshSubscription } = useAuth();

  // "Update Photos" on the property page opens the editor straight on the media step
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(() => (isEdit && searchParams.get("step") === "3" ? 3 : 1));
  const [condition, setCondition] = useState("new");
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState(EMPTY_IMAGES);
  const [storedPhotos, setStoredPhotos] = useState({}); // { sectionKey: [photo as stored] } (edit mode)
  const [removedSaved, setRemovedSaved] = useState({}); // { sectionKey: [saved photo index] } marked for removal
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [fetching, setFetching] = useState(isEdit);
  const [errors, setErrors] = useState({
    propertyName: "",
    projectBy: "",
    contact: "",
    email: "",
    videoLink: "",
    instagramReelLink: "",
  });

  // Edit mode: the record as loaded. It is sent back with the changes merged on top,
  // because the update endpoint rewrites every column from the request body.
  const loaded = useRef(null);
  const loadedLinks = useRef({ videoLink: "", instagramReelLink: "" });

  const propertyTab = propertyTabFor({ listingType: form.listingType, condition });

  const handleChange = (field, value) => {
    if (field === "state") {
      setForm((p) => ({ ...p, state: value, city: "" }));
      setCities([]);
    } else {
      setForm((p) => ({ ...p, [field]: value }));
    }
  };

  const validateField = (name, value) => {
    let e = "";
    if (name === "propertyName" && value && !nameRegex.test(value)) e = "Letters, numbers and . , ' & ( ) - only";
    if (name === "projectBy" && value && !lettersRegex.test(value)) e = "Letters only";
    if (name === "contact" && value && !phoneRegex.test(value)) e = "Enter valid 10-digit number";
    if (name === "email" && value && !emailRegex.test(value)) e = "Enter valid email";
    if (name === "videoLink" && value && !youtubeRegex.test(value)) e = "Enter a valid YouTube video link";
    if (name === "instagramReelLink" && value && !instagramReelRegex.test(value)) e = "Enter a valid Instagram reel link";
    setErrors((p) => ({ ...p, [name]: e }));
  };

  /* ── Reference data ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${URI}/admin/states`, { credentials: "include", headers: { "Content-Type": "application/json" } });
        if (res.ok) setStates(await res.json());
      } catch (e) {
        console.error(e);
      }
    })();
  }, [URI]);

  useEffect(() => {
    if (!form.state) return;
    (async () => {
      try {
        const res = await fetch(`${URI}/admin/cities/${form.state}`, { credentials: "include", headers: { "Content-Type": "application/json" } });
        if (res.ok) setCities(await res.json());
      } catch (e) {
        console.error(e);
      }
    })();
  }, [form.state, URI]);

  /* ── Edit mode: load the property ── */
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await fetch(`${URI}/project-partner/properties/${editId}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        loaded.current = data;
        setStoredPhotos(Object.fromEntries(ALL_IMAGE_SECTIONS.map((sec) => [sec.key, storedPhotoList(data[sec.key])])));
        loadedLinks.current = {
          videoLink: data.videoLink || "",
          instagramReelLink: data.instagramReelLink || "",
        };
        const mapped = formFromProperty(data);
        setCondition(mapped.condition);
        setForm({ ...mapped.form, ...loadedLinks.current });
      } catch (e) {
        console.error(e);
        alert("Failed to load property.");
        navigate("/app/properties");
      } finally {
        setFetching(false);
      }
    })();
  }, [editId, URI]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Saved photos: which ones stay ── */
  const storedOf = (key) => (isEdit ? storedPhotos[key] || [] : []);
  const keptCount = (key) => storedOf(key).length - (removedSaved[key] || []).length;
  // Removing the last front view photo without adding a new one would leave the listing without a cover
  const frontWouldBeEmpty = isEdit && storedOf("frontView").length > 0 && keptCount("frontView") + (imageFiles.frontView?.length || 0) === 0;

  /* ── Step validation ── */
  const hasFrontPhoto = imageFiles.frontView.length > 0 || (isEdit && !!loaded.current && hasStoredFront(loaded.current));

  // Adding is strict. Editing only needs what the update endpoint requires, so an older
  // listing (no contact, no BHK) can still be edited; formats are checked when filled.
  const areaMode = areaModeFor(form);
  const required1 = isEdit ? ["propertyCategory", "propertyName"] : [...REQUIRED_STEP1, AREA_REQUIRED[areaMode]];
  const required2 = isEdit ? ["address", "state", "city"] : REQUIRED_STEP2;
  const step1Ok =
    required1.every((f) => filled(form[f])) &&
    (isEdit || !showBhkFor(form.propertyCategory) || filled(form.propertyType)) &&
    !errors.propertyName &&
    !errors.projectBy;
  const step2Ok =
    required2.every((f) => filled(form[f])) &&
    (isEdit ? !filled(form.pincode) || pincodeRegex.test(String(form.pincode)) : pincodeRegex.test(String(form.pincode))) &&
    (isEdit ? !filled(form.contact) || phoneRegex.test(String(form.contact)) : phoneRegex.test(String(form.contact))) &&
    !errors.contact &&
    !errors.email;
  const step3Ok = (isEdit || hasFrontPhoto) && !frontWouldBeEmpty && !errors.videoLink && !errors.instagramReelLink;
  const nextEnabled = step === 1 ? step1Ok : step === 2 ? step2Ok : false;
  const canSave = step1Ok && step2Ok && step3Ok;

  /* ── Photos ── */
  const handleAddImages = (category, files) => {
    const unsupported = files.filter((f) => !SHOWABLE_IMAGE.test(f.type));
    if (unsupported.length) {
      alert(`Please use JPG, PNG or WEBP photos. Skipped: ${unsupported.map((f) => f.name).join(", ")}`);
      files = files.filter((f) => SHOWABLE_IMAGE.test(f.type));
    }
    setImageFiles((prev) => {
      const merged = [...(prev[category] || []), ...files];
      const max = maxPhotosFor(category);
      const room = Math.max(0, max - Math.max(0, keptCount(category))); // saved photos that stay use up room
      if (merged.length > room) {
        alert(`Max ${max} images in this section.`);
        return { ...prev, [category]: merged.slice(0, room) };
      }
      return { ...prev, [category]: merged };
    });
  };

  // Mark a saved photo for removal (or take the mark off again); applied when the form is saved
  const handleToggleSavedImage = (category, index) => {
    const marked = (removedSaved[category] || []).includes(index);
    if (!marked && category === "frontView" && keptCount("frontView") - 1 + (imageFiles.frontView?.length || 0) < 1) {
      alert("A listing needs at least one front view photo. Add a new front view photo first, then remove this one.");
      return;
    }
    setRemovedSaved((prev) => {
      const list = prev[category] || [];
      return { ...prev, [category]: list.includes(index) ? list.filter((i) => i !== index) : [...list, index] };
    });
  };

  const handleRemoveImage = (category, index) => {
    setImageFiles((prev) => {
      const updated = [...prev[category]];
      updated.splice(index, 1);
      return { ...prev, [category]: updated };
    });
  };

  // Publishing needs an active plan (the server answers 402 SUBSCRIPTION_REQUIRED otherwise)
  const askToSubscribe = async (message) => {
    const go = (await confirmDialog(
      `${message || "An active subscription is required to publish properties."}\n\nOpen the Subscription page to start a plan or free trial?`,
    ));
    if (go) navigate("/app/subscription");
  };

  /* ── Save ── */
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!canSave) return;
    setLoading(true);
    try {
      if (!isEdit) {
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
      }

      const payload = {
        ...(isEdit ? loaded.current : {}),
        ...form,
        ...areaColumnsFor(areaModeFor(form), form),
      };

      if (isEdit) {
        // Only send a video link back if the partner changed it
        for (const key of ["videoLink", "instagramReelLink"]) {
          const value = (form[key] || "").trim();
          if (value === loadedLinks.current[key]) delete payload[key];
          else payload[key] = value;
        }
      } else {
        payload.videoLink = form.videoLink.trim();
        payload.instagramReelLink = form.instagramReelLink.trim();
        // Only send the basic-info fields shown for this property type
        const shown = new Set(basicDetailFieldsFor(form).map((f) => f.key));
        BASIC_DETAIL_KEYS.forEach((k) => {
          if (!shown.has(k)) delete payload[k];
        });
      }
      delete payload.plotArea;
      delete payload.landArea;
      delete payload.landUnit;
      payload.propertyType = showBhkFor(form.propertyCategory) ? [form.propertyType] : [];

      const shownSections = new Set(imageSectionsFor(form.propertyCategory).map((s) => s.key));
      const replacePhotos = []; // edit: sections whose full list is sent (new photos added, saved ones removed)
      for (const field of Object.keys(EMPTY_IMAGES)) {
        const newFiles = imageFiles[field] || [];
        const gone = removedSaved[field] || [];
        if (shownSections.has(field) && (newFiles.length > 0 || (isEdit && gone.length > 0))) {
          const urls = [];
          for (const file of newFiles) {
            const url = await uploadToS3(file);
                        if (!url) throw new Error(`Could not upload "${file.name}". Please try again.`);
                        urls.push(url);
          }
          if (isEdit) {
            // the saved photos that stay, then the new ones
            payload[field] = [...storedOf(field).filter((_, i) => !gone.includes(i)), ...urls];
            replacePhotos.push(field);
          } else {
            payload[field] = urls;
          }
        } else if (!isEdit) {
          payload[field] = [];
        }
        // edit: a section nothing was done to keeps the photos already stored
      }
      if (replacePhotos.length) payload.replacePhotos = replacePhotos;

      const res = await fetch(
        isEdit ? `${URI}/project-partner/properties/v2/edit/${editId}` : `${URI}/project-partner/properties/v2/add`,
        {
          method: isEdit ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (res.status === 402 || data.code === "SUBSCRIPTION_REQUIRED" || data.code === "FEATURE_LOCKED") {
        askToSubscribe(data.message);
        return;
      }
      if (res.status === 409) {
        alert(data.message || "Property already exists!");
        return;
      }
      if (!res.ok) throw new Error(data.message || `Could not save (status ${res.status})`);
      alert(isEdit ? "Property updated successfully!" : "Property added successfully!");
      navigate(isEdit ? `/app/properties/${editId}` : "/app/properties");
    } catch (err) {
      console.error(err);
      alert(err.message || "Please check all fields and try again.");
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => setStep((s) => Math.min(s + 1, 3));
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));
  const cancel = () => navigate(isEdit ? `/app/properties/${editId}` : "/app/properties");

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-4 border-[#5323DC] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading property…</p>
        </div>
      </div>
    );
  }

  // Venue Booking: the venue form (saved through the venue API) replaces the property steps
  const saveVenue = async (body, submit) => {
    const listing = await venueApi(URI).save(null, body, submit);
    alert(submit ? "Venue submitted for approval!" : "Venue saved as a draft.");
    navigate(`/app/properties/venue/${listing.id}`);
  };

  if (!isEdit && form.propertyKind === VENUE_KIND) {
    return (
      <VenueFormShell
        classification={{
          listingType: form.listingType,
          condition,
          propertyKind: form.propertyKind,
          propertyCategory: form.propertyCategory,
        }}
        onClassificationChange={({ listingType, condition: nextCondition, propertyKind, propertyCategory }) => {
          setCondition(nextCondition);
          setForm((p) => ({ ...p, listingType, propertyKind, propertyCategory }));
        }}
        onSave={saveVenue}
        onCancel={cancel}
        setBusy={setLoading}
      />
    );
  }

  // Editing: one scrollable page with a section nav and a sticky save bar
  if (isEdit) {
    const REQUIRED_LABELS = {
      propertyCategory: "Property type",
      propertyName: "Property name",
      address: "Address",
      state: "State",
      city: "City",
    };
    const missing = Object.keys(REQUIRED_LABELS).filter((f) => !filled(form[f])).map((f) => REQUIRED_LABELS[f]);
    if (filled(form.pincode) && !pincodeRegex.test(String(form.pincode))) missing.push("6-digit pin code");
    if (filled(form.contact) && !phoneRegex.test(String(form.contact))) missing.push("valid phone number");
    if (errors.propertyName) missing.push("valid property name");
    if (errors.videoLink || errors.instagramReelLink) missing.push("valid video link");

    return (
      <PropertyEditView
        form={form}
        setForm={setForm}
        condition={condition}
        setCondition={setCondition}
        errors={errors}
        states={states}
        cities={cities}
        imageFiles={imageFiles}
        onAddImages={handleAddImages}
        onRemoveImage={handleRemoveImage}
        removedImages={removedSaved}
        onToggleSavedImage={handleToggleSavedImage}
        onChange={handleChange}
        onValidate={validateField}
        propertyTab={propertyTab}
        missing={missing}
        canSave={canSave}
        onSave={handleSubmit}
        onCancel={cancel}
        approve={loaded.current?.approve}
        existingImages={savedPhotosBySection(loaded.current)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* ═══ Page hero strip ═══ */}
      <div className="bg-gradient-to-br from-[#5E23DC] via-[#6C35DE] to-[#3f16a8] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="hidden sm:flex h-11 w-11 rounded-xl bg-white/15 items-center justify-center border border-white/20 shrink-0 mt-0.5">
              <PiBuildingsFill size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                {isEdit ? "Update property" : "Add new property"}
              </p>
              <h2 className="text-xl sm:text-2xl font-bold">{STEPS[step - 1].label}</h2>
              <p className="text-white/70 text-sm mt-0.5">{STEPS[step - 1].desc}</p>
            </div>
          </div>

          {/* Step pills */}
          <div className="mt-5 flex items-center gap-2 sm:gap-3">
            {STEPS.map((s, i) => {
              const idx = i + 1;
              const done = step > idx;
              const active = step === idx;
              return (
                <React.Fragment key={s.label}>
                  <button
                    type="button"
                    onClick={() => (done || (isEdit && idx !== step)) && setStep(idx)}
                    className={`flex items-center gap-1.5 shrink-0 transition-all ${done || isEdit ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <span
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold border-2 transition-all ${
                        active
                          ? "bg-white text-[#5323DC] border-white"
                          : done
                            ? "bg-white/20 text-white border-white/40"
                            : "bg-white/10 text-white/40 border-white/20"
                      }`}
                    >
                      {done ? "✓" : idx}
                    </span>
                    <span
                      className={`hidden sm:block text-xs font-semibold transition-opacity ${
                        active ? "text-white" : done ? "text-white/60" : "text-white/35"
                      }`}
                    >
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 rounded-full bg-white/20 overflow-hidden">
                      <div className="h-full bg-white/60 transition-all duration-500" style={{ width: done ? "100%" : "0%" }} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ Form body ═══ */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mb-20">
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-5 sm:px-8 py-6 sm:py-8 space-y-6">
              {step === 1 && (
                <>
                  <PropertyClassification
                    listingType={form.listingType}
                    condition={condition}
                    propertyKind={form.propertyKind}
                    propertyCategory={form.propertyCategory}
                    onChange={({ listingType, condition: nextCondition, propertyKind, propertyCategory }) => {
                      setCondition(nextCondition);
                      setForm((p) => ({ ...p, listingType, propertyKind, propertyCategory }));
                    }}
                  />
                  <BasicInfoForm
                    form={form}
                    errors={errors}
                    propertyTab={propertyTab}
                    listingType={form.listingType}
                    onChange={handleChange}
                    onValidate={validateField}
                  />
                </>
              )}

              {step === 2 && (
                <>
                  <LocationForm
                    form={form}
                    errors={errors}
                    states={states}
                    cities={cities}
                    onChange={handleChange}
                    onValidate={validateField}
                  />
                  <div className="border-t border-gray-100 pt-6">
                    <ListingExtras form={form} onChange={handleChange} builtUp={areaModeFor(form) === "built"} />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <MediaGallery
                    category={form.propertyCategory}
                    imageFiles={imageFiles}
                    onAdd={handleAddImages}
                    onRemove={handleRemoveImage}
                  />
                  {isEdit && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
                      Saved photos are kept. New photos are added to them, and the × on a saved photo removes it when you save.
                    </div>
                  )}
                  <VideoLinksForm form={form} errors={errors} onChange={handleChange} onValidate={validateField} />
                  <ListingQualitySidebar form={form} imageFiles={imageFiles} />
                </>
              )}
            </div>
          </div>

          {/* ═══ Sticky bottom nav ═══ */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_16px_rgba(0,0,0,0.07)]">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={cancel}
                className="px-4 sm:px-5 py-2.5 text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2 sm:gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="px-4 sm:px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    ← Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextEnabled ? goNext : undefined}
                    disabled={!nextEnabled}
                    className={`px-6 sm:px-10 py-2.5 text-sm font-bold rounded-xl transition-all ${
                      nextEnabled
                        ? "bg-[#5323DC] text-white hover:bg-violet-700 active:scale-[0.98] shadow-sm shadow-violet-200 cursor-pointer"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Continue →
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={!canSave}
                      className={`px-6 sm:px-10 py-2.5 text-sm font-bold rounded-xl transition-all ${
                        canSave
                          ? "text-white bg-[#5323DC] hover:bg-violet-700 active:scale-[0.98] shadow-sm shadow-violet-200 cursor-pointer"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {isEdit ? "Save Changes" : "Publish Property"}
                    </button>
                    <Loader />
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/** A stored property already has a front photo */
function hasStoredFront(data) {
  try {
    const list = Array.isArray(data.frontView) ? data.frontView : JSON.parse(data.frontView);
    return Array.isArray(list) && list.length > 0;
  } catch {
    return Boolean(data.frontView);
  }
}
