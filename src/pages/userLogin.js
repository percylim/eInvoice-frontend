import React from 'react';
import Axios from 'axios';
import './login.css';

const url = process.env.REACT_APP_SERVER_URL || 'http://localhost:3000';

class userLogin extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        isLoading: false
      };
      this.companyIDEl = React.createRef();
      this.employeeNoEl = React.createRef();
      this.passwordEl = React.createRef();
      this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
      e.preventDefault();
      
      this.setState({ isLoading: true });
      
      const user = {
        companyID: this.companyIDEl.current.value,
        employeeNo: this.employeeNoEl.current.value,
        password: this.passwordEl.current.value,
      };

      if (!user.companyID || !user.employeeNo || !user.password) {
        alert('Please fill in all fields');
        this.setState({ isLoading: false });
        return;
      }

      console.log('Sending login request to:', `${url}/api/userLogin`);
      console.log('With data:', { companyID: user.companyID, employeeNo: user.employeeNo });

      Axios.post(`${url}/api/userLogin`, user)
        .then(response => {
          console.log("Login response:", response.data);
          
          const data = response.data;
          
          // Save login info
          localStorage.clear();
          localStorage.setItem('companyID', user.companyID);
          localStorage.setItem('userName', data.employeeName);
          localStorage.setItem('userLevel', data.level);
          localStorage.setItem('userNo', data.employeeNo);

          // Fetch company data
          return Axios.post(`${url}/api/companyData`, {
            companyID: user.companyID
          });
        })
        .then(companyResponse => {
          console.log("Company data response:", companyResponse.data);
          
          if (companyResponse && companyResponse.data && companyResponse.data.length > 0) {
            localStorage.setItem('companyName', companyResponse.data[0].companyName);
            localStorage.setItem('registerNo', companyResponse.data[0].registerNo);
            
            if (companyResponse.data[0].lhdnTinNo) {
              localStorage.setItem('lhdnTinNo', companyResponse.data[0].lhdnTinNo);
            }
          }
          
          window.location = "/Sidebar";
        })
        .catch(err => {
          console.error("Login error:", err);
          
          let errorMessage = "Login failed: ";
          if (err.response) {
            errorMessage += err.response.data?.error || err.response.statusText;
          } else if (err.request) {
            errorMessage += "Cannot connect to server. Make sure backend is running.";
          } else {
            errorMessage += err.message;
          }
          
          alert(errorMessage);
          this.setState({ isLoading: false });
        });
    }

    render() {
        const mystyle = {
            color: "black",
            backgroundColor: "#04ffac",
            padding: "10px 45px 10px 0px",
            fontFamily: "Arial",
        };

        const substyle = {
            color: "white",
            backgroundColor: "blue",
            padding: "10px 20px 10px 20px",
            fontFamily: "Arial",
            width: '6em',
            height: '3em',
            cursor: 'pointer'
        };
        
        const disabledStyle = {
            ...substyle,
            backgroundColor: "gray",
            cursor: 'not-allowed'
        };
   
        return (
            <form style={mystyle} onSubmit={this.handleSubmit}>
              <fieldset>
                <p><h1>User Login</h1></p>

                <label style={{color: 'black', paddingLeft: '0px'}}>
                  Company Register ID :
                  <input 
                    type="text" 
                    maxLength={50} 
                    ref={this.companyIDEl} 
                    style={{marginLeft: '1rem'}} 
                    name="companyname" 
                    required
                    disabled={this.state.isLoading}
                  />
                </label>
                
                <label style={{color: 'black', paddingLeft: '0px'}}>
                  Employee No : 
                  <input 
                    type="text" 
                    style={{marginLeft: "72px"}}
                    maxLength={100} 
                    ref={this.employeeNoEl} 
                    name="employeeNo" 
                    required
                    disabled={this.state.isLoading}
                  />
                </label>
                
                <label style={{color: 'black', paddingLeft: '0px'}}>
                  Password : 
                  <input 
                    type="password" 
                    style={{marginLeft: "100px"}}
                    name="password" 
                    ref={this.passwordEl} 
                    required
                    disabled={this.state.isLoading}
                  />
                </label>
              </fieldset>

              <p>
                <input 
                  type="submit" 
                  style={this.state.isLoading ? disabledStyle : substyle} 
                  className="login" 
                  name="Submit" 
                  value={this.state.isLoading ? "Loading..." : "Submit"} 
                  disabled={this.state.isLoading}
                />
              </p>
            </form>
        )
    }
};

export default userLogin;