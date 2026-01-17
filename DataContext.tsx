import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Student, Teacher, Journal, StudentAttendance, TeacherAttendance, DailyReport, Grade, Event } from '@/types';

// Mock data
const mockStudents: Student[] = [
  // Kelas 6
  { id: '232', type: 'master_siswa', nis: '232', nama: 'AKMA NAUFAL MAHADAN', class_name: 'Kelas 6' },
  { id: '233', type: 'master_siswa', nis: '233', nama: 'QONITA ISMAN TAQIYYA', class_name: 'Kelas 6' },
  { id: '234', type: 'master_siswa', nis: '234', nama: 'Khairunnisa Azka Zafira', class_name: 'Kelas 6' },
  { id: '287', type: 'master_siswa', nis: '287', nama: 'MUHAMMAD AL-FATIH', class_name: 'Kelas 6' },
  { id: '290', type: 'master_siswa', nis: '290', nama: 'Guru Admin', class_name: 'Kelas 6' },
  // Kelas 5
  { id: '201', type: 'master_siswa', nis: '201', nama: 'Aisyah Humairo Annur', class_name: 'Kelas 5' },
  { id: '202', type: 'master_siswa', nis: '202', nama: 'Faiza Alya Azizah', class_name: 'Kelas 5' },
  { id: '203', type: 'master_siswa', nis: '203', nama: 'Muhammad Arkaan Mubarrok Hutapea', class_name: 'Kelas 5' },
  { id: '204', type: 'master_siswa', nis: '204', nama: 'Rayzaka Azhari', class_name: 'Kelas 5' },
  { id: '231', type: 'master_siswa', nis: '231', nama: 'ABRISAM KAMIL DEPATI', class_name: 'Kelas 5' },
  // Kelas 4
  { id: '205', type: 'master_siswa', nis: '205', nama: 'AHMAD ZAEN MALEEQ', class_name: 'Kelas 4' },
  { id: '206', type: 'master_siswa', nis: '206', nama: 'ANWAR SHOFWAN ROMADHON', class_name: 'Kelas 4' },
  { id: '207', type: 'master_siswa', nis: '207', nama: 'EARLYTA SARLINA SALSABILA', class_name: 'Kelas 4' },
  { id: '208', type: 'master_siswa', nis: '208', nama: 'JIBRIL UBAIDILLAH ASSUWAYYID', class_name: 'Kelas 4' },
  { id: '209', type: 'master_siswa', nis: '209', nama: 'MUHAMMAD DIRGA AZANI', class_name: 'Kelas 4' },
  { id: '210', type: 'master_siswa', nis: '210', nama: 'OKSA TIARA ASY SYIFA', class_name: 'Kelas 4' },
  { id: '211', type: 'master_siswa', nis: '211', nama: 'REVANI PRITA AGUSTIN', class_name: 'Kelas 4' },
  { id: '212', type: 'master_siswa', nis: '212', nama: 'ZAYYAN YUSRON KAMIL', class_name: 'Kelas 4' },
  { id: '288', type: 'master_siswa', nis: '288', nama: 'ZAKARIA', class_name: 'Kelas 4' },
  // Kelas 3
  { id: '214', type: 'master_siswa', nis: '214', nama: 'Anindiya Hafizah Az-Zahra', class_name: 'Kelas 3' },
  { id: '215', type: 'master_siswa', nis: '215', nama: 'Dyna Salsabila', class_name: 'Kelas 3' },
  { id: '216', type: 'master_siswa', nis: '216', nama: 'Hanifa Zahratusita', class_name: 'Kelas 3' },
  { id: '217', type: 'master_siswa', nis: '217', nama: 'Raziq Zakir Azhari', class_name: 'Kelas 3' },
  { id: '219', type: 'master_siswa', nis: '219', nama: 'Shiha Rasyih Al-Fatih', class_name: 'Kelas 3' },
  { id: '220', type: 'master_siswa', nis: '220', nama: 'Afika Inara Zanati', class_name: 'Kelas 3' },
  // Kelas 2
  { id: '221', type: 'master_siswa', nis: '221', nama: 'Abid Zakki Hafiz Maulana', class_name: 'Kelas 2' },
  { id: '222', type: 'master_siswa', nis: '222', nama: 'Alfian Izzam Pranata', class_name: 'Kelas 2' },
  { id: '223', type: 'master_siswa', nis: '223', nama: 'Arha Bira Rajabi', class_name: 'Kelas 2' },
  { id: '224', type: 'master_siswa', nis: '224', nama: 'Askhana Sakhi Fitriyani', class_name: 'Kelas 2' },
  { id: '225', type: 'master_siswa', nis: '225', nama: 'Hanif Raffasya Sofian', class_name: 'Kelas 2' },
  { id: '226', type: 'master_siswa', nis: '226', nama: 'M Habib Al Fatih', class_name: 'Kelas 2' },
  { id: '227', type: 'master_siswa', nis: '227', nama: 'Muhammad Rifki Aryatama', class_name: 'Kelas 2' },
  { id: '228', type: 'master_siswa', nis: '228', nama: 'Taqiyuddin Annur', class_name: 'Kelas 2' },
  { id: '229', type: 'master_siswa', nis: '229', nama: 'Gibran Arya Jaya', class_name: 'Kelas 2' },
  // Kelas 1
  { id: '119', type: 'master_siswa', nis: '119', nama: 'Abdurrahman Alhafidz Aribowo', class_name: 'Kelas 1' },
  { id: '122', type: 'master_siswa', nis: '122', nama: 'Aghniya Khoirunnisa Depati', class_name: 'Kelas 1' },
  { id: '125', type: 'master_siswa', nis: '125', nama: 'Alisya Fitriyatul Muna', class_name: 'Kelas 1' },
  { id: '130', type: 'master_siswa', nis: '130', nama: 'Razqia Nurma Azhari', class_name: 'Kelas 1' },
  { id: '133', type: 'master_siswa', nis: '133', nama: 'Gibran Aqsan Asyraf', class_name: 'Kelas 1' },
  { id: '140', type: 'master_siswa', nis: '140', nama: 'Muhammad Riza Hanafi', class_name: 'Kelas 1' },
  { id: '145', type: 'master_siswa', nis: '145', nama: 'Fika Amira Ramadhani', class_name: 'Kelas 1' },
  { id: '160', type: 'master_siswa', nis: '160', nama: 'Aretha Cyra Faaiza', class_name: 'Kelas 1' },
  { id: '170', type: 'master_siswa', nis: '170', nama: 'Kartika Putri', class_name: 'Kelas 1' },
  { id: '175', type: 'master_siswa', nis: '175', nama: 'Muhammad Husain Al Ibsya', class_name: 'Kelas 1' },
  { id: '179', type: 'master_siswa', nis: '179', nama: 'Zaskia Khoirunnisa', class_name: 'Kelas 1' },
  // TK B
  { id: '154', type: 'master_siswa', nis: '154', nama: 'Ahmad Karim', class_name: 'TK B' },
  { id: '156', type: 'master_siswa', nis: '156', nama: 'Alesya Alfathunisa', class_name: 'TK B' },
  { id: '157', type: 'master_siswa', nis: '157', nama: 'Alfahri Abdurrahman', class_name: 'TK B' },
  { id: '158', type: 'master_siswa', nis: '158', nama: 'Andra Keano Wicaksono', class_name: 'TK B' },
  { id: '159', type: 'master_siswa', nis: '159', nama: 'Aqila Nurfadilah', class_name: 'TK B' },
  { id: '162', type: 'master_siswa', nis: '162', nama: 'Arli Hafizh Yulianto', class_name: 'TK B' },
  { id: '163', type: 'master_siswa', nis: '163', nama: 'Arsyila Nayla', class_name: 'TK B' },
  { id: '168', type: 'master_siswa', nis: '168', nama: 'Kalila Rifda Al Aqsha', class_name: 'TK B' },
  { id: '169', type: 'master_siswa', nis: '169', nama: 'Kanza Asheeqa Jali', class_name: 'TK B' },
  { id: '173', type: 'master_siswa', nis: '173', nama: 'M. Zidane Repiansyah', class_name: 'TK B' },
  { id: '174', type: 'master_siswa', nis: '174', nama: 'Misha Shaquena Almahyra', class_name: 'TK B' },
  { id: '176', type: 'master_siswa', nis: '176', nama: 'Muhammad Zakir Saka', class_name: 'TK B' },
  { id: '177', type: 'master_siswa', nis: '177', nama: 'Nayyara Mehrunisa', class_name: 'TK B' },
  { id: '180', type: 'master_siswa', nis: '180', nama: 'Muhammad Faiz Alfarizi', class_name: 'TK B' },
  { id: '236', type: 'master_siswa', nis: '236', nama: 'Abdurrahman Nizam', class_name: 'TK B' },
  { id: '240', type: 'master_siswa', nis: '240', nama: 'Arunika Banafsha Khaira', class_name: 'TK B' },
  { id: '241', type: 'master_siswa', nis: '241', nama: 'Fathim Hafizah Ahmad', class_name: 'TK B' },
  { id: '242', type: 'master_siswa', nis: '242', nama: 'Fauzia Naura Mikayla', class_name: 'TK B' },
  { id: '247', type: 'master_siswa', nis: '247', nama: 'Muhammad Attaqi Surya', class_name: 'TK B' },
  { id: '248', type: 'master_siswa', nis: '248', nama: 'Muhammad Ghufran Kusuma', class_name: 'TK B' },
  { id: '254', type: 'master_siswa', nis: '254', nama: 'Yusuf Fathlani Avicena', class_name: 'TK B' },
  { id: '274', type: 'master_siswa', nis: '274', nama: 'Khaizuran Mizyan', class_name: 'TK B' },
  { id: '278', type: 'master_siswa', nis: '278', nama: 'Muhammad Alfarizi Abyan', class_name: 'TK B' },
  { id: '279', type: 'master_siswa', nis: '279', nama: 'Kautsarrazky Satria Omar Arkanza', class_name: 'TK B' },
  { id: '283', type: 'master_siswa', nis: '283', nama: 'Risqiana Murni Sunjaya', class_name: 'TK B' },
  { id: '285', type: 'master_siswa', nis: '285', nama: 'Zaenab', class_name: 'TK B' },
  // TK A
  { id: '171', type: 'master_siswa', nis: '171', nama: 'Khairin Shaquilla Diza', class_name: 'TK A' },
  { id: '235', type: 'master_siswa', nis: '235', nama: 'ABDULLAH KASYAFANI DEPATI', class_name: 'TK A' },
  { id: '237', type: 'master_siswa', nis: '237', nama: 'Abid Ar Rasyid Riyadi', class_name: 'TK A' },
  { id: '238', type: 'master_siswa', nis: '238', nama: 'Ahmad Alsyad Jauhari', class_name: 'TK A' },
  { id: '239', type: 'master_siswa', nis: '239', nama: 'Aira Anindira Zalfa', class_name: 'TK A' },
  { id: '243', type: 'master_siswa', nis: '243', nama: 'Hifza Rafifah Fitri', class_name: 'TK A' },
  { id: '244', type: 'master_siswa', nis: '244', nama: 'Izzam Gasani', class_name: 'TK A' },
  { id: '245', type: 'master_siswa', nis: '245', nama: 'M. Zyandru Al Ghilzah Andriyanto', class_name: 'TK A' },
  { id: '246', type: 'master_siswa', nis: '246', nama: 'Muhammad Akhmar Al Ghifari', class_name: 'TK A' },
  { id: '249', type: 'master_siswa', nis: '249', nama: 'Muhammad Ihsan Al Fatih', class_name: 'TK A' },
  { id: '251', type: 'master_siswa', nis: '251', nama: 'Rayyan Alfarizqi Adhiyaksa', class_name: 'TK A' },
  { id: '253', type: 'master_siswa', nis: '253', nama: 'Tafasya Mauza Khadijah', class_name: 'TK A' },
  { id: '255', type: 'master_siswa', nis: '255', nama: 'Zulaikha Qalesya Putri', class_name: 'TK A' },
  { id: '273', type: 'master_siswa', nis: '273', nama: 'Adnan Gaffar Al-Farizqi', class_name: 'TK A' },
  { id: '275', type: 'master_siswa', nis: '275', nama: 'Farel Rafisqi Anwar', class_name: 'TK A' },
  { id: '276', type: 'master_siswa', nis: '276', nama: 'Atha Hafiz Alfarezi', class_name: 'TK A' },
  { id: '280', type: 'master_siswa', nis: '280', nama: 'Rafardhan Rafa Kusuma', class_name: 'TK A' },
  { id: '281', type: 'master_siswa', nis: '281', nama: 'Firda Azkayra Ramadani', class_name: 'TK A' },
  { id: '282', type: 'master_siswa', nis: '282', nama: 'Faisal Ramadhan Syahputra', class_name: 'TK A' },
  { id: '284', type: 'master_siswa', nis: '284', nama: 'Nadifa Ashadiya Kirani', class_name: 'TK A' },
  { id: '286', type: 'master_siswa', nis: '286', nama: 'Habibah Fadillah Hilyah', class_name: 'TK A' },
  { id: '289', type: 'master_siswa', nis: '289', nama: 'Tolhah Annur', class_name: 'TK A' },
];

