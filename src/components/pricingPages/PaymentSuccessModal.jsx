import React from "react";
import {
  Check,
  Download,
  FileText,
  ArrowRight,
  CreditCardIcon,
  User,
  FileCheck,
  Briefcase,
} from "lucide-react";
import { useAuth } from "../../store/auth";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import logo from "../../assets/billlogo.png";

function PaymentSuccessModal() {
  const { purchaseData } = useAuth();
  // const purchaseData = {
  //   paymentDetails: {
  //     razorpay_order_id: "order_SHgOh3LBxEoTNn",
  //     razorpay_payment_id: "pay_SHgPJzm4d00aMN",
  //   },

  //   selectedPlan: {
  //     id: 19,
  //     planName: "Project Starter",
  //     planDuration: "3 Months",
  //     partnerType: "Project Partner",
  //     gst: 5000,
  //     totalPrice: 1,
  //     billPrice: 53097,
  //     discount: 53097,
  //     discountApplied: 53097,
  //     redeemCode: "TESTTT",

  //     startDate: "2026-02-17T18:30:00.000Z",
  //     endDate: "2026-02-18T18:30:00.000Z",
  //     status: "Active",

  //     highlight: "True",

  //     features:
  //       "Minimum 300 Leads, 15–20 Site Visits, Monthly Sales Training (1 Session), Common Relationship Manager, Marketing Material, 1 Social Media Post / Month, 1 Social Media Video Reel, Follow-up Tracker, Digital Broker System, Daily Work Tracker, Lead Management System, Digital Profile, Team Management Support, Personalised Landing Page, Business Community Access",

  //     firstImage: "/uploads/subscriptionBanners/1763894332884.jpg",
  //     secondImage: null,
  //     thirdImage: null,

  //     created_at: "2025-11-23T10:38:52.000Z",
  //     updated_at: "2026-01-30T22:11:53.000Z",
  //   },

  //   subscriptionDetails: {
  //     success: true,
  //   },

  //   userDetails: {
  //     fullname: "TESTTS",
  //     username: "9637295908eemake it objetct data",
  //     email: "TEST@gmail.com",
  //     contact: "7458963214",
  //     city: "Gandhinagar",
  //     state: "Gujarat",
  //     intrest: "kbjf ,reh fjer",
  //     password: "Kiran@2226012",
  //     refrence: "",
  //   },
  // };
  console.log(purchaseData, "pp");

  const navigate = useNavigate();

  if (!purchaseData || !purchaseData.selectedPlan) {
    navigate("/");
    return null;
  }

  const { selectedPlan, paymentDetails, userDetails } = purchaseData;
  const tprice = Number(selectedPlan?.totalPrice);
  const tgst = Math.round(tprice * 0.18);
  const tsubtotal = tprice;
  const tdiscount = Number(selectedPlan.discountApplied || 0);
  const ttotal = tsubtotal + tgst - tdiscount;

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatINR = (num) =>
    Number(num || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const handleDownloadInvoice = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    const purple = [124, 58, 237];
    const lightPurple = [236, 233, 254];
    const gray = [107, 114, 128];
    const dark = [31, 41, 55];
    const green = [34, 197, 94];

    const { selectedPlan, paymentDetails, userDetails } = purchaseData;

    const formatINR = (num) =>
      Number(num || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const price = Number(selectedPlan?.totalPrice);
    const gst = Math.round(price * 0.18);
    const subtotal = price;
    const discount = Number(selectedPlan.discountApplied || 0);
    const total = subtotal + gst - discount;

    let y = 20;

    /* ================= HEADER LEFT ================= */

    doc.addImage(logo, "PNG", 20, y - 5, 28, 14);

    doc.setFontSize(10);
    doc.setTextColor(...gray);
    doc.text("Reparv Technologies Pvt Ltd", 20, y + 15);
    doc.text(
      "Plot No. 11, Third Bus Stop, Gorle Layout,Trimurti Nagar,",
      20,
      y + 20,
    );
    doc.text("Nagpur, Maharashtra, India, 440022", 20, y + 25);

    /* ================= HEADER RIGHT ================= */

    doc.setFontSize(30);
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - 60, y + 5);

    // PAID badge
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(pageWidth - 55, y + 12, 30, 8, 4, 4, "F");
    doc.setFontSize(10);
    doc.setTextColor(...green);
    doc.text("PAID", pageWidth - 46, y + 18);

    doc.setFontSize(10);
    doc.setTextColor(...gray);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice #: INV-${Date.now()}`, pageWidth - 70, y + 30);
    doc.text(
      `Date: ${new Date().toLocaleDateString("en-IN")}`,
      pageWidth - 70,
      y + 36,
    );
    doc.text(
      `Transaction ID: ${paymentDetails.razorpay_payment_id}`,
      pageWidth - 70,
      y + 42,
    );

    y += 55;
    doc.setDrawColor(230);
    doc.line(20, y, pageWidth - 20, y);

    y += 15;

    /* ================= BILL SECTION ================= */

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...gray);
    doc.text("BILL TO", 20, y);
    doc.text("BILLING ADDRESS", 110, y);

    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...dark);

    doc.setFontSize(12);
    doc.text(userDetails.fullname, 20, y);

    doc.setFontSize(10);
    doc.setTextColor(...gray);
    doc.text(userDetails.email, 20, y + 6);
    doc.text(userDetails.contact, 20, y + 12);

    doc.setTextColor(...dark);
    doc.text(`${userDetails.city}, ${userDetails.state}`, 110, y);

    y += 25;

    /* ================= TABLE LAYOUT SYSTEM ================= */

    const tableLeft = 20;
    const tableRight = pageWidth - 20;
    const tableWidth = tableRight - tableLeft;

    const col = {
      description: tableLeft + 10,
      duration: tableLeft + 120,
      price: tableLeft + 150,
      qty: tableLeft + 175,
      gst: tableLeft + 195,
      total: tableRight - 10,
    };

    const headerHeight = 14;
    const rowHeight = 26;

    /* ================= TABLE HEADER ================= */

    doc.setFillColor(240, 240, 255);
    doc.rect(15, y, pageWidth - 30, 10, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...gray);

    doc.text("PLAN DESCRIPTION", 18, y + 7);
    doc.text("DURATION", 95, y + 7);
    doc.text("PRICE", 115, y + 7);
    doc.text("QTY", 135, y + 7);
    doc.text("GST (18%)", 150, y + 7);
    doc.text("TOTAL", 175, y + 7);

    y += 12;

    /* ================= TABLE ROW ================= */
    const rowTop = y;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...dark);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...dark);
    doc.text(selectedPlan.planName, 18, rowTop + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...gray);
    doc.text(
      "Full access to dashboard & lead management",

      18,
      rowTop + 12,
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...dark);
    doc.text(selectedPlan.planDuration, 95, y + 3);
    doc.text(`Rs.${subtotal}`, 115, y + 3);
    doc.text("1", 135, y + 3);
    doc.text(`Rs.${gst}`, 150, y + 3);
    doc.text(`Rs.${subtotal + gst}`, 175, y + 3);

    y += 15;

    doc.setDrawColor(230);
    doc.line(15, y, pageWidth - 15, y);

    y += 15;

    // /* ================= SEPARATOR ================= */

    // doc.setDrawColor(230);
    // doc.setLineWidth(0.5);
    // doc.line(tableLeft, y, tableRight, y);

    // y += 18;

    /* ================= TOTAL SUMMARY (FIGMA MATCH) ================= */

    const summaryLabelX = tableRight - 85;
    const summaryValueX = tableRight - 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...gray);

    doc.text("Subtotal", summaryLabelX, y);
    doc.text(`Rs.${formatINR(subtotal)}`, summaryValueX, y, {
      align: "right",
    });

    y += 8;

    doc.text("GST (18%)", summaryLabelX, y);
    doc.text(`Rs.${formatINR(gst)}`, summaryValueX, y, { align: "right" });

    y += 8;

    doc.setTextColor(...green);
    doc.text("Promotional Discount", summaryLabelX, y);
    doc.text(`- Rs.${formatINR(discount)}`, summaryValueX, y, {
      align: "right",
    });

    y += 12;

    /* Divider above total */
    doc.setDrawColor(230);
    doc.line(summaryLabelX - 5, y, tableRight, y);

    y += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...purple);

    doc.text("Total Amount", summaryLabelX - 5, y);
    doc.text(`Rs.${formatINR(total)}`, summaryValueX, y, {
      align: "right",
    });

    y += 10;

    /* ================= PAYMENT ================= */

    doc.setDrawColor(230);
    doc.line(20, y, pageWidth - 20, y);

    y += 15;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.setFontSize(11);
    doc.text("Payment Method", 20, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);

    doc.text(`Gateway: Razorpay`, 20, y + 12);
    doc.text(
      `Transaction ID: ${paymentDetails?.razorpay_payment_id}`,
      20,
      y + 18,
    );
    doc.text(`Status: Successful`, 20, y + 24);
    doc.text(`Date: ${new Date().toLocaleString("en-IN")}`, 20, y + 30);
    doc.setTextColor(...gray);
    doc.text(
      `Renewal Date: ${new Date(selectedPlan.endDate).toLocaleDateString(
        "en-IN",
      )}`,
      pageWidth - 70,
      y,
    );

    y += 30;

    /* ================= TERMS ================= */

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text("Terms & Conditions", 20, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...gray);
    doc.setFontSize(9);
    doc.text(
      "This is a system generated invoice and does not require a physical signature.",
      20,
      y + 12,
    );
    doc.text("Subscriptions are non-refundable once activated.", 20, y + 16);

    doc.save(`Invoice_${paymentDetails.razorpay_payment_id}.pdf`);
  };

  return (
    <div className="min-h-screen mt-6 md:mt-10 bg-[#f5f6fa] flex flex-col items-center py-10 md:py-16 px-4">
      {/* Success Card */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-5 sm:p-6 md:p-10">
        {/* Success Icon */}
        <div className="flex justify-center mb-5 md:mb-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-green-100 flex items-center justify-center">
            <Check
              className="w-8 h-8 md:w-10 md:h-10 text-green-600"
              strokeWidth={3}
            />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center text-gray-900 mb-3 md:mb-4">
          Payment Successful!
        </h2>

        <p className="text-gray-500 text-sm sm:text-base text-center max-w-xl mx-auto mb-6 md:mb-8 px-2">
          Your subscription has been confirmed. Welcome to the Reparv Partner
          Network. A receipt has been sent to your email.
        </p>

        {/* Subscription Details */}
        <div className="bg-[#f7f8fa] rounded-xl p-4 md:p-6 mb-6 text-sm">
          <ResponsiveRow
            label="Plan Subscription"
            value={`${selectedPlan.planName} (${selectedPlan.planDuration})`}
          />

          <ResponsiveRow label="Amount Paid" value={`₹${ttotal}`} />

          <div className="flex flex-col sm:flex-row sm:justify-between mb-4 gap-1 sm:gap-0">
            <span className="text-gray-500">Payment Method</span>
            <span className="font-semibold text-gray-900 flex items-center gap-2 break-words">
              Online Payment
              <CreditCardIcon className="w-4 h-4 text-gray-400" />
            </span>
          </div>

          <hr className="my-4" />

          <ResponsiveRow
            label="Transaction ID"
            value={paymentDetails?.razorpay_payment_id}
          />

          <ResponsiveRow
            label="Subscription Start"
            value={formatDate(selectedPlan.startDate)}
          />
        </div>

        {/* User Details */}
        <div className="bg-[#f7f8fa] rounded-xl p-4 md:p-6 mb-8 text-sm">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
            Registered User Details
          </h3>

          {[
            ["Full Name", userDetails?.fullname],
            ["Username", userDetails?.username],
            ["Email", userDetails?.email],
            ["Contact", userDetails?.contact],
            ["City", userDetails?.city],
            ["State", userDetails?.state],
          ].map(([label, value], index) => (
            <ResponsiveRow key={index} label={label} value={value} />
          ))}
        </div>

        {/* Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => navigate("https://projectpartner.reparv.in/")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 md:px-8 py-3 rounded-lg font-medium shadow hover:opacity-95 transition"
          >
            Go to Partner Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Links */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 text-gray-400 text-sm">
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2 hover:text-gray-600"
          >
            <Download className="w-4 h-4" />
            Download Invoice
          </button>
          {/* 
          <button onClick={} className="flex items-center gap-2 hover:text-gray-600">
            <FileText className="w-4 h-4" />
            View Subscription
          </button> */}
        </div>
      </div>
    </div>
  );
}

const ResponsiveRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between mb-4 gap-1 sm:gap-0">
    <span className="text-gray-500">{label}</span>
    <span className="font-semibold text-gray-900 break-words text-left sm:text-right">
      {value}
    </span>
  </div>
);

export default PaymentSuccessModal;
