import { useState } from "react";
import { EmployeeContext } from "./EmployeeContext";


export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([
    {
      employeeId: "EMP101",
      name: "John Doe",
      email: "john@example.com",
      department: "HR",
      phone: "9876543210",
      address: "Hyderabad",
      joiningDate: "2023-05-10",
      emergency: "Jane Doe - 9999999999",
      isActive: true,
      bankDetails: {
        accountNumber: "1234567890",
        bankName: "State Bank of India",
        ifsc: "SBIN0001234",
        branch: "Hyderabad Main"
      },
      personalDetails: {
        dob: "1990-01-15",
        gender: "Male",
        maritalStatus: "Married",
        nationality: "Indian"
      },
      experienceDetails: [
        {
          company: "ABC Corp",
          role: "HR Executive",
          years: 2,
          joiningDate: "2019-01-15",
          lastWorkingDate: "2021-01-14",
          salary: 45000
        },
        {
          company: "XYZ Ltd",
          role: "HR Manager",
          years: 3,
          joiningDate: "2021-02-01",
          lastWorkingDate: "2024-01-31",
          salary: 65000
        }
      ]
    },
    {
      employeeId: "EMP102",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      department: "Finance",
      phone: "9876501234",
      address: "Bangalore",
      joiningDate: "2022-11-15",
      emergency: "Robert Johnson - 8888888888",
      isActive: true,
      bankDetails: {
        accountNumber: "2345678901",
        bankName: "HDFC Bank",
        ifsc: "HDFC0005678",
        branch: "Bangalore MG Road"
      },
      personalDetails: {
        dob: "1988-05-22",
        gender: "Female",
        maritalStatus: "Single",
        nationality: "Indian"
      },
      experienceDetails: [
        {
          company: "FinTech Solutions",
          role: "Accountant",
          years: 4,
          joiningDate: "2018-03-01",
          lastWorkingDate: "2022-02-28",
          salary: 55000
        }
      ]
    },
    {
      employeeId: "EMP103",
      name: "Michael Smith",
      email: "michael.smith@example.com",
      department: "IT",
      phone: "9876512345",
      address: "Chennai",
      joiningDate: "2023-01-20",
      emergency: "Laura Smith - 7777777777",
      isActive: true,
      bankDetails: {
        accountNumber: "3456789012",
        bankName: "ICICI Bank",
        ifsc: "ICIC0003456",
        branch: "Chennai Anna Nagar"
      },
      personalDetails: {
        dob: "1992-09-10",
        gender: "Male",
        maritalStatus: "Single",
        nationality: "Indian"
      },
      experienceDetails: [
        {
          company: "TechSoft",
          role: "Software Engineer",
          years: 5,
          joiningDate: "2018-01-01",
          lastWorkingDate: "2022-12-31",
          salary: 75000
        }
      ]
    },
    {
      employeeId: "EMP104",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      department: "Marketing",
      phone: "9876523456",
      address: "Delhi",
      joiningDate: "2023-04-01",
      emergency: "Ravi Sharma - 6666666666",
      isActive: true,
      bankDetails: {
        accountNumber: "4567890123",
        bankName: "Axis Bank",
        ifsc: "UTIB0004567",
        branch: "Delhi Connaught Place"
      },
      personalDetails: {
        dob: "1991-12-05",
        gender: "Female",
        maritalStatus: "Married",
        nationality: "Indian"
      },
      experienceDetails: [
        {
          company: "MarketMinds",
          role: "Marketing Lead",
          years: 6,
          joiningDate: "2017-01-01",
          lastWorkingDate: "2022-12-31",
          salary: 70000
        }
      ]
    },
    {
      employeeId: "EMP105",
      name: "Amit Kumar",
      email: "amit.kumar@example.com",
      department: "Sales",
      phone: "9876534567",
      address: "Pune",
      joiningDate: "2022-09-25",
      emergency: "Sneha Kumar - 5555555555",
      isActive: true,
      bankDetails: {
        accountNumber: "5678901234",
        bankName: "Bank of Baroda",
        ifsc: "BARB0PUNEXX",
        branch: "Pune Camp"
      },
      personalDetails: {
        dob: "1987-03-18",
        gender: "Male",
        maritalStatus: "Married",
        nationality: "Indian"
      },
      experienceDetails: [
        {
          company: "SalesPro",
          role: "Sales Executive",
          years: 3,
          joiningDate: "2017-01-01",
          lastWorkingDate: "2019-12-31",
          salary: 40000
        },
        {
          company: "RetailMart",
          role: "Sales Manager",
          years: 2,
          joiningDate: "2020-01-01",
          lastWorkingDate: "2021-12-31",
          salary: 60000
        }
      ]
    },
    {
      employeeId: "EMP106",
      name: "Sara Lee",
      email: "sara.lee@example.com",
      department: "HR",
      phone: "9876545678",
      address: "Kolkata",
      joiningDate: "2023-06-18",
      emergency: "Tom Lee - 4444444444",
      isActive: true,
      bankDetails: {
        accountNumber: "6789012345",
        bankName: "Punjab National Bank",
        ifsc: "PUNB0123456",
        branch: "Kolkata Park Street"
      },
      personalDetails: {
        dob: "1993-07-22",
        gender: "Female",
        maritalStatus: "Single",
        nationality: "Indian"
      },
      experienceDetails: [
        {
          company: "HR Solutions",
          role: "HR Assistant",
          years: 2,
          joiningDate: "2021-01-01",
          lastWorkingDate: "2022-12-31",
          salary: 35000
        }
      ]
    },
    {
      employeeId: "EMP107",
      name: "Rohan Mehta",
      email: "rohan.mehta@example.com",
      department: "IT",
      phone: "9876556789",
      address: "Ahmedabad",
      joiningDate: "2023-03-05",
      emergency: "Neha Mehta - 3333333333",
      isActive: true,
      bankDetails: {
        accountNumber: "7890123456",
        bankName: "Kotak Mahindra Bank",
        ifsc: "KKBK0007890",
        branch: "Ahmedabad CG Road"
      },
      personalDetails: {
        dob: "1994-11-30",
        gender: "Male",
        maritalStatus: "Single",
        nationality: "Indian"
      },
      experienceDetails: [
        {
          company: "CodeWorks",
          role: "Developer",
          years: 4,
          joiningDate: "2019-01-01",
          lastWorkingDate: "2022-12-31",
          salary: 80000
        }
      ]
    },
    {
      employeeId: "EMP108",
      name: "Anjali Nair",
      email: "anjali.nair@example.com",
      department: "Finance",
      phone: "9876567890",
      address: "Kochi",
      joiningDate: "2022-12-12",
      emergency: "Deepak Nair - 2222222222",
      isActive: true,
      bankDetails: {
        accountNumber: "8901234567",
        bankName: "Canara Bank",
        ifsc: "CNRB0008901",
        branch: "Kochi Ernakulam"
      },
      personalDetails: {
        dob: "1990-05-05",
        gender: "Female",
        maritalStatus: "Married",
        nationality: "Indian"
      },
      experienceDetails: [
        {
          company: "FinanceHub",
          role: "Finance Analyst",
          years: 5,
          joiningDate: "2017-01-01",
          lastWorkingDate: "2021-12-31",
          salary: 68000
        }
      ]
    },
    {
      employeeId: "EMP109",
      name: "David Wilson",
      email: "david.wilson@example.com",
      department: "Admin",
      phone: "9876578901",
      address: "Mumbai",
      joiningDate: "2023-02-10",
      emergency: "Emma Wilson - 1111111111",
      isActive: true,
      bankDetails: {
        accountNumber: "9012345678",
        bankName: "Union Bank of India",
        ifsc: "UBIN0901234",
        branch: "Mumbai Andheri"
      },
      personalDetails: {
        dob: "1985-08-14",
        gender: "Male",
        maritalStatus: "Married",
        nationality: "Indian"
      },
      experienceDetails: [
        {
          company: "AdminPlus",
          role: "Admin Officer",
          years: 6,
          joiningDate: "2017-01-01",
          lastWorkingDate: "2022-12-31",
          salary: 50000
        }
      ]
    },
    {
      employeeId: "EMP110",
      name: "Meera Raj",
      email: "meera.raj@example.com",
      department: "Operations",
      phone: "9876589012",
      address: "Jaipur",
      joiningDate: "2023-07-01",
      emergency: "Anand Raj - 9999988888",
      isActive: true,
      bankDetails: {
        accountNumber: "1234098765",
        bankName: "IndusInd Bank",
        ifsc: "INDB0123409",
        branch: "Jaipur Malviya Nagar"
      },
      personalDetails: {
        dob: "1996-02-28",
        gender: "Female",
        maritalStatus: "Single",
        nationality: "Indian"
      },
      experienceDetails: [
        {
          company: "OpsGlobal",
          role: "Operations Executive",
          years: 2,
          joiningDate: "2021-01-01",
          lastWorkingDate: "2022-12-31",
          salary: 42000
        }
      ]
    },
  ]);

  // Only expose essential CRUD and utility functions
  const addEmployee = (employee) => {
    const id =
      employee.id?.trim() !== ""
        ? employee.id.trim()
        : `EMP${(employees.length + 1).toString().padStart(3, "0")}`;

    const isDuplicate = employees.some((emp) => emp.id === id);
    if (isDuplicate) {
      alert("Employee ID already exists. Please choose a unique ID.");
      return;
    }

    const newEmployee = { ...employee, employeeId: id, isActive: true };

    setEmployees([...employees, newEmployee]);
  };

  const editEmployee = (employeeId, updatedData) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.employeeId === employeeId ? { ...emp, ...updatedData } : emp
      )
    );
  };
  
  const deactivateEmployee = (employeeId) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.employeeId === employeeId ? { ...emp, isActive: false } : emp
      )
    );
  };
  
  const activateEmployee = (employeeId) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.employeeId === employeeId ? { ...emp, isActive: true } : emp
      )
    );
  };

  const getEmployeeById = (employeeId) => employees.find(emp => emp.employeeId === employeeId);


  return (
    <EmployeeContext.Provider
      value={{
        employees,
        addEmployee,
        editEmployee,
        deactivateEmployee,
        activateEmployee,
        getEmployeeById,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};
