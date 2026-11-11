import { useState, useEffect } from "react";
import { parse } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import BuildersHeader from "../../components/builders/BuildersHeader";
import LiveActivitySection from "../../components/builders/LiveActivitySection";
import NetworkSection from "../../components/builders/NetworkSection";
import { ViewBuilderModal } from "../../components/builders/BuilderModals";

/* ── Static live-activity feed ── */
const LIVE_ACTIVITY = [
  { name: "Urban Spaces",   time: "2m ago",  tag: "New Launch",    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c" },
  { name: "Skyline Const.", time: "15m ago", tag: "Site Progress", image: "https://images.unsplash.com/photo-1600607687644-c7f34a2bfc1b" },
  { name: "Nova Homes",     time: "1h ago",  tag: "Deal Closed",   image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa" },
  { name: "Eco Living",     time: "3h ago",  tag: "Brochure",      image: "https://images.unsplash.com/photo-1507089947367-19c1da9775ae" },
];

export default function Builders() {
  const navigate = useNavigate();
  const { URI, setLoading, showBuilder, setShowBuilder } = useAuth();

  /* ── data ── */
  const [datas, setDatas]     = useState([]);
  const [builder, setBuilder] = useState({});

  /* ── filter state ── */
  const [searchTerm, setSearchTerm]   = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter,  setCityFilter]  = useState("");
  const [range, setRange] = useState([{ startDate: null, endDate: null, key: "selection" }]);

  /* ── location lists ── */
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  /* ── fetch builders ── */
  const fetchData = async () => {
    try {
      const r = await fetch(`${URI}/project-partner/builders`, {
        method: "GET", credentials: "include", headers: { "Content-Type": "application/json" },
      });
      if (!r.ok) throw new Error();
      setDatas(await r.json());
    } catch (e) { console.error(e); }
  };

  /* ── fetch states from admin API ── */
  const fetchStates = async () => {
    try {
      const r = await fetch(`${URI}/admin/states`, {
        method: "GET", credentials: "include", headers: { "Content-Type": "application/json" },
      });
      if (r.ok) {
        const data = await r.json();
        setStates(data.map(s => s.state));
      }
    } catch (e) { console.error(e); }
  };

  /* ── fetch cities when state changes ── */
  const fetchCities = async (state) => {
    if (!state) { setCities([]); return; }
    try {
      const r = await fetch(`${URI}/admin/cities/${state}`, {
        method: "GET", credentials: "include", headers: { "Content-Type": "application/json" },
      });
      if (r.ok) {
        const data = await r.json();
        setCities(data.map(c => c.city));
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); fetchStates(); }, []);
  useEffect(() => { fetchCities(stateFilter); setCityFilter(""); }, [stateFilter]);

  /* ── view builder details ── */
  const viewBuilder = async (builderid) => {
    try {
      const r = await fetch(`${URI}/project-partner/builders/${builderid}`, {
        method: "GET", credentials: "include", headers: { "Content-Type": "application/json" },
      });
      if (!r.ok) throw new Error();
      setBuilder(await r.json()); setShowBuilder(true);
    } catch (e) { console.error(e); }
  };

  /* ── delete ── */
  const del = async (builderid) => {
    if (!window.confirm("Delete this builder?")) return;
    try {
      const r = await fetch(`${URI}/project-partner/builders/delete/${builderid}`, {
        method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" },
      });
      const d = await r.json();
      r.ok ? (alert("Deleted!"), fetchData()) : alert(`Error: ${d.message}`);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  /* ── status toggle ── */
  const statusToggle = async (builderid) => {
    if (!window.confirm("Change status?")) return;
    try {
      const r = await fetch(`${URI}/project-partner/builders/status/${builderid}`, {
        method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
      });
      const d = await r.json();
      alert(r.ok ? `Success: ${d.message}` : `Error: ${d.message}`);
      fetchData();
    } catch (e) { console.error(e); }
  };

  /* ── action handler ── */
  const handleAction = (action, builderid) => {
    switch (action) {
      case "view":   viewBuilder(builderid); break;
      case "edit":   navigate(`/app/builder/update/${builderid}`); break;
      case "status": statusToggle(builderid); break;
      case "delete": del(builderid); break;
    }
  };

  /* ── filter data ── */
  const filteredData = datas.filter((item) => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s ||
      item.company_name?.toLowerCase().includes(s)    ||
      item.contact_person?.toLowerCase().includes(s)  ||
      item.contact?.toLowerCase().includes(s)         ||
      item.email?.toLowerCase().includes(s)           ||
      item.registration_no?.toLowerCase().includes(s) ||
      item.status?.toLowerCase().includes(s);

    let start = range[0].startDate ? new Date(new Date(range[0].startDate).setHours(0,0,0,0))    : null;
    let end   = range[0].endDate   ? new Date(new Date(range[0].endDate).setHours(23,59,59,999)) : null;
    const itemDate  = parse(item.created_at || "", "dd MMM yyyy | hh:mm a", new Date());
    const matchDate = (!start && !end) || (start && end && itemDate >= start && itemDate <= end);

    /* State filter — match against builder's state field or office_address */
    const matchState = !stateFilter ||
      item.state?.toLowerCase() === stateFilter.toLowerCase() ||
      item.office_address?.toLowerCase().includes(stateFilter.toLowerCase());

    /* City filter */
    const matchCity = !cityFilter ||
      item.city?.toLowerCase() === cityFilter.toLowerCase() ||
      item.office_address?.toLowerCase().includes(cityFilter.toLowerCase());

    return matchSearch && matchDate && matchState && matchCity;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <BuildersHeader
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onAdd={() => navigate("/app/builder/add")}
        range={range}
        setRange={setRange}
        stateFilter={stateFilter}
        setStateFilter={setStateFilter}
        states={states}
        cityFilter={cityFilter}
        setCityFilter={setCityFilter}
        cities={cities}
      />

      <div className="hidden">
        <LiveActivitySection items={LIVE_ACTIVITY} />
      </div>

      <NetworkSection builders={filteredData} onAction={handleAction} />

      {/* View modal — add/edit are full pages */}
      <ViewBuilderModal
        show={showBuilder}
        onClose={() => setShowBuilder(false)}
        builder={builder}
      />
    </div>
  );
}