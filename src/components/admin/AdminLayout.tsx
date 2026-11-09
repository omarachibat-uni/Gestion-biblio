import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Repeat,
  RotateCcw,
  ClockAlert,
  Settings,
  LogOut,
  Menu,
  X,
  BookMarked,
  Shield,
} from 'lucide-react';
import { HeaderDateControl } from '../common/HeaderDateControl';

export type AdminTab =
  | 'dashboard'
  | 'books'
  | 'students'
  | 'loans'
  | 'returns'
  | 'delays'
  | 'settings';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onTabChange,
  children,
}) => {
  const { currentUser, logout, loans, getLoanDelayInfo } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate overdue loans count for badge
  const overdueCount = loans.filter((l) => l.status === 'active' && getLoanDelayInfo(l).days > 0).length;

  const menuItems = [
    { id: 'dashboard' as AdminTab, label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'books' as AdminTab, label: 'Catalogue des Livres', icon: BookOpen },
    { id: 'students' as AdminTab, label: 'Gestion des Étudiants', icon: Users },
    { id: 'loans' as AdminTab, label: 'Gestion des Emprunts', icon: Repeat },
    { id: 'returns' as AdminTab, label: 'Enregistrement Retours', icon: RotateCcw },
    {
      id: 'delays' as AdminTab,
      label: 'Retards & Rappels',
      icon: ClockAlert,
      badge: overdueCount > 0 ? overdueCount : undefined,
    },
    { id: 'settings' as AdminTab, label: 'Paramètres Bibliothèque', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-900 dark:text-slate-100 font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            BU-USMBA Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <HeaderDateControl />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-slate-900 text-slate-200 flex flex-col justify-between shrink-0 z-40 border-r border-slate-800 transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 flex flex-col h-full overflow-y-auto">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <BookMarked className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider truncate">
                Bibliothèque Centrale
              </h2>
              <p className="text-[11px] text-sky-400 font-medium">USMBA · Administration</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-1 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white font-mono shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Admin Profile & Logout */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-bold text-xs shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {'name' in (currentUser || {}) ? (currentUser as any).name : 'Administrateur'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  admin@usmba.ac.ma
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-white hover:bg-rose-950/40 border border-rose-900/30 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">SIGB</span>
            <span className="text-xs text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 capitalize">
              {menuItems.find((m) => m.id === activeTab)?.label}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <HeaderDateControl />
          </div>
        </header>

        {/* Viewport content */}
        <div className="p-4 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
