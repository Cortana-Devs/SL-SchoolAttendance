
export default function Help() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Documentation</h1>
          <p className="text-lg text-gray-600">Everything you need to know about using the Smart Attendance System</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Getting Started */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
            <ul className="space-y-3 text-gray-600">
              <li>• Log in with your provided credentials</li>
              <li>• Navigate to the dashboard</li>
              <li>• Select your class and grade</li>
              <li>• Start marking attendance</li>
            </ul>
          </div>

          {/* Taking Attendance */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Taking Attendance</h2>
            <ul className="space-y-3 text-gray-600">
              <li>• Click "Mark Attendance" from dashboard</li>
              <li>• Select date and class</li>
              <li>• Mark students as present/absent</li>
              <li>• Add notes if needed</li>
              <li>• Save or submit attendance</li>
            </ul>
          </div>

          {/* Managing Students */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Managing Students</h2>
            <ul className="space-y-3 text-gray-600">
              <li>• Add new students</li>
              <li>• Edit student information</li>
              <li>• Search by name or index number</li>
              <li>• Filter by grade and class</li>
              <li>• View attendance history</li>
            </ul>
          </div>

          {/* Generating Reports */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generating Reports</h2>
            <ul className="space-y-3 text-gray-600">
              <li>• Access the reports section</li>
              <li>• Select date range</li>
              <li>• Choose report type</li>
              <li>• Filter by class/grade</li>
              <li>• Export as PDF or Excel</li>
            </ul>
          </div>

          {/* Troubleshooting */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Troubleshooting</h2>
            <ul className="space-y-3 text-gray-600">
              <li>• Check your internet connection</li>
              <li>• Clear browser cache</li>
              <li>• Verify login credentials</li>
              <li>• Contact system administrator</li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Support</h2>
            <div className="space-y-4 text-gray-600">
              <p>Need additional help? Contact our support team:</p>
              <p>Email: support@smartattendance.com</p>
              <p>Phone: +94 11 234 5678</p>
              <p>Hours: Mon-Fri, 8:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">How do I mark multiple students as present?</h3>
                <p className="text-gray-600">You can use the bulk action feature to mark multiple students as present or absent at once. Select the students using the checkboxes and choose the desired action from the toolbar.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">What happens if I lose internet connection?</h3>
                <p className="text-gray-600">The system automatically saves your work locally. Once the connection is restored, it will sync with the server automatically.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Can I edit attendance after submission?</h3>
                <p className="text-gray-600">Yes, teachers can edit attendance within 24 hours of submission. After that, only administrators can make changes.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">How do I generate monthly reports?</h3>
                <p className="text-gray-600">Navigate to the Reports section, select 'Monthly Report' from the dropdown, choose the desired month and year, then click 'Generate Report'.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 