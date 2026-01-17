import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole, username: string, password: string, students: any[]) => boolean;
  logout: () => void;
  hasAccess: (feature: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USERS = {
  admin: { username: 'admin', password: 'admin123', role: 'admin' as UserRole, name: 'Administrator' },
  guru: { username: 'guru', password: 'guru123', role: 'guru' as UserRole, name: 'Guru' },
  wali: { username: 'wali', password: 'wali123', role: 'wali' as UserRole, name: 'Wali Siswa' }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (role: UserRole, username: string, password: string, students: any[]): boolean => {
    // Check default credentials
    const defaultUser = DEFAULT_USERS[role];
    if (defaultUser && defaultUser.username === username && defaultUser.password === password) {
      const userData: User = {
        username,
        role,
        name: defaultUser.name
      };
      setUser(userData);
      sessionStorage.setItem('currentUser', JSON.stringify(userData));
      return true;
    }

    // Check Wali Login (NIS / NIS)
    if (role === 'wali') {
      const student = students.find(s => s.nis === username);
      if (student && password === username) {
        const userData: User = {
          username,
          role: 'wali',
          name: `Wali ${student.nama}`,
          studentNis: student.nis,
          studentName: student.nama,
          studentClass: student.class_name
        };
        setUser(userData);
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        return true;
      }
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('currentUser');
  };

  const hasAccess = (feature: string): boolean => {
    if (!user) return false;

    const accessMap: Record<string, UserRole[]> = {
      'master-guru': ['admin'],
      'master-siswa': ['admin'],
      'setup': ['admin', 'guru'],
      'portal-guru': ['admin', 'guru'],
      'portal-siswa': ['admin', 'guru'],
      'portal-wali': ['admin', 'guru', 'wali']
    };

    const allowedRoles = accessMap[feature] || [];
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
