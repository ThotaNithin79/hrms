import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { FaTachometerAlt, FaUsers, FaCalendarCheck, FaClipboardList, FaChartPie, FaBars } from "react-icons/fa";

const navLinks = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: <FaTachometerAlt />,
  },
  {
    to: "/employees",
    label: "Employee Management",
    icon: <FaUsers />,
  },
  {
    to: "/attendance",
    label: "Attendance",
    icon: <FaCalendarCheck />,
  },
  {
    to: "/leave-management",
    label: "Leave Management",
    icon: <FaClipboardList />,
  },
  {
    to: "/admin/leave-summary",
    label: "Leave Summary",
    icon: <FaChartPie />,
  },
  {
    to: "/admin/notices",
    label: "Admin Notices",
    icon: <FaClipboardList />,
  },
];

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-xl transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} p-4 flex flex-col`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold tracking-wide transition-all duration-300 ${collapsed ? 'hidden' : ''}`}>HRMS</h2>
        <button
          className="text-white text-xl focus:outline-none hover:text-blue-400"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label="Toggle Sidebar"
        >
          <FaBars />
        </button>
      </div>
      <ul className="space-y-2 flex-1">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-150 focus:outline-none text-base ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'hover:bg-gray-700 hover:text-blue-400 text-gray-200'
                } ${collapsed ? 'justify-center px-2' : ''}`}
                title={link.label}
              >
                <span className="text-xl">{link.icon}</span>
                {!collapsed && <span>{link.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className={`mt-auto text-xs text-gray-400 transition-all duration-300 ${collapsed ? 'hidden' : ''}`}>
        &copy; {new Date().getFullYear()} HRMS Admin
      </div>
    </div>
  );
};

export default Sidebar;
