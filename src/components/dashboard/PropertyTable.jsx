import { CiSearch } from "react-icons/ci";
import DataTable from "react-data-table-component";
import CustomDateRangePicker from "../CustomDateRangePicker";
import DashboardFilter from "./DashboardFilter";
import propertyPicture from "../../assets/propertyPicture.svg";
import { getImageURI } from "../../utils/helper";
/**
 * PropertyTable
 * Props:
 *   data           : array   — already filtered by parent (Dashboard)
 *   searchTerm     : string
 *   onSearch       : fn(term)
 *   range          : array   — date range state
 *   onRangeChange  : fn(range)
 *   propertyCounts : { Enquired, Booked }
 *   URI            : string  — base URL for images
 *   loading        : boolean
 */
export default function PropertyTable({
  data = [],
  searchTerm,
  onSearch,
  range,
  onRangeChange,
  propertyCounts,
  URI = "",
  loading = false,
}) {
  const customStyles = {
    rows: {
      style: { padding: "5px 0px", fontSize: "14px", fontWeight: 500, color: "#111827" },
    },
    headCells: {
      style: { fontSize: "14px", fontWeight: "600", backgroundColor: "#00000007", color: "#374151" },
    },
    cells: {
      style: { fontSize: "13px", color: "#1F2937" },
    },
  };

  const columns = [
    {
      name: "SN",
      cell: (row, index) => (
        <div className="relative group flex items-center w-full">
          <span
            className={`min-w-6 flex items-center justify-center px-2 py-1 rounded-md cursor-pointer text-xs font-semibold
              ${row.status === "Active"
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-500"
              }`}
          >
            {index + 1}
          </span>
          {/* Tooltip */}
          <div className="absolute -top-10 left-7 px-2 py-1 rounded bg-gray-900 text-white text-xs hidden group-hover:block whitespace-nowrap z-10">
            {row.status === "Active" ? "Active" : "Inactive"}
          </div>
        </div>
      ),
      width: "70px",
    },
    {
      name: "Image",
      cell: (row) => {
        let src = propertyPicture;
        try {
          const parsed = JSON.parse(row.frontView);
          if (Array.isArray(parsed) && parsed[0]) src = `${getImageURI(parsed[0])}`;
        } catch {}
        return (
          <div className="w-[120px] h-12 overflow-hidden flex items-center justify-center rounded-lg">
            <img
              src={src}
              alt={row.propertyName}
              onClick={() => window.open(`https://www.reparv.in/property-info/${row.seoSlug}`, "_blank")}
              className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
            />
          </div>
        );
      },
      width: "130px",
    },
    {
      name: "Name",
      selector: row => row.propertyName,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Builder",
      selector: row => row.company_name,
      sortable: true,
      minWidth: "130px",
    },
    {
      name: "Type",
      selector: row => row.propertyCategory,
      sortable: true,
    },
    {
      name: "City",
      selector: row => row.city,
      sortable: true,
      width: "120px",
    },
    {
      name: "Pin Code",
      selector: row => row.pincode,
      width: "110px",
    },
    {
      name: "Total Price",
      selector: row => row.totalOfferPrice,
      sortable: true,
    },
  ];

  return (
    <div className="mx-4 bg-white rounded-2xl p-4 md:p-6 flex flex-col gap-4 border border-gray-100 min-h-[750px] lg:min-h-[500px]">

      {/* Table heading */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Property List</h2>
      </div>

      {/* Search + Date range row */}
      <div className="flex flex-col lg:flex-row items-end lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 w-full lg:w-auto min-w-[200px] max-w-xs h-9 bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:border-violet-400 transition-colors">
          <CiSearch className="text-gray-400 flex-shrink-0 text-lg" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={e => onSearch(e.target.value.toLowerCase())}
            className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
          />
        </div>

        {/* Date picker */}
        <div>
          <CustomDateRangePicker range={range} setRange={onRangeChange} />
        </div>
      </div>

      {/* Dashboard filter: All | Enquired | Booked */}
      <DashboardFilter counts={propertyCounts} />

      {/* DataTable */}
      <div className="overflow-x-auto scrollbar-hide">
        <DataTable
          customStyles={customStyles}
          columns={columns}
          data={data}
          progressPending={loading}
          pagination
          paginationPerPage={10}
          paginationComponentOptions={{
            rowsPerPageText: "Rows per page:",
            rangeSeparatorText: "of",
            selectAllRowsItem: true,
            selectAllRowsItemText: "All",
          }}
          noDataComponent={
            <div className="py-10 text-center text-gray-400 text-sm">
              No properties found.
            </div>
          }
        />
      </div>
    </div>
  );
}