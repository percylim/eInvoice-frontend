// src/components/Navigation.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();
  const companyName = localStorage.getItem('companyName');
  const links = [
    { to: '/einvoice', label: '📋 Invoices', icon: '📋' },
    { to: '/einvoice/report', label: '📊 Report', icon: '📊' },
    { to: '/einvoice/companyProfile', label: ' 📝 Edit Company LHDN', icon: '✍️'},
    { to: '/einvoice/logout', label: ' 🛫  Logout', icon: '🛫'}
  ];
  
  return (
    <nav style={{ 
      backgroundColor: '#2c3e50', 
      padding: '10px 20px',
      display: 'flex',
      gap: 20,
      marginBottom: 20,
      alignItems: 'center'
    }}>
      <h3 style={{ color: 'white', margin: 0, marginRight: 10 }}>E-Invoice System - </h3>
      <h4 style={{ color: 'white', textAlign: 'right', margin: 0, marginRight: 8 }}>{companyName}</h4> 
      {links.map(link => (
        <Link
          key={link.to}
          to={link.to}
          style={{
            color: location.pathname === link.to ? '#ffc107' : 'white',
            textDecoration: 'none',
            padding: '5px 10px',
            borderRadius: '4px',
            backgroundColor: location.pathname === link.to ? 'rgba(255,255,255,0.1)' : 'transparent'
          }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}