// components/feed/FeedPrimitives.jsx
import { PATHS, ROLE } from "./FeedUtils";

// ─── Icon ─────────────────────────────────────────────────────────────────────
export function Icon({ name, size = 18, className = "", sw = 1.8, style }) {
  const isFill = ["heart-fill", "bm-fill", "play"].includes(name);
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill={isFill ? "currentColor" : "none"}
      stroke={isFill ? "none" : "currentColor"}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style}
    >
      <path d={PATHS[name] || PATHS["more-h"]} />
    </svg>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ src, name = "", size = 40, ring = false, ringHex = "#7c3aed", ringGradient = false }) {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const borderStyle = ring
    ? ringGradient
      ? { padding: 2, background: "linear-gradient(135deg,#7c3aed,#ec4899)", borderRadius: "50%" }
      : { border: `2.5px solid ${ringHex}` }
    : { border: "2px solid transparent" };

  return (
    <div
      className="rounded-full overflow-hidden bg-violet-100 text-violet-600 font-semibold flex items-center justify-center shrink-0"
      style={{ width: size, height: size, minWidth: size, fontSize: size * 0.34, ...borderStyle }}
    >
      {ring && ringGradient ? (
        <div className="rounded-full overflow-hidden bg-violet-100 w-full h-full flex items-center justify-center"
          style={{ width: size - 4, height: size - 4 }}>
          {src
            ? <img src={src} alt={name} className="w-full h-full object-cover rounded-full" />
            : <span>{initials || "?"}</span>}
        </div>
      ) : (
        src
          ? <img src={src} alt={name} className="w-full h-full object-cover" />
          : <span>{initials || "?"}</span>
      )}
    </div>
  );
}

// ─── RoleBadge ────────────────────────────────────────────────────────────────
export function RoleBadge({ role }) {
  const r = ROLE[role] || { label: role, color: "#6b7280", bg: "#f3f4f6" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase"
      style={{ background: r.bg, color: r.color }}
    >
      {r.label}
    </span>
  );
}

// ─── ActionBtn ────────────────────────────────────────────────────────────────
export function ActionBtn({ onClick, active = false, activeCls = "", label, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm transition-all duration-150
        ${active ? activeCls : "text-gray-400 hover:text-gray-600"}
        ${onClick ? "cursor-pointer" : "cursor-default"} ${className}`}
    >
      {children}
      {label !== undefined && label !== "" && (
        <span className={`text-xs font-semibold tabular-nums ${active ? "" : "text-gray-500"}`}>{label}</span>
      )}
    </button>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
export function ProgressRing({ progress, size = 52, color = "#7c3aed", trackColor = "#ede9fe" }) {
  const R   = (size - 6) / 2;
  const C   = 2 * Math.PI * R;
  const dash = (progress / 100) * C;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
      <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={trackColor} strokeWidth={3} />
      <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={color} strokeWidth={3}
        strokeDasharray={`${dash} ${C}`} strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />
    </svg>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function SidebarSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3.5 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-100 rounded-full w-3/4" />
            <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PostSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 animate-pulse">
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 bg-gray-200 rounded-full w-1/3" />
          <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded-full" />
        <div className="h-3 bg-gray-100 rounded-full w-5/6" />
        <div className="h-3 bg-gray-100 rounded-full w-4/6" />
      </div>
      <div className="flex gap-4 pt-2 border-t border-gray-100">
        {[0, 1, 2].map(k => <div key={k} className="h-7 w-16 bg-gray-100 rounded-lg" />)}
      </div>
    </div>
  );
}