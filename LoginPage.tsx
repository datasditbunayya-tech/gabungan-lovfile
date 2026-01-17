import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, School, LogIn, User, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToastContext } from '@/components/Toast';
import { UserRole } from '@/types';
import { ShortcutLinks } from '@/components/ShortcutLinks';

export function LoginPage() {
  const [role, setRole] = useState<UserRole | ''>('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { students } = useData();
  const { showToast } = useToastContext();

  const handleLogin = async () => {
    setError('');

    if (!role) {
      setError('Silakan pilih tipe pengguna');
      return;
    }

    if (!username || !password) {
      setError('Username dan password harus diisi');
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(role, username, password, students);

    if (success) {
      showToast(`Selamat datang!`, 'success');
    } else {
      setError('Username atau password salah');
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const roleOptions = [
    { value: 'admin', label: 'Administrator', icon: '👑' },
    { value: 'guru', label: 'Guru', icon: '👨‍🏫' },
    { value: 'wali', label: 'Wali Siswa', icon: '👨‍👩‍👧‍👦' }
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center z-[9999]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Main container with login + shortcuts */}
      <div className="flex items-center gap-6 mx-4">
        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-2xl shadow-2xl p-8 w-full max-w-md relative"
        >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4 shadow-lg"
          >
            <School className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground">Portal Pendidikan</h1>
          <p className="text-xl font-semibold text-primary">Bunayya Islamic School</p>
          <p className="text-muted-foreground mt-2 text-sm">Silakan login untuk melanjutkan</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg mb-4"
          >
            {error}
          </motion.div>
        )}

        {/* Login Form */}
        <div className="space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Pilih Tipe Pengguna
            </label>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value as UserRole)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    role === option.value
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border hover:border-primary/50 bg-background'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-xs font-medium text-foreground">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Masukkan username"
                className="input-field pl-12"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Masukkan password"
                className="input-field pl-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <motion.button
            onClick={handleLogin}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Help Info */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm font-semibold text-foreground mb-2">📋 Petunjuk Login:</p>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>👨‍👩‍👧‍👦 Wali:</span>
              <span>NIS Siswa / NIS Siswa</span>
            </div>
          </div>
          </div>
        </motion.div>

        {/* Shortcut Links - Right Side */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="hidden md:block"
        >
          <ShortcutLinks isAdmin={false} />
        </motion.div>
      </div>
    </div>
  );
}
