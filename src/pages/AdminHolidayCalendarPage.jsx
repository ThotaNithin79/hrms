import React, { useContext, useState } from "react";
import { HolidayCalendarContext } from "../context/HolidayCalendarContext";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const AdminHolidayCalendarPage = () => {
  const { holidays, addHoliday, editHoliday, deleteHoliday } = useContext(HolidayCalendarContext);

  const [form, setForm] = useState({ name: "", date: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.date) return;
    if (editingId) {
      editHoliday(editingId, form);
      setEditingId(null);
    } else {
      addHoliday(form);
    }
    setForm({ name: "", date: "", description: "" });
  };

  const handleEdit = (holiday) => {
    setForm({ name: holiday.name, date: holiday.date, description: holiday.description });
    setEditingId(holiday.id);
  };

  const handleCancel = () => {
    setForm({ name: "", date: "", description: "" });
    setEditingId(null);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">
        <FaPlus className="text-blue-400" /> Manage Holiday Calendar
      </h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mb-8 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Holiday Name"
            className="border rounded px-3 py-2 flex-1"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>
        <textarea
          placeholder="Description (optional)"
          className="border rounded px-3 py-2"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {editingId ? "Update Holiday" : "Add Holiday"}
          </button>
          {editingId && (
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              onClick={handleCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4 text-blue-600">Holiday List</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-blue-50">
              <th className="py-2 px-3">Name</th>
              <th className="py-2 px-3">Date</th>
              <th className="py-2 px-3">Description</th>
              <th className="py-2 px-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-400">
                  No holidays added yet.
                </td>
              </tr>
            )}
            {holidays.map((holiday) => (
              <tr key={holiday.id} className="border-b last:border-b-0">
                <td className="py-2 px-3 font-medium">{holiday.name}</td>
                <td className="py-2 px-3">{holiday.date}</td>
                <td className="py-2 px-3">{holiday.description}</td>
                <td className="py-2 px-3 flex gap-2">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => handleEdit(holiday)}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => deleteHoliday(holiday.id)}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHolidayCalendarPage;