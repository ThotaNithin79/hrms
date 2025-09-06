import React, { useContext, useState } from "react";
import { EmployeeSettingsContext } from "../EmployeeContext/EmployeeSettingsContext";

const EmployeeSetting = () => {
  const { settings, handleChange } = useContext(EmployeeSettingsContext);
  const [activeTab, setActiveTab] = useState("notification");

  // Reusable Switch Component
  const Switch = ({ name, checked }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        name={name}
        checked={checked}
        onChange={(e) => handleChange(name, e.target.checked)}
      />
      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-300"></div>
      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md peer-checked:translate-x-5 transform transition duration-300"></div>
    </label>
  );

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      {/* Tabs */}
      <div className="flex justify-center space-x-3 mb-6">
        <button
          onClick={() => setActiveTab("notification")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === "notification"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <span>🔔</span> Notification
        </button>

        <button
          onClick={() => setActiveTab("sound")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            activeTab === "sound"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          <span>🔊</span> Sound
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === "notification" && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              🔔 Notifications
            </h3>
            <div className="space-y-4">
              {[
                { label: "Enable Notifications", key: "notifications" },
                { label: "Email Notifications", key: "emailNotifications" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between"
                >
                  <label className="text-gray-700">{item.label}</label>
                  <Switch
                    name={item.key}
                    checked={settings[item.key]}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "sound" && (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              🔊 Sound Settings
            </h3>
            <div className="space-y-4">
              {[
                { label: "Notification Sounds", key: "notifSound" },
                { label: "Punch In Sound", key: "punchInSound" },
                { label: "Punch Out Sound", key: "punchOutSound" },
                { label: "Request Button Sound", key: "requestButtonSound" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between"
                >
                  <label className="text-gray-700">{item.label}</label>
                  <Switch
                    name={item.key}
                    checked={settings[item.key]}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeSetting;
