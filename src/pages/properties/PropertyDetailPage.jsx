import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaEdit,
  FaExternalLinkAlt,
  FaEye,
  FaFire,
  FaHeart,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRegClock,
  FaShareAlt,
  FaTimesCircle,
  FaUpload,
  FaUserTie,
  FaWhatsapp,
} from "react-icons/fa";
import { BiMessageRoundedDots } from "react-icons/bi";
import { PiBuildingsFill } from "react-icons/pi";
import { useAuth } from "../../store/auth";
import { getImageURI } from "../../utils/helper";
import { ALL_IMAGE_SECTIONS } from "../../utils/propertyListing";
import PropertyLocationMap from "../../components/map/PropertyLocationMap";

/* Same layout as the admin property page. Commission, Promotion and Assignment
 * are admin-only and are not shown here. */

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "media", label: "Photos & Media" },
  { key: "location", label: "Location" },
  { key: "additional", label: "Additional Info" },
  { key: "enquiries", label: "Enquiries" },
];

const ENQUIRY_SOURCES = ["Onsite", "Direct", "CSV File", "Ads"];
const FALLBACK_IMG = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200";
const PRIMARY = "#5323DC";

const parseImages = (value) => {
  let parsed = value;
  for (let i = 0; i < 3 && typeof parsed === "string"; i++) {
    try {
      parsed = JSON.parse(parsed || "[]");
    } catch {
      return [];
    }
  }
  return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
};

const isNumeric = (v) => /^\d+(\.\d+)?$/.test(String(v ?? ""));
const rupees = (v) => (isNumeric(v) ? `₹${Number(v).toLocaleString("en-IN")}` : v);
const formatNumber = (n) => Number(n || 0).toLocaleString("en-IN");

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ───────────────────────── small UI pieces ───────────────────────── */

function Badge({ tone = "gray", icon, children }) {
  const tones = {
    green: "bg-[#EAFBF1] text-[#0B8A01] border-[#BFEFD0]",
    red: "bg-[#FDECEC] text-[#D11A1A] border-[#F6C9C9]",
    blue: "bg-[#E9F2FF] text-[#0057D9] border-[#C8DCFB]",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    gray: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {icon}
      {children}
    </span>
  );
}

