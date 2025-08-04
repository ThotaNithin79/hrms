import { useState } from "react";
import { AttendanceContext } from "./AttendanceContext";

export const AttendanceProvider = ({ children }) => {

  // Generates demo attendance data for all employees considering holidays, leave requests, and realistic patterns
  const generateMonthlyAttendanceData = () => {
    // All employees from LeaveRequestProvider
    const employees = [
      { employeeId: "EMP101", name: "John Doe" },
      { employeeId: "EMP102", name: "Jane Smith" },
      { employeeId: "EMP103", name: "Michael Smith" },
      { employeeId: "EMP104", name: "Priya Sharma" },
      { employeeId: "EMP105", name: "Amit Kumar" },
      { employeeId: "EMP106", name: "Sara Lee" },
      { employeeId: "EMP107", name: "Rohan Mehta" },
      { employeeId: "EMP108", name: "Anjali Nair" },
      { employeeId: "EMP109", name: "David Wilson" },
      { employeeId: "EMP110", name: "Meera Raj" },
    ];

    // Public holidays from HolidayCalendarProvider
    const publicHolidays = [
      "2025-01-01", // New Year's Day
      "2025-01-26", // Republic Day
      "2025-02-26", // Maha Shivaratri
      "2025-03-14", // Holi
      "2025-04-14", // Ambedkar Jayanti
      "2025-04-18", // Good Friday
      "2025-05-01", // May Day
      "2025-06-06", // Bakrid / Eid al-Adha
      "2025-07-13", // Special holiday for sandwich leave testing
      "2025-08-15", // Independence Day
      "2025-08-18", // Raksha Bandhan
      "2025-08-25", // Janmashtami
      "2025-10-02", // Gandhi Jayanti & Dussehra
      "2025-10-20", // Diwali
      "2025-12-25", // Christmas
    ];

    // Leave requests data (from LeaveRequestProvider)
    const leaveRequests = [
      { employeeId: "EMP101", from: "2025-07-10", to: "2025-07-15", status: "Approved" },
      { employeeId: "EMP102", from: "2025-07-12", to: "2025-07-14", status: "Pending" },
      { employeeId: "EMP103", from: "2025-07-20", to: "2025-07-22", status: "Rejected" },
      { employeeId: "EMP104", from: "2025-07-18", to: "2025-07-20", status: "Approved" },
      { employeeId: "EMP105", from: "2025-07-25", to: "2025-07-28", status: "Pending" },
      { employeeId: "EMP106", from: "2025-07-15", to: "2025-07-16", status: "Approved" },
      { employeeId: "EMP107", from: "2025-07-22", to: "2025-07-24", status: "Approved" },
      { employeeId: "EMP108", from: "2025-07-17", to: "2025-07-18", status: "Rejected" },
      { employeeId: "EMP109", from: "2025-07-21", to: "2025-07-23", status: "Pending" },
      { employeeId: "EMP110", from: "2025-07-14", to: "2025-07-15", status: "Approved" },
    ];

    // Helper function to check if date is in leave range
    const isDateInLeaveRange = (dateStr, fromDate, toDate) => {
      const date = new Date(dateStr);
      const from = new Date(fromDate);
      const to = new Date(toDate);
      return date >= from && date <= to;
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
          else if (publicHolidays.includes(dateStr)) {
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

    // Add some sandwich leave scenarios for testing
    // EMP101: Saturday (July 12), Sunday (July 13 - public holiday), Monday (July 14)
    const sandwichLeaveRecords = [
      { employeeId: "EMP101", date: "2025-07-12", status: "Leave" }, // Saturday
      { employeeId: "EMP101", date: "2025-07-13", status: "Leave" }, // Sunday (public holiday)
      { employeeId: "EMP101", date: "2025-07-14", status: "Leave" }, // Monday
    ];

    // Update records with sandwich leave scenario
    sandwichLeaveRecords.forEach(sandwichRecord => {
      const existingRecordIndex = records.findIndex(record => 
        record.employeeId === sandwichRecord.employeeId && 
        record.date === sandwichRecord.date
      );
      
      if (existingRecordIndex !== -1) {
        records[existingRecordIndex] = {
          ...records[existingRecordIndex],
          status: sandwichRecord.status,
          punchIn: "",
          punchOut: "",
          workHours: 0,
          workedHours: 0,
          idleTime: 0,
        };
      }
    });

    return records;
  };

  const [attendanceRecords, setAttendanceRecords] = useState(generateMonthlyAttendanceData());

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
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};
