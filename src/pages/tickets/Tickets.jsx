import { useState, useEffect } from "react";
import { parse } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";
import TicketsHeader from "../../components/tickets/TicketsHeader";
import TicketsStats from "../../components/tickets/TicketsStats";
import TicketsFilters from "../../components/tickets/TicketsFilters";
import TicketsTable from "../../components/tickets/TicketsTable";
import {
  ViewTicketModal,
  AddResponseModal,
} from "../../components/tickets/TicketsModals";

export default function Tickets() {
  const navigate = useNavigate();
  const {
    URI, role,
    setLoading,
    showTicket,
    setShowTicket,
    showResponseForm,
    setShowResponseForm,
  } = useAuth();

  const isProjectPartner = role === "Project Partner";
  const getBasePath = () => {
    if (role === "Project Partner") return "/project-partner";
    if (role === "Territory Partner") return "/territory-partner";
    return "/sales"; // Sales Partner
  };

  /* ── data ── */
  const [data, setData] = useState([]);
  const [ticket, setTicket] = useState({});

  /* ── form state (for response) ── */
  const [ticketResponse, setTicketResponse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [ticketId, setTicketId] = useState("");

  /* ── filters ── */
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenerator, setSelectedGenerator] = useState(
    "Select Ticket Generator",
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [range, setRange] = useState([
    { startDate: null, endDate: null, key: "selection" },
  ]);

  /* ── fetch ── */
  const fetchData = async () => {
    try {
      setLoading(true);
      const r = await fetch(
        `${URI}${getBasePath()}/tickets/get/${selectedGenerator}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!r.ok) throw new Error();
      const data = await r.json();
      setData(data);
      console.log(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    fetchData();
  }, [selectedGenerator]);

  /* ── view ticket ── */
  const viewTicket = async (id) => {
    try {
      const r = await fetch(`${URI}${getBasePath()}/tickets/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!r.ok) throw new Error();
      setTicket(await r.json());
      setShowTicket(true);
    } catch (e) {
      console.error(e);
    }
  };

  /* ── fetch response data ── */
  const fetchResponse = async (id) => {
    try {
      const r = await fetch(`${URI}${getBasePath()}/tickets/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setTicketResponse(d.response || "");
      setSelectedStatus(d.status);
    } catch (e) {
      console.error(e);
    }
  };

  /* ── add response ── */
  const addResponse = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const r = await fetch(
        `${URI}${getBasePath()}/tickets/response/add/${ticketId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketResponse, selectedStatus }),
        },
      );
      if (!r.ok) throw new Error();
      await fetchData();
      setSelectedStatus("");
      setTicketResponse("");
      alert("Response added!");
      setShowResponseForm(false);
    } catch (e) {
      console.error(e);
      alert("Failed to add response");
    } finally {
      setLoading(false);
    }
  };

  /* ── change status ── */
  const changeStatus = async (id, label) => {
    try {
      const r = await fetch(
        `${URI}${getBasePath()}/tickets/status/change/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: label }),
        },
      );
      const d = await r.json();
      if (d.updated && d.status === label) alert(`Status changed to ${label}`);
    } catch (e) {
      console.error(e);
    } finally {
      fetchData();
    }
  };

  /* ── delete ── */
  const del = async (id) => {
    if (!window.confirm("Delete this ticket?")) return;
    try {
      const r = await fetch(`${URI}${getBasePath()}/tickets/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const d = await r.json();
      r.ok ? (alert("Deleted!"), fetchData()) : alert(`Error: ${d.message}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ── action handler ── */
  const handleAction = (action, row) => {
    const id = row.ticketid;
    switch (action) {
      case "view":
        viewTicket(id);
        break;
      case "update":
        navigate(`/app/tickets/update/${id}`);
        break; // ← separate page
      case "addResponse":
        setTicketId(id);
        fetchResponse(id);
        setShowResponseForm(true);
        break;
      case "delete":
        del(id);
        break;
    }
  };

  /* ── filter ── */
  const filteredData = data.filter((item) => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      !s ||
      item.ticketno?.toLowerCase().includes(s) ||
      item.status?.toLowerCase().includes(s) ||
      item.issue?.toLowerCase().includes(s) ||
      item.admin_name?.toLowerCase().includes(s) ||
      item.department?.toLowerCase().includes(s) ||
      item.employee_name?.toLowerCase().includes(s);

    const matchStatus =
      !statusFilter ||
      item.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchPriority = !priorityFilter || item.priority === priorityFilter;
    const matchType = !typeFilter || item.issue === typeFilter;
    const matchEmployee =
      !employeeFilter || item.employee_name === employeeFilter;

    let start = range[0].startDate
      ? new Date(new Date(range[0].startDate).setHours(0, 0, 0, 0))
      : null;
    let end = range[0].endDate
      ? new Date(new Date(range[0].endDate).setHours(23, 59, 59, 999))
      : null;
    const itemDate = parse(
      item.created_at || "",
      "dd MMM yyyy | hh:mm a",
      new Date(),
    );
    const matchDate =
      (!start && !end) ||
      (start && end && itemDate >= start && itemDate <= end);

    return (
      matchSearch &&
      matchStatus &&
      matchPriority &&
      matchType &&
      matchEmployee &&
      matchDate
    );
  });

  /* ── live stats ── */
  const stats = {
    total: data.length,
    open: data.filter((d) => d.status === "Open").length,
    inProgress: data.filter((d) => d.status === "In Progress").length,
    resolved: data.filter((d) => d.status === "Resolved").length,
    highPriority: data.filter((d) => d.priority === "High").length,
    overdue: data.filter((d) => d.status === "Pending").length,
  };

  const employeeOptions = [
    ...new Set(data.map((d) => d.employee_name).filter(Boolean)),
  ];

  const resetFilters = () => {
    setStatusFilter("");
    setPriorityFilter("");
    setTypeFilter("");
    setEmployeeFilter("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header — image 2 */}
      <TicketsHeader
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onAdd={() => navigate("/app/tickets/add")} /* ← navigate to add page */
        range={range}
        setRange={setRange}
        selectedGenerator={selectedGenerator}
        setSelectedGenerator={setSelectedGenerator}
      />

      <div className="flex-1 px-5 md:px-8 py-6 space-y-5">
        {/* Stats — image 2 */}
        <TicketsStats stats={stats} />

        {/* Filters bar — image 1 */}
        <div className="bg-white rounded-[12px] border border-gray-100 shadow-sm px-5 py-4">
          <TicketsFilters
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            employeeOptions={employeeOptions}
            employeeFilter={employeeFilter}
            setEmployeeFilter={setEmployeeFilter}
            onReset={resetFilters}
          />
        </div>

        {/* Table — image 2 (desktop) / image 1 (mobile) */}
        <TicketsTable
          data={filteredData}
          onAction={handleAction}
          onChangeStatus={changeStatus}
          onViewTicket={viewTicket}
        />
      </div>

      {/* View ticket modal */}
      <ViewTicketModal
        show={showTicket}
        onClose={() => setShowTicket(false)}
        ticket={ticket}
      />

      {/* Add response modal */}
      <AddResponseModal
        show={showResponseForm}
        onClose={() => setShowResponseForm(false)}
        onSubmit={addResponse}
        ticketResponse={ticketResponse}
        setTicketResponse={setTicketResponse}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
      />
    </div>
  );
}
