import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

// Import All Application Providers
import { EmployeeProvider } from './context/EmployeeProvider';
import { AttendanceProvider } from './context/AttendanceProvider';
import { LeaveRequestProvider } from './context/LeaveRequestProvider';
import { SettingsProvider } from './context/SettingsProvider'; // <-- NEW: Import the new provider
import AdminProvider from './context/AdminProvider';
import { AuthProvider } from './context/AuthProvider';
import { NotificationProvider } from "./context/NotificationProvider";
import HolidayCalendarProvider from './context/HolidayCalendarProvider';

// Import Employee-Specific Providers
import CurrentEmployeeAttendanceProvider from './EmployeeContext/CurrentEmployeeAttendanceProvider';
import CurrentEmployeeLeaveRequestProvider from './EmployeeContext/CurrentEmployeeLeaveRequestProvider';
import { CurrentEmployeeProvider } from './EmployeeContext/CurrentEmployeeProvider';
import CurrentEmployeeNotificationProvider from './EmployeeContext/CurrentEmployeeNotificationProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 
        The provider stack wraps your entire application. 
        The order ensures that any provider can potentially access data from a provider that wraps it.
      */}
      <EmployeeProvider>
        <LeaveRequestProvider>
          <AttendanceProvider>
            {/* The new SettingsProvider is added here, making it available to all child components */}
            <SettingsProvider>
              <AdminProvider>
                <AuthProvider>
                  <NotificationProvider>
                    <CurrentEmployeeAttendanceProvider>
                      <CurrentEmployeeLeaveRequestProvider>
                        <CurrentEmployeeProvider>
                          <CurrentEmployeeNotificationProvider>
                            <HolidayCalendarProvider>
                              <App />
                            </HolidayCalendarProvider>
                          </CurrentEmployeeNotificationProvider>
                        </CurrentEmployeeProvider>
                      </CurrentEmployeeLeaveRequestProvider>
                    </CurrentEmployeeAttendanceProvider>
                  </NotificationProvider>
                </AuthProvider>
              </AdminProvider>
            </SettingsProvider>
          </AttendanceProvider>
        </LeaveRequestProvider>
      </EmployeeProvider>
    </BrowserRouter>
  </React.StrictMode>
);