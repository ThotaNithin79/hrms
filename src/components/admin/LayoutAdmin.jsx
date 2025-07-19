import Sidebar from "./Sidebar";  // now from admin folder
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const LayoutAdmin = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutAdmin;
