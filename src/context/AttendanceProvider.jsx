import { useState } from "react";
import { AttendanceContext } from "./AttendanceContext";

export const AttendanceProvider = ({ children }) => {

  // Generates demo attendance data for all employees for the current month
  const generateMonthlyAttendanceData = () => {
    // For demo: generate attendance for EMP101 and EMP102 for current month
    const employees = [
      { employeeId: "EMP101", name: "John Doe" },
      { employeeId: "EMP102", name: "Jane Smith" },
    ];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const records = [];
    for (const emp of employees) {
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        // Randomize status for demo
        let status = "Present";
        if (day % 7 === 0) status = "Leave";
        if (day % 11 === 0) status = "Absent";
        records.push({
          id: `${emp.employeeId}-${dateStr}`,
          employeeId: emp.employeeId,
          name: emp.name,
          date: dateStr,
          status,
          punchIn: status === "Present" ? "09:00" : "",
          punchOut: status === "Present" ? "18:00" : "",
          workHours: status === "Present" ? 9 : 0,
          workedHours: status === "Present" ? 8.5 : 0,
          idleTime: status === "Present" ? 0.5 : 0,
        });
      }
    }
    return records;
  };

  const [attendanceRecords, setAttendanceRecords] = useState(generateMonthlyAttendanceData());

  const addAttendance = (record) => {
    const newId = attendanceRecords.length + 1;
    setAttendanceRecords([...attendanceRecords, { id: newId, ...record }]);
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
