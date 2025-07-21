import React, { useContext, useState } from "react";
import { LeaveRequestContext } from "../context/LeaveRequestContext";
import { useLocation } from "react-router-dom";
import { FaCheck, FaTimes } from "react-icons/fa";

const LeaveManagement = () => {
  const { leaveRequests, setLeaveRequests } = useContext(LeaveRequestContext);
  const location = useLocation(); 
  const initialStatus = location.state?.defaultStatus || "All";
  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbar, setSnackbar] = useState("");
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = current week

  // Status badge color
  const statusBadge = (status) => {
    let color = "bg-gray-200 text-gray-700";
    if (status === "Pending") color = "bg-yellow-100 text-yellow-700";
    if (status === "Approved") color = "bg-green-100 text-green-700";
    if (status === "Rejected") color = "bg-red-100 text-red-700";
    return <span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>{status}</span>;
  };

  // Snackbar
  const showSnackbar = (msg) => {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(""), 1800);
  };

  // Approve/Reject
  const updateStatus = (id, status) => {
    const updated = leaveRequests.map((req) =>
      req.id === id ? { ...req, status } : req
    );
    setLeaveRequests(updated);
    showSnackbar(`Leave request ${status.toLowerCase()} successfully.`);
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

  // Filter leave requests by week, status, and search
  const filteredRequests = leaveRequests.filter((req) => {
    const matchesStatus =
      filterStatus === "All" ? true : req.status === filterStatus;
    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    // Check if leave falls within the week
    const fromDate = req.from;
    const toDate = req.to;
    const inWeek =
      (fromDate >= weekDates.start && fromDate <= weekDates.end) ||
      (toDate >= weekDates.start && toDate <= weekDates.end);
    return matchesStatus && matchesSearch && inWeek;
  });

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

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Leave Requests</h2>

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
        <div className="flex gap-2">
          {["All", "Pending", "Approved", "Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded font-semibold transition ${
                filterStatus === status ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-blue-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by Name or Employee ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-4 py-2 rounded w-full max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-4">ID</th>
              <th className="p-4">Employee ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">From</th>
              <th className="p-4">To</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((req, idx) => (
              <tr
                key={req.id}
                className={`border-t transition duration-150 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50`}
              >
                <td className="p-4 font-mono font-semibold">{req.id}</td>
                <td className="p-4">{req.employeeId}</td>
                <td className="p-4">{req.name}</td>
                <td className="p-4">{req.from}</td>
                <td className="p-4">{req.to}</td>
                <td className="p-4">{req.reason}</td>
                <td className="p-4 font-semibold">{statusBadge(req.status)}</td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => updateStatus(req.id, "Approved")}
                    disabled={req.status !== "Pending"}
                    className="bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 flex items-center gap-1 disabled:opacity-50"
                    title="Approve"
                  >
                    <FaCheck /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(req.id, "Rejected")}
                    disabled={req.status !== "Pending"}
                    className="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 flex items-center gap-1 disabled:opacity-50"
                    title="Reject"
                  >
                    <FaTimes /> Reject
                  </button>
                </td>
              </tr>
            ))}
            {filteredRequests.length === 0 && (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No leave requests found.
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

export default LeaveManagement;
