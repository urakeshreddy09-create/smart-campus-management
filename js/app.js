/**
 * SMART CAMPUS MANAGEMENT SYSTEM - CORE APPLICATION ENGINE
 * Central State Store, LocalStorage Persistence, Navigation, and Global UI
 */

const CampusStore = (function () {
  const STORAGE_KEY = 'CAMPUS_IQ_DATA_V1';

  // Factory Initial Dataset
  const initialData = {
    settings: {
      campusName: 'Apex Institute of Technology & Science',
      academicTerm: '2026 - 2027 (Fall Term)',
      contactEmail: 'admin@campus.com',
      contactPhone: '+1 (555) 234-5678',
      campusAddress: '742 University Boulevard, Innovation Park, CA 90210'
    },
    students: [
      { id: 1, regNo: 'REG2024CS001', name: 'Alex Morgan', email: 'alex.m@campus.com', department: 'Computer Science', year: '3rd Year', section: 'A', phone: '+1 (555) 019-2831', status: 'Active', gpa: 3.88, attendanceRate: 94 },
      { id: 2, regNo: 'REG2024CS002', name: 'Priya Patel', email: 'priya.p@campus.com', department: 'Computer Science', year: '3rd Year', section: 'A', phone: '+1 (555) 019-2832', status: 'Active', gpa: 3.92, attendanceRate: 96 },
      { id: 3, regNo: 'REG2024CS003', name: 'David Kim', email: 'david.k@campus.com', department: 'Computer Science', year: '3rd Year', section: 'B', phone: '+1 (555) 019-2833', status: 'Active', gpa: 3.45, attendanceRate: 88 },
      { id: 4, regNo: 'REG2024CS004', name: 'Emma Watson', email: 'emma.w@campus.com', department: 'Computer Science', year: '2nd Year', section: 'A', phone: '+1 (555) 019-2834', status: 'Active', gpa: 3.75, attendanceRate: 91 },
      { id: 5, regNo: 'REG2024EC005', name: 'Rahul Sharma', email: 'rahul.s@campus.com', department: 'Electronics & Communication', year: '3rd Year', section: 'A', phone: '+1 (555) 019-2835', status: 'Active', gpa: 3.60, attendanceRate: 89 },
      { id: 6, regNo: 'REG2024EC006', name: 'Sophia Martinez', email: 'sophia.m@campus.com', department: 'Electronics & Communication', year: '2nd Year', section: 'B', phone: '+1 (555) 019-2836', status: 'Active', gpa: 3.82, attendanceRate: 95 },
      { id: 7, regNo: 'REG2024IT007', name: 'Lucas Vance', email: 'lucas.v@campus.com', department: 'Information Technology', year: '4th Year', section: 'A', phone: '+1 (555) 019-2837', status: 'Active', gpa: 3.68, attendanceRate: 90 },
      { id: 8, regNo: 'REG2024IT008', name: 'Chloe Bennet', email: 'chloe.b@campus.com', department: 'Information Technology', year: '3rd Year', section: 'A', phone: '+1 (555) 019-2838', status: 'Active', gpa: 3.91, attendanceRate: 97 },
      { id: 9, regNo: 'REG2024ME009', name: 'Daniel Lee', email: 'daniel.l@campus.com', department: 'Mechanical Engineering', year: '3rd Year', section: 'A', phone: '+1 (555) 019-2839', status: 'Active', gpa: 3.52, attendanceRate: 86 },
      { id: 10, regNo: 'REG2024ME010', name: 'Olivia Brown', email: 'olivia.b@campus.com', department: 'Mechanical Engineering', year: '2nd Year', section: 'A', phone: '+1 (555) 019-2840', status: 'Active', gpa: 3.70, attendanceRate: 92 },
      { id: 11, regNo: 'REG2024CE011', name: 'Ethan Wright', email: 'ethan.w@campus.com', department: 'Civil Engineering', year: '1st Year', section: 'A', phone: '+1 (555) 019-2841', status: 'Active', gpa: 3.40, attendanceRate: 85 },
      { id: 12, regNo: 'REG2024BA012', name: 'Mia Tanaka', email: 'mia.t@campus.com', department: 'Business Administration', year: '2nd Year', section: 'A', phone: '+1 (555) 019-2842', status: 'Active', gpa: 3.85, attendanceRate: 93 },
      { id: 13, regNo: 'REG2024CS013', name: 'Noah Campbell', email: 'noah.c@campus.com', department: 'Computer Science', year: '4th Year', section: 'B', phone: '+1 (555) 019-2843', status: 'Active', gpa: 3.65, attendanceRate: 87 },
      { id: 14, regNo: 'REG2024CS014', name: 'Isabella Rossi', email: 'isabella.r@campus.com', department: 'Computer Science', year: '1st Year', section: 'A', phone: '+1 (555) 019-2844', status: 'Active', gpa: 3.95, attendanceRate: 98 },
      { id: 15, regNo: 'REG2024EC015', name: 'Liam Davies', email: 'liam.d@campus.com', department: 'Electronics & Communication', year: '4th Year', section: 'A', phone: '+1 (555) 019-2845', status: 'Active', gpa: 3.58, attendanceRate: 89 }
    ],
    faculty: [
      { id: 1, facultyId: 'FAC-1001', name: 'Dr. Robert Sterling', email: 'admin@campus.com', department: 'Computer Science', designation: 'Professor & Dean', subjects: ['Cloud Computing', 'Advanced Algorithms'], phone: '+1 (555) 012-3401' },
      { id: 2, facultyId: 'FAC-1002', name: 'Prof. Sarah Jenkins', email: 'faculty@campus.com', department: 'Computer Science', designation: 'Associate Professor', subjects: ['Data Structures', 'Database Management'], phone: '+1 (555) 012-3402' },
      { id: 3, facultyId: 'FAC-1003', name: 'Dr. Michael Chang', email: 'm.chang@campus.com', department: 'Electronics & Communication', designation: 'Professor & HOD', subjects: ['Digital Electronics', 'VLSI Design'], phone: '+1 (555) 012-3403' },
      { id: 4, facultyId: 'FAC-1004', name: 'Dr. Elena Rostova', email: 'e.rostova@campus.com', department: 'Information Technology', designation: 'Associate Professor', subjects: ['Artificial Intelligence', 'Deep Learning'], phone: '+1 (555) 012-3404' },
      { id: 5, facultyId: 'FAC-1005', name: 'Prof. Alan Turing', email: 'a.turing@campus.com', department: 'Computer Science', designation: 'Distinguished Professor', subjects: ['Discrete Mathematics', 'Automata Theory'], phone: '+1 (555) 012-3405' },
      { id: 6, facultyId: 'FAC-1006', name: 'Dr. Priya Sharma', email: 'p.sharma@campus.com', department: 'Mechanical Engineering', designation: 'Professor', subjects: ['Thermodynamics', 'Mechatronics'], phone: '+1 (555) 012-3406' },
      { id: 7, facultyId: 'FAC-1007', name: 'Prof. David Miller', email: 'd.miller@campus.com', department: 'Civil Engineering', designation: 'Assistant Professor', subjects: ['Structural Analysis', 'Fluid Mechanics'], phone: '+1 (555) 012-3407' },
      { id: 8, facultyId: 'FAC-1008', name: 'Dr. James Wilson', email: 'j.wilson@campus.com', department: 'Business Administration', designation: 'Professor', subjects: ['Technology Entrepreneurship', 'Project Finance'], phone: '+1 (555) 012-3408' }
    ],
    courses: [
      { id: 1, code: 'CS101', name: 'Data Structures & Algorithms', department: 'Computer Science', semester: 'Semester 3', facultyName: 'Prof. Sarah Jenkins', credits: 4, enrolledCount: 120 },
      { id: 2, code: 'CS202', name: 'Database Management Systems', department: 'Computer Science', semester: 'Semester 4', facultyName: 'Prof. Sarah Jenkins', credits: 4, enrolledCount: 115 },
      { id: 3, code: 'CS303', name: 'Artificial Intelligence & Machine Learning', department: 'Computer Science', semester: 'Semester 5', facultyName: 'Dr. Elena Rostova', credits: 4, enrolledCount: 98 },
      { id: 4, code: 'CS404', name: 'Cloud Architecture & DevOps', department: 'Information Technology', semester: 'Semester 6', facultyName: 'Dr. Robert Sterling', credits: 3, enrolledCount: 85 },
      { id: 5, code: 'EC201', name: 'Digital Electronics & Logic Design', department: 'Electronics & Communication', semester: 'Semester 3', facultyName: 'Dr. Michael Chang', credits: 4, enrolledCount: 90 },
      { id: 6, code: 'EC302', name: 'Microprocessors & Embedded Systems', department: 'Electronics & Communication', semester: 'Semester 5', facultyName: 'Dr. Michael Chang', credits: 4, enrolledCount: 82 },
      { id: 7, code: 'ME201', name: 'Engineering Thermodynamics', department: 'Mechanical Engineering', semester: 'Semester 3', facultyName: 'Dr. Priya Sharma', credits: 4, enrolledCount: 75 },
      { id: 8, code: 'CE201', name: 'Structural Analysis & Design', department: 'Civil Engineering', semester: 'Semester 4', facultyName: 'Prof. David Miller', credits: 4, enrolledCount: 68 },
      { id: 9, code: 'CS102', name: 'Discrete Mathematics', department: 'Computer Science', semester: 'Semester 1', facultyName: 'Prof. Alan Turing', credits: 3, enrolledCount: 130 },
      { id: 10, code: 'BA301', name: 'Technology Entrepreneurship', department: 'Business Administration', semester: 'Semester 5', facultyName: 'Dr. James Wilson', credits: 3, enrolledCount: 110 }
    ],
    timetable: [
      { id: 1, day: 'Monday', time: '09:00 AM - 10:00 AM', subject: 'Data Structures & Algorithms', faculty: 'Prof. Sarah Jenkins', room: 'LH-301', type: 'Lecture' },
      { id: 2, day: 'Monday', time: '10:00 AM - 11:00 AM', subject: 'Database Management Systems', faculty: 'Prof. Sarah Jenkins', room: 'LH-301', type: 'Lecture' },
      { id: 3, day: 'Monday', time: '11:15 AM - 12:15 PM', subject: 'Cloud Architecture & DevOps', faculty: 'Dr. Robert Sterling', room: 'CS-Lab-2', type: 'Practical Lab' },
      { id: 4, day: 'Monday', time: '12:15 PM - 01:15 PM', subject: 'Discrete Mathematics', faculty: 'Prof. Alan Turing', room: 'LH-302', type: 'Lecture' },
      { id: 5, day: 'Monday', time: '02:00 PM - 03:00 PM', subject: 'Artificial Intelligence', faculty: 'Dr. Elena Rostova', room: 'AI-Research-Hall', type: 'Tutorial' },
      
      { id: 6, day: 'Tuesday', time: '09:00 AM - 10:00 AM', subject: 'Artificial Intelligence', faculty: 'Dr. Elena Rostova', room: 'AI-Research-Hall', type: 'Lecture' },
      { id: 7, day: 'Tuesday', time: '10:00 AM - 11:00 AM', subject: 'Data Structures & Algorithms', faculty: 'Prof. Sarah Jenkins', room: 'CS-Lab-1', type: 'Practical Lab' },
      { id: 8, day: 'Tuesday', time: '11:15 AM - 12:15 PM', subject: 'Digital Electronics', faculty: 'Dr. Michael Chang', room: 'EC-Lab-3', type: 'Lecture' },
      { id: 9, day: 'Tuesday', time: '02:00 PM - 03:00 PM', subject: 'Technology Entrepreneurship', faculty: 'Dr. James Wilson', room: 'Auditorium-B', type: 'Seminar' },
      
      { id: 10, day: 'Wednesday', time: '09:00 AM - 10:00 AM', subject: 'Cloud Architecture & DevOps', faculty: 'Dr. Robert Sterling', room: 'LH-301', type: 'Lecture' },
      { id: 11, day: 'Wednesday', time: '10:00 AM - 11:00 AM', subject: 'Database Management Systems', faculty: 'Prof. Sarah Jenkins', room: 'CS-Lab-2', type: 'Practical Lab' },
      { id: 12, day: 'Wednesday', time: '11:15 AM - 12:15 PM', subject: 'Artificial Intelligence', faculty: 'Dr. Elena Rostova', room: 'LH-301', type: 'Lecture' },
      { id: 13, day: 'Wednesday', time: '02:00 PM - 03:00 PM', subject: 'Discrete Mathematics', faculty: 'Prof. Alan Turing', room: 'LH-302', type: 'Tutorial' },

      { id: 14, day: 'Thursday', time: '09:00 AM - 10:00 AM', subject: 'Data Structures & Algorithms', faculty: 'Prof. Sarah Jenkins', room: 'LH-301', type: 'Lecture' },
      { id: 15, day: 'Thursday', time: '10:00 AM - 11:00 AM', subject: 'Discrete Mathematics', faculty: 'Prof. Alan Turing', room: 'LH-302', type: 'Lecture' },
      { id: 16, day: 'Thursday', time: '11:15 AM - 12:15 PM', subject: 'Cloud Architecture & DevOps', faculty: 'Dr. Robert Sterling', room: 'LH-301', type: 'Lecture' },

      { id: 17, day: 'Friday', time: '09:00 AM - 10:00 AM', subject: 'Database Management Systems', faculty: 'Prof. Sarah Jenkins', room: 'LH-301', type: 'Lecture' },
      { id: 18, day: 'Friday', time: '10:00 AM - 11:00 AM', subject: 'Artificial Intelligence Lab', faculty: 'Dr. Elena Rostova', room: 'AI-Research-Hall', type: 'Practical Lab' },
      { id: 19, day: 'Friday', time: '02:00 PM - 04:00 PM', subject: 'Capstone Project Mentorship', faculty: 'Dr. Robert Sterling', room: 'Innovation-Hub', type: 'Project' },

      { id: 20, day: 'Saturday', time: '09:30 AM - 11:30 AM', subject: 'Open Source Development & Coding Club', faculty: 'Prof. Sarah Jenkins', room: 'Auditorium-A', type: 'Workshop' },
      { id: 21, day: 'Saturday', time: '11:45 AM - 01:15 PM', subject: 'Industry Guest Lecture Series', faculty: 'Dr. James Wilson', room: 'Auditorium-B', type: 'Seminar' }
    ],
    attendanceSessions: [
      {
        id: 1,
        date: new Date().toISOString().split('T')[0],
        department: 'Computer Science',
        year: '3rd Year',
        section: 'A',
        subject: 'Data Structures & Algorithms',
        records: {
          'REG2024CS001': 'present',
          'REG2024CS002': 'present',
          'REG2024CS003': 'late',
          'REG2024CS004': 'present'
        }
      }
    ],
    assignments: [
      {
        id: 1,
        title: 'Design & Implementation of Balanced B+ Trees in C++',
        subject: 'Database Management Systems',
        department: 'Computer Science',
        dueDate: '2026-11-20',
        description: 'Implement a memory-efficient multi-level balanced B+ tree supporting concurrent search, split, merge, and range query traversals with disk block simulation.',
        maxMarks: 100,
        submissions: [
          { studentId: 1, studentName: 'Alex Morgan', regNo: 'REG2024CS001', submittedAt: '2026-11-04 14:20', text: 'https://github.com/alexmorgan/bplus-tree-cpp', status: 'Graded', marks: 95, feedback: 'Excellent concurrency handling and clean memory management.' },
          { studentId: 2, studentName: 'Priya Patel', regNo: 'REG2024CS002', submittedAt: '2026-11-04 16:45', text: 'https://github.com/priyapatel/btree-indexing', status: 'Submitted', marks: null, feedback: '' }
        ]
      },
      {
        id: 2,
        title: 'Deep Convolutional Neural Network for Medical Imaging',
        subject: 'Artificial Intelligence & Machine Learning',
        department: 'Computer Science',
        dueDate: '2026-11-28',
        description: 'Train a deep PyTorch CNN on chest X-ray scans with Grad-CAM activation visualization, achieving >92% test F1 score and model explainability.',
        maxMarks: 100,
        submissions: [
          { studentId: 1, studentName: 'Alex Morgan', regNo: 'REG2024CS001', submittedAt: '2026-11-03 18:30', text: 'Implemented ResNet-50 transfer learning with 94.2% accuracy.', status: 'Submitted', marks: null, feedback: '' }
        ]
      },
      {
        id: 3,
        title: 'Kubernetes Microservice Mesh & CI/CD Pipeline',
        subject: 'Cloud Architecture & DevOps',
        department: 'Information Technology',
        dueDate: '2026-12-05',
        description: 'Deploy a resilient 4-service architecture on Kubernetes with Istio service mesh, Prometheus monitoring, and automated GitHub Actions delivery pipeline.',
        maxMarks: 100,
        submissions: []
      }
    ],
    examinations: [
      { id: 1, code: 'EX-CS301', subject: 'Data Structures & Algorithms', examDate: '2026-11-18', examTime: '10:00 AM - 01:00 PM', room: 'Hall A1 (Main Auditorium)', maxMarks: 100, status: 'Upcoming' },
      { id: 2, code: 'EX-CS302', subject: 'Database Management Systems', examDate: '2026-11-21', examTime: '10:00 AM - 01:00 PM', room: 'Hall B2 (Academic Block)', maxMarks: 100, status: 'Upcoming' },
      { id: 3, code: 'EX-CS303', subject: 'Artificial Intelligence', examDate: '2026-11-24', examTime: '02:00 PM - 05:00 PM', room: 'Hall C1 (Science Center)', maxMarks: 100, status: 'Upcoming' },
      { id: 4, code: 'EX-CS304', subject: 'Cloud Architecture & DevOps', examDate: '2026-11-27', examTime: '10:00 AM - 01:00 PM', room: 'Hall A1 (Main Auditorium)', maxMarks: 100, status: 'Upcoming' }
    ],
    examResults: [
      { id: 1, studentRegNo: 'REG2024CS001', studentName: 'Alex Morgan', subject: 'Data Structures & Algorithms', marksObtained: 94, maxMarks: 100, grade: 'A+', percentage: 94, status: 'Pass' },
      { id: 2, studentRegNo: 'REG2024CS001', studentName: 'Alex Morgan', subject: 'Database Management Systems', marksObtained: 88, maxMarks: 100, grade: 'A', percentage: 88, status: 'Pass' },
      { id: 3, studentRegNo: 'REG2024CS002', studentName: 'Priya Patel', subject: 'Data Structures & Algorithms', marksObtained: 98, maxMarks: 100, grade: 'A+', percentage: 98, status: 'Pass' },
      { id: 4, studentRegNo: 'REG2024CS003', studentName: 'David Kim', subject: 'Data Structures & Algorithms', marksObtained: 76, maxMarks: 100, grade: 'B', percentage: 76, status: 'Pass' },
      { id: 5, studentRegNo: 'REG2024CS004', studentName: 'Emma Watson', subject: 'Discrete Mathematics', marksObtained: 91, maxMarks: 100, grade: 'A+', percentage: 91, status: 'Pass' },
      { id: 6, studentRegNo: 'REG2024EC005', studentName: 'Rahul Sharma', subject: 'Digital Electronics', marksObtained: 84, maxMarks: 100, grade: 'A', percentage: 84, status: 'Pass' },
      { id: 7, studentRegNo: 'REG2024EC006', studentName: 'Sophia Martinez', subject: 'Digital Electronics', marksObtained: 89, maxMarks: 100, grade: 'A', percentage: 89, status: 'Pass' },
      { id: 8, studentRegNo: 'REG2024IT007', studentName: 'Lucas Vance', subject: 'Cloud Architecture', marksObtained: 85, maxMarks: 100, grade: 'A', percentage: 85, status: 'Pass' },
      { id: 9, studentRegNo: 'REG2024ME009', studentName: 'Daniel Lee', subject: 'Engineering Thermodynamics', marksObtained: 79, maxMarks: 100, grade: 'B', percentage: 79, status: 'Pass' },
      { id: 10, studentRegNo: 'REG2024CE011', studentName: 'Ethan Wright', subject: 'Structural Analysis', marksObtained: 71, maxMarks: 100, grade: 'C', percentage: 71, status: 'Pass' }
    ],
    announcements: [
      {
        id: 1,
        title: 'Final Term Examination Schedule AY 2026-27 Released',
        priority: 'High',
        targetAudience: 'All',
        date: '2026-11-04',
        author: 'Office of the Academic Registrar',
        content: 'The official end-term theory and laboratory schedules for all undergraduate and postgraduate engineering branches are now accessible on the portal. Students must resolve any exam conflict with department chairs before November 12.'
      },
      {
        id: 2,
        title: 'Annual Technical Symposium & Hackathon - Inovacia 2026',
        priority: 'Medium',
        targetAudience: 'Students',
        date: '2026-11-03',
        author: 'School of Computing & Student Affairs',
        content: 'Registrations are officially open for our 36-hour flagship hackathon. Total cash prize pool of $15,000 supported by global tech partners. Teams of 2 to 4 students can register through the Campus Events module.'
      },
      {
        id: 3,
        title: 'Faculty Research Grant Applications for Q1 2027',
        priority: 'Low',
        targetAudience: 'Faculty',
        date: '2026-11-01',
        author: 'Dean of Research & Development',
        content: 'Faculty members are invited to submit interdisciplinary research proposals in Applied AI, Sustainable Energy, and Microelectronics. Grant ceiling of $50,000 per project.'
      },
      {
        id: 4,
        title: 'Library 24/7 Silent Study Hours Commencing Next Week',
        priority: 'Medium',
        targetAudience: 'All',
        date: '2026-10-30',
        author: 'Chief Campus Librarian',
        content: 'To support students during mid-term and semester examinations, the Central University Library will remain open 24 hours daily with extended coffee and Wi-Fi lounge services.'
      }
    ],
    events: [
      {
        id: 1,
        title: 'Inovacia 2026: 36-Hour Hackathon',
        date: '2026-11-22',
        time: '09:00 AM - 09:00 PM (Next Day)',
        venue: 'Main Innovation Center & Tech Arena',
        category: 'Tech Fest',
        description: 'Annual flagship software and hardware hackathon. Build scalable solutions across AI, Web3, Healthcare, and CleanTech.',
        registeredUsers: ['admin@campus.com', 'student@campus.com'],
        maxCapacity: 350
      },
      {
        id: 2,
        title: 'Distinguished Lecture: Frontiers in Quantum Computing',
        date: '2026-11-15',
        time: '02:00 PM - 04:30 PM',
        venue: 'Sir C.V. Raman Auditorium',
        category: 'Academic',
        description: 'Keynote by MIT Quantum Lab lead researcher on fault-tolerant qubit architectures and quantum advantage in cryptography.',
        registeredUsers: ['faculty@campus.com'],
        maxCapacity: 200
      },
      {
        id: 3,
        title: 'Hands-on Autonomous Robotics & ROS2 Workshop',
        date: '2026-11-29',
        time: '10:00 AM - 03:00 PM',
        venue: 'Robotics & Automation Lab 4',
        category: 'Workshop',
        description: 'Practical training on robot operating systems, LiDAR mapping, and path planning using autonomous rovers.',
        registeredUsers: [],
        maxCapacity: 60
      },
      {
        id: 4,
        title: 'Inter-University Basketball Championship Finals',
        date: '2026-12-02',
        time: '05:00 PM - 08:00 PM',
        venue: 'Campus Indoor Sports Complex',
        category: 'Sports',
        description: 'Championship matchup between Apex Titans and Bay Area Collegiate Athletic All-Stars.',
        registeredUsers: ['student@campus.com'],
        maxCapacity: 500
      }
    ],
    books: [
      { id: 1, isbn: '978-0262033848', title: 'Introduction to Algorithms (4th Edition)', author: 'Thomas H. Cormen, Charles E. Leiserson', category: 'Computer Science', totalCopies: 12, availableCopies: 7, shelf: 'CS-Floor2-A1', borrowers: ['REG2024CS001'] },
      { id: 2, isbn: '978-0132350884', title: 'Clean Code: A Handbook of Agile Software', author: 'Robert C. Martin', category: 'Computer Science', totalCopies: 8, availableCopies: 4, shelf: 'CS-Floor2-A2', borrowers: [] },
      { id: 3, isbn: '978-0136042594', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell, Peter Norvig', category: 'Computer Science', totalCopies: 10, availableCopies: 2, shelf: 'CS-Floor2-B3', borrowers: ['REG2024CS002'] },
      { id: 4, isbn: '978-0078022159', title: 'Database System Concepts (7th Edition)', author: 'Abraham Silberschatz, Henry Korth', category: 'Computer Science', totalCopies: 15, availableCopies: 9, shelf: 'CS-Floor2-C4', borrowers: [] },
      { id: 5, isbn: '978-0133591620', title: 'Modern Operating Systems (4th Edition)', author: 'Andrew S. Tanenbaum, Herbert Bos', category: 'Computer Science', totalCopies: 7, availableCopies: 5, shelf: 'CS-Floor2-C5', borrowers: [] },
      { id: 6, isbn: '978-0128000564', title: 'Digital Design and Computer Architecture', author: 'David Harris, Sarah Harris', category: 'Electronics', totalCopies: 6, availableCopies: 3, shelf: 'EC-Floor3-E1', borrowers: [] },
      { id: 7, isbn: '978-9353160937', title: 'Engineering Thermodynamics', author: 'P.K. Nag', category: 'Physics', totalCopies: 9, availableCopies: 6, shelf: 'ME-Floor1-M2', borrowers: [] },
      { id: 8, isbn: '978-1260013900', title: 'Principles of Corporate Finance', author: 'Richard Brealey, Stewart Myers', category: 'Management', totalCopies: 5, availableCopies: 4, shelf: 'BA-Floor4-B1', borrowers: [] }
    ],
    notifications: [
      { id: 1, title: 'Final Exam Timetable Published', time: '10 mins ago', type: 'info', read: false },
      { id: 2, title: 'Attendance Alert: 3 students late in CS301', time: '1 hour ago', type: 'warning', read: false },
      { id: 3, title: 'Alex Morgan submitted B+ Trees Project', time: '2 hours ago', type: 'success', read: false },
      { id: 4, title: 'Campus Wi-Fi Maintenance tonight at 11 PM', time: '5 hours ago', type: 'info', read: true }
    ],
    activities: [
      { id: 1, user: 'Dr. Robert Sterling', action: 'Approved Mid-Term Examination Schedule', time: '20 mins ago', icon: 'fa-check' },
      { id: 2, user: 'Prof. Sarah Jenkins', action: 'Recorded CS301 Attendance for 32 students', time: '1 hour ago', icon: 'fa-clipboard-user' },
      { id: 3, user: 'Alex Morgan', action: 'Submitted Assignment: B+ Trees in C++', time: '2 hours ago', icon: 'fa-file-arrow-up' },
      { id: 4, user: 'Central Library', action: 'Issued Clean Code to Alex Morgan', time: '4 hours ago', icon: 'fa-book' },
      { id: 5, user: 'Dr. Michael Chang', action: 'Updated VLSI Design Laboratory schedule', time: 'Yesterday', icon: 'fa-calendar-days' }
    ]
  };

  function init() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      save(initialData);
    }
  }

  function get() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : JSON.parse(JSON.stringify(initialData));
    } catch (e) {
      console.error('Error loading storage, resetting to defaults', e);
      return JSON.parse(JSON.stringify(initialData));
    }
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    save(initialData);
  }

  init();

  return {
    get,
    save,
    reset,
    initialData
  };
})();

