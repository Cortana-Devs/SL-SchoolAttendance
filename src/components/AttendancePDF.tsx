import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { Student } from '../types';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 5,
    color: '#666',
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
    minHeight: 25,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
  },
  tableCell: {
    flex: 1,
    padding: 5,
    fontSize: 10,
  },
  statusCell: {
    width: '15%',
    padding: 5,
    fontSize: 10,
  },
  present: {
    color: '#059669',
  },
  absent: {
    color: '#dc2626',
  },
  late: {
    color: '#d97706',
  },
  excused: {
    color: '#2563eb',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
  },
});

interface AttendancePDFProps {
  date: string;
  grade: string;
  class: string;
  students: Student[];
  attendance: Array<{
    studentId: string;
    present: boolean;
    isLateArrival?: boolean;
    isExcused?: boolean;
    note?: string;
    absenceReason?: string;
  }>;
}

export const AttendancePDF = ({ date, grade, class: className, students, attendance }: AttendancePDFProps) => {
  const getAttendanceStatus = (studentId: string) => {
    const record = attendance.find(a => a.studentId === studentId);
    if (!record) return 'Absent';
    if (record.isLateArrival) return 'Late';
    if (record.isExcused) return 'Excused';
    return record.present ? 'Present' : 'Absent';
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Present':
        return styles.present;
      case 'Absent':
        return styles.absent;
      case 'Late':
        return styles.late;
      case 'Excused':
        return styles.excused;
      default:
        return {};
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Attendance Report</Text>
          <Text style={styles.subtitle}>Date: {format(new Date(date), 'MMMM d, yyyy')}</Text>
          <Text style={styles.subtitle}>Grade: {grade} - Class: {className}</Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Name</Text>
            <Text style={styles.tableCell}>Registration No.</Text>
            <Text style={styles.statusCell}>Status</Text>
            <Text style={styles.tableCell}>Note/Reason</Text>
          </View>

          {students.map((student) => {
            const status = getAttendanceStatus(student.id);
            const record = attendance.find(a => a.studentId === student.id);
            return (
              <View key={student.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{student.name}</Text>
                <Text style={styles.tableCell}>{student.registrationNumber}</Text>
                <Text style={[styles.statusCell, getStatusStyle(status)]}>{status}</Text>
                <Text style={styles.tableCell}>
                  {record?.note || record?.absenceReason || ''}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.footer}>
          Generated on {format(new Date(), 'MMMM d, yyyy h:mm a')}
        </Text>
      </Page>
    </Document>
  );
}; 