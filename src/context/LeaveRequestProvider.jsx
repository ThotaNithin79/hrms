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
    "reason": "Vacation",
    "requestDate": "2025-07-08",
    "actionDate": "2025-07-09",
    "status": "Approved",
    "leaveRequestDays": [
      { "id": 1, "leaveDate": "2025-07-10", "leaveCategory": "PAID", "sandwichFlag": false, "otCreditUsed": false },
      { "id": 2, "leaveDate": "2025-07-11", "leaveCategory": "PAID", "sandwichFlag": false, "otCreditUsed": false },
      { "id": 3, "leaveDate": "2025-07-12", "leaveCategory": "PAID", "sandwichFlag": false, "otCreditUsed": false },
      { "id": 4, "leaveDate": "2025-07-13", "leaveCategory": "PAID", "sandwichFlag": false, "otCreditUsed": false },
      { "id": 5, "leaveDate": "2025-07-14", "leaveCategory": "PAID", "sandwichFlag": false, "otCreditUsed": false },
      { "id": 6, "leaveDate": "2025-07-15", "leaveCategory": "PAID", "sandwichFlag": false, "otCreditUsed": false }
    ]
  },
  {
    "id": 2,
    "employeeId": "EMP102",
    "name": "Alice Johnson",
    "from": "2025-07-12",
    "to": "2025-07-14",
    "leaveDays": 3,
    "reason": "Medical Leave",
    "requestDate": "2025-07-09",
    "actionDate": null,
    "status": "Pending",
    "leaveRequestDays": [
      { "id": 7, "leaveDate": "2025-07-12", "leaveCategory": "PAID", "sandwichFlag": false, "otCreditUsed": false },
      { "id": 8, "leaveDate": "2025-07-13", "leaveCategory": "PAID", "sandwichFlag": false, "otCreditUsed": false },
      { "id": 9, "leaveDate": "2025-07-14", "leaveCategory": "PAID", "sandwichFlag": false, "otCreditUsed": false }
    ]
  },
  {
    "id": 3,
    "employeeId": "EMP103",
    "name": "Michael Smith",
    "from": "2025-07-20",
    "to": "2025-07-22",
    "leaveDays": 3,
    "reason": "Personal Work",
    "requestDate": "2025-07-10",
    "actionDate": "2025-07-12",
    "status": "Rejected",
    "leaveRequestDays": [
      { "id": 10, "leaveDate": "2025-07-20", "leaveCategory": "PAID", "sandwichFlag": false, "otCreditUsed": false },
      { "id": 11, "leaveDate": "2025-07-21", "leaveCategory": "PAID", "sandwichFlag": false, "otCreditUsed": false },
      { "id": 12, "leaveDate": "2025-07-22", "leaveCategory": "PAID", "sandwichFlag": false, "otCreditUsed": false }
    ]
  },
  {
    "id": 4,
    "employeeId": "EMP104",
    "name": "Priya Sharma",
    "from": "2025-07-18",
    "to": "2025-07-20",
    "leaveDays": 3,
    "reason": "Family Function",
    "requestDate": "2025-07-11",
    "actionDate": "2025-07-13",
    "status": "Approved",
    "leaveRequestDays": [
      { "id": 13, "leaveDate": "2025-07-18", "leaveCategory": "PAID", "sandwichFlag": false, "otCreditUsed": false },
      { "id": 14, "leaveDate": "2025-07-19", "leaveCategory": "PAID", "sandwichFlag": false, "otCreditUsed": false },
      { "id": 15, "leaveDate": "2025-07-20", "leaveCategory": "PAID", "sandwichFlag": false, "otCreditUsed": false }
    ]
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
