import { useParams, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { EmployeeContext } from '../context/EmployeeContext';

const EditEmployee = () => {
  const { id } = useParams();
  const { employees, editEmployee } = useContext(EmployeeContext);
  const navigate = useNavigate();

  const employee = employees.find((e) => e.employeeId === id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: ''
  });

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
    }
  }, [employee]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    editEmployee(id, formData);
    alert("Employee updated successfully.");
    navigate('/employees');
  };

  if (!employee) return <div className="p-6">Employee not found</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Edit Employee</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md bg-white p-6 rounded shadow">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Update
        </button>
      </form>
    </div>
  );
};

export default EditEmployee;
