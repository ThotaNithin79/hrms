import { useState } from "react";
import { EmployeeContext } from "./EmployeeContext";


export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([
    {
      employeeId: "EMP101",
      name: "John Doe",
      email: "john@example.com",
      phone: "9876543210",
      address: "Hyderabad",
      emergency: "Jane Doe - 9999999999",
      isActive: true,
      bankDetails: {
        accountNumber: "1234567890",
        bankName: "State Bank of India",
        ifsc: "SBIN0001234",
        branch: "Hyderabad Main",
      },
      personalDetails: {
        dob: "1990-01-15",
        gender: "Male",
        maritalStatus: "Married",
        nationality: "Indian",
      },
      experienceDetails: [
        {
          company: "ABC Corp",
          role: "HR Executive",
          department: "HR",
          years: 2,
          joiningDate: "2019-01-15",
          lastWorkingDate: "2021-01-14",
          salary: 45000,
        },
        {
          company: "XYZ Ltd",
          role: "HR Manager",
          department: "HR",
          years: 3,
          joiningDate: "2021-02-01",
          lastWorkingDate: "2024-01-31",
          salary: 65000,
        },
        {
          company: "Vagarious Solutions Pvt Ltd.",
          role: "HR Manager",
          department: "HR",
          years: 3,
          joiningDate: "2023-05-10",
          lastWorkingDate: "Present",
          salary: 65000,
        },
      ],
    },
    {
      employeeId: "EMP102",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      phone: "9876501234",
      address: "Bangalore",
      emergency: "Robert Johnson - 8888888888",
      isActive: true,
      bankDetails: {
        accountNumber: "2345678901",
        bankName: "HDFC Bank",
        ifsc: "HDFC0005678",
        branch: "Bangalore MG Road",
      },
      personalDetails: {
        dob: "1988-05-22",
        gender: "Female",
        maritalStatus: "Single",
        nationality: "Indian",
      },
      experienceDetails: [
        {
          company: "FinTech Solutions",
          role: "Accountant",
          department: "Finance",
          years: 4,
          joiningDate: "2018-03-01",
          lastWorkingDate: "2022-02-28",
          salary: 55000,
        },
        {
          company: "Vagarious Solutions Pvt Ltd.",
          role: "Finance Employee",
          department: "Finance",
          years: 3,
          joiningDate: "2022-11-15",
          lastWorkingDate: "Present",
          salary: 65000,
        },
      ],
    },
    {
      employeeId: "EMP103",
      name: "Michael Smith",
      email: "michael.smith@example.com",
      phone: "9876512345",
      address: "Chennai",
      emergency: "Laura Smith - 7777777777",
      isActive: true,
      bankDetails: {
        accountNumber: "3456789012",
        bankName: "ICICI Bank",
        ifsc: "ICIC0003456",
        branch: "Chennai Anna Nagar",
      },
      personalDetails: {
        dob: "1992-09-10",
        gender: "Male",
        maritalStatus: "Single",
        nationality: "Indian",
      },
      experienceDetails: [
        {
          company: "TechSoft",
          role: "Software Engineer",
          department: "IT",
          years: 5,
          joiningDate: "2018-01-01",
          lastWorkingDate: "2022-12-31",
          salary: 75000,
        },
        {
          company: "Vagarious Solutions Pvt Ltd.",
          role: "IT Employee",
          department: "IT",
          years: 2,
          joiningDate: "2023-01-20",
          lastWorkingDate: "Present",
          salary: 80000,
        },
      ],
    },
    {
      employeeId: "EMP104",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "9876523456",
      address: "Delhi",
      emergency: "Ravi Sharma - 6666666666",
      isActive: true,
      bankDetails: {
        accountNumber: "4567890123",
        bankName: "Axis Bank",
        ifsc: "UTIB0004567",
        branch: "Delhi Connaught Place",
      },
      personalDetails: {
        dob: "1991-12-05",
        gender: "Female",
        maritalStatus: "Married",
        nationality: "Indian",
      },
      experienceDetails: [
        {
          company: "MarketMinds",
          role: "Marketing Lead",
          department: "Marketing",
          years: 6,
          joiningDate: "2017-01-01",
          lastWorkingDate: "2022-12-31",
          salary: 70000,
        },
        {
          company: "Vagarious Solutions Pvt Ltd.",
          role: "Marketing Employee",
          department: "Marketing",
          years: 2,
          joiningDate: "2023-04-01",
          lastWorkingDate: "Present",
          salary: 75000,
        },
      ],
    },
    {
      employeeId: "EMP105",
      name: "Amit Kumar",
      email: "amit.kumar@example.com",
      phone: "9876534567",
      address: "Pune",
      emergency: "Sneha Kumar - 5555555555",
      isActive: true,
      bankDetails: {
        accountNumber: "5678901234",
        bankName: "Bank of Baroda",
        ifsc: "BARB0PUNEXX",
        branch: "Pune Camp",
      },
      personalDetails: {
        dob: "1987-03-18",
        gender: "Male",
        maritalStatus: "Married",
        nationality: "Indian",
      },
      experienceDetails: [
        {
          company: "SalesPro",
          role: "Sales Executive",
          department: "Sales",
          years: 3,
          joiningDate: "2017-01-01",
          lastWorkingDate: "2019-12-31",
          salary: 40000,
        },
        {
          company: "RetailMart",
          role: "Sales Manager",
          department: "Sales",
          years: 2,
          joiningDate: "2020-01-01",
          lastWorkingDate: "2021-12-31",
          salary: 60000,
        },
        {
          company: "Vagarious Solutions Pvt Ltd.",
          role: "Sales Employee",
          department: "Sales",
          years: 3,
          joiningDate: "2022-09-25",
          lastWorkingDate: "Present",
          salary: 65000,
        },
      ],
    },
    {
      employeeId: "EMP106",
      name: "Sara Lee",
      email: "sara.lee@example.com",
      phone: "9876545678",
      address: "Kolkata",
      emergency: "Tom Lee - 4444444444",
      isActive: true,
      bankDetails: {
        accountNumber: "6789012345",
        bankName: "Punjab National Bank",
        ifsc: "PUNB0123456",
        branch: "Kolkata Park Street",
      },
      personalDetails: {
        dob: "1993-07-22",
        gender: "Female",
        maritalStatus: "Single",
        nationality: "Indian",
      },
      experienceDetails: [
        {
          company: "HR Solutions",
          role: "HR Assistant",
          department: "HR",
          years: 2,
          joiningDate: "2021-01-01",
          lastWorkingDate: "2022-12-31",
          salary: 35000,
        },
        {
          company: "Vagarious Solutions Pvt Ltd.",
          role: "HR Employee",
          department: "HR",
          years: 2,
          joiningDate: "2023-06-18",
          lastWorkingDate: "Present",
          salary: 40000,
        },
      ],
    },
    {
      employeeId: "EMP107",
      name: "Rohan Mehta",
      email: "rohan.mehta@example.com",
      phone: "9876556789",
      address: "Ahmedabad",
      emergency: "Neha Mehta - 3333333333",
      isActive: true,
      bankDetails: {
        accountNumber: "7890123456",
        bankName: "Kotak Mahindra Bank",
        ifsc: "KKBK0007890",
        branch: "Ahmedabad CG Road",
      },
      personalDetails: {
        dob: "1994-11-30",
        gender: "Male",
        maritalStatus: "Single",
        nationality: "Indian",
      },
      experienceDetails: [
        {
          company: "CodeWorks",
          role: "Developer",
          department: "IT",
          years: 4,
          joiningDate: "2019-01-01",
          lastWorkingDate: "2022-12-31",
          salary: 80000,
        },
        {
          company: "Vagarious Solutions Pvt Ltd.",
          role: "IT Employee",
          department: "IT",
          years: 2,
          joiningDate: "2023-03-05",
          lastWorkingDate: "Present",
          salary: 85000,
        },
      ],
    },
    {
      employeeId: "EMP108",
      name: "Anjali Nair",
      email: "anjali.nair@example.com",
      phone: "9876567890",
      address: "Kochi",
      emergency: "Deepak Nair - 2222222222",
      isActive: true,
      bankDetails: {
        accountNumber: "8901234567",
        bankName: "Canara Bank",
        ifsc: "CNRB0008901",
        branch: "Kochi Ernakulam",
      },
      personalDetails: {
        dob: "1990-05-05",
        gender: "Female",
        maritalStatus: "Married",
        nationality: "Indian",
      },
      experienceDetails: [
        {
          company: "FinanceHub",
          role: "Finance Analyst",
          department: "Finance",
          years: 5,
          joiningDate: "2017-01-01",
          lastWorkingDate: "2021-12-31",
          salary: 68000,
        },
        {
          company: "Vagarious Solutions Pvt Ltd.",
          role: "Finance Employee",
          department: "Finance",
          years: 3,
          joiningDate: "2022-12-12",
          lastWorkingDate: "Present",
          salary: 72000,
        },
      ],
    },
    {
      employeeId: "EMP109",
      name: "David Wilson",
      email: "david.wilson@example.com",
      phone: "9876578901",
      address: "Mumbai",
      emergency: "Emma Wilson - 1111111111",
      isActive: true,
      bankDetails: {
        accountNumber: "9012345678",
        bankName: "Union Bank of India",
        ifsc: "UBIN0901234",
        branch: "Mumbai Andheri",
      },
      personalDetails: {
        dob: "1985-08-14",
        gender: "Male",
        maritalStatus: "Married",
        nationality: "Indian",
      },
      experienceDetails: [
        {
          company: "AdminPlus",
          role: "Admin Officer",
          department: "Admin",
          years: 6,
          joiningDate: "2017-01-01",
          lastWorkingDate: "2022-12-31",
          salary: 50000,
        },
        {
          company: "Vagarious Solutions Pvt Ltd.",
          role: "Admin Employee",
          department: "Admin",
          years: 2,
          joiningDate: "2023-02-10",
          lastWorkingDate: "Present",
          salary: 55000,
        },
      ],
    },
    {
      employeeId: "EMP110",
      name: "Meera Raj",
      email: "meera.raj@example.com",
      phone: "9876589012",
      address: "Jaipur",
      emergency: "Anand Raj - 9999988888",
      isActive: true,
      bankDetails: {
        accountNumber: "1234098765",
        bankName: "IndusInd Bank",
        ifsc: "INDB0123409",
        branch: "Jaipur Malviya Nagar",
      },
      personalDetails: {
        dob: "1996-02-28",
        gender: "Female",
        maritalStatus: "Single",
        nationality: "Indian",
      },
      experienceDetails: [
        {
          company: "OpsGlobal",
          role: "Operations Executive",
          department: "Operations",
          years: 2,
          joiningDate: "2021-01-01",
          lastWorkingDate: "2022-12-31",
          salary: 42000,
        },
        {
          company: "Vagarious Solutions Pvt Ltd.",
          role: "Operations Employee",
          department: "Operations",
          years: 2,
          joiningDate: "2023-07-01",
          lastWorkingDate: "Present",
          salary: 48000,
        },
      ],
    },
  ]);

  // CRUD and utility functions
  const addEmployee = (employee) => {
    // Use employee.employeeId if present, else auto-generate
    let id = "";
    if (typeof employee.employeeId === "string" && employee.employeeId.trim() !== "") {
      id = employee.employeeId.trim();
    } else {
      id = `EMP${(employees.length + 1).toString().padStart(3, "0")}`;
    }
    if (employees.some((emp) => emp.employeeId === id)) {
      alert("Employee ID already exists. Please choose a unique ID.");
      return;
    }
    setEmployees([...employees, { ...employee, employeeId: id, isActive: true }]);
  };


  // Edit employee details (used for reactivation)
  const editEmployee = (employeeId, updatedData) => {
    setEmployees((prev) => prev.map((emp) => {
      if (emp.employeeId === employeeId) {
        // If reactivating, use experienceDetails from updatedData (already patched in ReactivateEmployee)
        if (updatedData.isActive && Array.isArray(updatedData.experienceDetails)) {
          return {
            ...emp,
            ...updatedData,
            experienceDetails: updatedData.experienceDetails
          };
        }
        // Otherwise, just update
        return { ...emp, ...updatedData };
      }
      return emp;
    }));
  };

  // Deactivate employee: update end date of current employment in experienceDetails
  const deactivateEmployee = (employeeId) => {
    setEmployees((prev) => prev.map((emp) => {
      if (emp.employeeId === employeeId && emp.isActive) {
        const today = new Date().toISOString().slice(0, 10);
        let updatedExp = Array.isArray(emp.experienceDetails)
          ? emp.experienceDetails.map(exp =>
              exp.lastWorkingDate === "Present"
                ? { ...exp, lastWorkingDate: today }
                : exp
            )
          : [];
        return {
          ...emp,
          isActive: false,
          experienceDetails: updatedExp,
        };
      }
      return emp;
    }));
  };

  // Activate employee: set new joining date
  const activateEmployee = (employeeId) => {
    setEmployees((prev) => prev.map((emp) => {
      if (emp.employeeId === employeeId && !emp.isActive) {
        const today = new Date().toISOString().slice(0, 10);
        return {
          ...emp,
          isActive: true,
          joiningDate: today,
          salary: emp.salary || 0
        };
      }
      return emp;
    }));
  };

  const getEmployeeById = (employeeId) => employees.find(emp => emp.employeeId === employeeId);

  // Context value
  const contextValue = {
    employees,
    addEmployee,
    editEmployee,
    deactivateEmployee,
    activateEmployee,
    getEmployeeById,
  };

  return (
    <EmployeeContext.Provider value={contextValue}>
      {children}
    </EmployeeContext.Provider>
  );
};
