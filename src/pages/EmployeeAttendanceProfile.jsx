import React, { useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AttendanceContext } from "../context/AttendanceContext";
import { LeaveRequestContext } from "../context/LeaveRequestContext";
import { HolidayCalendarContext } from "../context/HolidayCalendarContext";
import { EmployeeContext } from "../context/EmployeeContext";
import { getSandwichLeaveDates } from "../lib/utils";
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
  // Helper: get day of week (0=Sun, 6=Sat)
  const getDayOfWeek = (dateStr) => new Date(dateStr).getDay();

  // Always treat employeeId as string for consistency
  const { employeeId: routeEmployeeId } = useParams();
  const employeeId = String(routeEmployeeId);
  const navigate = useNavigate();
  
  // Get contexts with proper error handling
  const attendanceContext = useContext(AttendanceContext);
  const leaveRequestContext = useContext(LeaveRequestContext);
  const holidayContext = useContext(HolidayCalendarContext);
  const employeeContext = useContext(EmployeeContext);

  // Extract data from contexts with fallbacks
  const attendanceRecords = attendanceContext?.attendanceRecords || [];
  const leaveRequests = leaveRequestContext?.leaveRequests || [];
  const getHolidayDates = holidayContext?.getHolidayDates;
  const getEmployeeById = employeeContext?.getEmployeeById;
  const getApprovedLeaveDatesByEmployee = leaveRequestContext?.getApprovedLeaveDatesByEmployee;

  // Month filter state
  const [selectedMonth, setSelectedMonth] = React.useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7); // 'YYYY-MM'
  });

  // Get all months available for this employee (from attendanceRecords only)
  const availableMonths = Array.from(
    new Set(
      attendanceRecords
        .filter((rec) => String(rec.employeeId) === employeeId)
        .map((rec) => rec.date.slice(0, 7))
    )
  ).sort((a, b) => b.localeCompare(a));

  // Filter records for selected month, sorted by latest first
  const records = attendanceRecords
    .filter((rec) => String(rec.employeeId) === employeeId && rec.date.startsWith(selectedMonth))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Get public holidays for the selected month from context
  const publicHolidays = (typeof getHolidayDates === 'function')
    ? getHolidayDates().filter(date => date.startsWith(selectedMonth))
    : [];


  // Memoized sandwich leave calculation for better performance
  const sandwichLeaveData = useMemo(() => {
    if (!getApprovedLeaveDatesByEmployee || !getHolidayDates) {
      return { allDates: [], monthlyDates: [], count: 0 };
    }

    try {
      // Get approved leave dates for this employee
      const approvedLeaveDates = getApprovedLeaveDatesByEmployee(employeeId);
      
      // Get all holiday dates
      const holidayDates = getHolidayDates();
      
      // Calculate sandwich leave dates using utility function
      const allSandwichLeaveDates = getSandwichLeaveDates(approvedLeaveDates, holidayDates);
      
      // Filter for selected month
      const monthlySandwichLeaveDates = allSandwichLeaveDates.filter(date =>
        date.startsWith(selectedMonth)
      );
      
      return {
        allDates: allSandwichLeaveDates,
        monthlyDates: monthlySandwichLeaveDates,
        count: monthlySandwichLeaveDates.length
      };
    } catch (error) {
      console.error('Error calculating sandwich leaves:', error);
      return { allDates: [], monthlyDates: [], count: 0 };
    }
  }, [employeeId, selectedMonth, getApprovedLeaveDatesByEmployee, getHolidayDates]);

  const sandwichLeaveDates = sandwichLeaveData.monthlyDates;
  const sandwichLeaveCount = sandwichLeaveData.count;
  const [showSandwichModal, setShowSandwichModal] = React.useState(false);

  // Memoized employee data and statistics for better performance
  const employeeData = useMemo(() => {
    // Get employee name (prefer EmployeeProvider, fallback to attendance record)
    const employeeObj = typeof getEmployeeById === 'function' ? getEmployeeById(employeeId) : null;
    const employeeName = employeeObj?.name || (records.length > 0 ? records[0].name : employeeId);

    // Attendance summary
    const presentDays = records.filter((r) => r.status === "Present").length;
    const absentDays = records.filter((r) => r.status === "Absent").length;
    const leaveDays = records.filter((r) => r.status === "Leave").length;

    // Work hour stats
    const totalWorkHours = records.reduce((sum, r) => sum + (r.workHours || 0), 0);
    const totalWorkedHours = records.reduce((sum, r) => sum + (r.workedHours || 0), 0);
    const totalIdleTime = records.reduce((sum, r) => sum + (r.idleTime || 0), 0);

    // Leave summary (from LeaveRequestProvider only)
    const employeeLeaves = leaveRequests.filter((l) =>
      String(l.employeeId) === employeeId && l.date && l.date.startsWith(selectedMonth)
    );
    const leavesApplied = employeeLeaves.length;
    const leavesApproved = employeeLeaves.filter((l) => l.status === "Approved").length;
    const leavesRejected = employeeLeaves.filter((l) => l.status === "Rejected").length;
    const leavesPending = employeeLeaves.filter((l) => l.status === "Pending").length;

    return {
      employeeName,
      presentDays,
      absentDays,
      leaveDays,
      totalWorkHours,
      totalWorkedHours,
      totalIdleTime,
      leavesApplied,
      leavesApproved,
      leavesRejected,
      leavesPending
    };
  }, [records, leaveRequests, employeeId, selectedMonth, getEmployeeById]);

  const {
    employeeName,
    presentDays,
    absentDays,
    leaveDays,
    totalWorkHours,
    totalWorkedHours,
    totalIdleTime,
    leavesApplied,
    leavesApproved,
    leavesRejected,
    leavesPending
  } = employeeData;

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

  // Add state for view toggle
  const [attendanceView, setAttendanceView] = React.useState('table'); // 'table' or 'calendar'

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
          {/* Fix bar graph size and layout for attractiveness */}
          <div className="mb-8 flex flex-col md:flex-row gap-8 items-start justify-center">
            <div className="bg-gray-50 rounded-xl shadow p-4 w-full md:w-1/2 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Monthly Attendance Summary</h3>
              <Bar data={attendanceChartData} options={attendanceChartOptions} height={120} />
            </div>
            <div className="flex-1" />
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
              <div className="mt-3 w-full flex flex-col items-center">
                <button
                  className="text-xs font-semibold text-gray-700 bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 transition cursor-pointer"
                  onClick={() => setShowSandwichModal(true)}
                  disabled={sandwichLeaveCount === 0}
                  style={{ opacity: sandwichLeaveCount === 0 ? 0.6 : 1 }}
                  title={sandwichLeaveCount === 0 ? 'No sandwich leaves' : 'View sandwich leave dates'}
                >
                  Sandwich Leaves: <span className="text-blue-700 font-bold">{sandwichLeaveCount}</span>
                </button>
                <span className="text-[11px] text-gray-500 mt-1">(Leave on Saturday & Monday, with public holiday in between)</span>
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
          <h3 className="font-semibold mb-4 text-gray-700 text-lg flex items-center justify-between">
            Daily Attendance Details
            <button
              className="ml-4 px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold text-xs shadow hover:bg-blue-200 transition"
              onClick={() => setAttendanceView(attendanceView === 'table' ? 'calendar' : 'table')}
              title={attendanceView === 'table' ? 'Switch to Calendar View' : 'Switch to Table View'}
            >
              {attendanceView === 'table' ? 'Calendar View' : 'Table View'}
            </button>
          </h3>
          {attendanceView === 'table' ? (
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
          ) : (
            // Calendar view
            <div className="w-full bg-white rounded-xl shadow border border-gray-200 p-4">
              <div className="grid grid-cols-7 gap-2">
                {/* Render day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-xs font-bold text-blue-700 text-center py-1">{day}</div>
                ))}
                {/* Render days for the selected month */}
                {(() => {
                  const daysInMonth = new Date(selectedMonth + '-01');
                  const year = daysInMonth.getFullYear();
                  const month = daysInMonth.getMonth();
                  const lastDay = new Date(year, month + 1, 0).getDate();
                  const firstDayOfWeek = new Date(year, month, 1).getDay();
                  const cells = [];
                  // Empty cells for days before the 1st
                  for (let i = 0; i < firstDayOfWeek; i++) {
                    cells.push(<div key={'empty-' + i} className="bg-transparent"></div>);
                  }
                  // Render each day
                  for (let day = 1; day <= lastDay; day++) {
                    const dateStr = `${selectedMonth}-${day.toString().padStart(2, '0')}`;
                    const rec = records.find(r => r.date === dateStr);
                    let statusColor = '';
                    let statusText = '';
                    if (rec) {
                      if (rec.status === 'Present') {
                        statusColor = 'bg-green-100 text-green-700';
                        statusText = 'Present';
                      } else if (rec.status === 'Absent') {
                        statusColor = 'bg-red-100 text-red-700';
                        statusText = 'Absent';
                      } else if (rec.status === 'Leave') {
                        statusColor = 'bg-yellow-100 text-yellow-700';
                        statusText = 'Leave';
                      }
                    }
                    cells.push(
                      <div key={dateStr} className={`flex flex-col items-center justify-center border rounded-lg py-2 px-1 ${statusColor} min-h-[60px]`}>
                        <span className="font-mono text-xs text-gray-700">{day}</span>
                        {rec && <span className="text-[10px] font-semibold mt-1">{statusText}</span>}
                        {rec && rec.status === 'Present' && rec.punchIn && (
                          <span className="text-[9px] text-gray-500">In: {rec.punchIn}</span>
                        )}
                        {rec && rec.status === 'Present' && rec.punchOut && (
                          <span className="text-[9px] text-gray-500">Out: {rec.punchOut}</span>
                        )}
                      </div>
                    );
                  }
                  return cells;
                })()}
              </div>
            </div>
          )}
          {showSandwichModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative animate-fade-in">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold focus:outline-none"
        onClick={() => setShowSandwichModal(false)}
        title="Close"
        aria-label="Close"
      >
        &times;
      </button>
      <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
        <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-base font-semibold">{sandwichLeaveCount}</span>
        Sandwich Leave Details - {selectedMonth}
      </h3>
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Sandwich Leave:</strong> When a holiday falls between two approved leave days,
          the holiday is counted as a sandwich leave day.
        </p>
      </div>
      {sandwichLeaveDates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mb-2" viewBox="0 0 24 24">
            <path d="M12 8v4l3 3"/>
          </svg>
          <p className="text-gray-600 text-center">No sandwich leave found for this month.</p>
          <p className="text-sm text-gray-500 text-center mt-2">
            Sandwich leaves occur when holidays fall between approved leave days.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-3">
            The following holidays are sandwiched between your approved leave days:
          </div>
          <ul className="space-y-3">
            {sandwichLeaveDates.map((date, idx) => {
              // Get holiday information if available
              const holidayInfo = holidayContext?.getHolidayByDate?.(date);
              return (
                <li key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-700">Holiday Date:</span>
                        <span className="bg-yellow-100 text-yellow-700 rounded px-2 py-1 text-xs font-semibold">
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      {holidayInfo && (
                        <div className="text-sm text-gray-600">
                          <strong>{holidayInfo.name}</strong>
                          {holidayInfo.description && ` - ${holidayInfo.description}`}
                        </div>
                      )}
                    </div>
                    <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                      Sandwich Leave
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Total Sandwich Leave Days this month:</strong> {sandwichLeaveCount}
            </p>
          </div>
        </div>
      )}
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendanceProfile;
