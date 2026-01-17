import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { useToastContext } from '@/components/Toast';
import { CLASS_OPTIONS, SUBJECT_OPTIONS } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
type SiswaSection = 'dashboard' | 'laporan-harian' | 'kegiatan' | 'target' | 'master-siswa';

export function PortalSiswa() {
  const [activeSection, setActiveSection] = useState<SiswaSection>('dashboard');
  const { students, dailyReports, studentAttendance, grades, addStudent, addDailyReport } = useData();
  const { showToast } = useToastContext();

  // Dashboard filter
  const [dashboardClass, setDashboardClass] = useState('');
  const [dashboardStudent, setDashboardStudent] = useState('');

  // Form states for Laporan Harian
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [topic, setTopic] = useState('');
  const [page, setPage] = useState('');
  const [result, setResult] = useState('');
  const [notes, setNotes] = useState('');

  // Form states for Laporan Kegiatan
  const [kegiatanClass, setKegiatanClass] = useState('');
  const [kegiatanStudent, setKegiatanStudent] = useState('');
  const [kegiatanDate, setKegiatanDate] = useState(new Date().toISOString().split('T')[0]);
  const [kegiatanCategory, setKegiatanCategory] = useState('');
  const [kegiatanRating, setKegiatanRating] = useState('');
  const [kegiatanDescription, setKegiatanDescription] = useState('');

  // Form states for Target Pencapaian
  const [targetClass, setTargetClass] = useState('');
  const [targetStudent, setTargetStudent] = useState('');
  const [targetSubject, setTargetSubject] = useState('');
  const [targetProgressCurrent, setTargetProgressCurrent] = useState<number | ''>('');
  const [targetProgressTotal, setTargetProgressTotal] = useState<number | ''>('');
  const [targetProgressUnit, setTargetProgressUnit] = useState('');
  const [targetNotes, setTargetNotes] = useState('');
  const [targetResult, setTargetResult] = useState('');

  // Master Siswa form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    nis: '',
    nama: '',
    class_name: ''
  });

  const filteredStudents = students.filter(s => s.class_name === selectedClass);

  const handleSaveReport = () => {
    if (!selectedClass || !selectedStudent || !reportDate || !topic) {
      showToast('Lengkapi field yang wajib diisi', 'error');
      return;
    }

    addDailyReport({
      class_name: selectedClass,
      student_name: selectedStudent,
      date: reportDate,
      topic,
      page,
      result,
      notes
    });

    showToast('Laporan harian berhasil disimpan!', 'success');
    
    // Reset form
    setSelectedStudent('');
    setTopic('');
    setPage('');
    setResult('');
    setNotes('');
  };

  const handleAddStudent = () => {
    if (!newStudent.nis || !newStudent.nama || !newStudent.class_name) {
      showToast('Lengkapi semua field', 'error');
      return;
    }
    addStudent(newStudent);
    showToast('Siswa berhasil ditambahkan!', 'success');
    setNewStudent({ nis: '', nama: '', class_name: '' });
    setShowAddForm(false);
  };

  const menuItems = [
    { id: 'dashboard' as const, icon: '📊', label: 'Dashboard' },
    { id: 'laporan-harian' as const, icon: '📝', label: 'Harian' },
    { id: 'kegiatan' as const, icon: '🎯', label: 'Kegiatan' },
    { id: 'target' as const, icon: '📈', label: 'Target' },
    { id: 'master-siswa' as const, icon: '🎓', label: 'Siswa' },
  ];

  // Dashboard computations
  const dashboardStudents = students.filter(s => s.class_name === dashboardClass);
  const selectedStudentData = students.find(s => s.nama === dashboardStudent);
  
  const dashboardStats = useMemo(() => {
    if (!dashboardStudent) return null;
    
    const studentGrades = grades.filter(g => g.student_name === dashboardStudent);
    const studentAtt = studentAttendance.filter(a => a.student_name === dashboardStudent);
    const studentReports = dailyReports.filter(r => r.student_name === dashboardStudent);
    
    // Attendance stats
    const attStats = {
      hadir: studentAtt.filter(a => a.status === 'Hadir').length,
      sakit: studentAtt.filter(a => a.status === 'Sakit').length,
      izin: studentAtt.filter(a => a.status === 'Izin').length,
      alpa: studentAtt.filter(a => a.status === 'Alpa').length,
    };
    const totalAtt = Object.values(attStats).reduce((a, b) => a + b, 0);
    
    // Grades by subject
    const gradesBySubject: Record<string, { total: number; count: number }> = {};
    studentGrades.forEach(g => {
      if (!gradesBySubject[g.subject]) {
        gradesBySubject[g.subject] = { total: 0, count: 0 };
      }
      gradesBySubject[g.subject].total += g.score;
      gradesBySubject[g.subject].count += 1;
    });
    
    // Kelulusan stats from daily reports
    const lulusCount = studentReports.filter(r => r.result === 'Lulus').length;
    const tidakLulusCount = studentReports.filter(r => r.result === 'Tidak Lulus').length;
    const perbaikanCount = studentReports.filter(r => r.result === 'Perlu Perbaikan').length;
    
    // Weekly activity (last 7 days)
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyReports = studentReports.filter(r => new Date(r.date) >= weekAgo);
    
    // Category count
    const categoryCount: Record<string, number> = {};
    studentReports.forEach(r => {
      const cat = r.topic?.split(' ')[0] || 'Lainnya';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });
    
    // Progress targets (simulated)
    const progressTargets = Object.entries(gradesBySubject).map(([subject, data]) => ({
      subject,
      progress: Math.min(100, Math.round((data.total / data.count) / 100 * 100)),
      target: 100
    }));
    
    return {
      attendance: attStats,
      totalAttendance: totalAtt,
      gradesBySubject,
      avgGrade: studentGrades.length > 0 
        ? Math.round(studentGrades.reduce((sum, g) => sum + g.score, 0) / studentGrades.length)
        : 0,
      kelulusan: { lulus: lulusCount, tidakLulus: tidakLulusCount, perbaikan: perbaikanCount },
      weeklyActivity: weeklyReports.length,
      categoryCount,
      recentReports: studentReports.slice(-5).reverse(),
      progressTargets,
    };
  }, [dashboardStudent, grades, studentAttendance, dailyReports]);

  const resultOptions = [
    { value: 'Lulus', label: '✓ Lulus' },
    { value: 'Tidak Lulus', label: '✗ Tidak Lulus' },
    { value: 'Perlu Perbaikan', label: '⚠️ Perlu Perbaikan' }
  ];

  const categoryOptions = [
    { value: 'IQRO', label: 'IQRO' },
    { value: 'TAHFIDZ', label: 'TAHFIDZ' },
    { value: 'HAFALAN DOA', label: 'HAFALAN DOA' },
    { value: 'PRAKTEK IBADAH', label: 'PRAKTEK IBADAH' }
  ];

  const ratingOptions = [
    { value: 'Sangat Baik', label: '⭐⭐⭐⭐⭐ Sangat Baik' },
    { value: 'Baik', label: '⭐⭐⭐⭐ Baik' },
    { value: 'Cukup', label: '⭐⭐⭐ Cukup' },
    { value: 'Perlu Bimbingan', label: '⭐⭐ Perlu Bimbingan' }
  ];

  const kegiatanFilteredStudents = students.filter(s => s.class_name === kegiatanClass);
  const targetFilteredStudents = students.filter(s => s.class_name === targetClass);

  const handleSaveKegiatan = () => {
    if (!kegiatanClass || !kegiatanStudent || !kegiatanDate || !kegiatanCategory || !kegiatanRating || !kegiatanDescription) {
      showToast('Lengkapi semua field yang wajib diisi', 'error');
      return;
    }

    // TODO: Add to context when activity report type is added
    showToast('Laporan kegiatan berhasil disimpan!', 'success');
    
    // Reset form
    setKegiatanStudent('');
    setKegiatanCategory('');
    setKegiatanRating('');
    setKegiatanDescription('');
  };

  const handleSaveTarget = () => {
    if (!targetClass || !targetStudent || !targetSubject || !targetResult) {
      showToast('Lengkapi field yang wajib diisi termasuk hasil', 'error');
      return;
    }

    // TODO: Add to context when target type is added
    showToast('Target pencapaian berhasil disimpan!', 'success');
    
    // Reset form
    setTargetStudent('');
    setTargetSubject('');
    setTargetProgressCurrent('');
    setTargetProgressTotal('');
    setTargetProgressUnit('');
    setTargetNotes('');
    setTargetResult('');
  };

  return (
    <div>
      {/* Menu */}
      <div className="bg-card shadow-soft border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-row flex-nowrap gap-2 overflow-x-auto">
            {menuItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2.5 rounded-lg font-medium whitespace-nowrap text-sm transition-all flex items-center gap-2 ${
                  activeSection === item.id
                    ? 'bg-secondary text-secondary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard */}
        {activeSection === 'dashboard' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-card"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              📊 Dashboard Siswa
            </h2>

            {/* Filter */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Pilih Kelas</label>
                <select
                  value={dashboardClass}
                  onChange={(e) => {
                    setDashboardClass(e.target.value);
                    setDashboardStudent('');
                  }}
                  className="input-field"
                >
                  <option value="">Pilih Kelas</option>
                  {CLASS_OPTIONS.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Pilih Siswa</label>
                <select
                  value={dashboardStudent}
                  onChange={(e) => setDashboardStudent(e.target.value)}
                  disabled={!dashboardClass}
                  className="input-field disabled:opacity-50"
                >
                  <option value="">{dashboardClass ? 'Pilih Siswa' : 'Pilih kelas terlebih dahulu'}</option>
                  {dashboardStudents.map(s => (
                    <option key={s.nis} value={s.nama}>{s.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            {dashboardStudent && dashboardStats ? (
              <>
                {/* Student Info */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-5 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold shadow-lg">
                      {dashboardStudent.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{dashboardStudent}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedStudentData?.class_name} • NIS: {selectedStudentData?.nis}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-4 text-center border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600">{dashboardStats.recentReports.length}</div>
                    <div className="text-sm text-muted-foreground">Total Laporan</div>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-4 text-center border border-green-200">
                    <div className="text-3xl font-bold text-green-600">{dashboardStats.kelulusan.lulus}</div>
                    <div className="text-sm text-muted-foreground">Lulus</div>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-red-100 to-red-50 rounded-xl p-4 text-center border border-red-200">
                    <div className="text-3xl font-bold text-red-500">{dashboardStats.kelulusan.tidakLulus}</div>
                    <div className="text-sm text-muted-foreground">Tidak Lulus</div>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-4 text-center border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600">{dashboardStats.progressTargets.length}</div>
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
                          { name: 'Hadir', value: dashboardStats.attendance.hadir, fill: '#10b981' },
                          { name: 'Sakit', value: dashboardStats.attendance.sakit, fill: '#f59e0b' },
                          { name: 'Izin', value: dashboardStats.attendance.izin, fill: '#3b82f6' },
                          { name: 'Alpa', value: dashboardStats.attendance.alpa, fill: '#ef4444' },
                        ]}>
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {[
                              { name: 'Hadir', value: dashboardStats.attendance.hadir, fill: '#10b981' },
                              { name: 'Sakit', value: dashboardStats.attendance.sakit, fill: '#f59e0b' },
                              { name: 'Izin', value: dashboardStats.attendance.izin, fill: '#3b82f6' },
                              { name: 'Alpa', value: dashboardStats.attendance.alpa, fill: '#ef4444' },
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
                      {(dashboardStats.kelulusan.lulus + dashboardStats.kelulusan.tidakLulus + dashboardStats.kelulusan.perbaikan) > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Lulus', value: dashboardStats.kelulusan.lulus, fill: '#10b981' },
                                { name: 'Perbaikan', value: dashboardStats.kelulusan.perbaikan, fill: '#f59e0b' },
                                { name: 'Tidak Lulus', value: dashboardStats.kelulusan.tidakLulus, fill: '#ef4444' },
                              ].filter(d => d.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={25}
                              outerRadius={50}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {[
                                { name: 'Lulus', value: dashboardStats.kelulusan.lulus, fill: '#10b981' },
                                { name: 'Perbaikan', value: dashboardStats.kelulusan.perbaikan, fill: '#f59e0b' },
                                { name: 'Tidak Lulus', value: dashboardStats.kelulusan.tidakLulus, fill: '#ef4444' },
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
                      {Object.keys(dashboardStats.gradesBySubject).length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(dashboardStats.gradesBySubject).map(([subject, data]) => ({
                              name: subject.substring(0, 6),
                              nilai: Math.round(data.total / data.count),
                              fullName: subject
                            }))}
                            layout="vertical"
                          >
                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={50} />
                            <Tooltip 
                              formatter={(value, name, props) => [value, props.payload.fullName]}
                            />
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
                      {dashboardStats.progressTargets.length > 0 ? (
                        <div className="space-y-3">
                          {dashboardStats.progressTargets.slice(0, 4).map((target, idx) => (
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
                      {dashboardStats.weeklyActivity > 0 ? (
                        <>
                          <div className="text-5xl font-bold text-amber-600 mb-2">{dashboardStats.weeklyActivity}</div>
                          <p className="text-sm text-amber-700">aktivitas minggu ini</p>
                          <div className="mt-2 w-full bg-amber-200 rounded-full h-2">
                            <div 
                              className="bg-amber-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, dashboardStats.weeklyActivity * 14.3)}%` }}
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
                      {Object.keys(dashboardStats.categoryCount).length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(dashboardStats.categoryCount).map(([name, value], idx) => ({
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
                              {Object.entries(dashboardStats.categoryCount).map(([name, value], idx) => (
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
                    onClick={() => setActiveSection('laporan-harian')}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
                  >
                    📝 Laporan Harian
                  </button>
                  <button 
                    onClick={() => setActiveSection('kegiatan')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    🎯 Laporan Kegiatan
                  </button>
                  <button 
                    onClick={() => setActiveSection('target')}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    📈 Target
                  </button>
                </div>

                {/* Recent Reports */}
                {dashboardStats.recentReports.length > 0 && (
                  <div className="bg-muted/30 rounded-xl p-5">
                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                      📋 Laporan Terbaru
                    </h3>
                    <div className="space-y-3">
                      {dashboardStats.recentReports.map((report, index) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between bg-card p-3 rounded-lg border border-border"
                        >
                          <div>
                            <div className="font-medium text-foreground text-sm">{report.topic}</div>
                            <div className="text-xs text-muted-foreground">{report.date} • {report.page || '-'}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            report.result === 'Lulus' 
                              ? 'bg-primary/20 text-primary' 
                              : report.result === 'Tidak Lulus'
                              ? 'bg-destructive/20 text-destructive'
                              : 'bg-accent/20 text-accent-foreground'
                          }`}>
                            {report.result || '-'}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Pilih kelas dan siswa untuk melihat perkembangan
                </h3>
                <p className="text-sm text-muted-foreground">
                  Dashboard akan menampilkan ringkasan kehadiran, nilai, dan aktivitas siswa.
                </p>
              </div>
            )}
          </motion.section>
        )}

        {/* Laporan Harian */}
        {activeSection === 'laporan-harian' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-card"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              📝 Laporan Harian
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Kelas */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Kelas <span className="text-destructive">*</span>
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedStudent('');
                  }}
                  className="input-field"
                >
                  <option value="">Pilih Kelas</option>
                  {CLASS_OPTIONS.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Nama Siswa */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nama Siswa <span className="text-destructive">*</span>
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="input-field"
                  disabled={!selectedClass}
                >
                  <option value="">
                    {selectedClass ? 'Pilih Siswa' : 'Pilih kelas terlebih dahulu'}
                  </option>
                  {filteredStudents.map(student => (
                    <option key={student.nis} value={student.nama}>{student.nama}</option>
                  ))}
                </select>
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tanggal <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Bahasan */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bahasan <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="input-field"
                  placeholder="Topik pembelajaran hari ini"
                />
              </div>

              {/* Halaman */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Halaman
                </label>
                <input
                  type="text"
                  value={page}
                  onChange={(e) => setPage(e.target.value)}
                  className="input-field"
                  placeholder="Halaman buku/iqro"
                />
              </div>

              {/* Hasil */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Hasil <span className="text-destructive">*</span>
                </label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="input-field"
                >
                  <option value="">Pilih Hasil</option>
                  {resultOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Catatan */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Catatan
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="Catatan tambahan..."
                />
              </div>
            </div>

            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveReport}
                className="btn-secondary text-lg px-8"
              >
                💾 Simpan Laporan
              </motion.button>
            </div>

            {/* Daftar Laporan Terbaru */}
            {dailyReports.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">📋 Laporan Terbaru</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-secondary/10">
                        <th className="text-left p-3 rounded-tl-lg">Tanggal</th>
                        <th className="text-left p-3">Siswa</th>
                        <th className="text-left p-3">Kelas</th>
                        <th className="text-left p-3">Bahasan</th>
                        <th className="text-left p-3">Halaman</th>
                        <th className="text-left p-3 rounded-tr-lg">Hasil</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyReports.slice(-10).reverse().map((report, index) => (
                        <motion.tr
                          key={report.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-border hover:bg-muted/50 transition-colors"
                        >
                          <td className="p-3 text-muted-foreground">{report.date}</td>
                          <td className="p-3 font-medium text-foreground">{report.student_name}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-xs">
                              {report.class_name}
                            </span>
                          </td>
                          <td className="p-3 text-foreground">{report.topic}</td>
                          <td className="p-3 text-muted-foreground">{report.page || '-'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              report.result === 'Lulus' 
                                ? 'bg-primary/20 text-primary' 
                                : report.result === 'Tidak Lulus'
                                ? 'bg-destructive/20 text-destructive'
                                : 'bg-accent/20 text-accent-foreground'
                            }`}>
                              {report.result || '-'}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.section>
        )}

        {/* Kegiatan */}
        {activeSection === 'kegiatan' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-card"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              🎯 Laporan Kegiatan
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Kelas */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Kelas <span className="text-destructive">*</span>
                </label>
                <select
                  value={kegiatanClass}
                  onChange={(e) => {
                    setKegiatanClass(e.target.value);
                    setKegiatanStudent('');
                  }}
                  className="input-field"
                >
                  <option value="">Pilih Kelas</option>
                  {CLASS_OPTIONS.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Nama Siswa */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nama Siswa <span className="text-destructive">*</span>
                </label>
                <select
                  value={kegiatanStudent}
                  onChange={(e) => setKegiatanStudent(e.target.value)}
                  className="input-field"
                  disabled={!kegiatanClass}
                >
                  <option value="">
                    {kegiatanClass ? 'Pilih Siswa' : 'Pilih kelas terlebih dahulu'}
                  </option>
                  {kegiatanFilteredStudents.map(student => (
                    <option key={student.nis} value={student.nama}>{student.nama}</option>
                  ))}
                </select>
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tanggal <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={kegiatanDate}
                  onChange={(e) => setKegiatanDate(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Kategori <span className="text-destructive">*</span>
                </label>
                <select
                  value={kegiatanCategory}
                  onChange={(e) => setKegiatanCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="">Pilih Kategori</option>
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Penilaian */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Penilaian <span className="text-destructive">*</span>
                </label>
                <select
                  value={kegiatanRating}
                  onChange={(e) => setKegiatanRating(e.target.value)}
                  className="input-field"
                >
                  <option value="">Pilih Penilaian</option>
                  {ratingOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Deskripsi */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Deskripsi <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={kegiatanDescription}
                  onChange={(e) => setKegiatanDescription(e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="Deskripsi kegiatan..."
                />
              </div>
            </div>

            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveKegiatan}
                className="btn-secondary text-lg px-8"
              >
                💾 Simpan Laporan
              </motion.button>
            </div>
          </motion.section>
        )}

        {/* Target */}
        {activeSection === 'target' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-card"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              🎯 Target Pencapaian
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Kelas */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Kelas <span className="text-destructive">*</span>
                </label>
                <select
                  value={targetClass}
                  onChange={(e) => {
                    setTargetClass(e.target.value);
                    setTargetStudent('');
                  }}
                  className="input-field"
                >
                  <option value="">Pilih Kelas</option>
                  {CLASS_OPTIONS.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Nama Siswa */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nama Siswa <span className="text-destructive">*</span>
                </label>
                <select
                  value={targetStudent}
                  onChange={(e) => setTargetStudent(e.target.value)}
                  className="input-field"
                  disabled={!targetClass}
                >
                  <option value="">
                    {targetClass ? 'Pilih Siswa' : 'Pilih kelas terlebih dahulu'}
                  </option>
                  {targetFilteredStudents.map(student => (
                    <option key={student.nis} value={student.nama}>{student.nama}</option>
                  ))}
                </select>
              </div>

              {/* Mata Pelajaran */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mata Pelajaran <span className="text-destructive">*</span>
                </label>
                <select
                  value={targetSubject}
                  onChange={(e) => setTargetSubject(e.target.value)}
                  className="input-field"
                >
                  <option value="">Pilih Mata Pelajaran</option>
                  {SUBJECT_OPTIONS.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Progress */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Progress <span className="text-destructive">*</span>
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={targetProgressCurrent}
                      onChange={(e) => setTargetProgressCurrent(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-20 px-3 py-2.5 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-center text-lg font-semibold"
                    />
                    <span className="text-lg font-medium text-muted-foreground">/</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="100"
                      value={targetProgressTotal}
                      onChange={(e) => setTargetProgressTotal(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-20 px-3 py-2.5 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-center text-lg font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="surat, ayat, hadist..."
                      value={targetProgressUnit}
                      onChange={(e) => setTargetProgressUnit(e.target.value)}
                      className="flex-1 px-3 py-2.5 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    />
                  </div>
                  {targetProgressTotal !== '' && Number(targetProgressTotal) > 0 && (
                    <div className="space-y-1">
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-secondary to-primary h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, ((Number(targetProgressCurrent) || 0) / Number(targetProgressTotal)) * 100)}%` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        {targetProgressCurrent || 0} / {targetProgressTotal} {targetProgressUnit} ({Math.round(((Number(targetProgressCurrent) || 0) / Number(targetProgressTotal)) * 100)}%)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Hasil Dropdown */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Hasil <span className="text-destructive">*</span>
                </label>
                <select
                  value={targetResult}
                  onChange={(e) => setTargetResult(e.target.value)}
                  className="input-field"
                >
                  <option value="">Pilih Hasil</option>
                  <option value="Lulus">✓ Lulus</option>
                  <option value="Tidak Lulus">✗ Tidak Lulus</option>
                </select>
              </div>

              {/* Catatan */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Catatan
                </label>
                <textarea
                  value={targetNotes}
                  onChange={(e) => setTargetNotes(e.target.value)}
                  className="input-field min-h-[100px]"
                  placeholder="Catatan target pencapaian..."
                />
              </div>
            </div>

            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveTarget}
                className="btn-secondary text-lg px-8"
              >
                💾 Simpan Target
              </motion.button>
            </div>
          </motion.section>
        )}

        {/* Master Siswa */}
        {activeSection === 'master-siswa' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-card"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">🎓 Master Data Siswa</h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddForm(!showAddForm)}
                className={showAddForm ? 'btn-accent' : 'btn-secondary'}
              >
                {showAddForm ? '✕ Tutup' : '➕ Tambah Siswa'}
              </motion.button>
            </div>

            {/* Add Form */}
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-xl p-6 mb-6"
              >
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">NIS *</label>
                    <input
                      type="text"
                      value={newStudent.nis}
                      onChange={(e) => setNewStudent({ ...newStudent, nis: e.target.value })}
                      className="input-field"
                      placeholder="Nomor Induk Siswa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nama *</label>
                    <input
                      type="text"
                      value={newStudent.nama}
                      onChange={(e) => setNewStudent({ ...newStudent, nama: e.target.value })}
                      className="input-field"
                      placeholder="Nama lengkap"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Kelas *</label>
                    <select
                      value={newStudent.class_name}
                      onChange={(e) => setNewStudent({ ...newStudent, class_name: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Pilih Kelas</option>
                      {CLASS_OPTIONS.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddStudent}
                  className="btn-secondary"
                >
                  💾 Simpan Siswa
                </motion.button>
              </motion.div>
            )}

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-secondary/10">
                    <th className="text-left p-3 rounded-tl-lg">NIS</th>
                    <th className="text-left p-3">Nama</th>
                    <th className="text-left p-3 rounded-tr-lg">Kelas</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <motion.tr
                      key={student.nis}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3 font-mono text-muted-foreground">{student.nis}</td>
                      <td className="p-3 font-medium text-foreground">{student.nama}</td>
                      <td className="p-3">
                        <span className="px-3 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-sm">
                          {student.class_name}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
