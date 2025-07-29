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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full border">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Employee Not Found</h2>
        <p className="text-gray-600 mb-6">The employee you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate(-1)}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  // Get initials for avatar
  const initials = employee.name?.split(' ').map(n => n[0]).join('').toUpperCase();

  // Professional SVG icons
  const icons = {
    email: (
      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    phone: (
      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    address: (
      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    calendar: (
      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    emergency: (
      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    user: (
      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    heart: (
      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    globe: (
      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    creditCard: (
      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    bank: (
      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    code: (
      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9l-3 3 3 3m8-6l3 3-3 3" />
      </svg>
    ),
    office: (
      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    briefcase: (
      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
      </svg>
    ),
    clock: (
      <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  // Professional tab content with clean styling
  const renderTabContent = () => {
    if (activeTab === 'personal') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon={icons.email} label="Email Address" value={employee.email} />
            <InfoCard icon={icons.phone} label="Phone Number" value={employee.phone} />
            <InfoCard icon={icons.address} label="Address" value={employee.address} />
            <InfoCard icon={icons.calendar} label="Joining Date" value={employee.joiningDate} />
            <InfoCard icon={icons.emergency} label="Emergency Contact" value={employee.emergency} />
            {employee.personalDetails && (
              <>
                <InfoCard icon={icons.calendar} label="Date of Birth" value={employee.personalDetails.dob} />
                <InfoCard icon={icons.user} label="Gender" value={employee.personalDetails.gender} />
                <InfoCard icon={icons.heart} label="Marital Status" value={employee.personalDetails.maritalStatus} />
                <InfoCard icon={icons.globe} label="Nationality" value={employee.personalDetails.nationality} />
              </>
            )}
          </div>
        </div>
      );
    }
    if (activeTab === 'bank') {
      return employee.bankDetails ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard icon={icons.creditCard} label="Account Number" value={employee.bankDetails.accountNumber} />
            <InfoCard icon={icons.bank} label="Bank Name" value={employee.bankDetails.bankName} />
            <InfoCard icon={icons.code} label="IFSC Code" value={employee.bankDetails.ifsc} />
            <InfoCard icon={icons.office} label="Branch" value={employee.bankDetails.branch} />
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Banking Information</h3>
          <p className="text-gray-500">Bank details have not been provided for this employee.</p>
        </div>
      );
    }
    if (activeTab === 'experience') {
      return employee.experienceDetails && employee.experienceDetails.length > 0 ? (
        <div className="space-y-6">
          {employee.experienceDetails.map((exp, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  {icons.office}
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">Company</span>
                    <span className="text-lg font-semibold text-gray-900">{exp.company}</span>
                  </div>
                </div>
                <div className="flex items-start">
                  {icons.briefcase}
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">Position</span>
                    <span className="text-lg font-semibold text-gray-900">{exp.role}</span>
                  </div>
                </div>
                <div className="flex items-start">
                  {icons.clock}
                  <div>
                    <span className="text-sm font-medium text-gray-500 block">Experience</span>
                    <span className="text-lg font-semibold text-gray-900">{exp.years} years</span>
                  </div>
                </div>
                {exp.joiningDate && (
                  <div className="flex items-start">
                    {icons.calendar}
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Start Date</span>
                      <span className="text-lg font-semibold text-gray-900">{exp.joiningDate}</span>
                    </div>
                  </div>
                )}
                {exp.lastWorkingDate && (
                  <div className="flex items-start">
                    {icons.calendar}
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">End Date</span>
                      <span className="text-lg font-semibold text-gray-900">{exp.lastWorkingDate}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Work Experience</h3>
          <p className="text-gray-500">Work experience information has not been provided for this employee.</p>
        </div>
      );
    }
    return null;
  };

  // Professional Info Card Component
  const InfoCard = ({ icon, label, value }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-start">
        {icon}
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
          <div className="text-base font-semibold text-gray-900">
            {value || 'Not provided'}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Professional Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back to Employee List</span>
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {/* Professional Header */}
          <div className="bg-slate-800 px-8 py-12">
            <div className="flex flex-col items-center text-center">
              {/* Professional Avatar */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-600 flex items-center justify-center text-3xl sm:text-4xl text-white font-bold mb-6 shadow-lg">
                {initials}
              </div>
              
              {/* Employee Information */}
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                {employee.name}
              </h1>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <span className="px-4 py-2 rounded-md bg-slate-700 text-white font-medium">
                  {employee.department}
                </span>
                <span className="px-4 py-2 rounded-md bg-slate-600 text-white font-medium">
                  Employee ID: {employee.employeeId}
                </span>
              </div>
            </div>
          </div>

          {/* Professional Navigation Tabs */}
          <div className="border-b border-gray-200 bg-white">
            <nav className="flex justify-center">
              <div className="flex space-x-8 px-6">
                <TabButton
                  active={activeTab === 'personal'}
                  onClick={() => setActiveTab('personal')}
                  label="Personal Information"
                />
                <TabButton
                  active={activeTab === 'bank'}
                  onClick={() => setActiveTab('bank')}
                  label="Banking Details"
                />
                <TabButton
                  active={activeTab === 'experience'}
                  onClick={() => setActiveTab('experience')}
                  label="Work Experience"
                />
              </div>
            </nav>
          </div>

          {/* Professional Tab Content */}
          <div className="p-8 bg-gray-50 min-h-[500px]">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );

  // Professional Tab Button Component
  function TabButton({ active, onClick, label }) {
    return (
      <button
        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none ${
          active
            ? 'border-slate-800 text-slate-900'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
        onClick={onClick}
      >
        {label}
      </button>
    );
  }
};

export default EmployeeProfile;
