/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  Clock, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Mail, 
  Database,
  RefreshCw,
  X,
  FileSpreadsheet,
  AlertOctagon,
  TrendingUp,
  Sparkles,
  CheckCircle,
  Calendar,
  CalendarCheck,
  UserCheck,
  Award,
  Info
} from 'lucide-react';
import { Student } from '../types';
import RoboticsIcon from './RoboticsIcon';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardViewProps {
  students: Student[];
  activeDay: 'saturday' | 'sunday';
  onActiveDayChange: (day: 'saturday' | 'sunday') => void;
  onAddStudent: (student: Student, targetDay: 'saturday' | 'sunday') => void;
  onUpdateStudent: (id: string, fields: Partial<Student>) => void;
  onDeleteStudent: (id: string) => void;
  onResetDatabase: () => void;
  role?: 'admin' | 'user';
}

export default function DashboardView({
  students,
  activeDay,
  onActiveDayChange,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onResetDatabase,
  role = 'admin',
}: DashboardViewProps) {
  // Permission warning states
  const [permissionWarningMessage, setPermissionWarningMessage] = useState('');
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const verifyAdminPermission = (actionName: string): boolean => {
    if (role === 'admin') return true;
    setPermissionWarningMessage(`Standard users do not have permissions to ${actionName}. Please log in under the raksalun7@gmail.com developer account to obtain full administrative database write clearance.`);
    setShowPermissionModal(true);
    return false;
  };

  const handleResetClick = () => {
    if (verifyAdminPermission('reset the database to initial seed states')) {
      onResetDatabase();
    }
  };

  const handleDeleteClick = (studentId: string) => {
    if (verifyAdminPermission('delete student registration entries')) {
      onDeleteStudent(studentId);
    }
  };

  // Search filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('ALL');
  
  // Create / Edit modal state
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Interactive GUI Form state
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formCourse, setFormCourse] = useState('');
  const [formSession, setFormSession] = useState('');
  const [formLevel, setFormLevel] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDay, setFormDay] = useState<'saturday' | 'sunday'>('saturday');
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 18-week attendance tracking mode states
  const [currentView, setCurrentView] = useState<'registry' | 'attendance'>('registry');
  const [selectedWeekDetail, setSelectedWeekDetail] = useState<string>('all');
  const [activeCellSelect, setActiveCellSelect] = useState<{ studentId: string; weekKey: string } | null>(null);

  // Helper to count student levels dynamically
  const getLevelCount = (lvl: string) => {
    if (lvl === 'ALL') return students.length;
    return students.filter(s => (s.level || '').toLowerCase() === lvl.toLowerCase()).length;
  };

  // Search filter implementation
  const filteredStudents = students.filter(student => {
    // Filter by Level Group
    if (selectedLevelFilter !== 'ALL') {
      if ((student.level || '').toLowerCase() !== selectedLevelFilter.toLowerCase()) {
        return false;
      }
    }
    
    // Filter by Search Query
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      student.id.toLowerCase().includes(q) ||
      student.fullName.toLowerCase().includes(q) ||
      student.course.toLowerCase().includes(q) ||
      (student.session && student.session.toLowerCase().includes(q)) ||
      (student.level && student.level.toLowerCase().includes(q)) ||
      (student.email && student.email.toLowerCase().includes(q))
    );
  });

  // Calculate quick analytics
  const totalCount = students.length;
  const averageAge = totalCount > 0 
    ? (students.reduce((acc, s) => acc + s.age, 0) / totalCount).toFixed(1) 
    : '0.0';

  const levelCountMap: Record<string, number> = {};
  students.forEach(s => {
    const lvl = s.level || '3D';
    levelCountMap[lvl] = (levelCountMap[lvl] || 0) + 1;
  });

  // Find most frequent class level
  let topLevel = 'N/A';
  let topLevelCount = 0;
  Object.entries(levelCountMap).forEach(([lvl, cnt]) => {
    if (cnt > topLevelCount) {
      topLevelCount = cnt;
      topLevel = lvl;
    }
  });

  const handleOpenCreateForm = () => {
    if (!verifyAdminPermission('register/enroll new students')) return;
    // Generate a default available STU ID sequentially starting from STU01
    const currentMaxNum = students.reduce((max, s) => {
      const match = s.id.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);

    const nextNum = currentMaxNum === 0 ? 1 : currentMaxNum + 1;
    const paddedNum = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    setFormId(`STU${paddedNum}`);
    setFormName('');
    setFormAge('18');
    setFormCourse('Level 1');
    setFormSession('Session01');
    setFormLevel(selectedLevelFilter !== 'ALL' ? selectedLevelFilter : '3D');
    setFormEmail('');
    setFormError('');
    setFormDay(activeDay);
    setIsEditing(false);
    setSelectedStudent(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (student: Student) => {
    if (!verifyAdminPermission('modify existing student directory records')) return;
    setSelectedStudent(student);
    setFormId(student.id);
    setFormName(student.fullName);
    setFormAge(student.age.toString());
    setFormCourse(student.course);
    setFormSession(student.session || 'Session01');
    setFormLevel(student.level || '3D');
    setFormEmail(student.email || '');
    setFormError('');
    setFormDay(activeDay);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleToggleAttendance = (studentId: string, weekKey: string, status: 'P' | 'A' | 'L' | 'E' | undefined) => {
    if (!verifyAdminPermission('update student attendance records')) return;
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    const currentAttendance = student.attendance || {};
    const updatedAttendance = { ...currentAttendance };
    if (status === undefined) {
      delete updatedAttendance[weekKey];
    } else {
      updatedAttendance[weekKey] = status;
    }
    onUpdateStudent(studentId, { attendance: updatedAttendance });
  };

  const handleBulkMarkWeek = (weekKey: string, status: 'P' | 'A' | 'L' | 'E' | undefined) => {
    if (!verifyAdminPermission(`bulk mark week ${weekKey.replace('week', '')}`)) return;
    filteredStudents.forEach(stu => {
      const currentAttendance = stu.attendance || {};
      const updatedAttendance = { ...currentAttendance };
      if (status === undefined) {
        delete updatedAttendance[weekKey];
      } else {
        updatedAttendance[weekKey] = status;
      }
      onUpdateStudent(stu.id, { attendance: updatedAttendance });
    });
    setSuccessMsg(`Successfully updated all matching students for ${weekKey.replace('week', 'Week ')}.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const renderAttendanceCell = (student: Student, weekKey: string) => {
    const status = student.attendance?.[weekKey];
    let cellBg = "bg-slate-950/20 text-slate-600 hover:text-slate-400 border-slate-900/60";
    let statusLabel = "—";
    
    if (status === 'P') {
      cellBg = "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/25";
      statusLabel = "P";
    } else if (status === 'A') {
      cellBg = "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/25";
      statusLabel = "A";
    } else if (status === 'L') {
      cellBg = "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/25";
      statusLabel = "L";
    } else if (status === 'E') {
      cellBg = "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/25";
      statusLabel = "E";
    }

    return (
      <td key={weekKey} className="p-1 px-1.5 border-r border-slate-800/40 text-center">
        {role === 'admin' ? (
          <select
            value={status || ''}
            onChange={(e) => handleToggleAttendance(student.id, weekKey, (e.target.value || undefined) as any)}
            className={`w-9 h-7 text-[10px] font-bold font-mono transition-colors rounded-lg border outline-none text-center cursor-pointer select-none ${cellBg}`}
            style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
            title={`Week ${weekKey.replace('week', '')} status`}
          >
            <option value="" className="bg-slate-950 text-slate-500 font-mono font-bold">—</option>
            <option value="P" className="bg-slate-950 text-emerald-400 font-mono font-bold">P</option>
            <option value="A" className="bg-slate-950 text-rose-400 font-mono font-bold">A</option>
            <option value="L" className="bg-slate-950 text-amber-400 font-mono font-bold">L</option>
            <option value="E" className="bg-slate-950 text-blue-400 font-mono font-bold">E</option>
          </select>
        ) : (
          <div className={`w-9 h-7 text-[10px] font-bold font-mono rounded-lg border flex items-center justify-center select-none ${cellBg}`}>
            {statusLabel}
          </div>
        )}
      </td>
    );
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    const cleanId = formId.trim().toUpperCase();
    const cleanName = formName.trim().toUpperCase();
    const cleanCourse = formCourse.trim();
    const cleanSession = formSession.trim();
    const cleanLevel = formLevel.trim();
    const ageNum = parseInt(formAge, 10);

    // Form inputs validation parameters
    if (!cleanId) {
      setFormError('Unique Student ID is required.');
      return;
    }
    if (!cleanName) {
      setFormError('Full student name is required.');
      return;
    }
    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 110) {
      setFormError('Age must be a valid positive number between 1 and 110.');
      return;
    }
    if (!cleanCourse) {
      setFormError('Level field is required.');
      return;
    }
    if (!cleanSession) {
      setFormError('Session is required.');
      return;
    }
    if (!cleanLevel) {
      setFormError('Course is required.');
      return;
    }

    if (isEditing) {
      // Handle update fields
      onUpdateStudent(cleanId, {
        fullName: cleanName,
        age: ageNum,
        course: cleanCourse,
        session: cleanSession,
        level: cleanLevel,
      });
      setSuccessMsg(`Successfully updated properties for Student "${cleanName}" (${cleanId}).`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setSelectedStudent(null);
      setIsFormOpen(false); // Close modal
    } else {
      // Validate unique key conflict
      if (students.some(s => s.id === cleanId)) {
        setFormError(`Conflict: Student ID "${cleanId}" is already registered.`);
        return;
      }
      const newS: Student = {
        id: cleanId,
        fullName: cleanName,
        age: ageNum,
        course: cleanCourse,
        session: cleanSession,
        level: cleanLevel,
      };
      onAddStudent(newS, formDay);
      setSuccessMsg(`Successfully enrolled and registered student "${cleanName}" to Registry.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsFormOpen(false); // Close modal
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans text-slate-200">
      
      {/* Role State Banner */}
      {role === 'user' ? (
        <div className="bg-amber-600/10 border-b border-amber-500/10 px-5 py-2 flex items-center justify-between gap-4 font-sans select-none shrink-0 text-[11px] text-amber-400">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
            </span>
            <span>
              <strong>GUEST ACCESS (READ-ONLY)</strong> • Registries can be explored and searched but write modifications require the administrator role.
            </span>
          </div>
          <span className="font-mono text-[9px] bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/30 uppercase leading-none font-bold shrink-0">Viewer mode</span>
        </div>
      ) : (
        <div className="bg-blue-600/10 border-b border-blue-500/10 px-5 py-2 flex items-center justify-between gap-4 font-sans select-none shrink-0 text-[11px] text-blue-400">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
            </span>
            <span>
              <strong>ADMIN ACCESS (DEVELOPER)</strong> • Full read and write authority is active on all local caches and sequential student sequence STU registries.
            </span>
          </div>
          <span className="font-mono text-[9px] bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-800/20 uppercase leading-none font-bold shrink-0">Admin authorized</span>
        </div>
      )}
      
      {/* Top Banner */}
      <div className="bg-slate-950 text-white px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none shrink-0">
        <div className="flex items-center space-x-2.5">
          <RoboticsIcon className="w-8 h-8 rounded-lg shadow-md hover:scale-105 transition-all cursor-pointer" />
          <div>
            <h2 className="font-display font-semibold text-sm tracking-tight text-slate-100 flex items-center gap-1.5">
              <span>DATABASE MONITOR</span>
              <span className="text-[10px] bg-blue-950/50 text-blue-400 font-mono font-semibold px-2 py-0.5 rounded border border-blue-800/40 uppercase">
                {activeDay === 'saturday' ? '(On Saturday)' : '(On Sunday)'}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 font-mono">MVP Dashboard Engine Synchronized With CLI</p>
          </div>
        </div>

        {/* Dynamic View Selector and Day Monitor Selector Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Main View Switcher */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800/80 text-xs shrink-0 select-none">
            <button
              onClick={() => setCurrentView('registry')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                currentView === 'registry'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>REGISTRY DIRECTORY</span>
            </button>
            <button
              onClick={() => setCurrentView('attendance')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                currentView === 'attendance'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>WEEKLY ATTENDANCE (18 Wks)</span>
            </button>
          </div>

          <div className="hidden md:block w-[1px] h-6 bg-slate-800" />

          {/* Day Monitor selector tabs */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800/80 text-xs shrink-0 select-none">
            <button
              onClick={() => onActiveDayChange('saturday')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono tracking-wider transition-all duration-300 cursor-pointer ${
                activeDay === 'saturday'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              SATURDAY
            </button>
            <button
              onClick={() => onActiveDayChange('sunday')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold font-mono tracking-wider transition-all duration-300 cursor-pointer ${
                activeDay === 'sunday'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              SUNDAY
            </button>
          </div>

          <button
            onClick={handleResetClick}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 rounded-lg text-xs font-semibold border border-slate-700/60 transition-all cursor-pointer"
            title="Reset system database state to original fallback set"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Analytics Header Metrics Layout (Bento Grid Elements) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-950/40 border-b border-slate-800/80 shrink-0">
        
        {/* Metric Card 1 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.02, y: -2, borderColor: "rgba(59, 130, 246, 0.3)" }}
          transition={{ duration: 0.4, delay: 0.05, type: "spring", stiffness: 120 }}
          className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-md flex items-center space-x-3 transition-colors cursor-default select-none"
        >
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Students</div>
            <div className="text-lg font-bold font-display text-white leading-tight">
              {totalCount} <span className="text-[10px] text-slate-500 font-sans font-normal">enrolled</span>
            </div>
          </div>
        </motion.div>

        {/* Metric Card 2 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.02, y: -2, borderColor: "rgba(245, 158, 11, 0.3)" }}
          transition={{ duration: 0.4, delay: 0.12, type: "spring", stiffness: 120 }}
          className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-md flex items-center space-x-3 transition-colors cursor-default select-none"
        >
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Average Age</div>
            <div className="text-lg font-bold font-display text-white leading-tight">
              {averageAge} <span className="text-[10px] text-slate-500 font-sans font-normal">years</span>
            </div>
          </div>
        </motion.div>

        {/* Metric Card 3 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.02, y: -2, borderColor: "rgba(16, 185, 129, 0.3)" }}
          transition={{ duration: 0.4, delay: 0.18, type: "spring", stiffness: 120 }}
          className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-md flex items-center space-x-3 transition-colors cursor-default select-none"
        >
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Primary Course</div>
            <div className="text-lg font-bold font-display text-white leading-tight truncate max-w-[130px]" title={topLevel}>
              {topLevel} <span className="text-[9px] text-slate-500 font-sans font-normal">({topLevelCount})</span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Dynamic Course Filter Selector Row */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center gap-1.5 shrink-0 select-none">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono mr-1.5 flex items-center space-x-1">
          <span>Course Switcher:</span>
        </span>
        {['ALL', '3D', 'Python', 'Sensor', 'AI', 'Super:Bit', 'HTML,CSS'].map((lvl) => {
          const isActive = selectedLevelFilter.toLowerCase() === lvl.toLowerCase();
          const count = getLevelCount(lvl);
          return (
            <button
              key={lvl}
              onClick={() => setSelectedLevelFilter(lvl)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold font-mono tracking-wide transition-all duration-300 cursor-pointer flex items-center space-x-1.5 border ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/30 shadow-sm shadow-blue-500/10'
                  : 'bg-slate-900 status-level-btn text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800/80'
              }`}
            >
              <span>{lvl.toUpperCase()}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-sans ${
                isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-950 text-slate-500 font-semibold'
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        
        {currentView === 'registry' ? (
          /* Full-width central database monitor list */
          <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
          
          {/* List Toolbar Controls */}
          <div className="p-3 border-b border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 bg-slate-950/40">
            
            <div className="relative flex-1 max-w-none sm:max-w-sm">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                aria-label="Filter Registry"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Unique ID or Name..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-medium text-slate-200"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 font-sans text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpenCreateForm}
              className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg transition-all cursor-pointer select-none w-full sm:w-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register Student</span>
            </motion.button>
          </div>

          {/* Student Grid Table wrapper */}
          <div className="flex-1 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="p-3 bg-slate-950 text-slate-500 rounded-full mb-3 border border-slate-800">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h4 className="font-display font-semibold text-slate-300 text-sm">No Student Records Found</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1 font-sans">
                  We searched existing database pools but found zero matching entries. Try clearing filters or create a new student directory.
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Clear Filter Query
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop View Table */}
                <div className="hidden md:block min-w-full inline-block align-middle overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800 table-auto text-left">
                    <thead className="bg-slate-950/60">
                      <tr className="border-b border-slate-800/50">
                        <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">ID</th>
                        <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Full Name</th>
                        <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Age</th>
                        <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-sans">Course</th>
                        <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Level</th>
                        <th scope="col" className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Session</th>
                        <th scope="col" className="relative px-5 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 bg-slate-900/40">
                      <AnimatePresence mode="popLayout">
                        {filteredStudents.map((student) => (
                          <motion.tr 
                            key={student.id} 
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="hover:bg-slate-800/40 transition-colors group"
                          >
                            <td className="whitespace-nowrap px-5 py-3 text-xs font-mono font-semibold text-blue-400">
                              <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800/80">{student.id}</span>
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                              {student.fullName}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 text-xs font-medium text-slate-350 font-mono">
                              {student.age}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 text-xs">
                              <select
                                value={student.level || '3D'}
                                aria-label={`Change course for ${student.fullName}`}
                                onChange={(e) => onUpdateStudent(student.id, { level: e.target.value })}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer outline-none bg-transparent select-none ${
                                  (student.level || '').toLowerCase().includes('3d') 
                                    ? 'bg-amber-950/40 text-amber-400 border-amber-900/40 hover:bg-amber-900/20' 
                                    : (student.level || '').toLowerCase().includes('python')
                                    ? 'bg-indigo-950/40 text-indigo-400 border-indigo-850 hover:bg-indigo-900/20'
                                    : (student.level || '').toLowerCase().includes('sensor')
                                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40 hover:bg-emerald-900/20'
                                    : (student.level || '').toLowerCase().includes('ai')
                                    ? 'bg-purple-950/40 text-fuchsia-400 border-purple-900/40 hover:bg-purple-900/20'
                                    : (student.level || '').toLowerCase().includes('super:bit')
                                    ? 'bg-blue-950/40 text-blue-400 border-blue-900/40 hover:bg-blue-900/20'
                                    : (student.level || '').toLowerCase().includes('html') || (student.level || '').toLowerCase().includes('css')
                                    ? 'bg-rose-950/40 text-rose-400 border-rose-900/40 hover:bg-rose-900/20'
                                    : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:bg-slate-800/20'
                                }`}
                              >
                                <option value="3D" className="bg-slate-900 text-amber-400 font-semibold font-mono">3D</option>
                                <option value="Python" className="bg-slate-900 text-indigo-450 font-semibold font-mono">PYTHON</option>
                                <option value="Sensor" className="bg-slate-900 text-emerald-400 font-semibold font-mono">SENSOR</option>
                                <option value="AI" className="bg-slate-900 text-fuchsia-450 font-semibold font-mono">AI</option>
                                <option value="Super:Bit" className="bg-slate-900 text-blue-400 font-semibold font-mono">SUPER:BIT</option>
                                <option value="HTML,CSS" className="bg-slate-900 text-rose-400 font-semibold font-mono">HTML,CSS</option>
                              </select>
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 text-xs">
                              <select
                                value={student.course || 'Level 1'}
                                aria-label={`Change level for ${student.fullName}`}
                                onChange={(e) => onUpdateStudent(student.id, { course: e.target.value })}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer outline-none bg-transparent select-none ${
                                  (student.course || '').toLowerCase().includes('level 1') || (student.course || '').toLowerCase().includes('level1')
                                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40 hover:bg-emerald-900/20' 
                                    : (student.course || '').toLowerCase().includes('level 2') || (student.course || '').toLowerCase().includes('level2')
                                    ? 'bg-blue-950/40 text-blue-400 border-blue-900/40 hover:bg-blue-900/20'
                                    : (student.course || '').toLowerCase().includes('level 3') || (student.course || '').toLowerCase().includes('level3')
                                    ? 'bg-indigo-950/40 text-indigo-400 border-indigo-850 hover:bg-indigo-900/20'
                                    : (student.course || '').toLowerCase().includes('level 4') || (student.course || '').toLowerCase().includes('level4')
                                    ? 'bg-sky-950/40 text-sky-400 border-sky-900/40 hover:bg-sky-900/20'
                                    : (student.course || '').toLowerCase().includes('level 5') || (student.course || '').toLowerCase().includes('level5')
                                    ? 'bg-amber-950/40 text-amber-400 border-amber-900/40 hover:bg-amber-900/20'
                                    : (student.course || '').toLowerCase().includes('level 6') || (student.course || '').toLowerCase().includes('level6') || (student.course || '').toLowerCase().includes('level,6')
                                    ? 'bg-fuchsia-950/40 text-fuchsia-400 border-fuchsia-900/40 hover:bg-fuchsia-905/20'
                                    : (student.course || '').toLowerCase().includes('new course') || (student.course || '').toLowerCase().includes('newcourse')
                                    ? 'bg-purple-950/40 text-purple-400 border-purple-900/40 hover:bg-purple-900/20'
                                    : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:bg-slate-800/20'
                                }`}
                              >
                                <option value="Level 1" className="bg-slate-900 text-emerald-400 font-semibold font-mono">Level 1</option>
                                <option value="Level 2" className="bg-slate-900 text-blue-400 font-semibold font-mono">Level 2</option>
                                <option value="Level 3" className="bg-slate-900 text-indigo-400 font-semibold font-mono">Level 3</option>
                                <option value="Level 4" className="bg-slate-900 text-sky-400 font-semibold font-mono">Level 4</option>
                                <option value="Level 5" className="bg-slate-900 text-amber-400 font-semibold font-mono">Level 5</option>
                                <option value="Level 6" className="bg-slate-900 text-fuchsia-400 font-semibold font-mono">Level 6</option>
                                <option value="New Course" className="bg-slate-900 text-purple-400 font-semibold font-mono">New Course</option>
                                {student.course && ![
                                  'level 1', 'level 2', 'level 3', 'level 4', 'level 5', 'level 6', 'new course',
                                  'level1', 'level2', 'level3', 'level4', 'level5', 'level,6', 'level6', 'newcourse'
                                ].includes(student.course.toLowerCase()) && (
                                  <option value={student.course} className="bg-slate-900 text-slate-350 font-semibold font-mono">
                                    {student.course}
                                  </option>
                                )}
                              </select>
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 text-xs">
                              <select
                                value={student.session || 'Session01'}
                                aria-label={`Change session for ${student.fullName}`}
                                onChange={(e) => onUpdateStudent(student.id, { session: e.target.value })}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer outline-none bg-transparent select-none uppercase font-mono ${
                                  (student.session || '').toLowerCase() === 'session01'
                                    ? 'bg-teal-950/40 text-teal-400 border-teal-900/40 hover:bg-teal-900/20' 
                                    : (student.session || '').toLowerCase() === 'session02'
                                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40 hover:bg-emerald-900/20'
                                    : (student.session || '').toLowerCase() === 'session03'
                                    ? 'bg-sky-950/40 text-sky-400 border-sky-900/40 hover:bg-sky-900/20'
                                    : (student.session || '').toLowerCase() === 'session04'
                                    ? 'bg-blue-950/40 text-blue-400 border-blue-900/40 hover:bg-blue-900/20'
                                    : (student.session || '').toLowerCase() === 'session05'
                                    ? 'bg-indigo-950/40 text-indigo-400 border-indigo-850 hover:bg-indigo-900/20'
                                    : (student.session || '').toLowerCase() === 'session06'
                                    ? 'bg-purple-950/40 text-purple-400 border-purple-900/40 hover:bg-purple-900/20'
                                    : (student.session || '').toLowerCase() === 'session07'
                                    ? 'bg-fuchsia-950/40 text-fuchsia-400 border-fuchsia-900/40 hover:bg-fuchsia-905/20'
                                    : (student.session || '').toLowerCase() === 'session08'
                                    ? 'bg-pink-950/40 text-pink-400 border-pink-900/40 hover:bg-pink-900/20'
                                    : (student.session || '').toLowerCase() === 'session09'
                                    ? 'bg-rose-950/40 text-rose-400 border-rose-900/40 hover:bg-rose-905/20'
                                    : (student.session || '').toLowerCase() === 'session10'
                                    ? 'bg-amber-950/40 text-amber-400 border-amber-900/40 hover:bg-amber-900/20'
                                    : (student.session || '').toLowerCase() === 'session11'
                                    ? 'bg-orange-950/40 text-orange-400 border-orange-900/40 hover:bg-orange-900/20'
                                    : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:bg-slate-800/20'
                                }`}
                              >
                                <option value="Session01" className="bg-slate-900 text-teal-400 font-semibold font-mono">Session01</option>
                                <option value="Session02" className="bg-slate-900 text-emerald-400 font-semibold font-mono">Session02</option>
                                <option value="Session03" className="bg-slate-900 text-sky-400 font-semibold font-mono">Session03</option>
                                <option value="Session04" className="bg-slate-900 text-blue-400 font-semibold font-mono">Session04</option>
                                <option value="Session05" className="bg-slate-900 text-indigo-400 font-semibold font-mono">Session05</option>
                                <option value="Session06" className="bg-slate-900 text-purple-400 font-semibold font-mono">Session06</option>
                                <option value="Session07" className="bg-slate-900 text-fuchsia-400 font-semibold font-mono">Session07</option>
                                <option value="Session08" className="bg-slate-900 text-pink-400 font-semibold font-mono">Session08</option>
                                <option value="Session09" className="bg-slate-900 text-rose-400 font-semibold font-mono">Session09</option>
                                <option value="Session10" className="bg-slate-900 text-amber-400 font-semibold font-mono">Session10</option>
                                <option value="Session11" className="bg-slate-900 text-orange-400 font-semibold font-mono">Session11</option>
                                {student.session && ![
                                  'session01', 'session02', 'session03', 'session04', 'session05', 'session06',
                                  'session07', 'session08', 'session09', 'session10', 'session11'
                                ].includes(student.session.toLowerCase()) && (
                                  <option value={student.session} className="bg-slate-950 text-slate-350 font-semibold font-mono">
                                    {student.session}
                                  </option>
                                )}
                              </select>
                            </td>
                            <td className="whitespace-nowrap px-5 py-3 text-right text-xs font-medium space-x-2">
                              <button
                                onClick={() => handleOpenEditForm(student)}
                                className="inline-flex items-center p-1.5 bg-slate-950 hover:bg-blue-900/30 text-slate-400 hover:text-blue-400 rounded-md border border-slate-800 hover:border-blue-800/50 transition-all cursor-pointer"
                                title={`Edit details for ${student.fullName}`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(student.id)}
                                className="inline-flex items-center p-1.5 bg-slate-950 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 rounded-md border border-slate-800 hover:border-rose-800/50 transition-all cursor-pointer"
                                title={`Delete ${student.fullName} from core database`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Mobile View Student Cards Grid */}
                <div className="block md:hidden divide-y divide-slate-800/60 overflow-y-auto">
                  <AnimatePresence mode="popLayout">
                    {filteredStudents.map((student) => (
                      <motion.div
                        key={student.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="p-4 bg-slate-900/40 hover:bg-slate-800/20 transition-all flex flex-col space-y-3.5"
                      >
                        {/* Name Header, Key & Quick Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10px] font-mono font-bold text-blue-400 shrink-0">
                              {student.id}
                            </span>
                            <span className="font-semibold text-white text-xs truncate">
                              {student.fullName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              onClick={() => handleOpenEditForm(student)}
                              className="inline-flex items-center p-2 bg-slate-950 hover:bg-blue-900/30 text-slate-400 hover:text-blue-400 rounded-md border border-slate-800 hover:border-blue-800/50 transition-all cursor-pointer"
                              title={`Edit details for ${student.fullName}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(student.id)}
                              className="inline-flex items-center p-2 bg-slate-950 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 rounded-md border border-slate-800 hover:border-rose-800/50 transition-all cursor-pointer"
                              title={`Delete ${student.fullName} from core database`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Age Meta field */}
                        <div className="text-[10px] font-mono">
                          <div className="bg-slate-950/40 px-2.5 py-1 rounded border border-slate-800/50 flex items-center justify-between">
                            <span className="text-slate-500 uppercase font-bold text-[9px]">Age</span>
                            <span className="text-slate-200 font-semibold">{student.age} yrs</span>
                          </div>
                        </div>

                        {/* Selection controls for Course, Level, Session */}
                        <div className="grid grid-cols-3 gap-2 pt-1.5">
                          {/* Course select */}
                          <div className="flex flex-col space-y-1">
                            <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider font-mono">Course</label>
                            <select
                              value={student.level || '3D'}
                              aria-label={`Change course for ${student.fullName}`}
                              onChange={(e) => onUpdateStudent(student.id, { level: e.target.value })}
                              className={`w-full px-1.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer outline-none bg-transparent select-none text-center ${
                                (student.level || '').toLowerCase().includes('3d') 
                                  ? 'bg-amber-950/40 text-amber-400 border-amber-900/40 hover:bg-amber-900/20' 
                                  : (student.level || '').toLowerCase().includes('python')
                                  ? 'bg-indigo-950/40 text-indigo-400 border-indigo-850 hover:bg-indigo-900/20'
                                  : (student.level || '').toLowerCase().includes('sensor')
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-950 hover:bg-emerald-950/20'
                                  : (student.level || '').toLowerCase().includes('ai')
                                  ? 'bg-purple-950/40 text-fuchsia-400 border-purple-900/40 hover:bg-purple-900/20'
                                  : (student.level || '').toLowerCase().includes('super:bit')
                                  ? 'bg-blue-950/40 text-blue-400 border-blue-900/40 hover:bg-blue-900/20'
                                  : (student.level || '').toLowerCase().includes('html') || (student.level || '').toLowerCase().includes('css')
                                  ? 'bg-rose-950/40 text-rose-400 border-rose-900/40 hover:bg-rose-900/20'
                                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:bg-slate-800/20'
                              }`}
                            >
                              <option value="3D" className="bg-slate-900 text-amber-400 font-semibold font-mono">3D</option>
                              <option value="Python" className="bg-slate-900 text-indigo-400 font-semibold font-mono">PYTHON</option>
                              <option value="Sensor" className="bg-slate-900 text-emerald-400 font-semibold font-mono">SENSOR</option>
                              <option value="AI" className="bg-slate-900 text-fuchsia-400 font-semibold font-mono">AI</option>
                              <option value="Super:Bit" className="bg-slate-900 text-blue-400 font-semibold font-mono">SUPER:BIT</option>
                              <option value="HTML,CSS" className="bg-slate-900 text-rose-400 font-semibold font-mono">HTML,CSS</option>
                            </select>
                          </div>

                          {/* Level selector */}
                          <div className="flex flex-col space-y-1">
                            <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider font-mono">Level</label>
                            <select
                              value={student.course || 'Level 1'}
                              aria-label={`Change level for ${student.fullName}`}
                              onChange={(e) => onUpdateStudent(student.id, { course: e.target.value })}
                              className={`w-full px-1.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer outline-none bg-transparent select-none text-center ${
                                (student.course || '').toLowerCase().includes('level 1') || (student.course || '').toLowerCase().includes('level1')
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40 hover:bg-emerald-900/20' 
                                  : (student.course || '').toLowerCase().includes('level 2') || (student.course || '').toLowerCase().includes('level2')
                                  ? 'bg-blue-950/40 text-blue-400 border-blue-900/40 hover:bg-blue-900/20'
                                  : (student.course || '').toLowerCase().includes('level 3') || (student.course || '').toLowerCase().includes('level3')
                                  ? 'bg-indigo-950/40 text-indigo-400 border-indigo-850 hover:bg-indigo-900/20'
                                  : (student.course || '').toLowerCase().includes('level 4') || (student.course || '').toLowerCase().includes('level4')
                                  ? 'bg-sky-950/40 text-sky-400 border-sky-900/40 hover:bg-sky-900/20'
                                  : (student.course || '').toLowerCase().includes('level 5') || (student.course || '').toLowerCase().includes('level5')
                                  ? 'bg-amber-950/40 text-amber-400 border-amber-900/40 hover:bg-amber-900/20'
                                  : (student.course || '').toLowerCase().includes('level 6') || (student.course || '').toLowerCase().includes('level6') || (student.course || '').toLowerCase().includes('level,6')
                                  ? 'bg-fuchsia-950/40 text-fuchsia-400 border-fuchsia-900/40 hover:bg-fuchsia-905/20'
                                  : (student.course || '').toLowerCase().includes('new course') || (student.course || '').toLowerCase().includes('newcourse')
                                  ? 'bg-purple-950/40 text-purple-400 border-purple-900/40 hover:bg-purple-900/20'
                                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:bg-slate-800/20'
                              }`}
                            >
                              <option value="Level 1" className="bg-slate-900 text-emerald-400 font-semibold font-mono">Level 1</option>
                              <option value="Level 2" className="bg-slate-900 text-blue-400 font-semibold font-mono">Level 2</option>
                              <option value="Level 3" className="bg-slate-900 text-indigo-400 font-semibold font-mono">Level 3</option>
                              <option value="Level 4" className="bg-slate-900 text-sky-400 font-semibold font-mono">Level 4</option>
                              <option value="Level 5" className="bg-slate-900 text-amber-400 font-semibold font-mono">Level 5</option>
                              <option value="Level 6" className="bg-slate-900 text-fuchsia-400 font-semibold font-mono">Level 6</option>
                              <option value="New Course" className="bg-slate-900 text-purple-400 font-semibold font-mono">New Course</option>
                              {student.course && ![
                                'level 1', 'level 2', 'level 3', 'level 4', 'level 5', 'level 6', 'new course',
                                'level1', 'level2', 'level3', 'level4', 'level5', 'level,6', 'level6', 'newcourse'
                              ].includes(student.course.toLowerCase()) && (
                                <option value={student.course} className="bg-slate-900 text-slate-350 font-semibold font-mono">
                                  {student.course}
                                </option>
                              )}
                            </select>
                          </div>

                          {/* Session select */}
                          <div className="flex flex-col space-y-1">
                            <label className="text-[9px] text-slate-500 uppercase font-bold tracking-wider font-mono">Session</label>
                            <select
                              value={student.session || 'Session01'}
                              aria-label={`Change session for ${student.fullName}`}
                              onChange={(e) => onUpdateStudent(student.id, { session: e.target.value })}
                              className={`w-full px-1.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer outline-none bg-transparent select-none uppercase font-mono text-center ${
                                (student.session || '').toLowerCase() === 'session01'
                                  ? 'bg-teal-950/40 text-teal-400 border-teal-900/40 hover:bg-teal-900/20' 
                                  : (student.session || '').toLowerCase() === 'session02'
                                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/40 hover:bg-emerald-900/20'
                                  : (student.session || '').toLowerCase() === 'session03'
                                  ? 'bg-sky-950/40 text-sky-400 border-sky-900/40 hover:bg-sky-900/20'
                                  : (student.session || '').toLowerCase() === 'session04'
                                  ? 'bg-blue-950/40 text-blue-400 border-blue-900/40 hover:bg-blue-900/20'
                                  : (student.session || '').toLowerCase() === 'session05'
                                  ? 'bg-indigo-950/40 text-indigo-400 border-indigo-850 hover:bg-indigo-900/20'
                                  : (student.session || '').toLowerCase() === 'session06'
                                  ? 'bg-purple-950/40 text-purple-400 border-purple-900/40 hover:bg-purple-900/20'
                                  : (student.session || '').toLowerCase() === 'session07'
                                  ? 'bg-fuchsia-950/40 text-fuchsia-400 border-fuchsia-900/40 hover:bg-fuchsia-905/20'
                                  : (student.session || '').toLowerCase() === 'session08'
                                  ? 'bg-pink-950/40 text-pink-400 border-pink-900/40 hover:bg-pink-900/20'
                                  : (student.session || '').toLowerCase() === 'session09'
                                  ? 'bg-rose-950/40 text-rose-400 border-rose-900/40 hover:bg-rose-905/20'
                                  : (student.session || '').toLowerCase() === 'session10'
                                  ? 'bg-amber-950/40 text-amber-400 border-amber-900/40 hover:bg-amber-900/20'
                                  : (student.session || '').toLowerCase() === 'session11'
                                  ? 'bg-orange-950/40 text-orange-400 border-orange-900/40 hover:bg-orange-900/20'
                                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:bg-slate-800/20'
                              }`}
                            >
                              <option value="Session01" className="bg-slate-900 text-teal-400 font-semibold font-mono">Session01</option>
                              <option value="Session02" className="bg-slate-900 text-emerald-400 font-semibold font-mono">Session02</option>
                              <option value="Session03" className="bg-slate-900 text-sky-400 font-semibold font-mono">Session03</option>
                              <option value="Session04" className="bg-slate-900 text-blue-400 font-semibold font-mono">Session04</option>
                              <option value="Session05" className="bg-slate-900 text-indigo-400 font-semibold font-mono">Session05</option>
                              <option value="Session06" className="bg-slate-900 text-purple-400 font-semibold font-mono">Session06</option>
                              <option value="Session07" className="bg-slate-900 text-fuchsia-400 font-semibold font-mono">Session07</option>
                              <option value="Session08" className="bg-slate-900 text-pink-400 font-semibold font-mono">Session08</option>
                              <option value="Session09" className="bg-slate-900 text-rose-400 font-semibold font-mono">Session09</option>
                              <option value="Session10" className="bg-slate-900 text-amber-400 font-semibold font-mono">Session10</option>
                              <option value="Session11" className="bg-slate-900 text-orange-400 font-semibold font-mono">Session11</option>
                              {student.session && ![
                                'session01', 'session02', 'session03', 'session04', 'session05', 'session06',
                                'session07', 'session08', 'session09', 'session10', 'session11'
                              ].includes(student.session.toLowerCase()) && (
                                <option value={student.session} className="bg-slate-900 text-slate-350 font-semibold font-mono">
                                  {student.session}
                                </option>
                              )}
                            </select>
                          </div>
                        </div>

                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Secure Live Sync Info Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 shrink-0">
            <div className="flex items-center space-x-2 select-none">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-slate-400">Database synchronized and protected via client-side storage cache.</span>
            </div>
            <div className="flex items-center justify-end space-x-4 select-none">
              <span><strong>Search:</strong> Matches IDs/Names dynamically</span>
              <span>•</span>
              <span><strong>Autosave:</strong> Enabled</span>
            </div>
          </div>

        </div>
      ) : (
        /* Full-width central database monitor list - Attendance View */
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-hidden">
          {/* List Toolbar Controls for Attendance */}
          <div className="p-3 border-b border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0 bg-slate-950/40">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-mono uppercase font-bold text-[10px]">Filter/Focus Week:</span>
              <select
                value={selectedWeekDetail}
                onChange={(e) => setSelectedWeekDetail(e.target.value)}
                className="px-2.5 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-200 outline-none focus:border-blue-500 cursor-pointer font-bold"
              >
                <option value="all">SHOW ALL WEEKS (1-18)</option>
                {Array.from({ length: 18 }, (_, i) => {
                  const wk = `week${i + 1}`;
                  return <option key={wk} value={wk}>WEEK {i + 1}</option>;
                })}
              </select>
            </div>

            {selectedWeekDetail !== 'all' && role === 'admin' && (
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400 font-mono uppercase font-bold text-[9px]">Bulk Week status:</span>
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                  {['P', 'A', 'L', 'E'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleBulkMarkWeek(selectedWeekDetail, status as any)}
                      className="px-2 py-0.5 rounded hover:bg-slate-800 hover:text-white transition-colors cursor-pointer font-bold font-mono text-slate-400"
                    >
                      {status}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleBulkMarkWeek(selectedWeekDetail, undefined)}
                    className="px-2 py-0.5 rounded hover:bg-slate-800 hover:text-white transition-colors cursor-pointer font-bold font-mono text-slate-500"
                  >
                    —
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Attendance Table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800/80 text-[10px] uppercase font-bold tracking-wider font-mono">
                  <th className="p-3 pl-4 border-r border-slate-800/40 sticky left-0 bg-slate-950 z-20">ID</th>
                  <th className="p-3 border-r border-slate-800/40 sticky left-12 bg-slate-950 z-20 min-w-[150px]">Student Name</th>
                  {selectedWeekDetail === 'all' ? (
                    Array.from({ length: 18 }, (_, i) => (
                      <th key={i} className="p-1 px-1.5 border-r border-slate-800/40 text-center min-w-[40px]">W{i + 1}</th>
                    ))
                  ) : (
                    <th className="p-3 border-r border-slate-800/40 text-center min-w-[60px]">Week {selectedWeekDetail.replace('week', '')}</th>
                  )}
                  <th className="p-3 text-center min-w-[130px]">Summary stats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={selectedWeekDetail === 'all' ? 21 : 4} className="p-8 text-center text-xs text-slate-550">
                      No matching student records found for attendance monitoring.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const attendanceMap = student.attendance || {};
                    const totalRecorded = Object.values(attendanceMap).length;
                    const presentCount = Object.values(attendanceMap).filter(v => v === 'P').length;
                    const rate = totalRecorded > 0 ? Math.round((presentCount / totalRecorded) * 100) : 100;
                    
                    return (
                      <tr key={student.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 pl-4 border-r border-slate-800/40 sticky left-0 bg-slate-900 font-mono text-xs font-semibold text-blue-400">{student.id}</td>
                        <td className="p-3 border-r border-slate-800/40 sticky left-12 bg-slate-900 font-semibold text-white text-xs truncate max-w-[150px]">{student.fullName}</td>
                        {selectedWeekDetail === 'all' ? (
                          Array.from({ length: 18 }, (_, i) => {
                            const weekKey = `week${i + 1}`;
                            return renderAttendanceCell(student, weekKey);
                          })
                        ) : (
                          renderAttendanceCell(student, selectedWeekDetail)
                        )}
                        <td className="p-3 text-center text-xs font-mono">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            rate >= 80 ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' :
                            rate >= 50 ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30' :
                            'bg-rose-950/40 text-rose-400 border border-rose-900/30'
                          }`}>
                            {rate}% Present ({presentCount}/{totalRecorded})
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Secure Live Sync Info Footer */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 shrink-0">
            <div className="flex items-center space-x-2 select-none">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-slate-400">Database monitoring active • standard input tracking mode.</span>
            </div>
            <div className="flex items-center justify-end space-x-4 select-none">
              <span><strong>Statuses:</strong> P=Present, A=Absent, L=Late, E=Excused</span>
              <span>•</span>
              <span><strong>Autosave:</strong> Enabled</span>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* Floating Action Notifications Panel (Toasts) */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed top-20 right-6 z-40 max-w-sm bg-slate-905/95 backdrop-blur-md border border-blue-500/20 p-4 rounded-xl shadow-2xl flex items-start space-x-3 text-xs text-slate-200"
          >
            <div className="p-1 green-accent-glow bg-emerald-520/20 text-emerald-400 rounded-lg shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">Registry Updated</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{successMsg}</p>
            </div>
            <button 
              onClick={() => setSuccessMsg('')}
              className="text-slate-500 hover:text-slate-200 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Floating Portal Modal (Representing Login Interface Form) */}
      <AnimatePresence>
        {isFormOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
            onClick={(e) => {
              // Dismiss trigger on outer bounds clock
              if (e.target === e.currentTarget) setIsFormOpen(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.93, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md max-h-[95vh] overflow-y-auto shadow-2xl relative flex flex-col"
            >
              {/* Dynamic top-side accent gradient line */}
              <div className="h-1 bg-gradient-to-r from-blue-600 via-sky-500 to-blue-500 w-full" />
              
              {/* Login-form inspired heading */}
              <div className="p-6 pb-4 bg-slate-950/20 border-b border-slate-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-600 to-sky-500 text-white rounded-xl shadow-md">
                      <RoboticsIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-sm text-white uppercase tracking-tight">
                        {isEditing ? 'Edit Profile Record' : 'Register New Student'}
                      </h3>
                      <p className="text-[9px] text-slate-400 font-mono tracking-wider uppercase">Administrative Control Registry</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsFormOpen(false)}
                    className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
                    aria-label="Close credentials panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Login-style Interactive inputs layout */}
              <form onSubmit={handleSubmitForm} className="p-6 space-y-4">
                
                {/* Unique ID Entry Slot */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                    Unique Key ID {!isEditing && <span className="text-blue-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    disabled={isEditing}
                    placeholder="e.g., STU06"
                    className="w-full px-3 py-2 bg-slate-950 disabled:bg-slate-900 disabled:text-slate-500 border border-slate-800 rounded-xl text-xs uppercase font-mono font-bold leading-normal focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500/20 text-white placeholder-slate-700 transition-colors"
                    required
                  />
                </div>

                {/* Full name input entry */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                    Full Student Name <span className="text-blue-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value.toUpperCase())}
                    placeholder="e.g., KATHERINE CARTER"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-100 placeholder-slate-600 focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>

                {/* Age & Course values column layout */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">
                      Age <span className="text-blue-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formAge}
                      onChange={(e) => setFormAge(e.target.value)}
                      min="4"
                      max="110"
                      placeholder="18"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono font-semibold focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500/20 transition-colors"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                      Course <span className="text-blue-500">*</span>
                    </label>
                    <select
                      value={formLevel}
                      onChange={(e) => setFormLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-semibold focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500/20 transition-colors cursor-pointer"
                      required
                    >
                      <option value="3D">3D</option>
                      <option value="Python">Python</option>
                      <option value="Sensor">Sensor</option>
                      <option value="AI">AI</option>
                      <option value="Super:Bit">Super:Bit</option>
                      <option value="HTML,CSS">HTML,CSS</option>
                    </select>
                  </div>
                </div>

                {/* Course & Session values column layout */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                      Level <span className="text-blue-500">*</span>
                    </label>
                    <select
                      value={formCourse}
                      onChange={(e) => setFormCourse(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-semibold focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500/20 transition-colors cursor-pointer"
                      required
                    >
                      <option value="Level 1">Level 1</option>
                      <option value="Level 2">Level 2</option>
                      <option value="Level 3">Level 3</option>
                      <option value="Level 4">Level 4</option>
                      <option value="Level 5">Level 5</option>
                      <option value="Level 6">Level 6</option>
                      <option value="New Course">New Course</option>
                      {/* Maintain dynamic fallback if custom text value exists */}
                      {formCourse && ![
                        'level 1', 'level 2', 'level 3', 'level 4', 'level 5', 'level 6', 'new course',
                        'level1', 'level2', 'level3', 'level4', 'level5', 'level,6', 'level6', 'newcourse'
                      ].includes(formCourse.toLowerCase()) && (
                        <option value={formCourse}>{formCourse}</option>
                      )}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                      Session <span className="text-blue-500">*</span>
                    </label>
                    <select
                      value={formSession}
                      onChange={(e) => setFormSession(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-semibold focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500/20 transition-colors cursor-pointer"
                      required
                    >
                      <option value="Session01">Session01</option>
                      <option value="Session02">Session02</option>
                      <option value="Session03">Session03</option>
                      <option value="Session04">Session04</option>
                      <option value="Session05">Session05</option>
                      <option value="Session06">Session06</option>
                      <option value="Session07">Session07</option>
                      <option value="Session08">Session08</option>
                      <option value="Session09">Session09</option>
                      <option value="Session10">Session10</option>
                      <option value="Session11">Session11</option>
                    </select>
                  </div>
                </div>

                {/* Registration Day Selection */}
                {!isEditing && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">
                      Registration Day <span className="text-blue-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label 
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none ${
                          formDay === 'saturday' 
                            ? 'bg-blue-950/20 border-blue-500 text-white ring-1 ring-blue-500/20' 
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input 
                            type="radio" 
                            name="registrationDay" 
                            value="saturday" 
                            checked={formDay === 'saturday'} 
                            onChange={() => setFormDay('saturday')}
                            className="text-blue-500 focus:ring-0 mr-1 cursor-pointer bg-slate-900 border-slate-700"
                          />
                          <span className="text-xs font-semibold font-mono">Saturday Class</span>
                        </div>
                      </label>

                      <label 
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none ${
                          formDay === 'sunday' 
                            ? 'bg-blue-950/20 border-blue-500 text-white ring-1 ring-blue-500/20' 
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input 
                            type="radio" 
                            name="registrationDay" 
                            value="sunday" 
                            checked={formDay === 'sunday'} 
                            onChange={() => setFormDay('sunday')}
                            className="text-blue-500 focus:ring-0 mr-1 cursor-pointer bg-slate-900 border-slate-700"
                          />
                          <span className="text-xs font-semibold font-mono">Sunday Class</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Inline form error warnings block */}
                <AnimatePresence mode="wait">
                  {formError && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, y: -6 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -6 }}
                      className="p-3 bg-rose-950/40 text-rose-305 border border-rose-900/30 rounded-xl flex items-start space-x-1.5 text-[10px] font-medium leading-normal overflow-hidden"
                    >
                      <AlertOctagon className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{formError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action button triggers for login representation styling */}
                <div className="flex items-center space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-2 text-xs bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 rounded-xl font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-550 text-white rounded-xl text-xs font-semibold shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <span>{isEditing ? 'Save Details' : 'Register Student'}</span>
                    <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
                  </motion.button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Read-Only Mode Permission Warning Dialog */}
      <AnimatePresence>
        {showPermissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop smear layout */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPermissionModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
              className="relative w-full max-w-sm bg-slate-900 border border-amber-500/20 rounded-2xl shadow-2xl p-6 z-55 select-none overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <button
                  type="button"
                  onClick={() => setShowPermissionModal(false)}
                  className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Decorative Warning icon overlay glow */}
              <div className="flex flex-col items-center text-center mt-2">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full mb-4 border border-amber-500/20">
                  <AlertOctagon className="w-6 h-6 animate-[pulse_2s_infinite]" />
                </div>
                <h4 className="font-display font-black text-white text-base tracking-tight">OPERATION DENIED</h4>
                <p className="text-[10px] text-amber-500 uppercase font-mono font-bold tracking-wider mt-1">
                  Developer Clearance Required
                </p>
                <p className="text-xs text-slate-400 mt-3.5 leading-relaxed font-sans">
                  {permissionWarningMessage}
                </p>
                
                {/* Information helper list */}
                <div className="mt-5 w-full bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-left font-mono text-[10px] text-slate-500 space-y-1">
                  <div className="font-bold text-slate-400 uppercase tracking-wide mb-1.5 border-b border-slate-800/85 pb-1">
                    System Credentials Hint
                  </div>
                  <div>Account: <span className="text-slate-300 font-bold">raksalun7@gmail.com</span></div>
                  <div>Passphrase: <span className="text-slate-300 font-bold">lunraksa1234567890</span></div>
                </div>

                <div className="mt-6 flex gap-2.5 w-full">
                  <button
                    type="button"
                    onClick={() => setShowPermissionModal(false)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold select-none cursor-pointer transition-colors"
                  >
                    Close Warning
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
