import React, { useContext } from "react";
import { CurrentEmployeeContext } from "../EmployeeContext/CurrentEmployeeContext";

const CurrentEmployeeProfile = () => {
  const { currentEmployee } = useContext(CurrentEmployeeContext);

  // Optional fallback in case context is missing
  if (!currentEmployee) {
    return <div className="p-6 text-red-600">Employee data not available.</div>;
  }

  const { personal, contact, job, bank } = currentEmployee;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Go Back Button */}
      <button className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm">
        ← Go Back
      </button>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">My Profile</h2>
        <p className="text-gray-500 text-sm">View and verify your personal and job details below.</p>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2 text-gray-700">Personal Information</h3>
          <p><strong>Name:</strong> {personal?.name}</p>
          <p><strong>Father's Name:</strong> {personal?.fatherName}</p>
          <p><strong>Date of Birth:</strong> {personal?.dob}</p>
          <p><strong>Gender:</strong> {personal?.gender}</p>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2 text-gray-700">Contact Details</h3>
          <p><strong>Email:</strong> {contact?.email}</p>
          <p><strong>Phone:</strong> {contact?.phone}</p>
          <p><strong>Address:</strong> {contact?.address}</p>
          <p><strong>City:</strong> {contact?.city}</p>
        </div>

        {/* Job Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2 text-gray-700">Job Information</h3>
          <p><strong>Employee ID:</strong> {job?.employeeId}</p>
          <p><strong>Department:</strong> {job?.department}</p>
          <p><strong>Designation:</strong> {job?.designation}</p>
          <p><strong>Date of Joining:</strong> {job?.joiningDate}</p>
        </div>

        {/* Bank Info */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-2 text-gray-700">Bank Information</h3>
          <p><strong>Bank Name:</strong> {bank?.bankName}</p>
          <p><strong>Account No:</strong> {bank?.accountNumber}</p>
          <p><strong>IFSC Code:</strong> {bank?.ifsc}</p>
        </div>
      </div>
    </div>
  );
};

export default CurrentEmployeeProfile;
