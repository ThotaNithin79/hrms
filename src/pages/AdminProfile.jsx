import { useContext, useState } from "react";
import { AdminContext } from "../context/AdminContext";

const AdminProfile = () => {
  const { admin, updateAdmin } = useContext(AdminContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...admin });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    updateAdmin(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(admin); // reset
    setIsEditing(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow space-y-4">
      <h2 className="text-2xl font-bold text-center mb-4">Admin Profile</h2>

      {!isEditing ? (
        <div className="space-y-2 text-gray-800">
          <p><strong>ID:</strong> {admin.id}</p>
          <p><strong>Name:</strong> {admin.name}</p>
          <p><strong>Email:</strong> {admin.email}</p>
          <p><strong>Role:</strong> {admin.role}</p>
          <p><strong>Phone:</strong> {admin.phone}</p>
          <p><strong>Department:</strong> {admin.department}</p>

          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-2">
            <label>
              Name:
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded"
              />
            </label>
            <label>
              Email:
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded"
              />
            </label>
            <label>
              Role:
              <input
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded"
              />
            </label>
            <label>
              Phone:
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded"
              />
            </label>
            <label>
              Department:
              <input
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded"
              />
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfile;
