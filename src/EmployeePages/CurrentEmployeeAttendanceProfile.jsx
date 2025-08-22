// ...existing imports...
import React, { useContext, useMemo, useState } from "react";
import { CurrentEmployeeAttendanceContext } from "../EmployeeContext/CurrentEmployeeAttendanceContext";
import { CurrentEmployeeLeaveRequestContext } from "../EmployeeContext/CurrentEmployeeLeaveRequestContext";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function getMonthOptions(records) {
  const months = records.map((rec) => rec.date.slice(0, 7)); // "YYYY-MM"
  return Array.from(new Set(months)).sort();
}

function getMonthName(monthStr) {
  const [year, month] = monthStr.split("-");
  return `${new Date(year, month - 1).toLocaleString("default", {
    month: "long",
  })} ${year}`;
}

const CalendarCell = ({ day, record }) => {
  let bg = "bg-gray-100";
  let text = "text-gray-700";
  if (record?.status === "Present") {
    bg = "bg-green-100";
    text = "text-green-700";
  } else if (record?.status === "Absent") {
    bg = "bg-red-100";
    text = "text-red-700";
  } else if (record?.status === "Leave") {
    bg = "bg-yellow-100";
    text = "text-yellow-700";
  }
  return (
    <td className={`h-28 w-40 align-top ${bg} ${text} border rounded-lg text-base`}>
      <div className="font-bold">{day}</div>
      {record && (
        <div className="text-xs">
          {record.status}
          <br />
          {record.punchIn && <>In: {record.punchIn}<br /></>}
          {record.punchOut && <>Out: {record.punchOut}<br /></>}
        </div>
      )}
    </td>
  );
};

