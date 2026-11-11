import { useState, useEffect } from "react";
import { parse } from "date-fns";
import { useAuth } from "../../store/auth";
import EnquiryHeader from "../../components/enquiries/EnquiryHeader";
import EnquiryTabs from "../../components/enquiries/EnquiryTabs";
import EnquiryCard from "../../components/enquiries/EnquiryCard";
import QuickStats from "../../components/enquiries/QuickStats";
import EnquiryModals from "../../components/enquiries/EnquiryModals";

export default function Enquiries() {
  const {
    URI,
    setLoading,
    isActiveSubscription,
    showAssignSalesForm,
    setShowAssignSalesForm,
    showEnquiryStatusForm,
    setShowEnquiryStatusForm,
    showEnquiry,
    setShowEnquiry,
    showEnquiryForm,
    setShowEnquiryForm,
    showCSVEnquiryForm,
    setShowCSVEnquiryForm,
    showEnquirerPropertyForm,
    setShowEnquirerPropertyForm,
    enquiryFilter,
    setEnquiryFilter,
  } = useAuth();

  const [datas, setDatas] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("");
  const [remarkList, setRemarkList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [enquiryId, setEnquiryId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [file, setFile] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [enquiry, setEnquiry] = useState({});
  const [enquiryStatus, setEnquiryStatus] = useState("");
  const [salesPersonList, setSalesPersonList] = useState([]);
  const [salesPersonAssign, setSalesPersonAssign] = useState({
    salespersonid: "",
    salesperson: "",
    salespersoncontact: "",
    state: "",
    city: "",
  });
  const [followUpRemark, setFollowUpRemark] = useState("");
  const [cancelledRemark, setCancelledRemark] = useState("");
  const [visitRemark, setVisitRemark] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [token, setToken] = useState({
    paymenttype: "",
    tokenamount: "",
    dealamount: "",
    remark: "",
  });
  const [selectedSource, setSelectedSource] = useState("Select Enquiry Source");
  const [error, setError] = useState("");
  const [properties, setProperties] = useState([]);
  const [propertyList, setPropertyList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newEnquiry, setNewEnquiry] = useState({
    propertyid: null,
    customer: "",
    contact: "",
    minbudget: "",
    maxbudget: "",
    category: "",
    state: "",
    city: "",
    location: "",
    message: "",
  });
  const [range, setRange] = useState([
    { startDate: null, endDate: null, key: "selection" },
  ]);

  /* ── API ── */
  const fetchStates = async () => {
    try {
      const res = await fetch(URI + "/admin/states", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      setStates(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await fetch(
        `${URI}/admin/cities/${newEnquiry?.state || salesPersonAssign?.state}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!res.ok) throw new Error();
      setCities(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${URI}/project-partner/enquirers/get/${selectedSource}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!res.ok) throw new Error();
      setDatas(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnquiryRemarkList = async (id) => {
    try {
      const res = await fetch(
        URI + "/project-partner/enquirers/remark/list/" + id,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!res.ok) throw new Error();
      setRemarkList(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProperties = async () => {
    try {
      setError("");
      const res = await fetch(URI + "/project-partner/enquirers/properties", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minbudget: newEnquiry.minbudget,
          maxbudget: newEnquiry.maxbudget,
          state: newEnquiry.state,
          city: newEnquiry.city,
          category: newEnquiry.category,
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message);
      }
      const list = await res.json();
      list.data.length === 0
        ? (setError("Properties not found based on your requirement."),
          setProperties([]))
        : setProperties(list.data);
    } catch (e) {
      setError(e.message || "Something went wrong.");
      setProperties([]);
    }
  };

  const fetchPropertyList = async (id) => {
    try {
      const res = await fetch(
        URI + "/project-partner/enquirers/property/list/" + id,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!res.ok) throw new Error();
      setPropertyList(await res.json());
      setShowEnquirerPropertyForm(true);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSalesPersonList = async () => {
    try {
      const res = await fetch(URI + "/project-partner/sales/active", {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      setSalesPersonList(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  const viewEnquiry = async (id) => {
    try {
      const res = await fetch(URI + `/project-partner/enquirers/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      setEnquiry(await res.json());
      setShowEnquiry(true);
    } catch (e) {
      console.error(e);
    }
  };

  const addEnquiry = async (e) => {
    e.preventDefault();
    const endpoint = newEnquiry.enquirersid
      ? `update/enquiry/${newEnquiry.enquirersid}`
      : "add/enquiry";
    try {
      setLoading(true);
      const res = await fetch(`${URI}/project-partner/enquiry/${endpoint}`, {
        method: newEnquiry.enquirersid ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEnquiry),
      });
      if (res.status === 409) alert("Enquiry already exists!");
      else if (!res.ok) throw new Error();
      else alert(newEnquiry.enquirersid ? "Updated!" : "Added!");
      setNewEnquiry({
        propertyid: null,
        customer: "",
        contact: "",
        minbudget: "",
        maxbudget: "",
        category: "",
        state: "",
        city: "",
        location: "",
        message: "",
      });
      setShowEnquiryForm(false);
      await fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const editEnquiry = async (id) => {
    try {
      const res = await fetch(`${URI}/project-partner/enquirers/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      setNewEnquiry(await res.json());
      setShowEnquiryForm(true);
    } catch (e) {
      console.error(e);
    }
  };

  const toDigitalBroker = async (id) => {
    if (!window.confirm("Convert this Enquiry to Digital Broker?")) return;
    try {
      const res = await fetch(
        URI + `/project-partner/enquirers/convert/to/digital-broker/${id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await res.json();
      alert(res.ok ? `Success: ${data.message}` : `Error: ${data.message}`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const addCsv = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a CSV file.");
    const formData = new FormData();
    formData.append("csv", file);
    try {
      const res = await fetch(`${URI}/project-partner/enquiry/csv/add`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      fetchData();
      setShowCSVEnquiryForm(false);
      if (!res.ok) throw new Error(data.message);
      alert(data.message);
    } catch (e) {
      console.error(e);
      alert("Upload failed!");
    }
  };

  const deleteEnquiry = async (id) => {
    if (!window.confirm("Delete this Enquiry?")) return;
    try {
      setLoading(true);
      const res = await fetch(URI + `/project-partner/enquirers/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
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

  const assignSalesPerson = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Assign to ${salesPersonAssign.salesperson}?`)) return;
    try {
      setLoading(true);
      const res = await fetch(
        URI + `/project-partner/enquirers/assign/${enquiryId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(salesPersonAssign),
        },
      );
      const data = await res.json();
      alert(res.ok ? `Success: ${data.message}` : `Error: ${data.message}`);
      setSalesPersonAssign({
        salespersonid: "",
        salesperson: "",
        salespersoncontact: "",
      });
      setShowAssignSalesForm(false);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const changeEnquiryStatus = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (enquiryStatus === "Visit Scheduled") {
      if (!visitDate || !visitRemark) return alert("All Fields Are Required!");
      try {
        const res = await fetch(
          `${URI}/project-partner/enquirers/visitscheduled/${enquiryId}`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ visitDate, visitRemark, enquiryStatus }),
          },
        );
        const data = await res.json();
        alert(res.ok ? `Success: ${data.message}` : `Error: ${data.message}`);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (enquiryStatus === "Token") {
      if (!token.dealamount || !token.paymenttype || !token.remark)
        return alert("All Fields Are Required!");
      const formData = new FormData();
      Object.entries(token).forEach(([k, v]) => formData.append(k, v));
      formData.append("enquiryStatus", enquiryStatus);
      if (selectedImage) formData.append("paymentimage", selectedImage);
      try {
        const res = await fetch(
          `${URI}/project-partner/enquirers/token/${enquiryId}`,
          { method: "POST", credentials: "include", body: formData },
        );
        const data = await res.json();
        res.ok
          ? (alert(`Success: ${data.message}`),
            setToken({
              paymenttype: "",
              tokenamount: "",
              dealamount: "",
              remark: "",
            }))
          : alert(`Error: ${data.message}`);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (enquiryStatus === "Follow Up") {
      if (!followUpRemark) return alert("All Fields Are Required!");
      try {
        const res = await fetch(
          `${URI}/project-partner/enquirers/followup/${enquiryId}`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ followUpRemark, visitDate, enquiryStatus }),
          },
        );
        const data = await res.json();
        res.ok
          ? (alert(`Success: ${data.message}`),
            setFollowUpRemark(""),
            setVisitDate(""))
          : alert(`Error: ${data.message}`);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (enquiryStatus === "Cancelled") {
      if (!cancelledRemark) return alert("All Fields Are Required!");
      try {
        const res = await fetch(
          `${URI}/project-partner/enquirers/cancelled/${enquiryId}`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cancelledRemark, enquiryStatus }),
          },
        );
        const data = await res.json();
        res.ok
          ? (alert(`Success: ${data.message}`), setCancelledRemark(""))
          : alert(`Error: ${data.message}`);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (!window.confirm("Change Enquiry status?")) return;
    try {
      const res = await fetch(
        `${URI}/project-partner/enquirers/status/${enquiryId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enquiryStatus }),
        },
      );
      const data = await res.json();
      res.ok
        ? (alert(`Success: ${data.message}`),
          setShowEnquiryStatusForm(false),
          fetchData())
        : alert(`Error: ${data.message}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updatePropertyToEnquiry = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch(
        URI + `/project-partner/enquirers/property/update/${enquiryId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId }),
        },
      );
      const data = await res.json();
      alert(res.ok ? `Success: ${data.message}` : `Error: ${data.message}`);
      setPropertyId("");
      setShowEnquirerPropertyForm(false);
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ── Action handler passed to cards ── */
  const handleAction = (action, id, row) => {
    switch (action) {
      case "view":
        viewEnquiry(id);
        fetchEnquiryRemarkList(id);
        break;
      case "status":
        setEnquiryId(id);
        setShowEnquiryStatusForm(true);
        break;
      case "property":
        setEnquiryId(id);
        fetchPropertyList(id);
        break;
      case "assign":
        setEnquiryId(id);
        setShowAssignSalesForm(true);
        break;
      case "todigitalbroker":
        toDigitalBroker(id);
        break;
      case "update":
        editEnquiry(id);
        break;
      case "delete":
        deleteEnquiry(id);
        break;
    }
  };

  /* ── Counts ── */
  const getEnquiryCounts = (data) =>
    data.reduce(
      (acc, item) => {
        if (item.salesbroker || item.territorybroker || item.projectbroker)
          acc.DigitalBroker++;
        else if (!item.salespersonid && !item.territorypartnerid) acc.New++;
        else if (item.salespersonid && !item.territorypartnerid) acc.Alloted++;
        else if (item.salespersonid && item.territorypartnerid) acc.Assign++;
        return acc;
      },
      { New: 0, Alloted: 0, Assign: 0, DigitalBroker: 0 },
    );

  const enquiryCounts = getEnquiryCounts(datas);

  /* ── Tabs derived from counts ── */
  const tabs = [
    { label: "All", count: datas.length },
    { label: "New", count: enquiryCounts.New },
    { label: "Alloted", count: enquiryCounts.Alloted },
    { label: "Assign", count: enquiryCounts.Assign },
    { label: "Digital Broker", count: enquiryCounts.DigitalBroker },
  ];

  /* ── Filtering ── */
  const filteredData = datas.filter((item) => {
    const matchesStatus = item.status
      ?.toLowerCase()
      .includes(selectedFilter.toLowerCase());
    const matchesSearch =
      item.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assign?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.territoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.source?.toLowerCase().includes(searchTerm.toLowerCase());

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

    const getEnquiryStatus = () => {
      if (item.salesbroker || item.territorybroker || item.projectbroker)
        return "Digital Broker";
      if (!item.salespersonid && !item.territorypartnerid) return "New";
      if (item.salespersonid && !item.territorypartnerid) return "Alloted";
      if (item.salespersonid && item.territorypartnerid) return "Assign";
      return "";
    };
    const matchesEnquiry =
      !enquiryFilter ||
      enquiryFilter === "All" ||
      getEnquiryStatus() === enquiryFilter;
    return matchesStatus && matchesSearch && matchesDate && matchesEnquiry;
  });

  /* ── Effects ── */
  useEffect(() => {
    fetchData();
  }, [selectedSource]);
  useEffect(() => {
    fetchData();
    fetchStates();
    fetchSalesPersonList();
  }, [showAssignSalesForm]);
  useEffect(() => {
    if (newEnquiry.state || salesPersonAssign.state) fetchCities();
  }, [newEnquiry.state, salesPersonAssign.state]);
  useEffect(() => {
    if (
      newEnquiry.minbudget &&
      newEnquiry.maxbudget &&
      newEnquiry.category &&
      newEnquiry.state &&
      newEnquiry.city
    )
      fetchProperties();
  }, [
    newEnquiry.minbudget,
    newEnquiry.maxbudget,
    newEnquiry.category,
    newEnquiry.state,
    newEnquiry.city,
  ]);

  const enquirersCSVFileFormat = [
    {
      customer: "Customer Name",
      contact: 9200000000,
      minbudget: 1000000,
      maxbudget: 10000000000,
      category: "NewFlat",
      state: "Maharashtra",
      city: "Nagpur",
      location: "Nagpur",
      message: "ASAP",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <EnquiryHeader
          search={searchTerm}
          setSearch={setSearchTerm}
          selectedSource={selectedSource}
          setSelectedSource={setSelectedSource}
          onAddEnquiry={() => setShowEnquiryForm(true)}
          onAddCSV={() => setShowCSVEnquiryForm(true)}
          filteredData={filteredData}
          range={range}
          setRange={setRange}
        />

        <EnquiryTabs
          tabs={tabs}
          activeTab={enquiryFilter || "All"}
          setActiveTab={(tab) => setEnquiryFilter(tab === "All" ? "" : tab)}
        />

        <div className="w-full grid p-4 sm:p-6 xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="col-span-1 xl:col-span-2 space-y-4">
            {filteredData.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                No enquiries found.
              </div>
            ) : (
              filteredData.map((item) => (
                <EnquiryCard
                  key={item.enquirersid}
                  item={item}
                  isActiveSubscription={isActiveSubscription}
                  onAction={handleAction}
                  enquiryFilter={enquiryFilter}
                />
              ))
            )}
          </div>

          <div className="space-y-6 hidden xl:block">
            <QuickStats counts={enquiryCounts} total={datas.length} setActiveTab={setEnquiryFilter} />
          </div>
        </div>
      </div>

      <EnquiryModals
        // visibility
        showEnquiryForm={showEnquiryForm}
        setShowEnquiryForm={setShowEnquiryForm}
        showCSVEnquiryForm={showCSVEnquiryForm}
        setShowCSVEnquiryForm={setShowCSVEnquiryForm}
        showAssignSalesForm={showAssignSalesForm}
        setShowAssignSalesForm={setShowAssignSalesForm}
        showEnquiryStatusForm={showEnquiryStatusForm}
        setShowEnquiryStatusForm={setShowEnquiryStatusForm}
        showEnquirerPropertyForm={showEnquirerPropertyForm}
        setShowEnquirerPropertyForm={setShowEnquirerPropertyForm}
        showEnquiry={showEnquiry}
        setShowEnquiry={setShowEnquiry}
        // form state
        newEnquiry={newEnquiry}
        setNewEnquiry={setNewEnquiry}
        enquiryStatus={enquiryStatus}
        setEnquiryStatus={setEnquiryStatus}
        salesPersonAssign={salesPersonAssign}
        setSalesPersonAssign={setSalesPersonAssign}
        salesPersonList={salesPersonList}
        propertyId={propertyId}
        setPropertyId={setPropertyId}
        propertyList={propertyList}
        properties={properties}
        error={error}
        states={states}
        cities={cities}
        file={file}
        setFile={setFile}
        enquirersCSVFileFormat={enquirersCSVFileFormat}
        token={token}
        setToken={setToken}
        visitDate={visitDate}
        setVisitDate={setVisitDate}
        visitRemark={visitRemark}
        setVisitRemark={setVisitRemark}
        followUpRemark={followUpRemark}
        setFollowUpRemark={setFollowUpRemark}
        cancelledRemark={cancelledRemark}
        setCancelledRemark={setCancelledRemark}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        enquiry={enquiry}
        remarkList={remarkList}
        // handlers
        onAddEnquiry={addEnquiry}
        onAddCsv={addCsv}
        onAssignSales={assignSalesPerson}
        onChangeStatus={changeEnquiryStatus}
        onUpdateProperty={updatePropertyToEnquiry}
      />
    </div>
  );
}
