import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  ClockAlert,
  Mail,
  CheckSquare,
  Square,
  Send,
  Eye,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  History,
  X,
  Sparkles,
} from 'lucide-react';
import { formatFrenchDate } from '../../../utils/delayCalculator';

export const AdminDelays: React.FC = () => {
  const {
    loans,
    students,
    books,
    getLoanDelayInfo,
    settings,
    sendDelayReminders,
    sentEmails,
    simulatedDate,
  } = useApp();

  const [selectedLoanIds, setSelectedLoanIds] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Filter only overdue active loans
  const overdueLoans = useMemo(() => {
    return loans.filter((loan) => {
      if (loan.status !== 'active') return false;
      const delayInfo = getLoanDelayInfo(loan);
      return delayInfo.days > 0;
    });
  }, [loans, getLoanDelayInfo, simulatedDate]);

  // Map students and books
  const studentMap = useMemo(() => {
    const map = new Map();
    students.forEach((s) => map.set(s.id, s));
    return map;
  }, [students]);

  const bookMap = useMemo(() => {
    const map = new Map();
    books.forEach((b) => map.set(b.id, b));
    return map;
  }, [books]);

  // Checkbox toggle
  const toggleSelectLoan = (loanId: string) => {
    setSelectedLoanIds((prev) =>
      prev.includes(loanId) ? prev.filter((id) => id !== loanId) : [...prev, loanId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLoanIds.length === overdueLoans.length) {
      setSelectedLoanIds([]);
    } else {
      setSelectedLoanIds(overdueLoans.map((l) => l.id));
    }
  };

  // Preview messages generation
  const generatedPreviews = useMemo(() => {
    return selectedLoanIds.map((loanId) => {
      const loan = overdueLoans.find((l) => l.id === loanId);
      if (!loan) return null;
      const student = studentMap.get(loan.studentId);
      const book = bookMap.get(loan.bookId);
      const delayInfo = getLoanDelayInfo(loan);

      const subject = settings.emailSubjectTemplate
        .replace(/{nom}/g, student?.lastName || '')
        .replace(/{prenom}/g, student?.firstName || '')
        .replace(/{livre}/g, book?.title || '')
        .replace(/{retard}/g, String(delayInfo.days))
        .replace(/{dateLimite}/g, formatFrenchDate(loan.dueDate));

      const body = settings.emailBodyTemplate
        .replace(/{nom}/g, `${student?.firstName} ${student?.lastName}`)
        .replace(/{prenom}/g, student?.firstName || '')
        .replace(/{livre}/g, book?.title || '')
        .replace(/{retard}/g, String(delayInfo.days))
        .replace(/{dateLimite}/g, formatFrenchDate(loan.dueDate));

      return {
        loanId,
        studentName: `${student?.firstName} ${student?.lastName}`,
        studentEmail: student?.email || '',
        bookTitle: book?.title || '',
        daysLate: delayInfo.days,
        severity: delayInfo.severity,
        subject,
        body,
      };
    }).filter(Boolean);
  }, [selectedLoanIds, overdueLoans, studentMap, bookMap, settings, getLoanDelayInfo]);

  const handleSendBatch = () => {
    sendDelayReminders(selectedLoanIds);
    setSelectedLoanIds([]);
    setIsConfirmOpen(false);
    setIsPreviewOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClockAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            Gestion des Retards & Rappels Personnalisés
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Calcul automatique des dépassements au {formatFrenchDate(simulatedDate)} et envoi d'emails individualisés
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedLoanIds.length > 0 && (
            <button
              onClick={() => {
                setPreviewIndex(0);
                setIsPreviewOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
            >
              <Eye className="w-4 h-4 text-sky-600" />
              Prévisualiser les emails ({selectedLoanIds.length})
            </button>
          )}

          <button
            onClick={() => setIsConfirmOpen(true)}
            disabled={selectedLoanIds.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
          >
            <Send className="w-4 h-4" />
            Envoyer un rappel ({selectedLoanIds.length})
          </button>
        </div>
      </div>

      {/* Thresholds Legend Card */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
          <span>Barème des seuils de retard :</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 text-yellow-700 dark:text-yellow-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            Faible (1 à {settings.thresholdLow}j)
          </span>
          <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Moyen ({settings.thresholdLow + 1} à {settings.thresholdMedium}j)
          </span>
          <span className="flex items-center gap-1 text-orange-700 dark:text-orange-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            Élevé ({settings.thresholdMedium + 1} à {settings.thresholdHigh}j)
          </span>
          <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            Critique ({settings.thresholdHigh + 1}j+)
          </span>
        </div>
      </div>

      {/* Overdue Table with Checkboxes */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleSelectAll}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-sky-600 transition-colors"
          >
            {selectedLoanIds.length === overdueLoans.length && overdueLoans.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-sky-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>
              {selectedLoanIds.length === overdueLoans.length && overdueLoans.length > 0
                ? 'Tout désélectionner'
                : `Tout sélectionner (${overdueLoans.length} étudiants)`}
            </span>
          </button>

          <span className="text-xs text-slate-400 font-mono">
            {selectedLoanIds.length} sélectionné(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-10 text-center">Sélection</th>
                <th className="py-3 px-4">Étudiant</th>
                <th className="py-3 px-4">Livre concerné</th>
                <th className="py-3 px-4">Date limite</th>
                <th className="py-3 px-4 text-center">Jours de retard</th>
                <th className="py-3 px-4 text-center">Niveau de gravité</th>
                <th className="py-3 px-4 text-right">Action directe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {overdueLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Excellente nouvelle !
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Aucun emprunt n'est actuellement en retard au {formatFrenchDate(simulatedDate)}.
                    </p>
                  </td>
                </tr>
              ) : (
                overdueLoans.map((loan) => {
                  const student = studentMap.get(loan.studentId);
                  const book = bookMap.get(loan.bookId);
                  const delayInfo = getLoanDelayInfo(loan);
                  const isChecked = selectedLoanIds.includes(loan.id);

                  return (
                    <tr
                      key={loan.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
                        isChecked ? 'bg-sky-50/40 dark:bg-sky-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleSelectLoan(loan.id)}
                          className="text-slate-400 hover:text-sky-600 transition-colors"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-sky-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {student ? `${student.firstName} ${student.lastName}` : 'Inconnu'}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {student?.email}
                        </p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {book ? book.title : 'Livre'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {book?.author}
                        </p>
                      </td>

                      <td className="py-3 px-4 font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {formatFrenchDate(loan.dueDate)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400 tabular-nums">
                          +{delayInfo.days} jour(s)
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${delayInfo.badgeBg} ${delayInfo.badgeText}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${delayInfo.dotColor}`} />
                          {delayInfo.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            sendDelayReminders([loan.id]);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/50 rounded-lg transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Rappel solo
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

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Confirmation d'envoi groupé
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              Vous êtes sur le point d'envoyer un rappel personnalisé à{' '}
              <strong className="text-slate-900 dark:text-white">
                {selectedLoanIds.length} étudiant(s)
              </strong>
              .
            </p>
            <p className="text-[11px] text-slate-500 mt-2">
              Chaque message comportera le calcul précis du nombre de jours de retard de l'étudiant et le titre exact de son ouvrage.
            </p>

            <div className="flex gap-2 justify-center mt-6">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSendBatch}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Confirmer l'envoi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal for Personalized Emails */}
      {isPreviewOpen && generatedPreviews.length > 0 && (() => {
        const currentPreview = generatedPreviews[previewIndex] as any;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-sky-600" />
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Aperçu personnalisé ({previewIndex + 1} sur {generatedPreviews.length})
                  </h3>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg space-y-1">
                  <p>
                    <span className="text-slate-400">Destinataire :</span>{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {currentPreview.studentName} ({currentPreview.studentEmail})
                    </strong>
                  </p>
                  <p>
                    <span className="text-slate-400">Livre :</span>{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {currentPreview.bookTitle}
                    </strong>
                  </p>
                  <p>
                    <span className="text-slate-400">Retard calculé :</span>{' '}
                    <strong className="text-rose-600 font-mono">
                      {currentPreview.daysLate} jour(s)
                    </strong>
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Objet de l'e-mail
                  </label>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-slate-900 dark:text-white">
                    {currentPreview.subject}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Corps du message personnalisé
                  </label>
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                    {currentPreview.body}
                  </div>
                </div>

                {/* Pagination between previews */}
                {generatedPreviews.length > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setPreviewIndex((prev) => Math.max(0, prev - 1))}
                      disabled={previewIndex === 0}
                      className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-30"
                    >
                      ← Précédent
                    </button>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Étudiant {previewIndex + 1} / {generatedPreviews.length}
                    </span>
                    <button
                      onClick={() =>
                        setPreviewIndex((prev) => Math.min(generatedPreviews.length - 1, prev + 1))
                      }
                      disabled={previewIndex === generatedPreviews.length - 1}
                      className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 disabled:opacity-30"
                    >
                      Suivant →
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Fermer l'aperçu
                </button>
                <button
                  onClick={() => {
                    setIsPreviewOpen(false);
                    setIsConfirmOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  Envoyer les {selectedLoanIds.length} emails
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* History of Sent Emails */}
      {sentEmails.length > 0 && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-sky-600" />
              Journal des Rappels Envoyés ({sentEmails.length})
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Horodatage SIGB
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
            {sentEmails.slice(0, 10).map((email) => (
              <div key={email.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    À : {email.studentName} ({email.studentEmail})
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    Livre: {email.bookTitle} · Retard notifié : {email.daysLate} jour(s)
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Expédié
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono">{email.sentAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
