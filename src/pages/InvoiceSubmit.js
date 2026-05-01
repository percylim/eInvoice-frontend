import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/apiClient";

export default function EInvoiceSubmit() {
  const { invoiceNo } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await api.post(`/einvoice/submit/${invoiceNo}`);
      alert("Submitted!");
      navigate(`/status/${invoiceNo}`);
    } catch (err) {
      alert("Error submitting");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Submit Invoice: {invoiceNo}</h2>

      <button onClick={handleSubmit}>
        🚀 Submit to LHDN
      </button>
    </div>
  );
}