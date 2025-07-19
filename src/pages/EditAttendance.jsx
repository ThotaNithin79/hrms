import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AttendanceContext } from "../context/AttendanceContext";
import { EmployeeContext } from "../context/EmployeeContext";

const EditAttendance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { attendanceRecords, editAttendance } = useContext(AttendanceContext);
  const { employees } = useContext(EmployeeContext);

  const recordToEdit = attendanceRecords.find((rec) => rec.id === parseInt(id));

  const [formData, setFormData] = useState({
    employeeId: "",
    date: "",
    status: "Present",
  });

  useEffect(() => {
    if (recordToEdit) {
      setFormData({
        employeeId: recordToEdit.employeeId,
        date: recordToEdit.date,
        status: recordToEdit.status,
      });
    }
  }, [recordToEdit]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    const employee = employees.find((emp) => emp.id === formData.employeeId);
    if (!employee) {
      alert("Invalid employee selected");
      return;
    }

    editAttendance(recordToEdit.id, {
      ...formData,
      name: employee.name,
    });

    alert("Attendance updated successfully");
    navigate("/attendance");
  };

  if (!recordToEdit) {
    return <p className="p-6 text-red-600">Attendance record not found.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Edit Attendance</h2>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-md bg-white p-6 rounded-xl shadow"
      >
        <select
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.id})
            </option>
          ))}
        </select>

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />

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

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default EditAttendance;
