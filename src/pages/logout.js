import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Logout() {
  const navigate = useNavigate();
  const name = localStorage.getItem('companyName');

  const handleConfirm = () => {
    // Clear all localStorage
    localStorage.clear();
    
    // Navigate to login page (root path)
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#1f11a1',
    fontFamily: 'Arial',
  };

  const contentStyle = {
    textAlign: 'center',
    color: 'white',
    padding: '20px',
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginTop: '30px',
  };

  const headingStyle = {
    color: 'white',
    fontSize: '24px',
    marginBottom: '20px',
  };

  const userNameStyle = {
    color: 'white',
    fontSize: '18px',
    marginTop: '10px',
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <h1 style={headingStyle}>Click Confirm Button to Confirm Logout</h1>
        <p style={userNameStyle}>{name}</p>
        
        <div style={buttonContainerStyle}>
          <Button type="button" variant="danger" onClick={handleConfirm} active>
            Confirm
          </Button>
          <Button type="button" variant="outline-success" onClick={handleCancel} active>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}