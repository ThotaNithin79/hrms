import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaClock, FaClipboardList, FaBullhorn, FaUser, FaKey, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";

const tabs = [
  {
    label: "Dashboard",
    icon: <FaHome className="mr-2" />,
    path: "/employee/dashboard",
    description: "Landing page with summary: attendance, leaves, profile, notices."
  },
  {
    label: "Attendance",
    icon: <FaClock className="mr-2" />,
    path: "/attendance",
    description: "View punch in/out history. Filter by date/month. Show detailed status."
  },
  {
    label: "Calendar View",
    icon: <FaCalendarAlt className="mr-2" />,
    path: "/attendance/calendar",
    description: "Monthly calendar. Shows status for each day. Clickable dates for details."
  },
  {
    label: "Leave Management",
    icon: <FaClipboardList className="mr-2" />,
    path: "/employee/leave-management",
    description: "Apply for leave, view history, see available vs. used leaves."
  },
  {
    label: "Notice Board",
    icon: <FaBullhorn className="mr-2" />,
    path: "/employee/notices",
    description: "View company-wide announcements and notices."
  },
  {
    label: "My Profile",
    icon: <FaUser className="mr-2" />,
    path: "/employee/profile",
    description: "View and edit profile details. Upload/change profile photo."
  },
  {
    label: "Change Password",
    icon: <FaKey className="mr-2" />,
    path: "/employee/change-password",
    description: "Securely update login password."
  },
];

const SidebarEmployee = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(window.innerWidth >= 768);
  const [collapsed, setCollapsed] = useState(false);

  // Responsive sidebar: auto-show on desktop, auto-hide on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    // Initial check
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    // Add logout logic here (clear session, redirect, etc.)
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Hamburger icon for small screens */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-900 text-white p-2 rounded-lg shadow-lg focus:outline-none"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
        style={{ display: open ? 'none' : 'block' }}
      >
        <FaBars className="text-2xl" />
      </button>
      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full ${collapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-blue-900 to-blue-700 text-white shadow-lg flex flex-col p-2 md:p-6 z-40 transition-all duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ minHeight: '100vh', transition: 'all 0.3s' }}
      >
        {/* Collapse/Expand toggle button (always visible) */}
        <button
          className="absolute top-4 right-4 text-white text-xl bg-blue-700 rounded-full p-2 shadow focus:outline-none"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <FaBars /> : <FaTimes />}
        </button>
        {/* Close icon for mobile (only when sidebar is open and not collapsed) */}
        {open && !collapsed && (
          <button
            className="md:hidden absolute top-4 left-4 text-white text-2xl focus:outline-none"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        )}
        <div className={`mb-8 flex items-center gap-3 mt-2 ${collapsed ? 'justify-center' : ''}`}>
          <FaUser className="text-3xl" />
          {!collapsed && <span className="text-xl font-bold tracking-wide">Employee Panel</span>}
        </div>
        <ul className={`flex-1 space-y-2 mt-4 ${collapsed ? 'items-center' : ''}`}>
          {tabs.map((tab) => (
            <li
              key={tab.label}
              onClick={() => { setOpen(false); navigate(tab.path); }}
              className={`flex items-center gap-2 px-2 py-3 rounded-lg cursor-pointer hover:bg-blue-600 transition group ${collapsed ? 'justify-center' : ''}`}
              title={tab.description}
            >
              {tab.icon}
              {!collapsed && <span className="font-semibold group-hover:underline">{tab.label}</span>}
            </li>
          ))}
        </ul>
        <button
          onClick={handleLogout}
          className={`mt-8 flex items-center gap-2 px-2 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow transition ${collapsed ? 'justify-center' : ''}`}
        >
          <FaSignOutAlt /> {!collapsed && 'Logout'}
        </button>
      </div>
    </>
  );
};

export default SidebarEmployee;
