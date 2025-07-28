
import { useState, useContext } from "react";
import { AttendanceContext } from "../context/AttendanceContext";
import { EmployeeContext } from "../context/EmployeeContext";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { FaEdit, FaTrash } from "react-icons/fa";


const Attendance = () => {
  const { attendanceRecords, deleteAttendance } = useContext(AttendanceContext);
  const { employees } = useContext(EmployeeContext);
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [snackbar, setSnackbar] = useState("");
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week

  const navigate = useNavigate();

  const handleDelete = (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this record?");
    if (confirmed) {
      deleteAttendance(id);
      setSnackbar("Attendance record deleted successfully.");
      setTimeout(() => setSnackbar(""), 1800);
    }
  };

  // Week calculation helpers
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
      monday,
      sunday
    };
  };

  const weekDates = getCurrentWeekDates(currentWeek);

  // Separate active and inactive employee records
  const separatedRecords = [...attendanceRecords]
    .filter((record) => {
      const matchesName = record.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || record.status === statusFilter;
      const matchesWeek = record.date >= weekDates.start && record.date <= weekDates.end;
      return matchesName && matchesStatus && matchesWeek;
    })
    .reduce((acc, record) => {
      const employee = employees.find(emp => String(emp.employeeId) === String(record.employeeId));
      const isActive = employee?.isActive !== false;
      
      if (isActive) {
        acc.active.push(record);
      } else {
        acc.inactive.push(record);
      }
      return acc;
    }, { active: [], inactive: [] });

  // Sort both arrays
  const sortRecords = (records) => records.sort((a, b) => {
    return sortOrder === "asc"
      ? new Date(a.date) - new Date(b.date)
      : new Date(b.date) - new Date(a.date);
  });

  const activeRecords = sortRecords(separatedRecords.active);
  const inactiveRecords = sortRecords(separatedRecords.inactive);
  
  // Combine for display: active first, then inactive
  const filteredAndSortedRecords = [...activeRecords, ...inactiveRecords];

  const formatWeekRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    if (startDate.getFullYear() === endDate.getFullYear()) {
      const startOptions = { month: 'short', day: 'numeric' };
      return `${startDate.toLocaleDateString('en-US', startOptions)} - ${endDate.toLocaleDateString('en-US', options)}`;
    } else {
      return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
    }
  };

  const handleExportCSV = () => {
    const header = ["ID", "Employee ID", "Name", "Date", "Status"];
    const rows = attendanceRecords.map((rec) => [
      rec.id,
      rec.employeeId,
      rec.name,
      rec.date,
      rec.status,
    ]);
    const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "attendance_records.csv");
  };

  // Status badge color
  const statusBadge = (status) => {
    let color = "bg-gray-200 text-gray-700";
    if (status === "Present") color = "bg-green-100 text-green-700";
    if (status === "Absent") color = "bg-red-100 text-red-700";
    if (status === "Leave") color = "bg-yellow-100 text-yellow-700";
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{status}</span>;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Attendance Records</h2>
      <div className="overflow-x-auto">
        {/* Week Navigation */}
        <div className="mb-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setCurrentWeek(currentWeek - 1)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              ← Previous Week
            </button>
            <span className="text-sm font-medium text-gray-600">
              {formatWeekRange(weekDates.start, weekDates.end)}
            </span>
            <button
              onClick={() => setCurrentWeek(currentWeek + 1)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Next Week →
            </button>
            {currentWeek !== 0 && (
              <button
                onClick={() => setCurrentWeek(0)}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Current Week
              </button>
            )}
          </div>
          <button
            onClick={() => navigate("/attendance/add")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Mark Attendance
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Export CSV
          </button>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border px-4 py-2 rounded"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-4 py-2 rounded"
          >
            <option value="All">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Leave">Leave</option>
          </select>

          <div className="flex gap-2 w-full max-w-xs">
            <input
              type="text"
              placeholder="Search by employee name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border px-4 py-2 rounded w-full"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-700 font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-4">Employee ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedRecords.length > 0 ? (
              filteredAndSortedRecords.map((record, idx) => {
                const employee = employees.find(emp => String(emp.employeeId) === String(record.employeeId));
                const isInactive = employee?.isActive === false;
                
                return (
                  <tr
                    key={record.id}
                    className={`border-t transition duration-150 ${
                      isInactive
                        ? "bg-gray-300 text-gray-600 opacity-75"
                        : idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50`}
                  >
                    <td className="p-4">{record.employeeId}</td>
                    <td className="p-4">
                      {record.name}
                      {isInactive && (
                        <span className="ml-2 px-2 py-1 bg-red-200 text-red-800 text-xs rounded font-semibold">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4">{record.date}</td>
                    <td className="p-4">{statusBadge(record.status)}</td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => navigate(`/attendance/edit/${record.id}`)}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 flex items-center gap-1"
                        title="Edit"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 flex items-center gap-1"
                        title="Delete"
                      >
                        <FaTrash /> Delete
                      </button>
                      <button
                        onClick={() => navigate(`/attendance/profile/${record.employeeId}`)}
                        className="bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 flex items-center gap-1"
                        title="View Profile"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No matching attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {snackbar && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-fadein">
            {snackbar}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
