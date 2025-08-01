import { useState } from "react";
import { CurrentEmployeeContext } from "./CurrentEmployeeContext";

export const CurrentEmployeeProvider = ({ children }) => {
  // Store current employee as an object
  const [currentEmployee, setCurrentEmployee] = useState({
    personal: {
      name: "John Doe",
      fatherName: "Richard Doe",
      dob: "1990-01-15",
      gender: "Male",
      maritalStatus: "Married",
      nationality: "Indian",
      isActive: true,
    },
    contact: {
      email: "john@example.com",
      phone: "9876543210",
      address: "Hyderabad",
      city: "Hyderabad",
      emergency_contact_name: "ramya",
      emergency_contact_phone: "9999999999",
      emergency_contact_relation: "sister",
    },
    job: {
      employeeId: "EMP101",
      department_id:"1", 
      department: "HR",
      designation: "HR Manager",
      joiningDate: "2023-05-10",
    },
    bank: {
      accountNumber: "1234567890",
      bankName: "State Bank of India",
      ifsc: "SBIN0001234",
      branch: "Hyderabad Main",
    },
    experience: [
      {
        company: "ABC Corp",
        role: "HR Executive",
        years: 2,
        joiningDate: "2019-01-15",
        lastWorkingDate: "2021-01-14",
        salary: 45000,
      },
      {
        company: "XYZ Ltd",
        role: "HR Manager",
        years: 3,
        joiningDate: "2021-02-01",
        lastWorkingDate: "2023-05-09",
        salary: 65000,
      },
    ],
  });

  // Edit function for current employee
  const editCurrentEmployee = (updatedData) => {
    setCurrentEmployee((prev) => ({
      ...prev,
      ...updatedData,
    }));
  };

  return (
    <CurrentEmployeeContext.Provider
      value={{ currentEmployee, editCurrentEmployee }}
    >
      {children}
    </CurrentEmployeeContext.Provider>
  );
};
