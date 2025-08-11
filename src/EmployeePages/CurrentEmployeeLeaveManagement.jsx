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
    lateLoginRequests = [],
    applyLateLogin,
  } = useContext(CurrentEmployeeLeaveRequestContext);

  // Remove local state for dynamic late logins; use context instead

  // Leave form state
  const [form, setForm] = useState({ from: "", to: "", reason: "" });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Late login form state
  const [lateForm, setLateForm] = useState({ date: "", lateTill: "", reason: "" });
  const [showLateForm, setShowLateForm] = useState(false);
  const [lateError, setLateError] = useState("");
  const [lateSuccess, setLateSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.reason) {
      setError("All fields are required.");
      return;
    }
    if (form.from > form.to) {
      setError("End date must be after start date.");
      return;
    }
    applyLeave(form);
    setForm({ from: "", to: "", reason: "" });
    setShowForm(false);
    setSuccess("Leave request submitted successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleLateChange = (e) => {
    setLateForm({ ...lateForm, [e.target.name]: e.target.value });
    setLateError("");
    setLateSuccess("");
  };

  const handleLateSubmit = (e) => {
    e.preventDefault();
    if (!lateForm.date || !lateForm.lateTill || !lateForm.reason) {
      setLateError("All fields are required.");
      return;
    }
    applyLateLogin(lateForm);
    setLateForm({ date: "", lateTill: "", reason: "" });
    setShowLateForm(false);
    setLateSuccess("Late login request submitted successfully!");
    setTimeout(() => setLateSuccess(""), 3000);
  };

  // Filters for late logins
  const [lateMonth, setLateMonth] = useState(
    monthOptions.length > 0 ? monthOptions[monthOptions.length - 1] : ""
  );
  const [lateStatus, setLateStatus] = useState("All");
  // Use context lateLoginRequests, filter by month and status
  const filteredLateLogins = lateLoginRequests.filter((req) => {
    const matchMonth = lateMonth ? req.date.startsWith(lateMonth) : true;
    const matchStatus = lateStatus === "All" ? true : req.status === lateStatus;
    return matchMonth && matchStatus;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen rounded-xl shadow-lg">
      {/* Leave Requests Section */}
      <div className="mb-10">
        <div className="flex flex-wrap gap-6 items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-900 flex-1">Leave Requests</h2>
          <button
            className={`bg-blue-700 hover:bg-blue-900 text-white font-semibold px-6 py-2 rounded-lg shadow transition ${showForm ? 'bg-blue-900' : ''}`}
            onClick={() => { setShowForm((v) => !v); setShowLateForm(false); }}
          >
            {showForm ? "Cancel" : "Apply Leave"}
          </button>
        </div>
        <div className="flex flex-wrap gap-6 items-center mb-4">
          <div>
            <label className="mr-2 font-medium text-blue-800">Filter by Month:</label>
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
                    No leave requests found for selected filters.
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
      </div>

      {/* Late Logins Section */}
      <div className="mb-10">
        <div className="flex flex-wrap gap-6 items-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-800 flex-1">Late Logins</h2>
          <button
            className={`bg-blue-700 hover:bg-blue-900 text-white font-semibold px-6 py-2 rounded-lg shadow transition ${showLateForm ? 'bg-blue-900' : ''}`}
            onClick={() => { setShowLateForm((v) => !v); setShowForm(false); }}
          >
            {showLateForm ? "Cancel" : "Apply Late Login"}
          </button>
        </div>
        <div className="flex flex-wrap gap-6 items-center mb-4">
          <div>
            <label className="mr-2 font-medium text-yellow-800">Filter by Month:</label>
            <select
              value={lateMonth}
              onChange={(e) => setLateMonth(e.target.value)}
              className="border border-yellow-300 rounded px-3 py-2 bg-white focus:outline-yellow-500"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {formatMonth(month)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mr-2 font-medium text-yellow-800">Status:</label>
            <select
              value={lateStatus}
              onChange={(e) => setLateStatus(e.target.value)}
              className="border border-yellow-300 rounded px-3 py-2 bg-white focus:outline-yellow-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
        <table className="min-w-full bg-white rounded shadow border border-yellow-200">
          <thead className="bg-yellow-100">
            <tr>
              <th className="px-4 py-2 text-yellow-900">Date</th>
              <th className="px-4 py-2 text-yellow-900">Late Till</th>
              <th className="px-4 py-2 text-yellow-900">Reason</th>
              <th className="px-4 py-2 text-yellow-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLateLogins.length > 0 ? (
              filteredLateLogins.map((req) => (
                <tr key={req.id} className="hover:bg-yellow-50 transition">
                  <td className="px-4 py-2">{req.date}</td>
                  <td className="px-4 py-2">{req.lateTill}</td>
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
                  No late login requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Show form only when showLateForm is true */}
        {showLateForm && (
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!lateForm.date || !lateForm.lateTill || !lateForm.reason) {
                setLateError("All fields are required.");
                setLateSuccess("");
                return;
              }
              applyLateLogin(lateForm);
              setLateForm({ date: "", lateTill: "", reason: "" });
              setLateError("");
              setLateSuccess("Late login request submitted successfully!");
              setTimeout(() => setLateSuccess(""), 3000);
            }}
            className="mt-8 bg-white rounded-lg shadow-md p-6 flex flex-col gap-4 border border-blue-100 max-w-xl"
          >
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-1 font-medium text-yellow-800">Date of Late Login</label>
                <input
                  type="date"
                  name="date"
                  value={lateForm.date}
                  onChange={handleLateChange}
                  className="w-full border border-yellow-300 rounded px-3 py-2 focus:outline-yellow-500"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium text-yellow-800">Late Till (Time)</label>
                <input
                  type="time"
                  name="lateTill"
                  value={lateForm.lateTill}
                  onChange={handleLateChange}
                  className="w-full border border-yellow-300 rounded px-3 py-2 focus:outline-yellow-500"
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-medium text-yellow-800">Reason</label>
              <input
                type="text"
                name="reason"
                value={lateForm.reason}
                onChange={handleLateChange}
                className="w-full border border-yellow-300 rounded px-3 py-2 focus:outline-yellow-500"
                placeholder="Enter reason for late login"
              />
            </div>
            {lateError && <div className="text-red-600 font-semibold">{lateError}</div>}
            {lateSuccess && <div className="text-green-600 font-semibold">{lateSuccess}</div>}
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-900 text-white font-semibold px-6 py-2 rounded-lg shadow transition mt-2"
            >
              Submit Late Login Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CurrentEmployeeLeaveManagement;
