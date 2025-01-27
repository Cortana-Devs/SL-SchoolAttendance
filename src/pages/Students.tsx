import { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import StudentSearch from '../components/StudentSearch';
import { getStudents } from '../utils/firebase';
import type { Student } from '../types';

interface SearchFilters {
  name: string;
  grade: string;
  indexNumber: string;
  class: string;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  useEffect(() => {
    const loadStudents = async () => {
      const data = await getStudents();
      setStudents(data);
      setFilteredStudents(data);
    };
    loadStudents();
  }, []);

  const handleSearch = (filters: SearchFilters) => {
    let results = [...students];

    if (filters.name) {
      results = results.filter((student) =>
        student.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.indexNumber) {
      results = results.filter((student) =>
        student.registrationNumber.includes(filters.indexNumber)
      );
    }

    if (filters.grade) {
      results = results.filter((student) => 
        student.grade === filters.grade
      );
    }

    if (filters.class) {
      results = results.filter((student) => 
        student.class === filters.class
      );
    }

    setFilteredStudents(results);
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Students
      </Typography>
      
      <StudentSearch onSearchChange={handleSearch} />

      <div className="mt-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration No.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.registrationNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.grade}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
};

export default Students; 