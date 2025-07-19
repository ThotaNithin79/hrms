import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-4">
      <h2 className="text-2xl font-bold mb-6">HRMS</h2>
      <ul className="space-y-4">
        <li>
          <Link to="/admin/dashboard" className="hover:text-blue-400">
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/employees" className="hover:text-blue-400">
            Employee Management
          </Link>
        </li>
        <li>
          <Link to="/attendance" className="hover:text-blue-400">
            Attendance
          </Link>
        </li>
        <li>
          <Link to="/leave-management" className="hover:text-blue-400">
            Leave Management
          </Link>
        </li>
        <li>
          <Link to="/admin/leave-summary" className="hover:text-blue-400">
            Leave Summary
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
