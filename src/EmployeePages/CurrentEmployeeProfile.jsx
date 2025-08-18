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

  // --- Validation: Aadhaar & PAN ---
const AADHAAR_REGEX = /^\d{12}$/;                     // 12 digits
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;          // ABCDE1234F

const [errors, setErrors] = useState({
  aadhaarNumber: "",
  panNumber: "",
});

const isIDsValid =
  AADHAAR_REGEX.test(form?.personal?.aadhaarNumber || "") &&
  PAN_REGEX.test(form?.personal?.panNumber || "");



  const handleAddExperience = () => {
  setForm({
    ...form,
    experience: [
      ...form.experience,
      {
        company: "",
        role: "",
        years: "",
        joiningDate: "",
        lastWorkingDate: "",
        salary: "",
        certificate: null, // For experience letter upload
      },
    ],
  });
};

const handleRemoveExperience = (index) => {
  setForm({
    ...form,
    experience: form.experience.filter((_, i) => i !== index),
  });
};


  const handleFileChange = (section, field, file, idx) => {
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        [section]: prev[section].map((exp, i) =>
          i === idx
            ? {
                ...exp,
                [field]: {
                  name: file.name,
                  url: reader.result,
                },
              }
            : exp
        ),
      }));
    };
    reader.readAsDataURL(file);
  }
};


  const handleFileUpload = (section, field, file) => {
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: {
            name: file.name,
            url: reader.result,
          },
        },
      }));
    };
    reader.readAsDataURL(file);
  }
};

  
  const handleChange = (section, field, value) => {
  // Special handling for Aadhaar & PAN (sanitize + live validation)
  if (section === "personal") {
    if (field === "aadhaarNumber") {
      // allow only digits, limit to 12
      value = String(value || "").replace(/\D/g, "").slice(0, 12);
      setErrors((prev) => ({
        ...prev,
        aadhaarNumber:
          value.length === 0 || AADHAAR_REGEX.test(value)
            ? ""
            : "Aadhaar must be exactly 12 digits.",
      }));
    }
    if (field === "panNumber") {
      // uppercase, allow only A-Z and 0-9, limit to 10
      value = String(value || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 10);
      setErrors((prev) => ({
        ...prev,
        panNumber:
          value.length === 0 || PAN_REGEX.test(value)
            ? ""
            : "PAN format invalid (e.g., ABCDE1234F).",
      }));
    }
  }

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
      setForm((prev) => ({
        ...prev,
        personal: { ...prev.personal, profilePhoto: reader.result },
      }));
    };
    reader.readAsDataURL(file);
  }
};


  const handleSubmit = (e) => {
  e.preventDefault();

  const aadhaar = form?.personal?.aadhaarNumber || "";
  const pan = form?.personal?.panNumber || "";

  const aadhaarOk = AADHAAR_REGEX.test(aadhaar);
  const panOk = PAN_REGEX.test(pan);

  setErrors({
    aadhaarNumber: aadhaarOk ? "" : "Aadhaar must be exactly 12 digits.",
    panNumber: panOk ? "" : "PAN format invalid (e.g., ABCDE1234F).",
  });

  if (!aadhaarOk || !panOk) {
    // Stop submission if invalid
    return;
  }

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
                  setForm((prev) => ({
                    ...prev,
                    personal: { ...prev.personal, profilePhoto: null },
                  }));
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                style={{ display: photoPreview ? "inline" : "none" }}
              >
                Remove Photo
              </button>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
  <h3 className="text-lg font-bold mb-2 text-gray-700">Personal Information</h3>

  {/* Name, Father Name, DOB, etc. */}
  {Object.entries(form.personal).map(([key, value]) => {
    if (key === "aadhaar" || key === "pan" || key === "profilePhoto" || key === "aadhaarNumber" || key === "panNumber") {
      return null; // skip these, we'll render separately
    }
    return (
      <div key={key} className="mb-2">
        <label className="block text-sm font-medium text-gray-600">
          {key.replace(/_/g, " ").replace(/([A-Z])/g, " $1")}
        </label>
        <input
          type={key === "dob" ? "date" : "text"}
          className="border px-2 py-1 rounded w-full"
          value={value}
          onChange={(e) =>
            handleChange(
              "personal",
              key,
              key === "isActive" ? e.target.checked : e.target.value
            )
          }
          {...(key === "isActive" ? { type: "checkbox", checked: value } : {})}
        />
        {key === "isActive" && (
          <span className="ml-2">{value ? "Active" : "Inactive"}</span>
        )}
      </div>
    );
  })}

  {/* Aadhaar Number */}
<div className="mb-2">
  <label className="block text-sm font-medium text-gray-600">Aadhaar Number</label>
  <input
    type="text"
    inputMode="numeric"
    maxLength={12}
    pattern="\d{12}"
    className={`border px-2 py-1 rounded w-full ${
      errors.aadhaarNumber ? "border-red-500" : ""
    }`}
    value={form.personal.aadhaarNumber || ""}
    onChange={(e) =>
      handleChange("personal", "aadhaarNumber", e.target.value)
    }
    placeholder="Enter 12-digit Aadhaar"
  />
  {errors.aadhaarNumber && (
    <p className="text-red-600 text-xs mt-1">{errors.aadhaarNumber}</p>
  )}
</div>

{/* PAN Number */}
<div className="mb-2">
  <label className="block text-sm font-medium text-gray-600">PAN Number</label>
  <input
    type="text"
    maxLength={10}
    pattern="[A-Z]{5}[0-9]{4}[A-Z]"
    className={`border px-2 py-1 rounded w-full ${
      errors.panNumber ? "border-red-500" : ""
    }`}
    value={form.personal.panNumber || ""}
    onChange={(e) =>
      handleChange("personal", "panNumber", e.target.value)
    }
    placeholder="ABCDE1234F"
  />
  {errors.panNumber && (
    <p className="text-red-600 text-xs mt-1">{errors.panNumber}</p>
  )}
</div>


  {/* Aadhaar Upload */}
  <div className="mb-2">
    <label className="block text-sm font-medium text-gray-600">Aadhaar Card</label>
    <input
      type="file"
      accept="image/*,.pdf"
      onChange={(e) =>
        handleFileUpload("personal", "aadhaar", e.target.files[0])
      }
    />
    {form.personal.aadhaar && (
      <div className="mt-2">
        <span className="text-xs text-gray-500">{form.personal.aadhaar.name}</span>
        <a
          href={form.personal.aadhaar.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-blue-600 underline"
        >
          View
        </a>
      </div>
    )}
  </div>

  {/* PAN Upload */}
  <div className="mb-2">
    <label className="block text-sm font-medium text-gray-600">PAN Card</label>
    <input
      type="file"
      accept="image/*,.pdf"
      onChange={(e) =>
        handleFileUpload("personal", "pan", e.target.files[0])
      }
    />
    {form.personal.pan && (
      <div className="mt-2">
        <span className="text-xs text-gray-500">{form.personal.pan.name}</span>
        <a
          href={form.personal.pan.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-blue-600 underline"
        >
          View
        </a>
      </div>
    )}
  </div>
</div>

          {/* Experience Details */}
          <div className="mt-8 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-2 text-gray-700">Experience Details</h3>
            {form.experience.map((exp, idx) => (
              <div key={idx} className="mb-4 border-b pb-2">
                {/* Experience fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Company</label>
                    <input type="text" className="border px-2 py-1 rounded w-full" value={exp.company} onChange={e => handleExperienceChange(idx, "company", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Role</label>
                    <input type="text" className="border px-2 py-1 rounded w-full" value={exp.role} onChange={e => handleExperienceChange(idx, "role", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Years</label>
                    <input type="number" className="border px-2 py-1 rounded w-full" value={exp.years} onChange={e => handleExperienceChange(idx, "years", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Joining Date</label>
                    <input type="date" className="border px-2 py-1 rounded w-full" value={exp.joiningDate} onChange={e => handleExperienceChange(idx, "joiningDate", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Last Working Date</label>
                    <input type="date" className="border px-2 py-1 rounded w-full" value={exp.lastWorkingDate} onChange={e => handleExperienceChange(idx, "lastWorkingDate", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Salary</label>
                    <input type="number" className="border px-2 py-1 rounded w-full" value={exp.salary} onChange={e => handleExperienceChange(idx, "salary", e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Experience Certificate</label>
                    <input type="file" accept="image/*,.pdf" onChange={e => handleFileChange("experience", "certificate", e.target.files[0], idx)} />
                    {exp.certificate && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">{exp.certificate.name}</span>
                        <a href={exp.certificate.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">View</a>
                      </div>
                    )}
                  </div>
                </div>
                <button type="button" className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => handleRemoveExperience(idx)}>Remove</button>
              </div>
            ))}
            <button type="button" className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleAddExperience}>+ Add Experience</button>
          </div>
          <div className="mt-4 flex gap-4">
            <button
  type="submit"
  disabled={!isIDsValid}
  className={`px-4 py-2 rounded text-white ${
    isIDsValid
      ? "bg-green-600 hover:bg-green-700"
      : "bg-gray-400 cursor-not-allowed"
  }`}
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
  <p><strong>Aadhaar Number:</strong> {personal?.aadhaarNumber}</p>
  <p><strong>PAN Number:</strong> {personal?.panNumber}</p>
  {/* Profile Photo Display */}
  {personal?.profilePhoto && (
    <img
      src={personal.profilePhoto}
      alt="Profile"
      className="w-24 h-24 rounded-full border-2 border-gray-300 mt-2"
    />
  )}
  <p><strong>Active:</strong> {personal?.isActive ? "Yes" : "No"}</p>

  {/* Aadhaar Display */}
  <p>
    <strong>Aadhaar Card:</strong>{" "}
    {personal?.aadhaar ? (
      <a
        href={personal.aadhaar.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        {personal.aadhaar.name}
      </a>
    ) : (
      "Not uploaded"
    )}
  </p>

  {/* PAN Display */}
  <p>
    <strong>PAN Card:</strong>{" "}
    {personal?.pan ? (
      <a
        href={personal.pan.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        {personal.pan.name}
      </a>
    ) : (
      "Not uploaded"
    )}
  </p>
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
          {/* ✅ Read-only Experience Details */}
<div className="mt-8 bg-white p-4 rounded-lg shadow">
  <h3 className="text-lg font-bold mb-2 text-gray-700">Experience Details</h3>
  {experience && experience.length > 0 ? (
    <ul className="list-disc pl-5">
      {experience.map((exp, idx) => (
        <li key={idx} className="mb-3">
          <strong>{exp.company}</strong> - {exp.role} ({exp.years} years)
          <br />
          <span className="text-sm text-gray-600">
            {exp.joiningDate} to {exp.lastWorkingDate} | Salary: ₹{exp.salary}
          </span>

          {/* ✅ Show Experience Letter if available */}
          {exp.certificate && (
            <div className="mt-1">
              {exp.certificate.type === "application/pdf" ? (
                // If it's a PDF → open in new tab
                <a
                  href={exp.certificate.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm"
                >
                  View Experience Letter (PDF)
                </a>
              ) : (
                // If it's an image → show preview modal
                <button
                  onClick={() => setPreview(exp.certificate.url)}
                  className="text-blue-600 underline text-sm"
                >
                  View Experience Letter (Image)
                </button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  ) : (
    <p>No experience details available.</p>
  )}
</div>

{/* ✅ Edit mode Experience Details */}
{editing && (
  <div className="mt-8 bg-white p-4 rounded-lg shadow">
    <h3 className="text-lg font-bold mb-2 text-gray-700">Edit Experience</h3>
    {form.experience.map((exp, idx) => (
      <div key={idx} className="mb-4 border-b pb-3">
        <label className="block text-sm font-medium text-gray-600">
          Company
        </label>
        <input
          type="text"
          className="border px-2 py-1 rounded w-full"
          value={exp.company}
          onChange={(e) =>
            handleExperienceChange(idx, "company", e.target.value)
          }
        />

        <label className="block text-sm font-medium text-gray-600 mt-2">
          Role
        </label>
        <input
          type="text"
          className="border px-2 py-1 rounded w-full"
          value={exp.role}
          onChange={(e) =>
            handleExperienceChange(idx, "role", e.target.value)
          }
        />

        <label className="block text-sm font-medium text-gray-600 mt-2">
          Years
        </label>
        <input
          type="number"
          className="border px-2 py-1 rounded w-full"
          value={exp.years}
          onChange={(e) =>
            handleExperienceChange(idx, "years", e.target.value)
          }
        />

        {/* Repeat inputs for joiningDate, lastWorkingDate, salary, certificate */}
      </div>
    ))}

    {/* ✅ Add Button goes here */}
    <button
      type="button"
      onClick={handleAddExperience}
      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      + Add Experience
    </button>
  </div>
)}


        </>
      )}
    </div>
  );
};

export default CurrentEmployeeProfile;