const mockTeachers: Teacher[] = [
  { id: 'T001', type: 'master_guru', nip: 'T001', nama: 'Nurochman', email: 'rohmane@gmail.com', telepon: '81274444498', mapel: 'KELAS 5', status: 'Aktif', alamat: 'PANARAGAN JAYA RT 5 RW 2' },
  { id: 'T002', type: 'master_guru', nip: 'T002', nama: 'Hasnal Labibah', email: 'hasnal131@admin.paud.belajar.id', telepon: '81274444498', mapel: 'KEPALA SEKOLAH', status: 'Aktif', alamat: 'PANARAGAN JAYA RT 5 RW 2' },
  { id: 'T003', type: 'master_guru', nip: 'T003', nama: 'Nilayana', email: 'nilayana96@gmail.com', telepon: '+62 877-6324-0377', mapel: 'TK A', status: 'Aktif', alamat: 'PANARAGAN JAYA' },
  { id: 'T004', type: 'master_guru', nip: 'T004', nama: 'Tri Amelia', email: 'triamelia794@gmail.com', telepon: '+62 853-7951-3552', mapel: 'KELAS 3', status: 'Aktif' },
  { id: 'T005', type: 'master_guru', nip: 'T005', nama: 'Anggun Fajarwati', email: 'anggunfajarw@gmail.com', telepon: '+62 858-0520-4367', mapel: 'KELAS 2', status: 'Aktif' },
  { id: 'T006', type: 'master_guru', nip: 'T006', nama: 'Bhika Pratami', email: 'bhikapratami987@gmail.com', telepon: '+62 857-8947-1408', mapel: 'TK B', status: 'Aktif' },
  { id: 'T007', type: 'master_guru', nip: 'T007', nama: 'Latifah', email: 'samiati010224@gmail.com', telepon: '+62 823-5256-4989', mapel: 'TK B', status: 'Aktif' },
  { id: 'T008', type: 'master_guru', nip: 'T008', nama: 'Alfi Amelia', email: 'amaliaalfi63@gmail.com', telepon: '+62 858-4050-9114', mapel: 'TK B', status: 'Aktif' },
  { id: 'T009', type: 'master_guru', nip: 'T009', nama: 'Ismia Rahma Faradisa', email: 'ismiarahmafaradisa@gmail.com', telepon: '+62 821-8092-8781', mapel: 'WALI KELAS', status: 'Aktif', alamat: 'a' },
  { id: 'T010', type: 'master_guru', nip: 'T010', nama: 'Sulistiyono', email: 'sulistiyono.abusalwa@gmail.com', telepon: '+62 852-7310-7272', mapel: 'KELAS 4', status: 'Aktif' },
  { id: 'T011', type: 'master_guru', nip: 'T011', nama: 'Bhika Lasmono', email: 'bhikalasmono96@pendidkankesetaraan.belajar.id', telepon: '0856-5891-7882', mapel: 'KEPALA SEKOLAH', status: 'Aktif' },
  { id: 'T012', type: 'master_guru', nip: 'T012', nama: 'Mutia Pusparani', email: 'mutiarani9988@gmail.com', telepon: '0856-5891-7882', mapel: 'KELAS 1', status: 'Aktif' },
  { id: 'T013', type: 'master_guru', nip: 'T013', nama: 'Guru admin', email: 'datasditbunayya@gmail.com', telepon: '81274444498', mapel: 'WALI KELAS', status: 'Aktif' },
];

