import { useState, useEffect } from "react";
import { useAuth } from "../../store/auth";
import { parse } from "date-fns";

import EmployeesHeader from "../../components/employees/EmployeesHeader";
import EmployeeStats from "../../components/employees/EmployeeStats";
import EmployeeTable from "../../components/employees/EmployeeTable";
import AddEmployee from "./AddEmployee";

/**
 * Employees Page
 *
 * - Departments, Roles tabs and Filter are now all inside <EmployeeTable />.
 * - This page only manages: employee CRUD, header search/date, AddEmployee view.
 */
export default function Employees() {
  const { URI } = useAuth();

  // ── View ──────────────────────────────────────────────────────────────────
  const [view, setView] = useState("list"); // "list" | "add" | "edit"
  const [editTarget, setEditTarget] = useState(null);

  // ── Tab (lifted so header tab-bar and table stay in sync) ─────────────────
  const [activeTab, setActiveTab] = useState("directory");

  // ── Search / date range ───────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [range, setRange] = useState([{ startDate: null, endDate: null, key: "selection" }]);

  // ── API data ──────────────────────────────────────────────────────────────
  const [employees, setEmployees] = useState([]);
  const [menus, setMenus] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  const credentials = "include";
  const headers = { "Content-Type": "application/json" };

  /* ── Search + date filter (dept/role filter lives inside EmployeeTable) ── */
  const filteredData = employees?.filter((item) => {
    const matchesSearch =
      item.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      item.contact?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase());

    let startDate = range[0].startDate;
    let endDate = range[0].endDate;
    if (startDate) startDate = new Date(startDate.setHours(0, 0, 0, 0));
    if (endDate) endDate = new Date(endDate.setHours(23, 59, 59, 999));
    const itemDate = parse(item.created_at, "dd MMM yyyy | hh:mm a", new Date());
    const matchesDate =
      (!startDate && !endDate) ||
      (startDate && endDate && itemDate >= startDate && itemDate <= endDate);

    return matchesSearch && matchesDate;
  });

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${URI}/project-partner/employees`, { method: "GET", credentials, headers });
      if (!res.ok) throw new Error("Failed to fetch employees");
      setEmployees(await res.json());
    } catch (err) { console.error(err); }
  };
  const fetchMenus = async () => {
    try {
      const res = await fetch(`${URI}/project-partner/employees/get/menus`, { method: "GET", credentials, headers });
      if (!res.ok) throw new Error("Failed to fetch menus");
      setMenus(await res.json());
    } catch (err) { console.error(err); }
  };
  const fetchRoles = async () => {
    try {
      const res = await fetch(`${URI}/project-partner/roles`, { method: "GET", credentials, headers });
      if (!res.ok) throw new Error("Failed to fetch roles");
      setRoles(await res.json());
    } catch (err) { console.error(err); }
  };
  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${URI}/project-partner/departments`, { method: "GET", credentials, headers });
      if (!res.ok) throw new Error("Failed to fetch departments");
      setDepartments(await res.json());
    } catch (err) { console.error(err); }
  };
  const fetchStates = async () => {
    try {
      const res = await fetch(`${URI}/admin/states`, { method: "GET", credentials, headers });
      if (!res.ok) throw new Error("Failed to fetch states");
      const data = await res.json();
      setStates(data.map((s) => s.state || s));
    } catch (err) { console.error(err); }
  };
  const fetchCities = async (stateName) => {
    try {
      const res = await fetch(`${URI}/admin/cities/${stateName}`, { method: "GET", credentials, headers });
      if (!res.ok) throw new Error("Failed to fetch cities");
      const data = await res.json();
      setCities(data.map((c) => c.city || c));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchEmployees();
    fetchMenus();
    fetchRoles();
    fetchDepartments();
    fetchStates();
  }, []);

  // ── Employee CRUD ─────────────────────────────────────────────────────────
  const handleSave = async (formData, isEditMode) => {
    const endpoint = isEditMode ? `edit/${formData.id}` : "add";
    try {
      setLoading(true);
      const res = await fetch(`${URI}/project-partner/employees/${endpoint}`, {
        method: isEditMode ? "PUT" : "POST", credentials, headers, body: JSON.stringify(formData),
      });
      if (res.status === 409) { alert("Employee already exists!"); return; }
      if (!res.ok) throw new Error("Failed to save employee");
      alert(isEditMode ? "Employee updated successfully!" : "Employee added successfully!");
      setView("list");
      setEditTarget(null);
      await fetchEmployees();
    } catch (err) { console.error(err); alert("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${URI}/project-partner/employees/delete/${id}`, { method: "DELETE", credentials });
      const data = await res.json();
      res.ok ? alert("Employee deleted successfully!") : alert(`Error: ${data.message}`);
      await fetchEmployees();
    } catch (err) { console.error(err); }
  };

  const handleToggleStatus = async (emp) => {
    try {
      const res = await fetch(`${URI}/project-partner/employees/status/${emp.id}`, { method: "PUT", credentials });
      const data = await res.json();
      res.ok ? alert(`Success: ${data.message}`) : alert(`Error: ${data.message}`);
      await fetchEmployees();
    } catch (err) { console.error(err); }
  };

  const handleAssignTask = async (emp, selectedMenus) => {
    try {
      setLoading(true);
      const res = await fetch(`${URI}/project-partner/employees/assign/tasks/${emp.id}`, {
        method: "PUT", credentials, headers, body: JSON.stringify({ menus: selectedMenus }),
      });
      const data = await res.json();
      res.ok ? alert(`Success: ${data.message}`) : alert(`Error: ${data.message}`);
      await fetchEmployees();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAssignLogin = async (emp, username, password) => {
    try {
      setLoading(true);
      const res = await fetch(`${URI}/project-partner/employees/assignlogin/${emp.id}`, {
        method: "PUT", credentials, headers,
        body: JSON.stringify({ selectedEmployeeId: emp.id, username, password }),
      });
      const data = await res.json();
      res.ok ? alert(`Success: ${data.message}`) : alert(`Error: ${data.message}`);
      await fetchEmployees();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const openAdd = () => { setEditTarget(null); setView("add"); };
  const openEdit = (emp) => { setEditTarget(emp); setView("edit"); };
  const goBack = () => { setView("list"); setEditTarget(null); };

  // ── Add / Edit view ───────────────────────────────────────────────────────
  if (view === "add" || view === "edit") {
    return (
      <AddEmployee
        editData={editTarget}
        states={states}
        cities={cities}
        roles={roles}
        departments={departments}
        loading={loading}
        onBack={goBack}
        onSave={handleSave}
        onStateChange={fetchCities}
      />
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <EmployeesHeader
        search={search}
        onSearch={setSearch}
        onAdd={openAdd}
        filteredData={filteredData}
        range={range}
        setRange={setRange}
      />

      <div className="flex-1 px-4 md:px-8 py-6 space-y-5">
        <EmployeeStats employees={filteredData} />

        <EmployeeTable
          globalFilter={search}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          employees={filteredData}
          menus={menus}
          departments={departments}
          roles={roles}
          URI={URI}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
          onAssignTask={handleAssignTask}
          onAssignLogin={handleAssignLogin}
        />
      </div>
    </div>
  );
}