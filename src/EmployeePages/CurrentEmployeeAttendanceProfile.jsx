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
          {record.punchIn && (
            <>
              In: {record.punchIn}
              <br />
            </>
          )}
          {record.punchOut && (
            <>
              Out: {record.punchOut}
              <br />
            </>
          )}
        </div>
      )}
    </td>
  );
};

const CurrentEmployeeAttendanceProfile = () => {
  const { attendanceRecords } = useContext(CurrentEmployeeAttendanceContext);
  const {
    leaveRequests,
    filteredRequests,
    monthOptions: leaveMonthOptions,
  } = useContext(CurrentEmployeeLeaveRequestContext);

  // Only for EMP101 (demo)
  const employeeId = "EMP101";
  const employeeRecords = attendanceRecords.filter(
    (rec) => rec.employeeId === employeeId
  );

  // Monthly filter
  const monthOptions = getMonthOptions(employeeRecords);
  const [selectedMonth, setSelectedMonth] = useState(
    monthOptions[monthOptions.length - 1] || ""
  );

  // Filter records for selected month
  const monthlyRecords = useMemo(
    () =>
      employeeRecords.filter((rec) => rec.date.startsWith(selectedMonth)),
    [employeeRecords, selectedMonth]
  );

  // Monthly summary
  const presentCount = monthlyRecords.filter((r) => r.status === "Present").length;
  const absentCount = monthlyRecords.filter((r) => r.status === "Absent").length;
  const leaveCount = monthlyRecords.filter((r) => r.status === "Leave").length;

  // Leaves applied in selected month
  const leavesApplied = leaveRequests.filter(
    (req) =>
      req.employeeId === employeeId &&
      req.from.startsWith(selectedMonth)
  );

  // Work hours summary
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
    ? new Date(
        Number(selectedMonth.slice(0, 4)),
        Number(selectedMonth.slice(5, 7)),
        0
      ).getDate()
    : 0;
  const firstDayOfWeek = selectedMonth
    ? new Date(
        Number(selectedMonth.slice(0, 4)),
        Number(selectedMonth.slice(5, 7)) - 1,
        1
      ).getDay()
    : 0;

  // Build calendar cells
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
          <span className="text-blue-600 font-bold text-lg">Leaves Applied</span>
          <span className="text-2xl font-bold">{leavesApplied.length}</span>
        </div>
      </div>

      {/* Work hours summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-indigo-50 p-4 rounded shadow flex flex-col items-center">
          <span className="text-indigo-600 font-bold text-lg">Total Work Hours</span>
          <span className="text-2xl font-bold">{totalWorkHours.toFixed(2)}</span>
        </div>
        <div className="bg-indigo-50 p-4 rounded shadow flex flex-col items-center">
          <span className="text-indigo-600 font-bold text-lg">Total Worked Hours</span>
          <span className="text-2xl font-bold">{totalWorkedHours.toFixed(2)}</span>
        </div>
        <div className="bg-indigo-50 p-4 rounded shadow flex flex-col items-center">
          <span className="text-indigo-600 font-bold text-lg">Total Idle Time</span>
          <span className="text-2xl font-bold">{totalIdleTime.toFixed(2)}</span>
        </div>
      </div>

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
