import React, { useContext, useState } from "react";
import { HolidayCalendarContext } from "../context/HolidayCalendarContext";
import { FaPlus, FaEdit, FaTrash, FaFilter } from "react-icons/fa";

const AdminHolidayCalendarPage = () => {
  const { holidays, addHoliday, editHoliday, deleteHoliday, getHolidaysForMonth, getHolidaysForYear } = useContext(HolidayCalendarContext);

  const [form, setForm] = useState({ name: "", date: "", description: "" });
  const [editingId, setEditingId] = useState(null);

  // Filter state
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [searchTerm, setSearchTerm] = useState("");

  // Get filtered holidays
  const filteredHolidays = holidays
    .filter(h => (filterMonth ? h.date.startsWith(`${filterYear}-${filterMonth}`) : h.date.startsWith(filterYear)))
    .filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.description?.toLowerCase().includes(searchTerm.toLowerCase()));

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

  // Month options for dropdown
  const monthOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

  // Year options for dropdown (current year +/- 2)
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map(String);

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-blue-500" />
            <select
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              className="border rounded px-2 py-1 text-gray-700"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="border rounded px-2 py-1 text-gray-700"
            >
              <option value="">All Months</option>
              {monthOptions.map(m => (
                <option key={m} value={m}>
                  {new Date(`${currentYear}-${m}-01`).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Search by name or description"
            className="border rounded px-2 py-1 flex-1"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
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
            {filteredHolidays.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-400">
                  No holidays found.
                </td>
              </tr>
            )}
            {filteredHolidays.map((holiday) => {
              const todayStr = new Date().toISOString().slice(0, 10);
              const isFuture = holiday.date > todayStr;
              return (
                <tr key={holiday.id} className="border-b last:border-b-0 hover:bg-blue-50 transition">
                  <td className="py-2 px-3 font-medium">{holiday.name}</td>
                  <td className="py-2 px-3">{holiday.date}</td>
                  <td className="py-2 px-3">{holiday.description}</td>
                  <td className="py-2 px-3 flex gap-2">
                    {isFuture && (
                      <>
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
                      </>
                    )}
                    {!isFuture && (
                      <span className="text-xs text-gray-400">Locked</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHolidayCalendarPage;