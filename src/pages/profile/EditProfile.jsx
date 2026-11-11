import { useId, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { getImageURI } from "../../utils/helper";
import Loader from "../../components/Loader";
import {
  ArrowLeft,
  Camera,
  Check,
  Eye,
  EyeOff,
  ChevronRight,
  Image,
  User,
  Share2,
  Briefcase,
  SlidersHorizontal,
  Globe,
  MapPin,
  Plus,
  X,
  Instagram,
  Linkedin,
  Youtube,
  Phone,
} from "lucide-react";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 97.17%)";
const PURPLE = "#5323DC";
const inputCls =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#5323DC] focus:ring-2 focus:ring-violet-50 transition-all bg-white";

/* ── Shared primitives ──────────────────────────────────── */
function Label({ children }) {
  return <p className="text-sm font-semibold text-gray-900 mb-2">{children}</p>;
}
function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-4">
      {children}
    </p>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-all duration-200 focus:outline-none flex-shrink-0 ${checked ? "bg-[#5323DC]" : "bg-gray-200"}`}
    >
      <span
        className={`absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all duration-200 ${checked ? "left-[26px]" : "left-[3px]"}`}
      />
    </button>
  );
}

function TagPill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 bg-violet-50 text-[#5323DC] text-sm font-medium px-3 py-1.5 rounded-full border border-violet-200">
      {label}
      <button
        onClick={() => onRemove(label)}
        type="button"
        className="hover:text-violet-900"
      >
        <X size={12} />
      </button>
    </span>
  );
}

function TagInputRow({ tags, onAdd, onRemove, placeholder = "Add..." }) {
  const [val, setVal] = useState("");
  const inputId = useId();
  const add = () => {
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onAdd(trimmed);
      setVal("");
    }
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <TagPill key={t} label={t} onRemove={onRemove} />
        ))}
        <button
          type="button"
          onClick={() => document.getElementById(inputId)?.focus()}
          className="inline-flex items-center gap-1 border border-gray-200 text-gray-500 text-sm px-3 py-1.5 rounded-full hover:border-[#5323DC]"
        >
          <Plus size={13} /> Add
        </button>
      </div>
      <input
        id={inputId}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
      />
    </div>
  );
}

function IconInput({
  icon: Icon,
  iconColor,
  placeholder,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#5323DC] focus-within:ring-2 focus-within:ring-violet-50 transition-all">
      <div className="pl-4 pr-2 flex items-center shrink-0">
        <Icon size={18} style={{ color: iconColor || "#9ca3af" }} />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 py-3 pr-4 text-sm text-gray-800 placeholder:text-gray-400 outline-none bg-transparent"
      />
    </div>
  );
}

const CATEGORIES = [
  "Builder",
  "Sales Partner",
  "Channel Partner",
  "Agency",
  "Territory Partner",
  "Consultant",
  "Developer",
];

function CategoryPill({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-[15px] font-semibold border-2 transition-all active:scale-95 ${selected ? "border-[#5323DC] bg-[#5323DC] text-white" : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"}`}
    >
      {label}
      {selected && <Check size={16} strokeWidth={2.5} />}
    </button>
  );
}

