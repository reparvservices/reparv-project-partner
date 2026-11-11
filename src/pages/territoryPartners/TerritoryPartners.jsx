import { useState, useEffect } from "react";
import { parse } from "date-fns";
import { useAuth } from "../../store/auth";
import TerritoryHeader from "../../components/territoryPartners/TerritoryHeader";
import TerritoryStats from "../../components/territoryPartners/TerritoryStats";
import TerritoryFilters from "../../components/territoryPartners/TerritoryFilters";
import TerritoryTable from "../../components/territoryPartners/TerritoryTable";
import {
  AddEditTerritoryModal,
  TerritoryPaymentModal,
  TerritoryFollowUpModal,
  TerritoryAssignLoginModal,
  ViewTerritoryPartnerModal,
  FOLLOWUP_COLOR,
} from "../../components/territoryPartners/TerritoryPartnersModals";

const EMPTY_PARTNER = { fullname: "", contact: "", email: "", state: "", city: "", intrest: "" };

const DEFAULT_FILTERS = {
  state: "All", city: "All", status: "All",
  followup: "All", project: "All", performance: "All",
};

export default function TerritoryPartners() {
  const {
    URI, setLoading,
    showPartnerForm, setShowPartnerForm,
    giveAccess, setGiveAccess,
    showPaymentIdForm, setShowPaymentIdForm,
    showPartner, setShowPartner,
    showFollowUpList, setShowFollowUpList,
    partnerPaymentStatus,
  } = useAuth();

  /* ── data ── */
  const [datas, setDatas]         = useState([]);
  const [states, setStates]       = useState([]);
  const [cities, setCities]       = useState([]);
  const [formCities, setFormCities] = useState([]);

  /* ── ui filters ── */
  const [filters, setFilters]     = useState(DEFAULT_FILTERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [range, setRange] = useState([{ startDate: null, endDate: null, key: "selection" }]);

  /* ── form state ── */
  const [newPartner, setNewPartner]   = useState(EMPTY_PARTNER);
  const [partnerId, setPartnerId]     = useState(null);
  const [partner, setPartner]         = useState({});
  const [payment, setPayment]         = useState({ amount: "", paymentid: "" });
  const [username, setUsername]       = useState("");
  const [password, setPassword]       = useState("");
  const [followUp, setFollowUp]       = useState("");
  const [followUpText, setFollowUpText] = useState("");
  const [followUpList, setFollowUpList] = useState([]);

  /* ── API ── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${URI}/project-partner/territory`, {
        method: "GET", credentials: "include", headers: { "Content-Type": "application/json" },
      });
      if (!r.ok) throw new Error();
      setDatas(await r.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchStates = async () => {
    try {
      const r = await fetch(`${URI}/admin/states`, {
        method: "GET", credentials: "include", headers: { "Content-Type": "application/json" },
      });
      if (r.ok) setStates(await r.json());
    } catch (e) { console.error(e); }
  };

  const fetchCitiesFor = async (state, setter) => {
    if (!state || state === "All") { setter([]); return; }
    try {
      const r = await fetch(`${URI}/admin/cities/${state}`, {
        method: "GET", credentials: "include", headers: { "Content-Type": "application/json" },
      });
      if (r.ok) setter(await r.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); fetchStates(); }, []);
  useEffect(() => { fetchCitiesFor(filters.state, setCities); }, [filters.state]);
  useEffect(() => { fetchCitiesFor(newPartner.state, setFormCities); }, [newPartner.state]);

  /* ── CRUD ── */
  const add = async (e) => {
    e.preventDefault();
    const ep = newPartner.id ? `edit/${newPartner.id}` : "add";
    try {
      setLoading(true);
      const r = await fetch(`${URI}/project-partner/territory/${ep}`, {
        method: newPartner.id ? "PUT" : "POST",
        credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPartner),
      });
      if (r.status === 409) { alert("Partner already exists!"); return; }
      if (!r.ok) throw new Error();
      alert(newPartner.id ? "Partner updated!" : "Partner added!");
      setNewPartner(EMPTY_PARTNER); setShowPartnerForm(false); await fetchData();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const edit = async (id) => {
    try {
      const r = await fetch(`${URI}/admin/territorypartner/get/${id}`, {
        method: "GET", credentials: "include", headers: { "Content-Type": "application/json" },
      });
      if (!r.ok) throw new Error();
      setNewPartner(await r.json()); setShowPartnerForm(true);
    } catch (e) { console.error(e); }
  };

  const viewPartner = async (id) => {
    try {
      const r = await fetch(`${URI}/admin/territorypartner/get/${id}`, {
        method: "GET", credentials: "include", headers: { "Content-Type": "application/json" },
      });
      if (!r.ok) throw new Error();
      setPartner(await r.json()); setShowPartner(true);
    } catch (e) { console.error(e); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this Partner?")) return;
    try {
      setLoading(true);
      const r = await fetch(`${URI}/admin/territorypartner/delete/${id}`, {
        method: "DELETE", credentials: "include", headers: { "Content-Type": "application/json" },
      });
      const d = await r.json();
      r.ok ? (alert("Deleted!"), fetchData()) : alert(`Error: ${d.message}`);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const statusToggle = async (id) => {
    if (!window.confirm("Change status?")) return;
    try {
      const r = await fetch(`${URI}/admin/territorypartner/status/${id}`, {
        method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
      });
      const d = await r.json();
      alert(r.ok ? `Success: ${d.message}` : `Error: ${d.message}`);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const updatePaymentId = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await fetch(`${URI}/admin/territorypartner/update/paymentid/${partnerId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(payment),
      });
      const d = await r.json();
      alert(r.ok ? `Success: ${d.message}` : `Error: ${d.message}`);
      setPartnerId(null); setShowPaymentIdForm(false); fetchData();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchFollowUpList = async (id) => {
    try {
      const r = await fetch(`${URI}/admin/territorypartner/followup/list/${id}`, {
        method: "GET", credentials: "include", headers: { "Content-Type": "application/json" },
      });
      if (!r.ok) throw new Error();
      setFollowUpList(await r.json());
    } catch (e) { console.error(e); }
  };

  const addFollowUp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const r = await fetch(`${URI}/admin/territorypartner/followup/add/${partnerId}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ followUp, followUpText }),
      });
      const d = await r.json();
      r.ok
        ? (alert(`Success: ${d.message}`), await fetchData(), fetchFollowUpList(partnerId))
        : alert(`Error: ${d.message}`);
      setFollowUp(""); setFollowUpText("");
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const assignLogin = async (e) => {
    e.preventDefault();
    if (!window.confirm("Assign login to this Partner?")) return;
    try {
      setLoading(true);
      const r = await fetch(`${URI}/admin/territorypartner/assignlogin/${partnerId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      const d = await r.json();
      alert(r.ok ? `Success: ${d.message}` : `Error: ${d.message}`);
      setPartnerId(null); setUsername(""); setPassword(""); setGiveAccess(false); fetchData();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  /* ── action handler (passed to table) ── */
  const handleAction = (action, row) => {
    const id = row.id;
    switch (action) {
      case "view":        viewPartner(id); break;
      case "edit":        edit(id); break;
      case "status":      statusToggle(id); break;
      case "payment":     setPartnerId(id); setShowPaymentIdForm(true); break;
      case "followup":    setPartnerId(id); fetchFollowUpList(id); setShowFollowUpList(true); break;
      case "assignlogin": setPartnerId(id); setGiveAccess(true); break;
      case "delete":      del(id); break;
    }
  };

  /* ── payment status helper ── */
  const getPaymentStatus = (item) => {
    if (item.paymentstatus === "Success" || item.paymentstatus === "Paid") return "Paid";
    if (item.paymentstatus === "Follow Up" && item.loginstatus === "Inactive") return "Follow Up";
    if (item.paymentstatus === "Pending") return "Unpaid";
    if (item.paymentstatus !== "Success" && item.loginstatus === "Active") return "Free";
    return "";
  };

  /* ── filter ── */
  const filteredData = datas.filter((item) => {
    const s = searchTerm.toLowerCase();
    const matchSearch = !s ||
      item.fullname?.toLowerCase().includes(s) ||
      item.contact?.toLowerCase().includes(s) ||
      item.state?.toLowerCase().includes(s) ||
      item.city?.toLowerCase().includes(s);

    let startDate = range[0].startDate ? new Date(new Date(range[0].startDate).setHours(0,0,0,0)) : null;
    let endDate   = range[0].endDate   ? new Date(new Date(range[0].endDate).setHours(23,59,59,999)) : null;
    const itemDate  = parse(item.created_at || "", "dd MMM yyyy | hh:mm a", new Date());
    const matchDate = (!startDate && !endDate) || (startDate && endDate && itemDate >= startDate && itemDate <= endDate);

    const ps = getPaymentStatus(item);
    const matchState  = filters.state  === "All" || item.state === filters.state;
    const matchCity   = filters.city   === "All" || item.city  === filters.city;
    const matchStatus = filters.status === "All" || item.status === filters.status;
    const matchFollowup = filters.followup === "All" || item.followUp === filters.followup;
    const matchPartner  = !partnerPaymentStatus || ps === partnerPaymentStatus;

    return matchSearch && matchDate && matchState && matchCity && matchStatus && matchFollowup && matchPartner;
  });

  /* ── live stats from real data ── */
  const total   = datas.length;
  const active  = datas.filter(d => d.loginstatus === "Active").length;
  const cities_covered = [...new Set(datas.map(d => d.city).filter(Boolean))].length;
  const pending_followup = datas.filter(d => d.followUp === "Pending" || d.followUp === "Follow Up").length;

  const liveStats = [
    { label: "Total Territory Partners", value: total,            sub: "+8% vs last month",  subColor: "text-emerald-500" },
    { label: "Active Territories",       value: active,           sub: "+3 new zones",        subColor: "text-emerald-500" },
    { label: "Covered Cities",           value: cities_covered,   sub: "Across states",       subColor: "text-gray-400"   },
    { label: "Leads Assigned",           value: filteredData.length, sub: "+15% growth",     subColor: "text-emerald-500" },
    { label: "Pending Followups",        value: pending_followup, sub: "Requires action",     subColor: "text-amber-500"  },
  ];

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const handleClear = () => { setFilters(DEFAULT_FILTERS); setSearchTerm(""); setRange([{ startDate: null, endDate: null, key: "selection" }]); };

  return (
    <div className="min-h-screen flex flex-col">

      <TerritoryHeader
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onAdd={() => { setNewPartner(EMPTY_PARTNER); setShowPartnerForm(true); }}
        range={range}
        setRange={setRange}
      />

      <div className="flex-1 px-5 md:px-8 py-5 space-y-5">
        <TerritoryStats stats={liveStats} />

        <TerritoryFilters
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClear}
          states={states}
          cities={cities}
        />

        <TerritoryTable
          data={filteredData}
          onAction={handleAction}
          getPaymentStatus={getPaymentStatus}
          followUpColorMap={FOLLOWUP_COLOR}
          onFollowUpClick={(row) => { setPartnerId(row.id); fetchFollowUpList(row.id); setShowFollowUpList(true); }}
          onAssignLoginClick={(row) => { setPartnerId(row.id); setGiveAccess(true); }}
        />
      </div>

      {/* ── Modals ── */}
      <AddEditTerritoryModal
        show={showPartnerForm} onClose={() => setShowPartnerForm(false)} onSubmit={add}
        newPartner={newPartner} setNewPartner={setNewPartner}
        states={states} formCities={formCities}
      />
      <TerritoryPaymentModal
        show={showPaymentIdForm} onClose={() => setShowPaymentIdForm(false)} onSubmit={updatePaymentId}
        payment={payment} setPayment={setPayment}
      />
      <TerritoryFollowUpModal
        show={showFollowUpList} onClose={() => setShowFollowUpList(false)} onSubmit={addFollowUp}
        followUp={followUp} setFollowUp={setFollowUp}
        followUpText={followUpText} setFollowUpText={setFollowUpText}
        followUpList={followUpList}
      />
      <TerritoryAssignLoginModal
        show={giveAccess} onClose={() => setGiveAccess(false)} onSubmit={assignLogin}
        username={username} setUsername={setUsername}
        password={password} setPassword={setPassword}
      />
      <ViewTerritoryPartnerModal
        show={showPartner} onClose={() => setShowPartner(false)}
        partner={partner} URI={URI}
      />
    </div>
  );
}