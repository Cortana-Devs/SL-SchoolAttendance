import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import AttendancePage from './components/AttendancePage';
import StudentList from './components/StudentList';
import AddStudent from './components/AddStudent';
import Login from './components/Login';
import AttendanceReports from './components/AttendanceReports';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="students" element={<StudentList />} />
        <Route path="students/add" element={<AddStudent />} />
        <Route path="reports" element={<AttendanceReports />} />
      </Route>
    </Routes>
  );
}

export default App;
