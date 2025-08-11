import React, { useContext, useState, useRef } from "react";
import { CurrentEmployeeContext } from "../EmployeeContext/CurrentEmployeeContext";

const CurrentEmployeeProfile = () => {
  const { currentEmployee, editCurrentEmployee } = useContext(CurrentEmployeeContext);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(currentEmployee);
  const [photoPreview, setPhotoPreview] = useState(currentEmployee.profilePhoto || null);
  const fileInputRef = useRef();

  if (!currentEmployee) {
    return <div className="p-6 text-red-600">Employee data not available.</div>;
  }

  const { personal, contact, job, bank, experience, profilePhoto } = editing ? form : currentEmployee;

  const handleChange = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleExperienceChange = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === idx ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setForm((prev) => ({ ...prev, profilePhoto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    editCurrentEmployee({ ...form, profilePhoto: photoPreview });
    setEditing(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">My Profile</h2>
          <p className="text-gray-500 text-sm">View and verify your personal and job details below.</p>
        </div>
        {!editing && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit}>
          {/* Profile Photo Upload & Preview */}
          <div className="flex items-center gap-6 mb-6">
            <div>
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile Preview"
                  className="w-28 h-28 rounded-full border-4 border-white shadow object-cover"
                />
              ) : (
                <div className="w-28 h-28 rounded-full border-4 border-white shadow bg-blue-600 flex items-center justify-center text-white text-4xl font-bold select-none">
                  {form.personal.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2">Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                className="block mb-2"
              />
              <button
                type="button"
                className="text-blue-700 underline text-sm"
                onClick={() => {
                  setPhotoPreview(null);
                  setForm((prev) => ({ ...prev, profilePhoto: null }));
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                style={{ display: photoPreview ? "inline" : "none" }}
              >
                Remove Photo
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2 text-gray-700">Personal Information</h3>
              {Object.entries(form.personal).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <label className="block text-sm font-medium text-gray-600">{key.replace(/_/g, " ").replace(/([A-Z])/g, " $1")}</label>
                  <input
                    type={key === "dob" ? "date" : "text"}
                    className="border px-2 py-1 rounded w-full"
                    value={value}
                    onChange={(e) => handleChange("personal", key, key === "isActive" ? e.target.checked : e.target.value)}
                    {...(key === "isActive" ? { type: "checkbox", checked: value } : {})}
                  />
                  {key === "isActive" && (
                    <span className="ml-2">{value ? "Active" : "Inactive"}</span>
                  )}
                </div>
              ))}
            </div>
            {/* Contact Info */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2 text-gray-700">Contact Details</h3>
              {Object.entries(form.contact).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <label className="block text-sm font-medium text-gray-600">{key.replace(/_/g, " ").replace(/([A-Z])/g, " $1")}</label>
                  <input
                    type="text"
                    className="border px-2 py-1 rounded w-full"
                    value={value}
                    onChange={(e) => handleChange("contact", key, e.target.value)}
                  />
                </div>
              ))}
            </div>
            {/* Job Info */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2 text-gray-700">Job Information</h3>
              {Object.entries(form.job).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <label className="block text-sm font-medium text-gray-600">{key.replace(/_/g, " ").replace(/([A-Z])/g, " $1")}</label>
                  <input
                    type={key === "joiningDate" ? "date" : "text"}
                    className="border px-2 py-1 rounded w-full"
                    value={value}
                    onChange={(e) => handleChange("job", key, e.target.value)}
                  />
                </div>
              ))}
            </div>
            {/* Bank Info */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2 text-gray-700">Bank Information</h3>
              {Object.entries(form.bank).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <label className="block text-sm font-medium text-gray-600">{key.replace(/_/g, " ").replace(/([A-Z])/g, " $1")}</label>
                  <input
                    type="text"
                    className="border px-2 py-1 rounded w-full"
                    value={value}
                    onChange={(e) => handleChange("bank", key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Experience Details */}
          <div className="mt-8 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-2 text-gray-700">Experience Details</h3>
            {form.experience.map((exp, idx) => (
              <div key={idx} className="mb-4 border-b pb-2">
                {Object.entries(exp).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <label className="block text-sm font-medium text-gray-600">{key.replace(/_/g, " ").replace(/([A-Z])/g, " $1")}</label>
                    <input
                      type={key.toLowerCase().includes("date") ? "date" : "text"}
                      className="border px-2 py-1 rounded w-full"
                      value={value}
                      onChange={(e) => handleExperienceChange(idx, key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={() => {
                setEditing(false);
                setForm(currentEmployee);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Profile Photo Display */}
          <div className="flex items-center gap-6 mb-6">
            <div>
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Profile"
                  className="w-28 h-28 rounded-full border-4 border-white shadow object-cover"
                />
              ) : (
                <div className="w-28 h-28 rounded-full border-4 border-white shadow bg-blue-600 flex items-center justify-center text-white text-4xl font-bold select-none">
                  {personal?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Info */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2 text-gray-700">Personal Information</h3>
              <p><strong>Name:</strong> {personal?.name}</p>
              <p><strong>Father's Name:</strong> {personal?.fatherName}</p>
              <p><strong>Date of Birth:</strong> {personal?.dob}</p>
              <p><strong>Gender:</strong> {personal?.gender}</p>
              <p><strong>Marital Status:</strong> {personal?.maritalStatus}</p>
              <p><strong>Nationality:</strong> {personal?.nationality}</p>
              <p><strong>Active:</strong> {personal?.isActive ? "Yes" : "No"}</p>
            </div>
            {/* Contact Info */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2 text-gray-700">Contact Details</h3>
              <p><strong>Email:</strong> {contact?.email}</p>
              <p><strong>Phone:</strong> {contact?.phone}</p>
              <p><strong>Address:</strong> {contact?.address}</p>
              <p><strong>City:</strong> {contact?.city}</p>
              <p><strong>Emergency Contact Name:</strong> {contact?.emergency_contact_name}</p>
              <p><strong>Emergency Contact Phone:</strong> {contact?.emergency_contact_phone}</p>
              <p><strong>Emergency Contact Relation:</strong> {contact?.emergency_contact_relation}</p>
            </div>
            {/* Job Info */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2 text-gray-700">Job Information</h3>
              <p><strong>Employee ID:</strong> {job?.employeeId}</p>
              <p><strong>Department ID:</strong> {job?.department_id}</p>
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
              <p><strong>Branch:</strong> {bank?.branch}</p>
            </div>
          </div>
          {/* Experience Details */}
          <div className="mt-8 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-2 text-gray-700">Experience Details</h3>
            {experience && experience.length > 0 ? (
              <ul className="list-disc pl-5">
                {experience.map((exp, idx) => (
                  <li key={idx}>
                    <strong>{exp.company}</strong> - {exp.role} ({exp.years} years)
                    <br />
                    <span className="text-sm text-gray-600">
                      {exp.joiningDate} to {exp.lastWorkingDate} | Salary: ₹{exp.salary}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No experience details available.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CurrentEmployeeProfile;
