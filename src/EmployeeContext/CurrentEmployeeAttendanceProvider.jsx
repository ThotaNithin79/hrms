import { useState } from "react";
import { CurrentEmployeeAttendanceContext } from "./CurrentEmployeeAttendanceContext";

const CurrentEmployeeAttendanceProvider = ({ children }) => {

  // Generates demo attendance data for all employees for the current month
  const generateMonthlyAttendanceData = () => {
    // For demo: generate attendance for EMP101 for current month
    const employees = [
      { employeeId: "EMP101", name: "John Doe" },
    ];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const records = [];
    let monthlyWorkHours = 0;
    let monthlyIdleHours = 0;
    for (const emp of employees) {
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        // Randomize status for demo
        let status = "Present";
        if (day % 7 === 0) status = "Leave";
        if (day % 11 === 0) status = "Absent";
        let workHours = status === "Present" ? 9 : 0;
        let workedHours = status === "Present" ? 8.5 : 0;
        let idleTime = status === "Present" ? 0.5 : 0;
        if (status === "Leave" || status === "Absent") {
          workHours = 0;
          workedHours = 0;
          idleTime = 0;
        }
        monthlyWorkHours += workedHours;
        monthlyIdleHours += idleTime;
        records.push({
          id: `${emp.employeeId}-${dateStr}`,
          employeeId: emp.employeeId,
          name: emp.name,
          date: dateStr,
          status,
          punchIn: status === "Present" ? "09:00" : "",
          punchOut: status === "Present" ? "18:00" : "",
          workHours,
          workedHours,
          idleTime,
        });
      }
    }
    return { records, monthlyWorkHours, monthlyIdleHours };
  };

  const { records, monthlyWorkHours, monthlyIdleHours } = generateMonthlyAttendanceData();

  const [attendanceRecords, setAttendanceRecords] = useState(records);

  // Provide monthly working and idle hours as context values
  return (
    <CurrentEmployeeAttendanceContext.Provider
      value={{
        attendanceRecords,
        monthlyWorkHours,
        monthlyIdleHours,
      }}
    >
      {children}
    </CurrentEmployeeAttendanceContext.Provider>
  );
}

export default CurrentEmployeeAttendanceProvider;
