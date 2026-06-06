import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, Eye, EyeOff, ShieldAlert, LogIn, Sparkles, Terminal } from 'lucide-react';
import RoboticsIcon from './RoboticsIcon';

interface LoginFormProps {
  onLoginSuccess: (username: string, role: 'admin' | 'user', email: string) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // Configuration credentials
  const adminEmail = 'raksalun7@gmail.com';
  const adminPassword = 'lunraksa1234567890';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate database credentials verification latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const normalizedEmail = username.trim().toLowerCase();
    const isEmail = normalizedEmail.includes('@') && normalizedEmail.includes('.');

    // 1. Check Developer Admin access
    if (normalizedEmail === adminEmail) {
      if (password === adminPassword) {
        setIsLoading(false);
        onLoginSuccess('Raksa Lun', 'admin', normalizedEmail);
        return;
      } else {
        setIsLoading(false);
        setError('Incorrect password for Administrator account.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }
    }

    // 2. Check any other email of a general user
    if (isEmail) {
      if (password.length >= 6) {
        setIsLoading(false);
        const partBeforeAt = normalizedEmail.split('@')[0];
        const displayName = partBeforeAt.charAt(0).toUpperCase() + partBeforeAt.slice(1);
        onLoginSuccess(displayName, 'user', normalizedEmail);
        return;
      } else {
        setIsLoading(false);
        setError('Security passphrase for other users must be at least 6 characters.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return;
      }
    }

    setIsLoading(false);
    setError('Please enter a valid email address (e.g., student@school.edu).');
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        {/* Core application branding banner */}
        <div className="flex flex-col items-center mb-6 text-center">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            className="mb-3.5"
          >
            <RoboticsIcon className="w-12 h-12 shadow-2xl" />
          </motion.div>
          <h1 className="text-xl font-extrabold font-sans tracking-tight text-white uppercase sm:text-2xl">
            Robotics Students Registry
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Access Portal &bull; Bento Dashboard &bull; v1.0.4
          </p>
        </div>

        {/* Shaking animation block if error occurs */}
        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative"
        >
          {/* Accent lighting line */}
          <div className="h-[3px] w-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-500" />

          <div className="p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-sm uppercase tracking-widest font-mono text-slate-400 font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Security Gatekeeper</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">Credentials required to decrypt database records.</p>
            </div>

            {/* Error notifications */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="mb-4 p-3 bg-red-950/40 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-start space-x-2.5"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Username field */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider block">
                  Email / Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="manager@school.edu"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-705 outline-none focus:ring-1 focus:ring-blue-500/20 transition-all font-sans font-medium"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider block">
                  Security Passphrase
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-xs text-white placeholder-slate-705 outline-none focus:ring-1 focus:ring-blue-500/20 transition-all font-mono tracking-widest text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 text-white font-semibold text-xs rounded-xl shadow-lg hover:shadow-blue-500/10 flex items-center justify-center space-x-2 transition-all cursor-pointer select-none border border-blue-500/30 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Authorize & Decrypt</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Explanatory text for the portal access model */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col items-center">
              <p className="text-[10px] text-slate-500 italic text-center leading-relaxed max-w-xs">
                To access system tools, please use your registered credentials. Standard emails log in as read-only viewers, while authorized developer accounts unlock full write-level clearance.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Security disclaimer */}
        <div className="text-center mt-6 text-[10px] text-slate-600 font-mono">
          Session security is managed temporarily via browser system state.
        </div>
      </motion.div>
    </div>
  );
}
