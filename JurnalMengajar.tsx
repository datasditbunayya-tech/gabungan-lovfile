import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToastContext } from '@/components/Toast';
import { CLASS_OPTIONS, SUBJECT_OPTIONS } from '@/types';
import { ExportMonthSelector } from './ExportMonthSelector';
import { exportToExcel, filterByMonth } from '@/utils/exportUtils';

// Auto-generate activity and notes based on topic and subject
function generateContent(topic: string, subject: string) {
  if (!topic) return { activity: '', notes: '' };

  const activities: Record<string, string[]> = {
    'TAHFIDZ': [
      'Muroja\'ah bersama-sama',
      'Hafalan individual dengan guru',
      'Evaluasi bacaan dan tajwid',
      'Latihan pengucapan makhorijul huruf',
      'Setoran hafalan kepada guru'
    ],
    'IQRO': [
      'Belajar membaca huruf hijaiyah',
      'Latihan makhorijul huruf',
      'Evaluasi bacaan',
      'Latihan membaca dengan tartil',
      'Koreksi kesalahan pengucapan'
    ],
    'MATEMATIKA': [
      'Penjelasan materi oleh guru',
      'Latihan soal bersama',
      'Evaluasi pemahaman siswa',
      'Diskusi pemecahan masalah',
      'Pembahasan soal secara interaktif'
    ],
    'BAHASA INDONESIA': [
      'Membaca teks bersama',
      'Diskusi tentang isi bacaan',
      'Latihan menulis',
      'Latihan berbicara di depan kelas',
      'Evaluasi pemahaman teks'
    ],
    'BAHASA ARAB': [
      'Pengenalan kosakata baru',
      'Latihan pengucapan',
      'Latihan menulis arab',
      'Hafalan mufrodat',
      'Percakapan sederhana'
    ],
    'BAHASA INGGRIS': [
      'Pengenalan vocabulary baru',
      'Latihan pronunciation',
      'Latihan menulis kalimat',
      'Conversation practice',
      'Listening comprehension'
    ],
    'IPAS': [
      'Penjelasan konsep materi',
      'Pengamatan dan observasi',
      'Diskusi hasil pengamatan',
      'Latihan soal evaluasi',
      'Presentasi hasil belajar'
    ],
    'DEFAULT': [
      'Penjelasan materi oleh guru',
      'Diskusi interaktif dengan siswa',
      'Evaluasi pemahaman',
      'Latihan dan praktik',
      'Penugasan untuk penguatan'
    ]
  };

  const subjectActivities = activities[subject] || activities['DEFAULT'];
  const activity = subjectActivities.map((act, i) => `${i + 1}. ${act}`).join('\n') + `\n\nTopik: ${topic}`;
  
  const notes = `Siswa mengikuti pembelajaran ${topic} dengan baik. Beberapa siswa menunjukkan antusiasme tinggi dalam mengikuti kegiatan pembelajaran.\n\nPerlu pengulangan untuk penguatan materi dan tindak lanjut di pertemuan selanjutnya.`;

  return { activity, notes };
}

export function JurnalMengajar() {
  const [teacher, setTeacher] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [activity, setActivity] = useState('');
  const [notes, setNotes] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);

  const { teachers, addJournal, journals } = useData();
  const { showToast } = useToastContext();

  const handleExportExcel = (selectedMonth: string) => {
    const filteredData = filterByMonth(journals, selectedMonth);
    
    if (filteredData.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }

    const exportData = {
      headers: ['Tanggal', 'Guru', 'Kelas', 'Mata Pelajaran', 'Topik', 'Kegiatan', 'Catatan'],
      rows: filteredData.map(j => [
        j.date,
        j.teacher_name,
        j.class_name,
        j.subject,
        j.topic,
        j.activity,
        j.notes || ''
      ]),
      title: 'Jurnal Mengajar',
      filename: 'jurnal_mengajar',
    };

    exportToExcel(exportData, selectedMonth);
    showToast('Data berhasil diexport!', 'success');
  };

  // Auto-generate when topic or subject changes
  const handleTopicChange = (newTopic: string) => {
    setTopic(newTopic);
    if (newTopic && subject) {
      const generated = generateContent(newTopic, subject);
      setActivity(generated.activity);
      setNotes(generated.notes);
    }
  };

  const handleSubjectChange = (newSubject: string) => {
    setSubject(newSubject);
    if (topic && newSubject) {
      const generated = generateContent(topic, newSubject);
      setActivity(generated.activity);
      setNotes(generated.notes);
    }
  };

  const handleSave = () => {
    if (!teacher || !date || !className || !subject || !topic) {
      showToast('Lengkapi semua field yang wajib', 'error');
      return;
    }

    addJournal({
      teacher_name: teacher,
      date,
      class_name: className,
      subject,
      topic,
      activity,
      notes
    });

    showToast('Jurnal berhasil disimpan!', 'success');
    
    // Reset form
    setTeacher('');
    setClassName('');
    setSubject('');
    setTopic('');
    setActivity('');
    setNotes('');
  };

  // Recent journals
  const recentJournals = [...journals]
    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    .slice(0, 3);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="section-card"
    >
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        📝 Jurnal Mengajar
      </h2>

      {/* Form */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Nama Guru *
          </label>
          <select
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
            className="input-field"
          >
            <option value="">Pilih Guru</option>
            {teachers.map(t => (
              <option key={t.nip} value={t.nama}>{t.nama}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tanggal *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Kelas *
          </label>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
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
            Mata Pelajaran *
            <span className="text-xs text-primary font-normal ml-2">
              (Pilih untuk hasil generate lebih akurat)
            </span>
          </label>
          <select
            value={subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="input-field"
          >
            <option value="">Pilih Mata Pelajaran</option>
            {SUBJECT_OPTIONS.map(subj => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          Topik *
          <span className="text-xs text-primary font-normal ml-2">
            (Ketik topik untuk generate otomatis)
          </span>
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => handleTopicChange(e.target.value)}
          placeholder="Contoh: Surat Al-Fatihah, Perkalian 1-10, Doa Sebelum Makan"
          className="input-field"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">
          Kegiatan (5 Uraian)
          <span className="text-xs text-primary font-normal ml-2">✨ Otomatis dari Topik & Mapel</span>
        </label>
        <textarea
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          rows={6}
          placeholder="Akan terisi otomatis saat mengetik topik (5 uraian kegiatan)..."
          className="input-field bg-primary/5 font-mono text-sm"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">
          Catatan (minimal 2 baris)
          <span className="text-xs text-primary font-normal ml-2">✨ Otomatis dari Topik & Mapel</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Akan terisi otomatis saat mengetik topik (minimal 2 baris)..."
          className="input-field bg-primary/5"
        />
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          className="btn-primary"
        >
          💾 Simpan Jurnal
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
        title="Jurnal Mengajar"
      />

      {/* Recent Journals */}
      {recentJournals.length > 0 && (
        <div className="bg-muted/30 rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4">📚 Jurnal Terbaru</h3>
          <div className="grid gap-3">
            {recentJournals.map((journal, index) => (
              <motion.div
                key={journal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-4 rounded-lg border border-border"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-foreground">{journal.topic}</div>
                    <div className="text-sm text-muted-foreground">
                      {journal.teacher_name} • {journal.class_name} • {journal.subject}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(journal.date).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}
