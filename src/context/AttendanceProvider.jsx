import React, { useState, useMemo, useCallback } from "react";
import { AttendanceContext } from "./AttendanceContext";

// --- Mock Backend Data ---
// This data simulates what you would receive from your database/API.

/**
 * NEW: This object simulates a rich, pre-processed API response for the Employee Attendance Profile page.
 * It contains everything the page needs in one structure, per employee, per month.
 * This is the "single source of truth" for the profile page.
 * The employeeId keys (e.g., "EMP101", "EMP102") should match your EmployeeProvider data.
 */
const employeeProfileData = {
  "EMP101": { // Data for John Doe
    "2025-09": {
      profile: { employeeId: "EMP101", employeeName: "John Doe" },
      monthlySummary: { present_days: 2, half_days: 0, absent_days: 1, on_leave_days: 0, holiday_days: 1 },
      workHoursSummary: { totalWorkHours: 17.5, totalWorkedHours: 16.5, totalIdleTime: 1.0 },
      leaveSummary: { applied: 0, approved: 0, rejected: 0, pending: 0 },
      sandwichLeave: { count: 0, dates: [] },
      dailyRecords: [
        { id: 6, date: "2025-09-05", status: "Absent", isHalfDay: false, punchIn: null, punchOut: null, workHours: 0, workedHours: 0, idleTime: 0 },
        { id: 7, date: "2025-09-04", status: "Present", isHalfDay: false, punchIn: "09:30", punchOut: "18:30", workHours: 9.0, workedHours: 8.5, idleTime: 0.5 },
        { id: 8, date: "2025-09-03", status: "Present", isHalfDay: false, punchIn: "10:00", punchOut: "18:30", workHours: 8.5, workedHours: 8.0, idleTime: 0.5 },
        // Assuming Sep 1st is a holiday for this employee too
        { id: 5, date: "2025-09-01", status: "Holiday", isHalfDay: false, punchIn: null, punchOut: null, workHours: 0, workedHours: 0, idleTime: 0 },
      ]
    },
    "2025-08": {
      profile: { employeeId: "EMP101", employeeName: "John Doe" },
      monthlySummary: { present_days: 18, half_days: 0, absent_days: 0, on_leave_days: 3, holiday_days: 0 },
      workHoursSummary: { totalWorkHours: 162.0, totalWorkedHours: 155.0, totalIdleTime: 7.0 }, // Example data
      leaveSummary: { applied: 1, approved: 1, rejected: 0, pending: 0 },
      sandwichLeave: { count: 1, dates: [{ date: "2025-08-10", name: "Weekend Holiday"}] },
      dailyRecords: [
        // Assume many present days here for brevity...
        { id: 12, date: "2025-08-28", status: "Leave", isHalfDay: false, punchIn: null, punchOut: null, workHours: 0, workedHours: 0, idleTime: 0 },
      ]
    }
  },
  "EMP102": { // Data for Alice Johnson
     "2025-09": {
      profile: { employeeId: "EMP102", employeeName: "Alice Johnson" },
      monthlySummary: { present_days: 2, half_days: 1, absent_days: 0, on_leave_days: 1, holiday_days: 1 },
      workHoursSummary: { totalWorkHours: 23.4, totalWorkedHours: 21.4, totalIdleTime: 2.0 },
      leaveSummary: { applied: 1, approved: 0, rejected: 0, pending: 1 },
      sandwichLeave: { count: 0, dates: [] },
      dailyRecords: [
        { id: 1, date: "2025-09-05", status: "Present", isHalfDay: false, punchIn: "09:30", punchOut: "18:30", workHours: 9.0, workedHours: 8.5, idleTime: 0.5 },
        { id: 2, date: "2025-09-04", status: "Present", isHalfDay: true, punchIn: "13:00", punchOut: "18:30", workHours: 5.5, workedHours: 4.5, idleTime: 1.0 },
        { id: 3, date: "2025-09-03", status: "Leave", isHalfDay: false, punchIn: null, punchOut: null, workHours: 0, workedHours: 0, idleTime: 0 },
        { id: 4, date: "2025-09-02", status: "Present", isHalfDay: false, punchIn: "09:35", punchOut: "18:30", workHours: 8.9, workedHours: 8.4, idleTime: 0.5 },
        { id: 5, date: "2025-09-01", status: "Holiday", isHalfDay: false, punchIn: null, punchOut: null, workHours: 0, workedHours: 0, idleTime: 0 },
      ]
    },
     "2025-08": {
      profile: { employeeId: "EMP102", employeeName: "Alice Johnson" },
      monthlySummary: { present_days: 1, half_days: 0, absent_days: 1, on_leave_days: 0, holiday_days: 0 },
      workHoursSummary: { totalWorkHours: 9.1, totalWorkedHours: 8.6, totalIdleTime: 0.5 },
      leaveSummary: { applied: 0, approved: 0, rejected: 0, pending: 0 },
      sandwichLeave: { count: 0, dates: [] },
      dailyRecords: [
        { id: 11, date: "2025-08-29", status: "Present", isHalfDay: false, punchIn: "09:25", punchOut: "18:30", workHours: 9.1, workedHours: 8.6, idleTime: 0.5 },
        { id: 16, date: "2025-08-28", status: "Absent", isHalfDay: false, punchIn: null, punchOut: null, workHours: 0, workedHours: 0, idleTime: 0 },
      ]
    }
  }
};

