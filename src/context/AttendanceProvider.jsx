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
          let punchIn = "";
          let punchOut = "";
          let workHours = 0;
          let workedHours = 0;
          let idleTime = 0;
          
          // Check if it's Sunday (holiday)
          if (dayOfWeek === 0) {
            status = "Leave"; // Sunday is holiday
          }
          // Check if it's a public holiday
          else if (holidays.includes(dateStr)) {
            status = "Leave";
          }
          // Check if employee has approved leave on this date
          else {
            const employeeLeave = leaveRequests.find(leave =>
              leave.employeeId === emp.employeeId &&
              leave.status === "Approved" &&
              isDateInLeaveRange(dateStr, leave.from, leave.to)
            );
            if (employeeLeave) {
              status = "Leave";
            }
            // Add some random absences (2-3% chance)
            else if (Math.random() < 0.025) {
              status = "Absent";
            }
            // Saturday has 50% chance of being present (half day or optional)
            else if (dayOfWeek === 6 && Math.random() < 0.5) {
              status = "Leave";
            }
          }
          
          // Generate punch times and work hours for present days
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
            punchIn,
            punchOut,
            workHours,
            workedHours,
            idleTime,
          });
        }
      }
    }
    
    // The sandwich leave logic is now handled automatically through the leave requests
    // and holiday data - no need for hardcoded scenarios
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
    // Check if attendance already exists for this employee on this date
    const existingRecord = attendanceRecords.find(
      (existing) => existing.employeeId === record.employeeId && existing.date === record.date
    );

    if (existingRecord) {
      // Update existing record instead of creating a new one
      setAttendanceRecords((prev) =>
        prev.map((rec) =>
          rec.employeeId === record.employeeId && rec.date === record.date
            ? { ...rec, ...record }
            : rec
        )
      );
      return { success: true, message: "Attendance updated successfully!" };
    } else {
      // Create new attendance record with unique ID
      const newId = `${record.employeeId}-${record.date}`;
      const newRecord = {
        id: newId,
        ...record,
        punchIn: record.status === "Present" ? "09:00" : "",
        punchOut: record.status === "Present" ? "18:00" : "",
        workHours: record.status === "Present" ? 9 : 0,
        workedHours: record.status === "Present" ? 8.5 : 0,
        idleTime: record.status === "Present" ? 0.5 : 0,
      };
      setAttendanceRecords([...attendanceRecords, newRecord]);
      return { success: true, message: "Attendance marked successfully!" };
    }
  };

  const editAttendance = (id, updatedRecord) => {
    setAttendanceRecords((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, ...updatedRecord } : rec))
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
