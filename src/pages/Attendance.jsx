import { useState, useContext, useMemo } from "react";
import { AttendanceContext } from "../context/AttendanceContext";
import { EmployeeContext } from "../context/EmployeeContext";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";

const Attendance = () => {
  const { attendanceRecords = [] } = useContext(AttendanceContext);
  const { employees = [] } = useContext(EmployeeContext);
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentWeek, setCurrentWeek] = useState(0);

  const navigate = useNavigate();

  const getCurrentWeekDates = (weekOffset = 0) => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + (weekOffset * 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0],
    };
  };

  const weekDates = getCurrentWeekDates(currentWeek);
  const todayStr = new Date().toISOString().slice(0, 10);

  // Improvement: Create a Map for efficient employee status lookups.
  // This is much faster than using Array.find() inside a loop.
  const employeeStatusMap = useMemo(() => 
    new Map(employees.map(emp => [String(emp.employeeId), emp.isActive])),
    [employees]
  );

  const filteredAndSortedRecords = useMemo(() => {
    const recordsWithEmployeeStatus = attendanceRecords.map(record => {
      // Use the efficient Map for lookup. Default to inactive (false) if not found.
      const isActive = employeeStatusMap.get(String(record.employeeId)) ?? false;
      return { ...record, isInactive: !isActive };
    });

    const filtered = recordsWithEmployeeStatus.filter((record) => {
      const matchesName = record.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || record.status === statusFilter;
      const matchesWeek = record.date >= weekDates.start && record.date <= weekDates.end;
      const isPastOrToday = record.date <= todayStr;
      return matchesName && matchesStatus && matchesWeek && isPastOrToday;
    });

    return filtered.sort((a, b) => {
      if (a.isInactive !== b.isInactive) {
        return a.isInactive ? 1 : -1; // Inactive records go to the bottom
      }
      return sortOrder === "asc"
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date);
    });
  }, [attendanceRecords, searchTerm, statusFilter, sortOrder, weekDates.start, weekDates.end, todayStr, employeeStatusMap]);


  const formatWeekRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    if (startDate.getFullYear() === endDate.getFullYear()) {
      const startOptions = { month: 'short', day: 'numeric' };
      return `${startDate.toLocaleDateString('en-US', startOptions)} - ${endDate.toLocaleDateString('en-US', options)}`;
    }
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  const handleExportCSV = () => {
    const header = ["ID", "Employee ID", "Name", "Date", "Status", "Details"];
    const rows = filteredAndSortedRecords.map((rec) => [
      rec.id,
      rec.employeeId,
      rec.name,
      rec.date,
      rec.status,
      rec.isHalfDay ? "Half Day" : ""
    ]);
    const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "filtered_attendance_records.csv");
  };

  const statusBadge = (record) => {
    let color = "bg-gray-200 text-gray-700";
    let text = record.status;

    switch (record.status) {
      case "Present":
        if (record.isHalfDay) {
          color = "bg-yellow-100 text-yellow-700";
          text = "Half Day Present";
        } else {
          color = "bg-green-100 text-green-700";
        }
        break;
      case "Absent":
        color = "bg-red-100 text-red-700";
        break;
      case "Leave":
        color = "bg-yellow-100 text-yellow-700";
        break;
      case "Holiday":
        color = "bg-purple-100 text-purple-700";
        break;
      default:
        break;
    }
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{text}</span>;
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Attendance Records</h2>
      <div className="overflow-x-auto">
        {/* UI Code is unchanged */}
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
              disabled={currentWeek >= 0}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
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
            <option value="Holiday">Holiday</option>
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
              filteredAndSortedRecords.map((record) => (
                  <tr
                    key={record.id}
                    className={`border-t transition duration-150 ${
                      record.isInactive
                        ? "bg-gray-200 text-gray-500 opacity-80"
                        : "bg-white hover:bg-blue-50"
                    }`}
                  >
                    <td className="p-4">{record.employeeId}</td>
                    <td className="p-4">
                      {record.name}
                      {record.isInactive && (
                        <span className="ml-2 px-2 py-1 bg-red-200 text-red-800 text-xs rounded font-semibold">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4">{record.date}</td>
                    <td className="p-4">{statusBadge(record)}</td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => navigate(`/attendance/profile/${record.employeeId}`)}
                        className="bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 flex items-center gap-1"
                        title="View Profile"
                      >
                        Summary
                      </button>
                    </td>
                  </tr>
                )
              )
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No matching attendance records found for the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;