function Card({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

function Btn({ variant = "primary", className = "", children, ...props }) {
  const variants = {
    primary: "bg-[#5323DC] text-white hover:bg-[#4519b8] border-[#5323DC]",
    secondary: "bg-white text-gray-800 hover:bg-gray-50 border-gray-300",
  };
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function Detail({ label, value }) {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && !value.length)) return null;
  return (
    <div className="min-w-0">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-gray-900">
        {Array.isArray(value) ? value.join(", ") : value}
      </dd>
    </div>
  );
}

const withUnit = (v, unit) => (v ? `${v}${isNumeric(v) ? ` ${unit}` : ""}` : "");

/* ───────────────────────── tabs ───────────────────────── */

function OverviewTab({ p }) {
  const priceRows = [
    ["Total Price", p.totalSalesPrice],
    ["Offer Price", p.totalOfferPrice],
    ["Stamp Duty", p.stampDuty],
    ["Registration Fee", p.registrationFee],
    ["GST", p.gst],
    ["Advocate Fee", p.advocateFee],
    ["MSEB / Water", p.msebWater],
    ["Maintenance", p.maintenance],
    ["Other", p.other],
  ].filter(([, v]) => v !== null && v !== undefined && v !== "" && v !== "0");

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card title="Property Details" className="lg:col-span-2">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
          <Detail label="Category" value={p.propertyCategory} />
          <Detail label="Listing Type" value={p.listingType} />
          <Detail label="Property Kind" value={p.propertyKind} />
          <Detail label="Configuration" value={p.propertyType} />
          <Detail label="Builder" value={p.company_name} />
          <Detail label="Project By" value={p.projectBy} />
          <Detail label="Carpet Area" value={withUnit(p.carpetArea, "sq.ft")} />
          <Detail label="Built-up Area" value={withUnit(p.builtUpArea, "sq.ft")} />
          <Detail label="Floor" value={p.floorNo && p.totalFloors ? `${p.floorNo} of ${p.totalFloors}` : p.floorNo || p.totalFloors} />
          <Detail label="Furnishing" value={p.furnishing} />
          <Detail label="Facing" value={p.propertyFacing} />
          <Detail label="Ownership" value={p.ownershipType} />
          <Detail label="Parking" value={p.parkingAvailability} />
          <Detail label="Water Supply" value={p.waterSupply} />
          <Detail label="Power Backup" value={p.powerBackup} />
          <Detail label="Built Year" value={p.builtYear} />
          <Detail label="Possession" value={p.possessionDate ? String(p.possessionDate).slice(0, 10) : ""} />
          <Detail label="Approved By" value={p.propertyApprovedBy} />
          <Detail label="RERA" value={p.reraRegistered} />
          <Detail label="Loan Available" value={p.loanAvailability} />
          <Detail label="Distance from City Centre" value={p.distanceFromCityCenter ? `${p.distanceFromCityCenter} km` : ""} />
          <Detail label="Pincode" value={p.pincode} />
        </dl>
        {p.propertyDescription && (
          <div className="mt-6 border-t border-gray-100 pt-5">
            <p className="mb-1 text-xs text-gray-500">Description</p>
            <p className="whitespace-pre-line text-sm text-gray-800">{p.propertyDescription}</p>
          </div>
        )}
      </Card>

      <div className="space-y-5">
        <Card title="Owner Contact">
          <dl className="space-y-3">
            <Detail label="Name" value={p.projectBy} />
            <Detail label="Phone" value={p.propertyContact ?? p.contact} />
            <Detail label="Email" value={p.propertyEmail ?? p.email} />
          </dl>
          {!p.projectBy && !(p.propertyContact ?? p.contact) && !(p.propertyEmail ?? p.email) && (
            <p className="text-sm text-gray-500">No owner contact saved.</p>
          )}
        </Card>
        <Card title="Pricing">
          {priceRows.length ? (
            <dl className="space-y-2">
              {priceRows.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 text-sm">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-semibold text-gray-900">{rupees(value)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-gray-500">No pricing saved.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function MediaTab({ p, onUpdatePhotos }) {
  const groups = ALL_IMAGE_SECTIONS.map((section) => ({
    ...section,
    items: parseImages(p[section.key]).map((src) => getImageURI(src)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-5">
      <Card
        title="Photos"
        subtitle="Photos shown on the property page"
        action={
          <Btn variant="secondary" onClick={onUpdatePhotos}>
            <FaUpload /> Update Photos
          </Btn>
        }
      >
        {groups.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">No photos uploaded yet.</p>
        ) : (
          <div className="space-y-6">
            {groups.map((g) => (
              <div key={g.key}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {g.label} · {g.items.length}
                </p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {g.items.map((src, i) => (
                    <img
                      key={`${src}-${i}`}
                      src={src}
                      alt={`${g.label} ${i + 1}`}
                      loading="lazy"
                      className="aspect-[4/3] w-full rounded-xl bg-gray-100 object-cover"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Videos" subtitle="YouTube video and Instagram reel links">
        {p.videoLink || p.instagramReelLink ? (
          <dl className="space-y-3 text-sm">
            {p.videoLink && (
              <div>
                <dt className="text-xs text-gray-500">YouTube</dt>
                <dd><a href={p.videoLink} target="_blank" rel="noreferrer" className="break-all font-medium text-[#5323DC] hover:underline">{p.videoLink}</a></dd>
              </div>
            )}
            {p.instagramReelLink && (
              <div>
                <dt className="text-xs text-gray-500">Instagram reel</dt>
                <dd><a href={p.instagramReelLink} target="_blank" rel="noreferrer" className="break-all font-medium text-[#5323DC] hover:underline">{p.instagramReelLink}</a></dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-sm text-gray-500">No video links added.</p>
        )}
      </Card>
    </div>
  );
}

function LocationTab({ p }) {
  const lat = Number(p.latitude);
  const lng = Number(p.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);
  const address = [p.address, p.location, p.city, p.state].filter(Boolean).join(", ");
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card title="Address" className="lg:col-span-1">
        <dl className="space-y-3">
          <Detail label="Address" value={p.address} />
          <Detail label="Area / locality" value={p.location} />
          <Detail label="City" value={p.city} />
          <Detail label="State" value={p.state} />
          <Detail label="Pincode" value={p.pincode} />
          <Detail label="Latitude" value={p.latitude} />
          <Detail label="Longitude" value={p.longitude} />
        </dl>
        {address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hasCoords ? `${lat},${lng}` : address)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#5323DC] hover:underline"
          >
            <FaExternalLinkAlt size={12} /> Open in Google Maps
          </a>
        )}
      </Card>
      <Card title="Map" className="lg:col-span-2">
        {hasCoords ? (
          <PropertyLocationMap lat={lat} lng={lng} height={320} />
        ) : (
          <p className="py-16 text-center text-sm text-gray-500">No map location saved for this property.</p>
        )}
      </Card>
    </div>
  );
}

function AdditionalTab({ id, navigate }) {
  return (
    <Card title="Additional Info" subtitle="Flat and plot details, CSV uploads and brochure">
      <Btn onClick={() => navigate(`/app/property/additional-info/${id}`)}>Open additional info</Btn>
    </Card>
  );
}

function EnquiriesTab({ rows, loading }) {
  return (
    <Card title="Enquiries" subtitle="People who enquired about this property">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100 text-sm">
          <thead className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="py-3 pr-5">Name</th>
              <th className="py-3 pr-5">Contact</th>
              <th className="py-3 pr-5">Source</th>
              <th className="py-3 pr-5">Status</th>
              <th className="py-3 pr-5">Received</th>
              <th className="py-3 text-right">Reach out</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">Loading enquiries…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No enquiries for this property yet.</td></tr>
            )}
            {!loading &&
              rows.map((row, i) => (
                <tr key={row.enquirersid ?? row.enquiryid ?? row.id ?? i} className="hover:bg-[#F6F3FF]">
                  <td className="py-3 pr-5 font-semibold text-gray-900">{row.customer || row.fullname || row.name || "—"}</td>
                  <td className="py-3 pr-5 text-gray-700">{row.contact || "—"}</td>
                  <td className="py-3 pr-5 text-gray-700">{row._source}</td>
                  <td className="py-3 pr-5 text-gray-700">{row.status || "—"}</td>
                  <td className="py-3 pr-5 text-gray-600">{formatDate(row.created_at) || "—"}</td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      {row.contact && (
                        <a href={`tel:${row.contact}`} className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50" aria-label="Call">
                          <FaPhoneAlt size={12} />
                        </a>
                      )}
                      {row.contact && (
                        <a
                          href={`https://wa.me/91${String(row.contact).replace(/\D/g, "").slice(-10)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                          aria-label="WhatsApp"
                        >
                          <FaWhatsapp size={12} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ───────────────────────── page ───────────────────────── */

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { URI } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const tab = TABS.some((t) => t.key === searchParams.get("tab")) ? searchParams.get("tab") : "overview";
  const setTab = (key) => setSearchParams({ tab: key }, { replace: true });

  const [property, setProperty] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  const [enquiries, setEnquiries] = useState([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch(`${URI}/project-partner/properties/${id}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 404) throw new Error("This property doesn't exist or was deleted.");
      if (!res.ok) throw new Error("Could not load this property.");
      setProperty(await res.json());
      setLoadError("");
    } catch (err) {
      setLoadError(err.message || "Could not load this property.");
    }
  };

  useEffect(() => {
    setProperty(null);
    setActiveImage(0);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [URI, id]);

  // Enquiries are stored per source: collect every source and keep this property's.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setEnquiriesLoading(true);
      try {
        const results = await Promise.all(
          ENQUIRY_SOURCES.map((source) =>
            fetch(`${URI}/project-partner/enquirers/get/${encodeURIComponent(source)}`, {
              credentials: "include",
              headers: { "Content-Type": "application/json" },
            })
              .then((r) => (r.ok ? r.json() : []))
              .then((rows) => (Array.isArray(rows) ? rows.map((row) => ({ ...row, _source: source })) : []))
              .catch(() => []),
          ),
        );
        if (!cancelled) setEnquiries(results.flat().filter((row) => String(row.propertyid) === String(id)));
      } finally {
        if (!cancelled) setEnquiriesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [URI, id]);

  const images = useMemo(() => {
    if (!property) return [];
    return ALL_IMAGE_SECTIONS.flatMap((section) =>
      parseImages(property[section.key]).map((src) => ({ src: getImageURI(src), label: section.label })),
    );
  }, [property]);

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F4F6F8] p-6">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <PiBuildingsFill className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-semibold text-gray-900">{loadError}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Btn variant="secondary" onClick={() => navigate("/app/properties")}>Back to Properties</Btn>
            <Btn onClick={load}>Try again</Btn>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="h-full overflow-y-auto bg-[#F4F6F8] p-4 md:p-6">
        <div className="mx-auto max-w-[1400px] space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-72 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </div>
    );
  }

  const p = property;
  const isApproved = p.approve === "Approved";
  const isRejected = p.approve === "Rejected";
  const isActive = p.status === "Active";
  const cover = images[activeImage]?.src || images[0]?.src;
  const websiteUrl = p.seoSlug ? `https://www.reparv.in/property-info/${p.seoSlug}` : null;
  const approvalLabel = p.approve === "Not Approved" ? "Pending" : p.approve;
  const contactName = p.projectBy;
  const contactPhone = p.propertyContact ?? p.contact;

  const shareOnWhatsApp = () => {
    const text = `${p.propertyName}${websiteUrl ? `\n${websiteUrl}` : ""}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F4F6F8]">
      <div className="mx-auto max-w-[1400px] space-y-5 p-4 pb-16 md:p-6">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate("/app/properties")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            <FaArrowLeft /> Back to Properties
          </button>
          <p className="text-xs text-gray-500">
            ID #{p.propertyid}
            {p.propertyCityId ? ` · ${p.propertyCityId}` : ""}
            {p.updated_at ? ` · Updated ${formatDate(p.updated_at)}` : ""}
          </p>
        </div>

        {/* Approval banner */}
        {!isApproved && (
          <div className={`flex items-start gap-3 rounded-2xl border px-5 py-4 ${isRejected ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}`}>
            {isRejected ? (
              <FaTimesCircle className="mt-0.5 text-red-600" size={18} />
            ) : (
              <FaRegClock className="mt-0.5 text-[#0057D9]" size={18} />
            )}
            <div>
              <p className={`text-sm font-semibold ${isRejected ? "text-red-800" : "text-[#0047B3]"}`}>
                {isRejected ? "This property was rejected" : "Waiting for approval"}
              </p>
              <p className={`text-xs ${isRejected ? "text-red-700" : "text-[#0057D9]"}`}>
                {isRejected
                  ? `Reason: ${p.rejectreason || "No reason given"}. Edit the details and it will be reviewed again.`
                  : "It is hidden from the website until the Reparv team approves it."}
              </p>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="grid gap-5 lg:grid-cols-5">
          {/* Gallery */}
          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:col-span-3">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
              <img
                src={cover || FALLBACK_IMG}
                alt={p.propertyName}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_IMG;
                }}
                className="h-full w-full object-cover"
              />
              {images[activeImage]?.label && (
                <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                  {images[activeImage].label}
                </span>
              )}
              <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
                {images.length} photo{images.length === 1 ? "" : "s"}
              </span>
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={`${img.src}-${i}`}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 ${
                      i === activeImage ? "border-[#5323DC]" : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={img.src} alt={img.label} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap gap-2">
              <Badge tone={isApproved ? "green" : isRejected ? "red" : "blue"}>{approvalLabel}</Badge>
              <Badge tone={isActive ? "green" : "gray"}>{isActive ? "Active" : "Inactive"}</Badge>
              {p.hotDeal === "Active" && (
                <Badge tone="red" icon={<FaFire />}>Hot Deal</Badge>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">{p.propertyName}</h1>
              <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-500">
                <FaMapMarkerAlt className="mt-0.5 shrink-0" />
                {[p.address, p.location, p.city, p.state].filter(Boolean).join(", ") || "No address"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {p.propertyCategory}
                {p.listingType ? ` · ${p.listingType}` : ""}
                {p.propertyKind ? ` · ${p.propertyKind}` : ""}
                {p.created_at ? ` · Listed ${formatDate(p.created_at)}` : ""}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">Offer price</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{rupees(parseInt(p.totalOfferPrice) || 0)}</span>
                {Number(p.totalSalesPrice) > Number(p.totalOfferPrice) && (
                  <span className="text-sm text-gray-400 line-through">{rupees(parseInt(p.totalSalesPrice) || 0)}</span>
                )}
              </div>
            </div>

            {(contactName || contactPhone) && (
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3EDFF] text-[#5323DC]">
                  <FaUserTie />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{contactName || "Owner contact"}</p>
                  <p className="truncate text-xs text-gray-500">
                    {contactPhone}
                    {p.city ? ` · ${p.city}` : ""}
                  </p>
                </div>
                {contactPhone && (
                  <a
                    href={`tel:${contactPhone}`}
                    className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
                    aria-label="Call contact"
                  >
                    <FaPhoneAlt size={12} />
                  </a>
                )}
              </div>
            )}

            <div className="mt-auto grid grid-cols-2 gap-2">
              <Btn onClick={() => navigate(`/app/property/update/${p.propertyid}`)}>
                <FaEdit /> Edit Details
              </Btn>
              <Btn variant="secondary" onClick={() => navigate(`/app/property/update/${p.propertyid}?step=3`)}>
                <FaUpload /> Update Photos
              </Btn>
              <Btn
                variant="secondary"
                disabled={!websiteUrl}
                title={websiteUrl ? "" : "Available once the listing has a web address"}
                onClick={() => window.open(websiteUrl, "_blank", "noopener")}
              >
                <FaExternalLinkAlt /> View on Website
              </Btn>
              <Btn variant="secondary" className="!text-[#128C3F]" onClick={shareOnWhatsApp}>
                <FaWhatsapp /> Share
              </Btn>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {[
            { label: "Views", value: p.views, icon: <FaEye />, color: "text-gray-600" },
            { label: "Saved", value: p.likes, icon: <FaHeart />, color: "text-red-500" },
            { label: "Enquiries", value: enquiriesLoading ? "—" : enquiries.length, icon: <BiMessageRoundedDots />, color: "text-[#5323DC]" },
            { label: "Calls", value: p.calls, icon: <FaPhoneAlt />, color: "text-blue-500" },
            { label: "WhatsApp", value: p.whatsapp, icon: <FaWhatsapp />, color: "text-green-600" },
            { label: "Shares", value: p.shares, icon: <FaShareAlt />, color: "text-purple-500" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <p className={`flex items-center gap-1.5 text-xs font-medium ${s.color}`}>
                {s.icon} {s.label}
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-gray-900">
                {typeof s.value === "string" ? s.value : formatNumber(s.value)}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="sticky top-0 z-20 -mx-4 bg-[#F4F6F8]/95 px-4 py-2 backdrop-blur md:-mx-6 md:px-6">
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`shrink-0 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  tab === t.key ? "text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
                style={tab === t.key ? { backgroundColor: PRIMARY } : undefined}
              >
                {t.label}
                {t.key === "enquiries" && !enquiriesLoading && enquiries.length > 0 && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${tab === t.key ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"}`}>
                    {enquiries.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {tab === "overview" && <OverviewTab p={p} />}
        {tab === "media" && <MediaTab p={p} onUpdatePhotos={() => navigate(`/app/property/update/${p.propertyid}?step=3`)} />}
        {tab === "location" && <LocationTab p={p} />}
        {tab === "additional" && <AdditionalTab id={id} navigate={navigate} />}
        {tab === "enquiries" && <EnquiriesTab rows={enquiries} loading={enquiriesLoading} />}
      </div>
    </div>
  );
}
