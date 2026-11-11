import React, { useState } from "react";
import { HiMiniFunnel } from "react-icons/hi2";
import { IoMdClose } from "react-icons/io";

/**
 * EmployeeFilter
 *
 * Props:
 *   departments  - string[] of department names from API
 *   roles        - string[] of role names from API
 *   selectedDept - currently selected department (string | "")
 *   selectedRole - currently selected role (string | "")
 *   onDeptChange - (dept: string) => void
 *   onRoleChange - (role: string) => void
 *   onClear      - () => void
 */
const EmployeeFilter = ({
  departments = [],
  roles = [],
  selectedDept = "",
  selectedRole = "",
  onDeptChange,
  onRoleChange,
  onClear,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState("department"); // "department" | "role"

  const hasFilter = selectedDept || selectedRole;

  const handleDeptClick = (dept) => {
    onDeptChange?.(selectedDept === dept ? "" : dept);
  };

  const handleRoleClick = (role) => {
    onRoleChange?.(selectedRole === role ? "" : role);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onClear?.();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Filter Button */}
      <div
        className={`flex items-center gap-2 h-[36px] border rounded-[8px] py-2 px-3 text-sm cursor-pointer select-none transition-colors
          ${hasFilter
            ? "border-[#076300] bg-[#EAFBF1] text-[#076300]"
            : "border-[#0000001A] text-[#000000]"
          }`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <HiMiniFunnel className={hasFilter ? "text-[#076300]" : "text-black"} />
        {hasFilter && (
          <span className="text-xs font-semibold max-w-[120px] truncate">
            {[selectedDept, selectedRole].filter(Boolean).join(", ")}
          </span>
        )}
        {!hasFilter && <span className="font-medium">Filter</span>}
        {hasFilter && (
          <IoMdClose
            className="ml-1 text-[#076300] hover:text-red-500 transition-colors"
            onClick={handleClear}
          />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9] cursor-pointer"
          onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-[42px] right-0 w-[240px] bg-white shadow-lg border border-[#0000001A] rounded-[12px] overflow-hidden z-10">
            {/* Tabs */}
            <div className="flex border-b border-[#0000001A]">
              {["department", "role"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-xs font-semibold capitalize transition-colors
                    ${tab === t
                      ? "text-[#076300] border-b-2 border-[#076300] bg-[#EAFBF1]"
                      : "text-[#00000066] hover:bg-gray-50"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Options list */}
            <div className="max-h-[220px] overflow-y-auto py-1">
              {tab === "department" && (
                departments.length === 0 ? (
                  <p className="text-xs text-center text-gray-400 py-4">No departments</p>
                ) : (
                  departments.map((dept, i) => (
                    <div
                      key={i}
                      onClick={() => handleDeptClick(dept)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-sm hover:bg-gray-50 transition-colors
                        ${selectedDept === dept ? "bg-[#EAFBF1] text-[#076300] font-semibold" : "text-[#111827]"}`}
                    >
                      <input
                        type="radio"
                        name="dept-filter"
                        checked={selectedDept === dept}
                        onChange={() => handleDeptClick(dept)}
                        className="cursor-pointer accent-[#076300]"
                      />
                      <span>{dept}</span>
                    </div>
                  ))
                )
              )}

              {tab === "role" && (
                roles.length === 0 ? (
                  <p className="text-xs text-center text-gray-400 py-4">No roles</p>
                ) : (
                  roles.map((role, i) => (
                    <div
                      key={i}
                      onClick={() => handleRoleClick(role)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer text-sm hover:bg-gray-50 transition-colors
                        ${selectedRole === role ? "bg-[#EAFBF1] text-[#076300] font-semibold" : "text-[#111827]"}`}
                    >
                      <input
                        type="radio"
                        name="role-filter"
                        checked={selectedRole === role}
                        onChange={() => handleRoleClick(role)}
                        className="cursor-pointer accent-[#076300]"
                      />
                      <span>{role}</span>
                    </div>
                  ))
                )
              )}
            </div>

            {/* Clear all */}
            {hasFilter && (
              <div className="border-t border-[#0000001A] px-4 py-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-red-500 hover:text-red-700 font-medium w-full text-left"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeFilter;