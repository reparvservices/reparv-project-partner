import { useMemo, useState, useEffect, useRef } from "react";
import {
  ChevronUp,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  Filter,
  Phone,
  FileText,
  KeyRound,
  RefreshCw,
  ClipboardList,
  Plus,
  Search,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { FaEdit, FaTrash, FaToggleOn } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { FiMoreVertical } from "react-icons/fi";
import DataTable from "react-data-table-component";
import { useAuth } from "../../store/auth";

const GRADIENT = "linear-gradient(110.73deg, #5E23DC 0%, #7C3AED 100%)";
const PAGE_SIZE = 5;

const TABS = [
  { key: "directory", label: "Directory" },
  { key: "departments", label: "Departments" },
  { key: "roles", label: "Roles" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   EmployeeFilter — department + role filter popover (lives inside table header)
───────────────────────────────────────────────────────────────────────────── */
function EmployeeFilter({
  departments,
  roles,
  selectedDept,
  selectedRole,
  onDeptChange,
  onRoleChange,
  onClear,
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("department");
  const ref = useRef(null);
  const hasFilter = selectedDept || selectedRole;

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-2 h-[36px] border rounded-[8px] py-2 px-3 text-sm cursor-pointer select-none transition-colors
          ${hasFilter ? "border-violet-400 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
      >
        <SlidersHorizontal
          size={14}
          className={hasFilter ? "text-violet-600" : "text-gray-500"}
        />
        <span className="font-medium hidden sm:block">Filter</span>
        {hasFilter && (
          <span className="text-xs font-semibold max-w-[120px] truncate hidden sm:block">
            {[selectedDept, selectedRole].filter(Boolean).join(", ")}
          </span>
        )}
        {hasFilter && (
          <X
            size={13}
            className="text-violet-500 hover:text-red-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[42px] w-[230px] bg-white shadow-lg border border-gray-100 rounded-[12px] overflow-hidden z-30">
          <div className="flex border-b border-gray-100">
            {["department", "role"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-semibold capitalize transition-colors
                  ${tab === t ? "text-violet-600 border-b-2 border-violet-600 bg-violet-50" : "text-gray-400 hover:bg-gray-50"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="max-h-[200px] overflow-y-auto py-1">
            {tab === "department" &&
              (departments.length === 0 ? (
                <p className="text-xs text-center text-gray-400 py-4">
                  No departments
                </p>
              ) : (
                departments.map((d, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      onDeptChange(selectedDept === d ? "" : d);
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm hover:bg-gray-50 transition-colors
                    ${selectedDept === d ? "bg-violet-50 text-violet-700 font-semibold" : "text-gray-700"}`}
                  >
                    <input
                      type="radio"
                      name="dept-filter"
                      checked={selectedDept === d}
                      onChange={() => {}}
                      className="accent-violet-600 cursor-pointer"
                    />
                    {d}
                  </div>
                ))
              ))}
            {tab === "role" &&
              (roles.length === 0 ? (
                <p className="text-xs text-center text-gray-400 py-4">
                  No roles
                </p>
              ) : (
                roles.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      onRoleChange(selectedRole === r ? "" : r);
                    }}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm hover:bg-gray-50 transition-colors
                    ${selectedRole === r ? "bg-violet-50 text-violet-700 font-semibold" : "text-gray-700"}`}
                  >
                    <input
                      type="radio"
                      name="role-filter"
                      checked={selectedRole === r}
                      onChange={() => {}}
                      className="accent-violet-600 cursor-pointer"
                    />
                    {r}
                  </div>
                ))
              ))}
          </div>
          {hasFilter && (
            <div className="border-t border-gray-100 px-4 py-2">
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
                className="text-xs text-red-500 hover:text-red-700 font-medium w-full text-left"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Shared DataTable styles — matches violet/gray theme
───────────────────────────────────────────────────────────────────────────── */
const tableStyles = {
  rows: {
    style: {
      padding: "6px 0",
      fontSize: "13.5px",
      fontWeight: 500,
      color: "#111827",
    },
  },
  headCells: {
    style: {
      fontSize: "10.5px",
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      backgroundColor: "#F9FAFB",
      color: "#6B7280",
    },
  },
  cells: { style: { fontSize: "13px", color: "#1F2937" } },
};

/* ─────────────────────────────────────────────────────────────────────────────
   Slide-up Form Modal — used by both Department & Role
───────────────────────────────────────────────────────────────────────────── */
function SlideForm({
  show,
  title,
  fieldLabel,
  fieldPlaceholder,
  value,
  onChange,
  onSubmit,
  onClose,
  loading,
  isEdit,
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-end md:items-center justify-center bg-black/30 z-[61]">
      <div className="w-full md:w-[480px] bg-white py-7 px-6 rounded-t-2xl md:rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-extrabold text-gray-900">
            {isEdit ? `Edit ${title}` : `Add ${title}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[6px] hover:bg-gray-100 transition-colors"
          >
            <IoMdClose className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-[13px] font-medium text-gray-500 mb-2">
              {fieldLabel}
            </label>
            <input
              type="text"
              required
              placeholder={fieldPlaceholder}
              value={value}
              onChange={onChange}
              className="w-full text-[15px] font-medium px-4 py-3 border border-gray-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-[13px] font-semibold border border-gray-200 rounded-[8px] text-gray-700 hover:bg-gray-50 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-[13px] font-bold text-white rounded-[8px] hover:opacity-90 disabled:opacity-60 active:scale-[0.98] flex items-center gap-2"
              style={{ background: GRADIENT }}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>{" "}
                  Saving...
                </>
              ) : isEdit ? (
                "Update"
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Department Tab Content
───────────────────────────────────────────────────────────────────────────── */
function DepartmentTab({ URI }) {
  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    departmentid: "",
    department: "",
  });

  const fetchData = async () => {
    try {
      const res = await fetch(`${URI}/project-partner/departments`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      setDatas(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const addOrUpdate = async (e) => {
    e.preventDefault();
    const endpoint = newDepartment.departmentid
      ? `edit/${newDepartment.departmentid}`
      : "add";
    try {
      setLoading(true);
      const res = await fetch(
        `${URI}/project-partner/departments/${endpoint}`,
        {
          method: newDepartment.departmentid ? "PUT" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newDepartment),
        },
      );
      if (!res.ok) throw new Error();
      alert(
        newDepartment.departmentid
          ? "Department updated successfully!"
          : res.status === 202
            ? "Department already exists!"
            : "Department added successfully!",
      );
      setNewDepartment({ departmentid: "", department: "" });
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error saving department.");
    } finally {
      setLoading(false);
    }
  };

  const edit = async (id) => {
    try {
      const res = await fetch(`${URI}/project-partner/departments/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      setNewDepartment(await res.json());
      setShowForm(true);
    } catch (e) {
      console.error(e);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      const res = await fetch(
        `${URI}/project-partner/departments/delete/${id}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await res.json();
      res.ok
        ? alert("Department deleted successfully!")
        : alert(`Error: ${data.message}`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const status = async (id) => {
    if (!window.confirm("Change this department's status?")) return;
    try {
      const res = await fetch(
        `${URI}/project-partner/departments/status/${id}`,
        { method: "PUT", credentials: "include" },
      );
      const data = await res.json();
      res.ok
        ? alert(`Success: ${data.message}`)
        : alert(`Error: ${data.message}`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = datas.filter(
    (item) =>
      item.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const columns = [
    {
      name: "SN",
      cell: (row, index) => (
        <div className="relative group flex items-center">
          <span
            className={`min-w-[28px] flex items-center justify-center px-2 py-1 rounded-md text-xs font-semibold cursor-pointer ${row.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
          >
            {index + 1}
          </span>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1.5 rounded-[6px] bg-gray-900 text-white text-[11px] whitespace-nowrap hidden group-hover:block z-10 shadow-lg">
            {row.status === "Active" ? "Active" : "Inactive"}
          </div>
        </div>
      ),
      width: "70px",
    },
    {
      name: "Department Name",
      selector: (row) => row.department,
      sortable: true,
      cell: (row) => (
        <span className="text-[13.5px] font-semibold text-gray-900">
          {row.department}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {/* Edit */}
          <button
            onClick={() => edit(row.departmentid)}
            title="Edit"
            className="p-1.5 text-gray-400 hover:text-violet-600 transition-colors"
          >
            <Pencil size={15} />
          </button>

          {/* Change Status */}
          <button
            onClick={() => {
              if (window.confirm("Change status?")) {
                status(row.departmentid);
              }
            }}
            title="Change Status"
            className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors"
          >
            <RefreshCw size={15} />
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete?")) {
                del(row.departmentid);
              }
            }}
            title="Delete"
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
      width: "130px",
      right: true,
    },
  ];

  return (
    <div className="flex flex-col gap-4 px-5 py-5">
      {/* Sub-header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 border border-gray-200 rounded-[8px] px-3.5 py-[8px] bg-white min-w-[240px]">
          <CiSearch className="text-gray-400 shrink-0 text-[16px]" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search departments..."
            className="outline-none text-[13px] text-gray-700 placeholder:text-gray-400 bg-transparent w-full"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setNewDepartment({ departmentid: "", department: "" });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-[8px] text-white text-[13px] font-bold rounded-[8px] whitespace-nowrap hover:opacity-90 transition-opacity shadow-[0_4px_12px_rgba(94,35,220,0.28)]"
          style={{ background: GRADIENT }}
        >
          <Plus size={14} strokeWidth={2.5} /> Add Department
        </button>
      </div>

      <div className="overflow-auto">
        <DataTable
          customStyles={tableStyles}
          columns={columns}
          data={filteredData}
          pagination
          paginationPerPage={10}
          paginationComponentOptions={{
            rowsPerPageText: "Rows per page:",
            rangeSeparatorText: "of",
            selectAllRowsItem: true,
            selectAllRowsItemText: "All",
          }}
          noDataComponent={
            <div className="py-12 text-[14px] text-gray-400">
              No departments found
            </div>
          }
        />
      </div>

      <SlideForm
        show={showForm}
        title="Department"
        fieldLabel="Department Name"
        fieldPlaceholder="e.g. Engineering"
        value={newDepartment.department}
        onChange={(e) =>
          setNewDepartment({ ...newDepartment, department: e.target.value })
        }
        onSubmit={addOrUpdate}
        onClose={() => {
          setShowForm(false);
          setNewDepartment({ departmentid: "", department: "" });
        }}
        loading={loading}
        isEdit={!!newDepartment.departmentid}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Role Tab Content
───────────────────────────────────────────────────────────────────────────── */
function RoleTab({ URI }) {
  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newRole, setNewRole] = useState({ roleid: "", role: "" });

  const fetchData = async () => {
    try {
      const res = await fetch(`${URI}/project-partner/roles`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      setDatas(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const addOrUpdate = async (e) => {
    e.preventDefault();
    const endpoint = newRole.roleid ? `edit/${newRole.roleid}` : "add";
    try {
      setLoading(true);
      const res = await fetch(`${URI}/project-partner/roles/${endpoint}`, {
        method: newRole.roleid ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRole),
      });
      if (!res.ok) throw new Error();
      alert(
        newRole.roleid
          ? "Role updated successfully!"
          : res.status === 202
            ? "Role already exists!"
            : "Role added successfully!",
      );
      setNewRole({ roleid: "", role: "" });
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error saving role.");
    } finally {
      setLoading(false);
    }
  };

  const edit = async (id) => {
    try {
      const res = await fetch(`${URI}/project-partner/roles/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      setNewRole(await res.json());
      setShowForm(true);
    } catch (e) {
      console.error(e);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this role?")) return;
    try {
      const res = await fetch(`${URI}/project-partner/roles/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      res.ok
        ? alert("Role deleted successfully!")
        : alert(`Error: ${data.message}`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const status = async (id) => {
    if (!window.confirm("Change this role's status?")) return;
    try {
      const res = await fetch(`${URI}/project-partner/roles/status/${id}`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      res.ok
        ? alert(`Success: ${data.message}`)
        : alert(`Error: ${data.message}`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = datas.filter(
    (item) =>
      item.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const columns = [
    {
      name: "SN",
      cell: (row, index) => (
        <div className="relative group flex items-center">
          <span
            className={`min-w-[28px] flex items-center justify-center px-2 py-1 rounded-md text-xs font-semibold cursor-pointer ${row.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
          >
            {index + 1}
          </span>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1.5 rounded-[6px] bg-gray-900 text-white text-[11px] whitespace-nowrap hidden group-hover:block z-10 shadow-lg">
            {row.status === "Active" ? "Active" : "Inactive"}
          </div>
        </div>
      ),
      width: "70px",
    },
    {
      name: "Role Name",
      selector: (row) => row.role,
      sortable: true,
      cell: (row) => (
        <span className="text-[13.5px] font-semibold text-gray-900">
          {row.role}
        </span>
      ),
    },

    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-1">
          {/* Edit */}
          <button
            onClick={() => edit(row.roleid)}
            title="Edit"
            className="p-1.5 text-gray-400 hover:text-violet-600 transition-colors"
          >
            <Pencil size={15} />
          </button>

          {/* Change Status */}
          <button
            onClick={() => {
              if (window.confirm("Change status?")) {
                status(row.roleid);
              }
            }}
            title="Change Status"
            className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors"
          >
            <RefreshCw size={15} />
          </button>

          {/* Delete */}
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete?")) {
                del(row.roleid);
              }
            }}
            title="Delete"
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
      width: "130px",
      right: true,
    },
  ];

  return (
    <div className="flex flex-col gap-4 px-5 py-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 border border-gray-200 rounded-[8px] px-3.5 py-[8px] bg-white min-w-[240px]">
          <CiSearch className="text-gray-400 shrink-0 text-[16px]" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search roles..."
            className="outline-none text-[13px] text-gray-700 placeholder:text-gray-400 bg-transparent w-full"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setNewRole({ roleid: "", role: "" });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-[8px] text-white text-[13px] font-bold rounded-[8px] whitespace-nowrap hover:opacity-90 transition-opacity shadow-[0_4px_12px_rgba(94,35,220,0.28)]"
          style={{ background: GRADIENT }}
        >
          <Plus size={14} strokeWidth={2.5} /> Add Role
        </button>
      </div>

      <div className="overflow-auto">
        <DataTable
          customStyles={tableStyles}
          columns={columns}
          data={filteredData}
          pagination
          paginationPerPage={10}
          paginationComponentOptions={{
            rowsPerPageText: "Rows per page:",
            rangeSeparatorText: "of",
            selectAllRowsItem: true,
            selectAllRowsItemText: "All",
          }}
          noDataComponent={
            <div className="py-12 text-[14px] text-gray-400">
              No roles found
            </div>
          }
        />
      </div>

      <SlideForm
        show={showForm}
        title="Role"
        fieldLabel="Role Name"
        fieldPlaceholder="e.g. Senior Engineer"
        value={newRole.role}
        onChange={(e) => setNewRole({ ...newRole, role: e.target.value })}
        onSubmit={addOrUpdate}
        onClose={() => {
          setShowForm(false);
          setNewRole({ roleid: "", role: "" });
        }}
        loading={loading}
        isEdit={!!newRole.roleid}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Existing Employee Table sub-components (badges, modals, cards) — UNCHANGED
───────────────────────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = {
    Active: "text-emerald-600 bg-emerald-50",
    Inactive: "text-red-500 bg-red-50",
    "On Leave": "text-amber-600 bg-amber-50",
  };
  return (
    <span
      className={`inline-flex items-center text-[12px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${cfg[status] || cfg["Active"]}`}
    >
      {status}
    </span>
  );
}
function RoleBadge({ role }) {
  return (
    <span className="inline-flex text-[12px] font-semibold px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 whitespace-nowrap">
      {role}
    </span>
  );
}
function DesktopRoleBadge({ role }) {
  return (
    <span className="inline-flex text-[12px] font-medium px-3 py-1.5 rounded-[8px] bg-gray-100 text-gray-600 whitespace-nowrap">
      {role}
    </span>
  );
}
function FormatPrice({ price }) {
  return <span>₹{Number(price).toLocaleString("en-IN")}</span>;
}

function DeleteModal({ emp, onCancel, onConfirm }) {
  if (!emp) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[16px] p-6 max-w-sm w-full shadow-2xl">
        <h3 className="text-[17px] font-extrabold text-gray-900 mb-2">
          Delete Employee?
        </h3>
        <p className="text-[13.5px] text-gray-500 mb-6">
          Are you sure you want to delete{" "}
          <span className="font-bold text-gray-800">{emp.name}</span>? This
          cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-[8px] border border-gray-200 text-[13.5px] font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(emp)}
            className="flex-1 py-2.5 rounded-[8px] text-[13.5px] font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function AssignTaskModal({ emp, menus, onClose, onAssign }) {
  const [selected, setSelected] = useState(
    emp?.menus
      ? typeof emp.menus === "string"
        ? JSON.parse(emp.menus)
        : emp.menus
      : [],
  );
  if (!emp) return null;
  const toggle = (menuName) =>
    setSelected((prev) =>
      prev.includes(menuName)
        ? prev.filter((m) => m !== menuName)
        : [...prev, menuName],
    );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[16px] w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
          <div>
            <h3 className="text-[16px] font-bold text-gray-900">
              Assign Tasks
            </h3>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Select menu access for {emp.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 border border-gray-200 rounded-[10px] bg-gray-50">
            {menus.map((menu, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  value={menu.menuName}
                  checked={selected.includes(menu.menuName)}
                  onChange={() => toggle(menu.menuName)}
                  className="accent-violet-600"
                />
                <span className="text-[13px] font-medium text-gray-700">
                  {menu.menuName}
                </span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button
              onClick={() => setSelected([])}
              className="px-5 py-2.5 text-[13px] font-semibold border border-gray-200 rounded-[8px] text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={() => onAssign(emp, selected)}
              className="px-5 py-2.5 text-[13px] font-bold text-white rounded-[8px] hover:opacity-90"
              style={{ background: GRADIENT }}
            >
              Assign Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GiveAccessModal({ emp, onClose, onAssign }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  if (!emp) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[16px] w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
          <div>
            <h3 className="text-[16px] font-bold text-gray-900">
              Give Login Access
            </h3>
            <p className="text-[12px] text-gray-400 mt-0.5">
              Set credentials for {emp.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              Username
            </label>
            <input
              type="text"
              required
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-[14px] font-medium px-4 py-3 border border-gray-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-[14px] font-medium px-4 py-3 border border-gray-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-violet-400 bg-gray-50"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-[13px] font-semibold border border-gray-200 rounded-[8px] text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (username && password) onAssign(emp, username, password);
              }}
              className="px-5 py-2.5 text-[13px] font-bold text-white rounded-[8px] hover:opacity-90"
              style={{ background: GRADIENT }}
            >
              Give Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewModal({ emp, onClose }) {
  if (!emp) return null;
  const fields = [
    ["Full Name", emp.name],
    ["Status", emp.status],
    ["Login Status", emp.loginstatus],
    ["Department", emp.department],
    ["Role", emp.role],
    ["Date of Joining", emp.doj],
    [
      "Salary",
      emp.salary ? `₹${Number(emp.salary).toLocaleString("en-IN")}` : "—",
    ],
    ["Date of Birth", emp.dob],
    ["Contact", emp.contact],
    ["Email", emp.email],
    ["Aadhaar No", emp.uid ? `XXXX XXXX ${emp.uid.slice(-4)}` : "—"],
    ["State", emp.state],
    ["City", emp.city],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[16px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <img
              src={emp.avatar || `https://i.pravatar.cc/48?u=${emp.id}`}
              alt={emp.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
            />
            <div>
              <h3 className="text-[16px] font-bold text-gray-900">
                {emp.name}
              </h3>
              <p className="text-[12px] text-gray-400">
                {emp.empId || `EMP-${emp.id}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(([label, val]) => (
            <div key={label}>
              <p className="text-[12px] text-gray-400 font-medium mb-1">
                {label}
              </p>
              <p className="text-[14px] font-semibold text-gray-900 px-4 py-3 border border-gray-200 rounded-[8px] bg-gray-50">
                {val || "—"}
              </p>
            </div>
          ))}
          <div className="sm:col-span-2">
            <p className="text-[12px] text-gray-400 font-medium mb-1">
              Address
            </p>
            <p className="text-[14px] font-semibold text-gray-900 px-4 py-3 border border-gray-200 rounded-[8px] bg-gray-50">
              {emp.address || "—"}
            </p>
          </div>
        </div>
        <div className="flex justify-end px-6 pb-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[13px] font-semibold border border-gray-200 rounded-[8px] text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function MobileCard({
  emp,
  onView,
  onEdit,
  onDelete,
  onStatus,
  onAssignTask,
  onGiveAccess,
}) {
  return (
    <div className="bg-white rounded-[18px] p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <img
          src={emp.avatar || `https://i.pravatar.cc/40?u=${emp.id}`}
          alt={emp.name}
          className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-gray-100"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-[17px] font-extrabold text-gray-900 leading-tight">
            {emp.name}
          </h3>
          <p className="text-[12px] text-gray-400 mt-0.5">
            {emp.empId || `EMP-${emp.id}`}
          </p>
        </div>
        <StatusBadge status={emp.status} />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <p className="text-[11.5px] text-gray-400 font-medium mb-1.5">Role</p>
          <RoleBadge role={emp.role} />
        </div>
        <div>
          <p className="text-[11.5px] text-gray-400 font-medium mb-1.5">
            Department
          </p>
          <p className="text-[14px] font-bold text-gray-900">
            {emp.department}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <p className="text-[11.5px] text-gray-400 font-medium mb-1">Phone</p>
          <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-gray-900">
            <Phone size={13} className="text-gray-400 shrink-0" />
            {emp.contact}
          </p>
        </div>
        <div>
          <p className="text-[11.5px] text-gray-400 font-medium mb-1">Email</p>
          <p className="text-[13.5px] font-semibold text-gray-900 truncate">
            {emp.email}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <p className="text-[11.5px] text-gray-400 font-medium mb-1">Salary</p>
          <p className="text-[15px] font-extrabold text-gray-900">
            <FormatPrice price={parseFloat(emp.salary || 0)} />
          </p>
        </div>
        <div>
          <p className="text-[11.5px] text-gray-400 font-medium mb-1">
            Aadhaar
          </p>
          <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-gray-900">
            <FileText size={13} className="text-gray-400 shrink-0" />
            XXXX {emp.uid?.slice(-4)}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={() => onView(emp)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-violet-50 transition-colors"
        >
          <Eye size={16} className="text-gray-400 hover:text-violet-600" />
        </button>
        <button
          onClick={() => onEdit(emp)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-violet-50 transition-colors"
        >
          <Pencil size={16} className="text-gray-400 hover:text-violet-600" />
        </button>
        <button
          onClick={() => onAssignTask(emp)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-violet-50 transition-colors"
        >
          <ClipboardList
            size={16}
            className="text-gray-400 hover:text-violet-600"
          />
        </button>
        <button
          onClick={() => onGiveAccess(emp)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-amber-50 hover:bg-amber-100 transition-colors"
        >
          <KeyRound size={16} className="text-amber-500" />
        </button>
        <button
          onClick={() => onStatus(emp)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-amber-50 transition-colors"
        >
          <RefreshCw size={16} className="text-gray-400 hover:text-amber-500" />
        </button>
        <button
          onClick={() => onDelete(emp)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 transition-colors"
        >
          <Trash2 size={16} className="text-red-400" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main EmployeeTable
───────────────────────────────────────────────────────────────────────────── */
/**
 * EmployeeTable
 *
 * Now self-contained: includes Departments tab, Roles tab, and the Filter popover.
 * The parent (Employees.jsx) no longer needs EmployeeFilter, DepartmentSection, or RoleSection.
 *
 * @param {string}   globalFilter    - search string from header
 * @param {string}   activeTab       - controlled tab key
 * @param {function} onTabChange     - called when tab changes
 * @param {Array}    employees       - filtered employee list from parent
 * @param {Array}    menus           - menu list for assign task
 * @param {Array}    departments     - dept objects [{ departmentid, department }] for filter options
 * @param {Array}    roles           - role objects [{ roleid, role }] for filter options
 * @param {string}   URI             - base API URI passed down for dept/role CRUD
 * @param {function} onEdit          - open edit form
 * @param {function} onDelete        - delete employee
 * @param {function} onToggleStatus  - toggle status
 * @param {function} onAssignTask    - assign task
 * @param {function} onAssignLogin   - give login
 */
export default function EmployeeTable({
  globalFilter = "",
  activeTab,
  onTabChange,
  employees = [],
  menus = [],
  departments = [],
  roles = [],
  URI = "",
  onEdit,
  onDelete,
  onToggleStatus,
  onAssignTask,
  onAssignLogin,
}) {
  const [sorting, setSorting] = useState(null);
  const [page, setPage] = useState(0);
  const [viewEmp, setViewEmp] = useState(null);
  const [deleteEmp, setDeleteEmp] = useState(null);
  const [assignTaskEmp, setAssignTaskEmp] = useState(null);
  const [giveAccessEmp, setGiveAccessEmp] = useState(null);
  const [mobileCount, setMobileCount] = useState(5);

  // Filter state lives here now
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const deptNames = departments.map((d) => d.department || d).filter(Boolean);
  const roleNames = roles.map((r) => r.role || r).filter(Boolean);

  // Reset page when tab changes
  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  const filtered = useMemo(() => {
    const s = globalFilter.toLowerCase();
    return employees.filter((e) => {
      const matchSearch =
        !s ||
        e.name?.toLowerCase().includes(s) ||
        e.uid?.includes(s) ||
        e.contact?.includes(s) ||
        e.email?.toLowerCase().includes(s) ||
        e.role?.toLowerCase().includes(s) ||
        e.department?.toLowerCase().includes(s);
      const matchDept =
        !selectedDept ||
        e.department?.toLowerCase() === selectedDept.toLowerCase();
      const matchRole =
        !selectedRole || e.role?.toLowerCase() === selectedRole.toLowerCase();
      return matchSearch && matchDept && matchRole;
    });
  }, [employees, globalFilter, selectedDept, selectedRole]);

  const sorted = useMemo(() => {
    if (!sorting) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sorting.key] || "",
        vb = b[sorting.key] || "";
      return sorting.dir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }, [filtered, sorting]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const mobileRows = sorted.slice(0, mobileCount);
  const hasMore = mobileCount < sorted.length;
  const start = Math.min(page * PAGE_SIZE + 1, sorted.length);
  const end = Math.min((page + 1) * PAGE_SIZE, sorted.length);

  const toggleSort = (key) =>
    setSorting((s) =>
      s?.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );

  const handleDelete = (emp) => {
    onDelete && onDelete(emp.id);
    setDeleteEmp(null);
  };
  const handleAssignTask = (emp, menus) => {
    onAssignTask && onAssignTask(emp, menus);
    setAssignTaskEmp(null);
  };
  const handleAssignLogin = (emp, username, password) => {
    onAssignLogin && onAssignLogin(emp, username, password);
    setGiveAccessEmp(null);
  };

  const desktopCols = [
    { key: "name", label: "EMPLOYEE NAME" },
    { key: "role", label: "ROLE" },
    { key: "department", label: "DEPARTMENT" },
    { key: "contact", label: "CONTACT" },
    { key: "salary", label: "SALARY" },
    { key: "uid", label: "AADHAAR" },
    { key: "status", label: "STATUS" },
    { key: "_actions", label: "ACTIONS" },
  ];

  return (
    <>
      <div className="bg-white rounded-[14px] border border-gray-100 shadow-sm overflow-hidden">
        {/* ── Tab bar + Filter ── */}
        <div className="flex items-center justify-between px-5 border-b border-gray-100">
          <div className="flex items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`px-5 py-4 text-[14px] font-semibold transition-colors relative whitespace-nowrap
                  ${activeTab === tab.key ? "text-violet-600" : "text-gray-400 hover:text-gray-700"}`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-violet-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Filter only shown on directory tab */}
          {activeTab === "directory" && (
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-gray-400 hidden sm:block">
                {filtered.length} employees
              </span>
              <EmployeeFilter
                departments={deptNames}
                roles={roleNames}
                selectedDept={selectedDept}
                selectedRole={selectedRole}
                onDeptChange={setSelectedDept}
                onRoleChange={setSelectedRole}
                onClear={() => {
                  setSelectedDept("");
                  setSelectedRole("");
                }}
              />
            </div>
          )}
        </div>

        {/* ── DIRECTORY TAB ── */}
        {activeTab === "directory" && (
          <>
            {/* Mobile cards */}
            <div className="flex flex-col gap-3 p-4 md:hidden">
              {mobileRows.map((emp) => (
                <MobileCard
                  key={emp.id}
                  emp={emp}
                  onView={setViewEmp}
                  onEdit={onEdit}
                  onDelete={setDeleteEmp}
                  onStatus={(emp) => {
                    if (window.confirm(`Change status for ${emp.name}?`))
                      onToggleStatus && onToggleStatus(emp);
                  }}
                  onAssignTask={setAssignTaskEmp}
                  onGiveAccess={setGiveAccessEmp}
                />
              ))}
              {mobileRows.length === 0 && (
                <p className="text-center text-gray-400 py-8 text-[14px]">
                  No employees found
                </p>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    {desktopCols.map((col) => (
                      <th
                        key={col.key}
                        onClick={() =>
                          col.key !== "_actions" && toggleSort(col.key)
                        }
                        className={`px-5 py-3.5 text-left text-[10.5px] font-bold text-gray-400 tracking-widest uppercase whitespace-nowrap select-none
                          ${col.key !== "_actions" ? "cursor-pointer hover:text-gray-600 transition-colors" : ""}`}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {col.key !== "_actions" && (
                            <span className="flex flex-col ml-0.5 opacity-40">
                              <ChevronUp
                                size={8}
                                className={
                                  sorting?.key === col.key &&
                                  sorting.dir === "asc"
                                    ? "opacity-100 text-violet-600"
                                    : ""
                                }
                              />
                              <ChevronDown
                                size={8}
                                className={
                                  sorting?.key === col.key &&
                                  sorting.dir === "desc"
                                    ? "opacity-100 text-violet-600"
                                    : ""
                                }
                              />
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 bg-white transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 min-w-[160px]">
                          <div className="relative">
                            <img
                              src={
                                emp.avatar ||
                                `https://i.pravatar.cc/40?u=${emp.id}`
                              }
                              alt={emp.name}
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                            />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${emp.loginstatus === "Active" ? "bg-emerald-400" : "bg-gray-300"}`}
                            />
                          </div>
                          <div>
                            <p className="text-[13.5px] font-extrabold text-gray-900 leading-tight">
                              {emp.name}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {emp.empId || `EMP-${emp.id}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <DesktopRoleBadge role={emp.role} />
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13px] text-gray-700">
                          {emp.department}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[13px] text-gray-700 whitespace-nowrap">
                          {emp.contact}
                        </p>
                        <p className="text-[11.5px] text-gray-400 mt-0.5 truncate max-w-[150px]">
                          {emp.email}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[13.5px] font-extrabold text-gray-900 whitespace-nowrap">
                          <FormatPrice price={parseFloat(emp.salary || 0)} />
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex text-[12px] font-mono font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-[6px] whitespace-nowrap">
                          XXXX {emp.uid?.slice(-4)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={emp.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewEmp(emp)}
                            title="View"
                            className="p-1.5 text-gray-400 hover:text-violet-600 transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => onEdit && onEdit(emp)}
                            title="Edit"
                            className="p-1.5 text-gray-400 hover:text-violet-600 transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setAssignTaskEmp(emp)}
                            title="Assign Task"
                            className="p-1.5 text-gray-400 hover:text-violet-600 transition-colors"
                          >
                            <ClipboardList size={15} />
                          </button>
                          <button
                            onClick={() => setGiveAccessEmp(emp)}
                            title="Give Access"
                            className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors"
                          >
                            <KeyRound size={15} />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(`Change status for ${emp.name}?`)
                              )
                                onToggleStatus && onToggleStatus(emp);
                            }}
                            title="Toggle Status"
                            className="p-1.5 text-gray-400 hover:text-amber-500 transition-colors"
                          >
                            <RefreshCw size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteEmp(emp)}
                            title="Delete"
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center text-gray-400 py-12 text-[14px]"
                      >
                        No employees found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── DEPARTMENTS TAB ── */}
        {activeTab === "departments" && <DepartmentTab URI={URI} />}

        {/* ── ROLES TAB ── */}
        {activeTab === "roles" && <RoleTab URI={URI} />}
      </div>

      {/* Mobile load more (directory only) */}
      {activeTab === "directory" && hasMore && (
        <div className="flex md:hidden justify-center py-4">
          <button
            onClick={() => setMobileCount((c) => c + 5)}
            className="w-full text-[13.5px] text-gray-400 font-medium hover:text-gray-600 px-6 py-3 border rounded-xl transition-colors"
          >
            Load More Employees
          </button>
        </div>
      )}

      {/* Desktop pagination (directory only) */}
      {activeTab === "directory" && (
        <div className="hidden md:flex items-center justify-between gap-4 flex-wrap py-2">
          <p className="text-[13px] text-gray-400">
            Showing {start}–{end} of {sorted.length} employees
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-5 py-2 text-[13px] font-semibold text-gray-700 border border-gray-200 rounded-[8px] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-9 h-9 text-[13px] font-semibold rounded-[8px] border transition-colors ${page === i ? "text-white border-transparent" : "text-gray-700 border-gray-200 bg-white hover:bg-gray-50"}`}
                style={page === i ? { background: GRADIENT } : {}}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-5 py-2 text-[13px] font-semibold text-gray-700 border border-gray-200 rounded-[8px] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ViewModal emp={viewEmp} onClose={() => setViewEmp(null)} />
      <DeleteModal
        emp={deleteEmp}
        onCancel={() => setDeleteEmp(null)}
        onConfirm={handleDelete}
      />
      <AssignTaskModal
        emp={assignTaskEmp}
        menus={menus}
        onClose={() => setAssignTaskEmp(null)}
        onAssign={handleAssignTask}
      />
      <GiveAccessModal
        emp={giveAccessEmp}
        onClose={() => setGiveAccessEmp(null)}
        onAssign={handleAssignLogin}
      />
    </>
  );
}
