import React, { useState, useMemo } from "react";
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
      responseDate: null,          // No response yet
      leaveResponds: [],            // Empty since admin has not responded
      leavecategory: "UnPaid",
    },
    { 
      id: 3,
      employeeId: "EMP101",
      name: "John Doe",
      from: "2025-08-05",
      to: "2025-08-07",
      reason: "Conference",
      date: "2025-08-01",
      status: "Approved",
      leaveType: "Full Day",
      responseDate: "2025-08-03",
      leaveResponds: ["2025-08-03"],
      leavecategory: "Paid",
    },
    { 
      id: 4,
      employeeId: "EMP101",
      name: "John Doe",
      from: "2025-08-15",
      to: "2025-08-15",
      reason: "Personal",
      date: "2025-08-13",
      status: "Rejected",
      leaveType: "Morning Half",
      responseDate: "2025-08-14",
      leaveResponds: ["2025-08-14"],
      leavecategory: "UnPaid",
    },
    { 
      id: 5,
      employeeId: "EMP101",
      name: "John Doe",
      from: "2025-09-10",
      to: "2025-09-12",
      reason: "Family Event",
      date: "2025-09-08",
      status: "Pending",
      leaveType: "Full Day",
      responseDate: null,
      leaveResponds: [],
      leavecategory: "Paid",
    },
    { 
      id: 6,
      employeeId: "EMP101",
      name: "John Doe",
      from: "2025-06-10",
      to: "2025-06-12",
      reason: "Family Event",
      date: "2025-09-08",
      status: "Pending",
      leaveType: "Full Day",
      responseDate: null,
      leaveResponds: [],
      leavecategory: "UnPaid",
    },
  ]);

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

const applyLeave = ({ from, to, reason, leaveType, halfDay }) => {
  const newRequest = {
    id: leaveRequests.length + 1,
    employeeId: "EMP101",
    name: "John Doe",
    from,
    to,
    reason,
    leaveType: from === to && halfDay ? halfDay : leaveType, // ✅ Half-day stored in leaveType
    date: new Date().toISOString().slice(0, 10),
    status: "Pending",
  };
  setLeaveRequests((prev) => [...prev, newRequest]);
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
