import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function InvoiceStatus() {
  const { invoiceNo } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingLhdn, setCheckingLhdn] = useState(false);
  const url = process.env.REACT_APP_SERVER_URL || 'http://localhost:3000';
  const companyID = localStorage.getItem('companyID');
  useEffect(() => {
    loadStatus();
  }, [invoiceNo]);

  const loadStatus = async () => {
    try {
      const response = await axios.get(url+`/api/einvoice/status/${invoiceNo}`, {
        params: { companyID: companyID }
      });
      setStatus(response.data);
    } catch (error) {
      console.error("Error loading status:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkLhdnStatus = async () => {
    setCheckingLhdn(true);
    try {
      const response = await axios.get(url+`/api/einvoice/check-lhdn-status/${invoiceNo}`, {
        params: { companyID: companyID }
      });
      setStatus(response.data);
      alert(`Status updated: ${response.data.lhdn_status}`);
      loadStatus(); // Refresh
    } catch (error) {
      alert("Failed to check status: " + error.message);
    } finally {
      setCheckingLhdn(false);
    }
  };

  const getStatusIcon = (statusCode) => {
    switch(statusCode) {
      case 'VALIDATED': return '✅';
      case 'SUBMITTED': return '⏳';
      case 'REJECTED': return '❌';
      case 'CANCELLED': return '🚫';
      default: return '📝';
    }
  };

  const getStatusColor = (statusCode) => {
    switch(statusCode) {
      case 'VALIDATED': return '#28a745';
      case 'SUBMITTED': return '#ffc107';
      case 'REJECTED': return '#dc3545';
      case 'CANCELLED': return '#6c757d';
      default: return '#17a2b8';
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!status) return <div style={{ padding: 20 }}>Status not found</div>;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ backgroundColor: 'black', color: 'white', textAlign: 'center'}}>E-Invoice Status</h2>
        
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{
            fontSize: 64,
            display: 'inline-block',
            padding: 20,
            borderRadius: '50%',
            backgroundColor: getStatusColor(status.lhdn_status) + '20'
          }}>
            {getStatusIcon(status.lhdn_status)}
          </div>
          <h1 style={{ color: getStatusColor(status.lhdn_status) }}>
            {status.lhdn_status}
          </h1>
        </div>

        <div style={{ backgroundColor: '#f8f9fa', padding: 20, borderRadius: 8 }}>
          <h3>Invoice Details</h3>
          <p><strong>Invoice No:</strong> {status.invoiceNo}</p>
          <p><strong>Customer:</strong> {status.customerName}</p>
          <p><strong>Total Amount:</strong> RM {status.itemNetTotal?.toFixed(2)}</p>
          <p><strong>Submission Date:</strong> {status.lhdn_submitted_at ? new Date(status.lhdn_submitted_at).toLocaleString() : 'Not submitted'}</p>
          
          {status.lhdn_uuid && (
            <>
              <p><strong>LHDN UUID:</strong> <code>{status.lhdn_uuid}</code></p>
              <p><strong>Validation Date:</strong> {status.lhdn_validated_at ? new Date(status.lhdn_validated_at).toLocaleString() : 'Pending'}</p>
            </>
          )}
          
          {status.lhdn_error && (
            <div style={{ backgroundColor: '#f8d7da', padding: 10, borderRadius: 4, marginTop: 10 }}>
              <p style={{ color: '#721c24', margin: 0 }}><strong>Error:</strong> {status.lhdn_error}</p>
            </div>
          )}
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          {status.lhdn_uuid && (
            <button onClick={checkLhdnStatus} disabled={checkingLhdn} style={{ flex: 1, padding: 10 }}>
              {checkingLhdn ? 'Checking...' : '🔄 Check Latest Status'}
            </button>
          )}
          
          {status.lhdn_status === 'REJECTED' && (
            <button 
              onClick={() => navigate(`/einvoice/edit/${invoiceNo}`)} 
              style={{ flex: 1, padding: 10, backgroundColor: '#ffc107' }}
            >
              ✏️ Edit & Re-submit
            </button>
          )}
          
          <button onClick={() => navigate('/einvoice')} style={{ flex: 1, padding: 10 }}>
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
}