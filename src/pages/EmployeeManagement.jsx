import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { EmployeeContext } from "../context/EmployeeContext";

const EmployeeManagement = () => {
  const navigate = useNavigate();
  const { employees, deleteEmployee } = useContext(EmployeeContext);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔍 Filter employees based on search query
  const filteredEmployees = employees.filter((emp) =>
    [emp.id, emp.name, emp.department, emp.email].some((field) =>
      (field ?? "").toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Employee Management</h2>
        <button
          onClick={() => navigate("/employees/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Employee
        </button>
      </div>

      {/* 🔍 Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by ID, Name, Department, or Email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md border px-4 py-2 rounded"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Department</th>
              <th className="p-4">Email</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={`${emp.employeeId}-${emp.email}`} className="border-t">
  <td className="p-4">{emp.employeeId}</td>
  <td className="p-4">{emp.name}</td>
  <td className="p-4">{emp.department}</td>
  <td className="p-4">{emp.email}</td>
  <td className="p-4 space-x-2">
    <button
      onClick={() => navigate(`/employee/${emp.employeeId}/profile`)}
      className="text-purple-600 hover:underline"
    >
      Profile
    </button>
    <button
      onClick={() => navigate(`/employees/edit/${emp.employeeId}`)}
      className="text-green-600 hover:underline"
    >
      Edit
    </button>
    <button
      onClick={() => {
        const confirmDelete = window.confirm(
          `Are you sure you want to delete ${emp.name}?`
        );
        if (confirmDelete) {
          deleteEmployee(emp.employeeId);
          alert(`${emp.name} has been deleted successfully.`);
        }
      }}
      className="text-red-600 hover:underline"
    >
      Delete
    </button>
  </td>
</tr>

              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No matching employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeManagement;
