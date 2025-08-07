import React, { useContext, useState, useRef, useEffect } from "react";
import { LeaveRequestContext } from "../context/LeaveRequestContext";
import { EmployeeContext } from "../context/EmployeeContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const COLORS = {
  Approved: "#4ade80",
  Rejected: "#f87171",
  Pending: "#facc15",
};

const AdminLeaveSummary = () => {
  const {
    leaveRequests,
    getMonthString,
    getMonthlyLeaveSummaryForAll,
    allMonths,
  } = useContext(LeaveRequestContext);
  const { employees } = useContext(EmployeeContext);
  const [filter, setFilter] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [loading, setLoading] = useState(false);
  const [isPdfMode, setIsPdfMode] = useState(false);
  const componentRef = useRef(null);
  const chartContainerRef = useRef(null);
  const canvasRef = useRef(null);

  // Get leave summary for selected month
  const monthStr = selectedMonth === "All" ? null : selectedMonth;
  const leaveSummary = monthStr ? getMonthlyLeaveSummaryForAll(monthStr) : {
    total: leaveRequests.length,
    statusCounts: leaveRequests.reduce((acc, curr) => {
      const status = curr?.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { Approved: 0, Rejected: 0, Pending: 0 }),
    requests: leaveRequests,
  };

  // Filter by status and separate active/inactive employees
  const allFilteredRequests = (leaveSummary.requests || []).filter((req) => {
    return filter === "All" ? true : req.status === filter;
  });

  // Separate active and inactive employee requests
  const separatedRequests = allFilteredRequests.reduce((acc, req) => {
    const employee = employees.find(emp => emp.employeeId === req.employeeId);
    const isActive = employee?.isActive !== false;
    
    if (isActive) {
      acc.active.push(req);
    } else {
      acc.inactive.push(req);
    }
    return acc;
  }, { active: [], inactive: [] });

  // Combine for display: active first, then inactive
  const filteredRequests = [...separatedRequests.active, ...separatedRequests.inactive];

  // Status counts for filtered data
  const statusCounts = filteredRequests.reduce(
    (acc, curr) => {
      const status = curr?.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    { Approved: 0, Rejected: 0, Pending: 0 }
  );

  // Chart data for filtered data
  const chartData = Object.entries(statusCounts)
    .filter(([, value]) => value > 0)
    .map(([status, value]) => ({ name: status, value }));

  // ...existing code for rendering, export, etc...
  // Export CSV
  const exportCSV = () => {
    const headers = ["ID", "Employee ID", "Name", "From", "To", "Status"];
    const rows = filteredRequests.map((req) => [
      req.id,
      req.employeeId || "EMP-XXX",
      req.name,
      req.from,
      req.to,
      req.status,
    ]);
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "leave_summary.csv");
  };

  // Simple PDF export (without chart)
  const exportSimplePDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text('Leave Summary Report', pdfWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      pdf.setFontSize(14);
      pdf.setFont(undefined, 'normal');
      const currentDate = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${currentDate}`, pdfWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      pdf.text(`Filter Applied: ${filter}`, pdfWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('Summary Statistics', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(14);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Total Requests: ${filteredRequests.length || 0}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Approved: ${statusCounts?.Approved || 0}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Rejected: ${statusCounts?.Rejected || 0}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Pending: ${statusCounts?.Pending || 0}`, 20, yPosition);
      yPosition += 20;

      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Leave Requests (${filter})`, 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(10);
      const headers = ['ID', 'Employee ID', 'Name', 'From', 'To', 'Status'];
      const colWidths = [15, 25, 40, 25, 25, 20];
      let xPosition = 20;

      pdf.setFont(undefined, 'bold');
      headers.forEach((header, index) => {
        pdf.text(header, xPosition, yPosition);
        xPosition += colWidths[index];
      });
      yPosition += 10;

      pdf.setFont(undefined, 'normal');
      filteredRequests.forEach((req) => {
        if (yPosition > 260) {
          pdf.addPage();
          yPosition = 20;
        }
        xPosition = 20;
        const rowData = [
          req.id.toString(),
          req.employeeId || 'EMP-XXX',
          req.name,
          req.from,
          req.to,
          req.status
        ];
        rowData.forEach((data, index) => {
          pdf.text(data, xPosition, yPosition);
          xPosition += colWidths[index];
        });
        yPosition += 8;
      });

      pdf.save(`leave_summary_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch {
      alert('PDF export failed. Please try again.');
    }
  };

  // Advanced PDF export with chart
  const exportPDF = async () => {
    setLoading(true);
    setIsPdfMode(true);
    try {
      // Wait for chart to render in PDF mode (canvas)
      await new Promise(resolve => setTimeout(resolve, 1200));
      const chartSection = chartContainerRef.current;
      if (!chartSection) throw new Error('Chart section not found');
      // Use html2canvas to capture only the chart container (canvas chart)
      let capturedCanvas;
      try {
        capturedCanvas = await html2canvas(chartSection, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: '#fff',
          logging: false,
          letterRendering: true,
        });
      } catch {
        setLoading(false);
        setIsPdfMode(false);
        return exportSimplePDF();
      }
      if (!capturedCanvas || capturedCanvas.width === 0 || capturedCanvas.height === 0) {
        setLoading(false);
        setIsPdfMode(false);
        return exportSimplePDF();
      }
      const imgData = capturedCanvas.toDataURL('image/png', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (capturedCanvas.height * imgWidth) / capturedCanvas.width;
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('Leave Summary Report', pdfWidth / 2, 15, { align: 'center' });
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      pdf.text(`Generated on: ${currentDate}`, pdfWidth / 2, 25, { align: 'center' });
      pdf.text(`Filter Applied: ${filter}`, pdfWidth / 2, 30, { align: 'center' });
      pdf.setFontSize(9);
      pdf.text(`Total: ${filteredRequests.length || 0} | Approved: ${statusCounts?.Approved || 0} | Rejected: ${statusCounts?.Rejected || 0} | Pending: ${statusCounts?.Pending || 0}`, pdfWidth / 2, 35, { align: 'center' });
      // Add the captured chart image
      const startY = 45;
      pdf.addImage(imgData, 'PNG', 10, startY, imgWidth, Math.min(imgHeight, pdfHeight - 60));
      pdf.save(`leave_summary_with_chart_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch {
      alert('PDF export failed. Please try again.');
    } finally {
      setLoading(false);
      setIsPdfMode(false);
    }
  };

  // ...existing code for rendering, export, etc...

  // Draw canvas chart when in PDF mode - Enhanced size for PDF export
  useEffect(() => {
    if (isPdfMode && canvasRef.current && chartData.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const centerX = 300;  // Increased for larger canvas
      const centerY = 200;  // Increased for larger canvas
      const radius = 120;   // Increased radius for bigger chart
      
      // Clear canvas - larger size for PDF
      ctx.clearRect(0, 0, 600, 450);
      
      // Draw pie chart
      let currentAngle = -Math.PI / 2; // Start from top
      const total = chartData.reduce((sum, item) => sum + item.value, 0);
      
      chartData.forEach((item) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = COLORS[item.name] || '#ccc';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;  // Thicker stroke for PDF
        ctx.stroke();
        // Draw label - Larger fonts for PDF
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 18px Arial';  // Larger font for names
        ctx.textAlign = 'center';
        ctx.fillText(`${item.name}`, labelX, labelY - 8);
        ctx.font = 'bold 16px Arial';  // Larger font for percentages
        ctx.fillText(`${item.value} (${((item.value / total) * 100).toFixed(0)}%)`, labelX, labelY + 12);
        currentAngle += sliceAngle;
      });
      // Draw legend - Larger for PDF
      let legendY = 340;
      chartData.forEach((item) => {
        // Color box - larger
        ctx.fillStyle = COLORS[item.name] || '#ccc';
        ctx.fillRect(120, legendY - 15, 25, 25);  // Bigger color boxes
        // Text - larger font
        ctx.fillStyle = '#000';
        ctx.font = 'bold 20px Arial';  // Much larger legend text
        ctx.textAlign = 'left';
        ctx.fillText(`${item.name}: ${item.value}`, 160, legendY + 5);
        legendY += 35;  // More spacing between legend items
      });
    }
  }, [isPdfMode, chartData]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Leave Summary</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        {/* Status filter */}
        <div className="flex gap-2">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded transition-all duration-150 shadow-sm font-medium ${
                filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        {/* Month filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="monthFilter" className="font-medium text-gray-700">Month:</label>
          <select
            id="monthFilter"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 rounded border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All</option>
            {(Array.isArray(allMonths) ? allMonths : []).map(month => {
              const [year] = month.split('-');
              const monthName = new Date(`${month}-01`).toLocaleString('default', { month: 'long' });
              return (
                <option key={month} value={month}>{monthName} {year}</option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Chart + Table */}
      <div ref={componentRef} className="bg-white p-6 rounded-xl shadow-lg">
        {/* Summary Statistics */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 text-center">Leave Summary Statistics</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-white p-5 rounded shadow min-h-[100px] flex flex-col justify-center items-center">
              <div className="text-4xl font-bold text-blue-600 leading-none mb-3 w-full text-center" style={{ lineHeight: '1' }}>
                {filteredRequests.length}
              </div>
              <div className="text-sm text-gray-600 leading-tight">Total Requests</div>
            </div>
            <div className="bg-white p-5 rounded shadow min-h-[100px] flex flex-col justify-center items-center">
              <div className="text-4xl font-bold text-green-600 leading-none mb-3 w-full text-center" style={{ lineHeight: '1' }}>
                {statusCounts.Approved || 0}
              </div>
              <div className="text-sm text-gray-600 leading-tight">Approved</div>
            </div>
            <div className="bg-white p-5 rounded shadow min-h-[100px] flex flex-col justify-center items-center">
              <div className="text-4xl font-bold text-red-600 leading-none mb-3 w-full text-center" style={{ lineHeight: '1' }}>
                {statusCounts.Rejected || 0}
              </div>
              <div className="text-sm text-gray-600 leading-tight">Rejected</div>
            </div>
            <div className="bg-white p-5 rounded shadow min-h-[100px] flex flex-col justify-center items-center">
              <div className="text-4xl font-bold text-yellow-600 leading-none mb-3 w-full text-center" style={{ lineHeight: '1' }}>
                {statusCounts.Pending || 0}
              </div>
              <div className="text-sm text-gray-600 leading-tight">Pending</div>
            </div>
          </div>
        </div>

      {/* Chart */}
      <div ref={chartContainerRef} className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-center">Leave Status Distribution</h3>
        {Array.isArray(chartData) && chartData.length > 0 ? (
          isPdfMode ? (
            // Canvas-based pie chart for PDF - Larger size for PDF export
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
              <canvas 
                ref={canvasRef}
                width={600} 
                height={450}
                style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={Array.isArray(chartData) ? chartData : []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={0}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {(Array.isArray(chartData) ? chartData : []).map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name] || "#ccc"} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} requests`, name]} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value, entry) => `${value}: ${entry.payload.value}`}
                />
              </PieChart>
            </ResponsiveContainer>
          )
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No leave requests data available</p>
          </div>
        )}
      </div>

        {/* Table (hide during PDF export) */}
        {!isPdfMode && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Leave Requests ({filter}{selectedMonth !== 'All' ? `, ${(() => {const [year] = selectedMonth.split('-');return `${new Date(`${selectedMonth}-01`).toLocaleString('default', { month: 'long' })} ${year}`;})()}` : ''})</h3>
            <table className="min-w-full text-sm bg-white rounded shadow">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left border">ID</th>
                  <th className="p-3 text-left border">Employee ID</th>
                  <th className="p-3 text-left border">Name</th>
                  <th className="p-3 text-left border">From</th>
                  <th className="p-3 text-left border">To</th>
                  <th className="p-3 text-left border">Status</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(filteredRequests) ? filteredRequests : []).map((req) => {
                  const employee = employees.find(emp => emp.employeeId === req.employeeId);
                  const isInactive = employee?.isActive === false;
                  
                  return (
                    <tr
                      key={req.id}
                      className={`border-t transition-all duration-100 ${
                        isInactive
                          ? "bg-gray-300 text-gray-600 opacity-75"
                          : "hover:bg-blue-50"
                      }`}
                    >
                      <td className="p-3 border">{req.id}</td>
                      <td className="p-3 border">{req.employeeId || 'EMP-XXX'}</td>
                      <td className="p-3 border">
                        {req.name}
                        {isInactive && (
                          <span className="ml-2 px-2 py-1 bg-red-200 text-red-800 text-xs rounded font-semibold">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-3 border">{req.from}</td>
                      <td className="p-3 border">{req.to}</td>
                      <td className="p-3 border">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export buttons */}
      <div className="flex justify-end mt-4 gap-4">
        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow-md font-semibold"
        >
          Export CSV
        </button>
        <button
          onClick={exportSimplePDF}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 shadow-md font-semibold"
        >
          Export PDF (Simple)
        </button>
        <button
          onClick={exportPDF}
          disabled={loading}
          className={`px-4 py-2 rounded text-white font-semibold shadow-md ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Generating PDF..." : "Export PDF (with Chart)"}
        </button>
      </div>
    </div>
  );
};

export default AdminLeaveSummary;