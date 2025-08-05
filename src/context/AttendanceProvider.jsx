import { useState, useMemo, useContext } from "react";
import { AttendanceContext } from "./AttendanceContext";
import { getSandwichLeaveDates, getSandwichLeaveCount, getSandwichLeaveDetails } from "../lib/utils";
import { EmployeeContext } from "./EmployeeContext";
import { LeaveRequestContext } from "./LeaveRequestContext";
import { HolidayCalendarContext } from "./HolidayCalendarContext";

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

    // Helper function to generate random punch times with some variation
    const generatePunchTimes = () => {
      const punchInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
      const punchInMinute = Math.floor(Math.random() * 60);
      const punchOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
      const punchOutMinute = Math.floor(Math.random() * 60);
      
      const punchIn = `${String(punchInHour).padStart(2, "0")}:${String(punchInMinute).padStart(2, "0")}`;
      const punchOut = `${String(punchOutHour).padStart(2, "0")}:${String(punchOutMinute).padStart(2, "0")}`;
      
      // Calculate work hours
      const punchInTime = punchInHour + punchInMinute / 60;
      const punchOutTime = punchOutHour + punchOutMinute / 60;
      const workHours = punchOutTime - punchInTime;
      const workedHours = workHours - 1; // Subtract 1 hour for lunch
      const idleTime = Math.random() * 0.5; // Random idle time up to 30 minutes
      
      return {
        punchIn,
        punchOut,
        workHours: Math.round(workHours * 100) / 100,
        workedHours: Math.round((workedHours - idleTime) * 100) / 100,
        idleTime: Math.round(idleTime * 100) / 100,
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
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayOfWeek = getDayOfWeek(dateStr);
          let status = "Present";
          let statusType = "working_day"; // working_day, holiday, approved_leave, absent
          let punchIn = "";
          let punchOut = "";
          let workHours = 0;
          let workedHours = 0;
          let idleTime = 0;
          
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
            const punchData = generatePunchTimes();
            punchIn = punchData.punchIn;
            punchOut = punchData.punchOut;
            workHours = punchData.workHours;
            workedHours = punchData.workedHours;
            idleTime = punchData.idleTime;
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

  // Get data from contexts with fallbacks
  const employees = employeeContext?.employees || [];
  const leaveRequests = leaveRequestContext?.leaveRequests || [];
  const holidays = holidayContext?.getHolidayDates?.() || [];

  // Memoized attendance data generation
  const initialAttendanceData = useMemo(() => {
    if (employees.length > 0) {
      return generateMonthlyAttendanceData(employees, holidays, leaveRequests);
    }
    return [];
  }, [employees, holidays, leaveRequests]);

  const [attendanceRecords, setAttendanceRecords] = useState(initialAttendanceData);

  // Efficient sandwich leave calculation for any employee
  // Returns array of sandwich leave dates for the given employeeId
  const getSandwichLeaveDatesByEmployee = (employeeId) => {
    // 1. Get all approved leave requests for this employee from context
    const approvedLeaves = leaveRequests
      .filter(lr => lr.employeeId === employeeId && lr.status === "Approved")
      .flatMap(lr => expandLeaveRange(lr.from, lr.to));
    // 2. Use utility to get sandwich leave dates
    return getSandwichLeaveDates(approvedLeaves, holidays);
  };

  // Get sandwich leave count for any employee
  const getSandwichLeaveCountByEmployee = (employeeId) => {
    const approvedLeaves = leaveRequests
      .filter(lr => lr.employeeId === employeeId && lr.status === "Approved")
      .flatMap(lr => expandLeaveRange(lr.from, lr.to));
    return getSandwichLeaveCount(approvedLeaves, holidays);
  };

  // Get detailed sandwich leave information for any employee
  const getSandwichLeaveDetailsByEmployee = (employeeId) => {
    const approvedLeaves = leaveRequests
      .filter(lr => lr.employeeId === employeeId && lr.status === "Approved")
      .flatMap(lr => expandLeaveRange(lr.from, lr.to));
    return getSandwichLeaveDetails(approvedLeaves, holidays);
  };

  // Get sandwich leave summary for all employees
  const getAllEmployeesSandwichLeaveSummary = () => {
    const summary = {};
    employees.forEach(emp => {
      const details = getSandwichLeaveDetailsByEmployee(emp.employeeId);
      summary[emp.employeeId] = {
        employeeId: emp.employeeId,
        name: emp.name,
        department: emp.department,
        sandwichLeaveCount: details.count,
        sandwichLeaveDates: details.dates,
        sandwichLeaveDetails: details.details
      };
    });
    return summary;
  };

  // Get sandwich leave summary for a specific month
  const getSandwichLeaveSummaryForMonth = (monthStr) => {
    const summary = {};
    employees.forEach(emp => {
      const details = getSandwichLeaveDetailsByEmployee(emp.employeeId);
      // Filter sandwich leaves for the specific month
      const monthSandwichLeaves = details.details.filter(detail =>
        detail.holidayDate.startsWith(monthStr)
      );
      
      if (monthSandwichLeaves.length > 0) {
        summary[emp.employeeId] = {
          employeeId: emp.employeeId,
          name: emp.name,
          department: emp.department,
          sandwichLeaveCount: monthSandwichLeaves.length,
          sandwichLeaveDetails: monthSandwichLeaves
        };
      }
    });
    return summary;
  };

  const addAttendance = (record) => {
    // Validate that Sundays and holidays cannot be marked as Leave
    const dayOfWeek = getDayOfWeek(record.date);
    const isPublicHoliday = holidays.includes(record.date);
    
    // Prevent marking Sundays as Leave
    if (dayOfWeek === 0 && record.status === "Leave") {
      return { success: false, message: "Cannot mark Sunday as Leave. Sundays are automatically holidays." };
    }
    
    // Prevent marking public holidays as Leave
    if (isPublicHoliday && record.status === "Leave") {
      return { success: false, message: "Cannot mark public holiday as Leave. This date is already a holiday." };
    }
    
    // Auto-correct status for Sundays and holidays
    let finalRecord = { ...record };
    if (dayOfWeek === 0 || isPublicHoliday) {
      finalRecord.status = "Holiday";
      finalRecord.statusType = "holiday";
      finalRecord.punchIn = "";
      finalRecord.punchOut = "";
      finalRecord.workHours = 0;
      finalRecord.workedHours = 0;
      finalRecord.idleTime = 0;
    }

    // Check if attendance already exists for this employee on this date
    const existingRecord = attendanceRecords.find(
      (existing) => existing.employeeId === finalRecord.employeeId && existing.date === finalRecord.date
    );

    if (existingRecord) {
      // Update existing record instead of creating a new one
      setAttendanceRecords((prev) =>
        prev.map((rec) =>
          rec.employeeId === finalRecord.employeeId && rec.date === finalRecord.date
            ? { ...rec, ...finalRecord }
            : rec
        )
      );
      return { success: true, message: "Attendance updated successfully!" };
    } else {
      // Create new attendance record with unique ID
      const newId = `${finalRecord.employeeId}-${finalRecord.date}`;
      const newRecord = {
        id: newId,
        ...finalRecord,
        punchIn: finalRecord.status === "Present" ? "09:00" : "",
        punchOut: finalRecord.status === "Present" ? "18:00" : "",
        workHours: finalRecord.status === "Present" ? 9 : 0,
        workedHours: finalRecord.status === "Present" ? 8.5 : 0,
        idleTime: finalRecord.status === "Present" ? 0.5 : 0,
      };
      setAttendanceRecords([...attendanceRecords, newRecord]);
      return { success: true, message: "Attendance marked successfully!" };
    }
  };

  const editAttendance = (id, updatedRecord) => {
    setAttendanceRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === id) {
          // Validate that Sundays and holidays cannot be marked as Leave
          const dayOfWeek = getDayOfWeek(rec.date);
          const isPublicHoliday = holidays.includes(rec.date);
          
          let finalRecord = { ...rec, ...updatedRecord };
          
          // Auto-correct status for Sundays and holidays
          if (dayOfWeek === 0 || isPublicHoliday) {
            finalRecord.status = "Holiday";
            finalRecord.statusType = "holiday";
            finalRecord.punchIn = "";
            finalRecord.punchOut = "";
            finalRecord.workHours = 0;
            finalRecord.workedHours = 0;
            finalRecord.idleTime = 0;
          }
          
          return finalRecord;
        }
        return rec;
      })
    );
  };

  const deleteAttendance = (id) => {
    setAttendanceRecords((prev) => prev.filter((rec) => rec.id !== id));
  };

  return (
    <AttendanceContext.Provider
      value={{
        attendanceRecords,
        addAttendance,
        editAttendance,
        deleteAttendance,
        getSandwichLeaveDatesByEmployee, // Expose sandwich leave utility
        getSandwichLeaveCountByEmployee, // Expose sandwich leave count
        getSandwichLeaveDetailsByEmployee, // Expose detailed sandwich leave info
        getAllEmployeesSandwichLeaveSummary, // Expose all employees sandwich leave summary
        getSandwichLeaveSummaryForMonth, // Expose monthly sandwich leave summary
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}
