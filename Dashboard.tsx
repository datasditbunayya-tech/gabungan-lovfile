import { motion } from 'framer-motion';
import { Users, GraduationCap, BookOpen, CheckCircle } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  gradient: string;
}

function StatCard({ icon, value, label, gradient }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`stats-card bg-gradient-to-br ${gradient} rounded-xl p-5 text-primary-foreground shadow-card`}
    >
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm opacity-90 mt-1">{label}</div>
      <div className="mt-3 opacity-80">{icon}</div>
    </motion.div>
  );
}

export function Dashboard() {
  const { students, teachers, journals, studentAttendance } = useData();

  // Calculate statistics
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().substring(0, 7);
  
  const jurnalBulanIni = journals.filter(j => j.date?.startsWith(thisMonth)).length;
  
  const todayAttendance = studentAttendance.filter(a => a.date === today);
  const hadirCount = todayAttendance.filter(a => a.status === 'Hadir').length;
  const kehadiran = todayAttendance.length > 0 
    ? Math.round((hadirCount / todayAttendance.length) * 100) 
    : 0;

  // Get last 6 days for chart
  const attendanceByDay = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayAttendance = studentAttendance.filter(a => a.date === dateStr);
    attendanceByDay.push({
      day: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][date.getDay()],
      count: dayAttendance.filter(a => a.status === 'Hadir').length
    });
  }

  const maxAttendance = Math.max(...attendanceByDay.map(d => d.count), 1);

  // Subject distribution
  const subjectCount: Record<string, number> = {};
  journals.forEach(j => {
    const subject = j.subject || 'Lainnya';
    subjectCount[subject] = (subjectCount[subject] || 0) + 1;
  });
  const topSubjects = Object.entries(subjectCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxSubjectCount = Math.max(...topSubjects.map(s => s[1]), 1);

  const subjectColors = ['bg-primary', 'bg-accent', 'bg-secondary', 'bg-coral', 'bg-purple'];

  // Recent activities
  const recentActivities = [...journals]
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    .slice(0, 5);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="section-card"
    >
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        📊 Dashboard Statistik
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<GraduationCap className="w-8 h-8" />}
          value={students.length}
          label="Total Siswa"
          gradient="from-accent to-accent/80"
        />
        <StatCard
          icon={<Users className="w-8 h-8" />}
          value={teachers.length}
          label="Total Guru"
          gradient="from-primary to-primary/80"
        />
        <StatCard
          icon={<BookOpen className="w-8 h-8" />}
          value={jurnalBulanIni}
          label="Jurnal Bulan Ini"
          gradient="from-purple to-purple/80"
        />
        <StatCard
          icon={<CheckCircle className="w-8 h-8" />}
          value={`${kehadiran}%`}
          label="Kehadiran Hari Ini"
          gradient="from-secondary to-secondary/80"
        />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Attendance Chart */}
        <div className="bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            📊 Statistik Kehadiran Minggu Ini
          </h3>
          <div className="h-48 flex items-end justify-around gap-3">
            {attendanceByDay.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.count / maxAttendance) * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="w-full bg-accent rounded-t-lg min-h-[4px]"
                />
                <div className="text-sm font-bold text-accent mt-2">{day.count}</div>
                <div className="text-xs text-muted-foreground">{day.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            📚 Distribusi Mata Pelajaran
          </h3>
          <div className="h-48 flex items-end justify-around gap-3">
            {topSubjects.length > 0 ? (
              topSubjects.map(([subject, count], i) => (
                <div key={subject} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(count / maxSubjectCount) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className={`w-full ${subjectColors[i]} rounded-t-lg min-h-[4px]`}
                  />
                  <div className="text-sm font-bold text-foreground mt-2">{count}</div>
                  <div className="text-xs text-muted-foreground text-center truncate w-full" title={subject}>
                    {subject.substring(0, 8)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm w-full text-center">Belum ada data</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-muted/50 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          🕐 Aktivitas Terbaru
        </h3>
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-soft transition-shadow"
              >
                <div className="text-2xl">📝</div>
                <div className="flex-1">
                  <div className="font-semibold text-foreground">Jurnal Mengajar</div>
                  <div className="text-sm text-muted-foreground">
                    {activity.teacher_name} - {activity.class_name}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {activity.created_at ? new Date(activity.created_at).toLocaleString('id-ID') : '-'}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">Belum ada aktivitas</p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
