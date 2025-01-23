import { useState, FormEvent, useEffect } from 'react';
import { StudentFormData } from '../types';
import { addStudent } from '../utils/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AddStudent() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    registrationNumber: '',
    class: '',
    grade: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // Updated sections and grades structure
  const sections = ['Primary', 'Middle', 'Upper', 'Advanced'];
  const grades = {
    'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
    'Middle': ['Grade 6', 'Grade 7', 'Grade 8'],
    'Upper': ['Grade 9', 'Grade 10', 'Grade 11'],
    'Advanced': ['Grade 12', 'Grade 13']
  };

  const classes = {
    'Primary': ['A', 'B', 'C'],
    'Middle': ['A', 'B', 'C', 'D'],
    'Upper': ['A', 'B', 'C', 'D'],
    'Advanced': {
      'Arts': ['Arts-A', 'Arts-B'],
      'Science': ['Science-A', 'Science-B'],
      'Commerce': ['Commerce-A', 'Commerce-B'],
      'Technology': ['Tech-A', 'Tech-B']
    }
  };

  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedStream, setSelectedStream] = useState('');

  // Effect to update available classes when section or stream changes
  useEffect(() => {
    if (selectedSection === 'Advanced') {
      setAvailableClasses(selectedStream ? classes.Advanced[selectedStream as keyof typeof classes.Advanced] : []);
    } else if (selectedSection) {
      setAvailableClasses(classes[selectedSection as keyof typeof classes] as string[]);
    } else {
      setAvailableClasses([]);
    }
  }, [selectedSection, selectedStream]);

  // Reset dependent fields when section changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, grade: '', class: '' }));
    setSelectedStream('');
  }, [selectedSection]);

  // Reset class when stream changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, class: '' }));
  }, [selectedStream]);

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
      // Redirect to student list after successful addition
      setTimeout(() => {
        navigate('/students');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to add student');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Check if user has permission to add students
  useEffect(() => {
    if (userRole !== 'admin' && userRole !== 'teacher') {
      navigate('/');
    }
  }, [userRole, navigate]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Add New Student</h2>
      
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
            <label htmlFor="section" className="block text-sm font-medium text-gray-700">
              Section
            </label>
            <select
              id="section"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Section</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
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
              disabled={!selectedSection}
            >
              <option value="">Select Grade</option>
              {selectedSection && grades[selectedSection as keyof typeof grades].map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          {selectedSection === 'Advanced' && (
            <div>
              <label htmlFor="stream" className="block text-sm font-medium text-gray-700">
                Stream
              </label>
              <select
                id="stream"
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Stream</option>
                {Object.keys(classes.Advanced).map((stream) => (
                  <option key={stream} value={stream}>
                    {stream}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="class" className="block text-sm font-medium text-gray-700">
              Class
            </label>
            <select
              id="class"
              value={formData.class}
              onChange={(e) => setFormData({ ...formData, class: e.target.value })}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!selectedSection || (selectedSection === 'Advanced' && !selectedStream)}
            >
              <option value="">Select Class</option>
              {availableClasses.map((cls) => (
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