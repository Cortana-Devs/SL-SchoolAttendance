import { useState, useEffect } from 'react';
import { Student } from '../types';
import { getStudents, searchStudents, getStudentsByGrade } from '../utils/firebase';

export default function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [sortField, setSortField] = useState<'name' | 'grade' | 'class'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);
      setError('');
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      setError('Failed to load students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(value: string) {
    setSearchTerm(value);
    if (!value) {
      loadStudents();
      return;
    }

    try {
      setSearchLoading(true);
      setError('');
      const results = await searchStudents(value);
      setStudents(results);
    } catch (err) {
      setError('Failed to search students');
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleGradeFilter(grade: string) {
    setSelectedGrade(grade);
    if (!grade) {
      loadStudents();
      return;
    }

    try {
      setFilterLoading(true);
      setError('');
      const results = await getStudentsByGrade(grade);
      setStudents(results);
    } catch (err) {
      setError('Failed to filter students');
      console.error(err);
    } finally {
      setFilterLoading(false);
    }
  }

  const sortStudents = (students: Student[]) => {
    return [...students].sort((a, b) => {
      const aValue = a[sortField].toLowerCase();
      const bValue = b[sortField].toLowerCase();
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  };

  const toggleSort = (field: 'name' | 'grade' | 'class') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const paginatedStudents = (students: Student[]) => {
    const sortedStudents = sortStudents(students);
    const startIndex = (currentPage - 1) * studentsPerPage;
    return sortedStudents.slice(startIndex, startIndex + studentsPerPage);
  };

  const totalPages = Math.ceil(students.length / studentsPerPage);

  const toggleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const toggleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedStudents.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
          <span className="text-sm text-gray-700">
            {selectedStudents.length} students selected
          </span>
          <div className="space-x-2">
            <button className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100">
              Export Selected
            </button>
            <button className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50">
              Delete Selected
            </button>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {searchLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            </div>
          )}
        </div>
        <div className="w-full sm:w-48 relative">
          <select
            value={selectedGrade}
            onChange={(e) => handleGradeFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Grades</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          {filterLoading && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md" role="alert">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === students.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    {sortField === 'name' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration No.
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('class')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Class</span>
                    {sortField === 'class' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleSort('grade')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Grade</span>
                    {sortField === 'grade' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                paginatedStudents(students).map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => toggleSelectStudent(student.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.registrationNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.class}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.grade}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 