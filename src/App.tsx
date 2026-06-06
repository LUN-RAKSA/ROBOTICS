/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GraduationCap, Github, Layout, Terminal, Sparkles, Database, Layers, LogOut, ShieldCheck } from 'lucide-react';
import { Student } from './types';
import { INITIAL_STUDENTS } from './initialData';
import DashboardView from './components/DashboardView';
import RoboticsIcon from './components/RoboticsIcon';
import ManagerProfile from './components/ManagerProfile';
import LoginForm from './components/LoginForm';
import { motion } from 'motion/react';

const LOCAL_STORAGE_KEY_SATURDAY = 'edu_student_records_registry_mvp_v3';
const LOCAL_STORAGE_KEY_SUNDAY = 'edu_student_records_registry_mvp_sunday_v3';

export default function App() {
  const [saturdayStudents, setSaturdayStudents] = useState<Student[]>([]);
  const [sundayStudents, setSundayStudents] = useState<Student[]>([]);
  const [activeDay, setActiveDay] = useState<'saturday' | 'sunday'>('saturday');
  const [loaded, setLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');

  // Load students array from localStorage on initialization
  useEffect(() => {
    try {
      // Setup Authentication Session
      const cachedLogin = localStorage.getItem('robotics_registry_logged_in');
      const cachedUser = localStorage.getItem('robotics_registry_current_user');
      const cachedRole = localStorage.getItem('robotics_registry_current_role') as 'admin' | 'user' | null;
      if (cachedLogin === 'true') {
        setIsLoggedIn(true);
        setCurrentUser(cachedUser || 'Administrator');
        setUserRole(cachedRole || 'user');
      }

      // Fetch from API with fallback
      Promise.all([
        fetch('/api/students/saturday').then((r) => {
          if (!r.ok) throw new Error("Saturday load failed");
          return r.json();
        }),
        fetch('/api/students/sunday').then((r) => {
          if (!r.ok) throw new Error("Sunday load failed");
          return r.json();
        }),
      ])
        .then(([sat, sun]) => {
          setSaturdayStudents(sat);
          setSundayStudents(sun);

          // Save to cache for local redundancy
          localStorage.setItem(LOCAL_STORAGE_KEY_SATURDAY, JSON.stringify(sat));
          localStorage.setItem(LOCAL_STORAGE_KEY_SUNDAY, JSON.stringify(sun));

          setLoaded(true);
        })
        .catch((err) => {
          console.warn('API fetch failed, reading from local caching fallback', err);

          // Setup Saturday Fallback
          const cachedSat = localStorage.getItem(LOCAL_STORAGE_KEY_SATURDAY);
          if (cachedSat) {
            const parsed = JSON.parse(cachedSat);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSaturdayStudents(parsed);
            } else {
              setSaturdayStudents(INITIAL_STUDENTS);
            }
          } else {
            setSaturdayStudents(INITIAL_STUDENTS);
          }

          // Setup Sunday Fallback
          const cachedSun = localStorage.getItem(LOCAL_STORAGE_KEY_SUNDAY);
          if (cachedSun) {
            const parsed = JSON.parse(cachedSun);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSundayStudents(parsed);
            } else {
              const sundayInitial = INITIAL_STUDENTS.map((s) => {
                if (s.id === 'STU01') return { ...s, fullName: 'AMARA SATO', email: 'amara.sato@school.edu' };
                if (s.id === 'STU02') return { ...s, fullName: 'LIAM O\'CONNOR', email: 'liam.oc@school.edu' };
                return s;
              });
              setSundayStudents(sundayInitial);
            }
          } else {
            const sundayInitial = INITIAL_STUDENTS.map((s) => {
              if (s.id === 'STU01') return { ...s, fullName: 'AMARA SATO', email: 'amara.sato@school.edu' };
              if (s.id === 'STU02') return { ...s, fullName: 'LIAM O\'CONNOR', email: 'liam.oc@school.edu' };
              return s;
            });
            setSundayStudents(sundayInitial);
          }
          setLoaded(true);
        });
    } catch (e) {
      console.warn('Initialization exception', e);
      setSaturdayStudents(INITIAL_STUDENTS);
      setSundayStudents(INITIAL_STUDENTS);
      setLoaded(true);
    }
  }, []);

  // Sync state helpers
  const handleAddStudent = async (newStudent: Student, targetDay?: 'saturday' | 'sunday') => {
    if (userRole !== 'admin') return;
    const resolvedDay = targetDay || activeDay;
    if (resolvedDay !== activeDay) {
      setActiveDay(resolvedDay);
    }
    if (resolvedDay === 'saturday') {
      setSaturdayStudents((prev) => {
        const nextList = [...prev, newStudent];
        localStorage.setItem(LOCAL_STORAGE_KEY_SATURDAY, JSON.stringify(nextList));
        return nextList;
      });
    } else {
      setSundayStudents((prev) => {
        const nextList = [...prev, newStudent];
        localStorage.setItem(LOCAL_STORAGE_KEY_SUNDAY, JSON.stringify(nextList));
        return nextList;
      });
    }

    try {
      await fetch(`/api/students/${resolvedDay}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });
    } catch (e) {
      console.error('API failed to persist added student:', e);
    }
  };

  const handleUpdateStudent = async (id: string, updatedFields: Partial<Student>) => {
    if (userRole !== 'admin') return;
    if (activeDay === 'saturday') {
      setSaturdayStudents((prev) => {
        const nextList = prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s));
        localStorage.setItem(LOCAL_STORAGE_KEY_SATURDAY, JSON.stringify(nextList));
        return nextList;
      });
    } else {
      setSundayStudents((prev) => {
        const nextList = prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s));
        localStorage.setItem(LOCAL_STORAGE_KEY_SUNDAY, JSON.stringify(nextList));
        return nextList;
      });
    }

    try {
      await fetch(`/api/students/${activeDay}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
    } catch (e) {
      console.error('API failed to persist updated student:', e);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (userRole !== 'admin') return;
    if (activeDay === 'saturday') {
      setSaturdayStudents((prev) => {
        const nextList = prev.filter((s) => s.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY_SATURDAY, JSON.stringify(nextList));
        return nextList;
      });
    } else {
      setSundayStudents((prev) => {
        const nextList = prev.filter((s) => s.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY_SUNDAY, JSON.stringify(nextList));
        return nextList;
      });
    }

    try {
      await fetch(`/api/students/${activeDay}/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('API failed to persist deleted student:', e);
    }
  };

  const handleResetDatabase = async () => {
    if (userRole !== 'admin') return;
    if (activeDay === 'saturday') {
      setSaturdayStudents(INITIAL_STUDENTS);
      localStorage.setItem(LOCAL_STORAGE_KEY_SATURDAY, JSON.stringify(INITIAL_STUDENTS));
    } else {
      const sundayInitial = INITIAL_STUDENTS.map((s) => {
        if (s.id === 'STU01') return { ...s, fullName: 'AMARA SATO', email: 'amara.sato@school.edu' };
        if (s.id === 'STU02') return { ...s, fullName: 'LIAM O\'CONNOR', email: 'liam.oc@school.edu' };
        return s;
      });
      setSundayStudents(sundayInitial);
      localStorage.setItem(LOCAL_STORAGE_KEY_SUNDAY, JSON.stringify(sundayInitial));
    }

    try {
      await fetch(`/api/students/${activeDay}/reset`, {
        method: 'POST',
      });
    } catch (e) {
      console.error('API failed to reset database:', e);
    }
  };

  const handleLoginSuccess = async (username: string, role: 'admin' | 'user', email: string) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
    setUserRole(role);
    localStorage.setItem('robotics_registry_logged_in', 'true');
    localStorage.setItem('robotics_registry_current_user', username);
    localStorage.setItem('robotics_registry_current_role', role);
    localStorage.setItem('robotics_registry_current_email', email);

    // Save a new LoginEvent in tracking database
    try {
      const storedLogsStr = localStorage.getItem('robotics_registry_login_events');
      let currentLogs = [];
      if (storedLogsStr) {
        currentLogs = JSON.parse(storedLogsStr);
      }

      const userAgent = navigator.userAgent;
      let browser = 'Chrome';
      if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
      else if (userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
      else if (userAgent.indexOf('Safari') > -1) browser = 'Safari';
      else if (userAgent.indexOf('Edge') > -1) browser = 'Edge';

      let platform = 'macOS';
      if (userAgent.indexOf('Win') > -1) platform = 'Windows';
      else if (userAgent.indexOf('Mac') > -1) platform = 'macOS';
      else if (userAgent.indexOf('Linux') > -1) platform = 'Linux';
      else if (userAgent.indexOf('Android') > -1) platform = 'Android';
      else if (userAgent.indexOf('like Mac') > -1) platform = 'iOS';

      const cambodianIps = ['103.216.142.', '116.12.44.', '203.189.155.', '175.100.22.'];
      const prefix = cambodianIps[Math.floor(Math.random() * cambodianIps.length)];
      const ipAddress = `${prefix}${Math.floor(Math.random() * 254) + 1}`;

      const newEvent = {
        id: `LOG${(currentLogs.length + 1).toString().padStart(3, '0')}`,
        email: email,
        role: role,
        timestamp: new Date().toISOString(),
        browser,
        platform,
        ipAddress,
      };

      currentLogs.unshift(newEvent); // put newest first
      localStorage.setItem('robotics_registry_login_events', JSON.stringify(currentLogs));

      await fetch('/api/login-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      });
    } catch (e) {
      console.warn('Failed to record login database logs', e);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setUserRole('user');
    localStorage.removeItem('robotics_registry_logged_in');
    localStorage.removeItem('robotics_registry_current_user');
    localStorage.removeItem('robotics_registry_current_role');
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="flex flex-col items-center space-y-3 font-mono">
          <GraduationCap className="w-10 h-10 text-indigo-400 animate-spin-slow" />
          <span className="text-xs uppercase tracking-widest text-slate-400">Loading Registry Matrix...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col antialiased selection:bg-blue-600 selection:text-white font-sans text-slate-200">
      
      {/* Top Application Ribbon Header Accent */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-3 shrink-0"
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          
          {/* Logo Brand Typography */}
          <div className="flex items-center space-x-3 select-none shrink-0">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer shadow-md"
            >
              <RoboticsIcon className="w-9 h-9" />
            </motion.div>
            <div className="hidden sm:block">
              <span className="font-display font-black text-base text-white tracking-tight flex items-center gap-2">
                <span>ROBOTICS STUDENTS MANAGEMENT</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 font-mono font-bold px-1.5 py-0.5 rounded-full border border-slate-700">v1.0.4-stable</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono block">Bento Registry Dashboard & Database Directory</p>
            </div>
            <div className="block sm:hidden">
              <span className="font-display font-black text-sm text-white tracking-tight">
                ROBOTICS REGISTRY
              </span>
            </div>
          </div>

          {/* Quick Stats Summary Tags */}
          <div className="hidden xl:flex items-center space-x-4">
            
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>Storage Status:</span>
              <span className="text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded font-mono font-bold text-[11px] border border-emerald-500/20 uppercase tracking-wider">
                Operational Cache
              </span>
            </div>

            <div className="h-4 w-[1px] bg-slate-800" />

            <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Architecture Layer:</span>
              <span className="text-sky-400 bg-sky-900/20 px-2 py-0.5 rounded font-mono font-bold text-[11px] border border-sky-500/20 uppercase tracking-wider">
                Bento-grid Modular
              </span>
            </div>

          </div>

          {/* Authenticated user session & logout button */}
          <div className="flex items-center space-x-4 shrink-0">
            <div className="hidden md:flex flex-col items-end text-right">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-350 font-sans">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="max-w-[150px] truncate uppercase">{currentUser}</span>
              </div>
              <span className="text-[9px] text-slate-500 font-mono uppercase font-bold tracking-wider">Secure Access Session</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-bold border border-slate-700 hover:border-rose-900/50 transition-all shadow-sm cursor-pointer select-none font-mono"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </motion.button>
          </div>

        </div>
      </motion.header>

      {/* Main Container splits interactive areas */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col space-y-6 overflow-hidden">
        
        {/* Manager Administration Profile with Dynamic Ambient Light Orbs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0"
        >
          <ManagerProfile role={userRole} username={currentUser} />
        </motion.div>

        {/* Full-width Graphical Registry Workspace */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <div className="mb-2 shrink-0">
            <h3 className="font-display font-semibold text-slate-200 text-sm flex items-center space-x-2">
              <Layout className="w-4 h-4 text-blue-400" />
              <span>Graphical Registry Workspace</span>
            </h3>
            <p className="text-xs text-slate-500">Observe lists, search parameters, statistics, and edit database values</p>
          </div>
          <div className="flex-1 min-h-0">
            <DashboardView
              students={activeDay === 'saturday' ? saturdayStudents : sundayStudents}
              activeDay={activeDay}
              onActiveDayChange={setActiveDay}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onResetDatabase={handleResetDatabase}
              role={userRole}
            />
          </div>
        </motion.div>

      </main>

      {/* Footer bar */}
      <footer className="bg-slate-900 border-t border-slate-850 py-3.5 px-6 select-none shrink-0 font-mono text-[10px] text-slate-500">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <span>© 2026 BackendArchitect Solutions • Architecture: Modular CRUD MVP (Bento UI)</span>
          <span>React & Tailwind CSS Active</span>
        </div>
      </footer>

    </div>
  );
}
