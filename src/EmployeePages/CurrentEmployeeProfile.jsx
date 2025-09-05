import React, { useContext, useState, useRef } from "react";
import { CurrentEmployeeContext } from "../EmployeeContext/CurrentEmployeeContext";

// Validation helpers
const validateAadhaar = (v) => /^\d{12}$/.test(v);
const validatePAN = (v) => /^[A-Z]{5}\d{4}[A-Z]$/.test(v);
const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validatePhone = (v) => /^\d{10}$/.test(v);
const validateAccount = (v) => /^\d{9,18}$/.test(v);
const validateIFSC = (v) => /^[A-Z]{4}0\d{6}$/.test(v);
const validateSalary = (v) => /^\d+$/.test(v) && Number(v) > 0;

const getInitials = (name) =>
  name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "";

const CurrentEmployeeProfile = () => {
  const {
    currentEmployee,
    employeeStats,
    job,
    bank,
    experienceStats,
    editCurrentEmployee,
    editEmployeeStats,
    editJob,
    editBank,
    setExperienceStats,
  } = useContext(CurrentEmployeeContext);

  // Compose experience as array for editing
  const initialExperience = Array.isArray(experienceStats)
    ? experienceStats
    : [experienceStats];

  // Edit state
  const [editing, setEditing] = useState(false);
  const [personal, setPersonal] = useState(currentEmployee.personal);
  const [contact, setContact] = useState({
    email: employeeStats.email,
    phone: employeeStats.phone,
    address: employeeStats.address,
    emergency_contact_name: employeeStats.emergency_contact_name,
    emergency_contact_phone: employeeStats.emergency_contact_phone,
    emergency_contact_relation: employeeStats.emergency_contact_relation,
  });
  const [jobState, setJobState] = useState(job);
  const [bankState, setBankState] = useState(bank);
  const [experience, setExperience] = useState(initialExperience);
  const [photoPreview, setPhotoPreview] = useState(personal.profile_photo);
  const fileInputRef = useRef();

  // Validation errors
  const [errors, setErrors] = useState({});

  // Experience handlers
  const handleAddExperience = () => {
    setExperience((prev) => [
      ...prev,
      {
        company: "",
        role: "",
        years: "",
        joining_date: "",
        last_working_date: "",
        salary: "",
        reason: "",
        experience_letter: null,
      },
    ]);
  };

  const handleRemoveExperience = (idx) => {
    setExperience((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleExperienceChange = (idx, field, value) => {
    setExperience((prev) =>
      prev.map((exp, i) => (i === idx ? { ...exp, [field]: value } : exp))
    );
  };

  const handleExperienceFileChange = (idx, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setExperience((prev) =>
          prev.map((exp, i) =>
            i === idx
              ? { ...exp, experience_letter: { name: file.name, url: reader.result } }
              : exp
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Profile photo upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setPersonal((prev) => ({
          ...prev,
          profile_photo: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Input change handlers
  const handlePersonalChange = (field, value) => {
    setPersonal((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleContactChange = (field, value) => {
    setContact((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleJobChange = (field, value) => {
    setJobState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBankChange = (field, value) => {
    setBankState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validation
  const validateAll = () => {
    const newErrors = {};

    if (!validateAadhaar(personal.aadhaar_number))
      newErrors.aadhaar_number = "Invalid Aadhaar Number";
    if (!validatePAN(personal.pan_number))
      newErrors.pan_number = "Invalid PAN Number";
    if (!validateEmail(contact.email))
      newErrors.email = "Invalid Email";
    if (!validatePhone(contact.phone))
      newErrors.phone = "Invalid Phone Number";
    if (!validatePhone(contact.emergency_contact_phone))
      newErrors.emergency_contact_phone = "Invalid Emergency Contact Phone Number";
    if (!validateAccount(bankState.account_number))
      newErrors.account_number = "Invalid Account Number";
    if (!validateIFSC(bankState.ifsc_code))
      newErrors.ifsc_code = "Invalid IFSC Code";
    experience.forEach((exp, idx) => {
      if (!validateSalary(exp.salary))
        newErrors[`salary_${idx}`] = "Invalid Salary";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save handler
  const handleSave = (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    // Update context
    editCurrentEmployee({ personal, contact, experience });
    editEmployeeStats({
      email: contact.email,
      phone: contact.phone,
      address: contact.address,
      emergency_contact_name: contact.emergency_contact_name,
      emergency_contact_phone: contact.emergency_contact_phone,
      emergency_contact_relation: contact.emergency_contact_relation,
    });
    editJob(jobState);
    editBank(bankState);
    setExperienceStats(experience);

    setEditing(false);
  };

  // Cancel handler
  const handleCancel = () => {
    setEditing(false);
    setPersonal(currentEmployee.personal);
    setContact({
      email: employeeStats.email,
      phone: employeeStats.phone,
      address: employeeStats.address,
      emergency_contact_name: employeeStats.emergency_contact_name,
      emergency_contact_phone: employeeStats.emergency_contact_phone,
      emergency_contact_relation: employeeStats.emergency_contact_relation,
    });
    setJobState(job);
    setBankState(bank);
    setExperience(initialExperience);
    setPhotoPreview(currentEmployee.personal.profile_photo);
    setErrors({});
  };

  // --- UI ---
  if (!currentEmployee) {
    return <div className="p-6 text-red-600">Employee data not available.</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Profile Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold">My Profile</h2>
          <p className="text-gray-500 text-sm">
            View and verify your personal and job details below.
          </p>
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

      {/* Profile Initials or Photo */}
      <div className="mb-6">
        {photoPreview ? (
          <img
            src={photoPreview}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow">
            {getInitials(personal.name)}
          </div>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave}>
          {/* Profile Photo Upload */}
          <div className="mb-8">
            <label className="block font-medium mb-2">Profile Photo</label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              className="block mb-2"
            />
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded shadow p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded-lg w-full"
                  value={personal.name}
                  onChange={(e) => handlePersonalChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Father's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded-lg w-full"
                  value={personal.fatherName}
                  onChange={(e) => handlePersonalChange("fatherName", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="border px-3 py-2 rounded-lg w-full"
                  value={personal.dob}
                  onChange={(e) => handlePersonalChange("dob", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded-lg w-full"
                  value={personal.gender}
                  onChange={(e) => handlePersonalChange("gender", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Marital Status <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded-lg w-full"
                  value={personal.marital_status}
                  onChange={(e) => handlePersonalChange("marital_status", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nationality <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded-lg w-full"
                  value={personal.nationality}
                  onChange={(e) => handlePersonalChange("nationality", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Aadhaar Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`border px-3 py-2 rounded-lg w-full ${errors.aadhaar_number ? "border-red-500" : ""}`}
                  value={personal.aadhaar_number}
                  onChange={(e) => handlePersonalChange("aadhaar_number", e.target.value)}
                  required
                />
                {errors.aadhaar_number && (
                  <div className="text-red-600 text-xs mt-1">{errors.aadhaar_number}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  PAN Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`border px-3 py-2 rounded-lg w-full uppercase ${errors.pan_number ? "border-red-500" : ""}`}
                  value={personal.pan_number}
                  onChange={(e) => handlePersonalChange("pan_number", e.target.value.toUpperCase())}
                  required
                />
                {errors.pan_number && (
                  <div className="text-red-600 text-xs mt-1">{errors.pan_number}</div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded shadow p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className={`border px-3 py-2 rounded-lg w-full ${errors.email ? "border-red-500" : ""}`}
                  value={contact.email}
                  onChange={(e) => handleContactChange("email", e.target.value)}
                  required
                />
                {errors.email && (
                  <div className="text-red-600 text-xs mt-1">{errors.email}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`border px-3 py-2 rounded-lg w-full ${errors.phone ? "border-red-500" : ""}`}
                  value={contact.phone}
                  onChange={(e) => handleContactChange("phone", e.target.value)}
                  required
                />
                {errors.phone && (
                  <div className="text-red-600 text-xs mt-1">{errors.phone}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded-lg w-full"
                  value={contact.address}
                  onChange={(e) => handleContactChange("address", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Emergency Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded-lg w-full"
                  value={contact.emergency_contact_name}
                  onChange={(e) => handleContactChange("emergency_contact_name", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Emergency Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`border px-3 py-2 rounded-lg w-full ${errors.emergency_contact_phone ? "border-red-500" : ""}`}
                  value={contact.emergency_contact_phone}
                  onChange={(e) => handleContactChange("emergency_contact_phone", e.target.value)}
                  required
                />
                {errors.emergency_contact_phone && (
                  <div className="text-red-600 text-xs mt-1">{errors.emergency_contact_phone}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Emergency Contact Relation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded-lg w-full"
                  value={contact.emergency_contact_relation}
                  onChange={(e) => handleContactChange("emergency_contact_relation", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className="bg-white rounded shadow p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Job Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded-lg w-full"
                  value={personal.employeeId}
                  onChange={(e) => handlePersonalChange("employeeId", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Department ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded-lg w-full"
                  value={jobState.dept_id}
                  onChange={(e) => handleJobChange("dept_id", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded-lg w-full"
                  value={jobState.department}
                  onChange={(e) => handleJobChange("department", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Designation <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded-lg w-full"
                  value={jobState.designation}
                  onChange={(e) => handleJobChange("designation", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Date of Joining <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="border px-3 py-2 rounded-lg w-full"
                  value={jobState.doj}
                  onChange={(e) => handleJobChange("doj", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div className="bg-white rounded shadow p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Bank Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded-lg w-full"
                  value={bankState.bank_name}
                  onChange={(e) => handleBankChange("bank_name", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`border px-3 py-2 rounded-lg w-full ${errors.account_number ? "border-red-500" : ""}`}
                  value={bankState.account_number}
                  onChange={(e) => handleBankChange("account_number", e.target.value)}
                  required
                />
                {errors.account_number && (
                  <div className="text-red-600 text-xs mt-1">{errors.account_number}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`border px-3 py-2 rounded-lg w-full uppercase ${errors.ifsc_code ? "border-red-500" : ""}`}
                  value={bankState.ifsc_code}
                  onChange={(e) => handleBankChange("ifsc_code", e.target.value.toUpperCase())}
                  required
                />
                {errors.ifsc_code && (
                  <div className="text-red-600 text-xs mt-1">{errors.ifsc_code}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Branch <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="border px-3 py-2 rounded-lg w-full"
                  value={bankState.branch}
                  onChange={(e) => handleBankChange("branch", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Experience Details */}
          <div className="bg-white rounded shadow p-6 mb-6">
            <h3 className="font-bold text-lg mb-4">Experience Details</h3>
            {experience.map((exp, idx) => (
              <div key={idx} className="mb-8 border-b pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="border px-3 py-2 rounded-lg w-full"
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="border px-3 py-2 rounded-lg w-full"
                      value={exp.role}
                      onChange={(e) => handleExperienceChange(idx, "role", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Years <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      className="border px-3 py-2 rounded-lg w-full"
                      value={exp.years}
                      onChange={(e) => handleExperienceChange(idx, "years", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Joining Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="border px-3 py-2 rounded-lg w-full"
                      value={exp.joining_date}
                      onChange={(e) => handleExperienceChange(idx, "joining_date", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Last Working Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="border px-3 py-2 rounded-lg w-full"
                      value={exp.last_working_date}
                      onChange={(e) => handleExperienceChange(idx, "last_working_date", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Salary <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      className={`border px-3 py-2 rounded-lg w-full ${errors[`salary_${idx}`] ? "border-red-500" : ""}`}
                      value={exp.salary}
                      onChange={(e) => handleExperienceChange(idx, "salary", e.target.value)}
                      required
                    />
                    {errors[`salary_${idx}`] && (
                      <div className="text-red-600 text-xs mt-1">{errors[`salary_${idx}`]}</div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Experience Certificate
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleExperienceFileChange(idx, e.target.files[0])}
                      className="border px-3 py-2 rounded-lg w-full"
                    />
                    {exp.experience_letter && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">{exp.experience_letter.name}</span>
                        <a
                          href={exp.experience_letter.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 underline"
                        >
                          View
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Reason for Leaving
                    </label>
                    <input
                      type="text"
                      className="border px-3 py-2 rounded-lg w-full"
                      value={exp.reason}
                      onChange={(e) => handleExperienceChange(idx, "reason", e.target.value)}
                      placeholder="Enter reason (e.g., better opportunity, relocation)"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  onClick={() => handleRemoveExperience(idx)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={handleAddExperience}
            >
              + Add Experience
            </button>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="mt-4 flex gap-4">
            <button
              type="submit"
              className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
            >
              Save
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Profile View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Personal Information */}
            <div className="bg-white rounded shadow p-6">
              <h3 className="font-bold text-lg mb-2">Personal Information</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <strong>Name:</strong> {personal.name}
                </div>
                <div>
                  <strong>Father's Name:</strong> {personal.fatherName}
                </div>
                <div>
                  <strong>Date of Birth:</strong> {personal.dob}
                </div>
                <div>
                  <strong>Gender:</strong> {personal.gender}
                </div>
                <div>
                  <strong>Marital Status:</strong> {personal.marital_status}
                </div>
                <div>
                  <strong>Nationality:</strong> {personal.nationality}
                </div>
                <div>
                  <strong>Aadhaar Number:</strong> {personal.aadhaar_number}
                </div>
                <div>
                  <strong>PAN Number:</strong> {personal.pan_number}
                </div>
                <div>
                  <strong>Aadhaar Card:</strong>{" "}
                  {personal.aadhaar
                    ? <span className="text-blue-600 underline">Uploaded</span>
                    : "Not uploaded"}
                </div>
                <div>
                  <strong>PAN Card:</strong>{" "}
                  {personal.pan
                    ? <span className="text-blue-600 underline">Uploaded</span>
                    : "Not uploaded"}
                </div>
                <div>
                  <strong>Resume:</strong>{" "}
                  {personal.resume
                    ? <span className="text-blue-600 underline">Uploaded</span>
                    : "Not uploaded"}
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="bg-white rounded shadow p-6">
              <h3 className="font-bold text-lg mb-2">Contact Details</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <strong>Email:</strong> {contact.email}
                </div>
                <div>
                  <strong>Phone:</strong> {contact.phone}
                </div>
                <div>
                  <strong>Address:</strong> {contact.address}
                </div>
                <div>
                  <strong>Emergency Contact Name:</strong> {contact.emergency_contact_name}
                </div>
                <div>
                  <strong>Emergency Contact Phone:</strong> {contact.emergency_contact_phone}
                </div>
                <div>
                  <strong>Emergency Contact Relation:</strong> {contact.emergency_contact_relation}
                </div>
              </div>
            </div>
          </div>

          {/* Job and Bank Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Job Information */}
            <div className="bg-white rounded shadow p-6">
              <h3 className="font-bold text-lg mb-2">Job Information</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <strong>Employee ID:</strong> {personal.employeeId}
                </div>
                <div>
                  <strong>Department ID:</strong> {jobState.dept_id}
                </div>
                <div>
                  <strong>Department:</strong> {jobState.department}
                </div>
                <div>
                  <strong>Designation:</strong> {jobState.designation}
                </div>
                <div>
                  <strong>Date of Joining:</strong> {jobState.doj}
                </div>
              </div>
            </div>

            {/* Bank Information */}
            <div className="bg-white rounded shadow p-6">
              <h3 className="font-bold text-lg mb-2">Bank Information</h3>
              <div className="space-y-1 text-sm">
                <div>
                  <strong>Bank Name:</strong> {bankState.bank_name}
                </div>
                <div>
                  <strong>Account Number:</strong> {bankState.account_number}
                </div>
                <div>
                  <strong>IFSC Code:</strong> {bankState.ifsc_code}
                </div>
                <div>
                  <strong>Branch:</strong> {bankState.branch}
                </div>
              </div>
            </div>
          </div>

          {/* Experience Information */}
          <div className="bg-white rounded shadow p-6">
            <h3 className="font-bold text-lg mb-2">Experience Information</h3>
            {experience.map((exp, idx) => (
              <div key={idx} className="mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong>Company:</strong> {exp.company}
                  </div>
                  <div>
                    <strong>Role:</strong> {exp.role}
                  </div>
                  <div>
                    <strong>Years:</strong> {exp.years}
                  </div>
                  <div>
                    <strong>Joining Date:</strong> {exp.joining_date}
                  </div>
                  <div>
                    <strong>Last Working Date:</strong> {exp.last_working_date}
                  </div>
                  <div>
                    <strong>Salary:</strong> {exp.salary}
                  </div>
                </div>
                {exp.experience_letter && (
                  <div className="mt-2">
                    <strong>Experience Certificate:</strong>{" "}
                    <a
                      href={exp.experience_letter.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Certificate
                    </a>
                  </div>
                )}
                <div>
                  <strong>Reason for Leaving:</strong> {exp.reason}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CurrentEmployeeProfile;
