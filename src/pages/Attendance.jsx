import { useState, useContext } from "react";
import { AttendanceContext } from "../context/AttendanceContext";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";

const Attendance = () => {
  const { attendanceRecords, deleteAttendance } = useContext(AttendanceContext);
  const [sortOrder, setSortOrder] = useState("desc"); // or "asc"
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this record?"
    );
    if (confirmed) {
      deleteAttendance(id);
    }
  };

  const filteredAndSortedRecords = [...attendanceRecords]
    .filter((record) =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      return sortOrder === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    });

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

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Attendance Records</h2>
      <div className="overflow-x-auto">
        <div className="mb-4 flex gap-4 items-center">
          <button
            onClick={() => navigate("/attendance/add")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Mark Attendance
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-4 ml-2"
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

          <input
            type="text"
            placeholder="Search by employee name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-4 py-2 rounded"
          />
        </div>

        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-4">ID</th>
              <th className="p-4">Employee ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedRecords.map((record) => (
              <tr key={record.id} className="border-t">
                <td className="p-4">{record.id}</td>
                <td className="p-4">{record.employeeId}</td>
                <td className="p-4">{record.name}</td>
                <td className="p-4">{record.date}</td>
                <td className="p-4">{record.status}</td>
                <td className="p-4 flex gap-3">
                  <button
                    onClick={() => navigate(`/attendance/edit/${record.id}`)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance;
