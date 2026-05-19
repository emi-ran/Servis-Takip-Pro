
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';

// Pages
import Dashboard from './pages/Dashboard';
import TicketList from './pages/TicketList';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import CustomerList from './pages/CustomerList';
import CustomerDetail from './pages/CustomerDetail';
import Stock from './pages/Stock';
import Accounting from './pages/Accounting';
import WebQuery from './pages/WebQuery';
import PrintView from './pages/PrintView';
import PersonnelList from './pages/PersonnelList';
import Login from './pages/Login';
import Settings from './pages/Settings';

const App = () => {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            
            {/* Public/Common Pages inside App */}
            <Route index element={<Dashboard />} />
            
            <Route path="tickets" element={
              <ProtectedRoute>
                <TicketList />
              </ProtectedRoute>
            } />
            
            <Route path="tickets/new" element={
              <ProtectedRoute>
                <CreateTicket />
              </ProtectedRoute>
            } />
            
            <Route path="tickets/:id" element={
              <ProtectedRoute>
                <TicketDetail />
              </ProtectedRoute>
            } />
            
            <Route path="customers" element={
              <ProtectedRoute>
                <CustomerList />
              </ProtectedRoute>
            } />
            
            <Route path="customers/:id" element={
              <ProtectedRoute>
                <CustomerDetail />
              </ProtectedRoute>
            } />
            
            {/* Restricted Pages */}
            <Route path="stock" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.TECHNICIAN]}>
                <Stock />
              </ProtectedRoute>
            } />
            
            <Route path="accounting" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <Accounting />
              </ProtectedRoute>
            } />
            
            <Route path="personnel" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <PersonnelList />
              </ProtectedRoute>
            } />

            <Route path="settings" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <Settings />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<div>Sayfa Bulunamadı</div>} />
          </Route>
          
          <Route path="/print/:id" element={
            <ProtectedRoute>
              <PrintView />
            </ProtectedRoute>
          } />
          
          {/* Public Page */}
          <Route path="/web-query" element={<WebQuery />} />
        </Routes>
      </HashRouter>
    </DataProvider>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
