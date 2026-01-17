import { motion } from 'framer-motion';
import { GuruSection } from '@/types';

interface GuruMenuProps {
  activeSection: GuruSection;
  onSectionChange: (section: GuruSection) => void;
  isAdmin: boolean;
}

export function GuruMenu({ activeSection, onSectionChange, isAdmin }: GuruMenuProps) {
  const menuItems: { id: GuruSection; icon: string; label: string; adminOnly?: boolean }[] = [
    { id: 'admin-dashboard', icon: '📈', label: 'Analytics', adminOnly: true },
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'absensi-siswa', icon: '📋', label: 'Absensi Siswa' },
    { id: 'absensi-guru', icon: '👨‍🏫', label: 'Absensi Guru' },
    { id: 'jurnal', icon: '📝', label: 'Jurnal Mengajar' },
    { id: 'rekap-nilai', icon: '📈', label: 'Rekap Nilai' },
    { id: 'cetak-rapor', icon: '📄', label: 'Cetak Rapor', adminOnly: true },
    { id: 'master-guru', icon: '👥', label: 'Master Data Guru', adminOnly: true },
    { id: 'shortcut-manager', icon: '🔗', label: 'Kelola Pintasan', adminOnly: true },
    { id: 'google-sheets', icon: '⚙️', label: 'Google Sheets', adminOnly: true },
  ];

  return (
    <div className="bg-card shadow-soft border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-row flex-nowrap gap-2 overflow-x-auto justify-start" 
          style={{ WebkitOverflowScrolling: 'touch' }}>
          {menuItems
            .filter(item => !item.adminOnly || isAdmin)
            .map((item) => {
              const isActive = activeSection === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-2.5 rounded-lg font-medium whitespace-nowrap text-sm transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
