import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Sparkles, 
  Terminal, 
  Cpu, 
  Award, 
  Zap, 
  Radio, 
  CheckCircle, 
  ExternalLink, 
  Globe, 
  Mail, 
  Github, 
  Code,
  Database,
  Search,
  Trash2,
  Users,
  RefreshCw
} from 'lucide-react';
import { LoginEvent } from '../types';

interface ManagerProfileProps {
  role: 'admin' | 'user';
  username: string;
}

export default function ManagerProfile({ role, username }: ManagerProfileProps) {
  const [activeTab, setActiveTab] = useState<'website' | 'commands' | 'logs'>('website');

  const [logs, setLogs] = useState<string[]>([
    'DevCore environment instantiated.',
    'Establishing secured tunnel to database...',
    'Synced personal website schema assets.',
    'Portfolio view interactive state is ONLINE.'
  ]);

  const [inputLog, setInputLog] = useState('');

  const [loginEvents, setLoginEvents] = useState<LoginEvent[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadLogs = async () => {
    try {
      const res = await fetch('/api/login-events');
      if (res.ok) {
        const data = await res.json();
        setLoginEvents(data);
        localStorage.setItem('robotics_registry_login_events', JSON.stringify(data));
        return;
      }
    } catch (err) {
      console.warn('API error loading login events, using cache', err);
    }

    try {
      const str = localStorage.getItem('robotics_registry_login_events');
      if (str) {
        setLoginEvents(JSON.parse(str));
      }
    } catch (e) {
      console.warn('Failed to parse login events registry', e);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const clearLogs = async () => {
    try {
      localStorage.setItem('robotics_registry_login_events', JSON.stringify([]));
      setLoginEvents([]);
      setShowClearConfirm(false);
      setLogs((prev) => [
        ...prev,
        `[System Kernel]: User login database successfully wiped by Admin clearance.`
      ]);

      await fetch('/api/login-events', {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Failed to clear login events database', e);
    }
  };

  const filteredEvents = loginEvents.filter(event => {
    const q = logSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      event.email.toLowerCase().includes(q) ||
      event.id.toLowerCase().includes(q) ||
      event.ipAddress.includes(q) ||
      event.browser.toLowerCase().includes(q) ||
      event.platform.toLowerCase().includes(q) ||
      event.role.toLowerCase().includes(q)
    );
  });

  const appendLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLog.trim()) return;
    
    if (role === 'user') {
      setLogs((prev) => [
        ...prev, 
        `[${username}]: ${inputLog}`, 
        `⛔ Auth Error: Write operations are locked for guest observers. Access denied.`
      ]);
      setInputLog('');
      return;
    }

    setLogs((prev) => [
      ...prev, 
      `[Developer Admin]: ${inputLog}`, 
      `Executing command block: "${inputLog}"... Successful.`
    ]);
    setInputLog('');
  };

  const isAdmin = role === 'admin';

  return (
    <div className="relative p-[2.5px] overflow-hidden rounded-3xl shadow-2xl bg-slate-950">
      {/* Outer Running border light conic-gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220%] h-[220%] bg-[conic-gradient(from_0deg,#2563eb_0%,#a855f7_25%,#ea580c_50%,#3b82f6_75%,#2563eb_100%)] animate-[spin_8s_linear_infinite] opacity-80" />
      </div>

      {/* Main Container Card inside */}
      <div className="relative bg-slate-900 rounded-[22px] p-6 md:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-stretch select-none w-full h-full z-10 overflow-hidden">
        
        {/* ================= DYNAMIC ANIMATED BACKGROUND ================= */}
        {/* Ambient Blue Orb Grid */}
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 15, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-12 -left-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none z-0"
        />

        {/* Ambient Purple Orb */}
        <motion.div
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 20, -25, 0],
            scale: [1, 1.1, 1.2, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-16 -right-16 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none z-0"
        />

        {/* ================= LEFT SECTION: DEVELOPER PORTRAIT AVATAR ================= */}
        <div className="relative shrink-0 flex flex-col items-center">
          {/* Glow rings around the avatar */}
          <div className="absolute -inset-[6px] bg-gradient-to-tr from-blue-600/35 via-purple-500/30 to-amber-500/25 rounded-2xl blur-2xl scale-110 pointer-events-none animate-[pulse_4s_ease-in-out_infinite]" />
          
          {/* Running light border container */}
          <div className="relative w-44 h-56 md:w-48 md:h-60 rounded-2xl p-[3px] overflow-hidden shadow-2xl flex items-center justify-center bg-slate-950 select-none group">
            
            {/* Neon Anime Chasing border */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350%] h-[350%] bg-[conic-gradient(from_0deg,transparent_0%,#3b82f6_8%,#ffffff_10%,#3b82f6_12%,transparent_25%,transparent_50%,#a855f7_60%,#ffffff_62%,#a855f7_64%,transparent_75%,transparent_100%)] animate-[spin_2.5s_linear_infinite]" />
            </div>

            <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay animate-pulse pointer-events-none rounded-2xl" />

            {/* Masked Inner frame to overlay picture */}
            <div className="relative w-full h-full rounded-[13px] bg-slate-900 overflow-hidden flex items-center justify-center z-10">
              <img 
                src="https://lh3.googleusercontent.com/d/135fs9yLTUSuFiiD2hsErL1sS50zwPmyr" 
                alt="Developer Profile - LUN RAKSA" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top scale-105 select-none transition-transform duration-700"
              />
              {/* Neon rim shading of picture */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-75 pointer-events-none" />
              
              {/* Operational badge overlaid on image feet */}
              <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-sm border border-slate-800/80 rounded-lg px-2 py-1 flex items-center justify-center text-[9px] z-20">
                <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  DEVELOPER ONLINE 
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SECTION: PORTFOLIO MAIN DETAILS ================= */}
        <div className="relative z-10 flex-1 flex flex-col justify-between space-y-4 w-full">
          
          <div>
            {/* Header row details */}
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="text-[9px] font-mono tracking-widest font-extrabold uppercase bg-blue-500/10 text-blue-400 p-1 px-2.5 rounded-lg border border-blue-500/20 inline-flex items-center gap-1.5 leading-none">
                <Shield className="w-3.5 h-3.5" />
                <span>Root Clearance Authorized</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest font-extrabold uppercase bg-purple-500/10 text-purple-400 p-1 px-2.5 rounded-lg border border-purple-500/20 inline-flex items-center gap-1.5 leading-none">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Lead Systems Architect</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-display font-black text-white tracking-tight leading-none uppercase">
                LUN RAKSA
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-2xl">
                Creator of the Robotics Student Registry System. Specializing in responsive React systems, performant CSS architectures, custom dashboard workspaces, and seamless state-driven data management.
              </p>
            </div>
          </div>

          {/* Tab Switching controls */}
          <div className="border-b border-slate-800/85 flex items-center space-x-4 shrink-0 overflow-x-auto scrollbar-none pb-[2px] w-full">
            <button
              onClick={() => setActiveTab('website')}
              className={`pb-2 text-xs font-semibold tracking-tight transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'website' 
                  ? 'text-white border-blue-500' 
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Personal Website & Links
            </button>
            <button
              onClick={() => setActiveTab('commands')}
              className={`pb-2 text-xs font-semibold tracking-tight transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'commands' 
                  ? 'text-white border-blue-500' 
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              Developer Console
            </button>
            {role === 'admin' && (
              <button
                onClick={() => {
                  setActiveTab('logs');
                  loadLogs();
                }}
                className={`pb-2 text-xs font-semibold tracking-tight transition-all cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'logs' 
                    ? 'text-white border-blue-500' 
                    : 'text-slate-400 border-transparent hover:text-slate-200'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>User Login Database</span>
              </button>
            )}
          </div>

          {/* Tab Content 1: Personal Website Portal */}
          {activeTab === 'website' && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 w-full"
            >
              {/* Personal Portfolio Website Callout Card */}
              <div className="bg-slate-950/50 p-4 border border-blue-500/15 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-blue-550/10 text-blue-400 rounded-xl border border-blue-500/10">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">Personal Developer Website</h4>
                    <span className="text-[10px] text-slate-400 font-mono tracking-tight font-medium">raksalun7.github.io</span>
                  </div>
                </div>

                <a 
                  href="https://raksalun7.github.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-550 hover:to-indigo-550 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-blue-900/10 hover:border-blue-700/30 transition-all select-none cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  <span>Launch Website</span>
                </a>
              </div>

              {/* Developer contact / Social networking grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <a 
                  href="https://github.com/raksalun7" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl flex items-center space-x-2.5 transition-all text-slate-300 hover:text-white cursor-pointer"
                >
                  <Github className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[8px] uppercase font-bold text-slate-500 font-mono leading-none">Github</span>
                    <span className="text-[10px] font-semibold">@raksalun7</span>
                  </div>
                </a>

                <a 
                  href="mailto:raksalun7@gmail.com" 
                  className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-2.5 rounded-xl flex items-center space-x-2.5 transition-all text-slate-300 hover:text-white cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-orange-400 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[8px] uppercase font-bold text-slate-500 font-mono leading-none">Email Direct</span>
                    <span className="text-[10px] font-semibold truncate">raksalun7@gmail.com</span>
                  </div>
                </a>

                <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex items-center space-x-2.5 col-span-2 sm:col-span-1">
                  <Code className="w-4 h-4 text-blue-400 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[8px] uppercase font-bold text-slate-500 font-mono leading-none">Stack Core</span>
                    <span className="text-[10px] font-semibold text-slate-300 truncate">React & TypeScript</span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* Tab Content 2: Terminal Simulation for direct administrative commands */}
          {activeTab === 'commands' && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-950 rounded-xl border border-slate-800/80 p-3.5 font-mono text-[10px] text-slate-300 flex flex-col space-y-1.5 max-h-36 overflow-hidden md:max-h-none"
            >
              <div className="flex items-center space-x-1.5 border-b border-slate-800/60 pb-1.5 shrink-0 text-slate-500">
                <Terminal className="w-3.5 h-3.5 text-blue-500" />
                <span>Diagnostic Console ({role === 'admin' ? 'Authorized' : 'Read-Only'})</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 max-h-[80px] p-0.5 pr-2 select-text scrollbar-thin scrollbar-thumb-slate-800Scrollbar">
                {logs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    <span className="text-blue-500/80">&gt;</span> {log}
                  </div>
                ))}
              </div>

              <form onSubmit={appendLog} className="flex gap-2 border-t border-slate-800/40 pt-1.5 shrink-0">
                <span className="text-blue-500 font-bold self-center">&gt;</span>
                <input
                  type="text"
                  value={inputLog}
                  onChange={(e) => setInputLog(e.target.value)}
                  placeholder="Insert diagnostics instruction..."
                  className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-[10px] text-slate-100 placeholder-slate-705"
                />
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded px-2.5 py-1 text-[9px] font-bold uppercase cursor-pointer"
                >
                  Query
                </button>
              </form>
            </motion.div>
          )}

          {/* Tab Content 3: Login Sessions Database log listing */}
          {role === 'admin' && activeTab === 'logs' && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3.5 w-full text-slate-200"
            >
              {/* Database Overview counters */}
              <div className="grid grid-cols-3 gap-2 shrink-0 select-none">
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 text-center">
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-slate-500 font-mono">Total Logins</span>
                  <span className="text-sm font-black text-blue-450 font-mono">{loginEvents.length} Sessions</span>
                </div>
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 text-center">
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-slate-500 font-mono">Unique Users</span>
                  <span className="text-sm font-black text-purple-405 font-mono">
                    {new Set(loginEvents.map(event => event.email)).size} Accounts
                  </span>
                </div>
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 text-center">
                  <span className="block text-[8px] uppercase tracking-wider font-bold text-slate-500 font-mono">Admin Access</span>
                  <span className="text-sm font-black text-amber-405 font-mono">
                    {loginEvents.filter(event => event.role === 'admin').length} Logs
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-2 bg-slate-950/30 p-1.5 border border-slate-800/50 rounded-xl select-none">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search logs by email, IP address, environment..."
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg py-1 pl-8 pr-3 text-[10px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
                  />
                </div>
                
                {/* Manual refresh */}
                <button
                  type="button"
                  onClick={loadLogs}
                  className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all text-[9px] font-mono font-bold uppercase cursor-pointer flex items-center gap-1 select-none"
                  title="Refresh User database logs"
                >
                  <RefreshCw className="w-2.5 h-2.5 shrink-0 animate-pulse" />
                  <span>Refresh</span>
                </button>

                {/* Reset database log button */}
                {role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (showClearConfirm) {
                        clearLogs();
                      } else {
                        setShowClearConfirm(true);
                        setTimeout(() => setShowClearConfirm(false), 4050);
                      }
                    }}
                    className={`p-1 px-2.5 text-[9px] font-mono font-bold uppercase cursor-pointer flex items-center gap-1 select-none rounded-lg border transition-all ${
                      showClearConfirm 
                        ? 'bg-rose-900 border-rose-600 text-white animate-pulse' 
                        : 'bg-slate-900 border-slate-800 text-rose-400 hover:bg-rose-950/30 hover:border-rose-905'
                    }`}
                  >
                    <Trash2 className="w-2.5 h-2.5 shrink-0" />
                    <span>{showClearConfirm ? 'Confirm Clear?' : 'Format Logs'}</span>
                  </button>
                )}
              </div>

              {/* Hardened Tabular Data Layout with Custom Web Scrollbars */}
              <div className="bg-slate-950/50 border border-slate-850 rounded-xl overflow-hidden">
                <div className="overflow-y-auto max-h-[140px] pr-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950">
                  <table className="w-full text-left font-mono border-collapse text-[10px] table-fixed">
                    <thead className="bg-slate-900 text-slate-405 shrink-0 sticky top-0 border-b border-slate-850 select-none">
                      <tr>
                        <th className="py-2 px-3 w-[15%]">STU ID</th>
                        <th className="py-2 px-1 w-[45%]">Email Access Address</th>
                        <th className="py-2 px-1 w-[12%] text-center">Clearance</th>
                        <th className="py-2 px-1 w-[15%]">IPv4 Log</th>
                        <th className="py-2 px-1 w-[13%]">Environment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60">
                      {filteredEvents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-500 select-none">
                            No logs found matching parameters or active queries.
                          </td>
                        </tr>
                      ) : (
                        filteredEvents.map((event) => (
                          <tr key={event.id} className="hover:bg-slate-900/40 text-slate-300">
                            <td className="py-1.5 px-3 font-semibold text-slate-505 whitespace-nowrap">{event.id}</td>
                            <td className="py-1.5 px-1 font-semibold text-slate-100 truncate pr-2 select-text" title={`${event.email} (Logged: ${new Date(event.timestamp).toLocaleString()})`}>
                              <div className="flex flex-col">
                                <span className="truncate">{event.email}</span>
                                <span className="text-[8px] text-slate-500 leading-none mt-0.5">{new Date(event.timestamp).toLocaleString([], {hour: '2-digit', minute:'2-digit', month: 'short', day: 'numeric'})}</span>
                              </div>
                            </td>
                            <td className="py-1.5 px-1 text-center whitespace-nowrap">
                              {event.role === 'admin' ? (
                                <span className="bg-blue-900/30 text-blue-400 text-[8px] border border-blue-500/20 px-1 py-0.5 rounded font-black font-mono">
                                  ADMIN
                                </span>
                              ) : (
                                <span className="bg-slate-800 text-slate-400 text-[8px] border border-slate-700/30 px-1 py-0.5 rounded font-medium font-mono">
                                  VIEWER
                                </span>
                              )}
                            </td>
                            <td className="py-1.5 px-1 text-slate-400 font-mono whitespace-nowrap truncate select-text" title="Diagnostic location routing">{event.ipAddress}</td>
                            <td className="py-1.5 px-1 text-slate-400 truncate whitespace-nowrap text-[9px] uppercase font-bold" title={`${event.browser} on ${event.platform}`}>
                              <span className="text-slate-505 bg-slate-900 border border-slate-800/60 px-1.5 py-0.5 rounded font-semibold">
                                {event.browser}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </div>

      </div>
    </div>
  );
}
