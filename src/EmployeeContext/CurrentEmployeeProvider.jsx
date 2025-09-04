import { useState,useEffect  } from "react";
import { CurrentEmployeeContext } from "./CurrentEmployeeContext";



const idle_time = 1.25;


export const CurrentEmployeeProvider = ({ children }) => {
  // Store current employee as an object, add profilePhoto (null by default)
  const [currentEmployee, setCurrentEmployee] = useState({
    personal: {
      name: "John Doe",
      fatherName: "Richard Doe",
      dob: "1990-01-15",
      gender: "Male",
      marital_status: "Married",
      nationality: "Indian",
      aadhaar_number: "123456789012",
      pan_number: "ABCDE1234F",
      profile_photo: null, // base64 or url string
      aadhaar: null, // base64 or url string
      pan: null, // base64 or url string
      resume: null,
      employeeId: "EMP101",
    },
    
  });

  const [employeeStats, setEmployeeStats] = useState({
    ot_incentive_days: 5,
    ot_pending_days: 2,
    emergency_contact_name: "Ramya",
    emergency_contact_relation: "Sister",
    emergency_contact_phone: "9999999999",
    worked_days: 18,
    total_worked_days: 20, // fixed typo
    address: "Hyderabad",
    email: "sahithyaakurathi@gmail.com",
    phone: "9988776655",
  });


const [leaveStats, setLeaveStats] = useState({
    full_day_leaves_approved: 4,
    half_day_leaves_approved: 2,
    paid_leave_count: 3,
    pending_leave_count: 1,
    sandwich_leave_count: 0,
    unpaid_leave_count: 1,
  });


const [officeTimings, setOfficeTimings] = useState({
    office_start: "09:30",
    office_end: "18:30",
    full_day_threshold: 9,
  });


  const [monthlyStats, setMonthlyStats] = useState({
    monthlyWorkHours: 160,   // example: 20 days * 8 hrs
    monthlyLeaves: 2,        // example: 2 leaves
    monthlyIdleHours: 12,    // example: total idle hours this month
  });


const [job, setJob] = useState({
    dept_id: "1",
    department: "HR",
    designation: "HR Manager",
    doj: "2023-05-10",
  });

  const [bank, setBank] = useState({
  account_number: "1234567890",
  bank_name: "State Bank of India",
  ifsc_code: "SBIN0001234",
  branch: "Hyderabad Main",
});

const [experienceStats, setExperienceStats] = useState({
    company: "ABC Corp",
        role: "HR Executive",
        years: 2,
        joining_date: "2019-01-15",
        salary: 45000,
        reason: "",
        department: "HR",
        last_working_date: "2021-01-14",
        experience_letter: null, // base64 or url string
        pastemployementtype: "Full-time",
  });


const editBank = (updatedBank) => {
  setBank((prev) => ({
    ...prev,
    ...updatedBank,
  }));
};


const editExperience = (updatedExperience) => {
  setExperienceStats((prev) => ({
    ...prev,
    ...updatedExperience,
  }));
};


const initialNotices = [
  {
    id: 1,
    title: "Project Alpha Launch Date",
    message:
      "The launch date for Project Alpha has been moved to September 15th. All teams must finalize their deliverables by EOD September 10th.",
    author: "Admin",
    date: "2025-08-11",
  },
  {
    id: 2,
    title: "Employee Wellness Program",
    message:
      "A new wellness program is being introduced starting October. Details will be shared in a company-wide email next week.",
    author: "Admin",
    date: "2025-08-08",
  },
];



  // Edit function for current employee (supports profilePhoto, aadhaar, pan update)
  const editCurrentEmployee = async (updatedData) => {
  setCurrentEmployee((prev) => ({
    ...prev,
    personal: { ...prev.personal, ...(updatedData.personal || {}) },
  }));

  try {
    await fetch("/api/employee/EMP101", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
  } catch (err) {
    console.warn("Backend update failed, kept only local state", err);
  }
};



  const editEmployeeStats = (updatedStats) => {
    setEmployeeStats((prev) => ({
      ...prev,
      ...updatedStats,
    }));
  };


  const editJob = (updatedJob) => {
  setJob((prev) => ({
    ...prev,
    ...updatedJob,
  }));
};


const punchIn = async () => {
  try {
    await fetch("/api/attendance/punch-in", { method: "POST" });
  } catch {
    console.warn("Backend not available → storing dummy punch in");
    // optional: update local state with fallback punch-in record
  }
};

const punchOut = async () => {
  try {
    await fetch("/api/attendance/punch-out", { method: "POST" });
  } catch {
    console.warn("Backend not available → storing dummy punch out");
    // optional: update local state with fallback punch-out record
  }
};



useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch("/api/employee/EMP101");
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();

      // Map API response to provider states
      setCurrentEmployee(data.currentEmployee);
      setEmployeeStats(data.employeeStats);
      setLeaveStats(data.leaveStats);
      setOfficeTimings(data.officeTimings);
      setMonthlyStats(data.monthlyStats);
      setJob(data.job);
      setBank(data.bank);
      setExperienceStats(data.experienceStats);
    } catch (err) {
      console.warn("Backend not available, using dummy data", err);
    }
  };

  fetchData();
}, []);


  return (
    <CurrentEmployeeContext.Provider
      value={{ currentEmployee, editCurrentEmployee, idle_time, employeeStats, setEmployeeStats , editEmployeeStats, leaveStats, setLeaveStats , officeTimings, setOfficeTimings, monthlyStats, setMonthlyStats, job, setJob, editJob , bank, setBank, editBank, experienceStats, setExperienceStats, editExperience, initialNotices }}
    >
      {children}
    </CurrentEmployeeContext.Provider>
  );
};
