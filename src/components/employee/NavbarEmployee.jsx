import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const NavbarEmployee = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="h-16 bg-white flex justify-between items-center px-6 shadow">
      <h1 className="text-xl font-semibold text-gray-800">HRMS Employee</h1>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">Employee</span>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="text-sm text-red-500 hover:underline"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default NavbarEmployee;
