import { useState } from 'react';
import { getAttendanceStats } from '../utils/firebase';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { AttendancePDF } from './AttendancePDF';

interface Stats {
  byDate: {
    [key: string]: {
      present: number;
      absent: number;
      late?: number;
      excused?: number;
    };
  };
  totalDays: number;
  averageAttendance: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate?: number;
  totalExcused?: number;
  students?: any[];
  attendance?: any[];
}

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
  const [stats, setStats] = useState<Stats | null>(null);

  // Updated grade structure for Sri Lankan schools
  const sections = {
    'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
    'Middle': ['Grade 6', 'Grade 7', 'Grade 8'],
    'Upper': ['Grade 9', 'Grade 10', 'Grade 11'],
    'Advanced': ['Grade 12', 'Grade 13']
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

    const dailyData = Object.entries(stats.byDate).map(([date, data]: [string, any]) => ({
      Date: date,
      'Total Present': data.present,
      'Total Absent': data.absent,
      'Late Arrivals': data.late,
      'Excused Absences': data.excused,
      'Attendance Rate': `${Math.round((data.present / (data.present + data.absent)) * 100)}%`
    }));

    const summaryData = [{
      'Total Days': stats.totalDays,
      'Average Attendance Rate': `${stats.averageAttendance}%`,
      'Total Present': stats.totalPresent,
      'Total Absent': stats.totalAbsent,
      'Total Late': stats.totalLate,
      'Total Excused': stats.totalExcused
    }];

    const wb = XLSX.utils.book_new();
    const dailyWs = XLSX.utils.json_to_sheet(dailyData);
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    
    XLSX.utils.book_append_sheet(wb, dailyWs, 'Daily Attendance');
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const filename = `attendance_report_${dateRange.startDate}_to_${dateRange.endDate}${selectedGrade ? `_${selectedGrade}` : ''}${selectedClass ? `_Class${selectedClass}` : ''}.xlsx`;
    saveAs(data, filename);
  };

  const exportToPDF = () => {
    if (!stats) return null;
    
    // Create proper student data format from stats
    const formattedStudents = Object.entries(stats.byDate).map(([date]) => ({
      id: date,
      name: date,
      registrationNumber: '-',
      class: selectedClass || 'All',
      grade: selectedGrade || 'All',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));

    // Create proper attendance format
    const formattedAttendance = Object.entries(stats.byDate).map(([date, data]) => ({
      studentId: date,
      present: data.present > 0,
      isLateArrival: Boolean(data.late),
      isExcused: Boolean(data.excused),
      note: `Present: ${data.present}, Absent: ${data.absent}${data.late ? `, Late: ${data.late}` : ''}${data.excused ? `, Excused: ${data.excused}` : ''}`
    }));

    return (
      <PDFDownloadLink
        document={
          <AttendancePDF
            date={dateRange.startDate}
            grade={selectedGrade || 'All Grades'}
            class={selectedClass || 'All Classes'}
            students={formattedStudents}
            attendance={formattedAttendance}
          />
        }
        fileName={`attendance_report_${dateRange.startDate}_to_${dateRange.endDate}${selectedGrade ? `_${selectedGrade}` : ''}${selectedClass ? `_Class${selectedClass}` : ''}.pdf`}
        className="w-full sm:w-auto min-w-[200px] px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Download PDF
      </PDFDownloadLink>
    );
  };

  return (
    <div className="space-y-6 p-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Attendance Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

        <div className="flex flex-col items-center gap-4 mt-8">
          <button
            onClick={generateReport}
            disabled={loading}
            className="w-full sm:w-auto min-w-[200px] px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <button
              onClick={exportToExcel}
              disabled={!stats || loading}
              className="w-full sm:w-auto min-w-[200px] px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export to Excel
            </button>
            
            {stats ? (
              <div className="w-full sm:w-auto min-w-[200px]">
                {exportToPDF()}
              </div>
            ) : (
              <button
                disabled
                className="w-full sm:w-auto min-w-[200px] px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white opacity-50 cursor-not-allowed"
              >
                Export to PDF
              </button>
            )}
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">Report Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Overall Attendance Rate</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.averageAttendance}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.averageAttendance >= 90 ? 'Excellent' : 
                 stats.averageAttendance >= 80 ? 'Good' :
                 stats.averageAttendance >= 70 ? 'Fair' : 'Needs Attention'}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Student Participation</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalPresent} / {stats.totalPresent + stats.totalAbsent}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Students Present vs Total
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Attendance Trend</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.totalDays} Days
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Period Analyzed
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-900 mb-2">Daily Analysis</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present/Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(stats.byDate).map(([date, data]) => {
                    const rate = Math.round((data.present / (data.present + data.absent)) * 100);
                    return (
                      <tr key={date}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  rate >= 90 ? 'bg-green-600' :
                                  rate >= 80 ? 'bg-yellow-500' :
                                  'bg-red-600'
                                }`}
                                style={{ width: `${rate}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-900">{rate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {data.present}/{data.present + data.absent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            rate >= 90 ? 'bg-green-100 text-green-800' :
                            rate >= 80 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {rate >= 90 ? 'Excellent' :
                             rate >= 80 ? 'Good' :
                             'Needs Attention'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 