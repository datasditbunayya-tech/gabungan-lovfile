import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToastContext } from '@/components/Toast';
import { CLASS_OPTIONS, ATTENDANCE_STATUS } from '@/types';
import { ExportMonthSelector } from './ExportMonthSelector';
import { exportToExcel, filterByMonth } from '@/utils/exportUtils';

export function AbsensiSiswa() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  const { getStudentsByClass, addStudentAttendance, studentAttendance } = useData();
  const { showToast } = useToastContext();

  const handleExportExcel = (selectedMonth: string) => {
    const filteredData = filterByMonth(studentAttendance, selectedMonth);
    
    if (filteredData.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }

    const exportData = {
      headers: ['Tanggal', 'Kelas', 'Nama Siswa', 'NIS', 'Status'],
      rows: filteredData.map(a => [
        a.date,
        a.class_name,
        a.student_name,
        a.nis,
        a.status
      ]),
      title: 'Absensi Siswa',
      filename: 'absensi_siswa',
    };

    exportToExcel(exportData, selectedMonth);
    showToast('Data berhasil diexport!', 'success');
  };

  const students = selectedClass ? getStudentsByClass(selectedClass) : [];

  const handleLoadData = () => {
    if (!selectedClass) {
      showToast('Pilih kelas terlebih dahulu', 'error');
      return;
    }
    // Initialize attendance with 'Hadir' for all students
    const initialAttendance: Record<string, string> = {};
    students.forEach(s => {
      initialAttendance[s.nis] = 'Hadir';
    });
    setAttendance(initialAttendance);
    showToast(`${students.length} siswa dimuat`, 'success');
  };

  const handleSave = () => {
    if (Object.keys(attendance).length === 0) {
      showToast('Tidak ada data untuk disimpan', 'error');
      return;
    }

    const attendanceData = students.map(s => ({
      class_name: selectedClass,
      student_name: s.nama,
      nis: s.nis,
      date: selectedDate,
      status: attendance[s.nis] as 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'
    }));

    addStudentAttendance(attendanceData);
    showToast('Absensi berhasil disimpan!', 'success');
  };

  const updateAttendance = (nis: string, status: string) => {
    setAttendance(prev => ({ ...prev, [nis]: status }));
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="section-card"
    >
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        📋 Absensi Siswa
      </h2>

      {/* Filters */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
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
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLoadData}
          className="btn-primary"
        >
          📋 Muat Data
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="btn-secondary"
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
        title="Absensi Siswa"
      />

      {/* Attendance List */}
      {students.length > 0 && Object.keys(attendance).length > 0 && (
        <div className="bg-muted/30 rounded-xl p-4">
          <div className="grid gap-3">
            {students.map((student, index) => (
              <motion.div
                key={student.nis}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between bg-card p-4 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{student.nama}</div>
                    <div className="text-sm text-muted-foreground">NIS: {student.nis}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {ATTENDANCE_STATUS.map(status => (
                    <button
                      key={status.value}
                      onClick={() => updateAttendance(student.nis, status.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        attendance[student.nis] === status.value
                          ? `${status.color} text-primary-foreground shadow-md`
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}
