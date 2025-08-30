import React, { useState, useMemo, useEffect } from "react";
import { CurrentEmployeeLeaveRequestContext } from "./CurrentEmployeeLeaveRequestContext";

const getMonthOptions = (requests) => {
  const months = requests.map((req) => req.from.slice(0, 7)); // "YYYY-MM"
  const uniqueMonths = Array.from(new Set(months));
  return uniqueMonths.sort();
};

// --- helpers ---
const parseYMD = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
const monthKeyFromYMD = (s) => s.slice(0, 7); // "YYYY-MM"
const eachDateInclusive = (fromStr, toStr) => {
  const out = [];
  let d = parseYMD(fromStr);
  const end = parseYMD(toStr);
  while (d <= end) {
    out.push(ymd(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
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
// ✅ Apply Leave: expand into per-day entries; one Paid day per month
const applyLeave = async ({ from, to, reason, leaveType, halfDaySession }) => {
  const days = eachDateInclusive(from, to);

  // Months that already have a Paid day (from existing requests)
  const paidUsedMonths = new Set(
    leaveRequests
      .filter((r) => r.leavecategory === "Paid")
      .map((r) => monthKeyFromYMD(r.from))
  );

  // We’ll collect new entries first, then set state once.
  const newEntries = [];

  // Base id to keep unique ids in local fallback
  let nextId = leaveRequests.length + 1;

  // Only single-day requests can be Half Day
  const isSingleDay = days.length === 1;
  const wantHalfDay = isSingleDay && !!halfDaySession;

  // Build one entry per day
  for (const dateStr of days) {
    const mk = monthKeyFromYMD(dateStr);
    const leavecategory = paidUsedMonths.has(mk) ? "UnPaid" : "Paid";
    if (leavecategory === "Paid") {
      // consume the month's paid slot
      paidUsedMonths.add(mk);
    }

    const perDayRequest = {
      id: nextId++,
      employeeId: "EMP101",
      name: "John Doe",
      from: dateStr,
      to: dateStr, // single-day row
      reason,
      leaveType,
      leaveDayType: wantHalfDay ? "Half Day" : "Full Day",
      halfDaySession: wantHalfDay ? halfDaySession : null,
      requestDate: new Date().toISOString().slice(0, 10),
      leavecategory, // 👈 Paid for the first unused month day; otherwise UnPaid
      actionDate: null,
      approvedBy: null,
      // status decided by backend; fallback to Pending below
    };

    // Try to persist each day (simple loop; backend may not exist)
    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(perDayRequest),
      });

      if (response.ok) {
        const saved = await response.json(); // backend supplies status
        newEntries.push(saved);
      } else {
        newEntries.push({ ...perDayRequest, status: "Pending" });
      }
    } catch (err) {
      console.error("Backend save failed, using local state", err);
      newEntries.push({ ...perDayRequest, status: "Pending" });
    }
  }

  // Add all new daily rows in one state update
  setLeaveRequests((prev) => [...prev, ...newEntries]);
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
