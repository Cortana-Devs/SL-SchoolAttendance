import { ReactNode } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HomeIcon, ClipboardIcon, ChartBarIcon, UsersIcon } from '@heroicons/react/24/outline';

export default function Layout() {
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Mark Attendance', href: '/attendance', icon: ClipboardIcon },
    { name: 'Attendance Reports', href: '/reports', icon: ChartBarIcon },
    { name: 'Students', href: '/students', icon: UsersIcon },
  ];

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                  School Attendance System
                </span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-6">
                <Link to="/" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                  Dashboard
                </Link>
                {userRole === 'admin' ? (
                  <>
                    <Link to="/students" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                      Students
                    </Link>
                    <Link to="/students/add" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                      Add Student
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/attendance" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                      Mark Attendance
                    </Link>
                    <Link to="/students" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors">
                      View Students
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {currentUser && (
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-900">
                      {currentUser.displayName || currentUser.email}
                    </span>
                    <span className="text-xs text-gray-500">{currentUser.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        <div className="md:hidden border-t border-gray-200">
          <div className="space-y-1 px-4 py-3">
            <Link
              to="/dashboard"
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/attendance"
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              Attendance
            </Link>
            <Link
              to="/reports"
              className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              Reports
            </Link>
          </div>
          {currentUser && (
            <div className="border-t border-gray-200 px-4 py-4 space-y-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {currentUser.displayName || currentUser.email}
                </span>
                <span className="text-xs text-gray-500">{currentUser.email}</span>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                }}
                className="w-full flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} School Attendance System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 