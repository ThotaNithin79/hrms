import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AttendanceContext } from "../context/AttendanceContext";
import { LeaveRequestContext } from "../context/LeaveRequestContext";
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

const EmployeeAttendanceProfile = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { attendanceRecords } = useContext(AttendanceContext);
  const { leaveRequests } = useContext(LeaveRequestContext) || { leaveRequests: [] };

  // Month filter state
  const [selectedMonth, setSelectedMonth] = React.useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7); // 'YYYY-MM'
  });

  // Get all months available for this employee
  const availableMonths = Array.from(
    new Set(
      attendanceRecords
        .filter((rec) => String(rec.employeeId) === String(employeeId))
        .map((rec) => rec.date.slice(0, 7))
    )
  ).sort((a, b) => b.localeCompare(a));

  // Filter records for selected month, sorted by latest first
  const records = attendanceRecords
    .filter((rec) => String(rec.employeeId) === String(employeeId) && rec.date.startsWith(selectedMonth))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Get employee name
  const employeeName = records.length > 0 ? records[0].name : employeeId;

  // Attendance summary
  const presentDays = records.filter((r) => r.status === "Present").length;
  const absentDays = records.filter((r) => r.status === "Absent").length;
  const leaveDays = records.filter((r) => r.status === "Leave").length;

  // Work hour stats
  const totalWorkHours = records.reduce((sum, r) => sum + (r.workHours || 0), 0);
  const totalWorkedHours = records.reduce((sum, r) => sum + (r.workedHours || 0), 0);
  const totalIdleTime = records.reduce((sum, r) => sum + (r.idleTime || 0), 0);

  // Leave summary (if leaveRequests available)
  const employeeLeaves = leaveRequests.filter((l) => l.employeeId === employeeId && l.date.startsWith(selectedMonth));
  const leavesApplied = employeeLeaves.length;
  const leavesApproved = employeeLeaves.filter((l) => l.status === "Approved").length;
  const leavesRejected = employeeLeaves.filter((l) => l.status === "Rejected").length;
  const leavesPending = employeeLeaves.filter((l) => l.status === "Pending").length;

  // Chart data for monthly attendance summary
  const attendanceChartData = {
    labels: ["Present", "Absent", "Leave"],
    datasets: [
      {
        label: "Days",
        data: [presentDays, absentDays, leaveDays],
        backgroundColor: [
          "#34d399", // green
          "#f87171", // red
          "#fbbf24", // yellow
        ],
        borderRadius: 8,
      },
    ],
  };

  const attendanceChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Monthly Attendance Summary",
        font: { size: 18 },
        color: "#2563eb",
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${ctx.parsed.y} days`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#2563eb", font: { weight: "bold" } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#e0e7ff" },
        ticks: { stepSize: 1, color: "#2563eb" },
      },
    },
  };
  // ...existing code...

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center py-0">
      <div className="w-full h-full">
        <div className="bg-white rounded-none shadow-none border-none p-0 w-full h-full">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-8 px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition shadow flex items-center gap-2"
          >
            <span className="text-xl">&#8592;</span> Go Back
          </button>
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold text-blue-700 mb-2 border border-gray-300">
              {employeeName[0]}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1 tracking-tight">{employeeName}</h2>
            <p className="text-gray-500 font-mono">ID: {employeeId}</p>
          </div>
          {/* Month Filter Dropdown */}
          <div className="mb-8 flex items-center gap-4">
            <label htmlFor="month-select" className="font-semibold text-gray-700">Select Month:</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-700 font-semibold focus:outline-none focus:ring focus:ring-blue-200"
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>
                  {new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Monthly Attendance Summary</h3>
            <div className="bg-gray-50 rounded-xl shadow p-4">
              <Bar data={attendanceChartData} options={attendanceChartOptions} height={220} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow flex flex-col items-center">
              <span className="text-2xl mb-1 text-green-600">●</span>
              <h3 className="font-semibold mb-1 text-gray-700">Present</h3>
              <span className="text-2xl font-bold text-green-700">{presentDays}</span>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow flex flex-col items-center">
              <span className="text-2xl mb-1 text-red-600">●</span>
              <h3 className="font-semibold mb-1 text-gray-700">Absent</h3>
              <span className="text-2xl font-bold text-red-700">{absentDays}</span>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow flex flex-col items-center">
              <span className="text-2xl mb-1 text-yellow-500">●</span>
              <h3 className="font-semibold mb-1 text-gray-700">On Leave</h3>
              <span className="text-2xl font-bold text-yellow-700">{leaveDays}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl shadow flex flex-col items-center">
              <h3 className="font-semibold mb-1 text-gray-700">Leaves Applied</h3>
              <span className="text-xl font-bold text-blue-700">{leavesApplied}</span>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Approved: {leavesApproved}</span>
                <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">Rejected: {leavesRejected}</span>
                <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">Pending: {leavesPending}</span>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl shadow flex flex-col items-center col-span-2">
              <h3 className="font-semibold mb-1 text-gray-700">Work Hours Summary</h3>
              <div className="flex gap-8">
                <div className="flex flex-col items-center">
                  <p className="text-gray-600">Total Work Hours</p>
                  <span className="font-bold text-blue-700 text-lg">{totalWorkHours.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-gray-600">Total Worked Hours</p>
                  <span className="font-bold text-blue-700 text-lg">{totalWorkedHours.toFixed(2)}</span>
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-gray-600">Total Idle Time</p>
                  <span className="font-bold text-blue-700 text-lg">{totalIdleTime.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          <h3 className="font-semibold mb-4 text-gray-700 text-lg">Daily Attendance Details</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow border border-gray-200">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gray-100 text-left">
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Punch In</th>
                  <th className="p-3">Punch Out</th>
                  <th className="p-3">Work Hours</th>
                  <th className="p-3">Worked Hours</th>
                  <th className="p-3">Idle Time</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec, idx) => (
                  <tr
                    key={rec.date}
                    className={`border-t transition-colors duration-150 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`}
                  >
                    <td className="p-3 font-mono text-gray-700">{rec.date}</td>
                    <td className="p-3">
                      {rec.status === "Present" && <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Present</span>}
                      {rec.status === "Absent" && <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">Absent</span>}
                      {rec.status === "Leave" && <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">Leave</span>}
                    </td>
                    <td className="p-3">{rec.status === "Present" && rec.punchIn ? rec.punchIn : ""}</td>
                    <td className="p-3">{rec.status === "Present" && rec.punchOut ? rec.punchOut : ""}</td>
                    <td className="p-3">{rec.status === "Present" && typeof rec.workHours === "number" ? rec.workHours.toFixed(2) : ""}</td>
                    <td className="p-3">{rec.status === "Present" && typeof rec.workedHours === "number" ? rec.workedHours.toFixed(2) : ""}</td>
                    <td className="p-3">{rec.status === "Present" && typeof rec.idleTime === "number" ? rec.idleTime.toFixed(2) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceProfile;
