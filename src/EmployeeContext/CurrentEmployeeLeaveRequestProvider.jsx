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
    // July
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
      employeeId: "EMP101",
      name: "John Doe",
      from: "2025-07-20",
      to: "2025-07-22",
      reason: "Medical Leave",
      date: "2025-07-18",
      status: "Pending",
    },
    // August
    {
      id: 3,
      employeeId: "EMP101",
      name: "John Doe",
      from: "2025-08-05",
      to: "2025-08-07",
      reason: "Conference",
      date: "2025-08-01",
      status: "Approved",
    },
    {
      id: 4,
      employeeId: "EMP101",
      name: "John Doe",
      from: "2025-08-15",
      to: "2025-08-16",
      reason: "Personal",
      date: "2025-08-13",
      status: "Rejected",
    },
    // September
    {
      id: 5,
      employeeId: "EMP101",
      name: "John Doe",
      from: "2025-09-10",
      to: "2025-09-12",
      reason: "Family Event",
      date: "2025-09-08",
      status: "Pending",
    },
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
      }}
    >
      {children}
    </CurrentEmployeeLeaveRequestContext.Provider>
  );
};

export default CurrentEmployeeLeaveRequestProvider;
