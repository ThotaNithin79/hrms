import { useState, useEffect, useMemo, useCallback } from "react";
import { AttendanceContext } from "./AttendanceContext";

// --- Mock Backend Data ---
// This data is now aligned with the employee IDs and names from EmployeeProvider.jsx to ensure consistency.

/**
 * Simulates the `attendance` table.
 */
const mockDailyAttendance = [
  // --- Data for Alice Johnson (EMP102) ---
  // September 2025
  { id: 1, employeeId: "EMP102", name: "Alice Johnson", date: "2025-09-05", status: "Present", isHalfDay: false, punchIn: "09:30", punchOut: "18:30", workHours: 9.0, workedHours: 8.5, idleTime: 0.5 },
  { id: 2, employeeId: "EMP102", name: "Alice Johnson", date: "2025-09-04", status: "Present", isHalfDay: true, punchIn: "13:00", punchOut: "18:30", workHours: 5.5, workedHours: 4.5, idleTime: 1.0 },
  { id: 3, employeeId: "EMP102", name: "Alice Johnson", date: "2025-09-03", status: "Leave", isHalfDay: false, punchIn: null, punchOut: null, workHours: 0, workedHours: 0, idleTime: 0 },
  { id: 4, employeeId: "EMP102", name: "Alice Johnson", date: "2025-09-02", status: "Present", isHalfDay: false, punchIn: "09:35", punchOut: "18:30", workHours: 8.9, workedHours: 8.4, idleTime: 0.5 },
  { id: 5, employeeId: "EMP102", name: "Alice Johnson", date: "2025-09-01", status: "Holiday", isHalfDay: false, punchIn: null, punchOut: null, workHours: 0, workedHours: 0, idleTime: 0 },
  // August 2025
  { id: 11, employeeId: "EMP102", name: "Alice Johnson", date: "2025-08-29", status: "Present", isHalfDay: false, punchIn: "09:25", punchOut: "18:30", workHours: 9.1, workedHours: 8.6, idleTime: 0.5 },
  { id: 16, employeeId: "EMP102", name: "Alice Johnson", date: "2025-08-28", status: "Absent", isHalfDay: false, punchIn: null, punchOut: null, workHours: 0, workedHours: 0, idleTime: 0 },

  // --- Data for John Doe (EMP101) ---
  // September 2025
  { id: 6, employeeId: "EMP101", name: "John Doe", date: "2025-09-05", status: "Absent", isHalfDay: false, punchIn: null, punchOut: null, workHours: 0, workedHours: 0, idleTime: 0 },
  { id: 7, employeeId: "EMP101", name: "John Doe", date: "2025-09-04", status: "Present", isHalfDay: false, punchIn: "09:30", punchOut: "18:30", workHours: 9.0, workedHours: 8.5, idleTime: 0.5 },
  { id: 8, employeeId: "EMP101", name: "John Doe", date: "2025-09-03", status: "Present", isHalfDay: false, punchIn: "10:00", punchOut: "18:30", workHours: 8.5, workedHours: 8.0, idleTime: 0.5 },
  // August 2025
  { id: 12, employeeId: "EMP101", name: "John Doe", date: "2025-08-28", status: "Leave", isHalfDay: false, punchIn: null, punchOut: null, workHours: 0, workedHours: 0, idleTime: 0 },

  // --- Data for a non-existent/inactive employee (preserves test case) ---
  { id: 9, employeeId: "103", name: "Charlie Brown", date: "2025-09-05", status: "Absent", isHalfDay: false, punchIn: null, punchOut: null, workHours: 0, workedHours: 0, idleTime: 0 },
  { id: 10, employeeId: "103", name: "Charlie Brown", date: "2025-09-04", status: "Absent", isHalfDay: false, punchIn: null, punchOut: null, workHours: 0, workedHours: 0, idleTime: 0 },
  
  // --- Data for Priya Sharma (EMP104) ---
  { id: 13, employeeId: "EMP104", name: "Priya Sharma", date: "2025-09-05", status: "Present", isHalfDay: false, punchIn: "09:20", punchOut: "18:30", workHours: 9.2, workedHours: 8.7, idleTime: 0.5 },
  { id: 14, employeeId: "EMP104", name: "Priya Sharma", date: "2025-09-04", status: "Present", isHalfDay: false, punchIn: "09:30", punchOut: "18:30", workHours: 9.0, workedHours: 8.5, idleTime: 0.5 },
  { id: 15, employeeId: "EMP104", name: "Priya Sharma", date: "2025-08-27", status: "Holiday", isHalfDay: false, punchIn: null, punchOut: null, workHours: 0, workedHours: 0, idleTime: 0 },
];

/**
 * Simulates the `monthly_attendance_statistics` table.
 */
const mockMonthlyStatistics = [
  // Alice Johnson (EMP102) - September 2025
  { id: 1, employee_id: "EMP102", month: 9, year: 2025, total_working_days: 22, present_days: 2, absent_days: 0, half_days: 1, late_logins: 1, ot_days: 0, paid_leave_count: 1.0, unpaid_leave_count: 0.0 },
  // Alice Johnson (EMP102) - August 2025
  { id: 2, employee_id: "EMP102", month: 8, year: 2025, total_working_days: 21, present_days: 20, absent_days: 1, half_days: 2, late_logins: 4, ot_days: 2, paid_leave_count: 0.0, unpaid_leave_count: 1.0 },
  // John Doe (EMP101) - September 2025
  { id: 3, employee_id: "EMP101", month: 9, year: 2025, total_working_days: 22, present_days: 2, absent_days: 1, half_days: 0, late_logins: 1, ot_days: 0, paid_leave_count: 0.0, unpaid_leave_count: 0.0 },
  // John Doe (EMP101) - August 2025
  { id: 4, employee_id: "EMP101", month: 8, year: 2025, total_working_days: 21, present_days: 18, absent_days: 0, half_days: 0, late_logins: 8, ot_days: 0, paid_leave_count: 3.0, unpaid_leave_count: 0.0 },
];


export const AttendanceProvider = ({ children }) => {
  // State for both daily records and monthly statistics
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);

  // Simulate fetching all data from a backend API on component mount
  useEffect(() => {
    // In a real application, these would be separate API calls.
    setAttendanceRecords(mockDailyAttendance);
    setMonthlyStats(mockMonthlyStatistics);
  }, []); // Empty dependency array ensures this runs only once

  /**
   * A helper function to easily retrieve the pre-calculated statistics for a specific employee and month.
   */
  const getEmployeeMonthlyStats = useCallback((employeeId, yearMonth) => {
    if (!yearMonth) return null;
    const [year, month] = yearMonth.split('-').map(Number);
    return monthlyStats.find(
      (stat) => String(stat.employee_id) === String(employeeId) && stat.year === year && stat.month === month
    );
  }, [monthlyStats]);

  // Memoize the context value to prevent unnecessary re-renders in child components.
  const attendanceContextValue = useMemo(() => ({
    attendanceRecords, // The raw daily records for general use
    getEmployeeMonthlyStats, // The efficient helper for the profile page
  }), [attendanceRecords, getEmployeeMonthlyStats]);

  return (
    <AttendanceContext.Provider value={attendanceContextValue}>
      {children}
    </AttendanceContext.Provider>
  );
};