const mockJournals: Journal[] = [
  { id: '1', type: 'journal', teacher_name: 'Nurochman', date: new Date().toISOString().split('T')[0], class_name: 'Kelas 5', subject: 'TAHFIDZ', topic: 'Surat Al-Mulk Ayat 1-10', activity: 'Menghafal dan muroja\'ah surat Al-Mulk', created_at: new Date().toISOString() },
  { id: '2', type: 'journal', teacher_name: 'Tri Amelia', date: new Date().toISOString().split('T')[0], class_name: 'Kelas 3', subject: 'BAHASA INDONESIA', topic: 'Membaca dan Menulis', activity: 'Latihan membaca cerita pendek', created_at: new Date().toISOString() },
  { id: '3', type: 'journal', teacher_name: 'Sulistiyono', date: new Date().toISOString().split('T')[0], class_name: 'Kelas 4', subject: 'MATEMATIKA', topic: 'Perkalian dan Pembagian', activity: 'Latihan soal perkalian 2 digit', created_at: new Date().toISOString() },
];

const mockAttendance: StudentAttendance[] = [
  { id: '1', type: 'student_attendance', class_name: 'Kelas 5', student_name: 'Aisyah Humairo Annur', nis: '201', date: new Date().toISOString().split('T')[0], status: 'Hadir' },
  { id: '2', type: 'student_attendance', class_name: 'Kelas 5', student_name: 'Faiza Alya Azizah', nis: '202', date: new Date().toISOString().split('T')[0], status: 'Hadir' },
  { id: '3', type: 'student_attendance', class_name: 'Kelas 5', student_name: 'Muhammad Arkaan Mubarrok Hutapea', nis: '203', date: new Date().toISOString().split('T')[0], status: 'Hadir' },
  { id: '4', type: 'student_attendance', class_name: 'Kelas 4', student_name: 'AHMAD ZAEN MALEEQ', nis: '205', date: new Date().toISOString().split('T')[0], status: 'Hadir' },
  { id: '5', type: 'student_attendance', class_name: 'Kelas 3', student_name: 'Anindiya Hafizah Az-Zahra', nis: '214', date: new Date().toISOString().split('T')[0], status: 'Sakit' },
];

