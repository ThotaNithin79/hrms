import { Link, useLocation, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaCalendarCheck, 
  FaClipboardList, 
  FaChartPie, 
  FaBars, 
  FaCalendarAlt,
  FaChevronDown,
  FaFileAlt,
  FaClock,
  FaBusinessTime
} from "react-icons/fa";

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
    label: "Attendance",
    icon: <FaCalendarCheck />,
    basePath: "/attendance",
    subLinks: [
      {
        to: "/attendance",
        label: "Attendance Log",
        icon: <FaFileAlt />,
      },
      {
        to: "/attendance/overtime",
        label: "Over Time",
        icon: <FaClock />,
      },
      {
        to: "/attendance/permissions",
        label: "Permission Hours",
        icon: <FaBusinessTime />,
      },
    ],
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
  {
    to: "/admin/holiday-calendar",
    label: "Holiday Calendar",
    icon: <FaCalendarAlt />,
  },
];

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState({});

  useEffect(() => {
    if (collapsed) {
      setOpenSubMenus({});
    }
  }, [collapsed]);
  
  const handleSubMenuToggle = (label) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <div className={`h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white shadow-xl transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} p-4 flex flex-col`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold tracking-wide transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>HRMS</h2>
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
          if (link.subLinks) {
            const isParentActive = location.pathname.startsWith(link.basePath);
            const isSubMenuOpen = openSubMenus[link.label] && !collapsed;

            return (
              <li key={link.label}>
                <button
                  onClick={() => handleSubMenuToggle(link.label)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-semibold transition-all duration-150 focus:outline-none text-base ${
                    isParentActive
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-700 hover:text-blue-400 text-gray-200'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{link.icon}</span>
                    {!collapsed && <span>{link.label}</span>}
                  </div>
                  {!collapsed && (
                    <FaChevronDown
                      className={`transition-transform duration-200 ${isSubMenuOpen ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isSubMenuOpen ? 'max-h-40' : 'max-h-0'}`}>
                  <ul className="mt-2 space-y-1 pl-8">
                    {link.subLinks.map((subLink) => (
                      <li key={subLink.to}>
                        <NavLink
                          to={subLink.to}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                              isActive
                                ? 'text-blue-400'
                                : 'text-gray-400 hover:text-blue-400'
                            }`
                          }
                        >
                          {!collapsed && subLink.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          }
          
          return (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-150 focus:outline-none text-base ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'hover:bg-gray-700 hover:text-blue-400 text-gray-200'
                  } ${collapsed ? 'justify-center px-2' : ''}`
                }
                title={link.label}
              >
                <span className="text-xl">{link.icon}</span>
                {!collapsed && <span>{link.label}</span>}
              </NavLink>
            </li>
          );
        })}
      </ul>
      <div className={`mt-auto text-xs text-gray-400 transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
        &copy; {new Date().getFullYear()} HRMS Admin
      </div>
    </div>
  );
};

export default Sidebar;