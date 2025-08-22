import React, { useContext, useState } from "react";
import { CurrentEmployeeLeaveRequestContext } from "../EmployeeContext/CurrentEmployeeLeaveRequestContext";

const formatMonth = (monthStr) => {
  const [year, month] = monthStr.split("-");
  return `${new Date(year, month - 1).toLocaleString("default", {
    month: "long",
  })} ${year}`;
};

const CurrentEmployeeLeaveManagement = () => {
  const {
    monthOptions = [],
    selectedMonth,
    setSelectedMonth,
    statusOptions = [],
    selectedStatus,
    setSelectedStatus,
    filteredRequests,
    applyLeave,
    sandwichLeaves = [],
  } = useContext(CurrentEmployeeLeaveRequestContext);

  // Leave form state
  const [form, setForm] = useState({ from: "", to: "", reason: "" });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.reason) {
      setError("All fields are required.");
      setSuccess("");
      return;
    }
    applyLeave(form);
    setForm({ from: "", to: "", reason: "" });
    setError("");
    setSuccess("Leave request submitted successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <>
      {/* Header & New Leave button */}
      <div className="flex items-center mb-[25px]">
        <h2 className="text-3xl font-bold text-blue-800 flex-1">Leave Request</h2>
        <button
          className={`ml-4 bg-blue-700 hover:bg-blue-900 text-white font-semibold px-6 py-2 rounded-lg shadow transition ${showForm ? 'bg-blue-900' : ''}`}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancel" : "Leave Request"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div>
          <label className="mr-2 font-medium text-blue-800">Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-blue-300 rounded px-3 py-2 bg-white focus:outline-blue-500"
          >
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {formatMonth(month)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 font-medium text-blue-800">Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-blue-300 rounded px-3 py-2 bg-white focus:outline-blue-500"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="mb-10">
        <table className="min-w-full bg-white rounded shadow border border-blue-100">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-4 py-2 text-blue-900">From</th>
              <th className="px-4 py-2 text-blue-900">To</th>
              <th className="px-4 py-2 text-blue-900">Reason</th>
              <th className="px-4 py-2 text-blue-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-blue-50 transition">
                  <td className="px-4 py-2">{req.from}</td>
                  <td className="px-4 py-2">{req.to}</td>
                  <td className="px-4 py-2">{req.reason}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        req.status === "Pending"
                          ? "bg-yellow-200 text-yellow-800"
                          : req.status === "Approved"
                          ? "bg-green-200 text-green-800"
                          : req.status === "Rejected"
                          ? "bg-red-200 text-red-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-2 text-center text-gray-400">
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Apply Leave Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-white rounded-lg shadow-md p-6 flex flex-col gap-4 border border-blue-100 max-w-xl"
        >
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium text-blue-800">From Date</label>
              <input
                type="date"
                name="from"
                value={form.from}
                onChange={handleChange}
                className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-medium text-blue-800">To Date</label>
              <input
                type="date"
                name="to"
                value={form.to}
                onChange={handleChange}
                className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium text-blue-800">Reason</label>
            <input
              type="text"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-blue-500"
              placeholder="Enter reason for leave"
            />
          </div>
          {error && <div className="text-red-600 font-semibold">{error}</div>}
          {success && <div className="text-green-600 font-semibold">{success}</div>}
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-900 text-white font-semibold px-6 py-2 rounded-lg shadow transition mt-2"
          >
            Submit Request
          </button>
        </form>
      )}

      {/* Sandwich Leaves Section */}
      <div className="mt-10 p-6 bg-white rounded-lg shadow border border-purple-100">
        <h2 className="text-2xl font-bold text-purple-800 mb-4">Sandwich Leaves</h2>
        {Array.isArray(sandwichLeaves) && sandwichLeaves.length > 0 ? (
          <ul className="list-disc pl-6 space-y-2">
            {sandwichLeaves.map((item, index) => (
              <li key={index} className="text-gray-700">
                <span className="font-semibold">{item.date}</span> is counted as a sandwich leave
                between your leave from <span className="font-semibold">{item.from}</span> to{" "}
                <span className="font-semibold">{item.to}</span>.
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No sandwich leaves this month.</p>
        )}
      </div>
    </>
  );
};

export default CurrentEmployeeLeaveManagement;