// =============================================================================
// GLOBAL APP CONTROLLER (NAVIGATION, TOASTS, MODALS, SHELL)
// =============================================================================
const CampusApp = (function () {
  let currentUser = null;
  let activePage = 'dashboard';

  function init() {
    bindNavigationEvents();
    bindModalEvents();
    bindGlobalSearch();
    bindNotificationDropdown();
    bindProfileDropdown();
    bindMobileSidebar();
    bindSettingsTabs();
    updateSidebarCounts();
  }

  // Navigation controller
  function navigateTo(pageId) {
    const pages = document.querySelectorAll('.page-view');
    let target = document.getElementById(`page-${pageId}`);
    if (!target) {
      pageId = 'dashboard';
      target = document.getElementById('page-dashboard');
    }

    pages.forEach(p => p.classList.remove('active'));
    target.classList.add('active');
    activePage = pageId;

    // Update sidebar active link
    document.querySelectorAll('.sidebar-menu .nav-link').forEach(link => {
      if (link.getAttribute('data-page') === pageId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close mobile sidebar if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('show')) {
      sidebar.classList.remove('show');
    }

    // Module-specific refresher hooks
    if (pageId === 'dashboard' && window.CampusDashboard) {
      CampusDashboard.render();
    } else if (pageId === 'students' && window.CampusStudents) {
      CampusStudents.render();
    } else if (pageId === 'faculty' && window.CampusFaculty) {
      CampusFaculty.render();
    } else if (pageId === 'attendance' && window.CampusAttendance) {
      CampusAttendance.render();
    } else if (pageId === 'timetable' && window.CampusTimetable) {
      CampusTimetable.render();
    } else if (pageId === 'courses' && window.CampusCourses) {
      CampusCourses.render();
    } else if (pageId === 'assignments' && window.CampusAssignments) {
      CampusAssignments.render();
    } else if (pageId === 'examinations' && window.CampusExaminations) {
      CampusExaminations.render();
    } else if (pageId === 'announcements' && window.CampusAnnouncements) {
      CampusAnnouncements.render();
    } else if (pageId === 'events' && window.CampusEvents) {
      CampusEvents.render();
    } else if (pageId === 'library' && window.CampusLibrary) {
      CampusLibrary.render();
    } else if (pageId === 'reports' && window.CampusReports) {
      CampusReports.render();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function bindNavigationEvents() {
    document.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        const page = this.getAttribute('data-page');
        if (page) navigateTo(page);
      });
    });
  }

  // Toast Notification System
  function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'danger') icon = 'fa-circle-xmark';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `
      <i class="fa-solid ${icon} toast-icon"></i>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
      <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    };

    closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, 4200);
  }

  // Modal Dialog Handlers
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function bindModalEvents() {
    // Buttons with data-close-modal attribute
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', function () {
        const targetId = this.getAttribute('data-close-modal');
        closeModal(targetId);
      });
    });

    // Close on click outside modal content
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', function (e) {
        if (e.target === this) {
          closeModal(this.id);
        }
      });
    });

    // Escape key to close top modal
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) closeModal(activeModal.id);
      }
    });
  }

  // Global Confirmation Dialog
  let confirmCallback = null;
  function confirmDialog(title, message, onConfirm, confirmBtnText = 'Confirm Action', isDanger = true) {
    const modal = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-modal-title');
    const msgEl = document.getElementById('confirm-modal-msg');
    const submitBtn = document.getElementById('confirm-modal-submit-btn');

    if (!modal || !titleEl || !msgEl || !submitBtn) return;

    titleEl.textContent = title;
    msgEl.textContent = message;
    submitBtn.textContent = confirmBtnText;

    if (isDanger) {
      submitBtn.className = 'btn btn-danger';
    } else {
      submitBtn.className = 'btn btn-primary';
    }

    confirmCallback = onConfirm;
    openModal('confirm-modal');
  }

  // Wire confirm button click
  document.addEventListener('DOMContentLoaded', () => {
    const confirmBtn = document.getElementById('confirm-modal-submit-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (typeof confirmCallback === 'function') {
          confirmCallback();
        }
        closeModal('confirm-modal');
      });
    }
  });

  // Global Search Handler (Ctrl+K or input)
  function bindGlobalSearch() {
    const searchInput = document.getElementById('global-search-input');
    if (!searchInput) return;

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });

    searchInput.addEventListener('input', function () {
      const q = this.value.trim().toLowerCase();
      if (!q) return;

      // Smart routing based on keywords
      if (q.includes('stud') || q.includes('reg') || q.includes('alex') || q.includes('priya')) {
        navigateTo('students');
        const stSearch = document.getElementById('student-search-input');
        if (stSearch) { stSearch.value = q; CampusStudents.render(); }
      } else if (q.includes('fac') || q.includes('prof') || q.includes('teach') || q.includes('sterl')) {
        navigateTo('faculty');
        const fcSearch = document.getElementById('faculty-search-input');
        if (fcSearch) { fcSearch.value = q; CampusFaculty.render(); }
      } else if (q.includes('book') || q.includes('lib') || q.includes('algo') || q.includes('clean')) {
        navigateTo('library');
        const bkSearch = document.getElementById('library-search-input');
        if (bkSearch) { bkSearch.value = q; CampusLibrary.render(); }
      } else if (q.includes('exam') || q.includes('grade') || q.includes('result')) {
        navigateTo('examinations');
      } else if (q.includes('time') || q.includes('sched') || q.includes('mon') || q.includes('tue')) {
        navigateTo('timetable');
      }
    });
  }

  // Notifications Popover
  function bindNotificationDropdown() {
    const notifBtn = document.getElementById('notif-toggle-btn');
    const dropdown = document.getElementById('notif-dropdown');
    const markReadBtn = document.getElementById('mark-all-read-btn');
    const openAnnounceLink = document.getElementById('view-all-announcements-link');

    if (!notifBtn || !dropdown) return;

    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
      renderNotifications();
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== notifBtn) {
        dropdown.classList.remove('show');
      }
    });

    if (markReadBtn) {
      markReadBtn.addEventListener('click', () => {
        const data = CampusStore.get();
        data.notifications.forEach(n => n.read = true);
        CampusStore.save(data);
        renderNotifications();
        showToast('Notifications', 'All notifications marked as read', 'success');
      });
    }

    if (openAnnounceLink) {
      openAnnounceLink.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.remove('show');
        navigateTo('announcements');
      });
    }

    renderNotifications();
  }

  function renderNotifications() {
    const container = document.getElementById('notif-list-container');
    const dot = document.getElementById('notif-dot');
    if (!container) return;

    const data = CampusStore.get();
    const notifs = data.notifications || [];
    const unreadCount = notifs.filter(n => !n.read).length;

    if (dot) {
      dot.style.display = unreadCount > 0 ? 'block' : 'none';
    }

    if (notifs.length === 0) {
      container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No notifications right now</div>';
      return;
    }

    container.innerHTML = notifs.map(n => `
      <div class="notification-item ${n.read ? '' : 'unread'}" onclick="CampusApp.markNotificationRead(${n.id})">
        <div class="notif-icon ${n.type}">
          <i class="fa-solid ${n.type === 'success' ? 'fa-check' : n.type === 'warning' ? 'fa-exclamation' : 'fa-bell'}"></i>
        </div>
        <div class="notif-content">
          <div class="notif-title">${n.title}</div>
          <div class="notif-time">${n.time}</div>
        </div>
      </div>
    `).join('');
  }

  function markNotificationRead(id) {
    const data = CampusStore.get();
    const item = data.notifications.find(n => n.id === id);
    if (item) {
      item.read = true;
      CampusStore.save(data);
      renderNotifications();
    }
  }

  // Profile Popover
  function bindProfileDropdown() {
    const profileToggle = document.getElementById('profile-pill-toggle');
    const menu = document.getElementById('profile-menu');
    const logoutBtn = document.getElementById('topbar-logout-btn');
    const sidebarLogoutBtn = document.getElementById('sidebar-logout-btn');

    if (!profileToggle || !menu) return;

    profileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && e.target !== profileToggle) {
        menu.classList.remove('show');
      }
    });

    document.querySelectorAll('[data-action="go-settings"]').forEach(item => {
      item.addEventListener('click', () => {
        menu.classList.remove('show');
        navigateTo('settings');
      });
    });

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        CampusAuth.logout();
      });
    }

    if (sidebarLogoutBtn) {
      sidebarLogoutBtn.addEventListener('click', () => {
        CampusAuth.logout();
      });
    }
  }

  // Mobile sidebar toggle
  function bindMobileSidebar() {
    const toggle = document.getElementById('mobile-sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    if (toggle && sidebar) {
      toggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
      });
    }
  }

  // Settings Tabs & Factory Reset
  function bindSettingsTabs() {
    const tabs = document.querySelectorAll('.settings-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        const target = this.getAttribute('data-tab');
        document.getElementById('settings-tab-general').style.display = target === 'general' ? 'block' : 'none';
        document.getElementById('settings-tab-profile').style.display = target === 'profile' ? 'block' : 'none';
        document.getElementById('settings-tab-system').style.display = target === 'system' ? 'block' : 'none';
      });
    });

    // General campus settings form
    const campusForm = document.getElementById('settings-general-form');
    if (campusForm) {
      campusForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const data = CampusStore.get();
        data.settings.campusName = document.getElementById('setting-campus-name').value;
        data.settings.academicTerm = document.getElementById('setting-academic-term').value;
        data.settings.contactEmail = document.getElementById('setting-contact-email').value;
        data.settings.contactPhone = document.getElementById('setting-contact-phone').value;
        data.settings.campusAddress = document.getElementById('setting-campus-address').value;
        CampusStore.save(data);
        showToast('Campus Settings', 'Campus institutional details successfully updated.', 'success');
      });
    }

    // Profile form
    const profileForm = document.getElementById('settings-profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const newPass = document.getElementById('setting-user-newpass').value;
        const confPass = document.getElementById('setting-user-confirmpass').value;

        if (newPass && newPass !== confPass) {
          showToast('Password Error', 'Passwords do not match.', 'danger');
          return;
        }

        showToast('Profile Updated', 'User credentials saved successfully.', 'success');
        document.getElementById('setting-user-newpass').value = '';
        document.getElementById('setting-user-confirmpass').value = '';
      });
    }

    // Reset button
    const resetBtn = document.getElementById('btn-factory-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        confirmDialog(
          'Reset All Data',
          'Are you sure you want to restore all campus records (students, faculty, attendance, courses, grades) back to demo factory defaults? All changes will be overwritten.',
          () => {
            CampusStore.reset();
            updateSidebarCounts();
            showToast('Factory Reset Completed', 'System initialized with demo dataset.', 'success');
            setTimeout(() => {
              window.location.reload();
            }, 800);
          },
          'Confirm Factory Reset',
          true
        );
      });
    }
  }

  function updateSidebarCounts() {
    const data = CampusStore.get();
    const stCount = document.getElementById('sidebar-student-count');
    const fcCount = document.getElementById('sidebar-faculty-count');
    const crCount = document.getElementById('sidebar-course-count');

    if (stCount) stCount.textContent = (data.students && data.students.length) || '1250';
    if (fcCount) fcCount.textContent = (data.faculty && data.faculty.length) || '85';
    if (crCount) crCount.textContent = (data.courses && data.courses.length) || '32';
  }

  function setCurrentUser(user) {
    currentUser = user;
    applyUserRole(user);
  }

  function applyUserRole(user) {
    if (!user) return;

    // Update avatar initials and titles
    const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
    const topAvatar = document.getElementById('topbar-avatar');
    const sideAvatar = document.getElementById('sidebar-user-avatar');
    const topName = document.getElementById('topbar-name');
    const sideName = document.getElementById('sidebar-user-name');
    const topRole = document.getElementById('topbar-role');
    const sideRole = document.getElementById('sidebar-user-role');

    if (topAvatar) topAvatar.textContent = initials;
    if (sideAvatar) sideAvatar.textContent = initials;
    if (topName) topName.textContent = user.name;
    if (sideName) sideName.textContent = user.name;
    if (topRole) topRole.textContent = user.role.toUpperCase();
    if (sideRole) sideRole.textContent = user.role.toUpperCase();

    // Show/hide role-restricted elements
    document.querySelectorAll('.role-restricted').forEach(el => {
      const allowedRoles = (el.getAttribute('data-roles') || '').split(',');
      if (allowedRoles.includes(user.role)) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Profile settings defaults
    const profileNameInput = document.getElementById('setting-user-fullname');
    const profileEmailInput = document.getElementById('setting-user-email');
    if (profileNameInput) profileNameInput.value = user.name;
    if (profileEmailInput) profileEmailInput.value = user.email;
  }

  return {
    init,
    navigateTo,
    showToast,
    openModal,
    closeModal,
    confirmDialog,
    markNotificationRead,
    updateSidebarCounts,
    setCurrentUser,
    getCurrentUser: () => currentUser
  };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
  CampusApp.init();
});