interface DataContextType {
  students: Student[];
  teachers: Teacher[];
  journals: Journal[];
  studentAttendance: StudentAttendance[];
  teacherAttendance: TeacherAttendance[];
  dailyReports: DailyReport[];
  grades: Grade[];
  events: Event[];
  isConnected: boolean;
  addStudent: (student: Omit<Student, 'id' | 'type'>) => void;
  addTeacher: (teacher: Omit<Teacher, 'id' | 'type'>) => void;
  addJournal: (journal: Omit<Journal, 'id' | 'type'>) => void;
  addStudentAttendance: (attendance: Omit<StudentAttendance, 'id' | 'type'>[]) => void;
  addTeacherAttendance: (attendance: Omit<TeacherAttendance, 'id' | 'type'>) => void;
  addDailyReport: (report: Omit<DailyReport, 'id' | 'type'>) => void;
  addGrade: (grade: Omit<Grade, 'id' | 'type'>) => void;
  getStudentsByClass: (className: string) => Student[];
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [journals, setJournals] = useState<Journal[]>(mockJournals);
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>(mockAttendance);
  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendance[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isConnected] = useState(true);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addStudent = (student: Omit<Student, 'id' | 'type'>) => {
    setStudents(prev => [...prev, { ...student, id: generateId(), type: 'master_siswa', created_at: new Date().toISOString() }]);
  };

