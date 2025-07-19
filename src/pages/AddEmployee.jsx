import { useState, useContext } from "react";
import { EmployeeContext } from "../context/EmployeeContext";
import { useNavigate } from "react-router-dom";

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    department: "",
  });

  const { addEmployee } = useContext(EmployeeContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addEmployee(formData); // ✅ Add to global context
    alert("Employee added successfully."); // ✅ Show success message
    navigate("/employees"); // ✅ Redirect to EmployeeManagement page
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Add New Employee</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4 max-w-md"
      >
        <input
          type="text"
          name="id"
          placeholder="Employee ID (optional)"
          value={formData.id}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          required
        />
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

export default AddEmployee;
