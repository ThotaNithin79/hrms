import { useContext, useState } from "react";
import { AttendanceContext } from "../context/AttendanceContext";
import { EmployeeContext } from "../context/EmployeeContext";
import { useNavigate } from "react-router-dom";

const AddAttendance = () => {
  const { employees } = useContext(EmployeeContext);
  const { addAttendance } = useContext(AttendanceContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeId: "",
    date: "",
    status: "Present",
  });

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedEmployee = employees.find(
      (emp) => emp.employeeId === formData.employeeId
    );

    if (!selectedEmployee) {
      alert("Invalid employee selected");
      return;
    }

    const result = addAttendance({
      ...formData,
      name: selectedEmployee.name,
    });

    if (result && result.success) {
      alert(result.message);
      navigate("/attendance");
    } else {
      alert("Failed to mark attendance. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>

      <form
        onSubmit={handleSubmit}
        className="max-w-md space-y-4 bg-white p-6 rounded-xl shadow"
      >
        {/* Employee Dropdown */}
        <select
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        >
          <option value="">Select Employee</option>
          {employees.filter((emp) => emp.isActive !== false).map((emp) => (
            <option key={emp.employeeId} value={emp.employeeId}>
              {emp.name} ({emp.employeeId})
            </option>
          ))}
        </select>

        {/* Date Picker */}
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

        {/* Status Dropdown */}
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        >
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Leave">Leave</option>
        </select>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddAttendance;
