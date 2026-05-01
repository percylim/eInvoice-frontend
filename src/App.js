// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/userLogin';
import InvoiceList from './pages/InvoiceList';
import InvoiceDraft from './pages/InvoiceDraft';
import InvoiceViewer from './pages/InvoiceViewer';
import InvoiceStatus from './pages/InvoiceStatus';
import InvoiceReport from './pages/InvoiceReport';
import Navigation from './components/Navigation';
import CompanyProfile from './pages/companyProfile';
import Logout from './pages/logout';


function App() {
  return (
    <BrowserRouter>
      <div>
        <Navigation />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/einvoice" element={<InvoiceList />} />
          <Route path="/einvoice" element={<InvoiceList />} />
          <Route path="/einvoice/new" element={<InvoiceDraft />} />
          <Route path="/einvoice/edit/:invoiceNo" element={<InvoiceDraft />} />
          <Route path="/einvoice/view/:invoiceNo" element={<InvoiceViewer />} />
          <Route path="/einvoice/status/:invoiceNo" element={<InvoiceStatus />} />
          <Route path="/einvoice/report" element={<InvoiceReport />} />
           <Route path="/einvoice/companyProfile" element={<CompanyProfile />} />    
           <Route path="/einvoice/logout" element={<Logout />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;  // ✅ Make sure this line exists