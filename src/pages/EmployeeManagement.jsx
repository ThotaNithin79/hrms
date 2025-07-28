import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { EmployeeContext } from "../context/EmployeeContext";


import { FaUser, FaEdit, FaTrash } from "react-icons/fa";

const EmployeeManagement = () => {
  const navigate = useNavigate();
  const { employees, deactivateEmployee } = useContext(EmployeeContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [snackbar, setSnackbar] = useState("");

  // Get unique departments
  const departmentSet = Array.from(new Set(employees.map((emp) => emp.department))).sort();

  // Filter employees based on search query and department
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = [emp.employeeId, emp.name, emp.department, emp.email].some((field) =>
      (field ?? "").toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesDept = selectedDept === "All" || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Separate active and inactive employees
  const activeEmployees = filteredEmployees.filter((emp) => emp.isActive !== false);
  const inactiveEmployees = filteredEmployees.filter((emp) => emp.isActive === false);

  // Snackbar timeout
  const showSnackbar = (msg) => {
    setSnackbar(msg);
    setTimeout(() => setSnackbar(""), 2500);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center py-0">
      <div className="w-full max-w-7xl mx-auto py-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Employee Management</h2>
          <button
            onClick={() => navigate("/employees/add")}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 flex items-center gap-2 shadow font-semibold"
          >
            <FaUser /> Add Employee
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
          <input
            type="text"
            placeholder="Search by ID, Name, Department, or Email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md border border-gray-300 px-4 py-2 rounded-lg shadow focus:outline-none focus:ring focus:ring-blue-200"
          />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg w-full max-w-xs shadow focus:outline-none focus:ring focus:ring-blue-200 font-semibold"
          >
            <option value="All">All Departments</option>
            {departmentSet.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl shadow bg-white">
          <table className="min-w-full rounded-xl">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-100 text-left">
                <th className="p-4">ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Department</th>
                <th className="p-4">Email</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeEmployees.length > 0 || inactiveEmployees.length > 0) ? (
                <>
                  {/* Active Employees */}
                  {activeEmployees.map((emp, idx) => (
                    <tr
                      key={`${emp.employeeId}-${emp.email}`}
                      className={`border-t transition duration-150 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50`}
                    >
                      <td className="p-4 font-mono font-semibold text-blue-700">{emp.employeeId}</td>
                      <td className="p-4 flex items-center gap-2">
                        {/* Avatar or initials */}
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-blue-700 font-bold border border-gray-300">
                          {emp.name?.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="font-semibold text-gray-800">{emp.name}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${emp.department === "HR" ? "bg-pink-100 text-pink-700" : emp.department === "Engineering" ? "bg-blue-100 text-blue-700" : emp.department === "Sales" ? "bg-green-100 text-green-700" : emp.department === "Marketing" ? "bg-yellow-100 text-yellow-700" : emp.department === "Finance" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}>
                          {emp.department}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700">{emp.email}</td>
                      <td className="p-4">
                        <div className="flex flex-row items-center gap-2">
                          <button
                            onClick={() => navigate(`/employee/${emp.employeeId}/profile`)}
                            className="bg-gray-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1 font-semibold shadow"
                            title="View Profile"
                          >
                            <FaUser /> Profile
                          </button>
                          <button
                            onClick={() => navigate(`/employees/edit/${emp.employeeId}`)}
                            className="bg-gray-100 text-green-700 px-2 py-1 rounded hover:bg-green-100 flex items-center gap-1 font-semibold shadow"
                            title="Edit Employee"
                          >
                            <FaEdit /> Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to deactivate ${emp.name}?`)) {
                                deactivateEmployee(emp.employeeId);
                                showSnackbar(`${emp.name} deactivated successfully.`);
                              }
                            }}
                            className="bg-gray-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-100 flex items-center gap-1 font-semibold shadow"
                            title="Deactivate Employee"
                          >
                            <FaTrash /> Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Inactive Employees */}
                  {inactiveEmployees.map((emp) => (
                    <tr
                      key={`${emp.employeeId}-${emp.email}-inactive`}
                      className="border-t transition duration-150 bg-gray-300 opacity-60 hover:bg-gray-400"
                    >
                      <td className="p-4 font-mono font-semibold text-gray-600">{emp.employeeId}</td>
                      <td className="p-4 flex items-center gap-2">
                        {/* Avatar or initials */}
                        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-gray-600 font-bold border border-gray-400">
                          {emp.name?.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="font-semibold text-gray-600">{emp.name} (Inactive)</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-gray-400 text-gray-700">
                          {emp.department}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{emp.email}</td>
                      <td className="p-4">
                        <div className="flex flex-row items-center gap-2">
                          <button
                            onClick={() => navigate(`/employee/${emp.employeeId}/profile`)}
                            className="bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300 flex items-center gap-1 font-semibold shadow"
                            title="View Profile"
                          >
                            <FaUser /> Profile
                          </button>
                          <button
                            onClick={() => navigate(`/employees/reactivate/${emp.employeeId}`)}
                            className="bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 flex items-center gap-1 font-semibold shadow"
                            title="Reactivate Employee"
                          >
                            <FaEdit /> Reactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
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

        {/* Snackbar for deactivate success */}
        {snackbar && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-fadein">
            {snackbar}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;
