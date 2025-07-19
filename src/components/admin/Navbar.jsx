import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../../context/NotificationContext";

const Navbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const { unreadCount } = useContext(NotificationContext); // 👈 use context to get unread notifications count

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to login
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-16 bg-white flex items-center justify-between px-6 shadow">
      <h1 className="text-xl font-semibold text-gray-800">HRMS Admin</h1>

      <div className="flex items-center gap-4">
        <div
          className="relative cursor-pointer"
          onClick={() => navigate("/admin/notifications")}
        >
          <span role="img" aria-label="notifications">
            🔔
          </span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2.5 h-2.5" />
          )}
        </div>

        {/* Profile section with toggle dropdown */}
        <div
          ref={menuRef}
          className="relative flex items-center gap-2 cursor-pointer"
          onClick={() => setShowMenu((prev) => !prev)}
        >
          <div className="w-8 h-8 bg-gray-300 rounded-full" />
          <span className="text-gray-700">Admin</span>

          {/* Dropdown menu */}
          {showMenu && (
            <div className="absolute top-10 right-0 bg-white border rounded shadow w-36 z-50 text-sm">
              <div
                onClick={() => {
                  navigate("/admin/profile");
                  setShowMenu(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                View Profile
              </div>
              <div
                onClick={handleLogout}
                className="px-4 py-2 text-red-500 hover:bg-gray-100 cursor-pointer"
              >
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
