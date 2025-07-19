import { useNavigate } from "react-router-dom";

const SidebarEmployee = () => {
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-gray-800 text-white p-4">
      <h2 className="text-lg font-semibold mb-4">Employee Panel</h2>
      <ul className="space-y-2">
        <li onClick={() => navigate("/employee/dashboard")} className="cursor-pointer hover:underline">
          Dashboard
        </li>
        <li onClick={() => navigate("/employee/profile")} className="cursor-pointer hover:underline">
          My Profile
        </li>
        <li onClick={() => navigate("/employee/leave-summary")} className="cursor-pointer hover:underline">
          Leave Summary
        </li>
      </ul>
    </div>
  );
};

export default SidebarEmployee;
