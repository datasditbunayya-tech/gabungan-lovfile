import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToastContext } from '@/components/Toast';
import { CLASS_OPTIONS, SUBJECT_OPTIONS } from '@/types';
import { ExportMonthSelector } from './ExportMonthSelector';
import { exportToExcel, filterByMonth } from '@/utils/exportUtils';

const NILAI_TYPES = [
  'Ulangan Harian',
  'Tugas',
  'Ujian Tengah Semester',
  'Ujian Akhir Semester',
  'Praktik',
  'Hafalan'
];

export function RekapNilai() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [nilaiType, setNilaiType] = useState('');
  const [score, setScore] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);

  const { getStudentsByClass, addGrade, grades } = useData();
  const { showToast } = useToastContext();

  const students = selectedClass ? getStudentsByClass(selectedClass) : [];

  const handleExportExcel = (selectedMonth: string) => {
    const filteredData = filterByMonth(grades, selectedMonth);
    
    if (filteredData.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }

    const exportData = {
      headers: ['Tanggal', 'Kelas', 'Nama Siswa', 'Mata Pelajaran', 'Jenis Nilai', 'Nilai', 'Catatan'],
      rows: filteredData.map(g => [
        g.date,
        g.class_name,
        g.student_name,
        g.subject,
        g.nilai_type,
        g.score,
        g.notes || ''
      ]),
      title: 'Rekap Nilai',
      filename: 'rekap_nilai',
    };

    exportToExcel(exportData, selectedMonth);
    showToast('Data berhasil diexport!', 'success');
  };

  const handleSave = () => {
    if (!selectedClass || !selectedStudent || !selectedSubject || !nilaiType || !score) {
      showToast('Lengkapi semua field yang wajib', 'error');
      return;
    }

    const scoreNum = parseInt(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      showToast('Nilai harus antara 0-100', 'error');
      return;
    }

    addGrade({
      class_name: selectedClass,
      student_name: selectedStudent,
      subject: selectedSubject,
      nilai_type: nilaiType,
      score: scoreNum,
      date,
      notes
    });

    showToast('Nilai berhasil disimpan!', 'success');

    // Reset form
    setSelectedStudent('');
    setSelectedSubject('');
    setNilaiType('');
    setScore('');
    setNotes('');
  };

  // Filter grades for selected class
  const classGrades = grades.filter(g => 
    (!selectedClass || g.class_name === selectedClass)
  );

  // Calculate average per student
  const studentAverages: Record<string, { total: number; count: number }> = {};
  classGrades.forEach(g => {
    if (!studentAverages[g.student_name]) {
      studentAverages[g.student_name] = { total: 0, count: 0 };
    }
    studentAverages[g.student_name].total += g.score;
    studentAverages[g.student_name].count += 1;
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="section-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          📈 Rekap Nilai Siswa
        </h2>
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
        title="Rekap Nilai"
      />

      {/* Input Form */}
      <div className="bg-gradient-to-r from-purple/10 to-coral/10 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">➕ Input Nilai Baru</h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Kelas *</label>
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
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Siswa *</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="input-field"
              disabled={!selectedClass}
            >
              <option value="">Pilih Siswa</option>
              {students.map(s => (
                <option key={s.nis} value={s.nama}>{s.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Mata Pelajaran *</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="input-field"
            >
              <option value="">Pilih Mapel</option>
              {SUBJECT_OPTIONS.map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Jenis Nilai *</label>
            <select
              value={nilaiType}
              onChange={(e) => setNilaiType(e.target.value)}
              className="input-field"
            >
              <option value="">Pilih Jenis</option>
              {NILAI_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Nilai (0-100) *</label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              min="0"
              max="100"
              placeholder="Masukkan nilai"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tanggal *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">Catatan</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan tambahan (opsional)"
            className="input-field"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="btn-primary"
        >
          💾 Simpan Nilai
        </motion.button>
      </div>

      {/* Grades Summary */}
      {Object.keys(studentAverages).length > 0 && (
        <div className="bg-muted/30 rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4">📊 Ringkasan Nilai</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary/10">
                  <th className="text-left p-3 rounded-tl-lg">Nama Siswa</th>
                  <th className="text-center p-3">Jumlah Nilai</th>
                  <th className="text-center p-3 rounded-tr-lg">Rata-rata</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(studentAverages).map(([name, data], index) => {
                  const avg = Math.round(data.total / data.count);
                  return (
                    <motion.tr
                      key={name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border"
                    >
                      <td className="p-3 font-medium text-foreground">{name}</td>
                      <td className="p-3 text-center text-muted-foreground">{data.count}</td>
                      <td className="p-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          avg >= 80 ? 'bg-primary/20 text-primary' :
                          avg >= 70 ? 'bg-secondary/20 text-secondary-foreground' :
                          avg >= 60 ? 'bg-accent/20 text-accent' :
                          'bg-destructive/20 text-destructive'
                        }`}>
                          {avg}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.section>
  );
}
