import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToastContext } from '@/components/Toast';
import { CLASS_OPTIONS, ATTENDANCE_STATUS } from '@/types';
import { ExportMonthSelector } from './ExportMonthSelector';
import { exportToExcel, filterByMonth } from '@/utils/exportUtils';

export function AbsensiGuru() {
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('Hadir');
  const [showExportDialog, setShowExportDialog] = useState(false);

  const { teachers, addTeacherAttendance, teacherAttendance } = useData();
  const { showToast } = useToastContext();

  const handleExportExcel = (selectedMonth: string) => {
    const filteredData = filterByMonth(teacherAttendance, selectedMonth);
    
    if (filteredData.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }

    const exportData = {
      headers: ['Tanggal', 'Nama Guru', 'Kelas', 'Status'],
      rows: filteredData.map(a => [
        a.date,
        a.teacher_name,
        a.class_name,
        a.status
      ]),
      title: 'Absensi Guru',
      filename: 'absensi_guru',
    };

    exportToExcel(exportData, selectedMonth);
    showToast('Data berhasil diexport!', 'success');
  };

  const handleSave = () => {
    if (!selectedTeacher || !selectedClass) {
      showToast('Lengkapi semua field yang wajib', 'error');
      return;
    }

    addTeacherAttendance({
      teacher_name: selectedTeacher,
      class_name: selectedClass,
      date: selectedDate,
      status: selectedStatus as 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'
    });

    showToast('Absensi guru berhasil disimpan!', 'success');
    
    // Reset form
    setSelectedTeacher('');
    setSelectedClass('');
    setSelectedStatus('Hadir');
  };

  // Filter today's attendance
  const todayAttendance = teacherAttendance.filter(a => a.date === selectedDate);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="section-card"
    >
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        👨‍🏫 Absensi Guru
      </h2>

      {/* Form */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Pilih Guru *
          </label>
          <select
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="input-field"
          >
            <option value="">Pilih Guru</option>
            {teachers.map(teacher => (
              <option key={teacher.nip} value={teacher.nama}>{teacher.nama}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Pilih Kelas *
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="input-field"
          >
            <option value="">Pilih Kelas</option>
            {CLASS_OPTIONS.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tanggal *
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Status *
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field"
          >
            {ATTENDANCE_STATUS.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="btn-primary"
        >
          💾 Simpan Absensi
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowExportDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          📥 Download Excel
        </motion.button>
      </div>

      <ExportMonthSelector
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onExport={handleExportExcel}
        title="Absensi Guru"
      />

      {/* Today's Attendance List */}
      {todayAttendance.length > 0 && (
        <div className="bg-muted/30 rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4">
            📋 Absensi Hari Ini ({new Date(selectedDate).toLocaleDateString('id-ID')})
          </h3>
          <div className="grid gap-3">
            {todayAttendance.map((att, index) => (
              <motion.div
                key={att.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between bg-card p-4 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    👨‍🏫
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{att.teacher_name}</div>
                    <div className="text-sm text-muted-foreground">{att.class_name}</div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  att.status === 'Hadir' ? 'bg-primary text-primary-foreground' :
                  att.status === 'Sakit' ? 'bg-secondary text-secondary-foreground' :
                  att.status === 'Izin' ? 'bg-accent text-accent-foreground' :
                  'bg-destructive text-destructive-foreground'
                }`}>
                  {att.status}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}
