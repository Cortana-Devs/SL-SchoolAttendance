import json
from datetime import datetime, timedelta
import random
import uuid

def generate_sample_data():
    # School structure
    sections = {
        'Primary': {
            'grades': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
            'classes': ['A', 'B', 'C']
        },
        'Middle': {
            'grades': ['Grade 6', 'Grade 7', 'Grade 8'],
            'classes': ['A', 'B', 'C', 'D']
        },
        'Upper': {
            'grades': ['Grade 9', 'Grade 10', 'Grade 11'],
            'classes': ['A', 'B', 'C', 'D']
        },
        'Advanced': {
            'grades': ['Grade 12', 'Grade 13'],
            'streams': {
                'Arts': ['Arts-A', 'Arts-B'],
                'Science': ['Science-A', 'Science-B'],
                'Commerce': ['Commerce-A', 'Commerce-B'],
                'Technology': ['Tech-A', 'Tech-B']
            }
        }
    }

    # Sinhala names for realistic data
    first_names = [
        'Kasun', 'Chamara', 'Nuwan', 'Dimuth', 'Lahiru', 'Sachith', 'Buddhika',
        'Malsha', 'Sanduni', 'Dilini', 'Hashini', 'Sewwandi', 'Chathurika', 'Madhavi',
        'Kavinda', 'Thisara', 'Dasun', 'Isuru', 'Chanaka', 'Thilina', 'Ravindu',
        'Nethmi', 'Sachini', 'Hansini', 'Dulani', 'Amaya', 'Sithmi', 'Senuri'
    ]
    
    last_names = [
        'Perera', 'Silva', 'Fernando', 'Dissanayake', 'Bandara', 'Rajapaksa',
        'Wickramasinghe', 'Gunasekara', 'Jayawardena', 'Ranasinghe', 'Karunaratne',
        'Weerasinghe', 'Mendis', 'Samaraweera', 'Gunawardana', 'Senanayake',
        'Amarasekara', 'Liyanage', 'Rathnayake', 'Nanayakkara'
    ]

    # Initialize database structure
    database = {
        'users': {
            'admin123uid': {
                'email': 'admin@attendancemarkin.com',
                'role': 'admin',
                'createdAt': int(datetime.now().timestamp() * 1000)
            },
            'teacher123uid': {
                'email': 'teacher@attendancemarkin.com',
                'role': 'teacher',
                'createdAt': int(datetime.now().timestamp() * 1000)
            }
        },
        'students': {},
        'attendance': {},
        'stats': {
            'cached': {},
            'daily': {},
            'monthly': {}
        }
    }

    # Generate students
    student_count = 0
    for section, section_data in sections.items():
        grades = section_data['grades']
        
        for grade in grades:
            if section == 'Advanced':
                for stream, classes in section_data['streams'].items():
                    for class_name in classes:
                        # Generate 15-20 students per class
                        num_students = random.randint(15, 20)
                        for _ in range(num_students):
                            student_id = f"student-{str(uuid.uuid4())}"
                            student_count += 1
                            reg_number = f"2024{str(student_count).zfill(4)}"
                            
                            database['students'][student_id] = {
                                'id': student_id,
                                'name': f"{random.choice(first_names)} {random.choice(last_names)}",
                                'registrationNumber': reg_number,
                                'grade': grade,
                                'class': class_name,
                                'stream': stream,
                                'section': section,
                                'createdAt': int(datetime.now().timestamp() * 1000),
                                'updatedAt': int(datetime.now().timestamp() * 1000)
                            }
            else:
                classes = section_data['classes']
                for class_name in classes:
                    # Generate 25-30 students per class
                    num_students = random.randint(25, 30)
                    for _ in range(num_students):
                        student_id = f"student-{str(uuid.uuid4())}"
                        student_count += 1
                        reg_number = f"2024{str(student_count).zfill(4)}"
                        
                        database['students'][student_id] = {
                            'id': student_id,
                            'name': f"{random.choice(first_names)} {random.choice(last_names)}",
                            'registrationNumber': reg_number,
                            'grade': grade,
                            'class': class_name,
                            'section': section,
                            'createdAt': int(datetime.now().timestamp() * 1000),
                            'updatedAt': int(datetime.now().timestamp() * 1000)
                        }

    # Generate attendance records for the past week
    today = datetime.now()
    for i in range(7):
        date = (today - timedelta(days=i)).strftime('%Y-%m-%d')
        database['attendance'][date] = {}
        
        # For each student, generate attendance
        for student_id, student in database['students'].items():
            class_id = student['class']
            if class_id not in database['attendance'][date]:
                database['attendance'][date][class_id] = {
                    'id': f"{date}_{class_id}",
                    'date': date,
                    'class': class_id,
                    'grade': student['grade'],
                    'section': student['section'],
                    'records': {},
                    'lastModified': int(datetime.now().timestamp() * 1000),
                    'submitted': True,
                    'submittedBy': 'teacher@attendancemarkin.com',
                    'totalPresent': 0,
                    'totalAbsent': 0,
                    'schoolDayType': 'Regular',
                    'period': 'Morning',
                    'academicYear': str(today.year)
                }
            
            # 90% chance of being present
            is_present = random.random() < 0.9
            timestamp = int(datetime.now().timestamp() * 1000)
            
            database['attendance'][date][class_id]['records'][student_id] = {
                'present': is_present,
                'timestamp': timestamp,
                'markedBy': 'teacher@attendancemarkin.com',
                'markedTime': '08:00:00',
                'note': '',
                'lastModifiedBy': 'teacher@attendancemarkin.com',
                'lastModifiedAt': timestamp
            }
            
            # Update totals
            if is_present:
                database['attendance'][date][class_id]['totalPresent'] += 1
            else:
                database['attendance'][date][class_id]['totalAbsent'] += 1

    # Generate statistics
    start_date = (today - timedelta(days=6)).strftime('%Y-%m-%d')
    end_date = today.strftime('%Y-%m-%d')
    cache_key = f"stats_{start_date}_{end_date}_all_all"
    
    total_present = 0
    total_absent = 0
    by_date = {}
    
    for date in database['attendance']:
        by_date[date] = {
            'present': sum(class_data['totalPresent'] for class_data in database['attendance'][date].values()),
            'absent': sum(class_data['totalAbsent'] for class_data in database['attendance'][date].values()),
            'late': 0,
            'excused': 0
        }
        total_present += by_date[date]['present']
        total_absent += by_date[date]['absent']

    database['stats']['cached'][cache_key] = {
        'data': {
            'totalPresent': total_present,
            'totalAbsent': total_absent,
            'totalDays': 7,
            'totalExcused': 0,
            'totalLate': 0,
            'averageAttendance': round((total_present / (total_present + total_absent)) * 100),
            'byDate': by_date,
            'generatedAt': int(datetime.now().timestamp() * 1000),
            'generatedBy': 'teacher@attendancemarkin.com'
        },
        'timestamp': int(datetime.now().timestamp() * 1000)
    }

    # Save to file
    with open('sample_data.json', 'w', encoding='utf-8') as f:
        json.dump(database, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    generate_sample_data()
    print("Sample data generated successfully in 'sample_data.json'") 