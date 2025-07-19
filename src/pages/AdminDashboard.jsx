import React, { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import AttendanceChart from "../components/AttendanceChart";
import DepartmentPieChart from "../components/DepartmentPieChart";
import { EmployeeContext } from "../context/EmployeeContext";
import { AttendanceContext } from "../context/AttendanceContext";
import { LeaveRequestContext } from "../context/LeaveRequestContext";

const AdminDashboard = () => {
  const { employees } = useContext(EmployeeContext);
  const { attendanceRecords } = useContext(AttendanceContext);
  const { leaveRequests } = useContext(LeaveRequestContext);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");

  const navigate = useNavigate();

  const departmentSet = useMemo(() => {
    return new Set(employees.map((emp) => emp.department));
  }, [employees]);

  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const employee = employees.find(
        (emp) => String(emp.id) === String(record.employeeId)
      );

      const dateMatch =
        !startDate || !endDate || (record.date >= startDate && record.date <= endDate);

      const deptMatch =
        selectedDept === "All" || (employee && employee.department === selectedDept);

      return dateMatch && deptMatch;
    });
  }, [attendanceRecords, employees, startDate, endDate, selectedDept]);

  const today = new Date().toISOString().split("T")[0];

  const onLeaveToday = attendanceRecords.filter(
    (record) => record.date === today && record.status === "Leave"
  ).length;

  const pendingCount = leaveRequests.filter((req) => req.status === "Pending").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Stat Cards */}
      <div
        className="bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-gray-100 transition"
        onClick={() => navigate("/employees")}
      >
        <h3 className="text-gray-600">Total Employees</h3>
        <p className="text-2xl font-bold text-gray-800">{employees.length}</p>
      </div>

      <div
        className="bg-white p-4 rounded-xl shadow cursor-pointer hover:bg-gray-100 transition"
        onClick={() => navigate("/admin/on-leave-today")}
      >
        <h3 className="text-gray-600">On Leave Today</h3>
        <p className="text-2xl font-bold text-gray-800">{onLeaveToday}</p>
      </div>

      <div
        onClick={() =>
          navigate("/leave-management", { state: { defaultStatus: "Pending" } })
        }
        className="bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-md transition"
      >
        <h3 className="text-gray-600">Pending Leaves</h3>
        <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-gray-600">Departments</h3>
        <p className="text-2xl font-bold text-gray-800">{departmentSet.size}</p>
      </div>

      {/* Filter by Date */}
      <div className="col-span-1 md:col-span-2 xl:col-span-4 bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2">Filter by Date</h3>
        <div className="flex flex-wrap gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-4 py-2 rounded"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-4 py-2 rounded"
          />
        </div>
      </div>

      {/* Filter by Department */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Filter by Department
        </label>
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="border px-4 py-2 rounded w-full max-w-xs"
        >
          <option value="All">All</option>
          {[...departmentSet].map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Charts */}
      <div className="col-span-1 md:col-span-2 xl:col-span-3 bg-white p-4 rounded-xl shadow mt-6">
        <h3 className="text-gray-700 font-semibold mb-2">Attendance Overview</h3>
        <AttendanceChart data={filteredAttendance} />
      </div>

      <div className="col-span-1 xl:col-span-1 bg-white p-4 rounded-xl shadow mt-6">
        <h3 className="text-gray-700 font-semibold mb-2">Department Stats</h3>
        <DepartmentPieChart data={employees} />
      </div>
    </div>
  );
};

export default AdminDashboard;
