import React from 'react';
import { useApp } from '../../../context/AppContext';
import {
  BookOpen,
  Users,
  Repeat,
  AlertTriangle,
  CheckCircle2,
  BookmarkCheck,
  TrendingUp,
  PlusCircle,
  ScanLine,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { AdminTab } from '../AdminLayout';
import { formatFrenchDate } from '../../../utils/delayCalculator';

interface AdminDashboardProps {
  onNavigate: (tab: AdminTab) => void;
  onOpenQRScanner: (mode: 'student' | 'book') => void;
  onOpenNewLoanModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenQRScanner,
  onOpenNewLoanModal,
}) => {
  const { books, students, loans, getLoanDelayInfo, simulatedDate } = useApp();

  // Statistics
  const totalBooks = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const availableBooks = books.reduce((acc, b) => acc + b.availableCopies, 0);
  const borrowedBooks = totalBooks - availableBooks;
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'active').length;

  const activeLoans = loans.filter((l) => l.status === 'active');
  const returnedLoans = loans.filter((l) => l.status === 'returned');
  const overdueLoans = activeLoans.filter((l) => getLoanDelayInfo(l).days > 0);

  // Group books by genre
  const genreCounts: { [genre: string]: number } = {};
  books.forEach((b) => {
    genreCounts[b.genre] = (genreCounts[b.genre] || 0) + b.totalCopies;
  });

  // Delay distribution
  const delayTiers = {
    none: activeLoans.filter((l) => getLoanDelayInfo(l).severity === 'none').length,
    low: activeLoans.filter((l) => getLoanDelayInfo(l).severity === 'low').length,
    medium: activeLoans.filter((l) => getLoanDelayInfo(l).severity === 'medium').length,
    high: activeLoans.filter((l) => getLoanDelayInfo(l).severity === 'high').length,
    critical: activeLoans.filter((l) => getLoanDelayInfo(l).severity === 'critical').length,
  };

  // Top borrowed books
  const topBooks = [...books].sort((a, b) => b.borrowCount - a.borrowCount).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs uppercase tracking-wider text-sky-300 font-semibold">
            Tableau de Bord Administratif · USMBA
          </span>
          <h2 className="text-xl md:text-2xl font-bold mt-1 text-white">
            Vue d'ensemble de la Bibliothèque
          </h2>
          <p className="text-xs text-sky-200 mt-1 max-w-xl">
            Gestion du fonds documentaire, contrôle des emprunts et suivi en direct des restitutions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewLoanModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-sky-600" />
            Nouveau prêt
          </button>
          <button
            onClick={() => onOpenQRScanner('book')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-600/80 hover:bg-sky-600 border border-sky-400/30 rounded-lg transition-colors shrink-0"
          >
            <ScanLine className="w-4 h-4" />
            Scanner QR
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Books Total & Available */}
        <div
          onClick={() => onNavigate('books')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all shadow-2xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Ouvrages
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {totalBooks}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              exemplaires ({books.length} titres)
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              🟢 {availableBooks} disponibles
            </span>
            <span className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 inline-flex items-center">
              Gérer <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Active Students */}
        <div
          onClick={() => onNavigate('students')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all shadow-2xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Étudiants Autorisés
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {totalStudents}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              inscrits vérifiés
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-indigo-700 dark:text-indigo-400 font-medium">
              {activeStudents} actifs · @usmba.ac.ma
            </span>
            <span className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 inline-flex items-center">
              Liste <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Active Loans */}
        <div
          onClick={() => onNavigate('loans')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all shadow-2xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Emprunts en Cours
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {activeLoans.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              livres en circulation
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 dark:text-slate-400">
              {returnedLoans.length} retours archivés
            </span>
            <span className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 inline-flex items-center">
              Voir <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Overdue Loans */}
        <div
          onClick={() => onNavigate('delays')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all shadow-2xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Retards Constatés
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
              {overdueLoans.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              prêts en dépassement
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-rose-700 dark:text-rose-400 font-semibold">
              Rappels à envoyer
            </span>
            <span className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 inline-flex items-center">
              Notifier <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Charts & Analytical Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Delay Severity Breakdown */}
        <div className="lg:col-span-5 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Statut des Emprunts en Cours
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Répartition par niveau de retard au {formatFrenchDate(simulatedDate)}
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400">
              {activeLoans.length} total
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  À temps / Aucun retard
                </span>
                <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  {delayTiers.none} ({Math.round((delayTiers.none / (activeLoans.length || 1)) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(delayTiers.none / (activeLoans.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-yellow-700 dark:text-yellow-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  Retard faible (1 à 3 jours)
                </span>
                <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  {delayTiers.low} ({Math.round((delayTiers.low / (activeLoans.length || 1)) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${(delayTiers.low / (activeLoans.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Retard moyen (4 à 7 jours)
                </span>
                <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  {delayTiers.medium} ({Math.round((delayTiers.medium / (activeLoans.length || 1)) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(delayTiers.medium / (activeLoans.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-orange-700 dark:text-orange-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  Retard élevé (8 à 14 jours)
                </span>
                <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  {delayTiers.high} ({Math.round((delayTiers.high / (activeLoans.length || 1)) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${(delayTiers.high / (activeLoans.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  Retard très élevé (15+ jours)
                </span>
                <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  {delayTiers.critical} ({Math.round((delayTiers.critical / (activeLoans.length || 1)) * 100)}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-600 rounded-full"
                  style={{ width: `${(delayTiers.critical / (activeLoans.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Most Borrowed Books */}
        <div className="lg:col-span-7 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ouvrages les Plus Empruntés
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Top des ressources documentaires les plus consultées
              </p>
            </div>
            <button
              onClick={() => onNavigate('books')}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
            >
              Voir tout le catalogue
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topBooks.map((book, idx) => (
              <div key={book.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold font-mono text-slate-500 shrink-0">
                    0{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {book.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {book.author} · <span className="font-mono text-slate-400">{book.genre}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                    {book.borrowCount} prêts
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {book.availableCopies} dispo / {book.totalCopies}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Catalogue Genres Grid */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Fonds Documentaire par Discipline
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {Object.entries(genreCounts).map(([genre, count]) => (
            <div
              key={genre}
              className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60"
            >
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{genre}</p>
              <p className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                {count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
