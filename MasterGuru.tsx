import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useToastContext } from '@/components/Toast';
import { exportToExcel } from '@/utils/exportUtils';

export function MasterGuru() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    email: '',
    telepon: '',
    mapel: '',
    status: 'Aktif',
    alamat: ''
  });

  const { teachers, addTeacher } = useData();
  const { showToast } = useToastContext();

  const handleExportExcel = () => {
    if (teachers.length === 0) {
      showToast('Tidak ada data untuk diekspor', 'error');
      return;
    }

    const exportData = {
      headers: ['NIP', 'Nama', 'Email', 'Telepon', 'Mata Pelajaran', 'Status', 'Alamat'],
      rows: teachers.map(t => [
        t.nip,
        t.nama,
        t.email || '',
        t.telepon || '',
        t.mapel || '',
        t.status || 'Aktif',
        t.alamat || ''
      ]),
      title: 'Master Guru',
      filename: 'master_guru',
    };

    exportToExcel(exportData);
    showToast('Data berhasil diexport!', 'success');
  };

  const handleSubmit = () => {
    if (!formData.nip || !formData.nama) {
      showToast('NIP dan Nama wajib diisi', 'error');
      return;
    }

    addTeacher(formData);
    showToast('Data guru berhasil ditambahkan!', 'success');
    
    setFormData({
      nip: '',
      nama: '',
      email: '',
      telepon: '',
      mapel: '',
      status: 'Aktif',
      alamat: ''
    });
    setShowForm(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="section-card"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          👥 Master Data Guru
        </h2>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            📥 Download Excel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(!showForm)}
            className={showForm ? 'btn-accent' : 'btn-primary'}
          >
            {showForm ? '✕ Tutup Form' : '➕ Tambah Guru'}
          </motion.button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Form Tambah Guru</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">NIP *</label>
              <input
                type="text"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="input-field"
                placeholder="Masukkan NIP"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nama Lengkap *</label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="input-field"
                placeholder="Masukkan nama lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="contoh@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Telepon</label>
              <input
                type="text"
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                className="input-field"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Mata Pelajaran</label>
              <input
                type="text"
                value={formData.mapel}
                onChange={(e) => setFormData({ ...formData, mapel: e.target.value })}
                className="input-field"
                placeholder="Mata pelajaran"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">Alamat</label>
            <textarea
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="Alamat lengkap"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="btn-primary"
          >
            💾 Simpan Data Guru
          </motion.button>
        </motion.div>
      )}

      {/* Teachers List */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-primary/10">
              <th className="text-left p-3 rounded-tl-lg">NIP</th>
              <th className="text-left p-3">Nama</th>
              <th className="text-left p-3">Mata Pelajaran</th>
              <th className="text-center p-3 rounded-tr-lg">Status</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher, index) => (
              <motion.tr
                key={teacher.nip}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="p-3 font-mono text-muted-foreground">{teacher.nip}</td>
                <td className="p-3 font-medium text-foreground">{teacher.nama}</td>
                <td className="p-3 text-muted-foreground">{teacher.mapel || '-'}</td>
                <td className="p-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    teacher.status === 'Aktif' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {teacher.status || 'Aktif'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
