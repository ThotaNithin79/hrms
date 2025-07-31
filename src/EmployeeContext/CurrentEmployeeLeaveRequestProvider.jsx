import React, { createContext, useState } from "react";

export const CurrentEmployeeLeaveRequestContext = createContext();

const CurrentEmployeeLeaveRequestProvider = ({ children }) => {
  // Example state, replace with your actual leave request logic
  const [leaveRequests, setLeaveRequests] = useState([]);

  return (
    <CurrentEmployeeLeaveRequestContext.Provider value={{ leaveRequests, setLeaveRequests }}>
      {children}
    </CurrentEmployeeLeaveRequestContext.Provider>
  );
};

export default CurrentEmployeeLeaveRequestProvider;
