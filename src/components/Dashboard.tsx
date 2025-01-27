import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { currentUser, userRole } = useAuth();

  // For teachers, show only the modern welcome page
  if (userRole === 'teacher') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Welcome to{' '}
              <span className="text-indigo-600">Smart Attendance</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline your attendance management with our modern, efficient system designed for Sri Lankan schools.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Tracking</h3>
              <p className="text-gray-600">
                Mark attendance quickly and efficiently with our intuitive interface.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Detailed Reports</h3>
              <p className="text-gray-600">
                Generate comprehensive attendance reports with just a few clicks.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Data</h3>
              <p className="text-gray-600">
                Your attendance data is safely stored and backed up automatically.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                to="/attendance"
                className="flex items-center justify-center px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors duration-200"
              >
                Mark Attendance
              </Link>
              <Link 
                to="/students"
                className="flex items-center justify-center px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors duration-200"
              >
                View Students
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h2 className="text-2xl font-semibold mb-2">Need Help?</h2>
                <p className="text-indigo-100">
                  Check out our documentation or contact support for assistance.
                </p>
              </div>
              <Link 
                to="/help"
                className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors duration-200"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For admin, show a simplified dashboard without unnecessary stats loading
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome, {currentUser?.email?.split('@')[0] || 'Administrator'}!
        </h2>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Administrative Actions</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/students/add"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Add Student
            </Link>
            <Link
              to="/students"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Manage Students
            </Link>
            <Link
              to="/reports"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 