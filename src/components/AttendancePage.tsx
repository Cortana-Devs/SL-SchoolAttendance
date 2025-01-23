import { useState, useEffect } from 'react';
import { Student, AttendanceStatus } from '../types';
import {
  getStudentsByGrade,
  saveAttendance,
  getDraftAttendance,
  saveDraftAttendance,
  updateAttendanceRecord
} from '../utils/firebase';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { AttendancePDF } from './AttendancePDF';
import { useAuth } from '../contexts/AuthContext';

export default function AttendancePage() {
  const { userRole } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceStatus[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [originalAttendance, setOriginalAttendance] = useState<AttendanceStatus[]>([]);

  // Updated class structure for Sri Lankan schools
  const classes: Record<'Primary' | 'Middle' | 'Upper' | 'Advanced', string[]> = {
    'Primary': ['A', 'B', 'C'],  // Primary classes typically have fewer sections
    'Middle': ['A', 'B', 'C', 'D'],  // Middle classes might have more sections
    'Upper': ['A', 'B', 'C', 'D'],   // Upper classes also have more sections
    'Advanced': ['A', 'B', 'C']      // Advanced classes (for streams)
  };

  // Updated grade structure for Sri Lankan schools
  const grades = {
    'Primary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
    'Middle': ['Grade 6', 'Grade 7', 'Grade 8'],
    'Upper': ['Grade 9', 'Grade 10', 'Grade 11'],
    'Advanced': ['Grade 12', 'Grade 13']
  };

  // State for section and stream selection
  const [selectedSection, setSelectedSection] = useState<'Primary' | 'Middle' | 'Upper' | 'Advanced'>('Primary');
  const [selectedStream, setSelectedStream] = useState<string>('');
  
  // Get available streams based on selected grade
  const getAvailableStreams = () => {
    if (selectedGrade && (selectedGrade.includes('12') || selectedGrade.includes('13'))) {
      return ['Arts', 'Technology', 'Maths', 'Science', 'Bio'];
    }
    return [];
  };

  // Get available classes based on selected section and stream
  const getAvailableClasses = (): string[] => {
    if (selectedSection === 'Advanced' && selectedStream) {
      return classes[selectedSection].map(cls => `${selectedStream}-${cls}`);
    }
    return classes[selectedSection] || [];
  };

  useEffect(() => {
    // Reset states when component mounts
    setStudents([]);
    setAttendance([]);
    setError('');
    setSuccess('');
    setSaving(false);

    // If we have both grade and class selected, load the data
    if (selectedGrade && selectedClass) {
      loadStudents();
    }

    // Cleanup function
    return () => {
      setStudents([]);
      setAttendance([]);
    };
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    if (selectedGrade && selectedClass) {
      loadStudents();
    } else {
      // Reset students and attendance when grade or class changes to empty
      setStudents([]);
      setAttendance([]);
    }
  }, [selectedGrade, selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedDate && students.length > 0) {
      // Only load draft if we don't have any attendance records
      if (attendance.length === 0) {
        loadDraftAttendance();
      }
    }
  }, [selectedClass, selectedDate, students.length]);

  // Reset class when section changes
  useEffect(() => {
    setSelectedClass('');
    setSelectedGrade('');
  }, [selectedSection]);

  async function loadStudents() {
    console.log('=== START loadStudents ===');
    console.log('Loading students for:', { selectedGrade, selectedClass });
    try {
      setError('');
      const data = await getStudentsByGrade(selectedGrade, selectedClass);
      console.log('Loaded students:', data);
      setStudents(data);
      
      // Initialize attendance records only if we don't have any
      if (attendance.length === 0) {
        console.log('Initializing new attendance records');
        const newAttendance = data.map(student => ({
          studentId: student.id,
          present: false
        }));
        console.log('New attendance records:', newAttendance);
        setAttendance(newAttendance);
      } else {
        console.log('Using existing attendance records:', attendance);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      setError('Failed to load students');
    } finally {
      console.log('=== END loadStudents ===');
    }
  }

  async function loadDraftAttendance() {
    try {
      console.log('=== START loadDraftAttendance ===');
      console.log('Loading draft for:', { selectedDate, selectedClass });
      
      const draft = await getDraftAttendance(selectedDate, selectedClass);
      console.log('Loaded draft:', draft);

      if (draft && draft.records) {
        // Map the records to our attendance format
        const attendanceRecords = students.map(student => {
          const record = draft.records[student.id];
          console.log(`Processing student ${student.id}:`, record);
          
          // Ensure we have a valid record and present status
          const isPresent = record ? Boolean(record.present) : false;
          console.log(`Student ${student.id} present status:`, isPresent);
          
          return {
            studentId: student.id,
            present: isPresent
          };
        });
        
        console.log('Final mapped attendance records:', attendanceRecords);
        setAttendance(attendanceRecords);
        setOriginalAttendance(attendanceRecords);
        setIsEditing(draft.submitted || false);
      } else {
        console.log('No draft found, initializing with default values');
        // Initialize with default values
        const defaultAttendance = students.map(student => ({
          studentId: student.id,
          present: false
        }));
        console.log('Default attendance records:', defaultAttendance);
        setAttendance(defaultAttendance);
        setOriginalAttendance([]);
        setIsEditing(false);
      }
      console.log('=== END loadDraftAttendance ===');
    } catch (err) {
      console.error('Failed to load attendance:', err);
      setError('Failed to load attendance data');
    }
  }

  // Update toggleAttendance for more reliable state management
  const toggleAttendance = async (studentId: string, status: 'present' | 'absent') => {
    console.log('=== START toggleAttendance ===');
    console.log('Toggling attendance:', { studentId, status });
    console.log('Current attendance state:', attendance);
    
    try {
      // Create updated attendance first
      const updatedAttendance = attendance.map(record => {
        if (record.studentId === studentId) {
          return {
            ...record,
            present: status === 'present'
          };
        }
        return record;
      });

      console.log('Updated attendance records:', updatedAttendance);

      // Update state immediately
      setAttendance(updatedAttendance);

      // Save to server if we have required data
      if (selectedClass && selectedGrade) {
        console.log('Saving to server with:', {
          date: selectedDate,
          class: selectedClass,
          grade: selectedGrade
        });
        
        setSaving(true);
        await saveDraftAttendance(selectedDate, selectedClass, selectedGrade, updatedAttendance);
        console.log('Successfully saved draft attendance');
        setError('');
      } else {
        console.warn('Missing required data:', { selectedClass, selectedGrade });
      }
    } catch (error) {
      console.error('Failed to save attendance:', error);
      setError('Failed to save attendance status');
    } finally {
      setSaving(false);
      console.log('=== END toggleAttendance ===');
    }
  };

  // Update addNote for immediate UI update and reliable saving
  const addNote = async (studentId: string, note: string) => {
    // Create updated attendance first
    const updatedAttendance = attendance.map(record => {
      if (record.studentId === studentId) {
        return {
          ...record,
          note
        };
      }
      return record;
    });

    // Update state immediately
    setAttendance(updatedAttendance);

    // Save to server if we have required data
    if (selectedClass && selectedGrade) {
      try {
        await saveDraftAttendance(selectedDate, selectedClass, selectedGrade, updatedAttendance);
      } catch (error) {
        console.error('Failed to save note:', error);
        setError('Failed to save note');
      }
    }
  };

  // Update markAllPresent for immediate UI update and reliable saving
  const markAllPresent = async () => {
    // Create updated attendance first
    const updatedAttendance = attendance.map(record => ({
      ...record,
      present: true
    }));

    // Update state immediately
    setAttendance(updatedAttendance);

    // Save to server if we have required data
    if (selectedClass && selectedGrade) {
      try {
        await saveDraftAttendance(selectedDate, selectedClass, selectedGrade, updatedAttendance);
      } catch (error) {
        console.error('Failed to mark all present:', error);
        setError('Failed to mark all present');
      }
    }
  };

  // Update clearAll for immediate UI update and reliable saving
  const clearAll = async () => {
    // Create updated attendance first
    const updatedAttendance = attendance.map(record => ({
      ...record,
      present: false,
      note: ''
    }));

    // Update state immediately
    setAttendance(updatedAttendance);

    // Save to server if we have required data
    if (selectedClass && selectedGrade) {
      try {
        await saveDraftAttendance(selectedDate, selectedClass, selectedGrade, updatedAttendance);
      } catch (error) {
        console.error('Failed to clear attendance:', error);
        setError('Failed to clear attendance');
      }
    }
  };

  async function handleSaveDraft() {
    if (!selectedClass || !selectedGrade) {
      setError('Please select both class and grade');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await saveDraftAttendance(selectedDate, selectedClass, selectedGrade, attendance);
      setSuccess('Draft saved successfully');
    } catch (err) {
      setError('Failed to save draft');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  // Update handleSubmit to use the latest attendance state
  async function handleSubmit() {
    if (!selectedClass || !selectedGrade) {
      setError('Please select both class and grade');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // First save as draft to ensure latest state is saved
      await saveDraftAttendance(selectedDate, selectedClass, selectedGrade, attendance);
      // Then submit the attendance
      await saveAttendance(selectedDate, selectedClass, selectedGrade, attendance);
      
      setSuccess('Attendance submitted successfully');
      setIsEditing(true);
      setOriginalAttendance(attendance);
    } catch (err) {
      setError('Failed to submit attendance');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!selectedClass || !selectedGrade) {
      setError('Please select both class and grade');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await updateAttendanceRecord(selectedDate, selectedClass, attendance, {
        grade: selectedGrade
      });
      setSuccess('Attendance updated successfully');
      setIsEditing(true);
      setOriginalAttendance(attendance);
    } catch (err) {
      setError('Failed to update attendance');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setAttendance(originalAttendance);
    setIsEditing(true);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Section</label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value as 'Primary' | 'Middle' | 'Upper' | 'Advanced');
                setSelectedGrade('');
                setSelectedClass('');
                setSelectedStream('');
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Primary">Primary Section</option>
              <option value="Middle">Middle Section</option>
              <option value="Upper">Upper Section</option>
              <option value="Advanced">Advanced Section</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedClass('');
                if (!e.target.value.includes('12') && !e.target.value.includes('13')) {
                  setSelectedStream('');
                }
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Grade</option>
              {grades[selectedSection]?.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          {selectedSection === 'Advanced' && selectedGrade && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Stream</label>
              <select
                value={selectedStream}
                onChange={(e) => {
                  setSelectedStream(e.target.value);
                  setSelectedClass('');
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Stream</option>
                {getAvailableStreams().map(stream => (
                  <option key={stream} value={stream}>{stream}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={selectedSection === 'Advanced' && !selectedStream}
            >
              <option value="">Select Class</option>
              {getAvailableClasses().map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {students.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Edit Attendance' : 'Mark Attendance'}
              </h2>
              <div className="space-x-2">
                {!isEditing && (
                  <>
                    <button
                      onClick={markAllPresent}
                      className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={clearAll}
                      className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
                    >
                      Clear All
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => {
                  const record = attendance.find(r => r.studentId === student.id);
                  return (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.registrationNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleAttendance(student.id, 'present')}
                            className={`px-3 py-1 text-sm rounded-full transition-colors duration-150 ${
                              record?.present
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => toggleAttendance(student.id, 'absent')}
                            className={`px-3 py-1 text-sm rounded-full transition-colors duration-150 ${
                              !record?.present
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          placeholder="Add note..."
                          value={record?.note || ''}
                          onChange={(e) => addNote(student.id, e.target.value)}
                          className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-end space-x-3">
              {(userRole === 'admin' || userRole === 'teacher') && students.length > 0 && (
                <PDFDownloadLink
                  document={
                    <AttendancePDF
                      date={selectedDate}
                      grade={selectedGrade}
                      class={selectedClass}
                      students={students}
                      attendance={attendance}
                    />
                  }
                  fileName={`attendance-${selectedGrade}-${selectedClass}-${selectedDate}.pdf`}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export PDF
                </PDFDownloadLink>
              )}
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {saving ? 'Saving...' : 'Update Attendance'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {saving ? 'Saving...' : 'Submit Attendance'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 