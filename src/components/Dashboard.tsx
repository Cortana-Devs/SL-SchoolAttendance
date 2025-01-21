import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getStudents, getDraftAttendance, addSampleStudents, getCachedDailyStats, getCachedMonthlyStats } from '../utils/firebase';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { currentUser, userRole } = useAuth();
  const [totalStudents, setTotalStudents] = useState(0);
  const [todayAttendance, setTodayAttendance] = useState(0);
  const [monthlyAverage, setMonthlyAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendance: 0,
    monthlyAverage: 0
  });

  console.log('Dashboard - Current user:', currentUser?.email);
  console.log('Dashboard - User role:', userRole);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        console.log('Starting to load dashboard data...');

        // Get total students
        console.log('Calling getStudents()...');
        const students = await getStudents();
        console.log('getStudents() returned:', students);
        if (!students) {
          console.log('Warning: getStudents() returned null or undefined');
          setTotalStudents(0);
        } else {
          setTotalStudents(students.length);
          console.log('Total students count set to:', students.length);
        }

        // Calculate today's attendance
        const today = new Date().toISOString().split('T')[0];
        console.log('Today\'s date for attendance:', today);
        const classes = ['A', 'B', 'C', 'D'];
        let totalPresent = 0;
        let totalRecords = 0;

        // Get attendance for each class
        for (const classId of classes) {
          console.log(`Checking attendance for class ${classId}...`);
          try {
            const attendance = await getDraftAttendance(today, classId);
            console.log(`Class ${classId} attendance data:`, attendance);
            
            if (attendance && attendance.records) {
              const records = Object.values(attendance.records);
              console.log(`Found ${records.length} records for class ${classId}`);
              records.forEach(record => {
                totalRecords++;
                if (record.present) totalPresent++;
              });
            } else {
              console.log(`No attendance records for class ${classId}`);
            }
          } catch (error) {
            console.error(`Error getting attendance for class ${classId}:`, error);
          }
        }

        // Calculate today's attendance percentage
        console.log('Attendance totals:', { totalPresent, totalRecords });
        const todayPercentage = totalRecords > 0 
          ? Math.round((totalPresent / totalRecords) * 100) 
          : 0;
        console.log('Setting today\'s attendance to:', todayPercentage);
        setTodayAttendance(todayPercentage);

        // Calculate monthly average
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
          .toISOString().split('T')[0];
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
          .toISOString().split('T')[0];
        
        console.log('Calculating monthly average between:', { startOfMonth, endOfMonth });
        let monthlyPresent = 0;
        let monthlyTotal = 0;

        // Get attendance for each day of the month
        for (let d = new Date(startOfMonth); d <= new Date(endOfMonth); d.setDate(d.getDate() + 1)) {
          const date = d.toISOString().split('T')[0];
          console.log(`Checking attendance for date: ${date}`);
          
          for (const classId of classes) {
            try {
              const attendance = await getDraftAttendance(date, classId);
              if (attendance && attendance.records) {
                const records = Object.values(attendance.records);
                console.log(`Found ${records.length} records for ${date}, class ${classId}`);
                records.forEach(record => {
                  monthlyTotal++;
                  if (record.present) monthlyPresent++;
                });
              }
            } catch (error) {
              console.error(`Error getting attendance for ${date}, class ${classId}:`, error);
            }
          }
        }

        // Calculate monthly average percentage
        console.log('Monthly totals:', { monthlyPresent, monthlyTotal });
        const monthlyPercentage = monthlyTotal > 0 
          ? Math.round((monthlyPresent / monthlyTotal) * 100) 
          : 0;
        console.log('Setting monthly average to:', monthlyPercentage);
        setMonthlyAverage(monthlyPercentage);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setMessage({ type: 'error', text: 'Failed to load dashboard data' });
      } finally {
        setLoading(false);
        console.log('Dashboard data loading completed');
      }
    }

    console.log('Dashboard useEffect triggered - calling loadDashboardData()');
    loadDashboardData();
  }, []);

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        setLoading(true);
        setError('');

        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        // Fetch stats in parallel
        const [dailyStats, monthlyStats] = await Promise.all([
          getCachedDailyStats(today),
          getCachedMonthlyStats(currentYear, currentMonth)
        ]);

        setStats({
          totalStudents: dailyStats.totalStudents,
          todayAttendance: dailyStats.attendanceRate,
          monthlyAverage: monthlyStats.averageAttendance
        });
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardStats();
  }, []);

  const handleAddSampleData = async () => {
    try {
      setLoading(true);
      setMessage(null);
      const success = await addSampleStudents();
      if (success) {
        setMessage({ type: 'success', text: 'Sample students added successfully!' });
        // Refresh the total students count
        const students = await getStudents();
        setTotalStudents(students.length);
      } else {
        setMessage({ type: 'error', text: 'Failed to add sample students.' });
      }
    } catch (error) {
      console.error('Error adding sample data:', error);
      setMessage({ type: 'error', text: 'Failed to add sample students.' });
    } finally {
      setLoading(false);
    }
  };

  if (userRole === 'teacher') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {currentUser?.email?.split('@')[0] || 'Teacher'}!
          </h2>
          <div className="space-y-4">
            <p className="text-gray-600">
              You can mark attendance and view student lists.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/attendance"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Mark Attendance
              </Link>
              <Link
                to="/students"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View Students
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Students Present</span>
                  <span className="text-lg font-medium text-indigo-600">{todayAttendance}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Students</span>
                  <span className="text-lg font-medium text-indigo-600">{totalStudents}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Attendance</span>
                  <span className="text-lg font-medium text-purple-600">{monthlyAverage}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome, {currentUser?.email?.split('@')[0] || 'Administrator'}!
        </h2>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {message && (
          <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-800">Total Students</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {loading ? '...' : stats.totalStudents}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-800">Today's Attendance</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {loading ? '...' : `${stats.todayAttendance}%`}
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-purple-800">Monthly Average</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {loading ? '...' : `${stats.monthlyAverage}%`}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Administrative Actions</h3>
        <div className="space-x-4">
          <Link
            to="/students/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Add Student
          </Link>
          <Link
            to="/students"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Manage Students
          </Link>
          <button
            onClick={handleAddSampleData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : 'Add Sample Data'}
          </button>
        </div>
      </div>
    </div>
  );
} 