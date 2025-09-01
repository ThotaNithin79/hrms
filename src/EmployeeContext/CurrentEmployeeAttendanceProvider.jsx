import { useState, useContext, useMemo } from "react";
import { CurrentEmployeeAttendanceContext } from "./CurrentEmployeeAttendanceContext";
import { CurrentEmployeeLeaveRequestContext } from "./CurrentEmployeeLeaveRequestContext";

const CurrentEmployeeAttendanceProvider = ({ children }) => {
  // Generates demo attendance data for all employees for the current month
  const generateMonthlyAttendanceData = () => {
    const employees = [{ employeeId: "EMP101", name: "John Doe" }];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const records = [];
    let monthlyWorkHours = 0;
    let monthlyIdleHours = 0;

    for (const emp of employees) {
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        let status = "Present";
        if (day % 7 === 0) status = "Leave";
        if (day % 11 === 0) status = "Absent";
        let workHours = status === "Present" ? 9 : 0;
        let workedHours = status === "Present" ? 8.5 : 0;
        let idleTime = status === "Present" ? 0.5 : 0;
        if (status === "Leave" || status === "Absent") {
          workHours = 0;
          workedHours = 0;
          idleTime = 0;
        }
        monthlyWorkHours += workedHours;
        monthlyIdleHours += idleTime;
        records.push({
          id: `${emp.employeeId}-${dateStr}`,
          employeeId: emp.employeeId,
          name: emp.name,
          date: dateStr,
          status,
          punchIn: status === "Present" ? "09:00" : "",
          punchOut: status === "Present" ? "18:00" : "",
          workHours,
          workedHours,
          idleTime,
        });
      }
    }
    return { records, monthlyWorkHours, monthlyIdleHours };
  };

  const { records, monthlyWorkHours, monthlyIdleHours } = generateMonthlyAttendanceData();
  const [attendanceRecords] = useState(records);

  // --- Leave Remaining Calculation (uses leaveRequests from leave context) ---
  const employeeId = "EMP101";
  const leaveRequests = useContext(CurrentEmployeeLeaveRequestContext)?.leaveRequests || [];

  function getAllMonthsUpToCurrentYear() {
    const now = new Date();
    const months = [];
    for (let m = 0; m < now.getMonth() + 1; m++) {
      months.push(`${now.getFullYear()}-${String(m + 1).padStart(2, "0")}`);
    }
    return months;
  }

  function getApprovedLeaveDaysForMonth(reqs, month, empId) {
    let leaveDates = new Set();
    reqs.forEach((req) => {
      if (req.employeeId !== empId) return;
      if (req.status !== "Approved") return;
      const from = new Date(req.from);
      const to = new Date(req.to);
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().slice(0, 10);
        if (dateStr.startsWith(month)) {
          leaveDates.add(dateStr);
        }
      }
    });
    return leaveDates;
  }

  const { leaveRemaining, paidLeaves } = useMemo(() => {
    const months = getAllMonthsUpToCurrentYear();
    let carryOver = 0;
    let paidLeaves = 0;
    for (let i = 0; i < months.length; i++) {
      const month = months[i];
      const available = 1 + carryOver;
      const used = getApprovedLeaveDaysForMonth(leaveRequests, month, employeeId).size;
      if (used > available) {
        paidLeaves += used - available;
        carryOver = 0;
      } else {
        carryOver = available - used;
      }
      if (i === months.length - 1) {
        return { leaveRemaining: carryOver, paidLeaves };
      }
    }
    return { leaveRemaining: carryOver, paidLeaves };
  }, [leaveRequests, employeeId]);

  // ====== LATE PERMISSIONS (moved here from LeaveRequestProvider) ======
  // Dummy data preserved exactly as in your old provider
  const [lateLoginRequests, setLateLoginRequests] = useState([
    { id: 1, employeeId: "EMP101", name: "John Doe", from: "10:00", date: "2025-08-01", lateTill: "12:00", reason: "Traffic jam", status: "Approved" },
    { id: 2, employeeId: "EMP101", name: "John Doe", from: "12:00", date: "2025-08-05", lateTill: "2:00",  reason: "Doctor appointment", status: "Pending" },
    { id: 3, employeeId: "EMP101", name: "John Doe", from: "2:30",  date: "2025-07-20", lateTill: "4:00",  reason: "Family emergency", status: "Rejected" },
  ]);

  // keep the same signature you used originally (from, date, lateTill, reason)
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
  // ================================================================

  return (
    <CurrentEmployeeAttendanceContext.Provider
      value={{
        attendanceRecords,
        monthlyWorkHours,
        monthlyIdleHours,
        leaveRemaining,
        paidLeaves,
        // expose Late Permissions from here now
        lateLoginRequests,
        applyLateLogin,
      }}
    >
      {children}
    </CurrentEmployeeAttendanceContext.Provider>
  );
};

export default CurrentEmployeeAttendanceProvider;
