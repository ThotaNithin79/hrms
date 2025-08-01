import React, { useContext, useState } from "react";
import { CurrentEmployeeContext } from "../EmployeeContext/CurrentEmployeeContext";
import { CurrentEmployeeAttendanceContext } from "../EmployeeContext/CurrentEmployeeAttendanceContext";
import { CurrentEmployeeLeaveRequestContext } from "../EmployeeContext/CurrentEmployeeLeaveRequestContext";
import { NoticeContext } from "../context/NoticeContext";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaRegClock, FaUserCircle, FaBell, FaCalendarAlt, FaChartPie } from "react-icons/fa";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const SCHEDULE_IN = "09:30";
const SCHEDULE_OUT = "18:30";
const WORK_HOURS = 9;

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(time) {
  if (!time) return "--";
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${ampm}`;
}

function calculateIdleTime(punchIn, punchOut) {
  let idle = 0;
  if (punchIn) {
    const [h1, m1] = punchIn.split(":").map(Number);
    const [h2, m2] = SCHEDULE_IN.split(":").map(Number);
    const punchInMinutes = h1 * 60 + m1;
    const scheduleInMinutes = h2 * 60 + m2;
    if (punchInMinutes > scheduleInMinutes) {
      idle += (punchInMinutes - scheduleInMinutes) / 60;
    }
  }
  if (punchOut) {
    const [h1, m1] = punchOut.split(":").map(Number);
    const [h2, m2] = SCHEDULE_OUT.split(":").map(Number);
    const punchOutMinutes = h1 * 60 + m1;
    const scheduleOutMinutes = h2 * 60 + m2;
    if (punchOutMinutes < scheduleOutMinutes) {
      idle += (scheduleOutMinutes - punchOutMinutes) / 60;
    }
  }
  return idle;
}

const EmployeeDashboard = () => {
  const { currentEmployee } = useContext(CurrentEmployeeContext);
  const { attendanceRecords } = useContext(CurrentEmployeeAttendanceContext);
  const { leaveRequests } = useContext(CurrentEmployeeLeaveRequestContext);
  const { notices } = useContext(NoticeContext);

  // Attendance Tracker State
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState("");
  const [punchOutTime, setPunchOutTime] = useState("");
  const [trackerIdle, setTrackerIdle] = useState(0);

  const todayStr = getTodayStr();
  const empId = currentEmployee.job.employeeId;

  // Get today's attendance record (if any)
  const todayAttendance = attendanceRecords.find(
    (rec) => rec.employeeId === empId && rec.date === todayStr
  );

  // Punch In Handler
  const handlePunchIn = () => {
    if (!punchedIn) {
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 5);
      setPunchInTime(timeStr);
      setPunchedIn(true);
    }
  };

  // Punch Out Handler
  const handlePunchOut = () => {
    if (punchedIn && !punchOutTime) {
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 5);
      setPunchOutTime(timeStr);
      setTrackerIdle(calculateIdleTime(punchInTime, timeStr));
    }
  };

  // Employee Basic Details
  const { personal, contact, job } = currentEmployee;

  // Noticeboard (show 3 most recent)
  const recentNotices = notices.slice(0, 3);

  // Leave Summary (Bar Chart)
  const leaveMonth = todayStr.slice(0, 7);
  const leavesThisMonth = leaveRequests.filter(
    (req) => req.employeeId === empId && req.from.startsWith(leaveMonth)
  );
  const leaveStatusCounts = {
    Approved: leavesThisMonth.filter((l) => l.status === "Approved").length,
    Pending: leavesThisMonth.filter((l) => l.status === "Pending").length,
    Rejected: leavesThisMonth.filter((l) => l.status === "Rejected").length,
  };
  const leaveBarData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      {
        label: "Leaves",
        data: [
          leaveStatusCounts.Approved,
          leaveStatusCounts.Pending,
          leaveStatusCounts.Rejected,
        ],
        backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
        borderRadius: 6,
        barPercentage: 0.5,
      },
    ],
  };

  // Work Hours Summary (Pie Chart)
  const thisMonthAttendance = attendanceRecords.filter(
    (rec) =>
      rec.employeeId === empId && rec.date.startsWith(leaveMonth)
  );
  const totalWorkHours = thisMonthAttendance.reduce((sum, r) => sum + (r.workHours || 0), 0);
  const totalWorkedHours = thisMonthAttendance.reduce((sum, r) => sum + (r.workedHours || 0), 0);
  const totalIdleTime = thisMonthAttendance.reduce((sum, r) => sum + (r.idleTime || 0), 0);

  const workPieData = {
    labels: ["Worked Hours", "Idle Time"],
    datasets: [
      {
        data: [totalWorkedHours, totalIdleTime],
        backgroundColor: ["#3b82f6", "#f87171"],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Attendance Tracker */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center mb-4 gap-2">
          <FaRegClock className="text-blue-600 text-xl" />
          <h2 className="text-xl font-bold tracking-tight">Attendance Tracker</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="px-4 py-2 font-semibold">Date</th>
                <th className="px-4 py-2 font-semibold">Punch In</th>
                <th className="px-4 py-2 font-semibold">Punch Out</th>
                <th className="px-4 py-2 font-semibold">Working Hours</th>
                <th className="px-4 py-2 font-semibold">Idle Time</th>
                <th className="px-4 py-2 font-semibold">Status</th>
                <th className="px-4 py-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-center">
                <td className="border px-4 py-2">{todayStr}</td>
                <td className="border px-4 py-2">{formatTime(punchInTime)}</td>
                <td className="border px-4 py-2">{formatTime(punchOutTime)}</td>
                <td className="border px-4 py-2">{WORK_HOURS} hrs</td>
                <td className="border px-4 py-2">
                  {punchOutTime ? (
                    <span className={trackerIdle > 0 ? "text-red-600 font-semibold" : "text-green-600"}>
                      {trackerIdle.toFixed(2)} hrs
                    </span>
                  ) : "--"}
                </td>
                <td className="border px-4 py-2">
                  {!punchedIn
                    ? <span className="text-gray-500">Not Punched In</span>
                    : !punchOutTime
                      ? <span className="text-blue-600">Working</span>
                      : <span className="text-green-600">Completed</span>
                  }
                </td>
                <td className="border px-4 py-2">
                  {!punchedIn ? (
                    <button
                      className="bg-green-600 text-white px-4 py-1 rounded-lg shadow hover:bg-green-700 transition"
                      onClick={handlePunchIn}
                    >
                      Punch In
                    </button>
                  ) : !punchOutTime ? (
                    <button
                      className="bg-red-600 text-white px-4 py-1 rounded-lg shadow hover:bg-red-700 transition"
                      onClick={handlePunchOut}
                    >
                      Punch Out
                    </button>
                  ) : (
                    <span className="text-gray-400">Done</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          <FaRegClock className="inline mr-1" />
          Working hours: <span className="font-semibold">09:30 - 18:30</span>. Idle time is calculated for late punch in or early punch out.
        </p>
      </div>

      {/* Employee Profile Card */}
      <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-blue-100 to-blue-50 rounded-2xl shadow-lg p-6 mb-8 gap-6">
        <div className="flex-shrink-0">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(personal.name)}&background=0D8ABC&color=fff&size=128`}
            alt="Employee"
            className="w-28 h-28 rounded-full border-4 border-white shadow"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-blue-900 mb-1 flex items-center gap-2">
            <FaUserCircle className="text-blue-400" /> {personal.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-gray-700">
            <div>
              <span className="font-semibold">Employee ID:</span> {job.employeeId}
            </div>
            <div>
              <span className="font-semibold">Designation:</span> {job.designation}
            </div>
            <div>
              <span className="font-semibold">Department:</span> {job.department}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {contact.email || "--"}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
          <FaCalendarAlt className="text-blue-500 text-2xl" />
          <div>
            <div className="text-sm text-gray-500">Leaves (This Month)</div>
            <div className="font-bold text-lg text-blue-900">{leavesThisMonth.length}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
          <FaRegClock className="text-green-500 text-2xl" />
          <div>
            <div className="text-sm text-gray-500">Worked Hours (This Month)</div>
            <div className="font-bold text-lg text-green-900">{totalWorkedHours.toFixed(2)}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
          <FaChartPie className="text-yellow-500 text-2xl" />
          <div>
            <div className="text-sm text-gray-500">Idle Time (This Month)</div>
            <div className="font-bold text-lg text-yellow-900">{totalIdleTime.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Noticeboard */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center mb-4 gap-2">
          <FaBell className="text-yellow-500 text-xl" />
          <h2 className="text-xl font-bold tracking-tight">Noticeboard</h2>
        </div>
        <ul>
          {recentNotices.map((notice) => (
            <li key={notice.id} className="mb-4 border-b pb-2 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-700">{notice.title}</span>
                <span className="ml-auto text-xs text-gray-400">{new Date(notice.date).toLocaleDateString()}</span>
              </div>
              <div className="text-gray-700">{notice.message}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Analytics Row: Leave Bar Chart & Work Hours Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Leave Summary Bar Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center">
          <div className="flex items-center mb-2 gap-2">
            <FaCalendarAlt className="text-blue-500 text-lg" />
            <h2 className="text-lg font-bold tracking-tight">Leave Summary</h2>
          </div>
          <div className="w-full max-w-xs">
            <Bar
              data={leaveBarData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                  tooltip: { enabled: true },
                },
                scales: {
                  y: { beginAtZero: true, precision: 0 },
                },
              }}
              height={180}
            />
          </div>
        </div>
        {/* Work Hours Summary Pie Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center">
          <div className="flex items-center mb-2 gap-2">
            <FaChartPie className="text-yellow-500 text-lg" />
            <h2 className="text-lg font-bold tracking-tight">Work Hours Summary</h2>
          </div>
          <div className="w-full max-w-xs">
            <Pie
              data={workPieData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "bottom" },
                  title: { display: false },
                  tooltip: { enabled: true },
                },
              }}
              height={180}
            />
          </div>
          <div className="flex justify-between w-full mt-2 text-xs text-gray-600">
            <span>Worked: <span className="font-semibold">{totalWorkedHours.toFixed(2)}</span></span>
            <span>Idle: <span className="font-semibold">{totalIdleTime.toFixed(2)}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
