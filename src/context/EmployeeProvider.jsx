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
    },
  ]);

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

    const newEmployee = { ...employee, employeeId: id };

    setEmployees([...employees, newEmployee]);
  };

  const editEmployee = (employeeId, updatedData) => {
  setEmployees((prev) =>
    prev.map((emp) =>
      emp.employeeId === employeeId ? { ...emp, ...updatedData } : emp
    )
  );
};

const deleteEmployee = (employeeId) => {
  setEmployees((prev) => prev.filter((emp) => emp.employeeId !== employeeId));
};


  return (
    <EmployeeContext.Provider
      value={{ employees, addEmployee, editEmployee, deleteEmployee }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};
