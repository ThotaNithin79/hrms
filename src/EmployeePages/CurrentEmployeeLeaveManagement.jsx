import React from "react";

const CurrentEmployeeLeave = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Go Back Button */}
      <button className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm">
        ← Go Back
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-xl font-semibold text-blue-600">
            J
          </div>
          <div>
            <h2 className="text-2xl font-semibold">John Doe</h2>
            <p className="text-gray-500 text-sm">ID: EMP101</p>
          </div>
        </div>

        {/* Leave Balance Summary */}
        <div className="mt-4 md:mt-0 text-sm space-y-1">
          <div>Total Leaves: <span className="font-semibold text-blue-600">24</span></div>
          <div>Used: <span className="font-semibold text-yellow-600">6</span></div>
          <div>Remaining: <span className="font-semibold text-green-600">18</span></div>
        </div>
      </div>

      {/* Apply for Leave Button */}
      <div className="mb-6">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">
          + Apply for Leave
        </button>
      </div>

      {/* Leave Request Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <div className="text-green-600 font-semibold">Approved</div>
          <div className="text-2xl font-bold">5</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <div className="text-yellow-600 font-semibold">Pending</div>
          <div className="text-2xl font-bold">1</div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <div className="text-red-600 font-semibold">Rejected</div>
          <div className="text-2xl font-bold">0</div>
        </div>
      </div>

      {/* Leave History Table */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">Leave History</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">Reason</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">From</th>
                <th className="px-4 py-2 border">To</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2 border">2025-07-22</td>
                <td className="px-4 py-2 border">Casual Leave</td>
                <td className="px-4 py-2 border">Fever</td>
                <td className="px-4 py-2 border text-green-600 font-semibold">Approved</td>
                <td className="px-4 py-2 border">2025-07-22</td>
                <td className="px-4 py-2 border">2025-07-23</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border">2025-07-14</td>
                <td className="px-4 py-2 border">Sick Leave</td>
                <td className="px-4 py-2 border">Cold and Cough</td>
                <td className="px-4 py-2 border text-yellow-600 font-semibold">Pending</td>
                <td className="px-4 py-2 border">2025-07-14</td>
                <td className="px-4 py-2 border">2025-07-14</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CurrentEmployeeLeave;
