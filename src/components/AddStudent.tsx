import { useState, FormEvent } from 'react';
import { StudentFormData } from '../types';
import { addStudent } from '../utils/firebase';

export default function AddStudent() {
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    registrationNumber: '',
    class: '',
    grade: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];
  const classes = ['A', 'B', 'C', 'D'];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.registrationNumber.trim()) {
      setError('Registration number is required');
      return;
    }
    if (!formData.class) {
      setError('Class is required');
      return;
    }
    if (!formData.grade) {
      setError('Grade is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await addStudent(formData);
      
      setSuccess('Student added successfully!');
      setFormData({
        name: '',
        registrationNumber: '',
        class: '',
        grade: '',
      });
    } catch (err) {
      setError('Failed to add student');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md" role="alert">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md" role="alert">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Student Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter student name"
            />
          </div>

          <div>
            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
              Registration Number
            </label>
            <input
              type="text"
              id="registrationNumber"
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter registration number"
            />
          </div>

          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
              Grade
            </label>
            <select
              id="grade"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Grade</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="class" className="block text-sm font-medium text-gray-700">
              Class
            </label>
            <select
              id="class"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Student...
              </>
            ) : (
              'Add Student'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 