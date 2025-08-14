import React, { useState, useMemo } from "react";
import { CurrentEmployeeLeaveRequestContext } from "./CurrentEmployeeLeaveRequestContext";

const getMonthOptions = (requests) => {
  const months = requests.map((req) => req.from.slice(0, 7)); // "YYYY-MM"
  const uniqueMonths = Array.from(new Set(months));
  return uniqueMonths.sort();
};

const getStatusOptions = () => ["All", "Pending", "Approved", "Rejected"];

const CurrentEmployeeLeaveRequestProvider = ({ children }) => {
  const [leaveRequests, setLeaveRequests] = useState([
    // ...existing demo data...
    { id: 1, employeeId: "EMP101", name: "John Doe", from: "2025-07-10", to: "2025-07-15", reason: "Vacation", date: "2025-07-08", status: "Approved" },
    { id: 2, employeeId: "EMP101", name: "John Doe", from: "2025-07-20", to: "2025-07-22", reason: "Medical Leave", date: "2025-07-18", status: "Pending" },
    { id: 3, employeeId: "EMP101", name: "John Doe", from: "2025-08-05", to: "2025-08-07", reason: "Conference", date: "2025-08-01", status: "Approved" },
    { id: 4, employeeId: "EMP101", name: "John Doe", from: "2025-08-15", to: "2025-08-16", reason: "Personal", date: "2025-08-13", status: "Rejected" },
    { id: 5, employeeId: "EMP101", name: "John Doe", from: "2025-09-10", to: "2025-09-12", reason: "Family Event", date: "2025-09-08", status: "Pending" },
  ]);

  const monthOptions = useMemo(() => getMonthOptions(leaveRequests), [leaveRequests]);
  const statusOptions = useMemo(() => getStatusOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[monthOptions.length - 1] || "");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Multi-filter: by month and status
  const filteredRequests = useMemo(
    () =>
      leaveRequests.filter((req) => {
        const matchMonth = selectedMonth ? req.from.startsWith(selectedMonth) : true;
        const matchStatus = selectedStatus === "All" ? true : req.status === selectedStatus;
        return matchMonth && matchStatus;
      }),
    [leaveRequests, selectedMonth, selectedStatus]
  );

  // Apply leave functionality
  const applyLeave = ({ from, to, reason }) => {
    const newRequest = {
      id: leaveRequests.length + 1,
      employeeId: "EMP101",
      name: "John Doe",
      from,
      to,
      reason,
      date: new Date().toISOString().slice(0, 10),
      status: "Pending",
    };
    setLeaveRequests((prev) => [...prev, newRequest]);
  };

  // Add "from" in the late login dummy data
const [lateLoginRequests, setLateLoginRequests] = useState([
  { id: 1, employeeId: "EMP101", name: "John Doe", from: "Hyderabad", date: "2025-08-01", lateTill: "10:00", reason: "Traffic jam", status: "Approved" },
  { id: 2, employeeId: "EMP101", name: "John Doe", from: "Home", date: "2025-08-05", lateTill: "09:45", reason: "Doctor appointment", status: "Pending" },
  { id: 3, employeeId: "EMP101", name: "John Doe", from: "Office nearby", date: "2025-07-20", lateTill: "10:15", reason: "Family emergency", status: "Rejected" },
]);

// Update applyLateLogin to accept "from"
const applyLateLogin = ({ from, date, lateTill, reason }) => {
  const newRequest = {
    id: lateLoginRequests.length + 1 + Math.floor(Math.random() * 10000),
    employeeId: "EMP101",
    name: "John Doe",
    from,
    date,
    lateTill,
    reason,
    status: "Pending",
  };
  setLateLoginRequests((prev) => [newRequest, ...prev]);
};


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
        lateLoginRequests,
        applyLateLogin,
      }}
    >
      {children}
    </CurrentEmployeeLeaveRequestContext.Provider>
  );
};

export default CurrentEmployeeLeaveRequestProvider;
