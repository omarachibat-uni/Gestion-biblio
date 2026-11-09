import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Student } from '../../../types';
import { History, CheckCircle2, AlertCircle, BookOpen, Calendar } from 'lucide-react';
import { formatFrenchDate } from '../../../utils/delayCalculator';

export const StudentHistory: React.FC = () => {
  const { loans, books, currentUser } = useApp();
  const student = currentUser as Student;

  // Past returned loans for this student
  const pastLoans = loans.filter((l) => l.studentId === student.id && l.status === 'returned');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Historique des Emprunts Restitués
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Archive complète de vos emprunts passés et dates de restitution effectives
        </p>
      </div>

      {pastLoans.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
          <History className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Aucun historique d'emprunt pour l'instant
          </p>
          <p className="text-slate-500 mt-1">
            Vos livres rendus apparaîtront automatiquement ici avec leur date de retour validée.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Livre</th>
                  <th className="py-3 px-4">Emprunté le</th>
                  <th className="py-3 px-4">À rendre le</th>
                  <th className="py-3 px-4">Rendu le</th>
                  <th className="py-3 px-4 text-center">Statut du retour</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pastLoans.map((loan) => {
                  const book = books.find((b) => b.id === loan.bookId);
                  const hadLateDays = (loan.daysOverdueAtReturn || 0) > 0;

                  return (
                    <tr
                      key={loan.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {book?.title || 'Ouvrage archivé'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {book?.author} · ISBN: <span className="font-mono">{book?.isbn}</span>
                        </p>
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {formatFrenchDate(loan.loanDate)}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {formatFrenchDate(loan.dueDate)}
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                        {formatFrenchDate(loan.returnDate || '')}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {hadLateDays ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Rendu avec retard ({loan.daysOverdueAtReturn}j)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Retourné à temps
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
