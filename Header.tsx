import { motion } from 'framer-motion';
import { School, RefreshCw, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToastContext } from '@/components/Toast';

export function Header() {
  const { user, logout } = useAuth();
  const { refreshData, isConnected } = useData();
  const { showToast } = useToastContext();

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      logout();
      showToast('Berhasil logout', 'info');
    }
  };

  const handleRefresh = () => {
    refreshData();
    showToast('Data berhasil dimuat ulang', 'success');
  };

  const roleIcons: Record<string, string> = {
    admin: '👑',
    guru: '👨‍🏫',
    wali: '👨‍👩‍👧‍👦'
  };

  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    guru: 'Guru',
    wali: 'Wali Siswa'
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-card shadow-soft sticky top-0 z-50 border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-md">
              <School className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-primary">
                Portal Pendidikan Bunayya
              </h1>
              <p className="text-muted-foreground text-sm">
                Selamat Datang di Portal Pendidikan Terpadu
              </p>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex flex-col gap-2 items-end">
            {/* User Badge */}
            {user && (
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                <span className="text-lg">{roleIcons[user.role]}</span>
                <span className="text-sm font-semibold text-primary hidden sm:block">
                  {roleLabels[user.role]}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="p-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
                title="Refresh Data"
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>

              {user?.role === 'admin' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-muted text-muted-foreground rounded-lg hover:opacity-90 transition-opacity"
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`fixed bottom-5 right-5 px-4 py-2 rounded-full text-xs font-medium shadow-lg z-50 ${
        isConnected 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-destructive text-destructive-foreground'
      }`}>
        {isConnected ? '✓ Terhubung' : '✗ Offline'}
      </div>
    </motion.header>
  );
}
