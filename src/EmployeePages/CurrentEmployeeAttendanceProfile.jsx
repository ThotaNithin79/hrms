import React from "react";
import { useNavigate } from "react-router-dom";

const CurrentEmployeeAttendanceProfile = () => {
  const { currentEmployeeAttendance } = useCurrentEmployeeAttendance();
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Go Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
      >
        ← Go Back
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">HRMS Admin</h1>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-700">
            {currentEmployeeAttendance?.name?.charAt(0) || "E"}
          </div>
          <p className="mt-2 font-semibold text-lg">
            {currentEmployeeAttendance?.name || "Employee"}
          </p>
          <p className="text-sm text-gray-600">
            ID: {currentEmployeeAttendance?.employeeId || "EMPXXX"}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-green-600 font-bold text-xl">Present</p>
          <p className="text-2xl font-bold">{currentEmployeeAttendance?.present || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-red-600 font-bold text-xl">Absent</p>
          <p className="text-2xl font-bold">{currentEmployeeAttendance?.absent || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-yellow-600 font-bold text-xl">On Leave</p>
          <p className="text-2xl font-bold">{currentEmployeeAttendance?.onLeave || 0}</p>
        </div>
      </div>

      {/* Work Hours Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold mb-2">Leaves Applied</p>
          <p>
            <span className="text-green-600">Approved: 1</span>{" "}
            <span className="text-red-600">Rejected: 0</span>{" "}
            <span className="text-yellow-600">Pending: 0</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">Sandwich Leaves: 0</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="font-semibold mb-2">Work Hours Summary</p>
          <p>Total Work Hours: <strong>{currentEmployeeAttendance?.totalWorkHours || 0}</strong></p>
          <p>Total Worked Hours: <strong>{currentEmployeeAttendance?.totalWorkedHours || 0}</strong></p>
          <p>Total Idle Time: <strong>{currentEmployeeAttendance?.totalIdleTime || 0}</strong></p>
        </div>
      </div>

      {/* Daily Attendance Table */}
      <div className="bg-white rounded shadow overflow-auto">
        <table className="min-w-full text-sm divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Punch In</th>
              <th className="px-4 py-2 text-left">Punch Out</th>
              <th className="px-4 py-2 text-left">Work Hours</th>
              <th className="px-4 py-2 text-left">Worked Hours</th>
              <th className="px-4 py-2 text-left">Idle Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentEmployeeAttendance?.dailyData?.map((day, index) => (
              <tr key={index}>
                <td className="px-4 py-2">{day.date}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      day.status === "Present"
                        ? "bg-green-500"
                        : day.status === "Leave"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {day.status}
                  </span>
                </td>
                <td className="px-4 py-2">{day.punchIn}</td>
                <td className="px-4 py-2">{day.punchOut}</td>
                <td className="px-4 py-2">{day.workHours}</td>
                <td className="px-4 py-2">{day.workedHours}</td>
                <td className="px-4 py-2">{day.idleTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CurrentEmployeeAttendanceProfile;
