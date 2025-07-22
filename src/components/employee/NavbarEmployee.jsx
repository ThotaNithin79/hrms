import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBell, FaChevronDown, FaUserCircle, FaSignOutAlt, FaKey, FaUser } from "react-icons/fa";

const getPageTitle = (pathname) => {
  // Map routes to page titles
  if (pathname.includes("dashboard")) return "Dashboard";
  if (pathname.includes("attendance/calendar")) return "Calendar View";
  if (pathname.includes("attendance")) return "Attendance";
  if (pathname.includes("leave-management")) return "Leave Management";
  if (pathname.includes("leave-summary")) return "Leave Summary";
  if (pathname.includes("notices")) return "Notice Board";
  if (pathname.includes("profile")) return "My Profile";
  if (pathname.includes("change-password")) return "Change Password";
  return "Dashboard";
};

const notifications = [
  { id: 1, text: "Your leave request was approved." },
  { id: 2, text: "New company notice posted." },
  { id: 3, text: "Attendance marked for today." },
];

const NavbarEmployee = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Dummy user info (replace with context/user data)
  const user = {
    name: "John Doe",
    role: "Employee",
    avatar: null, // Replace with actual avatar URL if available
  };

  return (
    <div className="h-16 bg-white flex justify-between items-center px-6 shadow relative z-10">
      {/* Logo/Brand */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/employee/dashboard")}> 
        <img src="/src/assets/logo.png" alt="HRMS Logo" className="h-8 w-8 rounded-full" />
        <span className="text-xl font-bold text-blue-700 tracking-wide">HRMS</span>
      </div>

      {/* Page Title / Breadcrumb */}
      <div className="flex-1 flex justify-center">
        <span className="text-lg font-semibold text-gray-700">{getPageTitle(location.pathname)}</span>
      </div>

      {/* Right Side: Notifications + Profile */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button
            className="text-blue-600 text-xl relative focus:outline-none"
            onClick={() => setShowNotif((v) => !v)}
            title="Notifications"
          >
            <FaBell />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
              {notifications.length}
            </span>
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border z-20">
              <div className="p-3 border-b font-semibold text-blue-700">Notifications</div>
              <ul className="max-h-60 overflow-y-auto">
                {notifications.slice(0, 5).map((n) => (
                  <li key={n.id} className="px-4 py-2 text-gray-700 border-b last:border-b-0 hover:bg-blue-50 cursor-pointer">
                    {n.text}
                  </li>
                ))}
                {notifications.length === 0 && (
                  <li className="px-4 py-2 text-gray-400">No notifications</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold focus:outline-none"
            onClick={() => setShowProfile((v) => !v)}
            title="Profile"
          >
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <FaUserCircle className="text-2xl" />
            )}
            <span>{user.name}</span>
            <FaChevronDown className="ml-1" />
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-20">
              <ul className="py-2">
                <li
                  className="px-4 py-2 flex items-center gap-2 hover:bg-blue-50 cursor-pointer"
                  onClick={() => { setShowProfile(false); navigate("/employee/profile"); }}
                >
                  <FaUser /> My Profile
                </li>
                <li
                  className="px-4 py-2 flex items-center gap-2 hover:bg-blue-50 cursor-pointer"
                  onClick={() => { setShowProfile(false); navigate("/employee/change-password"); }}
                >
                  <FaKey /> Change Password
                </li>
                <li
                  className="px-4 py-2 flex items-center gap-2 hover:bg-red-100 text-red-600 cursor-pointer border-t"
                  onClick={() => { setShowProfile(false); logout(); navigate("/"); }}
                >
                  <FaSignOutAlt /> Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavbarEmployee;
