import { PlusIcon, LocationPinIcon, BuildingIcon } from "./CalendarIcons";
import { Trash2 } from "lucide-react";

function SubIcon({ type }) {
  if (type === "location") return <LocationPinIcon />;
  return <BuildingIcon />;
}

function EventCard({ time, title, sub, subIcon, accent, assignedTo, assignedAvatar }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex">
        <div className={`w-1.5 flex-shrink-0 ${accent}`} />
        <div className="flex-1 px-4 py-4">
          <span className="text-[13px] font-medium text-gray-400">{time}</span>
          <h3 className="text-[17px] font-bold text-gray-900 my-1 leading-snug">{title}</h3>
          {sub && (
            <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-2">
              <SubIcon type={subIcon} />
              <span>{sub}</span>
            </div>
          )}
          {assignedTo && (
            <div className="flex items-center justify-end gap-2 mt-1">
              <span className="text-[13px] text-gray-400">Assigned to:</span>
              <span className="text-[13px] font-semibold text-gray-700">{assignedTo}</span>
              {assignedAvatar && (
                <img
                  src={assignedAvatar}
                  alt={assignedTo}
                  className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NoteCard({ note, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex">
        <div className="w-1.5 flex-shrink-0 bg-amber-400" />
        <div className="flex-1 px-4 py-4 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-bold text-gray-900 leading-snug">{note.note}</p>
            <p className="text-[13px] text-gray-400 mt-1">
              {note.date}{note.time ? ` · ${note.time}` : ""}
            </p>
          </div>
          <button
            onClick={() => onDelete?.(note.id)}
            className="mt-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MobileEventCards({
  events       = [],
  dailyNotes   = [],
  activeFilter = "All",
  onQuickAdd,
  onDeleteNote,
}) {
  const filteredEvents = events.filter(e => {
    if (activeFilter === "All")         return true;
    if (activeFilter === "Meetings")    return e.type === "meeting";
    if (activeFilter === "Site Visits") return e.type === "site_visit";
    return false;
  });

  const showNotes  = activeFilter === "All" || activeFilter === "Notes";
  const hasContent = filteredEvents.length > 0 || (showNotes && dailyNotes.length > 0);

  return (
    <div className="px-4 py-4 flex flex-col gap-3 pb-32">

      {filteredEvents.map(e => (
        <EventCard key={e.id} {...e} />
      ))}

      {showNotes && dailyNotes.map((n, i) => (
        <NoteCard key={n.id ?? i} note={n} onDelete={onDeleteNote} />
      ))}

      {!hasContent && (
        <p className="text-center text-sm text-gray-400 italic py-8">
          No {activeFilter === "All" ? "events" : activeFilter.toLowerCase()} for this period
        </p>
      )}

      <button
        onClick={onQuickAdd}
        className="w-full mt-2 border-2 border-dashed border-gray-200 rounded-2xl py-4 flex items-center justify-center gap-2 text-sm text-gray-400 cursor-pointer hover:border-violet-400 hover:text-violet-500 transition-colors bg-white"
      >
        <PlusIcon size={15} />
        Quick Add Note
      </button>
    </div>
  );
}