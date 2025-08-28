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
  const [form, setForm] = useState({ from: "", to: "", reason: "",halfDay: "" });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const REASON_LIMIT = 50;


  const handleChange = (e) => {
  const { name, value } = e.target;
  setForm((prev) => ({
    ...prev,
    [name]: name === "reason" ? value.slice(0, REASON_LIMIT) : value,
  }));
  setError("");
  setSuccess("");
};


const handleSubmit = async (e) => {
  e.preventDefault();
  const { from, to, reason, halfDay } = form;

  if (!from || !to || !reason) {
    setError("All fields are required");
    return;
  }

  try {
    await applyLeave({
      from,
      to,
      reason,
      halfDay,
      leaveType: from === to && halfDay ? halfDay : "Full Day", // default
    });
    setSuccess("Leave request submitted successfully!");
    setForm({ from: "", to: "", reason: "", halfDay: "" });
    setShowForm(false);
  } catch (err) {
    setError("Failed to submit leave request");
  }
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


      {/* Apply Leave Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-white rounded-lg shadow-md p-6 flex flex-col gap-4 border border-blue-100 max-w-xl"
        >
          <div className="flex gap-4 items-end">
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

  {/* Half Day Option only if same date */}
  {form.from && form.to && form.from === form.to && (
    <div className="flex-1">
      <label className="block mb-1 font-medium text-blue-800">Half Day</label>
      <select
        name="halfDay"
        value={form.halfDay}
        onChange={handleChange}
        className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-blue-500"
      >
        <option value="">-- Select --</option>
        <option value="Morning Half">Morning</option>
        <option value="Afternoon Half">Afternoon</option>
      </select>
    </div>
  )}
</div>

          <div>
  <label className="block mb-1 font-medium text-blue-800">Reason</label>
  <input
    type="text"
    name="reason"
    value={form.reason}
    onChange={handleChange}
    maxLength={REASON_LIMIT}
    className="w-full border border-blue-300 rounded px-3 py-2 focus:outline-blue-500"
    placeholder="Enter reason for leave"
  />
  <p>{form.reason.length}/{REASON_LIMIT}</p>
  <div
    className={`mt-1 text-xs ${
      form.reason.length >= REASON_LIMIT ? "text-red-600" : "text-gray-500"
    }`}
  >
    {form.reason.length}/{REASON_LIMIT}
  </div>
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

      {/* Leave Requests Table */}
      {/* Leave Requests Table */}
<div className="mb-10 overflow-x-auto">
  <table className="min-w-full table-fixed bg-white rounded shadow border border-blue-100">
    <thead className="bg-blue-100">
      <tr>
        <th className="px-4 py-2 text-left text-blue-900 w-[14%]">From Date</th>
        <th className="px-4 py-2 text-left text-blue-900 w-[14%]">To Date</th>
        <th className="px-4 py-2 text-left text-blue-900 w-[14%]">Leave Day Type</th>
        <th className="px-4 py-2 text-left text-blue-900 w-[20%]">Reason</th>
        <th className="px-4 py-2 text-left text-blue-900 w-[14%]">Approved Date</th>
        <th className="px-4 py-2 text-left text-blue-900 w-[14%]">Applied Date</th>
        <th className="px-4 py-2 text-left text-blue-900 w-[10%]">Status</th>
        <th className="px-4 py-2 text-left text-blue-900 w-[10%]">Leave Category</th>
      </tr>
    </thead>
    <tbody>
      {filteredRequests.length > 0 ? (
        filteredRequests.map((req) => (
          <tr key={req.id} className="hover:bg-blue-50 transition">
            <td className="px-4 py-2 text-left">{req.from}</td>
            <td className="px-4 py-2 text-left">{req.to}</td>
            {/* ✅ Correct Leave Category */}
            <td className="px-4 py-2 text-left">{req.leaveType || "-"}</td>
            <td className="px-4 py-2 text-left">{req.reason}</td>
            <td className="px-4 py-2 text-left">{req.responseDate || "-"}</td>
            <td className="px-4 py-2 text-left">{req.date}</td>
            <td className="px-4 py-2 text-left">
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
            {/* ✅ Correct Paid/Unpaid */}
<td className="px-4 py-2 text-left">
  {req.leavecategory ? req.leavecategory : "-"}
</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={8} className="px-4 py-2 text-center text-gray-400">
            No leave requests found.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>





      

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
