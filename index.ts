// Portal Pendidikan Bunayya Islamic School - Types

export type UserRole = 'admin' | 'guru' | 'wali';

export interface User {
  username: string;
  role: UserRole;
  name: string;
  studentNis?: string;
  studentName?: string;
  studentClass?: string;
}

export interface Student {
  id: string;
  type: 'master_siswa';
  nis: string;
  nama: string;
  class_name: string;
  created_at?: string;
}

export interface Teacher {
  id: string;
  type: 'master_guru';
  nip: string;
  nama: string;
  email?: string;
  telepon?: string;
  mapel?: string;
  status?: string;
  alamat?: string;
  created_at?: string;
}

export interface StudentAttendance {
  id: string;
  type: 'student_attendance';
  class_name: string;
  student_name: string;
  nis: string;
  date: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
  created_at?: string;
}

export interface TeacherAttendance {
  id: string;
  type: 'teacher_attendance';
  teacher_name: string;
  class_name: string;
  date: string;
  status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa';
  created_at?: string;
}

export interface Journal {
  id: string;
  type: 'journal';
  teacher_name: string;
  date: string;
  class_name: string;
  subject: string;
  topic: string;
  activity: string;
  notes?: string;
  created_at?: string;
}

export interface DailyReport {
  id: string;
  type: 'daily_report';
  class_name: string;
  student_name: string;
  date: string;
  topic: string;
  page?: string;
  result?: string;
  notes?: string;
  created_at?: string;
}

export interface Grade {
  id: string;
  type: 'nilai';
  class_name: string;
  student_name: string;
  subject: string;
  nilai_type: string;
  score: number;
  date: string;
  notes?: string;
  created_at?: string;
}

export interface Event {
  id: string;
  type: 'event';
  name: string;
  start_date: string;
  end_date?: string;
  category: string;
  description?: string;
  created_at?: string;
}

export type PortalType = 'guru' | 'siswa' | 'wali';

export type GuruSection = 
  | 'dashboard' 
  | 'admin-dashboard'
  | 'absensi-siswa' 
  | 'absensi-guru' 
  | 'jurnal' 
  | 'rekap-nilai' 
  | 'cetak-rapor'
  | 'master-guru'
  | 'shortcut-manager'
  | 'google-sheets';

export type SiswaSection = 
  | 'laporan-harian' 
  | 'laporan-kegiatan' 
  | 'target'
  | 'master-siswa';

export const CLASS_OPTIONS = [
  'TK A',
  'TK B', 
  'Kelas 1',
  'Kelas 2',
  'Kelas 3',
  'Kelas 4',
  'Kelas 5',
  'Kelas 6'
];

export const SUBJECT_OPTIONS = [
  'IQRO',
  'TAHFIDZ',
  'MAKHORIJUL KHURUF',
  'HAFALAN HADIST HARIAN',
  'HAFALAN DOA HARIAN',
  'HAFALAN DOA SHOLAT',
  'PRAKTEK AQIDAH DAN AKHLAQ',
  'AKHLAQ',
  'NAHWU',
  'BELAJAR HURUF ABJAD',
  'BELAJAR ANGKA',
  'BAHASA ARAB',
  'BAHASA INGGRIS',
  'MATEMATIKA',
  'IPAS',
  'BAHASA INDONESIA',
  'PKN',
  'PJOK',
  'SENI BUDAYA',
  'LAINNYA'
];

export const ATTENDANCE_STATUS = [
  { value: 'Hadir', label: '✓ Hadir', color: 'bg-primary' },
  { value: 'Sakit', label: '🤒 Sakit', color: 'bg-secondary' },
  { value: 'Izin', label: '📝 Izin', color: 'bg-accent' },
  { value: 'Alpa', label: '✗ Alpa', color: 'bg-destructive' }
];
