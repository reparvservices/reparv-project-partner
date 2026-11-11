import { useState, useEffect } from "react";
import { parse } from "date-fns";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../store/auth";
import Loader from "../../components/Loader";
import DownloadCSV from "../../components/DownloadCSV";
import CustomDateRangePicker from "../../components/CustomDateRangePicker";
import PropertyHeader from "../../components/properties/PropertyHeader";
import PropertyFilter from "../../components/properties/PropertyFilter";
import PropertyCard from "../../components/properties/PropertyCard";
import PropertySidebar from "../../components/properties/PropertySidebar";
import PropertyModals from "../../components/properties/PropertyModals";

export default function Properties() {
  const navigate = useNavigate();
  const {
    setShowPropertyForm,
    showPropertyForm,
    showUpdateImagesForm,
    setShowUpdateImagesForm,
    showAdditionalInfoForm,
    setShowAdditionalInfoForm,
    showNewPlotAdditionalInfoForm,
    setShowNewPlotAdditionalInfoForm,
    propertyFilter,
    setPropertyFilter,
    showRejectReasonForm,
    setShowRejectReasonForm,
    showSeoForm,
    setShowSeoForm,
    showCommissionForm,
    setShowCommissionForm,
    showVideoUploadForm,
    setShowVideoUploadForm,
    showPropertyLocationForm,
    setShowPropertyLocationForm,
    setPropertyCommissionData,
    showPropertyCommissionPopup,
    setShowPropertyCommissionPopup,
    URI,
    setLoading,
  } = useAuth();

  const [datas, setDatas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyKey, setPropertyKey] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [seoSlug, setSeoSlug] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [seoTittle, setSeoTittle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [propertyDescription, setPropertyDescription] = useState("");
  const [images, setImages] = useState([]);
  // For Update images
  const [propertyImageData, setPropertyImageData] = useState({});
  const [imageFiles, setImageFiles] = useState({
    frontView: [],
    sideView: [],
    kitchenView: [],
    hallView: [],
    bedroomView: [],
    bathroomView: [],
    balconyView: [],
    nearestLandmark: [],
    developedAmenities: [],
  });
  const [propertyId, setPropertyId] = useState(null);
  const [file, setFile] = useState(null);
  const [newAddInfo, setNewAddInfo] = useState({ propertyid: "" });
  const [videoUpload, setVideoUpload] = useState({
    brochureFile: "",
    videoLink: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedScheduledPropertyImage, setSelectedScheduledPropertyImage] =
    useState(null);
  const [selectedSignedDocumentImage, setSelectedSignedDocumentImage] =
    useState(null);
  const [selectedSatBaraImage, setSelectedSatBaraImage] = useState(null);
  const [selectedOwnerAdharImage, setSelectedOwnerAdharImage] = useState(null);
  const [selectedOwnerPanImage, setSelectedOwnerPanImage] = useState(null);
  const [selectedEBillImage, setSelectedEBillImage] = useState(null);
  const [propertyCommission, setPropertyCommission] = useState({
    commissionType: "",
    commissionAmount: "",
    commissionPercentage: "",
    commissionAmountPerSquareFeet: "",
  });
  const [range, setRange] = useState([
    { startDate: null, endDate: null, key: "selection" },
  ]);

  /* ── API ── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${URI}/project-partner/properties/`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      setDatas(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async () => {
    try {
      const res = await fetch(URI + "/admin/states", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) setStates(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const edit = async (id) => {
    try {
      const res = await fetch(URI + `/project-partner/properties/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      setShowPropertyForm(true);
    } catch (e) {
      console.error(e);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this property?")) return;
    try {
      const res = await fetch(
        URI + `/project-partner/properties/delete/${id}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await res.json();
      res.ok
        ? (alert("Deleted!"), fetchData())
        : alert(`Error: ${data.message}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const status = async (id) => {
    if (!window.confirm("Change property status?")) return;
    try {
      const res = await fetch(
        URI + `/project-partner/properties/status/${id}`,
        { method: "PUT", credentials: "include" },
      );
      const data = await res.json();
      alert(res.ok ? `Success: ${data.message}` : `Error: ${data.message}`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const hotDeal = async (id) => {
    if (!window.confirm("Change hot deal status?")) return;
    try {
      const res = await fetch(URI + `/admin/properties/set/hotdeal/${id}`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      alert(res.ok ? `Success: ${data.message}` : `Error: ${data.message}`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPropertyLocation = async (id) => {
    try {
      const res = await fetch(
        URI + `/project-partner/properties/location/get/${id}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLatitude(data.latitude);
      setLongitude(data.longitude);
      setShowPropertyLocationForm(true);
    } catch (e) {
      console.error(e);
    }
  };

  const updatePropertyLocation = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(
        URI + `/project-partner/properties/location/edit/${propertyKey}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude, longitude }),
        },
      );
      const data = await res.json();
      alert(res.ok ? `Success: ${data.message}` : `Error: ${data.message}`);
      setShowPropertyLocationForm(false);
      setLatitude("");
      setLongitude("");
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showBrochure = async (id) => {
    try {
      const res = await fetch(URI + `/project-partner/properties/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVideoUpload({
        brochureFile: data.brochureFile,
        videoLink: data.videoLink,
      });
      setShowVideoUploadForm(true);
    } catch (e) {
      console.error(e);
    }
  };

  const uploadVideo = async (e) => {
    e.preventDefault();
    if (!selectedImage && !videoUpload?.videoLink)
      return alert("Please select a brochure or enter a YouTube link.");
    if (
      videoUpload?.videoLink &&
      !videoUpload.videoLink.includes("youtube.com") &&
      !videoUpload.videoLink.includes("youtu.be")
    )
      return alert("Enter a valid YouTube link.");
    const formData = new FormData();
    if (selectedImage) formData.append("brochureFile", selectedImage);
    if (videoUpload?.videoLink)
      formData.append("videoLink", videoUpload.videoLink);
    try {
      setLoading(true);
      const res = await fetch(
        `${URI}/project-partner/properties/brochure/upload/${propertyKey}`,
        { method: "PUT", credentials: "include", body: formData },
      );
      const data = await res.json();
      alert(res.ok ? `Success: ${data.message}` : `Error: ${data.message}`);
      setShowVideoUploadForm(false);
      setSelectedImage(null);
      setVideoUpload({ videoLink: "" });
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showSEO = async (id) => {
    try {
      const res = await fetch(URI + `/project-partner/properties/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSeoSlug(data.seoSlug);
      setPageTitle(data.pageTitle);
      setSeoTittle(data.seoTittle);
      setSeoDescription(data.seoDescription);
      setPropertyDescription(data.propertyDescription);
      setShowSeoForm(true);
    } catch (e) {
      console.error(e);
    }
  };

  const addSeoDetails = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(
        URI + `/project-partner/properties/seo/${propertyKey}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            seoSlug,
            pageTitle,
            seoTittle,
            seoDescription,
            propertyDescription,
          }),
        },
      );
      const data = await res.json();
      alert(res.ok ? `Success: ${data.message}` : `Error: ${data.message}`);
      setShowSeoForm(false);
      setSeoSlug("");
      setPageTitle("");
      setSeoTittle("");
      setSeoDescription("");
      setPropertyDescription("");
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addRejectReason = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(
        URI + `/project-partner/properties/reject/${propertyKey}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rejectReason }),
        },
      );
      const data = await res.json();
      alert(res.ok ? `Success: ${data.message}` : `Error: ${data.message}`);
      setShowRejectReasonForm(false);
      setRejectReason("");
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async (id) => {
    try {
      const res = await fetch(URI + `/project-partner/properties/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      setPropertyImageData(await res.json());
      setShowUpdateImagesForm(true);
    } catch (e) {
      console.error(e);
    }
  };

  const addImages = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("propertyid", propertyId);
    images.forEach((img) => formData.append("images[]", img));
    try {
      setLoading(true);
      const res = await fetch(`${URI}/project-partner/properties/addimages`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (res.status === 409) alert("Property already exists!");
      else if (!res.ok) throw new Error();
      else {
        setLoading(false);
        alert("Images uploaded!");
      }
      setImages([]);
      setShowUpdateImagesForm(false);
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addCsv = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a CSV file.");
    const formData = new FormData();
    formData.append("propertyid", propertyKey);
    formData.append("csv", file);
    try {
      const res = await fetch(
        `${URI}/project-partner/properties/additionalinfo/flat/csv/add/${propertyKey}`,
        { method: "POST", credentials: "include", body: formData },
      );
      const data = await res.json();
      if (!res.ok) return alert(data.message || "CSV upload failed.");
      alert(data.message || "CSV uploaded successfully.");
      setShowAdditionalInfoForm(false);
      setFile(null);
    } catch (e) {
      console.error(e);
      alert("Upload error.");
    }
  };

  const addCsvForNewPlot = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a CSV file.");
    const formData = new FormData();
    formData.append("propertyid", propertyKey);
    formData.append("csv", file);
    try {
      const res = await fetch(
        `${URI}/project-partner/properties/additionalinfo/plot/csv/add/${propertyKey}`,
        { method: "POST", credentials: "include", body: formData },
      );
      const data = await res.json();
      if (!res.ok) return alert(data.message || "CSV upload failed.");
      alert(data.message || "CSV uploaded.");
      setShowNewPlotAdditionalInfoForm(false);
      setFile(null);
    } catch (e) {
      console.error(e);
      alert("Upload error.");
    }
  };

  const showPropertyCommission = async (id) => {
    try {
      const res = await fetch(URI + `/project-partner/properties/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPropertyCommission({
        commissionType: data.commissionType || "",
        commissionAmount: data.commissionAmount || "",
        commissionPercentage: data.commissionPercentage || "",
        commissionAmountPerSquareFeet: data.commissionAmountPerSquareFeet || "",
      });
      setShowCommissionForm(true);
    } catch (e) {
      console.error(e);
    }
  };

  const addPropertyCommission = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(
        URI + `/project-partner/properties/commission/${propertyKey}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(propertyCommission),
        },
      );
      const data = await res.json();
      alert(res.ok ? `Success: ${data.message}` : `Error: ${data.message}`);
      setShowCommissionForm(false);
      setPropertyCommission({
        commissionType: "",
        commissionAmount: "",
        commissionPercentage: "",
        commissionAmountPerSquareFeet: "",
      });
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ── Action handler ── */
  const handleAction = (action, propertyid, row) => {
    switch (action) {
      case "view":
        window.open(
          "https://www.reparv.in/property-info/" + row.seoSlug,
          "_blank",
        );
        break;
      case "status":
        status(propertyid);
        break;
      case "hotdeal":
        hotDeal(propertyid);
        break;
      case "update":
        edit(propertyid);
        break;
      case "delete":
        del(propertyid);
        break;
      case "updateLocation":
        setPropertyKey(propertyid);
        fetchPropertyLocation(propertyid);
        break;
      case "videoUpload":
        setPropertyKey(propertyid);
        showBrochure(propertyid);
        break;
      case "SEO":
        setPropertyKey(propertyid);
        showSEO(propertyid);
        break;
      case "rejectReason":
        setPropertyKey(propertyid);
        setShowRejectReasonForm(true);
        break;
      case "setCommission":
        setPropertyKey(propertyid);
        showPropertyCommission(propertyid);
        break;
      case "gotoadditionalinfo":
        navigate("/app/property/additional-info/" + propertyid);
        break;
      case "additionalinfo":
        setPropertyKey(propertyid);
        setShowAdditionalInfoForm(true);
        break;
      case "additionalinfoforplot":
        setPropertyKey(propertyid);
        setShowNewPlotAdditionalInfoForm(true);
        break;
      case "updateImages":
        setPropertyKey(propertyid);
        fetchImages(propertyid);
        break;
    }
  };

  /* ── Counts ── */
  const getPropertyCounts = (data) =>
    data.reduce(
      (acc, item) => {
        if (item.approve === "Approved") acc.Approved++;
        else if (item.approve === "Not Approved") acc.NotApproved++;
        else if (item.approve === "Rejected") acc.Rejected++;
        return acc;
      },
      { Approved: 0, NotApproved: 0, Rejected: 0 },
    );

  const propertyCounts = getPropertyCounts(datas);

  /* ── Filter ── */
  const filteredData = datas.filter((item) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      item.propertyName?.toLowerCase().includes(s) ||
      item.company_name?.toLowerCase().includes(s) ||
      item.propertyCategory?.toLowerCase().includes(s) ||
      item.state?.toLowerCase().includes(s) ||
      item.city?.toLowerCase().includes(s) ||
      item.approve?.toLowerCase().includes(s);

    let startDate = range[0].startDate;
    let endDate = range[0].endDate;
    if (startDate) startDate = new Date(startDate.setHours(0, 0, 0, 0));
    if (endDate) endDate = new Date(endDate.setHours(23, 59, 59, 999));
    const itemDate = parse(
      item.created_at,
      "dd MMM yyyy | hh:mm a",
      new Date(),
    );
    const matchesDate =
      (!startDate && !endDate) ||
      (startDate && endDate && itemDate >= startDate && itemDate <= endDate);

    const getStatus = () => {
      if (item.approve === "Approved") return "Approved";
      if (item.approve === "Not Approved") return "Not Approved";
      if (item.approve === "Rejected") return "Rejected";
      return "";
    };
    const matchesFilter = !propertyFilter || getStatus() === propertyFilter;
    return matchesSearch && matchesDate && matchesFilter;
  });

  useEffect(() => {
    fetchData();
    fetchStates();
  }, []);

  return (
    <div className="w-full min-h-screen pb-24 sm:pb-10 overflow-x-hidden">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 border-b">
        <PropertyHeader
          onSearch={setSearchTerm}
          onAddProperty={() => navigate("/app/property/add")}
          properties={filteredData}
        />
        <div className="w-full ">
          <div className="w-full px-4 py-3 flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
            <PropertyFilter counts={propertyCounts} />
            <div className="shrink-0 z-50">
              <CustomDateRangePicker range={range} setRange={setRange} />
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6">
          {/* Cards */}
          <section className="min-w-0 space-y-4">
            {filteredData.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-100 p-12 text-center text-slate-400 text-sm">
                No properties found.
              </div>
            ) : (
              filteredData.map((p) => (
                <PropertyCard
                  key={p.propertyid}
                  property={p}
                  onAction={handleAction}
                  onCommissionClick={() => {
                    setPropertyCommissionData(p);
                    setShowPropertyCommissionPopup(true);
                  }}
                />
              ))
            )}
          </section>

          {/* Sidebar */}
          <aside className="hidden xl:block w-[340px] space-y-6">
            <PropertySidebar properties={datas} counts={propertyCounts} />
          </aside>
        </div>
      </main>

      <PropertyModals
        showRejectReasonForm={showRejectReasonForm}
        setShowRejectReasonForm={setShowRejectReasonForm}
        showSeoForm={showSeoForm}
        setShowSeoForm={setShowSeoForm}
        showCommissionForm={showCommissionForm}
        setShowCommissionForm={setShowCommissionForm}
        showVideoUploadForm={showVideoUploadForm}
        setShowVideoUploadForm={setShowVideoUploadForm}
        showPropertyLocationForm={showPropertyLocationForm}
        setShowPropertyLocationForm={setShowPropertyLocationForm}
        showUpdateImagesForm={showUpdateImagesForm}
        setShowUpdateImagesForm={setShowUpdateImagesForm}
        showAdditionalInfoForm={showAdditionalInfoForm}
        setShowAdditionalInfoForm={setShowAdditionalInfoForm}
        showNewPlotAdditionalInfoForm={showNewPlotAdditionalInfoForm}
        setShowNewPlotAdditionalInfoForm={setShowNewPlotAdditionalInfoForm}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        seoSlug={seoSlug}
        setSeoSlug={setSeoSlug}
        pageTitle={pageTitle}
        setPageTitle={setPageTitle}
        seoTittle={seoTittle}
        setSeoTittle={setSeoTittle}
        seoDescription={seoDescription}
        setSeoDescription={setSeoDescription}
        propertyDescription={propertyDescription}
        setPropertyDescription={setPropertyDescription}
        propertyCommission={propertyCommission}
        setPropertyCommission={setPropertyCommission}
        videoUpload={videoUpload}
        setVideoUpload={setVideoUpload}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        latitude={latitude}
        setLatitude={setLatitude}
        longitude={longitude}
        setLongitude={setLongitude}
        images={images}
        setImages={setImages}
        fetchImages={fetchImages}
        newProperty={propertyImageData}
        imageFiles={imageFiles}
        setImageFiles={setImageFiles}
        propertyId={propertyId}
        setPropertyId={setPropertyId}
        propertyKey={propertyKey}
        setPropertyKey={setPropertyKey}
        file={file}
        setFile={setFile}
        newAddInfo={newAddInfo}
        setNewAddInfo={setNewAddInfo}
        selectedScheduledPropertyImage={selectedScheduledPropertyImage}
        setSelectedScheduledPropertyImage={setSelectedScheduledPropertyImage}
        selectedSignedDocumentImage={selectedSignedDocumentImage}
        setSelectedSignedDocumentImage={setSelectedSignedDocumentImage}
        selectedSatBaraImage={selectedSatBaraImage}
        setSelectedSatBaraImage={setSelectedSatBaraImage}
        selectedOwnerAdharImage={selectedOwnerAdharImage}
        setSelectedOwnerAdharImage={setSelectedOwnerAdharImage}
        selectedOwnerPanImage={selectedOwnerPanImage}
        setSelectedOwnerPanImage={setSelectedOwnerPanImage}
        selectedEBillImage={selectedEBillImage}
        setSelectedEBillImage={setSelectedEBillImage}
        onAddRejectReason={addRejectReason}
        onAddSeo={addSeoDetails}
        onAddCommission={addPropertyCommission}
        onUploadVideo={uploadVideo}
        onUpdateLocation={updatePropertyLocation}
        onAddImages={addImages}
        onAddCsv={addCsv}
        onAddCsvPlot={addCsvForNewPlot}
      />
    </div>
  );
}
