import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { ToastProvider } from '@/components/Toast';
import { LoginPage } from '@/components/LoginPage';
import { Header } from '@/components/Header';
import { PortalTabs } from '@/components/PortalTabs';
import { PortalGuru } from '@/components/PortalGuru';
import { PortalSiswa } from '@/components/PortalSiswa';
import { PortalWali } from '@/components/PortalWali';
import { PortalType } from '@/types';

function MainApp() {
  const { isAuthenticated, user } = useAuth();
  const [activePortal, setActivePortal] = useState<PortalType>('guru');

  // If user is wali, force portal wali
  const effectivePortal = user?.role === 'wali' ? 'wali' : activePortal;

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen portal-gradient-bg">
      <Header />
      <PortalTabs 
        activePortal={effectivePortal} 
        onPortalChange={setActivePortal} 
      />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={effectivePortal}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {effectivePortal === 'guru' && <PortalGuru />}
          {effectivePortal === 'siswa' && <PortalSiswa />}
          {effectivePortal === 'wali' && <PortalWali />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function Index() {
  return (
    <DataProvider>
      <AuthProvider>
        <ToastProvider>
          <MainApp />
        </ToastProvider>
      </AuthProvider>
    </DataProvider>
  );
}
