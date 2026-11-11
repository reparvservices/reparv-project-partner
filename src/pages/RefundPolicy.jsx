import React from "react";

const RefundPolicy = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-10 lg:px-20 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Cancellation and Refund Policy</h1>

      <p className="mb-4">
        At Reparv Services Private Limited, we value transparency and aim to
        provide a smooth experience for both customers and freelance partners.
        This Cancellation and Refund Policy outlines the conditions under which
        services or transactions may be canceled and/or refunded on our
        platform www.reparv.in.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        1. Property Booking or Consultation Cancellation (Customers)
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Free Cancellations:</strong> Customers can cancel inquiries or
          scheduled consultations with freelance partners (e.g., Sales Partners,
          Project Partners) free of charge if canceled at least 24 hours before
          the appointment.
        </li>
        <li>
          <strong>Short-Notice Cancellations:</strong> Cancellations made within
          24 hours of the appointment may not be eligible for a refund,
          especially if the partner has already committed time or resources.
        </li>
        <li>
          <strong>Service Fees:</strong> If any booking or consultation fee was
          charged, the refund will be processed minus any applicable service
          charges or taxes.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        2. Paid Property-Related Services (e.g., site visits, documentation assistance)
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <strong>Refund Eligibility:</strong> Paid services may be eligible for
          a full or partial refund if:
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>The service was not delivered as promised.</li>
            <li>
              The cancellation request is made at least 48 hours before the
              scheduled service.
            </li>
          </ul>
        </li>
        <li>
          <strong>Non-Refundable Situations:</strong>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>
              Customer dissatisfaction based on factors beyond our control (e.g.,
              property not meeting expectations).
            </li>
            <li>Change of mind after service has been rendered.</li>
            <li>No-shows for scheduled appointments or site visits.</li>
          </ul>
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        3. Freelance Partner Cancellation (Sales/Project/Onboarding/Territory Partners)
      </h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Freelance partners may cancel an engagement due to unavoidable
          circumstances. However:
        </li>
        <li>Excessive cancellations may lead to penalties or suspension.</li>
        <li>
          Refunds to customers (if applicable) will be deducted from the
          partner’s commission or settlement.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Refund Process</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          Refunds, if applicable, will be processed to the original payment
          method within 7-10 business days.
        </li>
        <li>
          In case of delays, users can contact support@reparv.in with their
          reference ID and details.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Dispute Resolution</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          If there is a dispute regarding cancellation or refund, Reparv will
          review the case based on available evidence and take a fair decision.
        </li>
        <li>Our decision in such cases will be final and binding.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        6. Contact for Cancellations/Refunds
      </h2>
      <p className="mb-2">To request a cancellation or refund, please email us at:</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>support@reparv.in</li>
        <li>Your full name</li>
        <li>Transaction or booking ID</li>
        <li>Reason for cancellation</li>
        <li>Supporting documents (if any)</li>
      </ul>
    </div>
  );
};

export default RefundPolicy;
