import React, { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaCalendarAlt, FaClipboardList, FaBuilding, FaChevronLeft, FaChevronRight, FaSyncAlt } from "react-icons/fa";
import AttendanceChart from "../components/AttendanceChart";
import DepartmentPieChart from "../components/DepartmentPieChart";
import { EmployeeContext } from "../context/EmployeeContext";
import { AttendanceContext } from "../context/AttendanceContext";
import { LeaveRequestContext } from "../context/LeaveRequestContext";

const AdminDashboard = () => {
  const { employees } = useContext(EmployeeContext);
  const { attendanceRecords } = useContext(AttendanceContext);
  const { leaveRequests } = useContext(LeaveRequestContext);

  const [selectedDept, setSelectedDept] = useState("All");
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week

  const navigate = useNavigate();

  const departmentSet = useMemo(() => {
    return new Set(employees.map((emp) => emp.department));
  }, [employees]);

  // Calculate current week dates
  const getCurrentWeekDates = (weekOffset = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1 + (weekOffset * 7));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0],
      monday: monday,
      sunday: sunday
    };
  };

  const weekDates = getCurrentWeekDates(currentWeek);

  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const employee = employees.find(
        (emp) => String(emp.employeeId) === String(record.employeeId)
      );

      const dateMatch = record.date >= weekDates.start && record.date <= weekDates.end;

      const deptMatch =
        selectedDept === "All" || (employee && employee.department === selectedDept);

      return dateMatch && deptMatch;
    });
  }, [attendanceRecords, employees, selectedDept, weekDates]);

  const formatWeekRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    
    // If both dates are in the same year, show year only once
    if (startDate.getFullYear() === endDate.getFullYear()) {
      const startOptions = { month: 'short', day: 'numeric' };
      return `${startDate.toLocaleDateString('en-US', startOptions)} - ${endDate.toLocaleDateString('en-US', options)}`;
    } else {
      // If dates span different years, show year for both
      return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    }
  };

  const goToPreviousWeek = () => {
    setCurrentWeek(currentWeek - 1);
  };

  const goToNextWeek = () => {
    setCurrentWeek(currentWeek + 1);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(0);
  };

  const today = new Date().toISOString().split("T")[0];

  const onLeaveToday = attendanceRecords.filter(
    (record) => record.date === today && record.status === "Leave"
  ).length;

  const pendingCount = leaveRequests.filter((req) => req.status === "Pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Stat Cards */}
        <div
          className="bg-white p-6 rounded-2xl shadow-lg cursor-pointer hover:bg-blue-50 transition flex flex-col items-center gap-2"
          onClick={() => navigate("/employees")}
        >
          <FaUsers className="text-3xl text-blue-600 mb-1" />
          <h3 className="text-gray-600 font-semibold">Total Employees</h3>
          <p className="text-3xl font-extrabold text-gray-800">{employees.length}</p>
        </div>

        <div
          className="bg-white p-6 rounded-2xl shadow-lg cursor-pointer hover:bg-blue-50 transition flex flex-col items-center gap-2"
          onClick={() => navigate("/admin/on-leave-today")}
        >
          <FaCalendarAlt className="text-3xl text-yellow-500 mb-1" />
          <h3 className="text-gray-600 font-semibold">On Leave Today</h3>
          <p className="text-3xl font-extrabold text-gray-800">{onLeaveToday}</p>
        </div>

        <div
          onClick={() =>
            navigate("/leave-management", { state: { defaultStatus: "Pending" } })
          }
          className="bg-white p-6 rounded-2xl shadow-lg cursor-pointer hover:bg-blue-50 transition flex flex-col items-center gap-2"
        >
          <FaClipboardList className="text-3xl text-purple-600 mb-1" />
          <h3 className="text-gray-600 font-semibold">Pending Leaves</h3>
          <p className="text-3xl font-extrabold text-gray-800">{pendingCount}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center gap-2">
          <FaBuilding className="text-3xl text-green-600 mb-1" />
          <h3 className="text-gray-600 font-semibold">Departments</h3>
          <p className="text-3xl font-extrabold text-gray-800">{departmentSet.size}</p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-blue-700">Weekly Attendance View</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousWeek}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-1 font-semibold shadow"
            >
              <FaChevronLeft /> Previous
            </button>
            <span className="text-base font-medium text-gray-700 px-2">
              {formatWeekRange(weekDates.start, weekDates.end)}
            </span>
            <button
              onClick={goToNextWeek}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-1 font-semibold shadow"
            >
              Next <FaChevronRight />
            </button>
            {currentWeek !== 0 && (
              <button
                onClick={goToCurrentWeek}
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-1 font-semibold shadow"
              >
                <FaSyncAlt /> Current
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter by Department */}
      <div className="mt-6 bg-white p-6 rounded-2xl shadow-lg">
        <label className="block text-sm font-semibold text-blue-700 mb-2">
          Filter by Department
        </label>
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full max-w-xs font-semibold text-gray-700"
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
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-8">
        <div className="col-span-1 xl:col-span-3 bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-blue-700 font-bold">Attendance Overview</h3>
            <span className="text-sm text-gray-500">
              {selectedDept !== "All" ? `${selectedDept} Department` : "All Departments"} | 
              {filteredAttendance.length} records
            </span>
          </div>
          <AttendanceChart data={filteredAttendance} />
        </div>

        <div className="col-span-1 bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-blue-700 font-bold mb-2">Department Stats</h3>
          <DepartmentPieChart data={employees} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
