import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ✅ Check for saved user on app load
  useEffect(() => {
    const savedUser = localStorage.getItem("hrmsUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email, password) => {
    if (email === "admin@hrms.com" && password === "admin123") {
      const userData = { role: "admin", email };
      localStorage.setItem("hrmsUser", JSON.stringify(userData)); // ✅ Save to localStorage
      setUser(userData);
      return "admin";
    } else if (email === "john@example.com" && password === "emp123") {
      const userData = { role: "employee", email };
      localStorage.setItem("hrmsUser", JSON.stringify(userData));
      setUser(userData);
      return "employee";
    } else {
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("hrmsUser"); // ✅ Clear localStorage
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
