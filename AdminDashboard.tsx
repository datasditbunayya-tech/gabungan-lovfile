import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Upload, BarChart3, Users, BookOpen, FileText, Target, ClipboardList, Calendar } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import { useToastContext } from '@/components/Toast';

export function AdminDashboard() {
  const { students, teachers, journals, studentAttendance, teacherAttendance, dailyReports, grades } = useData();
  const { showToast } = useToastContext();
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  
  // Date filter state
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(today);

  // Get unique class names from students
  const classNames = useMemo(() => {
    const uniqueClasses = [...new Set(students.map(s => s.class_name))];
    return uniqueClasses.sort();
  }, [students]);

  // Get unique teacher names
  const teacherNames = useMemo(() => {
    return teachers.map(t => t.nama);
  }, [teachers]);

  // Filter data by date range
  const filteredStudentAttendance = useMemo(() => {
    return studentAttendance.filter(a => a.date >= startDate && a.date <= endDate);
  }, [studentAttendance, startDate, endDate]);

  const filteredTeacherAttendance = useMemo(() => {
    return teacherAttendance.filter(a => a.date >= startDate && a.date <= endDate);
  }, [teacherAttendance, startDate, endDate]);

  const filteredJournals = useMemo(() => {
    return journals.filter(j => j.date >= startDate && j.date <= endDate);
  }, [journals, startDate, endDate]);

  const filteredDailyReports = useMemo(() => {
    return dailyReports.filter(r => r.date >= startDate && r.date <= endDate);
  }, [dailyReports, startDate, endDate]);

  const filteredGrades = useMemo(() => {
    return grades.filter(g => g.date >= startDate && g.date <= endDate);
  }, [grades, startDate, endDate]);

  // Class Attendance by Class (Per Kelas)
  const classAttendanceData = useMemo(() => {
    return classNames.map(className => {
      const classAttendance = filteredStudentAttendance.filter(a => a.class_name === className);
      
      const hadir = classAttendance.filter(a => a.status === 'Hadir').length;
      const sakit = classAttendance.filter(a => a.status === 'Sakit').length;
      const izin = classAttendance.filter(a => a.status === 'Izin').length;
      const alpa = classAttendance.filter(a => a.status === 'Alpa').length;
      
      return {
        name: className,
        hadir,
        sakit,
        izin,
        alpa,
        total: hadir + sakit + izin + alpa
      };
    });
  }, [classNames, filteredStudentAttendance]);

  // Teacher Attendance by Teacher Name (Per Nama Guru)
  const teacherAttendanceData = useMemo(() => {
    return teacherNames.map(teacherName => {
      const teacherAtt = filteredTeacherAttendance.filter(a => a.teacher_name === teacherName);
      
      const hadir = teacherAtt.filter(a => a.status === 'Hadir').length;
      const izin = teacherAtt.filter(a => a.status === 'Izin' || a.status === 'Sakit').length;
      
      return {
        name: teacherName.length > 10 ? teacherName.substring(0, 10) + '...' : teacherName,
        fullName: teacherName,
        hadir,
        izin,
        total: hadir + izin
      };
    });
  }, [teacherNames, filteredTeacherAttendance]);

  // Journal by Teacher Name (Per Nama Guru)
  const journalData = useMemo(() => {
    return teacherNames.map(teacherName => {
      const count = filteredJournals.filter(j => j.teacher_name === teacherName).length;
      return {
        name: teacherName.length > 10 ? teacherName.substring(0, 10) + '...' : teacherName,
        fullName: teacherName,
        jurnal: count
      };
    });
  }, [teacherNames, filteredJournals]);

  // Activity Reports by Class (Per Kelas)
  const activityReportData = useMemo(() => {
    return classNames.map(className => {
      const classReports = filteredDailyReports.filter(r => r.class_name === className);
      
      return {
        name: className,
        laporan: classReports.length,
        lulus: classReports.filter(r => r.result === 'Lulus').length,
        tidakLulus: classReports.filter(r => r.result === 'Tidak Lulus').length
      };
    });
  }, [classNames, filteredDailyReports]);

  // Target Achievement by Class (Per Kelas)
  const targetData = useMemo(() => {
    return classNames.map(className => {
      const classGrades = filteredGrades.filter(g => g.class_name === className);
      
      const avgScore = classGrades.length > 0 
        ? Math.round(classGrades.reduce((sum, g) => sum + g.score, 0) / classGrades.length)
        : 0;
      const lulus = classGrades.filter(g => g.score >= 70).length;
      const tidakLulus = classGrades.filter(g => g.score < 70).length;
      
      return {
        name: className,
        rataRata: avgScore,
        lulus,
        tidakLulus,
        jumlah: classGrades.length
      };
    });
  }, [classNames, filteredGrades]);

  // Daily Reports by Class (Per Kelas)
  const dailyReportData = useMemo(() => {
    return classNames.map(className => {
      const classReports = filteredDailyReports.filter(r => r.class_name === className);
      
      return {
        name: className,
        laporan: classReports.length
      };
    });
  }, [classNames, filteredDailyReports]);

  // Summary stats
  const stats = useMemo(() => {
    return {
      totalSiswa: students.length,
      totalGuru: teachers.length,
      jurnalHariIni: journals.filter(j => j.date === today).length,
      laporanHariIni: dailyReports.filter(r => r.date === today).length,
      hadirHariIni: studentAttendance.filter(a => a.date === today && a.status === 'Hadir').length,
      guruHadirHariIni: teacherAttendance.filter(a => a.date === today && a.status === 'Hadir').length
    };
  }, [students, teachers, journals, dailyReports, studentAttendance, teacherAttendance, today]);

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSchoolLogo(event.target?.result as string);
        showToast('Logo sekolah berhasil diupload!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Custom tooltip for teacher charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const fullName = payload[0]?.payload?.fullName || label;
      return (
        <div className="bg-background p-2 border border-border rounded shadow-lg text-sm">
          <p className="font-semibold">{fullName}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="section-card"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          📊 Dashboard Analytics
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-sm"
            />
            <span className="text-muted-foreground">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-background border border-border rounded px-2 py-1 text-sm"
            />
          </div>
          
          {/* Logo Upload */}
          <div className="flex items-center gap-2">
            {schoolLogo && (
              <img src={schoolLogo} alt="School Logo" className="h-10 w-10 object-contain rounded" />
            )}
            <label className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg cursor-pointer text-sm font-medium transition-colors">
              <Upload className="w-4 h-4" />
              Upload Logo
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-4 text-center border border-blue-200">
          <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold text-blue-600">{stats.totalSiswa}</div>
          <div className="text-xs text-muted-foreground">Total Siswa</div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-4 text-center border border-green-200">
          <Users className="w-6 h-6 mx-auto mb-2 text-green-600" />
          <div className="text-2xl font-bold text-green-600">{stats.totalGuru}</div>
          <div className="text-xs text-muted-foreground">Total Guru</div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-4 text-center border border-purple-200">
          <BookOpen className="w-6 h-6 mx-auto mb-2 text-purple-600" />
          <div className="text-2xl font-bold text-purple-600">{stats.jurnalHariIni}</div>
          <div className="text-xs text-muted-foreground">Jurnal Hari Ini</div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl p-4 text-center border border-orange-200">
          <FileText className="w-6 h-6 mx-auto mb-2 text-orange-600" />
          <div className="text-2xl font-bold text-orange-600">{stats.laporanHariIni}</div>
          <div className="text-xs text-muted-foreground">Laporan Hari Ini</div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-teal-100 to-teal-50 rounded-xl p-4 text-center border border-teal-200">
          <ClipboardList className="w-6 h-6 mx-auto mb-2 text-teal-600" />
          <div className="text-2xl font-bold text-teal-600">{stats.hadirHariIni}</div>
          <div className="text-xs text-muted-foreground">Siswa Hadir</div>
        </motion.div>
        <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl p-4 text-center border border-indigo-200">
          <Target className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
          <div className="text-2xl font-bold text-indigo-600">{stats.guruHadirHariIni}</div>
          <div className="text-xs text-muted-foreground">Guru Hadir</div>
        </motion.div>
      </div>

      {/* Charts Grid - Row 1 */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Class Attendance by Class */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-700">📊 Absensi Siswa (Per Kelas)</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="hadir" name="Hadir" fill="#10b981" stackId="a" />
                <Bar dataKey="sakit" name="Sakit" fill="#f59e0b" stackId="a" />
                <Bar dataKey="izin" name="Izin" fill="#3b82f6" stackId="a" />
                <Bar dataKey="alpa" name="Alpa" fill="#ef4444" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Teacher Attendance by Teacher Name */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-700">👨‍🏫 Absensi Guru (Per Nama)</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teacherAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="hadir" name="Hadir" fill="#10b981" />
                <Bar dataKey="izin" name="Izin/Sakit" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid - Row 2 */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Journal by Teacher Name */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-700">📝 Jurnal Guru (Per Nama)</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={journalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="jurnal" name="Jurnal" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Activity Reports by Class */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-orange-600" />
            <span className="font-semibold text-orange-700">🎯 Laporan Kegiatan (Per Kelas)</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityReportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="lulus" name="Lulus" fill="#10b981" />
                <Bar dataKey="tidakLulus" name="Tidak Lulus" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid - Row 3 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Target Achievement by Class */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-teal-600" />
            <span className="font-semibold text-teal-700">🎯 Target Pencapaian (Per Kelas)</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={targetData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="lulus" name="Lulus" fill="#14b8a6" />
                <Bar dataKey="tidakLulus" name="Tidak Lulus" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Daily Reports by Class */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 border border-rose-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="w-5 h-5 text-rose-600" />
            <span className="font-semibold text-rose-700">📄 Laporan Harian (Per Kelas)</span>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyReportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="laporan" name="Laporan" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
