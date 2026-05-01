import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from 'moment';

export default function InvoiceDraft() {
  const { invoiceNo } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [originalInvoice, setOriginalInvoice] = useState(null);
  const url = process.env.REACT_APP_SERVER_URL || 'http://localhost:3000';
  const companyID = localStorage.getItem('companyID');
  
  // E-invoice specific fields
  const [formData, setFormData] = useState({
    invoiceNo: '',
    invoiceDate: '',
    customerName: '',
    customerTIN: '',
    customerIDType: 'NRIC',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerCountry: 'MY',
    classificationCode: '',
    currencyCode: 'MYR',
    remark1: '',
    remark2: '',
    remark3: '',
    remark4: '',
    remark5: ''
  });

  // Load invoice data
  useEffect(() => {
    if (invoiceNo) {
      loadInvoice();
    }
  }, [invoiceNo]);

  const loadInvoice = async () => {
    setLoading(true);
    try {
      // Fetch invoice data from accounting system
      const response = await axios.get(`${url}/api/salesInvoiceDetail`, {
        params: { 
          companyID: companyID, 
          invoiceNo: invoiceNo 
        }
      });
      
      console.log("API Response:", response.data);
      
      if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
        alert("Invoice not found");
        setLoading(false);
        return;
      }
      
      const firstRow = Array.isArray(response.data) ? response.data[0] : response.data;
      
      // Format date for display
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return moment(dateString).format('YYYY-MM-DD');
      };
      
      // Load existing e-invoice fields
      const einvoiceFields = await loadEInvoiceFields();
      
      setFormData({
        invoiceNo: firstRow.invoiceNo || '',
        invoiceDate: formatDateForInput(firstRow.invoiceDate),
        customerName: firstRow.customerName || '',
        customerTIN: einvoiceFields?.customerTIN || firstRow.customerTIN || '',
        customerIDType: einvoiceFields?.customerIDType || firstRow.customerIDType || 'NRIC',
        customerEmail: einvoiceFields?.customerEmail || firstRow.customerEmail || '',
        customerPhone: einvoiceFields?.customerPhone || firstRow.customerPhone || '',
        customerAddress: einvoiceFields?.customerAddress || firstRow.customerAddress || '',
        customerCountry: einvoiceFields?.customerCountry || firstRow.customerCountry || 'MY',
        classificationCode: einvoiceFields?.classificationCode || firstRow.classificationCode || '',
        currencyCode: einvoiceFields?.currencyCode || firstRow.currencyCode || 'MYR',
        remark1: firstRow.remark1 || '',
        remark2: firstRow.remark2 || '',
        remark3: firstRow.remark3 || '',
        remark4: firstRow.remark4 || '',
        remark5: firstRow.remark5 || ''
      });
      
      setOriginalInvoice(firstRow);
      
    } catch (error) {
      console.error("Error loading invoice:", error);
      alert("Failed to load invoice: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Load existing e-invoice fields
  const loadEInvoiceFields = async () => {
    try {
      const response = await axios.get(`${url}/api/einvoice/einvoice-fields/${invoiceNo}`, {
        params: { companyID: companyID }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error("Error loading e-invoice fields:", error);
      return null;
    }
  };

  // Save only e-invoice specific fields
  const saveDraft = async () => {
    // Validate required fields
    if (!formData.customerName) {
      alert("Please enter customer name");
      return;
    }
    
    if (!formData.customerTIN) {
      alert("Please enter Customer TIN (Tax Identification Number)");
      return;
    }
    
    if (!formData.customerEmail) {
      alert("Please enter Customer Email");
      return;
    }
    
    if (!formData.customerPhone) {
      alert("Please enter Customer Phone Number");
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        customerTIN: formData.customerTIN.toUpperCase(),
        customerIDType: formData.customerIDType,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        customerCountry: formData.customerCountry,
        classificationCode: formData.classificationCode,
        currencyCode: formData.currencyCode
      };
      
      const response = await axios.patch(
        `${url}/api/einvoice/einvoice-fields/${invoiceNo}?companyID=${companyID}`,
        payload
      );
      
      if (response.data.success) {
        alert(`✅ E-invoice information for ${invoiceNo} saved successfully!`);
        navigate('/einvoice');
      } else {
        alert("❌ Failed to save: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("❌ Failed to save e-invoice: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div>Loading invoice...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: '0 auto' }}>
      <h2 style={{ backgroundColor: '#1f11a1', color: 'white', textAlign: 'center', padding: 15, borderRadius: 8 }}>
        E-Invoice Information
      </h2>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 20,
        borderLeft: '4px solid #1f11a1'
      }}>
        <strong>📄 Invoice #{invoiceNo}</strong> - {formData.customerName}
      </div>
      
      <div style={{ 
        backgroundColor: '#e3f2fd', 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 20,
        fontSize: 14
      }}>
        <strong>ℹ️ Note:</strong> Only e-invoice specific fields can be edited here. 
        Invoice items, quantities, and prices cannot be changed.
      </div>
      
      <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
        {/* Left Column - Customer Information */}
        <div style={{ flex: 1, minWidth: 350 }}>
          <h3 style={{ backgroundColor: '#17a2b8', color: 'white', padding: 10, borderRadius: 4, marginTop: 0 }}>
            👤 Customer Information
          </h3>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Customer Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.customerName}
              disabled
              style={{ 
                width: '100%', 
                padding: 10, 
                border: '1px solid #ddd', 
                borderRadius: 4,
                backgroundColor: '#e9ecef'
              }}
            />
            <small style={{ color: '#666' }}>From accounting system (read-only)</small>
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              TIN (Tax Identification Number) <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.customerTIN}
              onChange={e => setFormData({ ...formData, customerTIN: e.target.value.toUpperCase() })}
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4 }}
              placeholder="e.g., 1234567890 or C1234567890"
            />
            <small style={{ color: '#d9534f' }}>⚠️ Required for LHDN e-invoice submission</small>
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              ID Type
            </label>
            <select
              value={formData.customerIDType}
              onChange={e => setFormData({ ...formData, customerIDType: e.target.value })}
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4 }}
            >
              <option value="NRIC">NRIC (Malaysian IC)</option>
              <option value="BRN">Business Registration Number (BRN)</option>
              <option value="PASSPORT">Passport</option>
              <option value="TIN">Tax Identification Number (TIN)</option>
              <option value="ARMY">Army ID</option>
              <option value="POLICE">Police ID</option>
            </select>
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Email Address <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="email"
              value={formData.customerEmail}
              onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4 }}
              placeholder="customer@example.com"
            />
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Phone Number <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4 }}
              placeholder="012-3456789"
            />
          </div>
        </div>
        
        {/* Right Column - Address & Classification */}
        <div style={{ flex: 1, minWidth: 350 }}>
          <h3 style={{ backgroundColor: '#17a2b8', color: 'white', padding: 10, borderRadius: 4, marginTop: 0 }}>
            📍 Address & Classification
          </h3>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Customer Address
            </label>
            <textarea
              value={formData.customerAddress}
              onChange={e => setFormData({ ...formData, customerAddress: e.target.value })}
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4 }}
              rows="4"
              placeholder="Full address for e-invoice"
            />
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Country
            </label>
            <select
              value={formData.customerCountry}
              onChange={e => setFormData({ ...formData, customerCountry: e.target.value })}
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4 }}
            >
              <option value="MY">Malaysia</option>
              <option value="SG">Singapore</option>
              <option value="BN">Brunei</option>
              <option value="ID">Indonesia</option>
              <option value="TH">Thailand</option>
              <option value="VN">Vietnam</option>
              <option value="PH">Philippines</option>
              <option value="MM">Myanmar</option>
              <option value="KH">Cambodia</option>
              <option value="LA">Laos</option>
              <option value="CN">China</option>
              <option value="JP">Japan</option>
              <option value="KR">South Korea</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Classification Code
            </label>
            <input
              type="text"
              value={formData.classificationCode}
              onChange={e => setFormData({ ...formData, classificationCode: e.target.value })}
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4 }}
              placeholder="e.g., 001, 002"
            />
            <small style={{ color: '#666' }}>Optional classification for reporting</small>
          </div>
          
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 5, fontWeight: 'bold' }}>
              Currency Code
            </label>
            <select
              value={formData.currencyCode}
              onChange={e => setFormData({ ...formData, currencyCode: e.target.value })}
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 4 }}
            >
              <option value="MYR">MYR - Malaysian Ringgit</option>
              <option value="USD">USD - US Dollar</option>
              <option value="SGD">SGD - Singapore Dollar</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Invoice Summary (Read-only) */}
      {originalInvoice && (
        <div style={{ 
          marginTop: 30, 
          padding: 20, 
          backgroundColor: '#e8f5e9', 
          borderRadius: 8,
          border: '1px solid #c8e6c9'
        }}>
          <h3 style={{ marginTop: 0, color: '#2e7d32' }}>💰 Invoice Summary (Read-only)</h3>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <strong>Invoice No:</strong> {originalInvoice.invoiceNo}
            </div>
            <div>
              <strong>Date:</strong> {moment(originalInvoice.invoiceDate).format('DD/MM/YYYY')}
            </div>
            <div>
              <strong>Total Amount:</strong> RM {parseFloat(originalInvoice.itemNetTotal || 0).toFixed(2)}
            </div>
          </div>
          <p style={{ marginTop: 10, fontSize: 12, color: '#666' }}>
            To modify items, quantities, or prices, please use the accounting system.
          </p>
        </div>
      )}
      
      {/* Action Buttons */}
      <div style={{ marginTop: 30, display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button 
          onClick={saveDraft} 
          disabled={saving} 
          style={{ 
            padding: '12px 30px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4, 
            cursor: 'pointer',
            fontSize: 16
          }}
        >
          {saving ? '💾 Saving...' : '💾 Save E-Invoice Information'}
        </button>
        <button 
          onClick={() => navigate('/einvoice')} 
          style={{ 
            padding: '12px 30px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4, 
            cursor: 'pointer',
            fontSize: 16
          }}
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  );
}