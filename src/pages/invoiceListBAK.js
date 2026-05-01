import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

export default function InvoiceList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date("2020-01-01"));
  const [endDate, setEndDate] = useState(new Date("2026-12-31"));
  const [status, setStatus] = useState("NOT_SUBMITTED");
  const [searchTerm, setSearchTerm] = useState("");
  
  const navigate = useNavigate();
  const companyID = localStorage.getItem("companyID");
  const url = process.env.REACT_APP_SERVER_URL || 'http://localhost:3000';

  const fetchData = useCallback(() => {
    setLoading(true);
    
    axios
      .get(`${url}/api/einvoice/pending`, {
        params: {
          companyID: companyID,
          startDate: moment(startDate).format("YYYY-MM-DD"),
          endDate: moment(endDate).format("YYYY-MM-DD"),
          status: status,
          search: searchTerm,
        },
      })
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          setList(response.data);
        } else {
          setList([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
        alert("Failed to fetch data");
      });
  }, [companyID, startDate, endDate, status, searchTerm, url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Submit invoice to LHDN
  const handleSubmit = async (invoiceNo) => {
    if (!window.confirm(`Submit invoice ${invoiceNo} to LHDN?`)) return;
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${url}/api/einvoice/submit/${invoiceNo}`,
        { companyID }
      );
      
      if (response.data.success) {
        alert(`✅ Invoice ${invoiceNo} submitted successfully!`);
        fetchData();
      } else {
        alert(`❌ Submission failed: ${response.data.error}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cancel invoice
  const handleCancel = async (invoiceNo) => {
    if (!window.confirm(`Cancel submission for ${invoiceNo}?`)) return;
    
    try {
      await axios.put(`${url}/api/einvoice/cancel/${invoiceNo}`, { companyID });
      alert(`✅ Invoice ${invoiceNo} cancelled`);
      fetchData();
    } catch (error) {
      alert(`❌ Cancel failed: ${error.message}`);
    }
  };

  // Re-submit rejected invoice
  const handleReSubmit = async (invoiceNo) => {
    if (!window.confirm(`Re-submit invoice ${invoiceNo} to LHDN?`)) return;
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${url}/api/einvoice/resubmit/${invoiceNo}`,
        { companyID }
      );
      
      if (response.data.success) {
        alert(`✅ Invoice ${invoiceNo} re-submitted successfully!`);
        fetchData();
      }
    } catch (error) {
      alert(`❌ Re-submission failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // View PDF
  const handleViewInvoiceData = async (invoiceNo) => {
    try {
      const response = await axios.get(`${url}/api/einvoice/pdf/${invoiceNo}?companyID=${companyID}`);
      const data = response.data;
      
      if (!data.success) {
        alert(data.message);
        return;
      }
      
      const newWindow = window.open();
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${data.invoiceNo}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; }
              .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { margin: 0; color: #333; }
              .info { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
              th { background-color: #f2f2f2; }
              .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
              .remarks { margin-top: 30px; padding: 10px; background-color: #f9f9f9; }
              .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="invoice-box">
              <div class="header">
                <h1>INVOICE</h1>
              </div>
              
              <div class="info">
                <p><strong>Invoice No:</strong> ${data.invoiceNo}</p>
                <p><strong>Date:</strong> ${new Date(data.invoiceDate).toLocaleDateString()}</p>
                <p><strong>Customer:</strong> ${data.customerName}</p>
                ${data.customerTIN ? `<p><strong>TIN:</strong> ${data.customerTIN}</p>` : ''}
                ${data.customerEmail ? `<p><strong>Email:</strong> ${data.customerEmail}</p>` : ''}
                ${data.customerPhone ? `<p><strong>Phone:</strong> ${data.customerPhone}</p>` : ''}
                ${data.customerAddress ? `<p><strong>Address:</strong> ${data.customerAddress}</p>` : ''}
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price (RM)</th>
                    <th>Discount (RM)</th>
                    <th>Tax (RM)</th>
                    <th>Total (RM)</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.items.map((item, idx) => `
                    <tr>
                      <td>${idx + 1}</td>
                      <td>${item.productName}</td>
                      <td>${item.quantity}</td>
                      <td>${parseFloat(item.unitPrice).toFixed(2)}</td>
                      <td>${parseFloat(item.discount || 0).toFixed(2)}</td>
                      <td>${parseFloat(item.tax || 0).toFixed(2)}</td>
                      <td>${parseFloat(item.total).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              
              <div class="total">
                Grand Total: RM ${data.totalAmount}
              </div>
              
              ${data.remarks && (data.remarks.remark1 || data.remarks.remark2) ? `
              <div class="remarks">
                <strong>Remarks:</strong><br>
                ${data.remarks.remark1 ? `• ${data.remarks.remark1}<br>` : ''}
                ${data.remarks.remark2 ? `• ${data.remarks.remark2}<br>` : ''}
                ${data.remarks.remark3 ? `• ${data.remarks.remark3}<br>` : ''}
                ${data.remarks.remark4 ? `• ${data.remarks.remark4}<br>` : ''}
                ${data.remarks.remark5 ? `• ${data.remarks.remark5}` : ''}
              </div>
              ` : ''}
              
              <div class="footer">
                <p>LHDN Status: ${data.lhdn_status}</p>
                <p>This is a computer generated invoice. No signature required.</p>
                <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">🖨️ Print / Save as PDF</button>
                <button class="no-print" onclick="window.close()" style="margin-top: 20px; margin-left: 10px; padding: 10px 20px; cursor: pointer;">❌ Close</button>
              </div>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      alert("Failed to load invoice data");
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'NOT_SUBMITTED': { bg: '#ffc107', color: 'black', text: 'Pending' },
      'SUBMITTED': { bg: '#17a2b8', color: 'white', text: 'Submitted' },
      'VALIDATED': { bg: '#28a745', color: 'white', text: 'Validated' },
      'REJECTED': { bg: '#dc3545', color: 'white', text: 'Rejected' },
      'CANCELLED': { bg: '#6c757d', color: 'white', text: 'Cancelled' }
    };
    const style = colors[status] || { bg: '#6c757d', color: 'white', text: status };
    return (
      <span style={{
        backgroundColor: style.bg,
        color: style.color,
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        {style.text}
      </span>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: 'black', color: 'white', padding: 10, borderRadius: 4 }}>
        <h2 style={{ marginLeft: 600 }}>E-Invoice Management</h2>
      </div>

      {/* Filters - All in one line */}
      <div style={{ 
        marginBottom: 20, 
        padding: 15, 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          Start Date:
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="dd/MM/yyyy"
            className="form-control"
            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          End Date:
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="dd/MM/yyyy"
            className="form-control"
            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          Status:
          <select 
            value={status} 
            onChange={e => setStatus(e.target.value)} 
            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="NOT_SUBMITTED">Pending</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="VALIDATED">Validated</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="ALL">All Status</option>
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          Search:
          <input
            type="text"
            placeholder="Invoice No / Customer..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
          />
        </label>

        <button 
          onClick={fetchData} 
          disabled={loading} 
          style={{ padding: '5px 15px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {loading ? "Loading..." : "🔍 Search"}
        </button>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'flex', gap: 15, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ padding: 10, backgroundColor: '#e3f2fd', borderRadius: '8px', flex: 1, minWidth: 120 }}>
          <h4 style={{ margin: 0 }}>Total Invoices</h4>
          <p style={{ fontSize: 24, fontWeight: 'bold', margin: '5px 0 0' }}>{list.length}</p>
        </div>
        <div style={{ padding: 10, backgroundColor: '#fff3e0', borderRadius: '8px', flex: 1, minWidth: 120 }}>
          <h4 style={{ margin: 0 }}>Pending Submission</h4>
          <p style={{ fontSize: 24, fontWeight: 'bold', margin: '5px 0 0' }}>
            {list.filter(i => i.lhdn_status === 'NOT_SUBMITTED').length}
          </p>
        </div>
        <div style={{ padding: 10, backgroundColor: '#e8f5e9', borderRadius: '8px', flex: 1, minWidth: 120 }}>
          <h4 style={{ margin: 0 }}>Validated</h4>
          <p style={{ fontSize: 24, fontWeight: 'bold', margin: '5px 0 0' }}>
            {list.filter(i => i.lhdn_status === 'VALIDATED').length}
          </p>
        </div>
      </div>

      {/* Invoice Table */}
      <div style={{ overflowX: 'auto' }}>
        <table border="1" width="100%" style={{ borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: 'blue', color: 'white' }}>
            <tr>
              <th style={{ padding: 10 }}>Invoice No</th>
              <th style={{ padding: 10 }}>Date</th>
              <th style={{ padding: 10 }}>Customer</th>
              <th style={{ padding: 10 }}>Total (MYR)</th>
              <th style={{ padding: 10 }}>LHDN Status</th>
              <th style={{ padding: 10 }}>UUID</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && !loading && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: 40 }}>
                  No invoices found. Click "Create New E-Invoice" to get started.
                </td>
              </tr>
            )}
            {list.map((inv) => (
              <tr key={inv.id}>
                <td style={{ padding: 8 }}>{inv.invoiceNo}</td>
                <td style={{ padding: 8 }}>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                <td style={{ padding: 8 }}>{inv.customerName}</td>
                <td style={{ padding: 8 }}>RM {parseFloat(inv.itemNetTotal || 0).toFixed(2)}</td>
                <td style={{ padding: 8 }}>{getStatusBadge(inv.lhdn_status)}</td>
                <td style={{ padding: 8 }}>
                  <small>{inv.lhdn_uuid ? inv.lhdn_uuid.substring(0, 8) + '...' : '-'}</small>
                </td>
                <td style={{ padding: 8 }}>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => navigate(`/einvoice/view/${inv.invoiceNo}`)}
                      style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: 'cyan', border: 'none', borderRadius: 4 }}
                    >
                      👁️ View
                    </button>

                    {inv.lhdn_status === 'NOT_SUBMITTED' && (
                      <button 
                        onClick={() => navigate(`/einvoice/edit/${inv.invoiceNo}`)}
                        style={{ padding: '5px 10px', backgroundColor: '#ffc107', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                      >
                        ✏️ Edit
                      </button>
                    )}

                    {inv.lhdn_status === 'NOT_SUBMITTED' && (
                      <button 
                        onClick={() => handleSubmit(inv.invoiceNo)}
                        style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                        disabled={loading}
                      >
                        📤 Submit
                      </button>
                    )}

                    {inv.lhdn_status === 'REJECTED' && (
                      <button 
                        onClick={() => handleReSubmit(inv.invoiceNo)}
                        style={{ padding: '5px 10px', backgroundColor: '#ff9800', color: 'black', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                      >
                        🔄 Re-submit
                      </button>
                    )}

                    {inv.lhdn_status === 'NOT_SUBMITTED' && (
                      <button 
                        onClick={() => handleCancel(inv.invoiceNo)}
                        style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                      >
                        ❌ Cancel
                      </button>
                    )}

                    <button 
                      onClick={() => navigate(`/einvoice/status/${inv.invoiceNo}`)}
                      style={{ padding: '5px 10px', cursor: 'pointer', border: 'none', borderRadius: 4 }}
                    >
                      📊 Status
                    </button>

                    <button 
                      onClick={() => handleViewInvoiceData(inv.invoiceNo)}
                      style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: 'brown', color: 'white', border: 'none', borderRadius: 4 }}
                    >
                      📄 PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}