import { motion } from 'framer-motion';
import { PortalType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToastContext } from '@/components/Toast';

interface PortalTabsProps {
  activePortal: PortalType;
  onPortalChange: (portal: PortalType) => void;
}

export function PortalTabs({ activePortal, onPortalChange }: PortalTabsProps) {
  const { user } = useAuth();
  const { showToast } = useToastContext();

  const portals = [
    { 
      id: 'guru' as PortalType, 
      icon: '👨‍🏫', 
      label: 'Portal Guru', 
      desc: 'Kelola absensi & jurnal',
      gradient: 'from-primary to-primary/80'
    },
    { 
      id: 'siswa' as PortalType, 
      icon: '👨‍🎓', 
      label: 'Portal Siswa', 
      desc: 'Laporan & target belajar',
      gradient: 'from-secondary to-secondary/80'
    },
    { 
      id: 'wali' as PortalType, 
      icon: '👨‍👩‍👧‍👦', 
      label: 'Portal Wali', 
      desc: 'Pantau perkembangan',
      gradient: 'from-accent to-accent/80'
    },
  ];

  const handlePortalClick = (portalId: PortalType) => {
    // Check if user has access
    if (user?.role === 'wali' && portalId !== 'wali') {
      showToast('Anda hanya memiliki akses ke Portal Wali', 'error');
      return;
    }
    onPortalChange(portalId);
  };

  return (
    <div className="bg-gradient-to-r from-muted/50 via-muted to-muted/50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-row justify-center items-stretch gap-4">
          {portals.map((portal) => {
            const isActive = activePortal === portal.id;
            const isHidden = user?.role === 'wali' && portal.id !== 'wali';

            if (isHidden) return null;

            return (
              <motion.button
                key={portal.id}
                onClick={() => handlePortalClick(portal.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`portal-card px-6 py-4 text-center flex-1 max-w-[200px] ${
                  isActive ? 'portal-card-active' : ''
                }`}
              >
                <motion.div 
                  className="text-3xl mb-2"
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {portal.icon}
                </motion.div>
                <div className={`text-sm font-bold mb-1 ${
                  isActive ? 'text-primary' : 'text-foreground'
                }`}>
                  {portal.label}
                </div>
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {portal.desc}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
