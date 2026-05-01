import React from 'react';
import EscapeStr from './mysqlConvertChar';
import './Profile.css';
import Axios from "axios";

const url = process.env.REACT_APP_SERVER_URL || 'http://localhost:3000';

var companyID = localStorage.getItem('companyID');
var companyName = localStorage.getItem('companyName');

class CompanyProfile extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        lhdnTinNo: '',
        lhdnClientID: '',
        lhdnClientSecret: '',
        lhdnEnvironment: 'SANDBOX',
        isLoading: false
      };

      // Create refs for all LHDN fields
      this.lhdnTinNoEl = React.createRef();
      this.lhdnClientIDEl = React.createRef();
      this.lhdnClientSecretEl = React.createRef();
      this.lhdnEnvironmentEl = React.createRef();
      
      this.handleLhdnUpdate = this.handleLhdnUpdate.bind(this);
      this.loadLhdnInfo = this.loadLhdnInfo.bind(this);
    }

    componentDidMount() {
      console.log('Component mounted, companyID:', companyID);
      
      if (!companyID) {
        console.error('No companyID found');
        alert('Please login first');
        return;
      }
      
      // Auto load LHDN info
      this.loadLhdnInfo();
    }

    loadLhdnInfo() {
      console.log('Loading LHDN info for companyID:', companyID);
      
      Axios.post(`${url}/api/einvoice/getCompanyLHDNInfo`, {
        companyID: companyID
      })
      .then(response => {
        console.log('API Response:', response.data);
        
        if (response.data && response.data.success && response.data.data) {
          const company = response.data.data;
          
          this.setState({
            lhdnTinNo: company.lhdnTinNo || '',
            lhdnClientID: company.lhdnClientID || '',
            lhdnClientSecret: company.lhdnClientSecret || '',
            lhdnEnvironment: company.lhdnEnvironment || 'SANDBOX'
          });
          
          if (this.lhdnTinNoEl.current) this.lhdnTinNoEl.current.value = company.lhdnTinNo || '';
          if (this.lhdnClientIDEl.current) this.lhdnClientIDEl.current.value = company.lhdnClientID || '';
          if (this.lhdnClientSecretEl.current) this.lhdnClientSecretEl.current.value = company.lhdnClientSecret || '';
          if (this.lhdnEnvironmentEl.current) this.lhdnEnvironmentEl.current.value = company.lhdnEnvironment || 'SANDBOX';
          
          console.log('LHDN Info loaded');
        } else {
          console.error('Invalid response format:', response.data);
        }
      })
      .catch(error => {
        console.error('Error loading LHDN info:', error);
        alert('Failed to load LHDN data');
      });
    }

    handleLhdnUpdate() {
      const lhdnTinNo = EscapeStr(this.lhdnTinNoEl.current.value).toUpperCase();
      const lhdnClientID = EscapeStr(this.lhdnClientIDEl.current.value);
      const lhdnClientSecret = EscapeStr(this.lhdnClientSecretEl.current.value);
      const lhdnEnvironment = this.lhdnEnvironmentEl.current.value;
      
      if (!lhdnTinNo) {
        alert('Please enter LHDN TIN');
        return;
      }
      
      // Validate LHDN TIN format
      const tinRegex = /^[A-Z0-9\-]{10,15}$/i;
      if (!tinRegex.test(lhdnTinNo)) {
        alert('Invalid LHDN TIN format. Should be 10-15 characters (digits, letters, or hyphens)');
        return;
      }
      
      this.setState({ isLoading: true });
      
      // Update all LHDN credentials
      Axios.post(`${url}/api/einvoice/updateCompanyLhdnCredentials`, {
        companyID: companyID,
        lhdnTinNo: lhdnTinNo,
        lhdnClientID: lhdnClientID,
        lhdnClientSecret: lhdnClientSecret,
        lhdnEnvironment: lhdnEnvironment
      })
      .then(response => {
        console.log('Update response:', response.data);
        
        if (response.data.success) {
          localStorage.setItem('lhdnTinNo', lhdnTinNo);
          this.setState({ 
            lhdnTinNo: lhdnTinNo,
            lhdnClientID: lhdnClientID,
            lhdnClientSecret: lhdnClientSecret,
            lhdnEnvironment: lhdnEnvironment,
            isLoading: false 
          });
          alert('✅ LHDN credentials updated successfully!');
        } else {
          this.setState({ isLoading: false });
          alert('❌ Failed to update: ' + response.data.message);
        }
      })
      .catch(error => {
        console.error('Update error:', error);
        this.setState({ isLoading: false });
        alert('❌ Failed to update: ' + (error.response?.data?.message || error.message));
      });
    }

    render() {
      const mystyle = {
        color: "BLACK",
        backgroundColor: "#ffffff",
        padding: "40px",
        fontFamily: "Arial",
        maxWidth: "800px",
        margin: "50px auto",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      };

      const labelStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        padding: '8px',
      };

      const inputStyle = {
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '10px',
        width: '350px',
        fontSize: '14px',
      };

      const selectStyle = {
        ...inputStyle,
        width: '350px',
      };

      const buttonStyle = {
        padding: '12px 30px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '20px',
        width: '100%',
      };

      const buttonDisabledStyle = {
        ...buttonStyle,
        backgroundColor: '#6c757d',
        cursor: 'not-allowed',
      };

      const sectionStyle = {
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #dee2e6',
      };

      const sectionTitleStyle = {
        marginTop: 0,
        marginBottom: '20px',
        color: '#1f11a1',
        borderBottom: '2px solid #1f11a1',
        paddingBottom: '10px',
      };

      return (
        <div style={mystyle}>
          <h1 style={{backgroundColor: '#1f11a1', color: 'white', padding: '15px', borderRadius: '4px', marginTop: 0, textAlign: 'center'}}>
            🇲🇾 LHDN E-Invoice Configuration
          </h1>
          
          <div style={{textAlign: 'center', marginBottom: '20px', color: '#666'}}>
            <strong>{companyID}</strong> - {companyName}
          </div>
          
          {/* Company LHDN TIN Section */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>1. LHDN Tax Identification Number (TIN)</h3>
            <div style={labelStyle}>
              <label style={{fontWeight: 'bold'}}>LHDN TIN No. :</label>
              <input 
                className="text-uppercase" 
                type="text" 
                style={inputStyle}
                maxLength={50} 
                ref={this.lhdnTinNoEl} 
                defaultValue={this.state.lhdnTinNo}
                placeholder="e.g., C1234567890"
              />
            </div>
            <small style={{color: '#666'}}>
              Your company's Tax Identification Number registered with LHDN.
            </small>
          </div>
          
          {/* LHDN API Credentials Section */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>2. LHDN API Credentials</h3>
            <div style={labelStyle}>
              <label style={{fontWeight: 'bold'}}>Environment :</label>
              <select 
                ref={this.lhdnEnvironmentEl}
                defaultValue={this.state.lhdnEnvironment}
                style={selectStyle}
              >
                <option value="SANDBOX">Sandbox (Testing - preprod-api.myinvois.hasil.gov.my)</option>
                <option value="PRODUCTION">Production (Live - api.myinvois.hasil.gov.my)</option>
              </select>
            </div>
            
            <div style={labelStyle}>
              <label style={{fontWeight: 'bold'}}>Client ID :</label>
              <input 
                type="text" 
                style={inputStyle}
                ref={this.lhdnClientIDEl}
                defaultValue={this.state.lhdnClientID}
                placeholder="Enter Client ID from MyInvois portal"
              />
            </div>
            
            <div style={labelStyle}>
              <label style={{fontWeight: 'bold'}}>Client Secret :</label>
              <input 
                type="password" 
                style={inputStyle}
                ref={this.lhdnClientSecretEl}
                defaultValue={this.state.lhdnClientSecret}
                placeholder="Enter Client Secret from MyInvois portal"
              />
            </div>
            <small style={{color: '#666'}}>
              Get these credentials from the MyInvois portal after ERP registration.
              <br/>
              ⚠️ Keep Client Secret secure - it will be encrypted in the database.
            </small>
          </div>
          
          {/* Information Note */}
          <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px'}}>
            <small style={{color: '#856404'}}>
              <strong>📌 How to get LHDN Credentials:</strong><br/>
              1. Register at <strong>https://preprod-mytax.hasil.gov.my/</strong> (Sandbox) or <strong>https://mytax.hasil.gov.my/</strong> (Production)<br/>
              2. Go to Taxpayer Profile → ERP → Register ERP<br/>
              3. Enter your ERP name and set permissions<br/>
              4. Copy the generated Client ID and Client Secret<br/>
              5. Add as Intermediary with full permissions (Submit, Cancel, Reject)
            </small>
          </div>
          
          <button 
            type="button"
            onClick={this.handleLhdnUpdate}
            style={this.state.isLoading ? buttonDisabledStyle : buttonStyle}
            disabled={this.state.isLoading}
          >
            {this.state.isLoading ? 'Saving...' : '💾 Save All LHDN Credentials'}
          </button>
        </div>
      )
    }
}

export default CompanyProfile;