// src/pages/EmployeesOnLeaveToday.jsx
import { useContext } from "react";
import { AttendanceContext } from "../context/AttendanceContext";
import { EmployeeContext } from "../context/EmployeeContext";

const EmployeesOnLeaveToday = () => {
  const { attendanceRecords } = useContext(AttendanceContext);
  const { employees } = useContext(EmployeeContext);

  const today = new Date().toISOString().split("T")[0];

  const onLeaveToday = attendanceRecords
    .filter((record) => record.date === today && record.status === "Leave")
    .map((record) => {
      const emp = employees.find((e) => e.id === record.employeeId);
      return {
        id: record.employeeId,
        name: emp?.name || "Unknown",
        department: emp?.department || "N/A",
      };
    });

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Employees on Leave Today</h2>

      {onLeaveToday.length === 0 ? (
        <p className="text-gray-500">No employees are on leave today.</p>
      ) : (
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Department</th>
            </tr>
          </thead>
          <tbody>
            {onLeaveToday.map((emp) => (
              <tr key={emp.id} className="border-t">
                <td className="p-4">{emp.id}</td>
                <td className="p-4">{emp.name}</td>
                <td className="p-4">{emp.department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default EmployeesOnLeaveToday;
