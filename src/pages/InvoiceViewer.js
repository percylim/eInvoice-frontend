import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function InvoiceViewer() {
  const { invoiceNo } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLhdnFormat, setShowLhdnFormat] = useState(false);
  const [lhdnJson, setLhdnJson] = useState(null);
  const [generatingLhdn, setGeneratingLhdn] = useState(false);
  const url = process.env.REACT_APP_SERVER_URL || 'http://localhost:3000';

  // State for calculated totals
  const [totals, setTotals] = useState({
    subtotal: 0,
    totalDiscount: 0,
    totalTax: 0,
    grandTotal: 0
  });

  // Load invoice on component mount or when invoiceNo changes
  useEffect(() => {
    loadInvoice();
  }, [invoiceNo]);

  // Calculate totals when invoice data changes
  useEffect(() => {
    if (invoice && invoice.items && invoice.items.length > 0) {
      const calculatedTotals = calculateTotals();
      setTotals(calculatedTotals);
      console.log("Calculated totals:", calculatedTotals);
    }
  }, [invoice]);

  // Debug: Log when invoice state updates
  useEffect(() => {
    if (invoice) {
      console.log("✅ Invoice loaded:", invoice);
      console.log("📦 Items count:", invoice.items?.length || 0);
    }
  }, [invoice]);

  // Calculate all totals from items
  const calculateTotals = () => {
    if (!invoice || !invoice.items || invoice.items.length === 0) {
      return {
        subtotal: 0,
        totalDiscount: 0,
        totalTax: 0,
        grandTotal: 0
      };
    }

    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let grandTotal = 0;

    invoice.items.forEach(item => {
      // Get item values (handle different possible field names)
      const itemTotal = parseFloat(item.itemTotal) || 
                        parseFloat(item.total) || 
                        (parseFloat(item.salesQty) * parseFloat(item.unitPrice)) || 0;
      
      const discountAmount = parseFloat(item.itemDiscount) || 
                            (itemTotal * (parseFloat(item.discountPercent) / 100)) || 0;
      
      const taxAmount = parseFloat(item.taxItemTotal) || 
                       ((itemTotal - discountAmount) * (parseFloat(item.taxRate) / 100)) || 0;
      
      // Calculate net total for this item
      const netTotal = parseFloat(item.itemNetTotal) || 
                      parseFloat(item.netTotal) ||
                      (itemTotal - discountAmount + taxAmount) || 0;
      
      // Add to totals
      subtotal += itemTotal;
      totalDiscount += discountAmount;
      totalTax += taxAmount;
      grandTotal += netTotal;
    });

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalDiscount: parseFloat(totalDiscount.toFixed(2)),
      totalTax: parseFloat(totalTax.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2))
    };
  };

  const loadInvoice = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(url+`/api/salesInvoiceDetail`, {
        params: { 
          companyID: 'codesquad', 
          invoiceNo: invoiceNo 
        }
      });
      
      console.log("📡 API Response:", response.data);
      
      // Check if we got data
      if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
        setError("Invoice not found");
        setLoading(false);
        return;
      }
      
      let invoiceData;
      
      // Case 1: Backend returns an array (multiple rows per invoice)
      if (Array.isArray(response.data)) {
        const firstRow = response.data[0];
        
        invoiceData = {
          // Header information (same for all rows)
          id: firstRow.id,
          invoiceNo: firstRow.invoiceNo,
          invoiceDate: firstRow.invoiceDate,
          customerID: firstRow.customerID,
          customerName: firstRow.customerName,
          customerTIN: firstRow.customerTIN || '',
          customerIDType: firstRow.customerIDType || '',
          customerEmail: firstRow.customerEmail || '',
          customerPhone: firstRow.customerPhone || '',
          customerAddress: firstRow.customerAddress || '',
          customerCountry: firstRow.customerCountry || 'MY',
          currencyCode: firstRow.currencyCode || 'MYR',
          classificationCode: firstRow.classificationCode || '',
          
          // Totals
          itemTotal: firstRow.itemTotal || 0,
          itemDiscount: firstRow.itemDiscount || 0,
          taxItemTotal: firstRow.taxItemTotal || 0,
          itemNetTotal: firstRow.itemNetTotal || 0,
          
          // LHDN fields
          lhdn_status: firstRow.lhdn_status || 'NOT_SUBMITTED',
          lhdn_uuid: firstRow.lhdn_uuid || null,
          lhdn_submitted_at: firstRow.lhdn_submitted_at || null,
          lhdn_submission_uid: firstRow.lhdn_submission_uid || null,
          einvoice_json: firstRow.einvoice_json || null,
          
          // Remarks
          remark1: firstRow.remark1 || '',
          remark2: firstRow.remark2 || '',
          remark3: firstRow.remark3 || '',
          remark4: firstRow.remark4 || '',
          remark5: firstRow.remark5 || '',
          remark6: firstRow.remark6 || '',
          
          // Items array - transform each row into an item
          items: response.data.map((row, index) => ({
            id: index,
            productID: row.productID,
            productName: row.productName,
            productDescription: row.productDescription || '',
            barcode: row.barcode || '',
            unit: row.unit || 'unit',
            salesQty: parseFloat(row.salesQty) || 0,
            unitPrice: parseFloat(row.unitPrice) || 0,
            discountPercent: parseFloat(row.discountPercent) || 0,
            itemDiscount: parseFloat(row.itemDiscount) || 0,
            taxID: row.taxID || '',
            taxType: row.taxType || '',
            taxCode: row.taxCode || '',
            taxRate: parseFloat(row.taxRate) || 0,
            itemTotal: parseFloat(row.itemTotal) || 0,
            taxItemTotal: parseFloat(row.taxItemTotal) || 0,
            itemNetTotal: parseFloat(row.itemNetTotal) || 0
          }))
        };
      } 
      // Case 2: Backend returns a single object
      else if (typeof response.data === 'object') {
        invoiceData = { ...response.data };
        
        // Ensure items is an array
        if (!invoiceData.items) {
          invoiceData.items = [];
        }
        
        // Ensure all numeric fields are numbers
        if (invoiceData.items.length > 0) {
          invoiceData.items = invoiceData.items.map(item => ({
            ...item,
            salesQty: parseFloat(item.salesQty) || 0,
            unitPrice: parseFloat(item.unitPrice) || 0,
            discountPercent: parseFloat(item.discountPercent) || 0,
            taxRate: parseFloat(item.taxRate) || 0,
            itemTotal: parseFloat(item.itemTotal) || 0,
            itemNetTotal: parseFloat(item.itemNetTotal) || 0
          }));
        }
      }
      
      setInvoice(invoiceData);
      
      // Parse LHDN JSON if exists
      if (invoiceData.einvoice_json) {
        try {
          const parsed = typeof invoiceData.einvoice_json === 'string' 
            ? JSON.parse(invoiceData.einvoice_json) 
            : invoiceData.einvoice_json;
          setLhdnJson(parsed);
        } catch (e) {
          console.error("Error parsing einvoice_json:", e);
        }
      }
      
    } catch (error) {
      console.error("❌ Error loading invoice:", error);
      setError(error.response?.data?.message || error.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const generateLhdnFormat = async () => {
    setGeneratingLhdn(true);
    try {
      const response = await axios.post(url+`/api/einvoice/generate-lhdn/${invoiceNo}`,
        { companyID: 'codesquad' }
      );
      
      setLhdnJson(response.data);
      setShowLhdnFormat(true);
      alert("LHDN format generated successfully!");
      
    } catch (error) {
      console.error("Error generating LHDN format:", error);
      alert("Failed to generate LHDN format: " + (error.response?.data?.message || error.message));
    } finally {
      setGeneratingLhdn(false);
    }
  };

  const downloadPDF = async () => {
  try {
    const response = await axios.get(url+`/api/einvoice/pdf/${invoiceNo}?companyID=codesquad`);
    const data = response.data;
    
    if (!data.success) {
      alert(data.message);
      return;
    }
    
    // Open new window with formatted invoice for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
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
              button { display: none; }
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
            </div>
          </div>
          <div style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 10px 20px; cursor: pointer;">🖨️ Print / Save as PDF</button>
            <button onclick="window.close()" style="padding: 10px 20px; margin-left: 10px; cursor: pointer;">❌ Close</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate invoice PDF");
  }
};

  const downloadJSON = () => {
    const dataToExport = showLhdnFormat && lhdnJson ? lhdnJson : invoice;
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const fileName = `${invoiceNo}_${showLhdnFormat ? 'lhdn' : 'original'}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'VALIDATED': { bg: '#28a745', text: '✅ Validated', icon: '✅' },
      'SUBMITTED': { bg: '#17a2b8', text: '⏳ Submitted', icon: '⏳' },
      'NOT_SUBMITTED': { bg: '#ffc107', text: '📝 Not Submitted', icon: '📝' },
      'REJECTED': { bg: '#dc3545', text: '❌ Rejected', icon: '❌' },
      'CANCELLED': { bg: '#6c757d', text: '🚫 Cancelled', icon: '🚫' },
      'DRAFT': { bg: '#6c757d', text: '✏️ Draft', icon: '✏️' }
    };
    
    const config = statusConfig[status] || statusConfig['NOT_SUBMITTED'];
    
    return (
      <span style={{
        backgroundColor: config.bg,
        color: 'white',
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        display: 'inline-block'
      }}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: invoice?.currencyCode || 'MYR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: 24, marginBottom: 10 }}>📄</div>
        <div>Loading invoice...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
        <h2>Error Loading Invoice</h2>
        <p style={{ color: '#dc3545' }}>{error}</p>
        <button 
          onClick={() => navigate('/einvoice')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            marginTop: 20
          }}
        >
          Back to Invoice List
        </button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>📭</div>
        <h2>Invoice Not Found</h2>
        <p>No invoice found with number: {invoiceNo}</p>
        <button 
          onClick={() => navigate('/einvoice')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            marginTop: 20
          }}
        >
          Back to Invoice List
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 20,
        flexWrap: 'wrap',
        gap: 10
      }}>
        <div style={{ flex: 1, mininmumWidth: 250, backgroundColor: 'black', color: 'white'}}>
          <h1 style={{ margin: 0, backgroundColor: 'black', color: 'white', textAlign: 'center' }}>E-Invoice Details</h1>
          <p style={{ color: 'white', margin: '5px 0 0', textAlign: 'center' }}>Invoice #{invoice.invoiceNo}</p>
        </div>
        
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowLhdnFormat(!showLhdnFormat)}
            style={{
              padding: '8px 16px',
              backgroundColor: showLhdnFormat ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            {showLhdnFormat ? '📄 Show Original' : '🏛️ Show LHDN Format'}
          </button>
          
          {!showLhdnFormat && !lhdnJson && (
            <button
              onClick={generateLhdnFormat}
              disabled={generatingLhdn}
              style={{
                padding: '8px 16px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              {generatingLhdn ? 'Generating...' : '🔧 Generate LHDN Format'}
            </button>
          )}
          
          <button
            onClick={downloadPDF}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            📄 Download PDF
          </button>
          
          <button
            onClick={downloadJSON}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ffc107',
              color: '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            💾 Download JSON
          </button>
          
          <button
            onClick={() => navigate('/einvoice')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '15px 20px',
        borderRadius: 8,
        marginBottom: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10
      }}>
        <div>
          <strong>Status:</strong> {getStatusBadge(invoice.lhdn_status)}
        </div>
        {invoice.lhdn_uuid && (
          <div>
            <strong>UUID:</strong> 
            <code style={{ marginLeft: 8, fontSize: 12 }}>{invoice.lhdn_uuid}</code>
          </div>
        )}
        {invoice.lhdn_submitted_at && (
          <div>
            <strong>Submitted:</strong> {formatDateTime(invoice.lhdn_submitted_at)}
          </div>
        )}
      </div>

      {/* Content - Original or LHDN Format */}
      {showLhdnFormat && lhdnJson ? (
        // LHDN JSON Format View
        <div>
          <h3>🏛️ LHDN E-Invoice Format</h3>
          <pre style={{
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            padding: 20,
            borderRadius: 8,
            overflow: 'auto',
            maxHeight: '600px',
            fontSize: 12,
            fontFamily: 'monospace'
          }}>
            {JSON.stringify(lhdnJson, null, 2)}
          </pre>
        </div>
      ) : (
        // Original Invoice Format View
        <div>
          {/* Invoice Header */}
          <div style={{
            border: '2px solid #333',
            borderRadius: 8,
            overflow: 'hidden',
            marginBottom: 20
          }}>
            <div style={{
              backgroundColor: 'green',
              color: 'white',
              padding: 20,
              textAlign: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: 28 }}>INVOICE</h2>
              <p style={{ margin: '5px 0 0', opacity: 0.8 }}>Tax Invoice / E-Invoice</p>
            </div>
            
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 20 }}>
                <div>
                  <p><strong>Invoice No:</strong> {invoice.invoiceNo}</p>
                  <p><strong>Invoice Date:</strong> {formatDate(invoice.invoiceDate)}</p>
                  <p><strong>Currency:</strong> {invoice.currencyCode}</p>
                </div>
                <div>
                  {invoice.classificationCode && (
                    <p><strong>Classification Code:</strong> {invoice.classificationCode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 20,
            marginBottom: 20,
            backgroundColor: '#f8f9fa'
          }}>
            <h3 style={{ marginTop: 0 }}>Bill To:</h3>
            <p><strong>{invoice.customerName}</strong></p>
            {invoice.customerTIN && <p><strong>TIN:</strong> {invoice.customerTIN}</p>}
            {invoice.customerIDType && <p><strong>ID Type:</strong> {invoice.customerIDType}</p>}
            {invoice.customerEmail && <p><strong>Email:</strong> {invoice.customerEmail}</p>}
            {invoice.customerPhone && <p><strong>Phone:</strong> {invoice.customerPhone}</p>}
            {invoice.customerAddress && <p><strong>Address:</strong> {invoice.customerAddress}</p>}
            {invoice.customerCountry && <p><strong>Country:</strong> {invoice.customerCountry}</p>}
          </div>

          {/* Items Table */}
          <h3>Items</h3>
          <table border="1" width="100%" style={{ borderCollapse: 'collapse', marginBottom: 20 }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={{ padding: 10 }}>#</th>
                <th style={{ padding: 10 }}>Product</th>
                <th style={{ padding: 10 }}>Qty</th>
                <th style={{ padding: 10 }}>Unit Price</th>
                <th style={{ padding: 10 }}>Discount</th>
                <th style={{ padding: 10 }}>Tax</th>
                <th style={{ padding: 10 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, index) => {
                  // Calculate per-item values
                  const itemTotal = parseFloat(item.itemTotal) || 
                                   (parseFloat(item.salesQty) * parseFloat(item.unitPrice)) || 0;
                  const discountAmount = parseFloat(item.itemDiscount) || 
                                        (itemTotal * (parseFloat(item.discountPercent) / 100)) || 0;
                  const taxAmount = parseFloat(item.taxItemTotal) || 
                                   ((itemTotal - discountAmount) * (parseFloat(item.taxRate) / 100)) || 0;
                  const netTotal = parseFloat(item.itemNetTotal) || 
                                  (itemTotal - discountAmount + taxAmount) || 0;
                  
                  return (
                    <tr key={item.id || index}>
                      <td style={{ padding: 8, textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ padding: 8 }}>
                        <strong>{item.productName}</strong>
                        {item.productDescription && (
                          <div style={{ fontSize: 12, color: '#666' }}>{item.productDescription}</div>
                        )}
                        {item.barcode && <div style={{ fontSize: 11, color: '#999' }}>Barcode: {item.barcode}</div>}
                      </td>
                      <td style={{ padding: 8, textAlign: 'center' }}>
                        {item.salesQty} {item.unit}
                      </td>
                      <td style={{ padding: 8, textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                      <td style={{ padding: 8, textAlign: 'center' }}>
                        {discountAmount > 0 ? (
                          <span style={{ color: '#dc3545' }}>
                            {item.discountPercent > 0 ? `${item.discountPercent}%` : ''}
                            <br/>
                            <small>({formatCurrency(discountAmount)})</small>
                          </span>
                        ) : '-'}
                      </td>
                      <td style={{ padding: 8, textAlign: 'center' }}>
                        {taxAmount > 0 ? (
                          <span style={{ color: '#ff9800' }}>
                            {item.taxRate > 0 ? `${item.taxRate}%` : ''}
                            <br/>
                            <small>({formatCurrency(taxAmount)})</small>
                          </span>
                        ) : '-'}
                      </td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 'bold' }}>
                        {formatCurrency(netTotal)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>
                    No items found for this invoice
                  </td>
                </tr>
              )}
            </tbody>
            
            {/* Table Footer with Totals */}
            <tfoot>
              <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                <td colSpan="4" style={{ padding: 10, textAlign: 'right' }}>
                  TOTALS:
                </td>
                <td style={{ padding: 10, textAlign: 'center', color: '#dc3545' }}>
                  {formatCurrency(totals.totalDiscount)}
                </td>
                <td style={{ padding: 10, textAlign: 'center', color: '#ff9800' }}>
                  {formatCurrency(totals.totalTax)}
                </td>
                <td style={{ padding: 10, textAlign: 'right', color: '#28a745' }}>
                  {formatCurrency(totals.grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Summary Cards */}
          <div style={{
            display: 'flex',
            gap: 20,
            marginTop: 30,
            marginBottom: 30,
            flexWrap: 'wrap',
            justifyContent: 'flex-end'
          }}>
            {/* Subtotal Card */}
            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '15px 25px',
              borderRadius: 8,
              textAlign: 'center',
              minWidth: 120
            }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>SUBTOTAL</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#007bff' }}>
                {formatCurrency(totals.subtotal)}
              </div>
            </div>

            {/* Discount Card */}
            {totals.totalDiscount > 0 && (
              <div style={{
                backgroundColor: '#ffebee',
                padding: '15px 25px',
                borderRadius: 8,
                textAlign: 'center',
                minWidth: 120
              }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>DISCOUNT</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#dc3545' }}>
                  -{formatCurrency(totals.totalDiscount)}
                </div>
              </div>
            )}

            {/* Tax Card */}
            {totals.totalTax > 0 && (
              <div style={{
                backgroundColor: '#fff3e0',
                padding: '15px 25px',
                borderRadius: 8,
                textAlign: 'center',
                minWidth: 120
              }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>TAX</div>
                <div style={{ fontSize: 20, fontWeight: 'bold', color: '#ff9800' }}>
                  {formatCurrency(totals.totalTax)}
                </div>
              </div>
            )}

            {/* Grand Total Card */}
            <div style={{
              backgroundColor: '#e8f5e9',
              padding: '15px 25px',
              borderRadius: 8,
              textAlign: 'center',
              minWidth: 150,
              border: '2px solid #28a745'
            }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>GRAND TOTAL</div>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#28a745' }}>
                {formatCurrency(totals.grandTotal)}
              </div>
            </div>
          </div>

          {/* Detailed Summary Section */}
          <div style={{ 
            marginTop: 20, 
            borderTop: '2px solid #dee2e6',
            paddingTop: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 350 }}>
                {/* Subtotal Row */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid #dee2e6'
                }}>
                  <span><strong>Subtotal:</strong></span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>

                {/* Discount Row */}
                {totals.totalDiscount > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #dee2e6',
                    color: '#dc3545'
                  }}>
                    <span><strong>Total Discount:</strong></span>
                    <span>-{formatCurrency(totals.totalDiscount)}</span>
                  </div>
                )}

                {/* Tax Row */}
                {totals.totalTax > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid #dee2e6'
                  }}>
                    <span><strong>Total Tax:</strong></span>
                    <span>{formatCurrency(totals.totalTax)}</span>
                  </div>
                )}

                {/* Grand Total Row */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  marginTop: '8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}>
                  <span>GRAND TOTAL:</span>
                  <span style={{ color: '#28a745' }}>
                    {formatCurrency(totals.grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {[invoice.remark1, invoice.remark2, invoice.remark3, invoice.remark4, invoice.remark5].some(r => r) && (
            <div style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: 8,
              padding: 15,
              marginBottom: 20,
              marginTop: 20
            }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Remarks:</h4>
              {invoice.remark1 && <p style={{ margin: '5px 0' }}>• {invoice.remark1}</p>}
              {invoice.remark2 && <p style={{ margin: '5px 0' }}>• {invoice.remark2}</p>}
              {invoice.remark3 && <p style={{ margin: '5px 0' }}>• {invoice.remark3}</p>}
              {invoice.remark4 && <p style={{ margin: '5px 0' }}>• {invoice.remark4}</p>}
              {invoice.remark5 && <p style={{ margin: '5px 0' }}>• {invoice.remark5}</p>}
            </div>
          )}

          {/* Validation Footer */}
          {invoice.lhdn_status === 'VALIDATED' && (
            <div style={{
              backgroundColor: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: 8,
              padding: 15,
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, color: '#155724' }}>
                ✅ This invoice has been validated by LHDN Malaysia
              </p>
              {invoice.lhdn_uuid && (
                <p style={{ margin: '5px 0 0', fontSize: 12, color: '#155724' }}>
                  UUID: {invoice.lhdn_uuid}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}