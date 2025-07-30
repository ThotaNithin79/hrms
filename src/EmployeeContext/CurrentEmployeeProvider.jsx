import { useState } from "react";
import { CurrentEmployeeContext } from "./CurrentEmployeeContext";

export const CurrentEmployeeProvider = ({ children }) => {
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
          years: 2
        },
        {
          company: "XYZ Ltd",
          role: "HR Manager",
          years: 3
        }
      ]
    },
  ]);

  const editEmployee = (employeeId, updatedData) => {
  setEmployees((prev) =>
    prev.map((emp) =>
      emp.employeeId === employeeId ? { ...emp, ...updatedData } : emp
    )
  );
};

  return (
    <CurrentEmployeeContext.Provider
      value={{ employees, editEmployee, }}
    >
      {children}
    </CurrentEmployeeContext.Provider>
  );
};
