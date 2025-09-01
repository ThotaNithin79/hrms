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

  // Collect all validation errors here (personal, contact, job, bank, experience)
  const [errors, setErrors] = useState({
    aadhaarNumber: "",
    panNumber: "",
    personal: {},
    contact: {},
    job: {},
    bank: {},
    experience: [], // array aligned with form.experience indexes
  });

  const isIDsValid =
    AADHAAR_REGEX.test(form?.personal?.aadhaarNumber || "") &&
    PAN_REGEX.test(form?.personal?.panNumber || "");

  // Required field keys by section
  const REQUIRED_PERSONAL = new Set(["name", "aadhaarNumber", "panNumber"]); // 'isActive' removed
  const REQUIRED_CONTACT  = new Set(["email", "phone", "emergency_contact_phone"]);
  const REQUIRED_JOB      = new Set(["employeeId", "department", "department_id", "designation"]);
  const REQUIRED_BANK     = new Set(["bankName", "accountNumber", "ifsc", "branch"]);

  // For experience items
  const REQUIRED_EXPERIENCE = new Set([
    "company",
    "role",
    "joiningDate",
    "lastWorkingDate",
    "salary",
    "reason",
    "certificate",
  ]);

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

    const newErrors = { personal: {}, contact: {}, job: {}, bank: {}, experience: [] };

    // --- Personal required checks ---
    const p = form.personal || {};
    if (!p.name) newErrors.personal.name = "Name is required.";
    if (!p.aadhaarNumber) newErrors.personal.aadhaarNumber = "Aadhaar number is required.";
    if (!p.panNumber) newErrors.personal.panNumber = "PAN number is required.";
    if (!p.aadhaar) newErrors.personal.aadhaar = "Aadhaar card file is required.";
    if (!p.pan) newErrors.personal.pan = "PAN card file is required.";
    if (!p.resume) newErrors.personal.resume = "Resume (PDF) is required."; // ✅ NEW mandatory

    // --- Aadhaar/PAN format checks ---
    const aadhaarOk = AADHAAR_REGEX.test(p?.aadhaarNumber || "");
    const panOk = PAN_REGEX.test(p?.panNumber || "");
    if (!aadhaarOk && p?.aadhaarNumber) {
      newErrors.personal.aadhaarNumber = "Aadhaar must be exactly 12 digits.";
    }
    if (!panOk && p?.panNumber) {
      newErrors.personal.panNumber = "PAN format invalid (e.g., ABCDE1234F).";
    }

    // --- Contact required checks ---
    const c = form.contact || {};
    if (!c.email) newErrors.contact.email = "Email is required.";
    if (!c.phone) newErrors.contact.phone = "Phone is required.";
    if (!c.emergency_contact_phone) {
      newErrors.contact.emergency_contact_phone = "Emergency contact number is required.";
    }

    // --- Job required checks ---
    const j = form.job || {};
    if (!j.employeeId) newErrors.job.employeeId = "Employee ID is required.";
    if (!j.department) newErrors.job.department = "Department is required.";
    if (!j.department_id) newErrors.job.department_id = "Department ID is required.";
    if (!j.designation) newErrors.job.designation = "Designation is required.";

    // --- Bank required checks ---
    const b = form.bank || {};
    if (!b.bankName) newErrors.bank.bankName = "Bank name is required.";
    if (!b.accountNumber) newErrors.bank.accountNumber = "Account number is required.";
    if (!b.ifsc) newErrors.bank.ifsc = "IFSC code is required.";
    if (!b.branch) newErrors.bank.branch = "Branch is required.";

    // --- Experience required checks per item ---
    (form.experience || []).forEach((exp, idx) => {
      const eErr = {};
      if (!exp.company) eErr.company = "Company is required.";
      if (!exp.role) eErr.role = "Role is required.";
      if (!exp.joiningDate) eErr.joiningDate = "Joining date is required.";
      if (!exp.lastWorkingDate) eErr.lastWorkingDate = "Last working date is required.";
      if (!exp.salary) eErr.salary = "Salary is required.";
      if (!exp.reason) eErr.reason = "Reason is required.";
      if (!exp.certificate) eErr.certificate = "Experience certificate is required.";
      newErrors.experience[idx] = eErr;
    });

    setErrors(prev => ({ ...prev, ...newErrors }));

    // Helper to see if any error exists
    const hasAnyError =
      Object.values(newErrors.personal).some(Boolean) ||
      Object.values(newErrors.contact).some(Boolean) ||
      Object.values(newErrors.job).some(Boolean) ||
      Object.values(newErrors.bank).some(Boolean) ||
      (newErrors.experience || []).some(obj => obj && Object.values(obj).some(Boolean));

    if (hasAnyError || !aadhaarOk || !panOk) {
      // ❌ Stop submission if invalid
      return;
    }

    // ✅ All good → Save
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

          {/* PERSONAL (text fields, excluding special ones) */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4 text-gray-700">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(form.personal).map(([key, value]) => {
                if (
                  key === "aadhaar" ||
                  key === "pan" ||
                  key === "resume" ||           // exclude resume from text inputs
                  key === "profilePhoto" ||
                  key === "aadhaarNumber" ||
                  key === "panNumber" ||
                  key === "isActive"
                ) {
                  return null;
                }
                const isRequired = REQUIRED_PERSONAL.has(key);
                return (
                  <div key={key} className="mb-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {key.replace(/_/g, " ").replace(/([A-Z])/g, " $1")}
                      {isRequired && <span className="text-red-600 ml-1">*</span>}
                    </label>
                    <input
                      type={key === "dob" ? "date" : "text"}
                      className={`border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.personal?.[key] ? "border-red-500" : "border-gray-300"}`}
                      value={value}
                      onChange={(e) => handleChange("personal", key, e.target.value)}
                      required={isRequired}
                    />
                    {errors.personal?.[key] && (
                      <p className="text-red-600 text-xs mt-1">{errors.personal[key]}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Aadhaar # & PAN # */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="mb-2 col-span-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Aadhaar Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  pattern="\d{12}"
                  className={`border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.aadhaarNumber ? "border-red-500" : "border-gray-300"}`}
                  value={form.personal.aadhaarNumber || ""}
                  onChange={(e) => handleChange("personal", "aadhaarNumber", e.target.value)}
                  required={!form.personal.aadhaar}
                  placeholder="Enter 12-digit Aadhaar"
                />
                {errors.aadhaarNumber && (
                  <p className="text-red-600 text-xs mt-1">{errors.aadhaarNumber}</p>
                )}
              </div>
              <div className="mb-2 col-span-1">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  PAN Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]"
                  className={`border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.panNumber ? "border-red-500" : "border-gray-300"}`}
                  value={form.personal.panNumber || ""}
                  onChange={(e) => handleChange("personal", "panNumber", e.target.value)}
                  required={!form.personal.aadhaar}
                  placeholder="ABCDE1234F"
                />
                {errors.panNumber && (
                  <p className="text-red-600 text-xs mt-1">{errors.panNumber}</p>
                )}
              </div>
            </div>

            {/* Aadhaar & PAN files */}
            <div className="grid grid-cols-1 gap-6 mt-4">
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Aadhaar Card <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload("personal", "aadhaar", e.target.files[0])}
                  className="border px-3 py-2 rounded-lg w-full"
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
                {errors.personal?.aadhaar && (
                  <p className="text-red-600 text-xs mt-1">{errors.personal.aadhaar}</p>
                )}
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  PAN Card <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload("personal", "pan", e.target.files[0])}
                  className="border px-3 py-2 rounded-lg w-full"
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
                {errors.personal?.pan && (
                  <p className="text-red-600 text-xs mt-1">{errors.personal.pan}</p>
                )}
              </div>

              {/* ✅ NEW: Resume (PDF only, mandatory) */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Resume (PDF) <span className="text-red-600">*</span>
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.type !== "application/pdf") {
                      setErrors((prev) => ({
                        ...prev,
                        personal: { ...prev.personal, resume: "Only PDF files are allowed." },
                      }));
                      return;
                    }
                    setErrors((prev) => ({
                      ...prev,
                      personal: { ...prev.personal, resume: "" },
                    }));
                    handleFileUpload("personal", "resume", file);
                  }}
                  className="border px-3 py-2 rounded-lg w-full"
                />
                {form.personal.resume && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">{form.personal.resume.name}</span>
                    <a
                      href={form.personal.resume.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 underline"
                    >
                      View
                    </a>
                  </div>
                )}
                {errors.personal?.resume && (
                  <p className="text-red-600 text-xs mt-1">{errors.personal.resume}</p>
                )}
              </div>
            </div>
          </div>

          {/* ✅ CONTACT (Editable) */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4 text-gray-700">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ["email", "Email", "email"],
                ["phone", "Phone", "tel"],
                ["address", "Address", "text"],
                ["city", "City", "text"],
                ["emergency_contact_name", "Emergency Contact Name", "text"],
                ["emergency_contact_phone", "Emergency Contact Phone", "tel"],
                ["emergency_contact_relation", "Emergency Contact Relation", "text"],
              ].map(([key, label, type]) => {
                const isRequired = REQUIRED_CONTACT.has(key);
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {label}{isRequired && <span className="text-red-600 ml-1">*</span>}
                    </label>
                    <input
                      type={type}
                      className={`border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.contact?.[key] ? "border-red-500" : "border-gray-300"}`}
                      value={form.contact?.[key] || ""}
                      onChange={(e) => handleChange("contact", key, e.target.value)}
                      required={isRequired}
                    />
                    {errors.contact?.[key] && (
                      <p className="text-red-600 text-xs mt-1">{errors.contact[key]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ✅ JOB (Editable) */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4 text-gray-700">Job Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ["employeeId", "Employee ID", "text"],
                ["department_id", "Department ID", "text"],
                ["department", "Department", "text"],
                ["designation", "Designation", "text"],
                ["joiningDate", "Date of Joining", "date"],
              ].map(([key, label, type]) => {
                const isRequired = REQUIRED_JOB.has(key);
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {label}{isRequired && <span className="text-red-600 ml-1">*</span>}
                    </label>
                    <input
                      type={type}
                      className={`border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.job?.[key] ? "border-red-500" : "border-gray-300"}`}
                      value={form.job?.[key] || ""}
                      onChange={(e) => handleChange("job", key, e.target.value)}
                      required={isRequired}
                    />
                    {errors.job?.[key] && (
                      <p className="text-red-600 text-xs mt-1">{errors.job[key]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ✅ BANK (Editable) */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4 text-gray-700">Bank Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ["bankName", "Bank Name", "text"],
                ["accountNumber", "Account Number", "text"],
                ["ifsc", "IFSC Code", "text"],
                ["branch", "Branch", "text"],
              ].map(([key, label, type]) => {
                const isRequired = REQUIRED_BANK.has(key);
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      {label}{isRequired && <span className="text-red-600 ml-1">*</span>}
                    </label>
                    <input
                      type={type}
                      className={`border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.bank?.[key] ? "border-red-500" : "border-gray-300"}`}
                      value={form.bank?.[key] || ""}
                      onChange={(e) => handleChange("bank", key, e.target.value)}
                      required={isRequired}
                    />
                    {errors.bank?.[key] && (
                      <p className="text-red-600 text-xs mt-1">{errors.bank[key]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Experience Details (unchanged layout for dates) */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4 text-gray-700">Experience Details</h3>
            {form.experience.map((exp, idx) => (
              <div key={idx} className="mb-6 border-b pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor={`exp-${idx}-company`} className="block text-sm font-medium text-gray-600 mb-1">
                      Company <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={`exp-${idx}-company`}
                      type="text"
                      className={`border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.experience?.[idx]?.company ? "border-red-500" : "border-gray-300"}`}
                      value={exp.company}
                      onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                      required
                    />
                    {errors.experience?.[idx]?.company && (
                      <p className="text-red-600 text-xs mt-1">{errors.experience[idx].company}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor={`exp-${idx}-role`} className="block text-sm font-medium text-gray-600 mb-1">
                      Role <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={`exp-${idx}-role`}
                      type="text"
                      className={`border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.experience?.[idx]?.role ? "border-red-500" : "border-gray-300"}`}
                      value={exp.role}
                      onChange={(e) => handleExperienceChange(idx, "role", e.target.value)}
                      required
                    />
                    {errors.experience?.[idx]?.role && (
                      <p className="text-red-600 text-xs mt-1">{errors.experience[idx].role}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor={`exp-${idx}-years`} className="block text-sm font-medium text-gray-600 mb-1">
                      Years
                    </label>
                    <input
                      id={`exp-${idx}-years`}
                      type="number"
                      className={`border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.experience?.[idx]?.years ? "border-red-500" : "border-gray-300"}`}
                      value={exp.years}
                      onChange={(e) => handleExperienceChange(idx, "years", e.target.value)}
                    />
                    {errors.experience?.[idx]?.years && (
                      <p className="text-red-600 text-xs mt-1">{errors.experience[idx].years}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Joining Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        className={`border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.experience?.[idx]?.joiningDate ? "border-red-500" : "border-gray-300"}`}
                        value={exp.joiningDate}
                        onChange={e => handleExperienceChange(idx, "joiningDate", e.target.value)}
                        required
                      />
                      {errors.experience?.[idx]?.joiningDate && (
                        <p className="text-red-600 text-xs mt-1">{errors.experience[idx].joiningDate}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Last Working Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        className={`border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.experience?.[idx]?.lastWorkingDate ? "border-red-500" : "border-gray-300"}`}
                        value={exp.lastWorkingDate}
                        onChange={e => handleExperienceChange(idx, "lastWorkingDate", e.target.value)}
                        required
                      />
                      {errors.experience?.[idx]?.lastWorkingDate && (
                        <p className="text-red-600 text-xs mt-1">{errors.experience[idx].lastWorkingDate}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor={`exp-${idx}-salary`} className="block text-sm font-medium text-gray-600 mb-1">
                      Salary <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={`exp-${idx}-salary`}
                      type="number"
                      className={`border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.experience?.[idx]?.salary ? "border-red-500" : "border-gray-300"}`}
                      value={exp.salary}
                      onChange={(e) => handleExperienceChange(idx, "salary", e.target.value)}
                      required
                    />
                    {errors.experience?.[idx]?.salary && (
                      <p className="text-red-600 text-xs mt-1">{errors.experience[idx].salary}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label htmlFor={`exp-${idx}-cert`} className="block text-sm font-medium text-gray-600 mb-1">
                      Experience Certificate <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={`exp-${idx}-cert`}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange("experience", "certificate", e.target.files[0], idx)}
                      className="border px-3 py-2 rounded-lg w-full"
                      required={!exp.certificate}
                    />
                    {errors.experience?.[idx]?.certificate && (
                      <p className="text-red-600 text-xs mt-1">{errors.experience[idx].certificate}</p>
                    )}
                    {exp.certificate && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">{exp.certificate.name}</span>
                        <a
                          href={exp.certificate.url}
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
                    <label htmlFor={`exp-${idx}-reason`} className="block text-sm font-medium text-gray-600 mb-1">
                      Reason for Leaving <span className="text-red-600">*</span>
                    </label>
                    <input
                      id={`exp-${idx}-reason`}
                      type="text"
                      className={`border px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200 ${errors.experience?.[idx]?.reason ? "border-red-500" : "border-gray-300"}`}
                      value={exp.reason || ""}
                      onChange={(e) => handleExperienceChange(idx, "reason", e.target.value)}
                      required
                      placeholder="Enter reason (e.g., better opportunity, relocation)"
                    />
                    {errors.experience?.[idx]?.reason && (
                      <p className="text-red-600 text-xs mt-1">{errors.experience[idx].reason}</p>
                    )}
                  </div>
                </div>
                <button type="button" className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600" onClick={() => handleRemoveExperience(idx)}>Remove</button>
              </div>
            ))}
            <button type="button" className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={handleAddExperience}>+ Add Experience</button>
          </div>

          <div className="mt-4 flex gap-4">
            {(Object.keys(errors.contact || {}).length > 0 ||
              Object.keys(errors.job || {}).length > 0 ||
              Object.keys(errors.bank || {}).length > 0) && (
              <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm">
                Some required details in Contact/Job/Bank are missing. Please complete them.
              </div>
            )}

            <button
  type="submit"
  className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
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
              {/* 'isActive' removed from display */}

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

              {/* ✅ Resume Display */}
              <p>
                <strong>Resume:</strong>{" "}
                {personal?.resume ? (
                  <a
                    href={personal.resume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {personal.resume.name}
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

          {/* Read-only Experience Details */}
          <div className="mt-8 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-2 text-gray-700">Experience Details</h3>
            {experience && experience.length > 0 ? (
              <ul className="list-disc pl-5">
                {experience.map((exp, idx) => (
                  <li key={idx} className="mb-3">
                    <strong>{exp.company}</strong> - {exp.role} ({exp.years} years)
                    <br />
                    <span className="text-sm text-gray-600 block">
                      {exp.joiningDate} to {exp.lastWorkingDate} | Salary: ₹{exp.salary} | Reason: {exp.reason || "N/A"}
                    </span>

                    {exp.certificate && (
                      <div className="mt-1">
                        <a
                          href={exp.certificate.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-sm"
                        >
                          View Experience Letter
                        </a>
                      </div>
                    )}
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
