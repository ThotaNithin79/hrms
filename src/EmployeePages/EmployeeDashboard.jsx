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
  const { attendanceRecords, monthlyWorkHours, monthlyIdleHours } = useContext(CurrentEmployeeAttendanceContext);
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

  // --- Edit Profile State ---
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: personal.name,
    email: contact.email,
    phone: contact.phone,
    employeeId: job.employeeId,
    department: job.department,
    designation: job.designation,
  });
  const [editError, setEditError] = useState("");

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = () => {
  const { name, email, phone, employeeId, department, designation } = editForm;

  // Trim values
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedPhone = phone.trim();
  const trimmedEmployeeId = employeeId.trim();
  const trimmedDepartment = department.trim();
  const trimmedDesignation = designation.trim();

  // Validate empty fields
  if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedEmployeeId || !trimmedDepartment || !trimmedDesignation) {
    setEditError("All fields are mandatory.");
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    setEditError("Please enter a valid email address.");
    return;
  }

  // Validate phone number (10 digits)
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(trimmedPhone)) {
    setEditError("Phone number must be 10 digits.");
    return;
  }

  // Save changes to context
  editCurrentEmployee({
    personal: { name: trimmedName },
    contact: { email: trimmedEmail, phone: trimmedPhone },
    job: { employeeId: trimmedEmployeeId, department: trimmedDepartment, designation: trimmedDesignation },
  });

  setEditMode(false);
  setEditError("");
};


  // Noticeboard (show 3 most recent)
  const recentNotices = notices.slice(0, 3);

  // Leaves (This Month) - fetch from provider, not dummy
  const leaveMonth = todayStr.slice(0, 7);
  const leavesThisMonth = leaveRequests.filter(
    (req) => req.employeeId === empId && req.from.startsWith(leaveMonth)
  );
  // Count by status for bar chart
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

  // Work Hours & Idle Time (This Month) - fetch from provider, add today's tracker if any
  const thisMonthAttendance = attendanceRecords.filter(
    (rec) =>
      rec.employeeId === empId && rec.date.startsWith(leaveMonth)
  );
  // Use context monthlyWorkHours/monthlyIdleHours, add today's tracker if punched in/out
  let totalWorkedHours = monthlyWorkHours;
  let totalIdleTime = monthlyIdleHours;
  if (punchedIn && punchOutTime) {
    // Add today's tracker values if not already in attendanceRecords
    const alreadyCounted = todayAttendance && todayAttendance.workedHours > 0;
    if (!alreadyCounted) {
      totalWorkedHours += WORK_HOURS - trackerIdle;
      totalIdleTime += trackerIdle;
    }
  }

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
      {/* Employee Profile Card & Edit Profile */}
      <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-blue-100 to-blue-50 rounded-2xl shadow-lg p-6 mb-8 gap-6">
        <div className="flex-shrink-0">
          <img
            src={currentEmployee.profilePhoto ? currentEmployee.profilePhoto : `https://ui-avatars.com/api/?name=${encodeURIComponent(personal.name)}&background=0D8ABC&color=fff&size=128`}
            alt="Employee"
            className="w-28 h-28 rounded-full border-4 border-white shadow object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-blue-900 mb-1 flex items-center gap-2">
            <FaUserCircle className="text-blue-400" /> {personal.name}
          </h3>
          {!editMode ? (
            <>
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
                <div>
                  <span className="font-semibold">Phone:</span> {contact.phone || "--"}
                </div>
              </div>
            </>
          ) : (
            <form className="mt-2 space-y-3 max-w-lg" onSubmit={e => { e.preventDefault(); handleEditSave(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Name<span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={editForm.name} onChange={handleEditChange} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email<span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={editForm.email} onChange={handleEditChange} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone Number<span className="text-red-500">*</span></label>
                  <input type="tel" name="phone" value={editForm.phone} onChange={handleEditChange} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Employee ID<span className="text-red-500">*</span></label>
                  <input type="text" name="employeeId" value={editForm.employeeId} onChange={handleEditChange} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Department<span className="text-red-500">*</span></label>
                  <input type="text" name="department" value={editForm.department} onChange={handleEditChange} required className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Designation<span className="text-red-500">*</span></label>
                  <input type="text" name="designation" value={editForm.designation} onChange={handleEditChange} required className="w-full border px-3 py-2 rounded" />
                </div>
              </div>
              {editError && <div className="text-red-600 font-semibold">{editError}</div>}
              <div className="flex gap-4 mt-2">
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Save</button>
                <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500" onClick={() => { setEditMode(false); setEditError(""); }}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Daily Check-in */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center mb-4 gap-2">
          <FaRegClock className="text-blue-600 text-xl" />
          <h2 className="text-xl font-bold tracking-tight">Daily Check-in</h2>
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