/**
 * PRESERVED FOR OTHER COMPONENTS: Simulates the raw `attendance` table.
 * Used by components that might need the raw, unfiltered daily log (like a main attendance dashboard).
 */
const mockDailyAttendance = [
  { id: 1, employeeId: "EMP102", name: "Alice Johnson", date: "2025-09-05", status: "Present", isHalfDay: false, punchIn: "09:30", punchOut: "18:30", workHours: 9.0, workedHours: 8.5, idleTime: 0.5 },
  { id: 2, employeeId: "EMP102", name: "Alice Johnson", date: "2025-09-04", status: "Present", isHalfDay: true, punchIn: "13:00", punchOut: "18:30", workHours: 5.5, workedHours: 4.5, idleTime: 1.0 },
  { id: 11, employeeId: "EMP102", name: "Alice Johnson", date: "2025-08-29", status: "Present", isHalfDay: false, punchIn: "09:25", punchOut: "18:30", workHours: 9.1, workedHours: 8.6, idleTime: 0.5 },
  { id: 16, employeeId: "EMP102", name: "Alice Johnson", date: "2025-08-28", status: "Absent", isHalfDay: false, punchIn: null, punchOut: null, workHours: 0, workedHours: 0, idleTime: 0 },
  { id: 6, employeeId: "EMP101", name: "John Doe", date: "2025-09-05", status: "Absent", isHalfDay: false, punchIn: null, punchOut: null, workHours: 0, workedHours: 0, idleTime: 0 },
  { id: 7, employeeId: "EMP101", name: "John Doe", date: "2025-09-04", status: "Present", isHalfDay: false, punchIn: "09:30", punchOut: "18:30", workHours: 9.0, workedHours: 8.5, idleTime: 0.5 },
];


export const AttendanceProvider = ({ children }) => {
  // PRESERVED STATE: For other components that might rely on the raw daily records.
  const [attendanceRecords] = useState(mockDailyAttendance);

  /**
   * NEW: This function simulates a backend API call to get the complete, processed
   * profile data for a specific employee and month.
   * @param {string} employeeId - The ID of the employee.
   * @param {string} yearMonth - The month in 'YYYY-MM' format.
   * @returns {object|null} The complete profile data object or null if not found.
   */
  const getEmployeeAttendanceProfile = useCallback((employeeId, yearMonth) => {
    // Navigate through the nested object to find the data.
    return employeeProfileData[employeeId]?.[yearMonth] || null;
  }, []);

  /**
   * NEW: A helper to get all available months for a specific employee from the processed data.
   */
  const getAvailableMonthsForEmployee = useCallback((employeeId) => {
    if (!employeeProfileData[employeeId]) {
      return [];
    }
    // Return the month keys (e.g., "2025-09", "2025-08") sorted from newest to oldest.
    return Object.keys(employeeProfileData[employeeId]).sort((a, b) => b.localeCompare(a));
  }, []);

  // Memoize the context value to prevent unnecessary re-renders.
  const contextValue = useMemo(() => ({
    // --- NEW FUNCTIONS FOR THE PROFILE PAGE ---
    getEmployeeAttendanceProfile,
    getAvailableMonthsForEmployee,

    // --- PRESERVED FOR OTHER COMPONENTS ---
    // The raw list of daily attendance records is still available for other parts of the app.
    attendanceRecords,
  }), [attendanceRecords, getEmployeeAttendanceProfile, getAvailableMonthsForEmployee]);

  return (
    <AttendanceContext.Provider value={contextValue}>
      {children}
    </AttendanceContext.Provider>
  );
};