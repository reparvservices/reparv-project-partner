import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, BarChart2, User, Info, CheckCircle, Clock, X, Phone } from "lucide-react";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 97.17%)";

/* ── Status Pill ── */
function StatusPill({ status }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
      {status || "Active"}
    </span>
  );
}

/* ── Action popup content ── */
function ActionPopupContent({ builder, onClose, onAction, navigate }) {
  const actions = [
    { label: "View Details",  value: "view",   icon: "👁️", special: true },
    { label: "Edit Builder",  value: "edit",   icon: "✏️" },
    { label: "Toggle Status", value: "status", icon: "🔄" },
    { label: "Delete",        value: "delete", icon: "🗑️", danger: true },
  ];
  return (
    <>
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{builder.company_name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{builder.contact_person} · {builder.contact}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 shrink-0">
          <X size={18} className="text-gray-400" />
        </button>
      </div>
      <div className="p-4 grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <button key={a.value}
            onClick={() => { onClose(); onAction(a.value, builder.builderid); }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium text-left transition-all active:scale-95
              ${a.danger   ? "bg-red-50 text-red-500 hover:bg-red-100"
              : a.special  ? "text-white hover:opacity-90 shadow-md"
              : "bg-gray-50 text-gray-700 hover:bg-[#F2F4FF] hover:text-[#5323DC]"}`}
            style={a.special ? { background: GRADIENT } : {}}>
            <span className="text-base">{a.icon}</span>
            <span className="leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ── Action Menu (⋮ trigger) ── */
function ActionMenu({ builder, onAction }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(true)}
        className="border border-gray-200 rounded-xl p-2.5 hover:bg-gray-50 transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="3"  r="1.5" fill="#9CA3AF" />
          <circle cx="8" cy="8"  r="1.5" fill="#9CA3AF" />
          <circle cx="8" cy="13" r="1.5" fill="#9CA3AF" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm cursor-pointer"
          onClick={() => setOpen(false)} />
          <div className="md:hidden fixed inset-x-0 bottom-0 z-[71] bg-white rounded-t-3xl shadow-2xl">
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>
            <ActionPopupContent builder={builder} onClose={() => setOpen(false)} onAction={onAction} navigate={navigate} />
            <div className="h-6" />
          </div>
          <div className="hidden md:flex fixed inset-0 z-[71] items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden">
              <ActionPopupContent builder={builder} onClose={() => setOpen(false)} onAction={onAction} navigate={navigate} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Desktop Card ── */
function BuilderCardDesktop({ builder, onAction }) {
  const stats = [
    { label: "REG. NO",    value: builder.registration_no || "—" },
    { label: "EXPERIENCE", value: builder.experience ? `${builder.experience} yrs` : "—" },
    { label: "WEBSITE",    value: builder.website     || "—" },
    { label: "STATUS",     value: builder.status      || "Active" },
  ];

  return (
    <div className="bg-white rounded-[10px] border p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <div className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-lg font-bold text-white shrink-0"
            style={{ background: GRADIENT }}>
            {builder.company_name?.[0]?.toUpperCase() || "B"}
          </div>
          <div>
            <h3 className="text-[15.5px] font-extrabold text-gray-900 tracking-tight leading-tight">{builder.company_name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusPill status={builder.status} />
              {builder.email && <span className="text-[11px] text-gray-400 truncate max-w-[160px]">{builder.email}</span>}
            </div>
          </div>
        </div>
        <ActionMenu builder={builder} onAction={onAction} />
      </div>

      {/* Contact */}
      <div className="flex items-center gap-3 bg-[#F8FAFC] rounded-xl px-3.5 py-3 border border-gray-100">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: GRADIENT }}>
          {builder.contact_person?.[0]?.toUpperCase() || "C"}
        </div>
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold text-gray-800 leading-tight">{builder.contact_person}</p>
          <p className="text-xs text-[#7B6E9A] mt-0.5">
            {builder.contact}
            {builder.registration_no && <><span className="mx-1.5">•</span>{builder.registration_no}</>}
          </p>
        </div>
      </div>

      {/* Stats 2×2 */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {stats.map(s => (
          <div key={s.label}>
            <p className="text-[10px] font-bold text-[#7B6E9A] tracking-widest uppercase">{s.label}</p>
            <p className="text-sm font-extrabold text-gray-900 mt-0.5 truncate">{s.value}</p>
          </div>
        ))}
      </div>

      {/* About snippet */}
      {builder.about && (
        <div className="flex items-start gap-2.5 border border-gray-100 rounded-xl p-3 bg-[#F8FAFC]">
          <Info size={14} className="text-[#5323DC] shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-gray-500 leading-relaxed line-clamp-2">{builder.about}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-gray-100">
        {/* View Profile */}
        <button onClick={() => onAction("view", builder.builderid)}
          className="flex-1 text-white text-sm font-bold py-3 rounded-md hover:opacity-90 transition-opacity shadow-[0_4px_14px_rgba(83,35,220,0.25)]"
          style={{ background: "#5E23DC" }}>
          View Profile
        </button>
        {/* Call */}
        <a href={`tel:${builder.contact}`}
          className="border border-gray-200 rounded-xl p-2.5 hover:bg-gray-50 transition-colors flex items-center justify-center"
          title="Call builder">
          <Phone size={17} className="text-[#5323DC]" />
        </a>
        {/* WhatsApp */}
        <a href={`https://wa.me/91${builder.contact?.replace(/\D/g, "")}`}
          target="_blank" rel="noopener noreferrer"
          className="border border-gray-200 rounded-xl p-2.5 hover:bg-gray-50 transition-colors flex items-center justify-center"
          title="WhatsApp">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#25D366"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.118 1.533 5.844L0 24l6.335-1.509A11.957 11.957 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.003-1.37l-.359-.213-3.721.886.918-3.632-.233-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.569 2.182 12 2.182S21.818 6.57 21.818 12 17.431 21.818 12 21.818z" fill="#25D366"/>
          </svg>
        </a>
      </div>
    </div>
  );
}

/* ── Mobile Card ── */
function BuilderCardMobile({ builder, onAction }) {
  return (
    <div className="bg-white rounded-[20px] p-[18px] flex flex-col gap-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <div className="w-[58px] h-[58px] rounded-[16px] flex items-center justify-center text-xl font-bold text-white shrink-0"
            style={{ background: GRADIENT }}>
            {builder.company_name?.[0]?.toUpperCase() || "B"}
          </div>
          <div>
            <h3 className="text-[17px] font-extrabold text-gray-900 tracking-tight leading-tight">{builder.company_name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusPill status={builder.status} />
              <p className="text-[12.5px] text-gray-400">{builder.experience ? `${builder.experience} yrs exp` : "Builder"}</p>
            </div>
          </div>
        </div>
        <ActionMenu builder={builder} onAction={onAction} />
      </div>

      {/* Contact row */}
      <div className="flex items-center gap-2 pb-3.5 border-b border-gray-100">
        <User size={14} className="text-gray-400 shrink-0" />
        <span className="text-[13.5px] text-gray-700 font-medium">{builder.contact_person}</span>
        <span className="text-gray-300 mx-0.5">•</span>
        <span className="text-[13px] text-gray-500">{builder.contact}</span>
      </div>

      {/* Info row */}
      <div className="grid grid-cols-2 gap-2">
        <div><p className="text-[11px] text-gray-400 font-medium">Email</p><p className="text-[13px] font-bold text-gray-900 mt-0.5 truncate">{builder.email || "—"}</p></div>
        <div><p className="text-[11px] text-gray-400 font-medium">Reg. No</p><p className="text-[13px] font-bold text-gray-900 mt-0.5 truncate">{builder.registration_no || "—"}</p></div>
      </div>

      {/* About snippet */}
      {builder.about && (
        <div className="flex items-center gap-2.5 bg-violet-50 rounded-xl px-3.5 py-3">
          <Info size={15} className="text-[#5323DC] shrink-0" />
          <p className="text-[13px] text-gray-600 leading-[1.45] line-clamp-2">{builder.about}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {/* View Profile */}
        <button onClick={() => onAction("view", builder.builderid)}
          className="flex-1 text-[14.5px] font-bold py-2.5 rounded-[8px] text-white hover:opacity-90 transition-opacity"
          style={{ background: GRADIENT }}>
          View Profile
        </button>
        {/* Call */}
        <a href={`tel:${builder.contact}`}
          className="border-[1.5px] border-gray-200 rounded-[14px] px-3.5 py-2 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
          title="Call builder">
          <Phone size={18} className="text-[#5323DC]" />
        </a>
        {/* WhatsApp */}
        <a href={`https://wa.me/91${builder.contact?.replace(/\D/g, "")}`}
          target="_blank" rel="noopener noreferrer"
          className="border-[1.5px] border-gray-200 rounded-[14px] px-3.5 py-2 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
          title="WhatsApp">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#25D366"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.118 1.533 5.844L0 24l6.335-1.509A11.957 11.957 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 01-5.003-1.37l-.359-.213-3.721.886.918-3.632-.233-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.569 2.182 12 2.182S21.818 6.57 21.818 12 17.431 21.818 12 21.818z" fill="#25D366"/>
          </svg>
        </a>
      </div>
    </div>
  );
}

/* ── Export: auto-switches at sm breakpoint ── */
export default function BuilderCard({ builder, onAction }) {
  return (
    <>
      <div className="hidden sm:block"><BuilderCardDesktop builder={builder} onAction={onAction} /></div>
      <div className="block sm:hidden"><BuilderCardMobile builder={builder} onAction={onAction} /></div>
    </>
  );
}