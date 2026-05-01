import React from 'react';
import EscapeStr from './mysqlConvertChar';
import './Profile.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Axios from "axios";
import moment from 'moment';

const url = process.env.REACT_APP_SERVER_URL || 'http://localhost:3000';

var companyID = localStorage.getItem('companyID');
const companyName = localStorage.getItem('companyName');

class CompanyProfile extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        imgData: [],
        imageID: '',
        finYearStart: null,
        finYearEnd: null,      
      };

      // Create refs ONLY for fields that exist in render
      this.companyIDEl = React.createRef();
      this.companyNameEl = React.createRef();
      this.registerNoEl = React.createRef();
      this.address1El = React.createRef();
      this.address2El = React.createRef();
      this.cityEl = React.createRef();
      this.stateEl = React.createRef();
      this.postcodeEl = React.createRef();
      this.countryEl = React.createRef();
      this.businessCodeEl = React.createRef();
      this.incomeTaxNoEl = React.createRef();
      this.lhdnTinNoEl = React.createRef();
      this.telNo1El = React.createRef();
      this.emailEl = React.createRef();
      this.websiteEl = React.createRef();
      this.finYearStartEl = React.createRef();
      this.finYearEndEl = React.createRef();
      
      // Bind methods
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleChangeImg = this.handleChangeImg.bind(this);
      this.handleLhdnTinUpdate = this.handleLhdnTinUpdate.bind(this);
      this.loadCompanyInfo = this.loadCompanyInfo.bind(this);
      this.onCancel = this.onCancel.bind(this);
    }

    componentDidMount() {
      console.log('Component mounted, companyID:', companyID);
      
      if (!companyID) {
        console.error('No companyID found');
        return;
      }
      
      // Auto load company data
      this.loadCompanyInfo();
      
      // Load images
      Axios.post(`${url}/api/imageInfo`, { companyID })
        .then(res => {
          const images = res.data;
          if (images && images.length > 0) {
            const firstImageID = images[0].imageID;
            this.setState({
              imgData: images,
              imageID: firstImageID,
            });
          }
        })
        .catch(err => console.error('Error fetching images:', err));
    }

  loadCompanyInfo() {
  console.log('loadCompanyInfo called! companyID:', companyID);
  
  if (!companyID) {
    console.error('No companyID found');
    alert('Please login first');
    return;
  }
  
  // Use the correct endpoint
  Axios.post(`${url}/api/einvoice/getCompanyLHDNInfo`, {
    companyID: companyID
  })
  .then(response => {
    console.log('API Response:', response.data);
    
    const data = response.data;
    
    // Check if data is an array (your backend returns array directly)
    if (data && Array.isArray(data) && data.length > 0) {
      const company = data[0];
      console.log('Company data:', company);
      
      // Populate all fields
      if (this.registerNoEl.current) this.registerNoEl.current.value = company.registerNo || '';
      if (this.address1El.current) this.address1El.current.value = company.address1 || '';
      if (this.address2El.current) this.address2El.current.value = company.address2 || '';
      if (this.cityEl.current) this.cityEl.current.value = company.city || '';
      if (this.stateEl.current) this.stateEl.current.value = company.state || '';
      if (this.postcodeEl.current) this.postcodeEl.current.value = company.postCode || '';
      if (this.countryEl.current) this.countryEl.current.value = company.country || '';
      if (this.businessCodeEl.current) this.businessCodeEl.current.value = company.businessCode || '';
      if (this.incomeTaxNoEl.current) this.incomeTaxNoEl.current.value = company.incomeTaxNo || '';
      if (this.lhdnTinNoEl.current) this.lhdnTinNoEl.current.value = company.lhdnTinNo || '';
      if (this.telNo1El.current) this.telNo1El.current.value = company.telNo1 || '';
      if (this.emailEl.current) this.emailEl.current.value = company.email || '';
      if (this.websiteEl.current) this.websiteEl.current.value = company.website || '';
      
      if (company.companyLogo) {
        this.setState({ imageID: company.companyLogo });
      }
      
      const today = new Date();
      const finYearStart = company.finYearStart ? new Date(company.finYearStart) : today;
      const finYearEnd = company.finYearEnd ? new Date(company.finYearEnd) : today;

      this.setState({
        finYearStart: finYearStart,
        finYearEnd: finYearEnd
      });
      
      alert('Company data loaded successfully!');
    } 
    // Alternative: Check if data has success property
    else if (data && data.success && data.data) {
      const company = data.data;
      console.log('Company data (nested):', company);
      // Same population code as above...
      if (this.registerNoEl.current) this.registerNoEl.current.value = company.registerNo || '';
      if (this.address1El.current) this.address1El.current.value = company.address1 || '';
      if (this.address2El.current) this.address2El.current.value = company.address2 || '';
      if (this.cityEl.current) this.cityEl.current.value = company.city || '';
      if (this.stateEl.current) this.stateEl.current.value = company.state || '';
      if (this.postcodeEl.current) this.postcodeEl.current.value = company.postCode || '';
      if (this.countryEl.current) this.countryEl.current.value = company.country || '';
      if (this.businessCodeEl.current) this.businessCodeEl.current.value = company.businessCode || '';
      if (this.incomeTaxNoEl.current) this.incomeTaxNoEl.current.value = company.incomeTaxNo || '';
      if (this.lhdnTinNoEl.current) this.lhdnTinNoEl.current.value = company.lhdnTinNo || '';
      if (this.telNo1El.current) this.telNo1El.current.value = company.telNo1 || '';
      if (this.emailEl.current) this.emailEl.current.value = company.email || '';
      if (this.websiteEl.current) this.websiteEl.current.value = company.website || '';
      
      if (company.companyLogo) {
        this.setState({ imageID: company.companyLogo });
      }
      
      const today = new Date();
      const finYearStart = company.finYearStart ? new Date(company.finYearStart) : today;
      const finYearEnd = company.finYearEnd ? new Date(company.finYearEnd) : today;

      this.setState({
        finYearStart: finYearStart,
        finYearEnd: finYearEnd
      });
      
//alert('Company data loaded successfully!');
    }
    else {
      console.error('No data returned or invalid format:', data);
      alert('No company data found. Response: ' + JSON.stringify(data));
    }
  })
  .catch(error => {
    console.error('Error loading company info:', error);
    alert('Failed to load company data: ' + (error.response?.data?.message || error.message));
  });
}




