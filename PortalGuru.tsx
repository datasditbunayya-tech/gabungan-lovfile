import { useState } from 'react';
import { GuruSection } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { GuruMenu } from './GuruMenu';
import { Dashboard } from './Dashboard';
import { AdminDashboard } from './AdminDashboard';
import { AbsensiSiswa } from './AbsensiSiswa';
import { AbsensiGuru } from './AbsensiGuru';
import { JurnalMengajar } from './JurnalMengajar';
import { RekapNilai } from './RekapNilai';
import { CetakRapor } from './CetakRapor';
import { MasterGuru } from './MasterGuru';
import { GoogleSheetsSetup } from './GoogleSheetsSetup';
import { ShortcutManager } from './ShortcutLinks';

export function PortalGuru() {
  const [activeSection, setActiveSection] = useState<GuruSection>('dashboard');
  const [showGoogleSetup, setShowGoogleSetup] = useState(false);
  const [googleScriptUrl, setGoogleScriptUrl] = useState(() => 
    localStorage.getItem('googleAppsScriptUrl') || ''
  );
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'admin-dashboard':
        return isAdmin ? <AdminDashboard /> : null;
      case 'absensi-siswa':
        return <AbsensiSiswa />;
      case 'absensi-guru':
        return <AbsensiGuru />;
      case 'jurnal':
        return <JurnalMengajar />;
      case 'rekap-nilai':
        return <RekapNilai />;
      case 'cetak-rapor':
        return isAdmin ? <CetakRapor /> : null;
      case 'master-guru':
        return isAdmin ? <MasterGuru /> : null;
      case 'shortcut-manager':
        return isAdmin ? <ShortcutManager /> : null;
      case 'google-sheets':
        if (isAdmin) {
          setShowGoogleSetup(true);
          setActiveSection('dashboard');
        }
        return <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div>
      <GuruMenu
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isAdmin={isAdmin}
      />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {renderSection()}
      </main>

      {/* Google Sheets Setup Dialog */}
      <GoogleSheetsSetup
        open={showGoogleSetup}
        onOpenChange={setShowGoogleSetup}
        onSave={setGoogleScriptUrl}
        savedUrl={googleScriptUrl}
      />
    </div>
  );
}
