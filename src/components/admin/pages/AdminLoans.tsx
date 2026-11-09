import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Loan, Student, Book } from '../../../types';
import {
  Repeat,
  Plus,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  User,
  BookOpen,
  Calendar,
  X,
  ChevronRight,
} from 'lucide-react';
import { formatFrenchDate } from '../../../utils/delayCalculator';

interface AdminLoansProps {
  initialCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export const AdminLoans: React.FC<AdminLoansProps> = ({
  initialCreateOpen = false,
  onCloseCreate,
}) => {
  const { loans, students, books, returnLoan, createLoan, getLoanDelayInfo, settings, simulatedDate } = useApp();

  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'active' | 'returned'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // New Loan Modal State
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(initialCreateOpen);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [customDays, setCustomDays] = useState(settings.defaultLoanDurationDays);
  const [createError, setCreateError] = useState<string | null>(null);

  // Map students and books for rapid lookup
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach((s) => map.set(s.id, s));
    return map;
  }, [students]);

  const bookMap = useMemo(() => {
    const map = new Map<string, Book>();
    books.forEach((b) => map.set(b.id, b));
    return map;
  }, [books]);

  // Filtered loans
  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      if (activeTabFilter !== 'all' && loan.status !== activeTabFilter) {
        return false;
      }

      const student = studentMap.get(loan.studentId);
      const book = bookMap.get(loan.bookId);

      const q = searchTerm.toLowerCase();
      const studentMatch = student ? `${student.firstName} ${student.lastName} ${student.email}`.toLowerCase().includes(q) : false;
      const bookMatch = book ? `${book.title} ${book.isbn}`.toLowerCase().includes(q) : false;

      return studentMatch || bookMatch;
    });
  }, [loans, activeTabFilter, searchTerm, studentMap, bookMap]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!selectedStudentId || !selectedBookId) {
      setCreateError('Veuillez sélectionner un étudiant et un livre.');
      return;
    }

    const res = createLoan(selectedStudentId, selectedBookId, customDays);
    if (!res.success) {
      setCreateError(res.message || "Erreur lors de l'enregistrement du prêt.");
      return;
    }

    setIsNewLoanOpen(false);
    setSelectedStudentId('');
    setSelectedBookId('');
    if (onCloseCreate) onCloseCreate();
  };

  const handleReturnFromDetails = (loanId: string) => {
    returnLoan(loanId);
    setSelectedLoan(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Repeat className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Gestion des Emprunts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Suivi épuré des prêts actifs, consultation des détails et validation des restitutions
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError(null);
            setIsNewLoanOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Enregistrer un nouvel emprunt
        </button>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Segmented Tab Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-lg w-fit">
          <button
            onClick={() => setActiveTabFilter('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTabFilter === 'active'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            En cours ({loans.filter((l) => l.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTabFilter('returned')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTabFilter === 'returned'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Historique retours ({loans.filter((l) => l.status === 'returned').length})
          </button>
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTabFilter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tous ({loans.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer étudiant ou livre..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Main Essential Table (Clean & minimal as specified in requirement 7) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Nom de l'étudiant</th>
                <th className="py-3 px-4">Nom du livre</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Retard</th>
                <th className="py-3 px-4 text-right">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Aucun emprunt correspondant.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const student = studentMap.get(loan.studentId);
                  const book = bookMap.get(loan.bookId);
                  const delayInfo = getLoanDelayInfo(loan);
                  const isReturned = loan.status === 'returned';

                  return (
                    <tr
                      key={loan.id}
                      onClick={() => setSelectedLoan(loan)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {student ? `${student.firstName} ${student.lastName}` : 'Étudiant inconnu'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {book ? book.title : 'Livre inconnu'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            Retourné
                          </span>
                        ) : delayInfo.days > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            En retard
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            En cours
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isReturned ? (
                          <span className="text-slate-400 font-mono text-[11px]">
                            {loan.daysOverdueAtReturn && loan.daysOverdueAtReturn > 0
                              ? `Rendu avec ${loan.daysOverdueAtReturn}j de retard`
                              : 'Rendu à temps'}
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 font-medium">
                            <span className={`w-2.5 h-2.5 rounded-full ${delayInfo.dotColor}`} />
                            <span className="text-[11px] font-mono">
                              {delayInfo.days === 0
                                ? '🟢 À temps'
                                : delayInfo.severity === 'low'
                                ? `🟡 ${delayInfo.days}j`
                                : delayInfo.severity === 'medium'
                                ? `🟠 ${delayInfo.days}j`
                                : `🔴 ${delayInfo.days}j`}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          className="text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 inline-flex items-center gap-1 font-semibold text-xs transition-colors"
                        >
                          <span>Voir</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7.1 Detailed Modal on Loan Click */}
      {selectedLoan && (() => {
        const student = studentMap.get(selectedLoan.studentId);
        const book = bookMap.get(selectedLoan.bookId);
        const delayInfo = getLoanDelayInfo(selectedLoan);
        const isReturned = selectedLoan.status === 'returned';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Fiche Détails de l'Emprunt
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedLoan(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 text-xs">
                {/* 1. INFORMATIONS ÉTUDIANT */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wide">
                    <User className="w-4 h-4 text-sky-600" />
                    <span>Informations Étudiant</span>
                  </div>
                  {student ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-slate-400">Nom & Prénom :</span>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">N° Étudiant :</span>
                        <p className="font-mono font-semibold text-slate-900 dark:text-white">
                          {student.studentNumber}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400">Email Académique :</span>
                        <p className="font-mono text-slate-900 dark:text-white">
                          {student.email}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400">Filière / Faculté :</span>
                        <p className="text-slate-700 dark:text-slate-300">
                          {student.classLevel} · {student.department}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400">Étudiant non trouvé.</p>
                  )}
                </div>

                {/* 2. INFORMATIONS LIVRE */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wide">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    <span>Informations Livre</span>
                  </div>
                  {book ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="col-span-2">
                        <span className="text-slate-400">Titre :</span>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {book.title}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Auteur :</span>
                        <p className="font-medium text-slate-800 dark:text-slate-200">
                          {book.author}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Discipline :</span>
                        <p className="font-mono text-slate-800 dark:text-slate-200">
                          {book.genre}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">ISBN :</span>
                        <p className="font-mono text-slate-800 dark:text-slate-200">
                          {book.isbn}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Année :</span>
                        <p className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                          {book.publicationYear}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400">Livre non trouvé.</p>
                  )}
                </div>

                {/* 3. INFORMATIONS EMPRUNT */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wide">
                    <Calendar className="w-4 h-4 text-sky-600" />
                    <span>Informations Emprunt & Dates</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-400">Date d'emprunt :</span>
                      <p className="font-semibold font-mono text-slate-900 dark:text-white">
                        {formatFrenchDate(selectedLoan.loanDate)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Date limite de retour :</span>
                      <p className="font-semibold font-mono text-slate-900 dark:text-white">
                        {formatFrenchDate(selectedLoan.dueDate)}
                      </p>
                    </div>
                    {isReturned && (
                      <div>
                        <span className="text-slate-400">Date réelle de restitution :</span>
                        <p className="font-semibold font-mono text-emerald-600 dark:text-emerald-400">
                          {formatFrenchDate(selectedLoan.returnDate || '')}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400">Statut du prêt :</span>
                      <p className="font-semibold">
                        {isReturned ? (
                          <span className="text-slate-600 dark:text-slate-300">Retourné</span>
                        ) : delayInfo.days > 0 ? (
                          <span className="text-rose-600 dark:text-rose-400">
                            En retard ({delayInfo.days} jours)
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            Dans les délais
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action: Enregistrer le retour */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={() => setSelectedLoan(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Fermer
                </button>

                {!isReturned && (
                  <button
                    onClick={() => handleReturnFromDetails(selectedLoan.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Enregistrer le retour
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* New Loan Modal */}
      {isNewLoanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Créer un nouvel emprunt
              </h3>
              <button
                onClick={() => setIsNewLoanOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              {createError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                  {createError}
                </div>
              )}

              {/* Student Picker */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sélectionner l'étudiant autorisé *
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Choisir un étudiant --</option>
                  {students
                    .filter((s) => s.status === 'active')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.studentNumber}) - {s.email}
                      </option>
                    ))}
                </select>
              </div>

              {/* Book Picker */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sélectionner le livre à prêter *
                </label>
                <select
                  required
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Choisir un livre disponible --</option>
                  {books
                    .filter((b) => b.availableCopies > 0)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.availableCopies} dispo / {b.totalCopies}) - {b.isbn}
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Seuls les livres ayant au moins 1 exemplaire disponible apparaissent dans la liste.
                </p>
              </div>

              {/* Duration in Days */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Durée de l'emprunt (en jours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={customDays}
                  onChange={(e) => setCustomDays(parseInt(e.target.value) || settings.defaultLoanDurationDays)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Durée configurée par défaut : {settings.defaultLoanDurationDays} jours.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewLoanOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
                >
                  Valider l'emprunt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
