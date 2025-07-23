import { useState } from "react";
import { LeaveRequestContext } from "./LeaveRequestContext";

export const LeaveRequestProvider = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      employeeId: "EMP101",
      name: "John Doe",
      from: "2025-07-10",
      to: "2025-07-15",
      reason: "Vacation",
      date: "2025-07-08",
      status: "Approved",
    },
    // Remove duplicate sandwich leave request for EMP101
    {
      id: 2,
      employeeId: "EMP102",
      name: "Alice Johnson",
      from: "2025-07-12",
      to: "2025-07-14",
      reason: "Medical Leave",
      date: "2025-07-09",
      status: "Pending",
    },
    {
      id: 3,
      employeeId: "EMP103",
      name: "Michael Smith",
      from: "2025-07-20",
      to: "2025-07-22",
      reason: "Personal Work",
      date: "2025-07-10",
      status: "Rejected",
    },
    {
      id: 4,
      employeeId: "EMP104",
      name: "Priya Sharma",
      from: "2025-07-18",
      to: "2025-07-20",
      reason: "Family Function",
      date: "2025-07-11",
      status: "Approved",
    },
    {
      id: 5,
      employeeId: "EMP105",
      name: "Amit Kumar",
      from: "2025-07-25",
      to: "2025-07-28",
      reason: "Travel",
      date: "2025-07-13",
      status: "Pending",
    },
    {
      id: 6,
      employeeId: "EMP106",
      name: "Sara Lee",
      from: "2025-07-15",
      to: "2025-07-16",
      reason: "Sick Leave",
      date: "2025-07-10",
      status: "Approved",
    },
    {
      id: 7,
      employeeId: "EMP107",
      name: "Rohan Mehta",
      from: "2025-07-22",
      to: "2025-07-24",
      reason: "Marriage Function",
      date: "2025-07-12",
      status: "Approved",
    },
    {
      id: 8,
      employeeId: "EMP108",
      name: "Anjali Nair",
      from: "2025-07-17",
      to: "2025-07-18",
      reason: "Health Checkup",
      date: "2025-07-09",
      status: "Rejected",
    },
    {
      id: 9,
      employeeId: "EMP109",
      name: "David Wilson",
      from: "2025-07-21",
      to: "2025-07-23",
      reason: "Relocation Support",
      date: "2025-07-11",
      status: "Pending",
    },
    {
      id: 10,
      employeeId: "EMP110",
      name: "Meera Raj",
      from: "2025-07-14",
      to: "2025-07-15",
      reason: "Personal",
      date: "2025-07-08",
      status: "Approved",
    },
  ]);
  
  // Helper: get month string from date
  const getMonthString = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  // Monthly leave summary for a particular employee
  const getMonthlyLeaveSummaryForEmployee = (employeeId, monthStr) => {
    const filtered = leaveRequests.filter(
      (req) => req.employeeId === employeeId && getMonthString(req.from) === monthStr
    );
    const statusCounts = filtered.reduce(
      (acc, curr) => {
        const status = curr?.status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { Approved: 0, Rejected: 0, Pending: 0 }
    );
    return {
      total: filtered.length,
      statusCounts,
      requests: filtered,
    };
  };

  // Monthly leave summary for all employees
  const getMonthlyLeaveSummaryForAll = (monthStr) => {
    const filtered = leaveRequests.filter(
      (req) => getMonthString(req.from) === monthStr
    );
    // Group by employeeId
    const summaryByEmployee = {};
    filtered.forEach((req) => {
      if (!summaryByEmployee[req.employeeId]) {
        summaryByEmployee[req.employeeId] = [];
      }
      summaryByEmployee[req.employeeId].push(req);
    });
    // Status counts for all
    const statusCounts = filtered.reduce(
      (acc, curr) => {
        const status = curr?.status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { Approved: 0, Rejected: 0, Pending: 0 }
    );
    return {
      total: filtered.length,
      statusCounts,
      requests: filtered,
      summaryByEmployee,
    };
  };

  // Monthly leave summary for a selected department
  // Assumes each request has a 'department' field (add if needed)
  const getMonthlyLeaveSummaryForDepartment = (department, monthStr) => {
    const filtered = leaveRequests.filter(
      (req) => req.department === department && getMonthString(req.from) === monthStr
    );
    const statusCounts = filtered.reduce(
      (acc, curr) => {
        const status = curr?.status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { Approved: 0, Rejected: 0, Pending: 0 }
    );
    return {
      total: filtered.length,
      statusCounts,
      requests: filtered,
    };
  };

  // Get all months present in leaveRequests
  const allMonths = Array.from(
    new Set(
      (leaveRequests || [])
        .map((req) => getMonthString(req.from))
        .filter((m) => m)
    )
  );

  return (
    <LeaveRequestContext.Provider value={{
      leaveRequests,
      setLeaveRequests,
      getMonthString,
      getMonthlyLeaveSummaryForEmployee,
      getMonthlyLeaveSummaryForAll,
      getMonthlyLeaveSummaryForDepartment,
      allMonths,
    }}>
      {children}
    </LeaveRequestContext.Provider>
  );
};
