import React, { useState, useMemo, useCallback } from "react";
import { LeaveRequestContext } from "./LeaveRequestContext";

// --- Date Utilities (Preserved for existing components like LeaveManagement) ---
const getWeekDates = (baseDate = new Date(), weekOffset = 0) => {
  const today = new Date(baseDate);
  today.setDate(today.getDate() + weekOffset * 7);
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
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

// --- Provider Component ---
export const LeaveRequestProvider = ({ children }) => {
  // ===================================================================================
  // SECTION 1: NEW DATA & LOGIC FOR AdminLeaveSummary PAGE (Simulated Backend)
  // This section is designed to serve the AdminLeaveSummary component efficiently,
  // simulating an API response that provides pre-aggregated and enriched data.
  // ===================================================================================

  const [leaveSummaryData] = useState({
    "2025-07": {
      monthlyStats: { totalRequests: 4, approved: 2, rejected: 1, pending: 1 },
      requests: [
        { id: 1, employeeId: "EMP101", employeeName: "John Doe", department: "HR", from: "2025-07-10", to: "2025-07-15", leaveDays: 6, reason: "Vacation", status: "Approved", isActive: true },
        { id: 2, employeeId: "EMP102", employeeName: "Alice Johnson", department: "Finance", from: "2025-07-12", to: "2025-07-14", leaveDays: 3, reason: "Medical Leave", status: "Pending", isActive: true },
        { id: 3, employeeId: "EMP103", employeeName: "Michael Smith", department: "IT", from: "2025-07-20", to: "2025-07-22", leaveDays: 3, reason: "Personal Work", status: "Rejected", isActive: true },
        { id: 4, employeeId: "EMP104", employeeName: "Priya Sharma", department: "Marketing", from: "2025-07-18", to: "2025-07-20", leaveDays: 3, reason: "Family Function", status: "Approved", isActive: true }
      ]
    },
    "2025-08": {
      monthlyStats: { totalRequests: 3, approved: 1, rejected: 0, pending: 2 },
      requests: [
        { id: 5, employeeId: "EMP105", employeeName: "Amit Kumar", department: "Sales", from: "2025-08-01", to: "2025-08-03", leaveDays: 3, reason: "Conference", status: "Approved", isActive: true },
        { id: 6, employeeId: "EMP106", employeeName: "Sara Lee", department: "HR", from: "2025-08-05", to: "2025-08-05", leaveDays: 1, reason: "Sick Leave", status: "Pending", isActive: true },
        { id: 7, employeeId: "EMP101", employeeName: "John Doe", department: "HR", from: "2025-08-10", to: "2025-08-12", leaveDays: 3, reason: "Personal", status: "Pending", isActive: false }
      ]
    },
  });

  const { allSummaryMonths, allSummaryDepartments, allSummaryRequests } = useMemo(() => {
    const months = Object.keys(leaveSummaryData).sort().reverse();
    const requests = Object.values(leaveSummaryData).flatMap(monthData => monthData.requests);
    const depts = [...new Set(requests.map(req => req.department))].sort();
    return { allSummaryMonths: months, allSummaryDepartments: depts, allSummaryRequests: requests };
  }, [leaveSummaryData]);

  const getLeaveSummary = useCallback((filters) => {
    const { selectedMonth, departmentFilter, statusFilter } = filters;
    let requestsToFilter = selectedMonth === 'All'
      ? allSummaryRequests
      : leaveSummaryData[selectedMonth]?.requests || [];

    const filteredRequests = requestsToFilter.filter(req => {
      const deptMatch = departmentFilter === 'All' || req.department === departmentFilter;
      const statusMatch = statusFilter === 'All' || req.status === statusFilter;
      return deptMatch && statusMatch;
    });

    const summaryStats = filteredRequests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, { Total: filteredRequests.length, Approved: 0, Rejected: 0, Pending: 0 });

    return { summaryStats, filteredRequests };
  }, [leaveSummaryData, allSummaryRequests]);

  // ===================================================================================
  // SECTION 2: EXISTING STATE AND FUNCTIONS FOR OTHER PAGES (e.g., LeaveManagement)
  // This entire section is PRESERVED to ensure no breaking changes for other components.
  // ===================================================================================

  const [leaveRequests, setLeaveRequests] = useState([
    { "id": 1, "employeeId": "EMP101", "name": "John Doe", "from": "2025-07-10", "to": "2025-07-15", "leaveDays": 6, "reason": "Vacation", "requestDate": "2025-07-08", "actionDate": "2025-07-09", "status": "Approved", "leaveRequestDays": [{ "id": 1, "leaveDate": "2025-07-10", "leaveCategory": "PAID" }] },
    { "id": 2, "employeeId": "EMP102", "name": "Alice Johnson", "from": "2025-07-12", "to": "2025-07-14", "leaveDays": 3, "reason": "Medical Leave", "requestDate": "2025-07-09", "actionDate": null, "status": "Pending", "leaveRequestDays": [{ "id": 7, "leaveDate": "2025-07-12", "leaveCategory": "PAID" }] },
    { "id": 3, "employeeId": "EMP103", "name": "Michael Smith", "from": "2025-07-20", "to": "2025-07-22", "leaveDays": 3, "reason": "Personal Work", "requestDate": "2025-07-10", "actionDate": "2025-07-12", "status": "Rejected", "leaveRequestDays": [{ "id": 10, "leaveDate": "2025-07-20", "leaveCategory": "PAID" }] },
    { "id": 4, "employeeId": "EMP104", "name": "Priya Sharma", "from": "2025-07-18", "to": "2025-07-20", "leaveDays": 3, "reason": "Family Function", "requestDate": "2025-07-11", "actionDate": "2025-07-13", "status": "Approved", "leaveRequestDays": [{ "id": 13, "leaveDate": "2025-07-18", "leaveCategory": "PAID" }] }
  ]);

  const [currentWeek, setCurrentWeek] = useState(0);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  
  const getDepartments = useCallback((employeesData) => {
    return Array.from(new Set(
      (employeesData || [])
        .filter(emp => emp.isActive !== false)
        .map(emp => emp.experienceDetails?.find(exp => exp.lastWorkingDate === "Present")?.department)
        .filter(Boolean)
    )).sort();
  }, []);
  
  const getWeeklyFilteredRequests = useCallback((employeesData) => {
    const weekDates = getWeekDates(new Date(), currentWeek);
    const filtered = leaveRequests.filter(req => {
        const emp = employeesData?.find(e => e.employeeId === req.employeeId);
        const dept = emp?.experienceDetails?.find(ex => ex.lastWorkingDate === 'Present')?.department;
        return (filterStatus === 'All' || req.status === filterStatus) &&
               (filterDept === 'All' || dept === filterDept) &&
               (req.name.toLowerCase().includes(searchQuery.toLowerCase()) || req.employeeId.toLowerCase().includes(searchQuery.toLowerCase())) &&
               (req.from <= weekDates.end && req.to >= weekDates.start);
    });
    return { weekDates, filteredRequests: filtered };
  }, [leaveRequests, currentWeek, filterStatus, searchQuery, filterDept]);
  
  const approveLeave = useCallback((id) => setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status: "Approved", actionDate: new Date().toISOString() } : req)), []);
  const rejectLeave = useCallback((id) => setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, status: "Rejected", actionDate: new Date().toISOString() } : req)), []);
  const addLeaveRequest = useCallback((newRequest) => setLeaveRequests(prev => [...prev, { ...newRequest, id: Math.max(...prev.map(r => r.id), 0) + 1 }]), []);
  const updateLeaveRequest = useCallback((id, updatedData) => setLeaveRequests(prev => prev.map(req => req.id === id ? { ...req, ...updatedData } : req)), []);
  const deleteLeaveRequest = useCallback((id) => setLeaveRequests(prev => prev.filter(req => req.id !== id)), []);
  const getApprovedLeaveDatesByEmployee = useCallback((employeeId) => leaveRequests.filter(lr => lr.employeeId === employeeId && lr.status === "Approved").flatMap(lr => expandLeaveRange(lr.from, lr.to)), [leaveRequests]);
  
  // FIX 1: The unused `holidayCalendar` parameter has been removed.
  const isSandwichLeave = useCallback((reqList) => {
    let sandwichLeaveRowId = null;
    if (!reqList) return null;
    reqList.forEach(req => {
      if (req.employeeId === "EMP101") {
        const fromDate = new Date(req.from);
        const toDate = new Date(req.to);
        if ((toDate - fromDate) / (1000 * 60 * 60 * 24) === 2) {
          const day1 = fromDate.getDay();
          const day3 = toDate.getDay();
          if (day1 === 5 && day3 === 1) { // Friday to Monday
            sandwichLeaveRowId = req.id;
          }
        }
      }
    });
    return sandwichLeaveRowId;
  }, []);

  const goToPreviousWeek = useCallback(() => setCurrentWeek(w => w - 1), []);
  const goToNextWeek = useCallback(() => setCurrentWeek(w => w + 1), []);
  const resetToCurrentWeek = useCallback(() => setCurrentWeek(0), []);

  return (
    <LeaveRequestContext.Provider
      value={{
        // --- NEW EXPORTS FOR AdminLeaveSummary PAGE ---
        getLeaveSummary,
        allDepartments: allSummaryDepartments, // Use the new pre-processed department list

        // FIX 2: The `allMonths` key is no longer duplicated.
        // It now provides the comprehensive month list from the new summary data,
        // which is what AdminLeaveSummary needs.
        allMonths: allSummaryMonths,

        // --- EXISTING EXPORTS FOR OTHER PAGES (e.g., LeaveManagement) ---
        leaveRequests,
        setLeaveRequests,
        addLeaveRequest,
        updateLeaveRequest,
        deleteLeaveRequest,
        approveLeave,
        rejectLeave,
        getApprovedLeaveDatesByEmployee,
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