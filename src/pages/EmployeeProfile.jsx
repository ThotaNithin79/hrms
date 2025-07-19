import { useParams } from 'react-router-dom';
import { useContext } from 'react';
import { EmployeeContext } from '../context/EmployeeContext';

const EmployeeProfile = () => {
  const { id } = useParams(); // Get the dynamic ID from URL
  const { employees } = useContext(EmployeeContext);

  // Match using employeeId instead of id
  const employee = employees.find((emp) => emp.employeeId === id);

  if (!employee) return <p>Employee not found.</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Profile of {employee.name}</h2>
      <p><strong>Email:</strong> {employee.email}</p>
      <p><strong>Phone:</strong> {employee.phone}</p>
      <p><strong>Department:</strong> {employee.department}</p>
      <p><strong>Address:</strong> {employee.address}</p>
      <p><strong>Joining Date:</strong> {employee.joiningDate}</p>
      <p><strong>Emergency Contact:</strong> {employee.emergency}</p>
    </div>
  );
};

export default EmployeeProfile;
