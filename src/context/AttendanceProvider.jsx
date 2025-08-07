import { useState, useMemo, useContext, useCallback } from "react";
import { AttendanceContext } from "./AttendanceContext";
import { EmployeeContext } from "./EmployeeContext";
import { LeaveRequestContext } from "./LeaveRequestContext";
import { HolidayCalendarContext } from "./HolidayCalendarContext";
import { getSandwichLeaveDates, getSandwichLeaveCount, getSandwichLeaveDetails } from "../lib/utils";

// Add this helper function above your AttendanceProvider component
const filterRecordsUpToToday = (records) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  return records.filter(rec => rec.date <= todayStr);
};

export const AttendanceProvider = ({ children }) => {
  // Helper: check if a date is in a leave range (inclusive)
  const isDateInLeaveRange = (dateStr, fromDate, toDate) => {
    const date = new Date(dateStr);
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return date >= from && date <= to;
  };

  // Helper: expand a leave range to an array of dates (YYYY-MM-DD)
  const expandLeaveRange = (from, to) => {
    const dates = [];
    let current = new Date(from);
    const end = new Date(to);
    while (current <= end) {
      dates.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

    // Helper function to get day of week (0=Sunday, 6=Saturday)
    const getDayOfWeek = (dateStr) => new Date(dateStr).getDay();

const FIXED_PUNCH_IN = "09:30";
const FIXED_PUNCH_OUT = "18:30";

const generatePunchTimes = (dateStr, lateCount) => {
  let punchIn = FIXED_PUNCH_IN;
  let punchOut = FIXED_PUNCH_OUT;
  let isHalfDay = false;
  if (dateStr < new Date().toISOString().slice(0, 10)) {
    const lateMinutes = Math.floor(Math.random() * 360); // up to 6 hours late
    punchIn = lateMinutes > 0
      ? `${String(9 + Math.floor(lateMinutes / 60)).padStart(2, "0")}:${String(30 + lateMinutes % 60).padStart(2, "0")}`
      : FIXED_PUNCH_IN;
    if (lateMinutes >= 300 || (lateCount > 0 && lateCount % 3 === 0)) {
      isHalfDay = true;
    }
  }
  return {
    punchIn,
    punchOut,
    workHours: 9,
    workedHours: isHalfDay ? 4.5 : 8.5,
    idleTime: 0.5,
    isHalfDay,
  };
};


  // Generate attendance for multiple months (current and previous months)
  const generateMonthlyAttendanceData = (employees, holidays, leaveRequests) => {
    const records = [];
    const currentDate = new Date();
    // Generate for current month and previous 2 months
    for (let monthOffset = -2; monthOffset <= 0; monthOffset++) {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      for (const emp of employees) {
        let latePunchCount = 0;
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayOfWeek = getDayOfWeek(dateStr);
          let status = "Present";
          let statusType = "working_day";
          let punchIn = "";
          let punchOut = "";
          let workHours = 0;
          let workedHours = 0;
          let idleTime = 0;
          let isHalfDay = false;

          // Priority 1: Check if it's Sunday (holiday)
          if (dayOfWeek === 0) {
            status = "Holiday";
            statusType = "holiday";
          }
          // Priority 2: Check if it's a public holiday
          else if (holidays.includes(dateStr)) {
            status = "Holiday";
            statusType = "holiday";
          }
          // Priority 3: Check if employee has approved leave on this date
          else {
            const employeeLeave = leaveRequests.find(leave =>
              leave.employeeId === emp.employeeId &&
              leave.status === "Approved" &&
              isDateInLeaveRange(dateStr, leave.from, leave.to)
            );
            if (employeeLeave) {
              status = "Leave";
              statusType = "approved_leave";
            }
            // Priority 4: For working days, determine if Present or Absent
            else {
              // Saturday has 70% chance of being present (working Saturday)
              if (dayOfWeek === 6) {
                if (Math.random() < 0.7) {
                  status = "Present";
                  statusType = "working_day";
                } else {
                  status = "Absent";
                  statusType = "absent";
                }
              }
              // Regular working days (Mon-Fri) - 5% chance of being absent
              else if (Math.random() < 0.05) {
                status = "Absent";
                statusType = "absent";
              }
              else {
                status = "Present";
                statusType = "working_day";
              }
            }
          }

          // Generate punch times and work hours only for present days
          if (status === "Present") {
            // Simulate late punch-in (0-6 hours late)
            const lateMinutes = Math.floor(Math.random() * 360); // up to 6 hours late
            punchIn = lateMinutes > 0
              ? `${String(9 + Math.floor(lateMinutes / 60)).padStart(2, "0")}:${String(30 + lateMinutes % 60).padStart(2, "0")}`
              : FIXED_PUNCH_IN;
            punchOut = FIXED_PUNCH_OUT;
            workHours = 9;
            workedHours = 8.5;
            idleTime = 0.5;

            // Half-day present rules
            if (lateMinutes >= 300) {
              isHalfDay = true;
              latePunchCount++;
            } else if (lateMinutes > 0) {
              latePunchCount++;
              if (latePunchCount % 3 === 0) {
                isHalfDay = true;
              }
            }
            if (isHalfDay) {
              workedHours = 4.5;
              workHours = 9;
              idleTime = 0.5;
            }
          }

          records.push({
            id: `${emp.employeeId}-${dateStr}`,
            employeeId: emp.employeeId,
            name: emp.name,
            date: dateStr,
            status,
            statusType,
            punchIn,
            punchOut,
            workHours,
            workedHours,
            idleTime,
            isHalfDay,
          });
        }
      }
    }
    
    return records;
  };



  // Use memoized data from contexts
  const employeeContext = useContext(EmployeeContext);
  const leaveRequestContext = useContext(LeaveRequestContext);
  const holidayContext = useContext(HolidayCalendarContext);

  const employees = employeeContext?.employees || [];
  const leaveRequests = leaveRequestContext?.leaveRequests || [];
  const holidays = holidayContext?.getHolidayDates?.() || [];

  // Memoized attendance data generation
  const initialAttendanceData = useMemo(() => {
    if (employees.length > 0) {
      const allRecords = generateMonthlyAttendanceData(employees, holidays, leaveRequests);
      return filterRecordsUpToToday(allRecords);
    }
    return [];
  }, [employees, holidays, leaveRequests]);

  const [attendanceRecords, setAttendanceRecords] = useState(initialAttendanceData);

  // Expose only necessary context values
  return (
    <AttendanceContext.Provider
      value={{
        attendanceRecords,
        // ...other essential utilities...
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};