  const addTeacher = (teacher: Omit<Teacher, 'id' | 'type'>) => {
    setTeachers(prev => [...prev, { ...teacher, id: generateId(), type: 'master_guru', created_at: new Date().toISOString() }]);
  };

  const addJournal = (journal: Omit<Journal, 'id' | 'type'>) => {
    setJournals(prev => [...prev, { ...journal, id: generateId(), type: 'journal', created_at: new Date().toISOString() }]);
  };

  const addStudentAttendance = (attendanceList: Omit<StudentAttendance, 'id' | 'type'>[]) => {
    const newAttendance = attendanceList.map(a => ({
      ...a,
      id: generateId(),
      type: 'student_attendance' as const,
      created_at: new Date().toISOString()
    }));
    setStudentAttendance(prev => [...prev, ...newAttendance]);
  };

  const addTeacherAttendance = (attendance: Omit<TeacherAttendance, 'id' | 'type'>) => {
    setTeacherAttendance(prev => [...prev, { ...attendance, id: generateId(), type: 'teacher_attendance', created_at: new Date().toISOString() }]);
  };

  const addDailyReport = (report: Omit<DailyReport, 'id' | 'type'>) => {
    setDailyReports(prev => [...prev, { ...report, id: generateId(), type: 'daily_report', created_at: new Date().toISOString() }]);
  };

  const addGrade = (grade: Omit<Grade, 'id' | 'type'>) => {
    setGrades(prev => [...prev, { ...grade, id: generateId(), type: 'nilai', created_at: new Date().toISOString() }]);
  };

  const getStudentsByClass = (className: string) => {
    return students.filter(s => s.class_name === className);
  };

  const refreshData = () => {
    // In real app, this would fetch from API
    console.log('Data refreshed');
  };

  return (
    <DataContext.Provider value={{
      students,
      teachers,
      journals,
      studentAttendance,
      teacherAttendance,
      dailyReports,
      grades,
      events,
      isConnected,
      addStudent,
      addTeacher,
      addJournal,
      addStudentAttendance,
      addTeacherAttendance,
      addDailyReport,
      addGrade,
      getStudentsByClass,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
