import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, FastForward, UserCheck, RefreshCw, Sun, Moon } from 'lucide-react';
import { addDaysToDate, formatFrenchDate } from '../../utils/delayCalculator';

export const HeaderDateControl: React.FC = () => {
  const { simulatedDate, setSimulatedDate, currentUser, role, login, logout, students } = useApp();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAdvanceDays = (days: number) => {
    const newDate = addDaysToDate(simulatedDate, days);
    setSimulatedDate(newDate);
  };

  const handleSwitchAccount = (email: string) => {
    setShowAccountMenu(false);
    login(email);
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Date Simulation Pill */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
          {formatFrenchDate(simulatedDate)}
        </span>
        <div className="hidden sm:flex items-center gap-1 ml-1 border-l border-slate-300 dark:border-slate-700 pl-1.5">
          <button
            onClick={() => handleAdvanceDays(1)}
            title="Avancer de 1 jour pour tester les retards"
            className="px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
          >
            +1j
          </button>
          <button
            onClick={() => handleAdvanceDays(7)}
            title="Avancer d'une semaine"
            className="px-1.5 py-0.5 text-[10px] font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-950/50 rounded transition-colors inline-flex items-center gap-0.5"
          >
            <FastForward className="w-2.5 h-2.5" />
            +7j
          </button>
        </div>
      </div>

      {/* Quick Account Switcher for Demo / Testing */}
      <div className="relative">
        <button
          onClick={() => setShowAccountMenu(!showAccountMenu)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors"
          title="Changer rapidement de compte pour tester les deux rôles"
        >
          <UserCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span className="hidden md:inline">Changer de compte</span>
        </button>

        {showAccountMenu && (
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 text-left animate-in fade-in zoom-in-95">
            <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Accès rapide démonstration
            </p>

            <button
              onClick={() => handleSwitchAccount('admin@usmba.ac.ma')}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                role === 'admin' ? 'bg-sky-50 dark:bg-sky-950/40 font-semibold text-sky-700 dark:text-sky-300' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              <div>
                <p className="font-semibold">Administrateur BU</p>
                <p className="text-[11px] text-slate-500">admin@usmba.ac.ma</p>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">
                Admin
              </span>
            </button>

            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
            <p className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Comptes Étudiants autorisés
            </p>

            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {students.filter(s => s.status === 'active').slice(0, 4).map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSwitchAccount(s.email)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    currentUser?.id === s.id ? 'bg-sky-50 dark:bg-sky-950/40 font-semibold text-sky-700 dark:text-sky-300' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="font-medium">{s.firstName} {s.lastName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">{s.email}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dark mode switch */}
      <button
        onClick={toggleTheme}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
        aria-label="Basculer le thème"
      >
        {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
