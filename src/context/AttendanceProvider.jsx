import { useState } from "react";
import { AttendanceContext } from "./AttendanceContext";

export const AttendanceProvider = ({ children }) => {
  // Generate attendance data for the entire month of July 2025
  const generateMonthlyAttendanceData = () => {
    const data = [];
    const employees = [
      { id: "EMP101", name: "John Doe" },
      { id: "EMP102", name: "Alice Johnson" },
      { id: "EMP103", name: "Michael Smith" },
      { id: "EMP104", name: "Priya Sharma" },
      { id: "EMP105", name: "Amit Kumar" },
      { id: "EMP106", name: "Sara Lee" },
      { id: "EMP107", name: "Rohan Mehta" },
      { id: "EMP108", name: "Anjali Nair" },
      { id: "EMP109", name: "David Wilson" },
      { id: "EMP110", name: "Meera Raj" },
    ];

    let recordId = 1;

    // Generate data for each day in July 2025 (31 days)
    for (let day = 1; day <= 31; day++) {
      const date = `2025-07-${day.toString().padStart(2, '0')}`;
      
      employees.forEach((emp) => {
        // Skip weekends (Saturdays and Sundays)
        const dayOfWeek = new Date(date).getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) return;

        let status;
        // Generate realistic attendance patterns
        const random = Math.random();
        if (random < 0.8) {
          status = "Present";
        } else if (random < 0.9) {
          status = "Absent";
        } else {
          status = "Leave";
        }

        // Add some specific patterns for variety
        if (emp.id === "EMP106" && day >= 10 && day <= 12) status = "Leave"; // Sara on leave
        if (emp.id === "EMP103" && day === 5) status = "Absent"; // Michael absent on 5th
        if (emp.id === "EMP104" && day >= 20 && day <= 22) status = "Leave"; // Priya on leave

        data.push({
          id: recordId++,
          employeeId: emp.id,
          name: emp.name,
          date: date,
          status: status,
        });
      });
    }

    return data;
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
