import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  BookOpen,
  LayoutDashboard,
  Repeat,
  History,
  User,
  LogOut,
  GraduationCap,
  Menu,
  X,
  ClockAlert,
} from 'lucide-react';
import { HeaderDateControl } from '../common/HeaderDateControl';

export type StudentTab = 'dashboard' | 'catalog' | 'my-loans' | 'history' | 'profile';

interface StudentLayoutProps {
  activeTab: StudentTab;
  onTabChange: (tab: StudentTab) => void;
  children: React.ReactNode;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({
  activeTab,
  onTabChange,
  children,
}) => {
  const { currentUser, logout, loans, getLoanDelayInfo } = useApp();
  const student = currentUser as Student;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Student active loans
  const myActiveLoans = loans.filter((l) => l.studentId === student.id && l.status === 'active');
  const myOverdueLoans = myActiveLoans.filter((l) => getLoanDelayInfo(l).days > 0);

  const navItems = [
    { id: 'dashboard' as StudentTab, label: 'Accueil / Dashboard', icon: LayoutDashboard },
    { id: 'catalog' as StudentTab, label: 'Catalogue des livres', icon: BookOpen },
    {
      id: 'my-loans' as StudentTab,
      label: 'Mes emprunts',
      icon: Repeat,
      badge: myOverdueLoans.length > 0 ? `${myOverdueLoans.length} retard` : myActiveLoans.length > 0 ? myActiveLoans.length : undefined,
      isOverdue: myOverdueLoans.length > 0,
    },
    { id: 'history' as StudentTab, label: 'Historique des prêts', icon: History },
    { id: 'profile' as StudentTab, label: 'Mon profil & Carte', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 font-sans">
      {/* Top Academic Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-900 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <GraduationCap className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                Bibliothèque USMBA
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Espace Étudiant · {student.firstName} {student.lastName}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono ${
                        item.isOverdue
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Date simulator and Logout */}
          <div className="flex items-center gap-2">
            <HeaderDateControl />
            <button
              onClick={logout}
              title="Se déconnecter"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-4 py-3 bg-white dark:bg-slate-900 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-400">
        Portail Étudiant · Université Sidi Mohamed Ben Abdellah - Fès
      </footer>
    </div>
  );
};
