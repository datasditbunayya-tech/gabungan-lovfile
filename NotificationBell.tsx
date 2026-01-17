import { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '@/contexts/DataContext';

interface Notification {
  id: string;
  type: 'report' | 'grade';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

interface NotificationBellProps {
  studentName?: string;
}

export function NotificationBell({ studentName }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { dailyReports, grades } = useData();

  // Generate notifications from recent data
  useEffect(() => {
    if (!studentName) return;

    const today = new Date();
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    const newNotifications: Notification[] = [];

    // Check for recent reports
    const recentReports = dailyReports.filter(
      r => r.student_name === studentName && new Date(r.date) >= threeDaysAgo
    );
    recentReports.forEach(report => {
      newNotifications.push({
        id: `report-${report.id}`,
        type: 'report',
        title: '📝 Laporan Harian Baru',
        message: `${report.topic} - ${report.result || 'Pending'}`,
        date: report.date,
        read: false,
      });
    });

    // Check for recent grades
    const recentGrades = grades.filter(
      g => g.student_name === studentName && new Date(g.date) >= threeDaysAgo
    );
    recentGrades.forEach(grade => {
      newNotifications.push({
        id: `grade-${grade.id}`,
        type: 'grade',
        title: '📊 Nilai Baru',
        message: `${grade.subject} - ${grade.nilai_type}: ${grade.score}`,
        date: grade.date,
        read: false,
      });
    });

    // Sort by date descending
    newNotifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Load read status from localStorage
    const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    newNotifications.forEach(n => {
      if (readNotifications.includes(n.id)) {
        n.read = true;
      }
    });

    setNotifications(newNotifications);
  }, [studentName, dailyReports, grades]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    if (!readNotifications.includes(id)) {
      readNotifications.push(id);
      localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    localStorage.setItem('readNotifications', JSON.stringify(allIds));
  };

  if (!studentName) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-12 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-border flex items-center justify-between bg-muted/50">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  🔔 Notifikasi
                </h4>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.slice(0, 10).map(notification => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-3 border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          !notification.read ? 'bg-primary' : 'bg-transparent'
                        }`} />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-foreground">
                            {notification.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {notification.message}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.date).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    Tidak ada notifikasi
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
