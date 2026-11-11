import { parse } from "date-fns";
import { useState, useEffect } from "react";
import { useAuth } from "../../store/auth";
import CustomersHeader from "../../components/customers/CustomersHeader";
import CustomersTabs from "../../components/customers/CustomersTabs";
import CustomerCard from "../../components/customers/CustomerCard";
import CustomerStats from "../../components/customers/CustomerStats";
import CustomerModals from "../../components/customers/CustomerModals";

const TABS = [
  { key: "all",    label: "All Customers",     count: null, countColor: "dark"   },
  { key: "token",  label: "Token",             count: null, countColor: "green"  },
  { key: "active", label: "Active",            count: null, countColor: "blue"   },
];

export default function Customers() {
  const {
    URI, role, setLoading,
    showCustomer, setShowCustomer,
    showCustomerPaymentForm, setShowCustomerPaymentForm,
  } = useAuth();

  const isProjectPartner = role === "Project Partner";
  const getBasePath = () => {
    if (role === "Project Partner") return "/project-partner";
    if (role === "Territory Partner") return "/territory-partner";
    return "/sales"; // Sales Partner
  };

  const [searchTerm, setSearchTerm]       = useState("");
  const [activeTab, setActiveTab]         = useState("all");
  const [customers, setCustomers]         = useState([]);
  const [customer, setCustomer]           = useState({});
  const [enquirerId, setEnquirerId]       = useState("");
  const [paymentList, setPaymentList]     = useState([]);
  const [totalPaid, setTotalPaid]         = useState(null);
  const [balancedAmount, setBalancedAmount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [customerPayment, setCustomerPayment] = useState({ paymentType: "", paymentAmount: "" });
  const [range, setRange] = useState([{ startDate: null, endDate: null, key: "selection" }]);

  /* ── helpers ── */
  const calculateBalance = (payments = [], cust) => {
    const tokenAmount = Number(cust.tokenamount) || 0;
    const dealAmount  = Number(cust.dealamount)  || 0;
    const paid = payments.reduce((sum, p) => sum + (Number(p.paymentAmount) || 0), tokenAmount);
    setTotalPaid(paid);
    setBalancedAmount(dealAmount - paid);
  };

  /* ── API ── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${URI}${getBasePath()}/customers`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error();
      setCustomers(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const viewCustomer = async (id) => {
    try {
      const res  = await fetch(`${URI}${getBasePath()}/customers/${id}`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCustomer(data);
      await fetchPaymentData(id, data);
      setShowCustomer(true);
    } catch (e) { console.error(e); }
  };

  const fetchPaymentData = async (id, cust) => {
    try {
      const res  = await fetch(`${URI}${getBasePath()}/customers/payment/get/${id}`, { method: "GET", credentials: "include", headers: { "Content-Type": "application/json" } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      calculateBalance(data, cust);
      setPaymentList(data);
    } catch (e) { console.error(e); }
  };

  const addCustomerPayment = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("paymentType",   customerPayment.paymentType);
    formData.append("paymentAmount", customerPayment.paymentAmount);
    if (selectedImage) formData.append("paymentImage", selectedImage);
    try {
      setLoading(true);
      const res  = await fetch(`${URI}${getBasePath()}/customers/payment/add/${enquirerId}`, { method: "POST", credentials: "include", body: formData });
      const data = await res.json();
      if (res.ok) {
        alert("Payment added successfully!");
        setCustomerPayment({ paymentType: "", paymentAmount: "" });
        setSelectedImage(null);
        setShowCustomerPaymentForm(false);
        await viewCustomer(enquirerId);
      } else { alert(`Error: ${data.message}`); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleAction = (action, id) => {
    if (action === "view")       { viewCustomer(id); }
    if (action === "addPayment") { setEnquirerId(id); setShowCustomerPaymentForm(true); }
  };

  useEffect(() => { fetchData(); }, []);

  /* ── filtering ── */
  const filteredData = customers.filter((item) => {
    const matchesSearch =
      item.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.paymenttype?.toLowerCase().includes(searchTerm.toLowerCase());

    let startDate = range[0].startDate;
    let endDate   = range[0].endDate;
    if (startDate) startDate = new Date(startDate.setHours(0, 0, 0, 0));
    if (endDate)   endDate   = new Date(endDate.setHours(23, 59, 59, 999));
    const itemDate = parse(item.created_at, "dd MMM yyyy | hh:mm a", new Date());
    const matchesDate = (!startDate && !endDate) || (startDate && endDate && itemDate >= startDate && itemDate <= endDate);

    return matchesSearch && matchesDate;
  });

  /* ── dynamic tab counts ── */
  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    count: t.key === "all" ? filteredData.length : null,
  }));

  return (
    <div className="min-h-screen flex flex-col">

      <CustomersHeader
        search={searchTerm}
        onSearch={setSearchTerm}
        filteredData={filteredData}
        range={range}
        setRange={setRange}
        total={filteredData.length}
      />

      <div className="bg-white border-b border-gray-100 px-4 md:px-8">
        <CustomersTabs tabs={tabsWithCounts} active={activeTab} onChange={setActiveTab} />
      </div>

      <div className="flex-1 px-4 sm:px-6 md:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 max-w-[1400px] mx-auto">

          {/* ── Cards ── */}
          <div className="flex-1 flex flex-col gap-4">
            {filteredData.length === 0 ? (
              <div className="bg-white rounded-lg border px-8 py-16 text-center text-slate-400 text-sm">
                No customers found.
              </div>
            ) : filteredData.map((c) => (
              <CustomerCard key={c.enquirersid} customer={c} onAction={handleAction} />
            ))}
          </div>

          {/* ── Sidebar ── */}
          <div className="w-full lg:w-[300px] xl:w-[320px] flex flex-col gap-4 shrink-0">
            <CustomerStats customers={customers} />
          </div>
        </div>
      </div>

      <CustomerModals
        showCustomer={showCustomer}
        setShowCustomer={setShowCustomer}
        showCustomerPaymentForm={showCustomerPaymentForm}
        setShowCustomerPaymentForm={setShowCustomerPaymentForm}
        customer={customer}
        paymentList={paymentList}
        totalPaid={totalPaid}
        balancedAmount={balancedAmount}
        enquirerId={enquirerId}
        setEnquirerId={setEnquirerId}
        customerPayment={customerPayment}
        setCustomerPayment={setCustomerPayment}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
        onAddPayment={addCustomerPayment}
      />
    </div>
  );
}