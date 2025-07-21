import { useParams, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { EmployeeContext } from '../context/EmployeeContext';
import { FaUser, FaEnvelope, FaBuilding, FaPhone, FaAddressCard, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';

const TABS = [
  { key: 'personal', label: 'Personal Info', icon: <FaUser /> },
  { key: 'contact', label: 'Contact Info', icon: <FaEnvelope /> },
  { key: 'job', label: 'Job Details', icon: <FaBuilding /> },
];

const EditEmployee = () => {
  const { id } = useParams();
  const { employees, editEmployee } = useContext(EmployeeContext);
  const navigate = useNavigate();

  const employee = employees.find((e) => e.employeeId === id);
  const departmentSet = Array.from(new Set(employees.map((emp) => emp.department))).sort();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    phone: '',
    address: '',
    joiningDate: '',
    emergency: ''
  });
  const [snackbar, setSnackbar] = useState("");
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
    }
  }, [employee]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    editEmployee(id, formData);
    setSnackbar("Employee updated successfully.");
    setTimeout(() => {
      setSnackbar("");
      navigate('/employees');
    }, 1800);
  };

  if (!employee) return <div className="p-6 text-red-600 font-semibold">Employee not found</div>;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex flex-col items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition shadow flex items-center gap-2"
        >
          &#8592; Go Back
        </button>
        <div className="flex gap-2 justify-center mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold transition-all duration-150 focus:outline-none text-base shadow-sm border-b-2 ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-gray-100 text-gray-700 border-transparent hover:bg-blue-50'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Edit Employee</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {activeTab === 'personal' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-4 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 pt-5 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
                    required
                  />
                </div>
              </div>
            </>
          )}
          {activeTab === 'contact' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full pl-10 pr-4 pt-5 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="phone">Phone</label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-4 text-gray-400" />
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full pl-10 pr-4 pt-5 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="address">Address</label>
                <div className="relative">
                  <FaAddressCard className="absolute left-3 top-4 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Address"
                    className="w-full pl-10 pr-4 pt-5 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
                  />
                </div>
              </div>
            </>
          )}
          {activeTab === 'job' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="department">Department</label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-4 text-gray-400" />
                  <select
                    name="department"
                    id="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 pt-5 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
                    required
                  >
                    <option value="">Select Department</option>
                    {departmentSet.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="joiningDate">Joining Date</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-4 text-gray-400" />
                  <input
                    type="date"
                    name="joiningDate"
                    id="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 pt-5 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="emergency">Emergency Contact</label>
                <div className="relative">
                  <FaExclamationTriangle className="absolute left-3 top-4 text-gray-400" />
                  <input
                    type="text"
                    name="emergency"
                    id="emergency"
                    value={formData.emergency}
                    onChange={handleChange}
                    placeholder="Emergency Contact"
                    className="w-full pl-10 pr-4 pt-5 pb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50"
                  />
                </div>
              </div>
            </>
          )}
          <div className="flex gap-3 mt-6">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 w-full font-semibold shadow">
              Update
            </button>
            <button type="button" onClick={() => navigate(-1)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 w-full font-semibold shadow">
              Cancel
            </button>
          </div>
        </form>
        {snackbar && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50 animate-fadein">
            {snackbar}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditEmployee;