handleSubmit(e) {
      e.preventDefault();
      console.log('handleSubmit called');
      
      if(this.validate()){
        let startDate = moment(this.state.finYearStart).format('YYYY-MM-DD');
        let endDate = moment(this.state.finYearEnd).format('YYYY-MM-DD');

        const user = {
          companyID: EscapeStr(companyID),
          companyName: EscapeStr(companyName),
          registerNo: EscapeStr(this.registerNoEl.current.value).toUpperCase(),
          address1: EscapeStr(this.address1El.current.value),
          address2: EscapeStr(this.address2El.current.value),
          city: EscapeStr(this.cityEl.current.value),
          state: EscapeStr(this.stateEl.current.value),
          postcode: this.postcodeEl.current.value,
          country: EscapeStr(this.countryEl.current.value),
          businessCode: EscapeStr(this.businessCodeEl.current.value).toUpperCase(),
          incomeTaxNo: EscapeStr(this.incomeTaxNoEl.current.value).toUpperCase(),
          lhdnTinNo: EscapeStr(this.lhdnTinNoEl.current.value).toUpperCase(),
          telNo1: EscapeStr(this.telNo1El.current.value),
          email: EscapeStr(this.emailEl.current.value),
          website: EscapeStr(this.websiteEl.current.value),
          finYearStart: startDate,
          finYearEnd: endDate,
          companyLogo: this.state.imageID,
        };

        Axios.post(`${url}/api/companyUpdate`, user)
          .then(response => {
            const text = response.data;
            if (text.includes('Success')) {
              localStorage.setItem('companyName', user.companyName);
              localStorage.setItem('registerNo', user.registerNo);
              localStorage.setItem('lhdnTinNo', user.lhdnTinNo);
              alert('Company profile updated successfully!');
              window.location.reload(false);
            } else {
              alert('Update failed');
            }
          })
          .catch(error => {
            console.error('Update error:', error);
            alert('Failed to update company profile: ' + (error.response?.data?.message || error.message));
          });
      }
    }

    validate() {
      if (this.registerNoEl.current.value === '') {
        alert('Company Register is blank');
        return false;
      }
      if (this.state.finYearStart === null) {
        alert('Company Starting Date must select');
        return false;
      }
      if (this.state.finYearEnd === null) {
        alert('Company Ending Date must select');
        return false;
      }
      return true;
    }

    handleLhdnTinUpdate = () => {
      const lhdnTinNo = EscapeStr(this.lhdnTinNoEl.current.value).toUpperCase();
      
      if (!lhdnTinNo) {
        alert('Please enter LHDN TIN');
        return;
      }

      const tinRegex = /^[A-Z0-9\-]{10,15}$/i;
      if (!tinRegex.test(lhdnTinNo)) {
        alert('Invalid LHDN TIN format. Should be 10-15 characters (digits, letters, or hyphens)');
        return;
      }

      Axios.post(`${url}/api/einvoice/updateCompanyLhdnTin`, {
        companyID: companyID,
        lhdnTinNo: lhdnTinNo
      })
      .then(response => {
        if (response.data.success) {
          localStorage.setItem('lhdnTinNo', lhdnTinNo);
          alert('LHDN TIN updated successfully!');
          window.location.reload(false);
        } else {
          alert('Failed to update LHDN TIN: ' + response.data.message);
        }
      })
      .catch(error => {
        console.error('LHDN TIN update error:', error);
        alert('Failed to update LHDN TIN: ' + (error.response?.data?.message || error.message));
      });
    };

    handleChangeImg = (e) => {
      this.setState({
        imageID: e.target.value
      });
    };

    onCancel() {
      console.log('onCancel called');
      if (this.registerNoEl.current) this.registerNoEl.current.value = "";
      if (this.address1El.current) this.address1El.current.value = "";
      if (this.address2El.current) this.address2El.current.value = "";
      if (this.cityEl.current) this.cityEl.current.value = "";
      if (this.stateEl.current) this.stateEl.current.value = "";
      if (this.postcodeEl.current) this.postcodeEl.current.value = "";
      if (this.countryEl.current) this.countryEl.current.value = "";
      if (this.businessCodeEl.current) this.businessCodeEl.current.value = "";
      if (this.incomeTaxNoEl.current) this.incomeTaxNoEl.current.value = "";
      if (this.lhdnTinNoEl.current) this.lhdnTinNoEl.current.value = "";
      if (this.telNo1El.current) this.telNo1El.current.value = "";
      if (this.emailEl.current) this.emailEl.current.value = "";
      if (this.websiteEl.current) this.websiteEl.current.value = "";
      this.setState({
        finYearStart: null,
        finYearEnd: null
      });
    }

    toInputLowercase(e) {
      e.target.value = ("" + e.target.value).toLowerCase();
    }

    render() {
      const mystyle = {
        color: "BLACK",
        backgroundColor: "#ffffff",
        padding: "20px",
        fontFamily: "Arial",
        maxWidth: "800px",
        margin: "0 auto",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        borderRadius: "8px",
      };

      const labelStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        padding: '5px',
      };

      const inputStyle = {
        border: '1px solid #696969',
        borderRadius: '4px',
        padding: '5px',
        width: '250px',
      };

      return (
        <form style={mystyle}>
          <fieldset>
            <h1 style={{backgroundColor: 'black', color: 'white', textAlign: 'center', padding: '10px', borderRadius: '4px'}}>
              Company Profile Maintenance
            </h1>

            <div style={labelStyle}>
              <label>Company ID :</label>
              <input style={inputStyle} type="text" ref={this.companyIDEl} placeholder={companyID} readOnly={true}/>
            </div>

            <div style={labelStyle}>
              <label>Company Name :</label>
              <input style={inputStyle} type="text" ref={this.companyNameEl} placeholder={companyName} readOnly={true} />
            </div>

            <div style={labelStyle}>
              <label>Company Register No. :</label>
              <input style={inputStyle} className="text-uppercase" type="text" ref={this.registerNoEl} />
            </div>

            <div style={labelStyle}>
              <label>Company Address #1 :</label>
              <input style={inputStyle} type="text" ref={this.address1El} />
            </div>

            <div style={labelStyle}>
              <label>Company Address #2 :</label>
              <input style={inputStyle} type="text" ref={this.address2El} />
            </div>

            <div style={labelStyle}>
              <label>City :</label>
              <input style={inputStyle} type="text" ref={this.cityEl} />
            </div>

            <div style={labelStyle}>
              <label>State :</label>
              <input style={inputStyle} type="text" ref={this.stateEl} />
            </div>

            <div style={labelStyle}>
              <label>Post Code :</label>
              <input style={inputStyle} type="text" ref={this.postcodeEl} />
            </div>

            <div style={labelStyle}>
              <label>Country :</label>
              <input style={inputStyle} type="text" ref={this.countryEl} />
            </div>

            <div style={labelStyle}>
              <label>Business Code :</label>
              <input style={inputStyle} className="text-uppercase" type="text" ref={this.businessCodeEl} />
            </div>

            <div style={labelStyle}>
              <label>Income Tax No. :</label>
              <input style={inputStyle} className="text-uppercase" type="text" ref={this.incomeTaxNoEl} />
            </div>

            {/* LHDN TIN Field */}
            <div style={{...labelStyle, backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px', marginBottom: '10px'}}>
              <span style={{fontWeight: 'bold'}}>🇲🇾 LHDN TIN No. (for e-invoice) :</span>
              <div>
                <input 
                  style={inputStyle}
                  className="text-uppercase" 
                  type="text" 
                  ref={this.lhdnTinNoEl} 
                  placeholder="e.g., 1234567890 or C1234567890"
                />
                <button 
                  type="button"
                  onClick={this.handleLhdnTinUpdate}
                  style={{marginLeft: '10px', padding: '5px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                >
                  💾 Save LHDN TIN
                </button>
              </div>
            </div>

            <div style={labelStyle}>
              <label>Telephone No. #1 :</label>
              <input style={inputStyle} type="text" ref={this.telNo1El} />
            </div>

            <div style={labelStyle}>
              <label>Company Email :</label>
              <input style={inputStyle} type="email" ref={this.emailEl} />
            </div>

            <div style={labelStyle}>
              <label>Company Website :</label>
              <input style={inputStyle} type="text" ref={this.websiteEl} />
            </div>

            <div style={labelStyle}>
              <label>Financial Starting Date :</label>
              <DatePicker
                selected={this.state.finYearStart}
                onChange={(date) => this.setState({ finYearStart: date })}
                dateFormat="dd/MM/yyyy"
              />
            </div>

            <div style={labelStyle}>
              <label>Financial Ending Date :</label>
              <DatePicker
                selected={this.state.finYearEnd}
                onChange={(date) => this.setState({ finYearEnd: date })}
                dateFormat="dd/MM/yyyy"
              />
            </div>

            <div className="select-container" style={{marginTop: '20px'}}>
              <label>Company Logo:</label>
              <select
                value={this.state.imageID}
                onChange={this.handleChangeImg}
                style={{ marginLeft: '10px' }}
              >
                {this.state.imgData.map(item => (
                  <option key={item.imageID} value={item.imageID}>
                    {item.imageID}
                  </option>
                ))}
              </select>
              <img src={`${url}/uploads/${this.state.imageID}`} alt="Company Logo" style={{maxWidth: '200px', display: 'block', marginTop: '10px'}} />
            </div>

            <div style={{textAlign: 'center', marginTop: '20px'}}>
              <button type="button" style={{ backgroundColor: "red", color: "white", padding: '10px 20px', margin: '5px', cursor: 'pointer' }} onClick={this.handleSubmit}>
                Submit
              </button>
              <button type="button" style={{ backgroundColor: "blue", color: "white", padding: '10px 20px', margin: '5px', cursor: 'pointer' }} onClick={this.loadCompanyInfo}>
                Load Company Information
              </button>
              <button type="button" style={{ backgroundColor: "yellow", color: "black", padding: '10px 20px', margin: '5px', cursor: 'pointer' }} onClick={this.onCancel}>
                Clear
              </button>
            </div>
          </fieldset>
        </form>
      )
    }
}

export default CompanyProfile;