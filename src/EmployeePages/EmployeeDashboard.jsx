import { useContext, useState, useEffect } from "react";
import { CurrentEmployeeContext } from "../EmployeeContext/CurrentEmployeeContext";
import { CurrentEmployeeAttendanceContext } from "../EmployeeContext/CurrentEmployeeAttendanceContext";
import { CurrentEmployeeLeaveRequestContext } from "../EmployeeContext/CurrentEmployeeLeaveRequestContext";
import { NoticeContext } from "../context/NoticeContext";
import { FaUser } from "react-icons/fa";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const EmployeeDashboard = () => {
  const { employees } = useContext(CurrentEmployeeContext);
  const { attendanceRecords } = useContext(CurrentEmployeeAttendanceContext);
  const leaveRequestContext = useContext(CurrentEmployeeLeaveRequestContext);
  const leaveRequests = leaveRequestContext?.leaveRequests ?? [];
  const noticeContext = useContext(NoticeContext);
  const notices = noticeContext?.notices ?? [];

  const employee = employees.find(e => e.employeeId === "EMP101");

  const presentDays = attendanceRecords.filter(r => r.employeeId === "EMP101" && r.status === "Present").length;
  const leaveDays = attendanceRecords.filter(r => r.employeeId === "EMP101" && r.status === "Leave").length;
  const absentDays = attendanceRecords.filter(r => r.employeeId === "EMP101" && r.status === "Absent").length;

  const attendanceData = [
    { name: "Present", value: presentDays },
    { name: "Leaves", value: leaveDays },
    { name: "Absent", value: absentDays },
  ];

  const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];

  // 👇 Punch-in State
  const [punchedIn, setPunchedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [workingHours, setWorkingHours] = useState("00:00:00");
  const [expectedCheckout, setExpectedCheckout] = useState(null);
  const [hasPunchedToday, setHasPunchedToday] = useState(false);

  // 👇 Punch handler
  const handlePunch = () => {
  if (!punchedIn) {
    // 🔵 Punch In Logic
    const now = new Date();
    setCheckInTime(now);
    const expected = new Date(now.getTime() + 9 * 60 * 60 * 1000); // 9 hours later
    setExpectedCheckout(expected);
    setWorkingHours("00:00:00");
    setPunchedIn(true);
  } else {
    // 🔴 Punch Out Logic
    setCheckInTime(null);
    setExpectedCheckout(null);
    setWorkingHours("00:00:00");
    setPunchedIn(false);
    setHasPunchedToday(true); // Disable button if needed
  }
};




  useEffect(() => {
    let interval;
    if (punchedIn && checkInTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now - new Date(checkInTime);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setWorkingHours(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [punchedIn, checkInTime]);

  return (
    <div className="p-6 bg-blue-50 min-h-screen">
      <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
        <FaUser className="text-blue-700" />
        Welcome, {employee?.name || "John Doe"}!
      </h2>

      {/* 🔵 Attendance Info & Punch Button */}
<h2 className="text-xl font-bold mb-2 text-gray-700">Today’s Attendance</h2>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  {/* Check-in Time */}
  <div className="flex flex-col justify-between text-center bg-white p-4 shadow rounded h-full">
    <div className="text-sm font-medium text-gray-600 mb-1">Check-in Time</div>
    <div className="bg-blue-700 text-white p-3 rounded font-semibold">
      {checkInTime ? new Date(checkInTime).toLocaleTimeString() : "--:--:--"}
    </div>
  </div>

  {/* Expected Checkout */}
  <div className="flex flex-col justify-between text-center bg-white p-4 shadow rounded h-full">
    <div className="text-sm font-medium text-gray-600 mb-1">Expected Check-out</div>
    <div className="bg-blue-700 text-white p-3 rounded font-semibold">
      {expectedCheckout ? expectedCheckout.toLocaleTimeString() : "--:--:--"}
    </div>
  </div>

  {/* Working Hours */}
  <div className="flex flex-col justify-between text-center bg-white p-4 shadow rounded h-full">
    <div className="text-sm font-medium text-gray-600 mb-1">Working Hours</div>
    <div className="bg-blue-700 text-white p-3 rounded font-semibold">
      {workingHours}
    </div>
  </div>

  {/* Today's Status + Button */}
  {/* Today's Status + Punch Button */}
<div className="flex flex-col justify-between bg-white p-4 shadow rounded h-full">
  <div className="text-sm font-medium text-gray-600 mb-2 text-center">Today's Status</div>
  
  <div className="flex items-center gap-3">
    {/* Status Badge */}
    <div
      className={`flex-1 text-center px-3 py-2 rounded font-semibold text-white transition-all ${
        punchedIn ? "bg-green-600" : "bg-yellow-500"
      }`}
    >
      {punchedIn ? "Present" : "Not Punched"}
    </div>

    {/* Vertical Divider */}
    <div className="w-px bg-gray-300 h-10 mx-1" />

    {/* Punch Button */}
    <button
      onClick={handlePunch}
      className={`flex-1 px-4 py-2 rounded font-semibold text-white shadow transition-all ${
        punchedIn ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
      } disabled:opacity-60 disabled:cursor-not-allowed`}
      disabled={hasPunchedToday}
    >
      {punchedIn ? "Punch Out" : "Punch In"}
    </button>
  </div>

  {/* Optional Tooltip or Note */}
  {hasPunchedToday && (
    <div className="text-xs text-center text-gray-500 mt-2">
      You already punched today
    </div>
  )}
</div>

</div>

      {/* 🟣 Main Grid: Employee Details / Working Hours / Pie Chart */}
      <div className="grid grid-cols-3 gap-6">
        {/* Employee Details */}
        <div className="bg-white rounded-xl shadow p-4 border-t-4 border-blue-700">
          <div className="font-bold text-blue-700 text-lg mb-2">Employee Details:</div>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-gray-200 rounded">
              <svg className="w-full h-full text-gray-500" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                <path stroke="currentColor" strokeWidth="2" d="M6 20c0-3.33 2.67-6 6-6s6 2.67 6 6" />
              </svg>
            </div>
            <div className="text-sm text-gray-700">
              <div><b>Employee ID:</b> {employee?.employeeId}</div>
              <div><b>Name:</b> {employee?.name}</div>
              <div><b>Email:</b> {employee?.email}</div>
              <div><b>Department:</b> {employee?.department}</div>
              <div><b>Phone:</b> {employee?.phone}</div>
              <div><b>Address:</b> {employee?.address}</div>
            </div>
          </div>
        </div>

        {/* Working Hours (Graph Placeholder) */}
        <div className="bg-white rounded-xl shadow p-4 border-t-4 border-blue-700">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-blue-700">Working Hours</span>
            <select className="border p-1 rounded text-sm">
              <option>July</option>
            </select>
          </div>
          <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-400">
            (Graph here)
          </div>
        </div>

        {/* Attendance Pie Chart */}
        <div className="bg-white rounded-xl shadow p-4 border-t-4 border-blue-700 text-center">
          <h4 className="font-bold text-blue-700 mb-2">Attendance Overview</h4>
          <PieChart width={220} height={220}>
            <Pie
              data={attendanceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {attendanceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      {/* 🟡 Bottom Section */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Leave Requests */}
        <div className="bg-white rounded-xl shadow p-4 border-t-4 border-blue-700">
          <div className="font-bold text-blue-700 text-lg mb-2">Recent Leave Request:</div>
          {leaveRequests
            .filter(lr => lr.employeeId === "EMP101")
            .slice(0, 2)
            .map((lr, i) => (
              <div key={i} className="flex justify-between bg-yellow-50 p-3 mb-2 rounded shadow">
                <span>Leave Name: ..............</span>
                <span className={`font-semibold ${lr.status === "Approved" ? "text-green-700" : "text-yellow-600"}`}>
                  Status: {lr.status}
                </span>
              </div>
            ))}
        </div>

        {/* Notice Board */}
        <div className="bg-white rounded-xl shadow p-4 border-t-4 border-blue-700">
          <div className="font-bold text-blue-700 text-lg mb-2">Notice Board</div>
          {notices.length > 0 ? (
            <div className="text-sm text-gray-700">
              <p><b>{notices[0].title}</b></p>
              <p>{notices[0].message}</p>
              <p className="text-xs text-gray-500 mt-2">- {notices[0].author}, {notices[0].date}</p>
            </div>
          ) : (
            <div className="text-gray-400 text-sm">No notices yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
