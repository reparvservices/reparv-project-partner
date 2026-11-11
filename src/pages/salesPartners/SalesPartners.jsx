import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { parse } from "date-fns";
import { useAuth } from "../../store/auth";
import FiltersBar from "../../components/salesPartners/FiltersBar";
import PartnersTable from "../../components/salesPartners/PartnersTable";
import SalesPartnersHeader from "../../components/salesPartners/SalesPartnersHeader";
import StatsCards from "../../components/salesPartners/StatsCards";
import {
  AddEditModal, PaymentModal, FollowUpModal,
  AssignLoginModal, ViewPartnerModal,
  FOLLOWUP_COLOR,
} from "../../components/salesPartners/SalesPartnersModals";

const EMPTY_SP = { fullname: "", contact: "", email: "", state: "", city: "", intrest: "" };

export default function SalesPartners() {
  const navigate = useNavigate();
  const {
    URI, setLoading,
    giveAccess, setGiveAccess,
    showPaymentIdForm, setShowPaymentIdForm,
    showSalesPerson, setShowSalesPerson,
    showFollowUpList, setShowFollowUpList,
    partnerPaymentStatus,
  } = useAuth();

  /* ── data ── */
  const [datas, setDatas]         = useState([]);
  const [states, setStates]       = useState([]);
  const [cities, setCities]       = useState([]);   // filter cities
  const [formCities, setFormCities] = useState([]); // form cities

  /* ── filters ── */
  const [searchTerm, setSearchTerm]       = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [followupFilter, setFollowupFilter] = useState("");
  const [stateFilter, setStateFilter]     = useState("");
  const [cityFilter, setCityFilter]       = useState("");
  const [range, setRange] = useState([{ startDate: null, endDate: null, key: "selection" }]);

  /* ── form state ── */
  const [showSalesForm, setShowSalesForm]   = useState(false);
  const [newSalesPerson, setNewSalesPerson] = useState(EMPTY_SP);
  const [salesPersonId, setSalesPersonId]   = useState(null);
  const [partner, setPartner]               = useState({});
  const [payment, setPayment]               = useState({ amount: "", paymentid: "" });
  const [username, setUsername]             = useState("");
  const [password, setPassword]             = useState("");
  const [followUp, setFollowUp]             = useState("");
  const [followUpText, setFollowUpText]     = useState("");
  const [followUpList, setFollowUpList]     = useState([]);

  /* ── API ── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${URI}/project-partner/sales`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
      if (!r.ok) throw new Error(); setDatas(await r.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchStates = async () => {
    try {
      const r = await fetch(`${URI}/admin/states`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
      if (r.ok) setStates(await r.json());
    } catch (e) { console.error(e); }
  };

  const fetchCitiesFor = async (state, setter) => {
    if (!state) { setter([]); return; }
    try {
      const r = await fetch(`${URI}/admin/cities/${state}`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
      if (r.ok) setter(await r.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); fetchStates(); }, []);
  useEffect(() => { fetchCitiesFor(stateFilter, setCities); setCityFilter(""); }, [stateFilter]);
  useEffect(() => { fetchCitiesFor(newSalesPerson.state, setFormCities); }, [newSalesPerson.state]);

  /* ── CRUD ── */
  const add = async (e) => {
    e.preventDefault();
    const ep = newSalesPerson.salespersonsid ? `edit/${newSalesPerson.salespersonsid}` : "add";
    try {
      setLoading(true);
      const r = await fetch(`${URI}/project-partner/sales/${ep}`, {
        method: newSalesPerson.salespersonsid ? "PUT" : "POST",
        credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSalesPerson),
      });
      if (r.status === 409) { alert("Sales Person already exists!"); return; }
      if (!r.ok) throw new Error();
      alert(newSalesPerson.salespersonsid ? "Updated!" : "Added!");
      setNewSalesPerson(EMPTY_SP); setShowSalesForm(false); await fetchData();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const edit = async (id) => {
    try {
      const r = await fetch(`${URI}/admin/salespersons/get/${id}`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
      if (!r.ok) throw new Error();
      setNewSalesPerson(await r.json()); setShowSalesForm(true);
    } catch (e) { console.error(e); }
  };

  const viewSalesPerson = async (id) => {
    try {
      const r = await fetch(`${URI}/admin/salespersons/get/${id}`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
      if (!r.ok) throw new Error();
      setPartner(await r.json()); setShowSalesPerson(true);
    } catch (e) { console.error(e); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this Sales Person?")) return;
    try {
      const r = await fetch(`${URI}/admin/salespersons/delete/${id}`, { method: "DELETE", credentials: "include" });
      const d = await r.json();
      r.ok ? (alert("Deleted!"), fetchData()) : alert(`Error: ${d.message}`);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const statusToggle = async (id) => {
    if (!window.confirm("Change status?")) return;
    try {
      const r = await fetch(`${URI}/admin/salespersons/status/${id}`, { method: "PUT", credentials: "include" });
      const d = await r.json();
      alert(r.ok ? `Success: ${d.message}` : `Error: ${d.message}`); fetchData();
    } catch (e) { console.error(e); }
  };

  const updatePaymentId = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await fetch(`${URI}/admin/salespersons/update/paymentid/${salesPersonId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify(payment),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      alert(`Success: ${d.message}`); setSalesPersonId(null); setShowPaymentIdForm(false); fetchData();
    } catch (e) { console.error(e); alert(`Error: ${e.message}`); } finally { setLoading(false); }
  };

  const fetchFollowUpList = async (id) => {
    try {
      const r = await fetch(`${URI}/admin/salespersons/followup/list/${id}`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
      if (!r.ok) throw new Error(); setFollowUpList(await r.json());
    } catch (e) { console.error(e); }
  };

  const addFollowUp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const r = await fetch(`${URI}/admin/salespersons/followup/add/${salesPersonId}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ followUp, followUpText }),
      });
      const d = await r.json();
      r.ok ? (alert(`Success: ${d.message}`), await fetchData(), fetchFollowUpList(salesPersonId)) : alert(`Error: ${d.message}`);
      setFollowUp(""); setFollowUpText("");
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const assignLogin = async (e) => {
    e.preventDefault();
    if (!window.confirm("Assign login to this Sales Person?")) return;
    try {
      setLoading(true);
      const r = await fetch(`${URI}/admin/salespersons/assignlogin/${salesPersonId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ salesPersonId, username, password }),
      });
      const d = await r.json();
      alert(r.ok ? `Success: ${d.message}` : `Error: ${d.message}`);
      setSalesPersonId(null); setUsername(""); setPassword(""); setGiveAccess(false); fetchData();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  /* ── table action handler ── */
  const handleAction = (action, row) => {
    const id = row.salespersonsid;
    switch (action) {
      case "view":        viewSalesPerson(id); break;
      case "edit":        edit(id); break;
      case "status":      statusToggle(id); break;
      case "payment":     setSalesPersonId(id); setShowPaymentIdForm(true); break;
      case "followup":    setSalesPersonId(id); fetchFollowUpList(id); setShowFollowUpList(true); break;
      case "assignlogin": setSalesPersonId(id); setGiveAccess(true); break;
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

  /* ── filtered data ── */
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
    return (
      matchSearch && matchDate &&
      (!paymentFilter  || ps === paymentFilter) &&
      (!followupFilter || item.followUp === followupFilter) &&
      (!stateFilter    || item.state    === stateFilter) &&
      (!cityFilter     || item.city     === cityFilter) &&
      (!partnerPaymentStatus || ps === partnerPaymentStatus)
    );
  });

  const clearFilters = () => {
    setSearchTerm(""); setPaymentFilter(""); setFollowupFilter("");
    setStateFilter(""); setCityFilter("");
    setRange([{ startDate: null, endDate: null, key: "selection" }]);
  };

  /* ── live stats ── */
  const total   = datas.length;
  const active  = datas.filter(d => d.loginstatus === "Active").length;
  const paid    = datas.filter(d => d.paymentstatus === "Success" || d.paymentstatus === "Paid").length;
  const pending = datas.filter(d => d.paymentstatus === "Pending").length;

  const liveStats = [
    { label: "Total Partners",   value: total,   sub: "+12%",  subSuffix: " from last month", subGreen: true },
    { label: "Active Partners",  value: active,  sub: `${total ? Math.round((active/total)*100) : 0}% engaged`, subSuffix: "", subGreen: "violet" },
    { label: "Paid Partners",    value: paid,    sub: "+5%",   subSuffix: " conversion",      subGreen: true },
    { label: "Pending Payments", value: pending, sub: `${pending} invoices pending`, subSuffix: "", subGreen: false },
    { label: "Leads Converted",  value: active,  sub: "+24%",  subSuffix: " vs average",      subGreen: true },
  ];

  return (
    <div className="min-h-screen flex flex-col">

      <SalesPartnersHeader
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onAdd={() => { setNewSalesPerson(EMPTY_SP); setShowSalesForm(true); }}
        range={range}
        setRange={setRange}
      />

      <div className="flex-1 px-5 md:px-8 py-7 space-y-6">
        <StatsCards stats={liveStats} />

        <FiltersBar
          paymentFilter={paymentFilter}   setPaymentFilter={setPaymentFilter}
          followupFilter={followupFilter} setFollowupFilter={setFollowupFilter}
          stateFilter={stateFilter}       setStateFilter={setStateFilter}
          cityFilter={cityFilter}         setCityFilter={setCityFilter}
          states={states} cities={cities}
          onClear={clearFilters}
        />

        <PartnersTable
          data={filteredData}
          onAction={handleAction}
          getPaymentStatus={getPaymentStatus}
          followUpColorMap={FOLLOWUP_COLOR}
          onFollowUpClick={(row) => { setSalesPersonId(row.salespersonsid); fetchFollowUpList(row.salespersonsid); setShowFollowUpList(true); }}
          onAssignLoginClick={(row) => { setSalesPersonId(row.salespersonsid); setGiveAccess(true); }}
        />
      </div>

      {/* ── Modals ── */}
      <AddEditModal
        show={showSalesForm} onClose={() => setShowSalesForm(false)} onSubmit={add}
        newSalesPerson={newSalesPerson} setNewSalesPerson={setNewSalesPerson}
        states={states} formCities={formCities}
      />
      <PaymentModal
        show={showPaymentIdForm} onClose={() => setShowPaymentIdForm(false)} onSubmit={updatePaymentId}
        payment={payment} setPayment={setPayment}
      />
      <FollowUpModal
        show={showFollowUpList} onClose={() => setShowFollowUpList(false)} onSubmit={addFollowUp}
        followUp={followUp} setFollowUp={setFollowUp}
        followUpText={followUpText} setFollowUpText={setFollowUpText}
        followUpList={followUpList}
      />
      <AssignLoginModal
        show={giveAccess} onClose={() => setGiveAccess(false)} onSubmit={assignLogin}
        username={username} setUsername={setUsername}
        password={password} setPassword={setPassword}
      />
      <ViewPartnerModal
        show={showSalesPerson} onClose={() => setShowSalesPerson(false)}
        partner={partner} URI={URI}
      />
    </div>
  );
}