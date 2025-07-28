import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AttendanceContext } from "../context/AttendanceContext";
import { EmployeeContext } from "../context/EmployeeContext";

const EditAttendance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { attendanceRecords, editAttendance } = useContext(AttendanceContext);
  const { employees } = useContext(EmployeeContext);

  // Support string IDs (e.g., 'EMP101-2025-07-27') and numeric IDs
  const recordToEdit = attendanceRecords.find((rec) => String(rec.id) === String(id));

  const [formData, setFormData] = useState({
    employeeId: "",
    date: "",
    status: "Present",
  });

  useEffect(() => {
    if (recordToEdit) {
      setFormData({
        employeeId: recordToEdit.employeeId, // Use employeeId as is (string like EMP102)
        date: recordToEdit.date,
        status: recordToEdit.status,
      });
    }
  }, [recordToEdit]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    const employee = employees.find((emp) => emp.employeeId === formData.employeeId);
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
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition shadow flex items-center gap-2"
        >
          &#8592; Go Back
        </button>
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Edit Attendance</h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="employeeId">Employee</label>
            <select
              name="employeeId"
              id="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg bg-gray-50 font-semibold"
              required
            >
              <option value="">Select Employee</option>
              {employees.filter((emp) => emp.isActive !== false).map((emp) => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="date">Date</label>
            <input
              type="date"
              name="date"
              id="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg bg-gray-50 font-semibold"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="status">Status</label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-lg bg-gray-50 font-semibold"
              required
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow"
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditAttendance;
