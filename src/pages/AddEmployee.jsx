import { useState, useContext } from "react";
import { EmployeeContext } from "../context/EmployeeContext";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaBuilding, FaIdBadge } from "react-icons/fa";

const TABS = [
  { key: "basic", label: "Basic Info", icon: <FaUser /> },
  { key: "contact", label: "Contact Info", icon: <FaEnvelope /> },
  { key: "job", label: "Job Details", icon: <FaBuilding /> },
];

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    department: "",
  });
  const [activeTab, setActiveTab] = useState("basic");
  const [error, setError] = useState("");

  const { addEmployee, employees } = useContext(EmployeeContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.name.trim()) return "Name is required.";
    if (!formData.email.trim()) return "Email is required.";
    if (!formData.department.trim()) return "Department is required.";
    if (formData.id.trim()) {
      const exists = employees.some(
        (emp) => emp.employeeId === formData.id.trim()
      );
      if (exists) return "Employee ID already exists.";
    }
    return "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      setTimeout(() => setError(""), 2500);
      return;
    }
    addEmployee(formData);
    alert("Employee added successfully.");
    navigate("/employees");
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition shadow flex items-center gap-2"
        >
          &#8592; Back
        </button>
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Add New Employee</h2>
        <div className="flex gap-2 justify-center mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-all duration-150 focus:outline-none text-base shadow-sm border-b-2 ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white border-blue-700"
                  : "bg-gray-100 text-gray-700 border-transparent hover:bg-blue-50"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        {error && (
          <div className="mb-4 text-center text-red-600 font-semibold bg-red-100 rounded-lg py-2 px-3 shadow">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === "basic" && (
            <>
              <div className="relative">
                <FaIdBadge className="absolute left-3 top-4 text-gray-400" />
                <input
                  type="text"
                  name="id"
                  placeholder="Employee ID (optional)"
                  value={formData.id}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 pt-5 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
                />
              </div>
              <div className="relative">
                <FaUser className="absolute left-3 top-4 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name *"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 pt-5 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
                  required
                />
              </div>
            </>
          )}
          {activeTab === "contact" && (
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-4 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 pt-5 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
                required
              />
            </div>
          )}
          {activeTab === "job" && (
            <div className="relative">
              <FaBuilding className="absolute left-3 top-4 text-gray-400" />
              <input
                type="text"
                name="department"
                placeholder="Department *"
                value={formData.department}
                onChange={handleChange}
                className="w-full pl-10 pr-4 pt-5 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
