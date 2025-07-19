import { useState } from "react";
import { AttendanceContext } from "./AttendanceContext";

export const AttendanceProvider = ({ children }) => {
  const [attendanceRecords, setAttendanceRecords] = useState([
    {
      id: 1,
      employeeId: "EMP001",
      name: "John Doe",
      date: "2025-07-16",
      status: "Present", // ✅ leave ended Jul 15
    },
    {
      id: 2,
      employeeId: "EMP002",
      name: "Alice Johnson",
      date: "2025-07-16",
      status: "Absent", // ✅ no approved leave, could be present/absent
    },
    {
      id: 3,
      employeeId: "EMP003",
      name: "Michael Smith",
      date: "2025-07-16",
      status: "Present",
    },
    {
      id: 4,
      employeeId: "EMP004",
      name: "Priya Sharma",
      date: "2025-07-16",
      status: "Present",
    },
    {
      id: 5,
      employeeId: "EMP005",
      name: "Amit Kumar",
      date: "2025-07-16",
      status: "Present", // ❌ previously "Leave" but no active leave now
    },
    {
      id: 6,
      employeeId: "EMP006",
      name: "Sara Lee",
      date: "2025-07-16",
      status: "Leave", // ✅ on leave Jul 15–16
    },
    {
      id: 7,
      employeeId: "EMP007",
      name: "Rohan Mehta",
      date: "2025-07-16",
      status: "Absent", // ✅ no leave, leave starts later
    },
    {
      id: 8,
      employeeId: "EMP008",
      name: "Anjali Nair",
      date: "2025-07-16",
      status: "Present", // ✅ leave rejected
    },
    {
      id: 9,
      employeeId: "EMP009",
      name: "David Wilson",
      date: "2025-07-16",
      status: "Present",
    },
    {
      id: 10,
      employeeId: "EMP010",
      name: "Meera Raj",
      date: "2025-07-16",
      status: "Present", // ❌ was "Leave" but leave ended Jul 15
    },
  ]);

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
