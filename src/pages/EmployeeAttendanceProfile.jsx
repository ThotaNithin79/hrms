import React, { useContext, useMemo, useState } from "react";
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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EmployeeAttendanceProfile = () => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const { employeeId: routeEmployeeId } = useParams();
  const employeeId = String(routeEmployeeId);
  const navigate = useNavigate();

  // --- Get data and helper functions from Contexts ---
  const { attendanceRecords = [], getEmployeeMonthlyStats } = useContext(AttendanceContext) || {};
  const { leaveRequests = [], getApprovedLeaveDatesByEmployee } = useContext(LeaveRequestContext) || {};
  const { getHolidayDates, getHolidayByDate } = useContext(HolidayCalendarContext) || {};
  const { getEmployeeById } = useContext(EmployeeContext) || {};

  // --- Component State ---
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7)); // 'YYYY-MM'
  const [attendanceView, setAttendanceView] = useState('table'); // 'table' or 'calendar'
  const [showSandwichModal, setShowSandwichModal] = useState(false);

  // --- Data Processing & Derivation (Memoized for performance) ---

  // Get the employee's name
  const employeeName = useMemo(() => {
    const employee = getEmployeeById ? getEmployeeById(employeeId) : null;
    return employee?.name || "Employee";
  }, [getEmployeeById, employeeId]);

  // Get all available months for the dropdown from the raw daily records
  const availableMonths = useMemo(() => Array.from(
    new Set(
      attendanceRecords
        .filter((rec) => String(rec.employeeId) === employeeId)
        .map((rec) => rec.date.slice(0, 7))
    )
  ).sort((a, b) => b.localeCompare(a)), [attendanceRecords, employeeId]);

  // ** REFACTORED: Get pre-calculated monthly statistics directly from the provider **
  const monthlyStats = useMemo(() => {
    if (getEmployeeMonthlyStats) {
      return getEmployeeMonthlyStats(employeeId, selectedMonth);
    }
    return null;
  }, [getEmployeeMonthlyStats, employeeId, selectedMonth]);

  // Get the detailed daily records for the selected month (for table/calendar view)
  const records = useMemo(() => {
    return attendanceRecords
      .filter((rec) => String(rec.employeeId) === employeeId && rec.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendanceRecords, employeeId, selectedMonth]);

  // --- Populate UI variables directly from the fetched monthly stats ---
  const fullDayPresent = monthlyStats?.present_days || 0;
  const halfDayPresent = monthlyStats?.half_days || 0;
  const absentDays = monthlyStats?.absent_days || 0;
  const leaveDays = (monthlyStats?.paid_leave_count || 0) + (monthlyStats?.unpaid_leave_count || 0);
  
  // Holiday days are not in the stats table, so we calculate them from the daily records for the selected month.
  const holidayDays = useMemo(() => records.filter(r => r.status === "Holiday").length, [records]);

  // Calculate work hour totals from the detailed daily records for the selected month.
  const { totalWorkHours, totalWorkedHours, totalIdleTime } = useMemo(() => {
    return records.reduce((acc, r) => {
      // Only include past or today's records in the sum
      if (r.date <= todayStr) {
        acc.totalWorkHours += r.workHours || 0;
        acc.totalWorkedHours += r.workedHours || 0;
        acc.totalIdleTime += r.idleTime || 0;
      }
      return acc;
    }, { totalWorkHours: 0, totalWorkedHours: 0, totalIdleTime: 0 });
  }, [records, todayStr]);

  // Calculate leave summary stats from the LeaveRequestContext.
  const { leavesApplied, leavesApproved, leavesRejected, leavesPending } = useMemo(() => {
     const employeeLeaves = leaveRequests.filter((l) =>
      String(l.employeeId) === employeeId && l.from && l.from.startsWith(selectedMonth)
    );
    return {
      leavesApplied: employeeLeaves.length,
      leavesApproved: employeeLeaves.filter((l) => l.status === "Approved").length,
      leavesRejected: employeeLeaves.filter((l) => l.status === "Rejected").length,
      leavesPending: employeeLeaves.filter((l) => l.status === "Pending").length,
    }
  }, [leaveRequests, employeeId, selectedMonth]);

  // Calculate sandwich leave data.
  const sandwichLeaveData = useMemo(() => {
    if (!getApprovedLeaveDatesByEmployee || !getHolidayDates) {
      return { monthlyDates: [], count: 0 };
    }
    const allSandwichLeaveDates = getSandwichLeaveDates(
      getApprovedLeaveDatesByEmployee(employeeId),
      getHolidayDates()
    );
    const monthlySandwichLeaveDates = allSandwichLeaveDates.filter(date =>
      date.startsWith(selectedMonth) && date <= todayStr
    );
    return {
      monthlyDates: monthlySandwichLeaveDates,
      count: monthlySandwichLeaveDates.length
    };
  }, [employeeId, selectedMonth, getApprovedLeaveDatesByEmployee, getHolidayDates, todayStr]);

  const { monthlyDates: sandwichLeaveDates, count: sandwichLeaveCount } = sandwichLeaveData;
  
  // --- Chart Configuration ---
  const attendanceChartData = {
    labels: ["Full Day Present", "Half Day Present", "Absent", "On Leave", "Holiday"],
    datasets: [{
      label: "Days",
      data: [fullDayPresent, halfDayPresent, absentDays, leaveDays, holidayDays],
      backgroundColor: ["#34d399", "#fbbf24", "#f87171", "#fbbf24", "#a78bfa"],
      borderRadius: 8,
    }],
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
      x: { grid: { display: false }, ticks: { color: "#2563eb", font: { weight: "bold" } } },
      y: { beginAtZero: true, grid: { color: "#e0e7ff" }, ticks: { stepSize: 1, color: "#2563eb" } },
    },
  };

  // --- RENDER ---
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
              {employeeName && employeeName[0]}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1 tracking-tight">{employeeName}</h2>
            <p className="text-gray-500 font-mono">ID: {employeeId}</p>
          </div>

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
                  {new Date(`${month}-02`).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-8 flex flex-col md:flex-row gap-8 items-start justify-center">
            <div className="bg-gray-50 rounded-xl shadow p-4 w-full md:w-1/2 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Monthly Attendance Summary</h3>
              {monthlyStats ? (
                <Bar data={attendanceChartData} options={attendanceChartOptions} height={120} />
              ) : (
                <div className="h-[120px] flex items-center justify-center text-gray-500">No attendance data for this month.</div>
              )}
            </div>
            <div className="flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow flex flex-col items-center">
              <span className="text-2xl mb-1 text-green-600">●</span>
              <h3 className="font-semibold mb-1 text-gray-700">Present (Full Day)</h3>
              <span className="text-2xl font-bold text-green-700">{fullDayPresent}</span>
              <span className="text-xs text-gray-500 mt-1">Punched In</span>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow flex flex-col items-center">
              <span className="text-2xl mb-1 text-yellow-500">●</span>
              <h3 className="font-semibold mb-1 text-gray-700">Present (Half Day)</h3>
              <span className="text-2xl font-bold text-yellow-700">{halfDayPresent}</span>
              <span className="text-xs text-gray-500 mt-1">Late/Policy</span>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow flex flex-col items-center">
              <span className="text-2xl mb-1 text-red-600">●</span>
              <h3 className="font-semibold mb-1 text-gray-700">Absent</h3>
              <span className="text-2xl font-bold text-red-700">{absentDays}</span>
              <span className="text-xs text-gray-500 mt-1">Without Leave</span>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow flex flex-col items-center">
              <span className="text-2xl mb-1 text-yellow-500">●</span>
              <h3 className="font-semibold mb-1 text-gray-700">On Leave</h3>
              <span className="text-2xl font-bold text-yellow-700">{leaveDays}</span>
              <span className="text-xs text-gray-500 mt-1">Approved Leave</span>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow flex flex-col items-center">
              <span className="text-2xl mb-1 text-purple-500">●</span>
              <h3 className="font-semibold mb-1 text-gray-700">Holiday</h3>
              <span className="text-2xl font-bold text-purple-700">{holidayDays}</span>
              <span className="text-xs text-gray-500 mt-1">Public/Sunday</span>
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
                <span className="text-[11px] text-gray-500 mt-1">(Holiday between leave days)</span>
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
              onClick={() => setAttendanceView(prev => prev === 'table' ? 'calendar' : 'table')}
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
                  {records.map((rec, idx) => {
                    const isFuture = rec.date > todayStr;
                    let statusLabel = rec.status;
                    if (rec.status === "Present") {
                      statusLabel = rec.isHalfDay ? "Half Day Present" : "Present";
                    }
                    return (
                      <tr key={`${rec.id}-${rec.date}`} className={`border-t transition-colors duration-150 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} ${isFuture ? 'opacity-60 bg-gray-100 cursor-not-allowed' : 'hover:bg-blue-50'}`}>
                        <td className="p-3 font-mono text-gray-700">{rec.date}</td>
                        <td className="p-3">
                          {!isFuture ? (
                            <>
                              {statusLabel === "Present" && <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">Present</span>}
                              {statusLabel === "Half Day Present" && <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">Half Day Present</span>}
                              {statusLabel === "Absent" && <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold">Absent</span>}
                              {statusLabel === "Leave" && <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">Leave</span>}
                              {statusLabel === "Holiday" && <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs font-semibold">Holiday</span>}
                            </>
                          ) : (
                            <span className="ml-2 text-xs text-gray-400">Future</span>
                          )}
                        </td>
                        <td className="p-3">{!isFuture ? rec.punchIn || "—" : "—"}</td>
                        <td className="p-3">{!isFuture ? rec.punchOut || "—" : "—"}</td>
                        <td className="p-3">{!isFuture && typeof rec.workHours === "number" ? rec.workHours.toFixed(2) : "—"}</td>
                        <td className="p-3">{!isFuture && typeof rec.workedHours === "number" ? rec.workedHours.toFixed(2) : "—"}</td>
                        <td className="p-3">{!isFuture && typeof rec.idleTime === "number" ? rec.idleTime.toFixed(2) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="w-full bg-white rounded-xl shadow border border-gray-200 p-4">
              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-xs font-bold text-blue-700 text-center py-1">{day}</div>
                ))}
                {(() => {
                  const daysInMonth = new Date(selectedMonth.slice(0, 4), selectedMonth.slice(5, 7), 0).getDate();
                  const firstDayOfWeek = new Date(`${selectedMonth}-01`).getDay();
                  const cells = [];
                  for (let i = 0; i < firstDayOfWeek; i++) {
                    cells.push(<div key={`empty-${i}`} className="bg-transparent"></div>);
                  }
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${selectedMonth}-${String(day).padStart(2, '0')}`;
                    const rec = records.find(r => r.date === dateStr);
                    const isFuture = dateStr > todayStr;
                    
                    let cellProps = {
                        key: dateStr,
                        title: "Future date",
                        className: "flex flex-col items-center justify-center border rounded-lg py-2 px-1 min-h-[60px] font-semibold bg-gray-100 border-gray-300 opacity-60 border-dashed"
                    };
                    let dayText = <span className="font-mono text-xs text-gray-700">{day}</span>;
                    let statusText = <span className="text-[10px] font-semibold mt-1 text-gray-400">Future</span>;

                    if (!isFuture && rec) {
                        let statusColor = '';
                        let statusLabel = '';
                        let borderColor = 'border-gray-200';
                        if (rec.status === 'Present') {
                            statusColor = rec.isHalfDay ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700';
                            statusLabel = rec.isHalfDay ? 'Half-Day' : 'Present';
                            borderColor = rec.isHalfDay ? 'border-yellow-400' : 'border-green-400';
                        } else if (rec.status === 'Absent') {
                            statusColor = 'bg-red-50 text-red-700';
                            statusLabel = 'Absent';
                            borderColor = 'border-red-400';
                        } else if (rec.status === 'Leave') {
                            statusColor = 'bg-yellow-50 text-yellow-700';
                            statusLabel = 'Leave';
                            borderColor = 'border-yellow-400';
                        } else if (rec.status === 'Holiday') {
                            statusColor = 'bg-purple-50 text-purple-700';
                            statusLabel = 'Holiday';
                            borderColor = 'border-purple-400';
                        }
                        cellProps = {
                            key: dateStr,
                            title: `${dateStr}: ${statusLabel}`,
                            className: `flex flex-col items-center justify-center border-2 rounded-lg py-2 px-1 min-h-[60px] font-semibold ${statusColor} ${borderColor}`
                        };
                        statusText = <span className="text-[10px] font-semibold mt-1">{statusLabel}</span>;
                    } else if (!isFuture) {
                         cellProps = {
                            key: dateStr,
                            title: `${dateStr}: No Record`,
                            className: `flex flex-col items-center justify-center border rounded-lg py-2 px-1 min-h-[60px] font-semibold bg-gray-50 border-gray-200`
                        };
                        statusText = null;
                    }

                    cells.push(
                        <div {...cellProps}>
                            {dayText}
                            {statusText}
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
                >&times;</button>
                <h3 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
                  <span className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-base font-semibold">{sandwichLeaveCount}</span>
                  Sandwich Leave Details - {new Date(`${selectedMonth}-02`).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Sandwich Leave:</strong> When a holiday falls between two approved leave days, the holiday is counted as a sandwich leave day.
                  </p>
                </div>
                {sandwichLeaveDates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-gray-600 text-center">No sandwich leave found for this month.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ul className="space-y-3">
                      {sandwichLeaveDates.map((date, idx) => {
                        const holidayInfo = getHolidayByDate ? getHolidayByDate(date) : null;
                        return (
                          <li key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-blue-700">
                                  {holidayInfo ? holidayInfo.name : 'Holiday'} on {new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">
                                Sandwich Leave
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
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