import { useState } from 'react';
import { getAttendanceStats } from '../utils/firebase';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export default function AttendanceReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'custom'>('daily');
  const [stats, setStats] = useState<any>(null);

  // Updated grade structure for Sri Lankan schools
  const sections = {
    'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
    'Middle': ['Grade 6', 'Grade 7', 'Grade 8'],
    'Upper': ['Grade 9', 'Grade 10', 'Grade 11']
  };

  const classes = ['A', 'B', 'C', 'D'];

  const handleDateRangeChange = (type: 'daily' | 'monthly' | 'custom') => {
    setReportType(type);
    const today = new Date();
    let startDate = today.toISOString().split('T')[0];
    let endDate = today.toISOString().split('T')[0];

    if (type === 'monthly') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    }

    setDateRange({ startDate, endDate });
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError('');
      const attendanceData = await getAttendanceStats(
        dateRange.startDate,
        dateRange.endDate,
        selectedGrade,
        selectedClass
      );
      setStats(attendanceData);
    } catch (err) {
      setError('Failed to generate report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!stats) return;

    // Prepare data for export
    const dailyData = Object.entries(stats.byDate).map(([date, data]: [string, any]) => ({
      Date: date,
      'Total Present': data.present,
      'Total Absent': data.absent,
      'Late Arrivals': data.late,
      'Excused Absences': data.excused,
      'Attendance Rate': `${Math.round((data.present / (data.present + data.absent)) * 100)}%`
    }));

    // Summary data
    const summaryData = [{
      'Total Days': stats.totalDays,
      'Average Attendance Rate': `${stats.averageAttendance}%`,
      'Total Present': stats.totalPresent,
      'Total Absent': stats.totalAbsent,
      'Total Late': stats.totalLate,
      'Total Excused': stats.totalExcused
    }];

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Add daily data sheet
    const dailyWs = XLSX.utils.json_to_sheet(dailyData);
    XLSX.utils.book_append_sheet(wb, dailyWs, 'Daily Attendance');
    
    // Add summary sheet
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Generate filename based on selected filters
    const filename = `attendance_report_${dateRange.startDate}_to_${dateRange.endDate}${selectedGrade ? `_${selectedGrade}` : ''}${selectedClass ? `_Class${selectedClass}` : ''}.xlsx`;
    
    saveAs(data, filename);
  };

  const exportToPDF = () => {
    // Implement PDF export logic here
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Attendance Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => handleDateRangeChange(e.target.value as 'daily' | 'monthly' | 'custom')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="daily">Daily Report</option>
              <option value="monthly">Monthly Report</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade (Optional)</label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Grades</option>
              {Object.values(sections).flat().map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class (Optional)</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={generateReport}
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>

          <div className="space-x-2">
            <button
              onClick={exportToExcel}
              disabled={!stats}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Export to Excel
            </button>
            <button
              onClick={exportToPDF}
              disabled={!stats}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Export to PDF
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {stats && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Report Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Average Attendance Rate</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.averageAttendance}%</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalPresent}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.totalAbsent}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Late Arrivals</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.totalLate}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Excused Absences</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalExcused}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Total Days</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalDays}</p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-2">Daily Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Excused</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(stats.byDate).map(([date, data]: [string, any]) => (
                    <tr key={date}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.present}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.absent}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.late}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.excused}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Math.round((data.present / (data.present + data.absent)) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 