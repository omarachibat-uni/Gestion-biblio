import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Settings, Save, RotateCcw, Building, Clock, Mail, AlertTriangle } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, resetAllData } = useApp();

  const [formData, setFormData] = useState({ ...settings });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Paramètres du Système de Bibliothèque
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configuration des règles de prêt, des seuils de pénalité et des modèles de notification
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* 1. Règles d'emprunt et seuils de retard */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Clock className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Durée des Prêts & Seuils de Retard
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Durée standard d'un emprunt (en jours)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={formData.defaultLoanDurationDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultLoanDurationDays: Math.max(1, parseInt(e.target.value) || 14),
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Appliqué automatiquement lors de la création d'un prêt
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                🟡 Retard Faible (borne max en jours)
              </label>
              <input
                type="number"
                min="1"
                value={formData.thresholdLow}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    thresholdLow: Math.max(1, parseInt(e.target.value) || 3),
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Exemple : de 1 à {formData.thresholdLow} jours
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                🟠 Retard Moyen (borne max en jours)
              </label>
              <input
                type="number"
                min={formData.thresholdLow + 1}
                value={formData.thresholdMedium}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    thresholdMedium: Math.max(formData.thresholdLow + 1, parseInt(e.target.value) || 7),
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Exemple : de {formData.thresholdLow + 1} à {formData.thresholdMedium} jours
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                🔴 Retard Élevé (borne max en jours)
              </label>
              <input
                type="number"
                min={formData.thresholdMedium + 1}
                value={formData.thresholdHigh}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    thresholdHigh: Math.max(formData.thresholdMedium + 1, parseInt(e.target.value) || 14),
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Au-delà de {formData.thresholdHigh} jours, le statut bascule en "Critique".
              </p>
            </div>
          </div>
        </div>

        {/* 2. Modèle d'email de rappel */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Modèle d'Email de Rappel de Retard
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Variables disponibles : {'{nom}'}, {'{prenom}'}, {'{livre}'}, {'{retard}'}, {'{dateLimite}'}
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Objet de l'email
            </label>
            <input
              type="text"
              required
              value={formData.emailSubjectTemplate}
              onChange={(e) =>
                setFormData({ ...formData, emailSubjectTemplate: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Corps du message
            </label>
            <textarea
              rows={6}
              required
              value={formData.emailBodyTemplate}
              onChange={(e) =>
                setFormData({ ...formData, emailBodyTemplate: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-sky-500 leading-relaxed"
            />
          </div>
        </div>

        {/* 3. Informations de l'établissement */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Building className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Identité de la Bibliothèque Universitaire
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nom de la Bibliothèque
              </label>
              <input
                type="text"
                value={formData.libraryName}
                onChange={(e) => setFormData({ ...formData, libraryName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Université
              </label>
              <input
                type="text"
                value={formData.universityName}
                onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Campus / Localisation
              </label>
              <input
                type="text"
                value={formData.campus}
                onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email de contact
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser les données de démonstration
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            Enregistrer la configuration
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Restaurer la base initiale ?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              Cette action restaurera les données initiales de démonstration (livres, étudiants USMBA, emprunts et retards).
            </p>
            <div className="flex gap-2 justify-center mt-6">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
              >
                Oui, réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
