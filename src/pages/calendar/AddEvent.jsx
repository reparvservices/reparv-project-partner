import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { format } from "date-fns";

import AddEventHeader from "../../components/calendar/addEvent/AddEventHeader";
import EventBasicInfo from "../../components/calendar/addEvent/EventBasicInfo";
import ScheduleDetails from "../../components/calendar/addEvent/ScheduleDetails";
import LocationNotes from "../../components/calendar/addEvent/LocationNotes";
import AssignmentPanel from "../../components/calendar/addEvent/AssignmentPanel";
import AddEventFooter from "../../components/calendar/addEvent/AddEventFooter";

const DEFAULT_FORM = {
  title: "",
  eventType: "Site Visit",
  priority: "Medium",
  eventDate: format(new Date(), "yyyy-MM-dd"),
  startTime: "10:00",
  endTime: "11:30",
  isAllDay: false,
  reminder: "30 minutes before",
  location: "",
  note: "",
  assignedTo: "",
  assignedRole: "",
  assignedId: null, // salespersons.id or territorypartner.id
  scheduleId: null,
  scheduleType: null,
};

/**
 * AddEvent — root page
 *
 * Endpoints (from EventController + routes):
 *   CREATE : POST   /salesapp/schedule-notes/add
 *   UPDATE : PUT    /salesapp/schedule-notes/update/:id
 *   DELETE : DELETE /salesapp/schedule-notes/delete?id=:id
 *   LIST   : GET    /salesapp/schedule-notes/all?projectPartnerId=:id
 *
 * Controller body fields:
 *   projectPartnerId, scheduleId, scheduleType, note, title,
 *   eventType, priority, eventDate, startTime, endTime, isAllDay,
 *   reminder, location, assignedTo, assignedRole, userId
 *
 * Props:
 *   eventId  : number | null  — if set, loads existing event and switches to edit mode
 *   onBack   : fn()
 *   onSave   : fn(savedData)
 *   onCancel : fn()
 */
export default function AddEvent({ eventId = null, onBack, onSave, onCancel }) {
  const { URI, user, role } = useAuth();
  const navigate = useNavigate();
  const isProjectPartner = role === "Project Partner";
  const getBasePath = () => {
    if (role === "Project Partner") return "/project-partner";
    if (role === "Territory Partner") return "/territory-partner";
    return "/sales"; // Sales Partner
  };

  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isEditMode = Boolean(eventId);

  // ── Load existing event when editing ────────────────────────────────────────
  useEffect(() => {
    if (!eventId || !user?.id) return;

    const load = async () => {
      try {
        const res = await fetch(`${URI}/project-partner/event/all`, {
          credentials: "include",
        });
        const data = await res.json();
        const events = Array.isArray(data) ? data : data.data || [];
        const evt = events.find(
          (e) => e.id === eventId || e.id === Number(eventId),
        );
        if (!evt) return;

        setForm({
          title: evt.title || "",
          eventType: evt.event_type || "Site Visit",
          priority: evt.priority || "Medium",
          eventDate: evt.event_date
            ? evt.event_date.split("T")[0]
            : format(new Date(), "yyyy-MM-dd"),
          startTime: evt.start_time || "10:00",
          endTime: evt.end_time || "11:30",
          isAllDay: Boolean(evt.is_all_day),
          reminder: evt.reminder || "30 minutes before",
          location: evt.location || "",
          note: evt.note || "",
          assignedTo: evt.assigned_to || "",
          assignedRole: evt.assigned_role || "",
          assignedId: evt.assigned_to_id || evt.assigned_id || null,
          scheduleId: evt.schedule_id || null,
          scheduleType: evt.schedule_type || null,
        });
      } catch (err) {
        console.error("Load event:", err);
      }
    };

    load();
  }, [eventId, user?.id, URI]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  // ── Validation ────────────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.title.trim()) return "Event title is required.";
    if (!form.eventDate) return "Date is required.";
    if (!form.startTime) return "Start time is required.";
    return "";
  };

  // ── Build payload matching controller exactly ─────────────────────────────────
  const buildPayload = () => ({
    projectPartnerId: user?.id,
    userId: user?.id,
    scheduleId: form.scheduleId || null,
    scheduleType: form.scheduleType || null,
    note: form.note || null,
    title: form.title,
    eventType: form.eventType,
    priority: form.priority,
    eventDate: form.eventDate,
    startTime: form.isAllDay ? null : form.startTime,
    endTime: form.isAllDay ? null : form.endTime,
    isAllDay: form.isAllDay ? 1 : 0,
    reminder: form.reminder || null,
    location: form.location || null,
    assignedTo: form.assignedTo || null,
    assignedRole: form.assignedRole || null,
    assignedId: form.assignedId || null,
    attachment: null,
  });

  // ── CREATE ────────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${URI}${getBasePath()}/event/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to save event.");

      setSuccess("Event saved successfully!");
      onSave?.(data);
      setTimeout(() => {
        setForm(DEFAULT_FORM);
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // ── UPDATE ────────────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = buildPayload();
      // updateNote controller uses: note, title, eventType, priority,
      // eventDate, startTime, endTime, isAllDay, reminder, location,
      // assignedTo, attachment
      const res = await fetch(
        `${URI}${getBasePath()}/event/update/${eventId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to update event.");

      setSuccess("Event updated successfully!");
      onSave?.(data);
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!eventId) return;
    if (!window.confirm("Delete this event?")) return;

    setDeleting(true);
    setError("");
    try {
      const res = await fetch(
        `${URI}${getBasePath()}/calendar/event/delete${eventId}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to delete event.");

      onSave?.({ deleted: true, id: eventId });
      handleBack();
    } catch (err) {
      setError(err.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = isEditMode ? handleUpdate : handleCreate;
  const handleBack = () => onBack?.() ?? navigate(-1);
  const handleCancel = () => onCancel?.() ?? navigate(-1);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <AddEventHeader
        onBack={handleBack}
        isEditMode={isEditMode}
        onDelete={isEditMode ? handleDelete : undefined}
        deleting={deleting}
      />

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
          {/* Success banner */}
          {success && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
              <svg
                className="w-4 h-4 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {success}
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
              <svg
                className="w-4 h-4 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Layout: 1 col mobile, 2 col desktop */}
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_360px] gap-5">
            {/* Left column */}
            <div className="flex flex-col gap-5 order-1">
              <EventBasicInfo data={form} onChange={handleChange} />
              <LocationNotes data={form} onChange={handleChange} />
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-5 order-2">
              <ScheduleDetails data={form} onChange={handleChange} />
              <AssignmentPanel data={form} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>

      <AddEventFooter
        onCancel={handleCancel}
        onSave={handleSave}
        saving={saving}
        isEditMode={isEditMode}
      />
    </div>
  );
}
