import React from "react";
import { Routes, Route } from "react-router-dom";

// Layouts
import LayoutAdmin from "./components/admin/LayoutAdmin";
import LayoutEmployee from "./components/employee/LayoutEmployee"; // 👈 You’ll create this next

// Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeManagement from "./pages/EmployeeManagement";
import AddEmployee from "./pages/AddEmployee";
import EditEmployee from "./pages/EditEmployee";
import Attendance from "./pages/Attendance";
import AddAttendance from "./pages/AddAttendance";
import EditAttendance from "./pages/EditAttendance";
import LeaveManagement from "./pages/LeaveManagement";
import AdminLeaveSummary from "./pages/AdminLeaveSummary";
import AdminProfile from "./pages/AdminProfile";
import EmployeeProfile from "./pages/EmployeeProfile";
import EmployeeLeaveSummary from "./pages/EmployeeLeaveSummary";
import AdminNotifications from "./pages/AdminNotifications"; // create this page
import EmployeesOnLeaveToday from "./pages/EmployeesOnLeaveToday";
import ForgotPassword from "./pages/ForgotPassword"; // New forgot password page
import EmployeeAttendanceProfile from "./pages/EmployeeAttendanceProfile";
import AdminNotices from "./pages/AdminNotices.jsx"; // Add this import
import { NoticeProvider } from "./context/NoticeProvider"; // Add NoticeProvider import

// Route protection
import ProtectedRoute from "./components/ProtectedRoute"; // 👈 You created this

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin protected routes */}
      <Route
        element={
          <ProtectedRoute role="admin">
            <LayoutAdmin />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/employees" element={<EmployeeManagement />} />
        <Route path="/employees/add" element={<AddEmployee />} />
        <Route path="/employees/edit/:id" element={<EditEmployee />} />
        <Route path="/employee/:id/profile" element={<EmployeeProfile />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance/add" element={<AddAttendance />} />
        <Route path="/attendance/edit/:id" element={<EditAttendance />} />
        <Route path="/attendance/profile/:employeeId" element={<EmployeeAttendanceProfile />} />
        <Route path="/leave-management" element={<LeaveManagement />} />
        <Route path="/admin/leave-summary" element={<AdminLeaveSummary />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/on-leave-today" element={<EmployeesOnLeaveToday />} />
        <Route path="/admin/notices" element={
          <NoticeProvider>
            <AdminNotices />
          </NoticeProvider>
        } /> {/* Notices feature route */}
      </Route>

      {/* Employee protected routes */}
      <Route
        element={
          <ProtectedRoute role="employee">
            <LayoutEmployee />
          </ProtectedRoute>
        }
      >
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/profile" element={<EmployeeProfile />} />
        <Route
          path="/employee/leave-summary"
          element={<EmployeeLeaveSummary />}
        />
      </Route>
    </Routes>
  );
}

export default App;
