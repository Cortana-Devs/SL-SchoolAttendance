# Sri Lankan School Attendance Management System

A modern web application built with React, TypeScript, and Firebase for managing student attendance in Sri Lankan schools. This system provides an efficient way for teachers and administrators to track, manage, and analyze student attendance data.

## Features

- 🔐 Secure authentication for teachers and administrators
- 📝 Real-time attendance marking
- 📊 Comprehensive attendance reports and analytics
- 👥 Student management system
- 📱 Responsive design for mobile and desktop
- 🖨️ PDF report generation
- 📅 Historical attendance data tracking

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm (v9 or higher)
- Git

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/chama-x/attendancemarkingsystem.git
cd attendancemarkingsystem
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/     # React components
├── contexts/       # Context providers
├── config/         # Configuration files
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── assets/         # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Technology Stack

- React 18
- TypeScript
- Vite
- Firebase (Authentication, Realtime Database)
- Tailwind CSS
- React Router
- React PDF

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
