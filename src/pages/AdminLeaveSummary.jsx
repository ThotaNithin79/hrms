import React, { useContext, useState, useRef, useEffect } from "react";
import { LeaveRequestContext } from "../context/LeaveRequestContext";
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
  const { leaveRequests } = useContext(LeaveRequestContext);
  const [filter, setFilter] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [loading, setLoading] = useState(false);
  const [isPdfMode, setIsPdfMode] = useState(false);
  const componentRef = useRef(null);
  const canvasRef = useRef(null);

  // Helper: get month string from date
  const getMonthString = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  // Get all months present in leaveRequests
  const allMonths = Array.from(
    new Set(
      (leaveRequests || [])
        .map((req) => getMonthString(req.from))
        .filter((m) => m)
    )
  );

  // Filter by status and month
  const filteredRequests = (leaveRequests || []).filter((req) => {
    const statusMatch = filter === "All" ? true : req.status === filter;
    const monthMatch = selectedMonth === "All" ? true : getMonthString(req.from) === selectedMonth;
    return statusMatch && monthMatch;
  });

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

  // Debug logging
  console.log('Leave Summary - Total:', leaveRequests?.length, 'Approved:', statusCounts?.Approved, 'Rejected:', statusCounts?.Rejected, 'Pending:', statusCounts?.Pending);

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

  // Simple PDF export (without chart) - Enhanced text sizes for PDF
  const exportSimplePDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      // Title - Larger for PDF
      pdf.setFontSize(24);  // Increased from 18
      pdf.setFont(undefined, 'bold');
      pdf.text('Leave Summary Report', pdfWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Date and filter info - Larger for PDF
      pdf.setFontSize(14);  // Increased from 10
      pdf.setFont(undefined, 'normal');
      const currentDate = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${currentDate}`, pdfWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      pdf.text(`Filter Applied: ${filter}`, pdfWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Summary Statistics - Larger for PDF
      pdf.setFontSize(18);  // Increased from 14
      pdf.setFont(undefined, 'bold');
      pdf.text('Summary Statistics', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(14);  // Increased from 10
      pdf.setFont(undefined, 'normal');
      pdf.text(`Total Requests: ${leaveRequests?.length || 0}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Approved: ${statusCounts?.Approved || 0}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Rejected: ${statusCounts?.Rejected || 0}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Pending: ${statusCounts?.Pending || 0}`, 20, yPosition);
      yPosition += 20;

      // Table Header - Larger for PDF
      pdf.setFontSize(18);  // Increased from 14
      pdf.setFont(undefined, 'bold');
      pdf.text(`Leave Requests (${filter})`, 20, yPosition);
      yPosition += 15;

      // Table data - Larger for PDF
      pdf.setFontSize(10);  // Increased from 8
      const headers = ['ID', 'Employee ID', 'Name', 'From', 'To', 'Status'];
      const colWidths = [15, 25, 40, 25, 25, 20];
      let xPosition = 20;

      // Draw headers
      pdf.setFont(undefined, 'bold');
      headers.forEach((header, index) => {
        pdf.text(header, xPosition, yPosition);
        xPosition += colWidths[index];
      });
      yPosition += 10;  // Increased spacing

      // Draw data rows
      pdf.setFont(undefined, 'normal');
      filteredRequests.forEach((req) => {
        if (yPosition > 260) { // Adjusted for larger text
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
        yPosition += 8;  // Increased row spacing
      });

      pdf.save(`leave_summary_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Simple PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    }
  };

  // Advanced PDF export with chart - Now with better error handling for color issues
  const exportPDF = async () => {
    setLoading(true);
    setIsPdfMode(true);

    try {
      // Wait for the chart to render in static mode
      console.log('Setting PDF mode and waiting for canvas render...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const element = componentRef.current;
      if (!element) {
        throw new Error('Component reference not found');
      }
      
      // Check if canvas is ready
      const canvas = canvasRef.current;
      if (!canvas) {
        console.log('Canvas not found, falling back to simple PDF...');
        setLoading(false);
        setIsPdfMode(false);
        return exportSimplePDF();
      }
      
      console.log('Starting PDF generation with canvas...');
      
      // Try the enhanced capture with better error handling
      let capturedCanvas;
      try {
        capturedCanvas = await html2canvas(element, {
          scale: 1.2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          letterRendering: true,
          width: element.scrollWidth,
          height: element.scrollHeight,
          onclone: (clonedDoc) => {
            console.log('Cloning document for capture...');
            
            // Ensure canvas is visible
            const canvases = clonedDoc.querySelectorAll('canvas');
            canvases.forEach(canvas => {
              canvas.style.display = 'block';
              canvas.style.visibility = 'visible';
              canvas.style.opacity = '1';
            });
            
            // Add safe color overrides to prevent oklch issues
            const style = clonedDoc.createElement('style');
            style.textContent = `
              * { 
                color: inherit !important; 
                background-color: inherit !important; 
              }
              .bg-white { background-color: #ffffff !important; }
              .bg-gray-50 { background-color: #f9fafb !important; }
              .bg-gray-100 { background-color: #f3f4f6 !important; }
              .text-blue-600 { color: #2563eb !important; }
              .text-green-600 { color: #16a34a !important; }
              .text-red-600 { color: #dc2626 !important; }
              .text-yellow-600 { color: #ca8a04 !important; }
              .text-gray-600 { color: #4b5563 !important; }
              .border { border-color: #e5e7eb !important; }
            `;
            clonedDoc.head.appendChild(style);
          }
        });
      } catch (canvasError) {
        console.error('html2canvas failed, falling back to simple PDF:', canvasError);
        setLoading(false);
        setIsPdfMode(false);
        return exportSimplePDF();
      }

      console.log('Canvas captured successfully, dimensions:', capturedCanvas.width, 'x', capturedCanvas.height);
      
      if (!capturedCanvas || capturedCanvas.width === 0 || capturedCanvas.height === 0) {
        console.log('Invalid canvas, falling back to simple PDF');
        setLoading(false);
        setIsPdfMode(false);
        return exportSimplePDF();
      }

      const imgData = capturedCanvas.toDataURL('image/png', 0.9);
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions to fit PDF
      const imgWidth = pdfWidth - 20;
      const imgHeight = (capturedCanvas.height * imgWidth) / capturedCanvas.width;
      
      // Add title
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('Leave Summary Report', pdfWidth / 2, 15, { align: 'center' });
      
      // Add current date
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Generated on: ${currentDate}`, pdfWidth / 2, 25, { align: 'center' });
      
      // Add filter information
      pdf.text(`Filter Applied: ${filter}`, pdfWidth / 2, 30, { align: 'center' });
      
      // Add summary stats
      pdf.setFontSize(9);
      pdf.text(`Total: ${leaveRequests?.length || 0} | Approved: ${statusCounts?.Approved || 0} | Rejected: ${statusCounts?.Rejected || 0} | Pending: ${statusCounts?.Pending || 0}`, pdfWidth / 2, 35, { align: 'center' });
      
      // Add the captured image
      const startY = 45;
      pdf.addImage(imgData, 'PNG', 10, startY, imgWidth, Math.min(imgHeight, pdfHeight - 60));
      
      // Save the PDF
      pdf.save(`leave_summary_with_chart_${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('PDF saved successfully');
      
    } catch (error) {
      console.error('PDF export failed:', error);
      
      // Provide user-friendly error message
      let errorMessage = 'Failed to generate PDF with chart.\n\n';
      if (error.message.includes('oklch') || error.message.includes('color')) {
        errorMessage += 'Color parsing issue detected. This is due to modern CSS color formats.\n';
      } else if (error.message.includes('Canvas')) {
        errorMessage += 'Canvas rendering issue detected.\n';
      } else {
        errorMessage += `Error: ${error.message}\n`;
      }
      errorMessage += '\nTrying "Export PDF (Simple)" instead, which should work reliably.';
      
      alert(errorMessage);
      
      // Auto-fallback to simple PDF
      setTimeout(() => {
        exportSimplePDF();
      }, 1000);
      
    } finally {
      setLoading(false);
      setIsPdfMode(false);
    }
  };

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
            {allMonths.map(month => {
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
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Leave Status Distribution</h3>
          {chartData.length > 0 ? (
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
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={0}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {chartData.map((entry) => (
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

        {/* Table */}
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
              {filteredRequests.map((req) => (
                <tr key={req.id} className="border-t hover:bg-blue-50 transition-all duration-100">
                  <td className="p-3 border">{req.id}</td>
                  <td className="p-3 border">{req.employeeId || 'EMP-XXX'}</td>
                  <td className="p-3 border">{req.name}</td>
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
              ))}
            </tbody>
          </table>
        </div>
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