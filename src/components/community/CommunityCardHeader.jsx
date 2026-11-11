import { FiMoreHorizontal } from "react-icons/fi";

export default function CommunityCardHeader({
  avatar,
  name,
  role,
  time,
  badge,
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
          {avatar && (
            <img
              src={avatar}
              alt={name}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">{name}</p>
            {badge && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {time} • {role}
          </p>
        </div>
      </div>

      <button className="h-8 w-8 rounded-full grid place-items-center hover:bg-muted transition">
        <FiMoreHorizontal />
      </button>
    </div>
  );
}