import React, { useState, useMemo, useCallback } from "react";
import { LeaveRequestContext } from "./LeaveRequestContext";

// --- Date Utilities ---
const getWeekDates = (baseDate = new Date(), weekOffset = 0) => {
  const today = new Date(baseDate);
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDay + 1 + (weekOffset * 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
    monday,
    sunday
  };
};

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

// --- Provider ---
export const LeaveRequestProvider = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState([
  {
    "id": 1,
    "employeeId": "EMP101",
    "name": "John Doe",
    "from": "2025-07-10",
    "to": "2025-07-15",
    "leaveDays": 6,
    "leaveDayType": "FULL_DAY",
    "reason": "Vacation",
    "requestDate": "2025-07-08",
    "actionDate": "2025-07-09",
    "status": "Approved"
  },
  {
    "id": 2,
    "employeeId": "EMP102",
    "name": "Alice Johnson",
    "from": "2025-07-12",
    "to": "2025-07-14",
    "leaveDays": 3,
    "leaveDayType": "FULL_DAY",
    "reason": "Medical Leave",
    "requestDate": "2025-07-09",
    "actionDate": null,
    "status": "Pending"
  },
  {
    "id": 3,
    "employeeId": "EMP103",
    "name": "Michael Smith",
    "from": "2025-07-20",
    "to": "2025-07-22",
    "leaveDays": 3,
    "leaveDayType": "FULL_DAY",
    "reason": "Personal Work",
    "requestDate": "2025-07-10",
    "actionDate": "2025-07-12",
    "status": "Rejected"
  },
  {
    "id": 4,
    "employeeId": "EMP104",
    "name": "Priya Sharma",
    "from": "2025-07-18",
    "to": "2025-07-20",
    "leaveDays": 3,
    "leaveDayType": "FULL_DAY",
    "reason": "Family Function",
    "requestDate": "2025-07-11",
    "actionDate": "2025-07-13",
    "status": "Approved"
  },
  {
    "id": 5,
    "employeeId": "EMP105",
    "name": "Amit Kumar",
    "from": "2025-07-25",
    "to": "2025-07-28",
    "leaveDays": 4,
    "leaveDayType": "FULL_DAY",
    "reason": "Travel",
    "requestDate": "2025-07-13",
    "actionDate": null,
    "status": "Pending"
  },
  {
    "id": 6,
    "employeeId": "EMP106",
    "name": "Sara Lee",
    "from": "2025-07-15",
    "to": "2025-07-16",
    "leaveDays": 2,
    "leaveDayType": "FULL_DAY",
    "reason": "Sick Leave",
    "requestDate": "2025-07-10",
    "actionDate": "2025-07-11",
    "status": "Approved"
  },
  {
    "id": 7,
    "employeeId": "EMP107",
    "name": "Rohan Mehta",
    "from": "2025-07-22",
    "to": "2025-07-24",
    "leaveDays": 3,
    "leaveDayType": "FULL_DAY",
    "reason": "Marriage Function",
    "requestDate": "2025-07-12",
    "actionDate": "2025-07-14",
    "status": "Approved"
  },
  {
    "id": 8,
    "employeeId": "EMP108",
    "name": "Anjali Nair",
    "from": "2025-07-17",
    "to": "2025-07-18",
    "leaveDays": 2,
    "leaveDayType": "FULL_DAY",
    "reason": "Health Checkup",
    "requestDate": "2025-07-09",
    "actionDate": "2025-07-10",
    "status": "Rejected"
  },
  {
    "id": 9,
    "employeeId": "EMP109",
    "name": "David Wilson",
    "from": "2025-07-21",
    "to": "2025-07-23",
    "leaveDays": 3,
    "leaveDayType": "FULL_DAY",
    "reason": "Relocation Support",
    "requestDate": "2025-07-11",
    "actionDate": null,
    "status": "Pending"
  },
  {
    "id": 10,
    "employeeId": "EMP110",
    "name": "Meera Raj",
    "from": "2025-07-14",
    "to": "2025-07-15",
    "leaveDays": 2,
    "leaveDayType": "FULL_DAY",
    "reason": "Personal",
    "requestDate": "2025-07-08",
    "actionDate": "2025-07-09",
    "status": "Approved"
  },

  // Sandwich leave examples
  {
    "id": 11,
    "employeeId": "EMP101",
    "name": "John Doe",
    "from": "2025-07-12",
    "to": "2025-07-12",
    "leaveDays": 1,
    "leaveDayType": "FULL_DAY",
    "reason": "Personal Work",
    "requestDate": "2025-07-10",
    "actionDate": "2025-07-11",
    "status": "Approved"
  },
  {
    "id": 12,
    "employeeId": "EMP101",
    "name": "John Doe",
    "from": "2025-07-14",
    "to": "2025-07-14",
    "leaveDays": 1,
    "leaveDayType": "FULL_DAY",
    "reason": "Personal Work",
    "requestDate": "2025-07-10",
    "actionDate": "2025-07-11",
    "status": "Approved"
  },

  {
    "id": 13,
    "employeeId": "EMP102",
    "name": "Alice Johnson",
    "from": "2025-08-12",
    "to": "2025-08-12",
    "leaveDays": 1,
    "leaveDayType": "FULL_DAY",
    "reason": "Family Event",
    "requestDate": "2025-08-08",
    "actionDate": "2025-08-09",
    "status": "Approved"
  },
  {
    "id": 14,
    "employeeId": "EMP102",
    "name": "Alice Johnson",
    "from": "2025-08-14",
    "to": "2025-08-14",
    "leaveDays": 1,
    "leaveDayType": "FULL_DAY",
    "reason": "Family Event",
    "requestDate": "2025-08-08",
    "actionDate": "2025-08-09",
    "status": "Approved"
  },

  {
    "id": 15,
    "employeeId": "EMP103",
    "name": "Michael Smith",
    "from": "2025-09-16",
    "to": "2025-09-16",
    "leaveDays": 1,
    "leaveDayType": "FULL_DAY",
    "reason": "Medical Appointment",
    "requestDate": "2025-09-12",
    "actionDate": "2025-09-13",
    "status": "Approved"
  },
  {
    "id": 16,
    "employeeId": "EMP103",
    "name": "Michael Smith",
    "from": "2025-09-18",
    "to": "2025-09-18",
    "leaveDays": 1,
    "leaveDayType": "FULL_DAY",
    "reason": "Medical Follow-up",
    "requestDate": "2025-09-12",
    "actionDate": "2025-09-13",
    "status": "Approved"
  },

  {
    "id": 17,
    "employeeId": "EMP104",
    "name": "Priya Sharma",
    "from": "2025-11-11",
    "to": "2025-11-11",
    "leaveDays": 1,
    "leaveDayType": "FULL_DAY",
    "reason": "Wedding Preparation",
    "requestDate": "2025-11-05",
    "actionDate": "2025-11-06",
    "status": "Approved"
  },
  {
    "id": 18,
    "employeeId": "EMP104",
    "name": "Priya Sharma",
    "from": "2025-11-13",
    "to": "2025-11-13",
    "leaveDays": 1,
    "leaveDayType": "FULL_DAY",
    "reason": "Wedding Preparation",
    "requestDate": "2025-11-05",
    "actionDate": "2025-11-06",
    "status": "Approved"
  },

  {
    "id": 19,
    "employeeId": "EMP105",
    "name": "Amit Kumar",
    "from": "2025-12-09",
    "to": "2025-12-09",
    "leaveDays": 1,
    "leaveDayType": "FULL_DAY",
    "reason": "Travel",
    "requestDate": "2025-12-05",
    "actionDate": "2025-12-06",
    "status": "Approved"
  },
  {
    "id": 20,
    "employeeId": "EMP105",
    "name": "Amit Kumar",
    "from": "2025-12-11",
    "to": "2025-12-11",
    "leaveDays": 1,
    "leaveDayType": "FULL_DAY",
    "reason": "Travel",
    "requestDate": "2025-12-05",
    "actionDate": "2025-12-06",
    "status": "Approved"
  }
]
);

  // --- Filters State (centralized for week navigation) ---
  const [currentWeek, setCurrentWeek] = useState(0);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All");

  // --- Department List Selector ---
  const getDepartments = useCallback((employees) => {
    return Array.from(new Set(
      employees
        .filter(emp => emp.isActive !== false)
        .map(emp => {
          if (Array.isArray(emp.experienceDetails)) {
            const currentExp = emp.experienceDetails.find(exp => exp.lastWorkingDate === "Present");
            return currentExp?.department || null;
          }
          return null;
        })
        .filter(dept => dept)
    )).sort();
  }, []);

  // --- Weekly Filtered Requests Selector ---
  const getWeeklyFilteredRequests = useCallback((employees) => {
    const weekDates = getWeekDates(new Date(), currentWeek);

    // Filter leave requests by week, status, search, and department
    const allFilteredRequests = leaveRequests.filter((req) => {
      const matchesStatus = filterStatus === "All" ? true : req.status === filterStatus;
      const matchesSearch = req.name.toLowerCase().includes(searchQuery.toLowerCase()) || req.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
      // Get current department for this employee
      const emp = employees?.find(e => e.employeeId === req.employeeId);
      let currentDept = null;
      if (emp && Array.isArray(emp.experienceDetails)) {
        const currentExp = emp.experienceDetails.find(exp => exp.lastWorkingDate === "Present");
        currentDept = currentExp?.department || null;
      }
      const matchesDept = filterDept === "All" ? true : currentDept === filterDept;
      // Check if leave falls within the week
      const fromDate = req.from;
      const toDate = req.to;
      const inWeek = (fromDate >= weekDates.start && fromDate <= weekDates.end) || (toDate >= weekDates.start && toDate <= weekDates.end);
      return matchesStatus && matchesSearch && matchesDept && inWeek;
    });

    // Separate active and inactive employee requests
    const separatedRequests = allFilteredRequests.reduce((acc, req) => {
      const emp = employees?.find(e => e.employeeId === req.employeeId);
      const isActiveEmployee = emp?.isActive !== false;
      if (isActiveEmployee) {
        acc.active.push(req);
      } else {
        acc.inactive.push(req);
      }
      return acc;
    }, { active: [], inactive: [] });

    // Combine for display: active first, then inactive
    const filteredRequests = [...separatedRequests.active, ...separatedRequests.inactive];

    return {
      weekDates,
      filteredRequests,
      separatedRequests,
      allFilteredRequests
    };
  }, [leaveRequests, currentWeek, filterStatus, searchQuery, filterDept]);

  // --- Monthly Summary Selector ---
  const allMonths = useMemo(() => {
    const monthsSet = new Set();
    leaveRequests.forEach((req) => {
      if (req.from) monthsSet.add(req.from.slice(0, 7));
      if (req.to) monthsSet.add(req.to.slice(0, 7));
    });
    return Array.from(monthsSet).sort().reverse();
  }, [leaveRequests]);

  const getMonthlyLeaveSummaryForAll = useCallback((monthStr) => {
    const [year, month] = monthStr.split("-").map(Number);
    const fromDate = new Date(year, month - 1, 1);
    const toDate = new Date(year, month, 0);

    const filtered = leaveRequests
      .filter(({ from, to }) => {
        const start = new Date(from);
        const end = new Date(to);
        return start <= toDate && end >= fromDate;
      })
      .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

    const statusCounts = filtered.reduce((acc, { status }) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    ["Approved", "Rejected", "Pending"].forEach((st) => {
      if (!statusCounts[st]) statusCounts[st] = 0;
    });

    return {
      total: filtered.length,
      statusCounts,
      requests: filtered,
    };
  }, [leaveRequests]);

  // --- Sandwich Leave Flag Helper ---
  const isSandwichLeave = useCallback((reqList) => {
    let sandwichLeaveRowId = null;
    reqList.forEach((req) => {
      if (req.employeeId === "EMP101") {
        const fromDate = new Date(req.from);
        const toDate = new Date(req.to);
        if ((toDate - fromDate) / (1000 * 60 * 60 * 24) === 2) {
          const day1 = fromDate.getDay();
          const day2 = new Date(fromDate.getTime() + 24 * 60 * 60 * 1000).getDay();
          const day3 = toDate.getDay();
          if (day1 === 6 && day2 === 0 && day3 === 1) {
            if (!sandwichLeaveRowId) sandwichLeaveRowId = req.id;
          }
        }
      }
    });
    return sandwichLeaveRowId;
  }, []);

  // --- CRUD & Utility Functions ---
  const addLeaveRequest = useCallback((newRequest) => {
    const id = Math.max(...leaveRequests.map((req) => req.id), 0) + 1;
    setLeaveRequests((prev) => [...prev, { ...newRequest, id }]);
  }, [leaveRequests]);

  const updateLeaveRequest = useCallback((id, updatedData) => {
    setLeaveRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, ...updatedData } : req))
    );
  }, []);

  const deleteLeaveRequest = useCallback((id) => {
    setLeaveRequests((prev) => prev.filter((req) => req.id !== id));
  }, []);

  const getApprovedLeaveDatesByEmployee = useCallback((employeeId) => {
    return leaveRequests
      .filter((lr) => lr.employeeId === employeeId && lr.status === "Approved")
      .flatMap((lr) => expandLeaveRange(lr.from, lr.to));
  }, [leaveRequests]);

  // --- Week Navigation Actions ---
  const goToPreviousWeek = useCallback(() => setCurrentWeek((w) => w - 1), []);
  const goToNextWeek = useCallback(() => setCurrentWeek((w) => w + 1), []);
  const resetToCurrentWeek = useCallback(() => setCurrentWeek(0), []);

  // --- Expose Context ---
  return (
    <LeaveRequestContext.Provider
      value={{
        leaveRequests,
        setLeaveRequests,
        addLeaveRequest,
        updateLeaveRequest,
        deleteLeaveRequest,
        getApprovedLeaveDatesByEmployee,
        allMonths,
        getMonthlyLeaveSummaryForAll,
        getDepartments,
        getWeeklyFilteredRequests,
        currentWeek,
        setCurrentWeek,
        goToPreviousWeek,
        goToNextWeek,
        resetToCurrentWeek,
        filterStatus,
        setFilterStatus,
        searchQuery,
        setSearchQuery,
        filterDept,
        setFilterDept,
        isSandwichLeave,
      }}
    >
      {children}
    </LeaveRequestContext.Provider>
  );
};
