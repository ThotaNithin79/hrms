// EmployeeSettingsProvider.jsx
import React, { useState, useEffect } from "react";
import { EmployeeSettingsContext } from "./EmployeeSettingsContext";

const SETTINGS_KEY = "employee_settings";

const defaultSettings = {
  notifications: true,
  emailNotifications: false,
  notifSound: true,
  punchInSound: true,
  punchOutSound: true,
  requestButtonSound: true,
};

const EmployeeSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      setSettings({ ...defaultSettings, ...JSON.parse(stored) });
    }
  }, []);

  // Persist settings to localStorage on change
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleChange = (name, value) => {
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <EmployeeSettingsContext.Provider value={{ settings, handleChange }}>
      {children}
    </EmployeeSettingsContext.Provider>
  );
};

export default EmployeeSettingsProvider;
