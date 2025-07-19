import React, { useContext, useState } from "react";
import { LeaveRequestContext } from "../context/LeaveRequestContext";
import { useLocation } from "react-router-dom";

const LeaveManagement = () => {
  const { leaveRequests, setLeaveRequests } = useContext(LeaveRequestContext);
  const location = useLocation(); 
  const initialStatus = location.state?.defaultStatus || "All";
  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");
  

  // ✅ This is the function to use in buttons
  const updateStatus = (id, status) => {
    const updated = leaveRequests.map((req) =>
      req.id === id ? { ...req, status } : req
    );
    setLeaveRequests(updated);
    alert(`Leave request ${status.toLowerCase()} successfully.`);
  };

  // ✅ Use filtered requests instead of original list
  const filteredRequests = leaveRequests.filter((req) => {
    const matchesStatus =
      filterStatus === "All" ? true : req.status === filterStatus;

    const matchesSearch =
      req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.employeeId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Leave Requests</h2>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        {["All", "Pending", "Approved", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded ${
              filterStatus === status ? "bg-blue-600 text-white" : "bg-gray-100"
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
        className="border px-4 py-2 rounded mb-4 w-full max-w-sm"
      />

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
            {filteredRequests.map((req) => (
              <tr key={req.id} className="border-t">
                <td className="p-4">{req.id}</td>
                <td className="p-4">{req.employeeId}</td>
                <td className="p-4">{req.name}</td>
                <td className="p-4">{req.from}</td>
                <td className="p-4">{req.to}</td>
                <td className="p-4">{req.reason}</td>
                <td className="p-4 font-semibold">{req.status}</td>
                <td className="p-4 space-x-2">
                  <button
                    onClick={() => updateStatus(req.id, "Approved")}
                    disabled={req.status !== "Pending"}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(req.id, "Rejected")}
                    disabled={req.status !== "Pending"}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    Reject
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
      </div>
    </div>
  );
};

export default LeaveManagement;
