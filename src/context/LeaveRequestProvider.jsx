import { useState, useMemo } from "react";
import { LeaveRequestContext } from "./LeaveRequestContext";

export const LeaveRequestProvider = ({ children }) => {
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
  const [leaveRequests, setLeaveRequests] = useState([
    // Original leave requests
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

    // Strategic sandwich leave requests
    // Scenario 1: EMP101 - July 12 (Sat) + July 13 (Holiday) + July 14 (Mon)
    {
      id: 11,
      employeeId: "EMP101",
      name: "John Doe",
      from: "2025-07-12",
      to: "2025-07-12",
      reason: "Personal Work",
      date: "2025-07-10",
      status: "Approved",
    },
    {
      id: 12,
      employeeId: "EMP101",
      name: "John Doe",
      from: "2025-07-14",
      to: "2025-07-14",
      reason: "Personal Work",
      date: "2025-07-10",
      status: "Approved",
    },

    // Scenario 2: EMP102 - August 12 (Tue) + August 13 (Holiday Wed) + August 14 (Thu)
    {
      id: 13,
      employeeId: "EMP102",
      name: "Alice Johnson",
      from: "2025-08-12",
      to: "2025-08-12",
      reason: "Family Event",
      date: "2025-08-08",
      status: "Approved",
    },
    {
      id: 14,
      employeeId: "EMP102",
      name: "Alice Johnson",
      from: "2025-08-14",
      to: "2025-08-14",
      reason: "Family Event",
      date: "2025-08-08",
      status: "Approved",
    },

    // Scenario 3: EMP103 - September 16 (Tue) + September 17 (Holiday Wed) + September 18 (Thu)
    {
      id: 15,
      employeeId: "EMP103",
      name: "Michael Smith",
      from: "2025-09-16",
      to: "2025-09-16",
      reason: "Medical Appointment",
      date: "2025-09-12",
      status: "Approved",
    },
    {
      id: 16,
      employeeId: "EMP103",
      name: "Michael Smith",
      from: "2025-09-18",
      to: "2025-09-18",
      reason: "Medical Follow-up",
      date: "2025-09-12",
      status: "Approved",
    },

    // Scenario 4: EMP104 - November 11 (Tue) + November 12 (Holiday Wed) + November 13 (Thu)
    {
      id: 17,
      employeeId: "EMP104",
      name: "Priya Sharma",
      from: "2025-11-11",
      to: "2025-11-11",
      reason: "Wedding Preparation",
      date: "2025-11-05",
      status: "Approved",
    },
    {
      id: 18,
      employeeId: "EMP104",
      name: "Priya Sharma",
      from: "2025-11-13",
      to: "2025-11-13",
      reason: "Wedding Preparation",
      date: "2025-11-05",
      status: "Approved",
    },

    // Scenario 5: EMP105 - December 9 (Tue) + December 10 (Holiday Wed) + December 11 (Thu)
    {
      id: 19,
      employeeId: "EMP105",
      name: "Amit Kumar",
      from: "2025-12-09",
      to: "2025-12-09",
      reason: "Travel",
      date: "2025-12-05",
      status: "Approved",
    },
    {
      id: 20,
      employeeId: "EMP105",
      name: "Amit Kumar",
      from: "2025-12-11",
      to: "2025-12-11",
      reason: "Travel",
      date: "2025-12-05",
      status: "Approved",
    },
  ]);

  // Utility: get all unique months from leaveRequests
  const allMonths = useMemo(() => {
    const monthsSet = new Set();
    leaveRequests.forEach(req => {
      if (req.from) monthsSet.add(req.from.slice(0, 7));
      if (req.to) monthsSet.add(req.to.slice(0, 7));
    });
    return Array.from(monthsSet).sort().reverse(); // Most recent first
  }, [leaveRequests]);

  // Utility: get leave summary for a given month
  const getMonthlyLeaveSummaryForAll = (monthStr) => {
    const filtered = leaveRequests.filter(req => req.from && req.from.slice(0, 7) === monthStr);
    return {
      total: filtered.length,
      statusCounts: filtered.reduce((acc, curr) => {
        const status = curr?.status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, { Approved: 0, Rejected: 0, Pending: 0 }),
      requests: filtered,
    };
  };
  const addLeaveRequest = (newRequest) => {
    const id = Math.max(...leaveRequests.map(req => req.id), 0) + 1;
    setLeaveRequests(prev => [...prev, { ...newRequest, id }]);
  };

  const updateLeaveRequest = (id, updatedData) => {
    setLeaveRequests(prev =>
      prev.map(req => req.id === id ? { ...req, ...updatedData } : req)
    );
  };

  const deleteLeaveRequest = (id) => {
    setLeaveRequests(prev => prev.filter(req => req.id !== id));
  };

  const getApprovedLeaveDatesByEmployee = (employeeId) => {
    return leaveRequests
      .filter(lr => lr.employeeId === employeeId && lr.status === "Approved")
      .flatMap(lr => expandLeaveRange(lr.from, lr.to));
  };

  return (
    <LeaveRequestContext.Provider value={{
      leaveRequests,
      setLeaveRequests,
      addLeaveRequest,
      updateLeaveRequest,
      deleteLeaveRequest,
      getApprovedLeaveDatesByEmployee,
      allMonths,
      getMonthlyLeaveSummaryForAll,
    }}>
      {children}
    </LeaveRequestContext.Provider>
  );
};
