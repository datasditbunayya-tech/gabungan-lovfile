import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { CLASS_OPTIONS } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { NotificationBell } from './NotificationBell';
import { exportToPDF } from '@/utils/exportUtils';
import { useToastContext } from '@/components/Toast';

export function PortalWali() {
  const { user } = useAuth();
  const { students, studentAttendance, grades, dailyReports } = useData();
  const { showToast } = useToastContext();

  const [selectedClass, setSelectedClass] = useState(user?.studentClass || '');
  const [selectedStudent, setSelectedStudent] = useState(user?.studentName || '');
  const [activeTab, setActiveTab] = useState('laporan-harian');

  // PDF Export function
  const handleExportPDF = () => {
    if (!selectedStudent || !stats) {
      showToast('Pilih siswa terlebih dahulu', 'error');
      return;
    }

    // Create comprehensive PDF with jsPDF
    const doc = new (window as any).jspdf.jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('BUNAYYA ISLAMIC SCHOOL', 105, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('Laporan Perkembangan Siswa', 105, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Nama Siswa: ${selectedStudent}`, 14, 40);
    doc.text(`Kelas: ${selectedClass}`, 14, 48);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 56);

    // Summary Stats
    doc.setFontSize(11);
    doc.text(`Total Laporan: ${stats.totalReports} | Lulus: ${stats.kelulusan.lulus} | Tidak Lulus: ${stats.kelulusan.tidakLulus}`, 14, 68);
    doc.text(`Kehadiran: ${stats.attendancePercentage}% (Hadir: ${stats.attendance.hadir}, Sakit: ${stats.attendance.sakit}, Izin: ${stats.attendance.izin}, Alpa: ${stats.attendance.alpa})`, 14, 76);

    // Reports Table
    const reportsData = {
      headers: ['Tanggal', 'Topik', 'Hasil', 'Catatan'],
      rows: studentReports.slice(-20).map(r => [r.date, r.topic || '-', r.result || '-', (r.notes || '-').substring(0, 30)]),
      title: 'Laporan Perkembangan Siswa',
      filename: `laporan_${selectedStudent.replace(/\s+/g, '_')}`,
    };

    exportToPDF(reportsData, selectedStudent);
    showToast('Laporan PDF berhasil didownload!', 'success');
  };

  // If logged in as specific parent, lock to their child
  const isLocked = !!user?.studentNis;

  useEffect(() => {
    if (user?.studentClass) setSelectedClass(user.studentClass);
    if (user?.studentName) setSelectedStudent(user.studentName);
  }, [user]);

  const classStudents = students.filter(s => s.class_name === selectedClass);

  // Get student data
  const studentData = students.find(s => s.nama === selectedStudent);
  const studentGrades = grades.filter(g => g.student_name === selectedStudent);
  const studentAttendanceData = studentAttendance.filter(a => a.student_name === selectedStudent);
  const studentReports = dailyReports.filter(r => r.student_name === selectedStudent);

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    if (!selectedStudent) return null;

    // Attendance stats
    const attendanceStats = {
      hadir: studentAttendanceData.filter(a => a.status === 'Hadir').length,
      sakit: studentAttendanceData.filter(a => a.status === 'Sakit').length,
      izin: studentAttendanceData.filter(a => a.status === 'Izin').length,
      alpa: studentAttendanceData.filter(a => a.status === 'Alpa').length,
    };
    const totalAttendance = Object.values(attendanceStats).reduce((a, b) => a + b, 0);
    const attendancePercentage = totalAttendance > 0 
      ? Math.round((attendanceStats.hadir / totalAttendance) * 100)
      : 0;

    // Grades by subject
    const gradesBySubject: Record<string, { total: number; count: number; scores: number[] }> = {};
    studentGrades.forEach(g => {
      if (!gradesBySubject[g.subject]) {
        gradesBySubject[g.subject] = { total: 0, count: 0, scores: [] };
      }
      gradesBySubject[g.subject].total += g.score;
      gradesBySubject[g.subject].count += 1;
      gradesBySubject[g.subject].scores.push(g.score);
    });

    // Average grade
    const totalGrades = studentGrades.length;
    const avgGrade = totalGrades > 0 
      ? Math.round(studentGrades.reduce((sum, g) => sum + g.score, 0) / totalGrades)
      : 0;

    // Kelulusan stats from daily reports
    const lulusCount = studentReports.filter(r => r.result === 'Lulus').length;
    const tidakLulusCount = studentReports.filter(r => r.result === 'Tidak Lulus').length;
    const perbaikanCount = studentReports.filter(r => r.result === 'Perlu Perbaikan').length;
    const totalReports = lulusCount + tidakLulusCount + perbaikanCount;

    // Weekly activity
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyReports = studentReports.filter(r => new Date(r.date) >= weekAgo);

    // Category count
    const categoryCount: Record<string, number> = {};
    studentReports.forEach(r => {
      const cat = r.topic?.split(' ')[0] || 'Lainnya';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    // Progress targets (based on grades)
    const progressTargets = Object.entries(gradesBySubject).map(([subject, data]) => ({
      subject,
      progress: Math.min(100, Math.round((data.total / data.count))),
      target: 100
    }));

    return {
      attendance: attendanceStats,
      totalAttendance,
      attendancePercentage,
      gradesBySubject,
      totalGrades,
      avgGrade,
      kelulusan: { lulus: lulusCount, tidakLulus: tidakLulusCount, perbaikan: perbaikanCount },
      totalReports,
      weeklyActivity: weeklyReports.length,
      categoryCount,
      progressTargets,
      recentReports: studentReports.slice(-5).reverse(),
    };
  }, [selectedStudent, studentGrades, studentAttendanceData, studentReports]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="section-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            👨‍👩‍👧‍👦 Pantau Perkembangan Anak
          </h2>
          <div className="flex items-center gap-3">
            <NotificationBell studentName={selectedStudent} />
          </div>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-blue-600 mb-2">Pilih Kelas</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedStudent('');
              }}
              disabled={isLocked}
              className="input-field disabled:opacity-50 bg-card"
            >
              <option value="">Pilih Kelas</option>
              {CLASS_OPTIONS.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-600 mb-2">Pilih Nama Siswa</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              disabled={isLocked || !selectedClass}
              className="input-field disabled:opacity-50 bg-card"
            >
              <option value="">Pilih Siswa</option>
              {classStudents.map(s => (
                <option key={s.nis} value={s.nama}>{s.nama} ({s.nis})</option>
              ))}
            </select>
          </div>
        </div>

        {selectedStudent && stats && (
          <>
            {/* Summary Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-4 text-center border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">{stats.totalReports}</div>
                <div className="text-sm text-muted-foreground">Total Laporan</div>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-4 text-center border border-green-200">
                <div className="text-3xl font-bold text-green-600">{stats.kelulusan.lulus}</div>
                <div className="text-sm text-muted-foreground">Lulus</div>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-red-100 to-red-50 rounded-xl p-4 text-center border border-red-200">
                <div className="text-3xl font-bold text-red-500">{stats.kelulusan.tidakLulus}</div>
                <div className="text-sm text-muted-foreground">Tidak Lulus</div>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-4 text-center border border-purple-200">
                <div className="text-3xl font-bold text-purple-600">{stats.progressTargets.length}</div>
                <div className="text-sm text-muted-foreground">Target Aktif</div>
              </motion.div>
            </div>

            {/* Charts Grid - Row 1 */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {/* Kehadiran Bulanan - Bar Chart */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📊</span>
                  <span className="text-sm font-semibold text-emerald-700">Kehadiran Bulanan</span>
                </div>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Hadir', value: stats.attendance.hadir, fill: '#10b981' },
                      { name: 'Sakit', value: stats.attendance.sakit, fill: '#f59e0b' },
                      { name: 'Izin', value: stats.attendance.izin, fill: '#3b82f6' },
                      { name: 'Alpa', value: stats.attendance.alpa, fill: '#ef4444' },
                    ]}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {[
                          { name: 'Hadir', value: stats.attendance.hadir, fill: '#10b981' },
                          { name: 'Sakit', value: stats.attendance.sakit, fill: '#f59e0b' },
                          { name: 'Izin', value: stats.attendance.izin, fill: '#3b82f6' },
                          { name: 'Alpa', value: stats.attendance.alpa, fill: '#ef4444' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Rasio Kelulusan - Pie Chart */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">✅</span>
                  <span className="text-sm font-semibold text-green-700">Rasio Kelulusan</span>
                </div>
                <div className="h-36">
                  {stats.totalReports > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Lulus', value: stats.kelulusan.lulus, fill: '#10b981' },
                            { name: 'Perbaikan', value: stats.kelulusan.perbaikan, fill: '#f59e0b' },
                            { name: 'Tidak Lulus', value: stats.kelulusan.tidakLulus, fill: '#ef4444' },
                          ].filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={50}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {[
                            { name: 'Lulus', value: stats.kelulusan.lulus, fill: '#10b981' },
                            { name: 'Perbaikan', value: stats.kelulusan.perbaikan, fill: '#f59e0b' },
                            { name: 'Tidak Lulus', value: stats.kelulusan.tidakLulus, fill: '#ef4444' },
                          ].filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      Belum ada data kelulusan
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Nilai per Mapel - Bar Chart */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-4 border border-violet-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📈</span>
                  <span className="text-sm font-semibold text-violet-700">Nilai per Mapel</span>
                </div>
                <div className="h-36">
                  {Object.keys(stats.gradesBySubject).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(stats.gradesBySubject).map(([subject, data]) => ({
                          name: subject.substring(0, 6),
                          nilai: Math.round(data.total / data.count),
                          fullName: subject
                        }))}
                        layout="vertical"
                      >
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={50} />
                        <Tooltip formatter={(value, name, props) => [value, props.payload.fullName]} />
                        <Bar dataKey="nilai" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      Belum ada nilai
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Charts Grid - Row 2 */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {/* Progress Target */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🎯</span>
                  <span className="text-sm font-semibold text-teal-700">Progress Target</span>
                </div>
                <div className="h-36 overflow-y-auto">
                  {stats.progressTargets.length > 0 ? (
                    <div className="space-y-3">
                      {stats.progressTargets.slice(0, 4).map((target, idx) => (
                        <div key={idx}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground truncate max-w-[70%]">{target.subject}</span>
                            <span className="font-medium text-teal-700">{target.progress}%</span>
                          </div>
                          <div className="w-full bg-teal-200 rounded-full h-2">
                            <div 
                              className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${target.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      Belum ada target
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Aktivitas Mingguan */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📅</span>
                  <span className="text-sm font-semibold text-amber-700">Aktivitas Mingguan</span>
                </div>
                <div className="h-36 flex flex-col items-center justify-center">
                  {stats.weeklyActivity > 0 ? (
                    <>
                      <div className="text-5xl font-bold text-amber-600 mb-2">{stats.weeklyActivity}</div>
                      <p className="text-sm text-amber-700">aktivitas minggu ini</p>
                      <div className="mt-2 w-full bg-amber-200 rounded-full h-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, stats.weeklyActivity * 14.3)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Target: 7 aktivitas/minggu</p>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center">
                      Belum ada aktivitas minggu ini
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Kategori Kegiatan */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 border border-rose-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">📚</span>
                  <span className="text-sm font-semibold text-rose-700">Kategori Kegiatan</span>
                </div>
                <div className="h-36">
                  {Object.keys(stats.categoryCount).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={Object.entries(stats.categoryCount).map(([name, value], idx) => ({
                            name,
                            value,
                            fill: ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6'][idx % 5]
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={50}
                          dataKey="value"
                          label={({ name, percent }) => `${name.substring(0, 4)} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {Object.entries(stats.categoryCount).map(([name, value], idx) => (
                            <Cell 
                              key={`cell-${idx}`} 
                              fill={['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6'][idx % 5]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      Belum ada kegiatan
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Quick Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button 
                onClick={() => setActiveTab('laporan-harian')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'laporan-harian' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📝 Laporan Harian
              </button>
              <button 
                onClick={() => setActiveTab('laporan-kegiatan')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'laporan-kegiatan' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎯 Laporan Kegiatan
              </button>
              <button 
                onClick={() => setActiveTab('nilai')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'nilai' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Nilai
              </button>
              <button 
                onClick={() => setActiveTab('target')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'target' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎯 Target
              </button>
              <button 
                onClick={() => setActiveTab('absensi')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'absensi' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 Absensi
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-muted/30 rounded-xl p-5">
              {/* Laporan Harian Tab */}
              {activeTab === 'laporan-harian' && (
                <>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    📝 Laporan Harian Terbaru
                  </h3>
                  {stats.recentReports.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recentReports.map((report, index) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-card p-4 rounded-lg border border-border"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-medium text-foreground">{report.topic}</div>
                            <span className="text-xs text-muted-foreground">{report.date}</span>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              report.result === 'Lulus' 
                                ? 'bg-green-100 text-green-700' 
                                : report.result === 'Tidak Lulus'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              Hasil: {report.result || '-'}
                            </span>
                            {report.page && (
                              <span className="text-xs text-muted-foreground">
                                Halaman: {report.page}
                              </span>
                            )}
                          </div>
                          {report.notes && (
                            <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                              <span className="font-medium">Catatan:</span> {report.notes}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      Belum ada laporan harian
                    </div>
                  )}
                </>
              )}

              {/* Laporan Kegiatan Tab */}
              {activeTab === 'laporan-kegiatan' && (
                <>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    🎯 Laporan Kegiatan
                  </h3>
                  {studentReports.length > 0 ? (
                    <div className="space-y-3">
                      {studentReports.slice(-10).reverse().map((report, index) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between bg-card p-3 rounded-lg border border-border"
                        >
                          <div>
                            <div className="font-medium text-foreground text-sm">{report.topic}</div>
                            <div className="text-xs text-muted-foreground">{report.date}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            report.result === 'Lulus' 
                              ? 'bg-green-100 text-green-700' 
                              : report.result === 'Tidak Lulus'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {report.result || '-'}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      Belum ada laporan kegiatan
                    </div>
                  )}
                </>
              )}

              {/* Nilai Tab */}
              {activeTab === 'nilai' && (
                <>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    📊 Daftar Nilai
                  </h3>
                  {studentGrades.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-3">Tanggal</th>
                            <th className="text-left py-2 px-3">Mata Pelajaran</th>
                            <th className="text-left py-2 px-3">Jenis</th>
                            <th className="text-center py-2 px-3">Nilai</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentGrades.slice(-10).reverse().map((grade) => (
                            <tr key={grade.id} className="border-b border-border/50">
                              <td className="py-2 px-3 text-muted-foreground">{grade.date}</td>
                              <td className="py-2 px-3 font-medium">{grade.subject}</td>
                              <td className="py-2 px-3">{grade.nilai_type || 'Tugas'}</td>
                              <td className="py-2 px-3 text-center">
                                <span className={`px-2 py-1 rounded text-sm font-bold ${
                                  grade.score >= 80 ? 'bg-green-100 text-green-700' :
                                  grade.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-600'
                                }`}>
                                  {grade.score}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      Belum ada nilai
                    </div>
                  )}
                </>
              )}

              {/* Target Tab */}
              {activeTab === 'target' && (
                <>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    🎯 Target Pencapaian
                  </h3>
                  {stats.progressTargets.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {stats.progressTargets.map((target, idx) => (
                        <div key={idx} className="bg-card p-4 rounded-lg border border-border">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium text-foreground">{target.subject}</span>
                            <span className={`text-sm font-bold ${
                              target.progress >= 80 ? 'text-green-600' :
                              target.progress >= 60 ? 'text-yellow-600' :
                              'text-red-500'
                            }`}>
                              {target.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${
                                target.progress >= 80 ? 'bg-green-500' :
                                target.progress >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${target.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      Belum ada target
                    </div>
                  )}
                </>
              )}

              {/* Absensi Tab */}
              {activeTab === 'absensi' && (
                <>
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    📋 Riwayat Absensi
                  </h3>
                  {studentAttendanceData.length > 0 ? (
                    <div className="space-y-2">
                      {studentAttendanceData.slice(-15).reverse().map((att, index) => (
                        <motion.div
                          key={att.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center justify-between bg-card p-3 rounded-lg border border-border"
                        >
                          <div className="text-sm text-muted-foreground">{att.date}</div>
                          <span className={`px-3 py-1 rounded text-xs font-medium ${
                            att.status === 'Hadir' ? 'bg-green-100 text-green-700' :
                            att.status === 'Sakit' ? 'bg-yellow-100 text-yellow-700' :
                            att.status === 'Izin' ? 'bg-blue-100 text-blue-700' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {att.status}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      Belum ada data absensi
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <FileDown className="w-4 h-4" />
                📄 Download PDF
              </button>
            </div>
          </>
        )}

        {!selectedStudent && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍👩‍👧</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Pilih Siswa untuk Melihat Perkembangan
            </h3>
            <p className="text-muted-foreground">
              Silakan pilih kelas dan siswa untuk melihat data perkembangan belajar.
            </p>
          </div>
        )}
      </motion.section>
    </main>
  );
}