const CurrentEmployeeAttendanceProfile = () => {
  const { attendanceRecords, paidLeaves, leaveRemaining, lateLoginRequests, applyLateLogin } =
    useContext(CurrentEmployeeAttendanceContext);

  const {
    leaveRequests,
  } = useContext(CurrentEmployeeLeaveRequestContext);

  // Only for EMP101 (demo)
  const employeeId = "EMP101";
  const employeeRecords = attendanceRecords.filter((rec) => rec.employeeId === employeeId);

  // Monthly filter for attendance
  const monthOptions = getMonthOptions(employeeRecords);
  const [selectedMonth, setSelectedMonth] = useState(
    monthOptions[monthOptions.length - 1] || ""
  );

  // Approved leave days for selected month
  function getApprovedLeaveDaysForMonth(reqs, month, empId) {
    let leaveDates = new Set();
    reqs.forEach((req) => {
      if (req.employeeId !== empId) return;
      if (req.status !== "Approved") return;
      const from = new Date(req.from);
      const to = new Date(req.to);
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().slice(0, 10);
        if (dateStr.startsWith(month)) leaveDates.add(dateStr);
      }
    });
    return leaveDates;
  }
  const approvedLeaveDaysSet = getApprovedLeaveDaysForMonth(leaveRequests, selectedMonth, employeeId);

  // Build monthly attendance rows (override approved days to Leave)
  const monthlyRecords = useMemo(() => {
    return employeeRecords
      .filter((rec) => rec.date.startsWith(selectedMonth))
      .map((rec) => {
        if (approvedLeaveDaysSet.has(rec.date)) {
          return { ...rec, status: "Leave", punchIn: undefined, punchOut: undefined, workHours: 0, workedHours: 0 };
        }
        return rec;
      });
  }, [employeeRecords, selectedMonth, approvedLeaveDaysSet]);

  const presentCount = monthlyRecords.filter((r) => r.status === "Present").length;
  const absentCount = monthlyRecords.filter((r) => r.status === "Absent").length;
  const leaveCount = approvedLeaveDaysSet.size;

  // Leaves applied in selected month (not displayed; retained if you need)
  const leavesApplied = leaveRequests.filter(
    (req) =>
      req.employeeId === employeeId &&
      (req.from.startsWith(selectedMonth) || req.to.startsWith(selectedMonth))
  );

  // Work hour summary
  const totalWorkHours = monthlyRecords.reduce((sum, r) => sum + (r.workHours || 0), 0);
  const totalWorkedHours = monthlyRecords.reduce((sum, r) => sum + (r.workedHours || 0), 0);
  const totalIdleTime = monthlyRecords.reduce((sum, r) => sum + ((r.workHours || 0) - (r.workedHours || 0)), 0);

  // Chart data
  const chartData = {
    labels: ["Present", "Absent", "Leave"],
    datasets: [
      {
        label: "Monthly Attendance Summary",
        data: [presentCount, absentCount, leaveCount],
        backgroundColor: ["#22c55e", "#ef4444", "#facc15"],
      },
    ],
  };

  // Calendar view toggle
  const [calendarView, setCalendarView] = useState(false);

  // Calendar grid
  const daysInMonth = selectedMonth
    ? new Date(Number(selectedMonth.slice(0, 4)), Number(selectedMonth.slice(5, 7)), 0).getDate()
    : 0;
  const firstDayOfWeek = selectedMonth
    ? new Date(Number(selectedMonth.slice(0, 4)), Number(selectedMonth.slice(5, 7)) - 1, 1).getDay()
    : 0;

  // Build calendar rows
  const calendarRows = [];
  let day = 1 - firstDayOfWeek;
  while (day <= daysInMonth) {
    const row = [];
    for (let i = 0; i < 7; i++) {
      if (day > 0 && day <= daysInMonth) {
        const dateStr = `${selectedMonth}-${String(day).padStart(2, "0")}`;
        const record = monthlyRecords.find((r) => r.date === dateStr);
        row.push(<CalendarCell key={i} day={day} record={record} />);
      } else {
        row.push(<td key={i} className="h-20 w-32 bg-white"></td>);
      }
      day++;
    }
    calendarRows.push(<tr key={day}>{row}</tr>);
  }

  // ===================== PERMISSION HOURS (Late Permissions UI) =====================
  // Local UI state (moved from Leave Management)
  const [showLateForm, setShowLateForm] = useState(false);
  const [lateForm, setLateForm] = useState({ date: "", from: "", lateTill: "", reason: "" });
  const [lateError, setLateError] = useState("");
  const [lateSuccess, setLateSuccess] = useState("");

  // Filters (re-using monthOptions from attendance, and local status options)
  const [lateMonth, setLateMonth] = useState("");
  const [lateStatus, setLateStatus] = useState("");
  const statusOptions = ["All", "Pending", "Approved", "Rejected"];

  const filteredLateLogins = lateLoginRequests.filter((req) => {
    const matchesMonth = lateMonth ? req.date.startsWith(lateMonth) : true;
    const matchesStatus = lateStatus && lateStatus !== "All" ? req.status === lateStatus : true;
    return matchesMonth && matchesStatus;
  });

  const handleLateChange = (e) => {
    setLateForm({ ...lateForm, [e.target.name]: e.target.value });
    setLateError("");
    setLateSuccess("");
  };

  const handleLateSubmit = (e) => {
    e.preventDefault();
    const { date, from, lateTill, reason } = lateForm;
    if (!date || !from || !lateTill || !reason) {
      setLateError("All fields are required.");
      setLateSuccess("");
      return;
    }
    applyLateLogin({ date, from, lateTill, reason });
    setLateForm({ date: "", from: "", lateTill: "", reason: "" });
    setLateError("");
    setLateSuccess("Late login request submitted successfully!");
    setTimeout(() => setLateSuccess(""), 3000);
  };
  // =========================================================================

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Current Employee Attendance Profile</h1>

      {/* Month filter */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <label className="font-semibold">Select Month:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border px-4 py-2 rounded"
        >
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {getMonthName(m)}
            </option>
          ))}
        </select>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          onClick={() => setCalendarView((v) => !v)}
        >
          {calendarView ? "Table View" : "Calendar View"}
        </button>
      </div>

      {/* Bar graph */}
      <div className="mb-6 max-w-lg">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: "Monthly Attendance Summary" },
            },
            scales: {
              y: { beginAtZero: true, precision: 0 },
            },
          }}
        />
      </div>

      {/* Summary boxes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded shadow flex flex-col items-center">
          <span className="text-green-600 font-bold text-lg">Present</span>
          <span className="text-2xl font-bold">{presentCount}</span>
        </div>
        <div className="bg-red-50 p-4 rounded shadow flex flex-col items-center">
          <span className="text-red-600 font-bold text-lg">Absent</span>
          <span className="text-2xl font-bold">{absentCount}</span>
        </div>
        <div className="bg-yellow-50 p-4 rounded shadow flex flex-col items-center">
          <span className="text-yellow-600 font-bold text-lg">On Leave</span>
          <span className="text-2xl font-bold">{leaveCount}</span>
        </div>
        <div className="bg-blue-50 p-4 rounded shadow flex flex-col items-center">
          <span className="text-blue-600 font-bold text-lg">Leave Remaining</span>
          <span className="text-2xl font-bold">{leaveRemaining}</span>
        </div>
        <div className="bg-pink-50 p-4 rounded shadow flex flex-col items-center">
          <span className="text-pink-600 font-bold text-lg">Paid Leaves</span>
          <span className="text-2xl font-bold">{paidLeaves}</span>
        </div>
      </div>

      

      {/* ================= Permission Hours Section (moved here) ================= */}
      <div className="mb-10 mt-10">
        <div className="flex flex-wrap gap-6 items-center mb-6">
          <h2 className="text-3xl font-bold text-yellow-800 flex-1">Permission Hours</h2>
          <button
            className={`bg-blue-700 hover:bg-blue-900 text-white font-semibold px-6 py-2 rounded-lg shadow transition ${showLateForm ? 'bg-blue-900' : ''}`}
            onClick={() => setShowLateForm((v) => !v)}
          >
            {showLateForm ? "Cancel" : "Permission Hours"}
          </button>
        </div>

        {showLateForm && (
          <form
            onSubmit={handleLateSubmit}
            className="mb-8 bg-white rounded-lg shadow-md p-6 flex flex-col gap-4 border border-blue-100 max-w-xl"
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
                <label className="block mb-1 font-medium text-yellow-800">From (Time)</label>
                <input
                  type="time"
                  name="from"
                  value={lateForm.from}
                  onChange={handleLateChange}
                  className="w-full border border-yellow-300 rounded px-3 py-2 focus:outline-yellow-500"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium text-yellow-800">To (Time)</label>
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

        {/* Filters for late permissions */}
        <div className="flex flex-wrap gap-6 items-center mb-4">
          <div>
            <label className="mr-2 font-medium text-yellow-800">Filter by Month:</label>
            <select
              value={lateMonth}
              onChange={(e) => setLateMonth(e.target.value)}
              className="border border-yellow-300 rounded px-3 py-2 bg-white focus:outline-yellow-500"
            >
              <option value="">All</option>
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {getMonthName(month)}
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
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Late permissions table */}
        <table className="min-w-full bg-white rounded shadow border border-yellow-200">
          <thead className="bg-yellow-100">
            <tr>
              <th className="w-32 px-4 py-2 text-yellow-900">Date</th>
              <th className="w-32 px-4 py-2 text-yellow-900">From</th>
              <th className="w-32 px-4 py-2 text-yellow-900">To</th>
              <th className="w-48 px-4 py-2 text-yellow-900">Reason</th>
              <th className="w-32 px-4 py-2 text-yellow-900">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLateLogins.length > 0 ? (
              filteredLateLogins.map((req) => (
                <tr key={req.id} className="hover:bg-yellow-50 transition">
                  <td className="w-32 px-4 py-2">{req.date}</td>
                  <td className="w-32 px-4 py-2">{req.from}</td>
                  <td className="w-32 px-4 py-2">{req.lateTill || "-"}</td>
                  <td className="w-48 px-4 py-2">{req.reason}</td>
                  <td className="w-32 px-4 py-2">
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
                <td colSpan={5} className="px-4 py-2 text-center text-gray-400">
                  No late login requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* ================= End Permission Hours ================= */}    


      {/* Calendar view */}
      {/* Calendar/Table view */}
      {calendarView ? (
        <div className="overflow-x-auto mb-8">
          <table className="bg-white rounded-xl shadow min-w-max">
            <thead>
              <tr>
                <th className="p-4 text-center text-lg">Sun</th>
                <th className="p-4 text-center text-lg">Mon</th>
                <th className="p-4 text-center text-lg">Tue</th>
                <th className="p-4 text-center text-lg">Wed</th>
                <th className="p-4 text-center text-lg">Thu</th>
                <th className="p-4 text-center text-lg">Fri</th>
                <th className="p-4 text-center text-lg">Sat</th>
              </tr>
            </thead>
            <tbody>{calendarRows}</tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-xl shadow">
            <thead>
              <tr>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Punch In</th>
                <th className="border px-4 py-2">Punch Out</th>
                <th className="border px-4 py-2">Work Hours</th>
                <th className="border px-4 py-2">Worked Hours</th>
                <th className="border px-4 py-2">Idle Time</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRecords.length > 0 ? (
                monthlyRecords.map((record) => (
                  <tr
                    key={record.id}
                    className={
                      record.status === "Leave"
                        ? "bg-yellow-100"
                        : record.status === "Absent"
                        ? "bg-red-100"
                        : ""
                    }
                  >
                    <td className="border px-4 py-2">{record.date}</td>
                    <td className="border px-4 py-2">{record.status}</td>
                    <td className="border px-4 py-2">{record.punchIn}</td>
                    <td className="border px-4 py-2">{record.punchOut}</td>
                    <td className="border px-4 py-2">{record.workHours}</td>
                    <td className="border px-4 py-2">{record.workedHours}</td>
                    <td className="border px-4 py-2">
                      {(record.workHours - record.workedHours).toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="border px-4 py-2 text-center text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CurrentEmployeeAttendanceProfile;
