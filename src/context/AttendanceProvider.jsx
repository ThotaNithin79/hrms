import { useState } from "react";
import { AttendanceContext } from "./AttendanceContext";

export const AttendanceProvider = ({ children }) => {
  // Generate attendance data for the entire month of July 2025
  // Import leave requests for consistency
  const leaveRequests = [
    {
      id: 1,
      employeeId: "EMP101",
      from: "2025-07-10",
      to: "2025-07-15",
      status: "Approved",
    },
    {
      id: 2,
      employeeId: "EMP102",
      from: "2025-07-12",
      to: "2025-07-14",
      status: "Pending",
    },
    {
      id: 3,
      employeeId: "EMP103",
      from: "2025-07-20",
      to: "2025-07-22",
      status: "Rejected",
    },
    {
      id: 4,
      employeeId: "EMP104",
      from: "2025-07-18",
      to: "2025-07-20",
      status: "Approved",
    },
    {
      id: 5,
      employeeId: "EMP105",
      from: "2025-07-25",
      to: "2025-07-28",
      status: "Pending",
    },
    {
      id: 6,
      employeeId: "EMP106",
      from: "2025-07-15",
      to: "2025-07-16",
      status: "Approved",
    },
    {
      id: 7,
      employeeId: "EMP107",
      from: "2025-07-22",
      to: "2025-07-24",
      status: "Approved",
    },
    {
      id: 8,
      employeeId: "EMP108",
      from: "2025-07-17",
      to: "2025-07-18",
      status: "Rejected",
    },
    {
      id: 9,
      employeeId: "EMP109",
      from: "2025-07-21",
      to: "2025-07-23",
      status: "Pending",
    },
    {
      id: 10,
      employeeId: "EMP110",
      from: "2025-07-14",
      to: "2025-07-15",
      status: "Approved",
    },
    // Sandwich leave test case for EMP101
    {
      id: 11,
      employeeId: "EMP101",
      from: "2025-07-12",
      to: "2025-07-14",
      status: "Approved",
    },
  ];

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
        let status;
        // For EMP101, set leave on 2025-07-12 (Sat), 2025-07-13 (Sun), 2025-07-14 (Mon)
        if (
          emp.id === "EMP101" &&
          ["2025-07-12", "2025-07-13", "2025-07-14"].includes(date)
        ) {
          status = "Leave";
        } else {
          // Only skip Sundays (dayOfWeek === 0)
          const dayOfWeek = new Date(date).getDay();
          if (dayOfWeek === 0) return;
          // Check if this day is covered by an approved or pending leave request
          const leaveForDay = leaveRequests.find(lr =>
            lr.employeeId === emp.id &&
            (lr.status === "Approved" || lr.status === "Pending") &&
            date >= lr.from && date <= lr.to
          );
          if (leaveForDay) {
            status = "Leave";
          } else {
            // Generate realistic attendance patterns for non-leave days
            const random = Math.random();
            if (random < 0.8) {
              status = "Present";
            } else {
              status = "Absent";
            }
          }
        }
        // Generate punch-in, punch-out, work hours, worked hours, idle time for Present
        let punchIn = null;
        let punchOut = null;
        let workHours = null;
        let workedHours = null;
        let idleTime = null;
        if (status === "Present") {
          // Random punch-in between 8:00 and 10:00
          const punchInHour = 8 + Math.floor(Math.random() * 3); // 8, 9, or 10
          const punchInMin = Math.floor(Math.random() * 60);
          punchIn = `${punchInHour.toString().padStart(2, "0")}:${punchInMin.toString().padStart(2, "0")}`;
          // Random punch-out between 17:00 and 19:00
          const punchOutHour = 17 + Math.floor(Math.random() * 3); // 17, 18, or 19
          const punchOutMin = Math.floor(Math.random() * 60);
          punchOut = `${punchOutHour.toString().padStart(2, "0")}:${punchOutMin.toString().padStart(2, "0")}`;
          // Calculate worked hours
          const punchInDate = new Date(`${date}T${punchIn}:00`);
          const punchOutDate = new Date(`${date}T${punchOut}:00`);
          workedHours = Math.max(0, ((punchOutDate - punchInDate) / (1000 * 60 * 60)));
          // Round to nearest 0.25 hour
          workedHours = Math.round(workedHours * 4) / 4;
          workHours = 8;
          idleTime = Math.max(0, workHours - workedHours);
        }
        data.push({
          id: recordId++,
          employeeId: emp.id,
          name: emp.name,
          date: date,
          status: status,
          punchIn,
          punchOut,
          workHours,
          workedHours,
          idleTime,
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
