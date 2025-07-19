import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { EmployeeProvider } from './context/EmployeeProvider'; // ✅ import only the provider
import { AttendanceProvider } from './context/AttendanceProvider';
import { LeaveRequestProvider } from './context/LeaveRequestProvider';
import AdminProvider from './context/AdminProvider';
import {AuthProvider} from './context/AuthProvider';
import { NotificationProvider } from "./context/NotificationProvider";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <LeaveRequestProvider>
      <EmployeeProvider>
        <AttendanceProvider>
          <AdminProvider>
            <AuthProvider>
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </AuthProvider>
          </AdminProvider>
        </AttendanceProvider>
      </EmployeeProvider>
    </LeaveRequestProvider>
    </BrowserRouter>
  </React.StrictMode>
);
