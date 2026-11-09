import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Student } from '../../../types';
import {
  BookOpen,
  Repeat,
  ClockAlert,
  Search,
  ArrowRight,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  BookmarkCheck,
} from 'lucide-react';
import { StudentTab } from '../StudentLayout';
import { formatFrenchDate, getRemainingDays } from '../../../utils/delayCalculator';

interface StudentDashboardProps {
  onNavigate: (tab: StudentTab) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { currentUser, loans, books, getLoanDelayInfo, simulatedDate } = useApp();
  const student = currentUser as Student;

  // Active loans for this student
  const myActiveLoans = loans.filter((l) => l.studentId === student.id && l.status === 'active');
  const myReturnedLoans = loans.filter((l) => l.studentId === student.id && l.status === 'returned');

  // Check for any overdue loans
  const overdueLoans = myActiveLoans.filter((l) => getLoanDelayInfo(l).days > 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-sky-400 font-semibold">
            Portail Étudiant · {student.department}
          </span>
          <h2 className="text-xl md:text-2xl font-bold mt-1 text-white">
            Bonjour, {student.firstName} {student.lastName}
          </h2>
          <p className="text-xs text-sky-200 mt-1 max-w-xl">
            Bienvenue sur votre espace documentaire. Consultez vos emprunts en cours, explorez le catalogue et préparez vos recherches académiques.
          </p>
        </div>

        <button
          onClick={() => onNavigate('catalog')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg shadow-sm transition-colors shrink-0"
        >
          <Search className="w-4 h-4 text-sky-600" />
          Explorer le catalogue
        </button>
      </div>

      {/* Urgent Alert Banner if Student is Late on any book */}
      {overdueLoans.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-3">
            <ClockAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Alerte Retard de Restitution
              </p>
              <p className="text-xs mt-0.5">
                Vous avez <strong className="font-semibold">{overdueLoans.length} livre(s)</strong> dont la date limite de retour est dépassée. Merci de les rapporter à la bibliothèque.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('my-loans')}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shrink-0 transition-colors"
          >
            Voir mes retards
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active loans */}
        <div
          onClick={() => onNavigate('my-loans')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer shadow-2xs transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Mes Emprunts en Cours
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {myActiveLoans.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              livre(s) en votre possession
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Date réf. : {formatFrenchDate(simulatedDate)}</span>
            <span className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
              Détails →
            </span>
          </div>
        </div>

        {/* Retards */}
        <div
          onClick={() => onNavigate('my-loans')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer shadow-2xs transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Retards Constatés
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                overdueLoans.length > 0
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {overdueLoans.length > 0 ? (
                <ClockAlert className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold font-mono tabular-nums ${
                overdueLoans.length > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {overdueLoans.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {overdueLoans.length > 0 ? 'prêt(s) en dépassement' : 'Situation régulière'}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span
              className={
                overdueLoans.length > 0
                  ? 'text-rose-600 font-medium'
                  : 'text-emerald-600 font-medium'
              }
            >
              {overdueLoans.length > 0 ? 'À régulariser d\'urgence' : 'Aucune pénalité'}
            </span>
            <span className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
              Consulter →
            </span>
          </div>
        </div>

        {/* Historique total */}
        <div
          onClick={() => onNavigate('history')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer shadow-2xs transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Livres Déjà Retournés
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <BookmarkCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {myReturnedLoans.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              emprunts passés archivés
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Historique complet</span>
            <span className="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
              Voir historique →
            </span>
          </div>
        </div>
      </div>

      {/* Currently Borrowed Books Spotlight */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Vos Prêts Actifs ({myActiveLoans.length})
          </h3>
          <button
            onClick={() => onNavigate('my-loans')}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            Gérer mes emprunts
          </button>
        </div>

        {myActiveLoans.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Vous n'avez aucun livre emprunté pour le moment.{' '}
            <button
              onClick={() => onNavigate('catalog')}
              className="text-sky-600 font-semibold underline ml-1"
            >
              Parcourir le catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myActiveLoans.map((loan) => {
              const book = books.find((b) => b.id === loan.bookId);
              const delayInfo = getLoanDelayInfo(loan);
              const remaining = getRemainingDays(loan.dueDate, simulatedDate);
              const isLate = delayInfo.days > 0;

              return (
                <div
                  key={loan.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isLate
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {book?.title || 'Livre'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {book?.author} · {book?.genre}
                      </p>
                    </div>
                    {isLate ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white font-mono shrink-0">
                        Retard {delayInfo.days}j
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono shrink-0">
                        {remaining}j restants
                      </span>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Emprunté le : {formatFrenchDate(loan.loanDate)}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      À rendre le : {formatFrenchDate(loan.dueDate)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
