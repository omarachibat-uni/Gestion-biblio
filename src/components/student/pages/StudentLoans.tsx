import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Student } from '../../../types';
import {
  Repeat,
  ClockAlert,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  BookOpen,
  MapPin,
} from 'lucide-react';
import { formatFrenchDate, getRemainingDays } from '../../../utils/delayCalculator';

export const StudentLoans: React.FC = () => {
  const { loans, books, currentUser, getLoanDelayInfo, settings, simulatedDate } = useApp();
  const student = currentUser as Student;

  // Active loans for this student
  const myActiveLoans = loans.filter((l) => l.studentId === student.id && l.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Repeat className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Mes Emprunts en Cours
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Suivi des ouvrages en votre possession et contrôle des dates limites de restitution
        </p>
      </div>

      {/* Notice about return process */}
      <div className="p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-xl text-xs text-sky-800 dark:text-sky-300 flex items-start gap-3">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-600" />
        <div className="space-y-1">
          <p className="font-semibold">Procédure de restitution d'ouvrage :</p>
          <p className="text-sky-700 dark:text-sky-400 leading-relaxed">
            Pour valider le retour d'un livre, veuillez vous présenter physiquement à l'accueil de la Bibliothèque Universitaire. Le bibliothécaire scannera le code de l'ouvrage pour clôturer votre emprunt.
          </p>
        </div>
      </div>

      {/* Loans List */}
      {myActiveLoans.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Aucun livre emprunté actuellement
          </p>
          <p className="text-slate-500 mt-1">
            Tous vos emprunts sont régularisés. Consultez le catalogue pour découvrir de nouveaux ouvrages.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {myActiveLoans.map((loan) => {
            const book = books.find((b) => b.id === loan.bookId);
            const delayInfo = getLoanDelayInfo(loan);
            const isLate = delayInfo.days > 0;
            const remainingDays = getRemainingDays(loan.dueDate, simulatedDate);

            return (
              <div
                key={loan.id}
                className={`p-6 rounded-2xl border transition-all ${
                  isLate
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Book info */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 font-mono">
                        {book?.genre || 'Discipline'}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ISBN: {book?.isbn}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {book?.title || 'Titre inconnu'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Auteur : <span className="font-medium text-slate-700 dark:text-slate-300">{book?.author}</span>
                      {book?.publisher && ` · Éditions ${book.publisher}`}
                    </p>
                  </div>

                  {/* Right: Dates & Delay Calculation */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 lg:gap-8 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Date d'emprunt</span>
                      <span className="font-semibold text-xs font-mono text-slate-800 dark:text-slate-200">
                        {formatFrenchDate(loan.loanDate)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block">Date limite de retour</span>
                      <span className="font-bold text-xs font-mono text-slate-900 dark:text-white">
                        {formatFrenchDate(loan.dueDate)}
                      </span>
                    </div>

                    {/* Delay / Countdown status badge */}
                    <div className="min-w-36 text-right">
                      {isLate ? (
                        <div className="inline-flex flex-col items-end">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
                            <ClockAlert className="w-3.5 h-3.5" />
                            Retard : {delayInfo.days} jour(s)
                          </span>
                          <span className="text-[11px] text-rose-700 dark:text-rose-400 font-medium mt-1">
                            {delayInfo.label}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex flex-col items-end">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {remainingDays} jour(s) restants
                          </span>
                          <span className="text-[11px] text-slate-400 mt-1">
                            Dans les délais
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Example calculation reminder as requested in prompt */}
                {isLate && (
                  <div className="mt-4 pt-3 border-t border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between text-[11px] text-rose-700 dark:text-rose-300 font-mono">
                    <span>
                      Date limite : {formatFrenchDate(loan.dueDate)} · Date du jour : {formatFrenchDate(simulatedDate)}
                    </span>
                    <span className="font-bold">
                      → Dépassement : {delayInfo.days} jours
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
