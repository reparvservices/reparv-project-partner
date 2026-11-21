/**
 * Venue Booking API for the project partner panel (a venue is a property type).
 * Every call throws an Error with the server's message on failure.
 */
export function venueApi(URI) {
  const call = async (path = "", options = {}) => {
    const res = await fetch(`${URI}/projectpartner/venues${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) throw new Error(data.message || "Request failed");
    return data;
  };

  return {
    list: async () => (await call("")).listings || [],
    get: async (id) => (await call(`/${id}`)).listing,
    bookings: async () => (await call("/bookings")).bookings || [],

    /** Create (id empty) or update, then optionally submit a draft / rejected listing for approval */
    save: async (id, body, submit = false) => {
      const res = id
        ? await call(`/${id}`, { method: "PUT", body: JSON.stringify(body) })
        : await call("", { method: "POST", body: JSON.stringify(body) });
      let listing = res.listing;
      if (submit && listing && ["draft", "rejected"].includes(listing.status)) {
        listing = (await call(`/${listing.id}/submit`, { method: "POST" })).listing || listing;
      }
      return listing;
    },

    action: async (id, action) => (await call(`/${id}/${action}`, { method: "POST" })).listing,
    block: (id, body) => call(`/${id}/block`, { method: "POST", body: JSON.stringify(body) }),
    unblock: (id, body) => call(`/${id}/unblock`, { method: "POST", body: JSON.stringify(body) }),
    cancelBooking: (bookingId, reason = "Cancelled by owner") =>
      call(`/bookings/${bookingId}/cancel`, { method: "POST", body: JSON.stringify({ reason }) }),
  };
}
