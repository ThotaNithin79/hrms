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
      date: "2025-07-08",
      status: "Approved",
      leaveType: "Full Day",
      responseDate: "2025-07-09",
      leaveResponds: ["2025-07-09"],
      leavecategory: "Paid",
    },
    {
      id: 2,
      employeeId: "EMP101",
      name: "John Doe",
      from: "2025-07-20",
      to: "2025-07-22",
      reason: "Medical Leave",
      date: "2025-07-18",
      status: "Pending",
      leaveType: "Full Day",
      responseDate: null,
      leaveResponds: [],
      leavecategory: "UnPaid",
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
  const applyLeave = async ({ from, to, reason, leaveType, halfDay }) => {
    const leaveMonth = new Date(from).getMonth();
    const leaveYear = new Date(from).getFullYear();

    const hasPaidLeaveThisMonth = leaveRequests.some((req) => {
      const reqMonth = new Date(req.from).getMonth();
      const reqYear = new Date(req.from).getFullYear();
      return reqMonth === leaveMonth && reqYear === leaveYear && req.leavecategory === "Paid";
    });

    const newRequest = {
      id: leaveRequests.length + 1,
      employeeId: "EMP101",
      name: "John Doe",
      from,
      to,
      reason,
      leaveType: from === to && halfDay ? halfDay : leaveType,
      date: new Date().toISOString().slice(0, 10),
      status: "Pending",
      leavecategory: hasPaidLeaveThisMonth ? "UnPaid" : "Paid",
      responseDate: null,
      leaveResponds: [],
    };

    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRequest),
      });

      if (!response.ok) throw new Error("Failed to save leave request");

      const savedRequest = await response.json();
      setLeaveRequests((prev) => [...prev, savedRequest]); // ✅ backend data
    } catch (error) {
      console.error("Backend save failed, falling back to local state", error);
      setLeaveRequests((prev) => [...prev, newRequest]); // ✅ fallback
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
