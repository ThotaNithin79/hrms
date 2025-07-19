import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Group attendance data by date
const groupByDate = (records = []) => {
  const grouped = {};

  records.forEach((record) => {
    const date = record.date;
    const status = record.status;

    if (!grouped[date]) {
      grouped[date] = { date, Present: 0, Absent: 0, Leave: 0 };
    }

    if (status === "Present" || status === "Absent" || status === "Leave") {
      grouped[date][status]++;
    }
  });

  return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
};

const CurrentAttendanceChart = ({ data = [] }) => {
  const chartData = groupByDate(data);

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Present" fill="#4ade80" />
          <Bar dataKey="Absent" fill="#f87171" />
          <Bar dataKey="Leave" fill="#facc15" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CurrentAttendanceChart;
