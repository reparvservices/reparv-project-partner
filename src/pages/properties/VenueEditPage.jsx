import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../store/auth";
import { venueApi } from "../../lib/venueApi";
import VenueFormShell from "../../components/properties/addProperty/VenueFormShell";

/** /app/property/venue/:id/edit : edit a Venue Booking property */
export default function VenueEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { URI, setLoading } = useAuth();
  const api = useMemo(() => venueApi(URI), [URI]);

  const [listing, setListing] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get(id)
      .then((l) => !cancelled && setListing(l))
      .catch((err) => !cancelled && setError(err.message || "Could not load this venue."));
    return () => {
      cancelled = true;
    };
  }, [api, id]);

  const back = () => navigate(`/app/properties/venue/${id}`);

  const save = async (body, submit) => {
    await api.save(id, body, submit);
    alert(submit ? "Venue submitted for approval!" : "Venue updated.");
    back();
  };

  if (error) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <p className="font-semibold text-gray-900">{error}</p>
        <button type="button" onClick={() => navigate("/app/properties")} className="mt-5 rounded-full bg-[#5E23DC] px-5 py-2.5 text-sm font-semibold text-white cursor-pointer">
          Back to properties
        </button>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-400">
        Loading venue…
      </div>
    );
  }

  return (
    <VenueFormShell
      key={listing.id}
      editing
      initial={listing}
      onSave={save}
      onCancel={back}
      setBusy={setLoading}
    />
  );
}
