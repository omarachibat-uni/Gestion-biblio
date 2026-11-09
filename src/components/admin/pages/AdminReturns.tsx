import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  RotateCcw,
  Search,
  ScanLine,
  CheckCircle2,
  ClockAlert,
  BookOpen,
  User,
  ArrowRight,
} from 'lucide-react';
import { formatFrenchDate } from '../../../utils/delayCalculator';
import { QRScannerModal, ScannedBookData, ScannedStudentData } from '../../common/QRScannerModal';

export const AdminReturns: React.FC = () => {
  const { loans, books, students, returnLoan, getLoanDelayInfo, simulatedDate } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Active loans that can be returned
  const activeLoans = loans.filter((l) => l.status === 'active');

  const filteredLoans = activeLoans.filter((loan) => {
    const student = students.find((s) => s.id === loan.studentId);
    const book = books.find((b) => b.id === loan.bookId);

    const q = searchTerm.toLowerCase();
    const studentMatch = student
      ? `${student.firstName} ${student.lastName} ${student.studentNumber} ${student.email}`.toLowerCase().includes(q)
      : false;
    const bookMatch = book ? `${book.title} ${book.isbn}`.toLowerCase().includes(q) : false;

    return studentMatch || bookMatch;
  });

  const handleProcessReturn = (loanId: string) => {
    returnLoan(loanId);
  };

  const handleScanSuccess = ({
    student,
    book,
  }: {
    student?: ScannedStudentData;
    book?: ScannedBookData;
  }) => {
    setIsScannerOpen(false);
    if (student) {
      setSearchTerm(student.studentNumber);
    } else if (book) {
      setSearchTerm(book.isbn);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Enregistrement des Retours
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Validation physique des restitutions d'ouvrages par le bibliothécaire
          </p>
        </div>

        <button
          onClick={() => setIsScannerOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 rounded-lg shadow-sm transition-colors"
        >
          <ScanLine className="w-4 h-4 text-sky-400" />
          Scanner le livre à retourner
        </button>
      </div>

      {/* Quick Search */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par carte étudiant, nom, prénom ou titre du livre..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Active Loans to Return */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLoans.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            Aucun emprunt actif ne correspond à votre recherche.
          </div>
        ) : (
          filteredLoans.map((loan) => {
            const student = students.find((s) => s.id === loan.studentId);
            const book = books.find((b) => b.id === loan.bookId);
            const delayInfo = getLoanDelayInfo(loan);
            const isLate = delayInfo.days > 0;

            return (
              <div
                key={loan.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between gap-4 transition-all"
              >
                <div className="space-y-3">
                  {/* Status header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      Prêté le {formatFrenchDate(loan.loanDate)}
                    </span>
                    {isLate ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        <ClockAlert className="w-3.5 h-3.5" />
                        Retard : {delayInfo.days} jour(s)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        🟢 Dans les délais
                      </span>
                    )}
                  </div>

                  {/* Book & Student Info */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {book?.title || 'Livre'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {book?.author} · ISBN: <span className="font-mono">{book?.isbn}</span>
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {student ? `${student.firstName} ${student.lastName}` : 'Étudiant'}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {student?.studentNumber} · {student?.classLevel}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">À rendre pour le</span>
                      <p className="font-mono font-semibold text-slate-900 dark:text-white">
                        {formatFrenchDate(loan.dueDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Return Button */}
                <button
                  onClick={() => handleProcessReturn(loan.id)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Valider le retour du livre
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* QR Scanner */}
      {isScannerOpen && (
        <QRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          mode="book"
          onScanSuccess={handleScanSuccess}
        />
      )}
    </div>
  );
};
