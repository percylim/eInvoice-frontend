import React, { useState } from "react";
import axios from "axios";
import * as XLSX from 'xlsx';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";


export default function InvoiceReport() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
const url = process.env.REACT_APP_SERVER_URL || 'http://localhost:3000';
  const companyID = localStorage.getItem('companyID');
  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert("Please select date range");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(url+"/api/einvoice/report", {
        params: {
          companyID: companyID,
          startDate: moment(startDate).format("YYYY-MM-DD"),
          endDate: moment(endDate).format("YYYY-MM-DD"),
          status: status
        }
      });
      
      if (response.data.success) {
        setReportData(response.data);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error generating report:", error);
      setError(error.response?.data?.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData || !reportData.invoices.length) {
      alert("No data to export");
      return;
    }
    
    const exportData = reportData.invoices.map(inv => ({
      'Invoice No': inv.invoiceNo,
      'Date': new Date(inv.invoiceDate).toLocaleDateString(),
      'Customer': inv.customerName,
      'Customer TIN': inv.customerTIN || '-',
      'Total Amount (RM)': parseFloat(inv.itemNetTotal).toFixed(2),
      'LHDN Status': inv.lhdn_status,
      'UUID': inv.lhdn_uuid || '-',
      'Submitted At': inv.lhdn_submitted_at ? new Date(inv.lhdn_submitted_at).toLocaleString() : '-'
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'E-Invoice Report');
    XLSX.writeFile(workbook, `einvoice_report_${startDate}_to_${endDate}.xlsx`);
  };

  const exportToCSV = () => {
    if (!reportData || !reportData.invoices.length) return;
    
    const headers = ['Invoice No', 'Date', 'Customer', 'Customer TIN', 'Total Amount (RM)', 'LHDN Status', 'UUID', 'Submitted At'];
    const rows = reportData.invoices.map(inv => [
      inv.invoiceNo,
      new Date(inv.invoiceDate).toLocaleDateString(),
      inv.customerName,
      inv.customerTIN || '-',
      parseFloat(inv.itemNetTotal).toFixed(2),
      inv.lhdn_status,
      inv.lhdn_uuid || '-',
      inv.lhdn_submitted_at ? new Date(inv.lhdn_submitted_at).toLocaleString() : '-'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `einvoice_report_${startDate}_to_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const colors = {
      'NOT_SUBMITTED': { bg: '#ffc107', text: 'Pending' },
      'SUBMITTED': { bg: '#17a2b8', text: 'Submitted' },
      'VALIDATED': { bg: '#28a745', text: 'Validated' },
      'REJECTED': { bg: '#dc3545', text: 'Rejected' },
      'CANCELLED': { bg: '#6c757d', text: 'Cancelled' }
    };
    const style = colors[status] || { bg: '#6c757d', text: status };
    return (
      <span style={{
        backgroundColor: style.bg,
        color: 'white',
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
      <h2 style={{backgroundColor: 'black', color: 'white', textAlign: 'center'}}>E-Invoice Report</h2>
      
      {/* Filter Section */}
      <div style={{ 
        marginBottom: 20, 
        padding: 20, 
        backgroundColor: '#f8f9fa', 
        borderRadius: 8,
        display: 'flex',
        gap: 15,
        flexWrap: 'wrap',
        alignItems: 'flex-end'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: 5 }}>Start Date:</label>
          <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              style={{ marginLeft: 5, marginRight: 15 }}
            />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: 5 }}>End Date:</label>
         <DatePicker
             selected={endDate}
             onChange={(date) => setEndDate(date)}
             dateFormat="dd/MM/yyyy"
             style={{ marginLeft: 5, marginRight: 15 }}
           />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: 5 }}>Status:</label>
          <select 
            value={status} 
            onChange={e => setStatus(e.target.value)} 
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ddd', minWidth: 150 }}
          >
            <option value="ALL">All Status</option>
            <option value="NOT_SUBMITTED">Pending</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="VALIDATED">Validated</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        
        <div>
          <button 
            onClick={generateReport} 
            disabled={loading}
            style={{
              padding: '8px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: 15,
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: 8,
          marginBottom: 20
        }}>
          Error: {error}
        </div>
      )}

      {/* Report Results */}
      {reportData && (
        <>
          {/* Summary Cards */}
          <div style={{ 
            display: 'flex', 
            gap: 15, 
            marginBottom: 20,
            flexWrap: 'wrap'
          }}>
            <div style={{ padding: 15, backgroundColor: '#e3f2fd', borderRadius: 8, flex: 1, minWidth: 120 }}>
              <h4 style={{ margin: 0 }}>Total Invoices</h4>
              <p style={{ fontSize: 28, fontWeight: 'bold', margin: '10px 0 0' }}>{reportData.summary.total}</p>
            </div>
            <div style={{ padding: 15, backgroundColor: '#e8f5e9', borderRadius: 8, flex: 1, minWidth: 120 }}>
              <h4 style={{ margin: 0 }}>Validated</h4>
              <p style={{ fontSize: 28, fontWeight: 'bold', margin: '10px 0 0', color: '#28a745' }}>
                {reportData.summary.validated}
              </p>
            </div>
            <div style={{ padding: 15, backgroundColor: '#fff3e0', borderRadius: 8, flex: 1, minWidth: 120 }}>
              <h4 style={{ margin: 0 }}>Pending</h4>
              <p style={{ fontSize: 28, fontWeight: 'bold', margin: '10px 0 0', color: '#ffc107' }}>
                {reportData.summary.pending}
              </p>
            </div>
            <div style={{ padding: 15, backgroundColor: '#ffebee', borderRadius: 8, flex: 1, minWidth: 120 }}>
              <h4 style={{ margin: 0 }}>Rejected</h4>
              <p style={{ fontSize: 28, fontWeight: 'bold', margin: '10px 0 0', color: '#dc3545' }}>
                {reportData.summary.rejected}
              </p>
            </div>
            <div style={{ padding: 15, backgroundColor: '#f3e5f5', borderRadius: 8, flex: 1, minWidth: 120 }}>
              <h4 style={{ margin: 0 }}>Total Amount</h4>
              <p style={{ fontSize: 20, fontWeight: 'bold', margin: '10px 0 0' }}>
                RM {reportData.summary.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Export Buttons */}
          <div style={{ marginBottom: 15, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button 
              onClick={exportToExcel}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              📊 Export to Excel
            </button>
            <button 
              onClick={exportToCSV}
              style={{
                padding: '8px 16px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              📄 Export to CSV
            </button>
          </div>

          {/* Invoice Table */}
          <div style={{ overflowX: 'auto' }}>
            <table border="1" width="100%" style={{ borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: 'green', color: 'white' }}>
                <tr>
                  <th style={{ padding: 10 }}>Invoice No</th>
                  <th style={{ padding: 10 }}>Date</th>
                  <th style={{ padding: 10 }}>Customer</th>
                  <th style={{ padding: 10 }}>Amount (RM)</th>
                  <th style={{ padding: 10 }}>Status</th>
                  <th style={{ padding: 10 }}>UUID</th>
                  <th style={{ padding: 10 }}>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {reportData.invoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>
                      No invoices found for the selected criteria
                    </td>
                  </tr>
                ) : (
                  reportData.invoices.map((inv) => (
                    <tr key={inv.id || inv.invoiceNo}>
                      <td style={{ padding: 8 }}>{inv.invoiceNo}</td>
                      <td style={{ padding: 8 }}>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                      <td style={{ padding: 8 }}>{inv.customerName}</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>
                        RM {parseFloat(inv.itemNetTotal || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: 8 }}>{getStatusBadge(inv.lhdn_status)}</td>
                      <td style={{ padding: 8 }}>
                        <small>{inv.lhdn_uuid ? inv.lhdn_uuid.substring(0, 12) + '...' : '-'}</small>
                      </td>
                      <td style={{ padding: 8 }}>
                        {inv.lhdn_submitted_at ? new Date(inv.lhdn_submitted_at).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}