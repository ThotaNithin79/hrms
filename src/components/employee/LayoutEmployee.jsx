import { Outlet } from "react-router-dom";
import Sidebar from "./SidebarEmployee";
import Navbar from "./NavbarEmployee";

const LayoutEmployee = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="p-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutEmployee;
