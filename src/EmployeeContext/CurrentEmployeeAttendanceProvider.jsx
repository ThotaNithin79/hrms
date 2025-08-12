import { useState, useContext, useMemo } from "react";
import { CurrentEmployeeAttendanceContext } from "./CurrentEmployeeAttendanceContext";
import { CurrentEmployeeLeaveRequestContext } from "./CurrentEmployeeLeaveRequestContext";

const CurrentEmployeeAttendanceProvider = ({ children }) => {

  // Generates demo attendance data for all employees for the current month
  const generateMonthlyAttendanceData = () => {
    const employees = [
      { employeeId: "EMP101", name: "John Doe" },
    ];
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
  const [attendanceRecords, setAttendanceRecords] = useState(records);

  // --- Leave Remaining Calculation ---
  // Each employee gets 12 leaves per year (1 per month), unused leaves carry over
  const employeeId = "EMP101";
  const leaveRequests = useContext(CurrentEmployeeLeaveRequestContext)?.leaveRequests || [];

  // Helper: get all months in the current year up to and including the current month in YYYY-MM
  function getAllMonthsUpToCurrentYear() {
    const now = new Date();
    const months = [];
    for (let m = 0; m < now.getMonth() + 1; m++) {
      months.push(`${now.getFullYear()}-${String(m + 1).padStart(2, "0")}`);
    }
    return months;
  }

  // Helper: get all approved leave days for EMP101 in a given month (returns a Set of dates)
  function getApprovedLeaveDaysForMonth(leaveRequests, month, employeeId) {
    let leaveDates = new Set();
    leaveRequests.forEach((req) => {
      if (req.employeeId !== employeeId) return;
      if (req.status !== "Approved") return;
      const from = new Date(req.from);
      const to = new Date(req.to);
      for (
        let d = new Date(from);
        d <= to;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().slice(0, 10);
        if (dateStr.startsWith(month)) {
          leaveDates.add(dateStr);
        }
      }
    });
    return leaveDates;
  }

  // Calculate leave remaining for the current month (with penalty logic)
  // Calculate leave remaining for the current month (with penalty logic)
const leaveRemaining = useMemo(() => {
  const months = getAllMonthsUpToCurrentYear();
  let carryOver = 0;
  let penalty = 0;

  for (let i = 0; i < months.length; i++) {
    const month = months[i];

    // Earned this month: 1 - penalty from previous month (min 0)
    let earned = Math.max(1 - penalty, 0);
    let available = earned + carryOver;

    // Leaves used this month (only approved ones)
    const used = getApprovedLeaveDaysForMonth(
      leaveRequests,
      month,
      employeeId
    ).size;

    let thisMonthCarry = available - used;

    if (thisMonthCarry < 0) {
      penalty = Math.abs(thisMonthCarry);
      carryOver = 0;
    } else {
      penalty = 0;
      carryOver = thisMonthCarry;
    }

    if (i === months.length - 1) {
      return thisMonthCarry;
    }
  }
  return carryOver;
}, [leaveRequests, employeeId]);



  return (
    <CurrentEmployeeAttendanceContext.Provider
      value={{
        attendanceRecords,
        monthlyWorkHours,
        monthlyIdleHours,
        leaveRemaining,
      }}
    >
      {children}
    </CurrentEmployeeAttendanceContext.Provider>
  );
};

export default CurrentEmployeeAttendanceProvider;
