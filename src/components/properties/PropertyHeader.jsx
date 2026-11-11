import {
  FiSearch,
  FiMapPin,
  FiDownload,
  FiPlus,
  FiArrowLeft,
  FiMoreHorizontal,
  FiSliders,
} from "react-icons/fi";
import { Plus } from "lucide-react";
import DownloadCSV from "../DownloadCSV";
import { useNavigate } from "react-router-dom";

const GRADIENT = "linear-gradient(110.73deg, #5323DC 0%, #8E61FF 100%)";

export default function PropertyHeader({
  onSearch,
  onAddProperty,
  properties,
  onPostUpdate,
}) {
  const navigate = useNavigate();
  return (
    <header className="w-full bg-white md:bg-transparent border-b">
      {/* MOBILE HEADER */}
      <div className="md:hidden px-4 py-3 space-y-3">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <button onClick={()=>{navigate(-1)}}>
            <FiArrowLeft className="text-2xl text-gray-700" />
          </button>

          <h1 className="text-lg font-semibold">Properties</h1>

          <button
            onClick={() => navigate("/app/property/add")}
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
            style={{ background: GRADIENT }}
          >
            <Plus size={17} className="text-white" />
          </button>
        </div>

        {/* Search Row */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search properties..."
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full h-11 pl-10 pr-4 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Map Button */}
          <button
            onClick={() => {
              navigate("/app/properties/map-view");
            }}
            className="h-11 w-11 border rounded-lg flex items-center justify-center"
          >
            <FiMapPin className="text-lg text-gray-700" />
          </button>

          {/* Filter Button */}
          <button
            onClick={onPostUpdate}
            className="h-11 w-11 border rounded-lg flex items-center justify-center"
          >
            <FiSliders className="text-lg text-gray-700" />
          </button>
        </div>
      </div>

      {/* DESKTOP HEADER */}
      <div className="hidden md:flex flex-wrap w-full px-6 py-4 items-center justify-between gap-6">
        {/* Title */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Properties</h1>
          <p className="text-sm text-gray-500">Overview • All Listings</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-[300px] ">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search"
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full py-2 pl-10 pr-4 border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#5323DC]"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              navigate("/app/propertries/map-view");
            }}
            className="flex items-center gap-2 border border-[#5323DC] px-4 py-2 rounded-md text-xs text-[#5323DC] hover:bg-gray-50"
          >
            <FiMapPin /> Map View
          </button>

          <DownloadCSV data={properties} filename={"Properties.csv"} />

          <button
            onClick={onPostUpdate}
            className="hidden border border-[#5323DC] px-4 py-2 rounded-md text-xs text-[#5323DC] hover:bg-gray-50"
          >
            Post Update
          </button>

          <button
            onClick={() => {
              navigate("/app/property/add");
            }}
            className="flex items-center gap-2 bg-[#5323Dc] text-white px-4 py-2 rounded-md text-xs font-medium shadow hover:bg-[#5824e9] "
          >
            <FiPlus /> Add Property
          </button>
        </div>
      </div>
    </header>
  );
}
