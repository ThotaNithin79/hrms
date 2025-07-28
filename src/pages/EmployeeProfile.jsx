import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EmployeeContext } from '../context/EmployeeContext';

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees } = useContext(EmployeeContext);
  const [activeTab, setActiveTab] = React.useState('personal');
  const employee = employees.find((emp) => emp.employeeId === id);

  if (!employee) return (
    <div className="p-6 flex flex-col items-center justify-center">
      <p className="text-red-600 font-semibold">Employee not found.</p>
      <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Go Back</button>
    </div>
  );

  // Get initials for avatar
  const initials = employee.name?.split(' ').map(n => n[0]).join('').toUpperCase();

  // Simple icons
  const icons = {
    email: <span className="mr-2">📧</span>,
    phone: <span className="mr-2">📱</span>,
    address: <span className="mr-2">🏠</span>,
    joining: <span className="mr-2">🗓️</span>,
    emergency: <span className="mr-2">🚨</span>,
    dob: <span className="mr-2">🎂</span>,
    gender: <span className="mr-2">⚧️</span>,
    marital: <span className="mr-2">💍</span>,
    nationality: <span className="mr-2">🌎</span>,
    account: <span className="mr-2">💳</span>,
    bank: <span className="mr-2">🏦</span>,
    ifsc: <span className="mr-2">🔢</span>,
    branch: <span className="mr-2">🌿</span>,
    company: <span className="mr-2">🏢</span>,
    role: <span className="mr-2">🧑‍💼</span>,
    years: <span className="mr-2">⏳</span>,
    joiningDate: <span className="mr-2">📅</span>,
    lastWorkingDate: <span className="mr-2">📆</span>,
  };

  // Tab content
  const renderTabContent = () => {
    if (activeTab === 'personal') {
      return (
        <div className="grid grid-cols-1 gap-4 text-gray-700">
          <div className="flex items-center bg-gray-50 rounded p-2 shadow-sm">{icons.email}<span className="font-semibold">Email:</span> {employee.email}</div>
          <div className="flex items-center bg-gray-50 rounded p-2 shadow-sm">{icons.phone}<span className="font-semibold">Phone:</span> {employee.phone}</div>
          <div className="flex items-center bg-gray-50 rounded p-2 shadow-sm">{icons.address}<span className="font-semibold">Address:</span> {employee.address}</div>
          <div className="flex items-center bg-gray-50 rounded p-2 shadow-sm">{icons.joining}<span className="font-semibold">Joining Date:</span> {employee.joiningDate}</div>
          <div className="flex items-center bg-gray-50 rounded p-2 shadow-sm">{icons.emergency}<span className="font-semibold">Emergency Contact:</span> {employee.emergency}</div>
          {employee.personalDetails && (
            <>
              <div className="flex items-center bg-gray-50 rounded p-2 shadow-sm">{icons.dob}<span className="font-semibold">Date of Birth:</span> {employee.personalDetails.dob}</div>
              <div className="flex items-center bg-gray-50 rounded p-2 shadow-sm">{icons.gender}<span className="font-semibold">Gender:</span> {employee.personalDetails.gender}</div>
              <div className="flex items-center bg-gray-50 rounded p-2 shadow-sm">{icons.marital}<span className="font-semibold">Marital Status:</span> {employee.personalDetails.maritalStatus}</div>
              <div className="flex items-center bg-gray-50 rounded p-2 shadow-sm">{icons.nationality}<span className="font-semibold">Nationality:</span> {employee.personalDetails.nationality}</div>
            </>
          )}
        </div>
      );
    }
    if (activeTab === 'bank') {
      return employee.bankDetails ? (
        <div className="grid grid-cols-1 gap-4 text-gray-700">
          <div className="flex items-center bg-gray-50 rounded p-2 shadow-sm">{icons.account}<span className="font-semibold">Account Number:</span> {employee.bankDetails.accountNumber}</div>
          <div className="flex items-center bg-gray-50 rounded p-2 shadow-sm">{icons.bank}<span className="font-semibold">Bank Name:</span> {employee.bankDetails.bankName}</div>
          <div className="flex items-center bg-gray-50 rounded p-2 shadow-sm">{icons.ifsc}<span className="font-semibold">IFSC:</span> {employee.bankDetails.ifsc}</div>
          <div className="flex items-center bg-gray-50 rounded p-2 shadow-sm">{icons.branch}<span className="font-semibold">Branch:</span> {employee.bankDetails.branch}</div>
        </div>
      ) : (
        <div className="text-gray-500">No bank details available.</div>
      );
    }
    if (activeTab === 'experience') {
      return employee.experienceDetails && employee.experienceDetails.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 text-gray-700">
          {employee.experienceDetails.map((exp, idx) => (
            <div key={idx} className="border rounded-xl p-4 bg-gradient-to-r from-blue-50 to-blue-100 shadow">
              <div className="flex items-center mb-1">{icons.company}<span className="font-semibold">Company:</span> {exp.company}</div>
              <div className="flex items-center mb-1">{icons.role}<span className="font-semibold">Role:</span> {exp.role}</div>
              <div className="flex items-center mb-1">{icons.years}<span className="font-semibold">Years:</span> {exp.years}</div>
              {exp.joiningDate && (
                <div className="flex items-center mb-1">{icons.joiningDate}<span className="font-semibold">Joining Date:</span> {exp.joiningDate}</div>
              )}
              {exp.lastWorkingDate && (
                <div className="flex items-center">{icons.lastWorkingDate}<span className="font-semibold">Last Working Date:</span> {exp.lastWorkingDate}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500">No experience details available.</div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-md overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-8 flex flex-col items-center mb-0 relative">
          <div className="w-24 h-24 rounded-full bg-blue-200 flex items-center justify-center text-4xl text-blue-700 font-bold mb-2 shadow-lg border-4 border-white">
            {initials}
          </div>
          <h2 className="text-3xl font-bold text-white mb-1 drop-shadow">{employee.name}</h2>
          <span className="px-4 py-1 rounded-full bg-white text-blue-700 text-base font-semibold shadow">{employee.department}</span>
        </div>
        {/* Tabs */}
        <div className="flex justify-center gap-2 bg-gray-100 pt-4 pb-2">
          <button
            className={`px-5 py-2 rounded-t-lg font-semibold border-b-4 transition-all duration-200 focus:outline-none ${activeTab === 'personal' ? 'border-blue-600 text-blue-700 bg-white shadow' : 'border-transparent text-gray-600 bg-gray-100 hover:bg-blue-50'}`}
            onClick={() => setActiveTab('personal')}
          >
            Personal Info
          </button>
          <button
            className={`px-5 py-2 rounded-t-lg font-semibold border-b-4 transition-all duration-200 focus:outline-none ${activeTab === 'bank' ? 'border-blue-600 text-blue-700 bg-white shadow' : 'border-transparent text-gray-600 bg-gray-100 hover:bg-blue-50'}`}
            onClick={() => setActiveTab('bank')}
          >
            Bank Details
          </button>
          <button
            className={`px-5 py-2 rounded-t-lg font-semibold border-b-4 transition-all duration-200 focus:outline-none ${activeTab === 'experience' ? 'border-blue-600 text-blue-700 bg-white shadow' : 'border-transparent text-gray-600 bg-gray-100 hover:bg-blue-50'}`}
            onClick={() => setActiveTab('experience')}
          >
            Experience
          </button>
        </div>
        {/* Tab Content */}
        <div className="mb-6 px-6 pt-4 pb-2">
          {renderTabContent()}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mb-4 w-11/12 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default EmployeeProfile;