function CoverPlaceholder({ coverFile, coverSrc, onCoverChange }) {
  return (
    <div
      className="relative w-full h-36 rounded-2xl overflow-hidden"
      style={{
        background:
          "repeating-conic-gradient(#d8b4fe 0% 25%, #ede9fe 0% 50%) 0 0 / 24px 24px",
      }}
    >
      {(coverFile || coverSrc) && (
        <img
          src={coverFile ? URL.createObjectURL(coverFile) : coverSrc}
          className="absolute inset-0 w-full h-full object-cover"
          alt="cover"
        />
      )}
      <label
        htmlFor="cover-upload"
        className="absolute inset-0 flex items-center justify-center cursor-pointer group"
      >
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-700 shadow group-hover:shadow-md transition-shadow">
          <Camera size={15} /> Edit Cover
        </div>
      </label>
      <input
        id="cover-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onCoverChange(e.target.files?.[0] || null)}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   STEP COMPONENTS — all props use DB field names
════════════════════════════════════════════════════════════ */

function StepProfileHeader({
  user,
  avatarSrc,
  avatarFile,
  setAvatarFile,
  coverSrc,
  coverFile,
  setCoverFile,
  prefs,
  setPrefs,
}) {
  return (
    <div className="space-y-5">
      <CoverPlaceholder
        coverFile={coverFile}
        coverSrc={coverSrc}
        onCoverChange={setCoverFile}
      />
      <div className="flex flex-col items-center -mt-16 relative z-10">
        <div className="relative">
          <img
            src={avatarFile ? URL.createObjectURL(avatarFile) : avatarSrc}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-lg"
            style={{ background: GRADIENT }}
          >
            <Camera size={15} className="text-white" />
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mt-3">
          {user?.fullname || "Your Name"}
        </h2>
        <span className="mt-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
          {user?.role || "Partner"}
        </span>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <SectionLabel>Display Info</SectionLabel>
        <div>
          <Label>Display Name</Label>
          <input value={user?.fullname || ""} readOnly className={inputCls} />
        </div>
        <div>
          <Label>Role / Headline</Label>
          <input value={user?.role || ""} readOnly className={inputCls} />
        </div>
        <div>
          <Label>Bio</Label>
          <textarea
            rows={3}
            className={`${inputCls} resize-none`}
            placeholder="Experienced technician specializing in..."
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Profile Visibility
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Visible to all customers on Reparv
            </p>
          </div>
          {/* DB: pref_showPosts */}
          <Toggle
            checked={prefs.pref_showPosts}
            onChange={(v) => setPrefs((p) => ({ ...p, pref_showPosts: v }))}
          />
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Show "Open for Work" Badge
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Adds a purple ring to your avatar
            </p>
          </div>
          {/* openForWork — UI only, not in DB */}
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${prefs.openForWork ? "border-[#5323DC] bg-[#5323DC]" : "border-gray-300"}`}
            onClick={() =>
              setPrefs((p) => ({ ...p, openForWork: !p.openForWork }))
            }
          >
            {prefs.openForWork && (
              <Check size={13} className="text-white" strokeWidth={3} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepBasicInfo({ form, setForm }) {
  const addTag = (t) =>
    setForm((p) => ({ ...p, territories: [...(p.territories || []), t] }));
  const removeTag = (t) =>
    setForm((p) => ({
      ...p,
      territories: (p.territories || []).filter((x) => x !== t),
    }));
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <SectionLabel>Identity</SectionLabel>
        {/* DB: fullname */}
        <div>
          <Label>Full Name</Label>
          <input
            value={form.fullname || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, fullname: e.target.value }))
            }
            className={inputCls}
            placeholder="Elena Rodriguez"
          />
        </div>
        {/* DB: companyName */}
        <div>
          <Label>Company Name</Label>
          <IconInput
            icon={Briefcase}
            iconColor="#9ca3af"
            placeholder="Rodriguez Repairs LLC"
            value={form.companyName || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, companyName: e.target.value }))
            }
          />
        </div>
        {/* DB: role */}
        <div>
          <Label>Role / Title</Label>
          <input
            value={form.role || ""}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            className={inputCls}
            placeholder="Mobile Repair Specialist"
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <SectionLabel>Location & Bio</SectionLabel>
        {/* DB: location */}
        <div>
          <Label>Location</Label>
          <IconInput
            icon={MapPin}
            iconColor="#9ca3af"
            placeholder="Mumbai · Navi Mumbai Cluster"
            value={form.location || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, location: e.target.value }))
            }
          />
        </div>
        {/* DB: bio */}
        <div>
          <Label>Bio</Label>
          <div className="relative">
            <textarea
              rows={4}
              maxLength={150}
              value={form.bio || ""}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              className={`${inputCls} resize-none pb-6`}
              placeholder="Helping builders and brokers close premium inventory…"
            />
            <span className="absolute bottom-3 right-3 text-xs text-gray-400">
              {(form.bio || "").length}/150
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <SectionLabel>Details</SectionLabel>
        {/* DB: territories */}
        <div>
          <Label>Service Territory</Label>
          <TagInputRow
            tags={form.territories || []}
            onAdd={addTag}
            onRemove={removeTag}
            placeholder="Add territory…"
          />
        </div>
        {/* DB: website */}
        <div>
          <Label>Website</Label>
          <IconInput
            icon={Globe}
            iconColor="#9ca3af"
            placeholder="https://aarohiestates.in"
            value={form.website || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, website: e.target.value }))
            }
          />
        </div>
      </div>
    </div>
  );
}

function StepSocialMedia({ social, setSocial }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <SectionLabel>Public Profiles</SectionLabel>
        {/* DB: instagramUrl */}
        <div>
          <Label>Instagram</Label>
          <IconInput
            icon={Instagram}
            iconColor="#e1306c"
            placeholder="@username"
            value={social.instagramUrl || ""}
            onChange={(e) =>
              setSocial((p) => ({ ...p, instagramUrl: e.target.value }))
            }
          />
        </div>
        {/* DB: linkedinUrl */}
        <div>
          <Label>LinkedIn</Label>
          <IconInput
            icon={Linkedin}
            iconColor="#0077b5"
            placeholder="https://linkedin.com/in/..."
            value={social.linkedinUrl || ""}
            onChange={(e) =>
              setSocial((p) => ({ ...p, linkedinUrl: e.target.value }))
            }
          />
        </div>
        {/* DB: youtubeUrl */}
        <div>
          <Label>YouTube Channel</Label>
          <IconInput
            icon={Youtube}
            iconColor="#ff0000"
            placeholder="https://youtube.com/c/..."
            value={social.youtubeUrl || ""}
            onChange={(e) =>
              setSocial((p) => ({ ...p, youtubeUrl: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <SectionLabel>Direct Contact</SectionLabel>
        {/* DB: whatsappNumber */}
        <div>
          <Label>WhatsApp Business</Label>
          <IconInput
            icon={Phone}
            iconColor="#25d366"
            placeholder="+1 (555) 000-0000"
            value={social.whatsappNumber || ""}
            onChange={(e) =>
              setSocial((p) => ({ ...p, whatsappNumber: e.target.value }))
            }
            type="tel"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            Used for direct client messaging links.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepBusinessCategory({ selected, setSelected }) {
  // DB: BusinessCategories
  const toggle = (cat) =>
    setSelected((p) =>
      p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat],
    );
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[22px] font-extrabold text-gray-900 leading-snug">
          What describes your business best?
        </h2>
        <p className="text-[15px] text-gray-400 mt-2 leading-relaxed">
          Select all categories that apply to your real estate business.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat}
            label={cat}
            selected={selected.includes(cat)}
            onClick={() => toggle(cat)}
          />
        ))}
      </div>
    </div>
  );
}

function StepContentPreferences({ prefs, setPrefs }) {
  // All keys = DB column names; values are booleans → converted to "1"/"0" on save
  const toggles = [
    {
      key: "pref_showPosts",
      label: "Show posts publicly",
      sub: "Let anyone on Reparv view your posts grid.",
    },
    {
      key: "pref_allowTagging",
      label: "Allow tagging",
      sub: "Builders and partners can tag you in their updates.",
    },
    {
      key: "pref_allowReposts",
      label: "Allow reposts",
      sub: "Let partners repost your content with attribution.",
    },
    {
      key: "pref_enableStories",
      label: "Enable story feature",
      sub: "Share quick, time-limited launch updates.",
    },
    {
      key: "pref_autoPublish",
      label: "Auto publish to community feed",
      sub: "New posts automatically appear in relevant communities.",
    },
  ];
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
        {toggles.map((t) => (
          <div
            key={t.key}
            className="flex items-center justify-between px-5 py-4"
          >
            <div className="pr-4">
              <p className="text-sm font-semibold text-gray-900">{t.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.sub}</p>
            </div>
            <Toggle
              checked={!!prefs[t.key]}
              onChange={(v) => setPrefs((p) => ({ ...p, [t.key]: v }))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function EditProfile() {
  const navigate = useNavigate();
  const { URI, setLoading, role } = useAuth();
  const isProjectPartner = role === "Project Partner";
  const getBasePath = () => {
    if (role === "Project Partner") return "/project-partner";
    if (role === "Territory Partner") return "/territory-partner";
    return "/sales"; // Sales Partner
  };

  // ── form state: keys = DB column names ──────────────────
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    contact: "",
    companyName: "", // DB: companyName
    role: "",
    location: "",
    bio: "",
    website: "",
    territories: [], // DB: territories → JSON.stringify on save
  });

  // ── social state: keys = DB column names ────────────────
  const [social, setSocial] = useState({
    instagramUrl: "", // DB: instagramUrl
    linkedinUrl: "", // DB: linkedinUrl
    youtubeUrl: "", // DB: youtubeUrl
    whatsappNumber: "", // DB: whatsappNumber
  });

  // ── BusinessCategories: DB column name used as state var ─
  const [BusinessCategories, setBusinessCategories] = useState([]);

  // ── prefs: keys = DB column names, boolean internally ───
  // Stored in DB as "1"/"0" strings; converted on fetch/save
  const [prefs, setPrefs] = useState({});

  const [user, setUser] = useState({
    fullname: "",
    username: "",
    email: "",
    contact: "",
    role: "",
    userimage: "",
  });
  const [avatarFile, setAvatarFile] = useState(null); // DB: image
  const [coverFile, setCoverFile] = useState(null); // DB: coverImage
  const [mobileStep, setMobileStep] = useState(0);
  const [showPw, setShowPw] = useState({ cur: false, new: false });
  const [passwords, setPasswords] = useState({ current: "", newPw: "" });
  const [pwError, setPwError] = useState("");

  const avatarSrc = user?.userimage
    ? getImageURI(user.userimage)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullname || "U")}&background=5323DC&color=fff&size=150`;

  const coverSrc = user?.coverImage ? getImageURI(user.coverImage) : null;

  const strengthFields = [
    form.fullname,
    form.bio,
    form.location,
    form.website,
    social.instagramUrl,
    BusinessCategories.length > 0,
    avatarFile,
  ];
  const strengthPct = Math.round(
    (strengthFields.filter(Boolean).length / strengthFields.length) * 100,
  );

  /* ── fetch: API response keys already match DB ── */
  const fetchProfile = async () => {
    try {
      const r = await fetch(`${URI}${getBasePath()}/profile`, {
        method: "GET",
        credentials: "include",
      });
      if (!r.ok) throw new Error();
      const d = await r.json();

      setUser(d);

      setForm({
        fullname: d.fullname || "",
        username: d.username || "",
        email: d.email || "",
        contact: d.contact || "",
        companyName: d.companyName || "",
        role: d.role || "",
        location: d.location || "",
        bio: d.bio || "",
        website: d.website || "",
        territories: d.territories ? JSON.parse(d.territories) : [],
      });

      setSocial({
        instagramUrl: d.instagramUrl || "",
        linkedinUrl: d.linkedinUrl || "",
        youtubeUrl: d.youtubeUrl || "",
        whatsappNumber: d.whatsappNumber || "",
      });

      setBusinessCategories(
        d.BusinessCategories ? JSON.parse(d.BusinessCategories) : [],
      );

      setPrefs({
        pref_showPosts: Boolean(d.pref_showPosts),
        pref_allowTagging: Boolean(d.pref_allowTagging),
        pref_allowReposts: Boolean(d.pref_allowReposts),
        pref_enableStories: Boolean(d.pref_enableStories),
        pref_autoPublish: Boolean(d.pref_autoPublish),
        openForWork: false,
      });
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);

  /* ── save: state key = fd key = DB column name ── */
  const saveProfile = async () => {
    const fd = new FormData();

    fd.append("fullname", form.fullname);
    fd.append("username", form.username);
    fd.append("email", form.email);
    fd.append("contact", form.contact);
    fd.append("companyName", form.companyName);
    fd.append("role", form.role);
    fd.append("location", form.location);
    fd.append("bio", form.bio);
    fd.append("website", form.website);
    fd.append("territories", JSON.stringify(form.territories));
    fd.append("BusinessCategories", JSON.stringify(BusinessCategories));

    fd.append("instagramUrl", social.instagramUrl);
    fd.append("linkedinUrl", social.linkedinUrl);
    fd.append("youtubeUrl", social.youtubeUrl);
    fd.append("whatsappNumber", social.whatsappNumber);

    // boolean → "1"/"0" to match DB storage format
    fd.append("pref_showPosts", prefs.pref_showPosts ? 1 : 0);
    fd.append("pref_allowTagging", prefs.pref_allowTagging ? 1 : 0);
    fd.append("pref_allowReposts", prefs.pref_allowReposts ? 1 : 0);
    fd.append("pref_enableStories", prefs.pref_enableStories ? 1 : 0);
    fd.append("pref_autoPublish", prefs.pref_autoPublish ? 1 : 0);

    if (avatarFile) fd.append("image", avatarFile);
    if (coverFile) fd.append("coverImage", coverFile);

    try {
      setLoading(true);
      const r = await fetch(`${URI}${getBasePath()}/profile/v2/edit`, {
        method: "PUT",
        credentials: "include",
        body: fd,
      });
      if (r.ok) {
        alert("Profile updated successfully!");
        await fetchProfile();
      } else alert("Update failed");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.newPw) {
      setPwError("Both fields required.");
      return;
    }
    try {
      setLoading(true);
      const r = await fetch(`${URI}${getBasePath()}/profile/changepassword`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.newPw,
        }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.message);
      }
      alert("Password changed!");
      setPasswords({ current: "", newPw: "" });
      setPwError("");
      setMobileStep(0);
    } catch (e) {
      setPwError(e.message || "Failed.");
    } finally {
      setLoading(false);
    }
  };

  const MOBILE_STEPS = [
    {
      key: "header",
      title: "Edit Profile Header",
      Icon: Image,
      sub: "Update profile photo and cover banner",
    },
    {
      key: "basic",
      title: "Basic Information",
      Icon: User,
      sub: "Name, bio, location, and role",
    },
    {
      key: "social",
      title: "Social Media",
      Icon: Share2,
      sub: "Linked accounts and website",
    },
    {
      key: "category",
      title: "Business Category",
      Icon: Briefcase,
      sub: "Required to complete profile",
      required: true,
    },
    {
      key: "prefs",
      title: "Content Preferences",
      Icon: SlidersHorizontal,
      sub: "Manage feed topics and tags",
    },
  ];

  const renderStepContent = (key) => {
    switch (key) {
      case "header":
        return (
          <StepProfileHeader
            user={user}
            avatarSrc={avatarSrc}
            avatarFile={avatarFile}
            setAvatarFile={setAvatarFile}
            coverSrc={coverSrc}
            coverFile={coverFile}
            setCoverFile={setCoverFile}
            prefs={prefs}
            setPrefs={setPrefs}
          />
        );
      case "basic":
        return <StepBasicInfo form={form} setForm={setForm} />;
      case "social":
        return <StepSocialMedia social={social} setSocial={setSocial} />;
      case "category":
        return (
          <StepBusinessCategory
            selected={BusinessCategories}
            setSelected={setBusinessCategories}
          />
        );
      case "prefs":
        return <StepContentPreferences prefs={prefs} setPrefs={setPrefs} />;
      default:
        return null;
    }
  };

  const currentStep = MOBILE_STEPS[mobileStep - 1];
  const isCategoryStep = currentStep?.key === "category";

  return (
    <>
      {/* ─── MOBILE VIEW ─────────────────────────────── */}
      <div className="md:hidden min-h-screen bg-[#F6F7FB]">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3.5">
          <button
            onClick={() => (mobileStep === 0 ? navigate(-1) : setMobileStep(0))}
            className="p-1.5 rounded-lg hover:bg-gray-100 active:scale-95"
          >
            <ArrowLeft size={20} className="text-gray-800" strokeWidth={2.2} />
          </button>
          <h1 className="text-[16px] font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">
            {mobileStep === 0 ? "Edit Profile" : currentStep?.title}
          </h1>
          {mobileStep === 0 ? (
            <button
              onClick={saveProfile}
              style={{ color: PURPLE }}
              className="text-sm font-bold active:scale-95"
            >
              Save
            </button>
          ) : (
            <div className="w-[40px]" />
          )}
        </div>

        {mobileStep === 0 && (
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div
                className="h-28 relative"
                style={{
                  background:
                    "repeating-conic-gradient(#d8b4fe 0% 25%, #ede9fe 0% 50%) 0 0 / 20px 20px",
                }}
              >
                {(coverFile || coverSrc) && (
                  <img
                    src={coverFile ? URL.createObjectURL(coverFile) : coverSrc}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="cover"
                  />
                )}
              </div>
              <div className="flex flex-col items-center pb-5 -mt-12 px-5">
                <div className="relative">
                  <img
                    src={
                      avatarFile ? URL.createObjectURL(avatarFile) : avatarSrc
                    }
                    alt="avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  <div
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow"
                    style={{ background: GRADIENT }}
                  >
                    <Camera size={14} className="text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-3">
                  {user?.fullname || "Your Name"}
                </h2>
                <span className="mt-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 font-medium">
                  {user?.role || "Partner"}
                </span>
                <div className="w-full mt-4 bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-sm font-bold"
                      style={{ color: PURPLE }}
                    >
                      Profile Strength
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {strengthPct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${strengthPct}%`, background: GRADIENT }}
                    />
                  </div>
                  {strengthPct < 100 && (
                    <p className="text-xs text-gray-400 mt-2">
                      Add your business category to reach 100%
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {MOBILE_STEPS.map((step, i) => (
                <button
                  key={step.key}
                  onClick={() => setMobileStep(i + 1)}
                  className="w-full flex items-center gap-4 bg-white rounded-2xl px-4 py-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform text-left"
                >
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center ${step.required ? "bg-red-50" : "bg-violet-50"}`}
                  >
                    <step.Icon
                      size={20}
                      className={
                        step.required ? "text-red-500" : "text-[#5323DC]"
                      }
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">
                      {step.title}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${step.required ? "text-red-500 font-semibold" : "text-gray-400"}`}
                    >
                      {step.sub}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {mobileStep > 0 && (
          <>
            {isCategoryStep && (
              <div className="w-full h-1 bg-gray-100">
                <div className="h-full bg-[#5323DC]" style={{ width: "50%" }} />
              </div>
            )}
            <div className="p-4 pb-28">
              {renderStepContent(currentStep?.key)}
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50">
              <button
                onClick={saveProfile}
                className="w-full py-4 rounded-lg text-white bg-[#5323DC] text-[15px] font-semibold hover:opacity-90 transition-opacity active:scale-95"
              >
                {isCategoryStep ? "Save Categories" : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ─── DESKTOP VIEW ────────────────────────────── */}
      <div className="hidden md:flex min-h-screen flex-col">
        <div className="flex items-start justify-between px-8 py-6">
          <div>
            <h1 className="text-[22px] font-bold text-black">
              Edit Partner Profile
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Tune your creator identity for Reparv social feed and partner
              discovery.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-md text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={saveProfile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold bg-[#5323DC] text-white hover:opacity-90 transition-opacity"
            >
              <Check size={15} /> Save changes
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-32 space-y-6 max-w-2xl">
          {/* Profile Header card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-bold text-gray-900">
                  Profile header
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Photo, banner and creator handle for your Reparv profile.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#5323DC] bg-violet-50 px-3 py-1.5 rounded-lg">
                Visible on public profile
              </span>
            </div>
            <div
              className="relative w-full h-24 rounded-xl overflow-hidden border border-dashed border-gray-200 mb-4"
              style={{
                background:
                  "repeating-conic-gradient(#f3f4f6 0% 25%, #ffffff 0% 50%) 0 0 / 16px 16px",
              }}
            >
              {(coverFile || coverSrc) && (
                <img
                  src={coverFile ? URL.createObjectURL(coverFile) : coverSrc}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt="cover"
                />
              )}
              <div
                className={`absolute inset-0 flex items-center justify-start px-5 gap-4 ${
                  coverFile || coverSrc ? "bg-black/30" : "bg-[#5323DC2E]"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                  <Image size={20} className="text-black" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#e1e1e1]">
                    Add a cover banner
                  </p>
                  <p className="text-xs text-[#e1e1e1] mt-0.5">
                    Recommended 1600 × 400px.
                  </p>
                </div>
                {/* fd key: coverImage */}
                <label
                  htmlFor="d-cover"
                  className="ml-auto border border-gray-200 bg-white rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-50"
                >
                  Upload
                </label>
                <input
                  id="d-cover"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={avatarFile ? URL.createObjectURL(avatarFile) : avatarSrc}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                  alt="avatar"
                />
                {/* fd key: image */}
                <label
                  htmlFor="d-avatar"
                  className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer shadow"
                  style={{ background: GRADIENT }}
                >
                  <Camera size={11} className="text-white" />
                </label>
                <input
                  id="d-avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[17px] font-bold text-gray-900">
                  {user?.fullname || "Your Name"}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {BusinessCategories.map((c) => (
                    <span
                      key={c}
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-50 text-[#5323DC]"
                    >
                      {c}
                    </span>
                  ))}
                  {user?.username && (
                    <span className="text-xs text-gray-400">
                      @{user.username}
                    </span>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs text-gray-400 mb-1">
                  Profile completeness
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-28 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${strengthPct}%`, background: GRADIENT }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700">
                    {strengthPct}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-[15px] font-bold text-gray-900">
                  Basic information
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tell partners who you are and where you operate.
                </p>
              </div>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                Required
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full name</Label>
                <input
                  value={form.fullname}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, fullname: e.target.value }))
                  }
                  className={inputCls}
                  placeholder="Aarohi Mehta"
                />
              </div>
              <div>
                <Label>Company name</Label>
                <input
                  value={form.companyName || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, companyName: e.target.value }))
                  }
                  className={inputCls}
                  placeholder="Aarohi Estates Collective"
                />
              </div>
              <div>
                <Label>Role / title</Label>
                <input
                  value={form.role}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, role: e.target.value }))
                  }
                  className={inputCls}
                  placeholder="Founder · Lead Sales Partner"
                />
              </div>
              <div>
                <Label>Location</Label>
                <input
                  value={form.location || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                  className={inputCls}
                  placeholder="Mumbai · Navi Mumbai Cluster"
                />
              </div>
              <div className="col-span-2">
                <Label>Bio</Label>
                <div className="relative">
                  <textarea
                    rows={3}
                    maxLength={150}
                    value={form.bio || ""}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, bio: e.target.value }))
                    }
                    className={`${inputCls} resize-none pb-6`}
                    placeholder="Helping builders and brokers close premium inventory…"
                  />
                  <span className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {(form.bio || "").length}/150
                  </span>
                </div>
              </div>
              <div>
                <Label>Territory tags</Label>
                <TagInputRow
                  tags={form.territories || []}
                  onAdd={(t) =>
                    setForm((p) => ({
                      ...p,
                      territories: [...(p.territories || []), t],
                    }))
                  }
                  onRemove={(t) =>
                    setForm((p) => ({
                      ...p,
                      territories: (p.territories || []).filter((x) => x !== t),
                    }))
                  }
                  placeholder="Add territories…"
                />
              </div>
              <div>
                <Label>Website link</Label>
                <input
                  value={form.website || ""}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, website: e.target.value }))
                  }
                  className={inputCls}
                  placeholder="https://aarohiestates.in"
                />
              </div>
            </div>
          </div>

          {/* Social media card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-[15px] font-bold text-gray-900">
                  Social media
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Connect your creator profiles so partners can follow your
                  content.
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                Social-first
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Instagram</Label>
                <IconInput
                  icon={Instagram}
                  iconColor="#e1306c"
                  placeholder="https://instagram.com/aarohi.reparv"
                  value={social.instagramUrl || ""}
                  onChange={(e) =>
                    setSocial((p) => ({ ...p, instagramUrl: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>WhatsApp Business</Label>
                <IconInput
                  icon={Phone}
                  iconColor="#25d366"
                  placeholder="wa.me/919876543210"
                  value={social.whatsappNumber || ""}
                  onChange={(e) =>
                    setSocial((p) => ({ ...p, whatsappNumber: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>LinkedIn</Label>
                <IconInput
                  icon={Linkedin}
                  iconColor="#0077b5"
                  placeholder="linkedin.com/in/aarohi-mehta"
                  value={social.linkedinUrl || ""}
                  onChange={(e) =>
                    setSocial((p) => ({ ...p, linkedinUrl: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>YouTube channel</Label>
                <IconInput
                  icon={Youtube}
                  iconColor="#ff0000"
                  placeholder="youtube.com/@aarohiestates"
                  value={social.youtubeUrl || ""}
                  onChange={(e) =>
                    setSocial((p) => ({ ...p, youtubeUrl: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Business category card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-[15px] font-bold text-gray-900">
                Business category
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Choose how other partners discover you on Reparv.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const sel = BusinessCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() =>
                      setBusinessCategories((p) =>
                        p.includes(cat)
                          ? p.filter((c) => c !== cat)
                          : [...p, cat],
                      )
                    }
                    className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all active:scale-95 ${sel ? "border-[#5323DC] bg-[#5323DC] text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content preferences card */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <h3 className="text-[15px] font-bold text-gray-900">
                Content preferences
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Control how your posts, reels and stories show up across Reparv.
              </p>
            </div>
            <StepContentPreferences prefs={prefs} setPrefs={setPrefs} />
          </div>

          {/* Change password card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-[15px] font-bold text-gray-900 mb-5">
              Change Password
            </h3>
            <form onSubmit={changePassword} className="grid grid-cols-2 gap-4">
              <div>
                <Label>Current Password</Label>
                <div className="relative">
                  <input
                    type={showPw.cur ? "text" : "password"}
                    required
                    placeholder="Enter current password"
                    value={passwords.current}
                    onChange={(e) =>
                      setPasswords((p) => ({ ...p, current: e.target.value }))
                    }
                    className={`${inputCls} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => ({ ...p, cur: !p.cur }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw.cur ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <Label>New Password</Label>
                <div className="relative">
                  <input
                    type={showPw.new ? "text" : "password"}
                    required
                    placeholder="Enter new password"
                    value={passwords.newPw}
                    onChange={(e) =>
                      setPasswords((p) => ({ ...p, newPw: e.target.value }))
                    }
                    className={`${inputCls} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => ({ ...p, new: !p.new }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw.new ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {pwError && (
                <p className="col-span-2 text-red-500 text-sm">{pwError}</p>
              )}
              <div className="col-span-2 flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#5323DC] text-sm font-bold text-white hover:opacity-90"
                >
                  <Check size={15} /> Change Password
                </button>
                <Loader />
              </div>
            </form>
          </div>
        </div>

        {/* Sticky bottom bar */}
        <div className="sticky bottom-0 border-t bg-white px-8 py-4 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            Your creator profile preview updates as you edit. Don't forget to
            publish.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={saveProfile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#5323DC] text-sm font-bold text-white hover:opacity-90"
            >
              <Check size={15} /> Save changes
            </button>
            <Loader />
          </div>
        </div>
      </div>
    </>
  );
}
