import React, { useState, useMemo, useEffect } from "react";
import { CurrentEmployeeLeaveRequestContext } from "./CurrentEmployeeLeaveRequestContext";

const getMonthOptions = (requests) => {
  const months = requests.map((req) => req.from.slice(0, 7)); // "YYYY-MM"
  const uniqueMonths = Array.from(new Set(months));
  return uniqueMonths.sort();
};

const getStatusOptions = () => ["All", "Pending", "Approved", "Rejected"];
const getLeaveTypeOptions = () => ["Sick Leave", "Casual Leave", "Emergency Leave"];

const CurrentEmployeeLeaveRequestProvider = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      employeeId: "EMP101",
      name: "John Doe",
      from: "2025-07-10",
      to: "2025-07-15",
      reason: "Vacation",
      requestDate: "2025-07-08",
      status: "Approved",
      leaveDayType: "Full Day",
      halfDaySession: null,
      leaveType: "CASUAL",
      actionDate: "2025-07-09",
      leavecategory: "Paid",
      approvedBy: "Manager1",
    },
    {
      id: 2,
      employeeId: "EMP101",
      name: "John Doe",
      from: "2025-07-20",
      to: "2025-07-22",
      reason: "Medical Leave",
      requestDate: "2025-07-18",
      status: "Pending",
      leaveDayType: "Full Day",
      leaveType: "SICK",
      halfDaySession: null,
      actionDate: null,
      leavecategory: "UnPaid",
      approvedBy: null,
    },
    // ...rest of your dummy data
  ]);

  // ✅ fetch backend data on mount
  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const response = await fetch("/api/leaves/EMP101"); // ✅ Replace with real API
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setLeaveRequests(data); // ✅ backend data replaces dummy
      } catch (error) {
        console.error("Backend not available, using dummy data", error);
        // keep dummy data
      }
    };

    fetchLeaves();
  }, []);

  const monthOptions = useMemo(() => getMonthOptions(leaveRequests), [leaveRequests]);
  const statusOptions = useMemo(() => getStatusOptions(), []);
  const leaveTypeOptions = useMemo(() => ["All", ...getLeaveTypeOptions()], []);
  const [selectedLeaveType, setSelectedLeaveType] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[monthOptions.length - 1] || "");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const filteredRequests = useMemo(
    () =>
      leaveRequests.filter((req) => {
        const matchMonth = selectedMonth ? req.from.startsWith(selectedMonth) : true;
        const matchStatus = selectedStatus === "All" ? true : req.status === selectedStatus;
        const matchLeaveType = selectedLeaveType === "All" ? true : req.leaveType === selectedLeaveType;
        return matchMonth && matchStatus && matchLeaveType;
      }),
    [leaveRequests, selectedMonth, selectedStatus, selectedLeaveType]
  );

  // ✅ Apply Leave with Auto Paid/Unpaid logic
const applyLeave = async ({ from, to, reason, leaveType, halfDaySession }) => {
  const leaveMonth = new Date(from).getMonth();
  const leaveYear = new Date(from).getFullYear();

  const hasPaidLeaveThisMonth = leaveRequests.some((req) => {
    const reqMonth = new Date(req.from).getMonth();
    const reqYear = new Date(req.from).getFullYear();
    return (
      req.employeeId === "EMP101" &&
      reqMonth === leaveMonth &&
      reqYear === leaveYear &&
      req.leavecategory === "Paid"
    );
  });

  // 👇 build request without status
  const newRequest = {
    id: leaveRequests.length + 1,
    employeeId: "EMP101",
    name: "John Doe",
    from,
    to,
    reason,
    leaveType,
    leaveDayType: from === to && halfDaySession ? "Half Day" : "Full Day",
    halfDaySession: from === to ? halfDaySession || null : null,
    requestDate: new Date().toISOString().slice(0, 10),
    leavecategory: hasPaidLeaveThisMonth ? "UnPaid" : "Paid",
    actionDate: null,
    approvedBy: null,
    // ❌ no status here (backend should decide)
  };

  try {
    const response = await fetch("/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newRequest),
    });

    if (response.ok) {
      const savedRequest = await response.json();
      // ✅ backend decides status
      setLeaveRequests((prev) => [...prev, savedRequest]);
    } else {
      // ❌ backend failed → fallback with Pending
      setLeaveRequests((prev) => [
        ...prev,
        { ...newRequest, status: "Pending" },
      ]);
    }
  } catch (error) {
    console.error("Backend save failed, using local state", error);
    // ❌ network error → fallback with Pending
    setLeaveRequests((prev) => [
      ...prev,
      { ...newRequest, status: "Pending" },
    ]);
  }
};




  const [sandwichLeaves] = useState([
    { date: "2025-09-11", from: "2025-09-10", to: "2025-09-12" },
    { date: "2025-09-25", from: "2025-09-24", to: "2025-09-26" },
  ]);

  return (
    <CurrentEmployeeLeaveRequestContext.Provider
      value={{
        leaveRequests,
        setLeaveRequests,
        monthOptions,
        selectedMonth,
        setSelectedMonth,
        statusOptions,
        selectedStatus,
        setSelectedStatus,
        filteredRequests,
        applyLeave,
        sandwichLeaves,
        leaveTypeOptions,
        selectedLeaveType,
        setSelectedLeaveType,
      }}
    >
      {children}
    </CurrentEmployeeLeaveRequestContext.Provider>
  );
};

export default CurrentEmployeeLeaveRequestProvider;
