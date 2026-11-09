import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  X,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  Copy,
  Info,
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose }) => {
  const { importStudents } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [summary, setSummary] = useState<{
    totalFound: number;
    addedCount: number;
    duplicateCount: number;
    errorCount: number;
    errors: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    // Generate sample Excel workbook
    const templateData = [
      {
        Nom: 'Benali',
        Prenom: 'Ayman',
        Email: 'ayman.benali@usmba.ac.ma',
        NumeroEtudiant: 'E20248811',
        Filiere: 'Faculté des Sciences Dhar El Mehraz',
        Classe: 'Master 1 Ingénierie Logicielle',
        Telephone: '+212 6 61 00 11 22',
      },
      {
        Nom: 'Tazi',
        Prenom: 'Kenza',
        Email: 'kenza.tazi@usmba.ac.ma',
        NumeroEtudiant: 'E20248812',
        Filiere: 'ENSA Fès',
        Classe: '2ème Année Génie Civil',
        Telephone: '+212 6 72 33 44 55',
      },
      {
        Nom: 'Hassani',
        Prenom: 'Nabil',
        Email: 'nabil.hassani@usmba.ac.ma',
        NumeroEtudiant: 'E20248813',
        Filiere: 'Faculté de Médecine et de Pharmacie',
        Classe: '4ème Année Médecine',
        Telephone: '+212 6 63 77 88 99',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Etudiants_USMBA');
    XLSX.writeFile(workbook, 'modele_etudiants_usmba.xlsx');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setSummary(null);
    }
  };

  const handleProcessImport = async () => {
    if (!file) return;

    setParsing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (!rows || rows.length === 0) {
        setSummary({
          totalFound: 0,
          addedCount: 0,
          duplicateCount: 0,
          errorCount: 1,
          errors: ['Le fichier Excel est vide ou ne contient aucune ligne de données.'],
        });
        setParsing(false);
        return;
      }

      // Map rows with case-insensitive column names
      const mappedStudents = rows.map((r) => {
        const findVal = (...keys: string[]) => {
          for (const k of keys) {
            for (const rowKey of Object.keys(r)) {
              if (rowKey.trim().toLowerCase() === k.toLowerCase()) {
                return String(r[rowKey] || '').trim();
              }
            }
          }
          return '';
        };

        const firstName = findVal('prenom', 'prénom', 'firstname', 'first_name');
        const lastName = findVal('nom', 'lastname', 'last_name');
        const email = findVal('email', 'e-mail', 'mail', 'courriel');
        const studentNumber = findVal('numeroetudiant', 'numetudiant', 'cne', 'massar', 'id', 'code_etudiant', 'matricule');
        const department = findVal('filiere', 'filière', 'departement', 'faculte', 'faculté', 'etablissement') || 'Faculté des Sciences';
        const classLevel = findVal('classe', 'niveau', 'promotion', 'annee') || 'Licence';
        const phone = findVal('telephone', 'téléphone', 'tel', 'phone');

        return {
          firstName,
          lastName,
          email,
          studentNumber,
          department,
          classLevel,
          phone,
        };
      });

      const result = importStudents(mappedStudents);
      setSummary(result);
    } catch (err: any) {
      setSummary({
        totalFound: 0,
        addedCount: 0,
        duplicateCount: 0,
        errorCount: 1,
        errors: [`Erreur de lecture du fichier : ${err.message || 'Format de fichier non reconnu'}`],
      });
    } finally {
      setParsing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setSummary(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Importer des étudiants (Excel / CSV)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ajout groupé d'étudiants autorisés à utiliser la bibliothèque
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Instructions and Download Template */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start justify-between gap-4">
            <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <p className="font-semibold text-sm">Format attendu des colonnes :</p>
              <p className="text-emerald-700 dark:text-emerald-300">
                <span className="font-medium">Nom</span>, <span className="font-medium">Prénom</span>,{' '}
                <span className="font-medium">Email</span> (@usmba.ac.ma), <span className="font-medium">Numéro Étudiant</span>,{' '}
                <span className="font-medium">Filière</span>, <span className="font-medium">Classe</span>
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-100 bg-white dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800 shadow-2xs transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger modèle .xlsx
            </button>
          </div>

          {!summary ? (
            /* File Picker Zone */
            <div className="space-y-4">
              <label
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  file
                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <Upload className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-2" />
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {file ? file.name : 'Sélectionnez un fichier Excel ou CSV'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Glissez-déposez ou cliquez pour parcourir (.xlsx, .xls, .csv)
                </p>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {file && (
                <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Fichier prêt : {file.name} ({(file.size / 1024).toFixed(1)} Ko)
                  </span>
                  <button
                    onClick={handleReset}
                    className="text-rose-600 hover:underline font-medium"
                  >
                    Changer de fichier
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Summary Report */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Résumé de l'importation
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total lignes</p>
                    <p className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                      {summary.totalFound}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">Ajoutés</p>
                    <p className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300">
                      {summary.addedCount}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <p className="text-xs text-amber-700 dark:text-amber-300">Doublons</p>
                    <p className="text-lg font-bold font-mono text-amber-700 dark:text-amber-300">
                      {summary.duplicateCount}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                    <p className="text-xs text-rose-700 dark:text-rose-300">Erreurs</p>
                    <p className="text-lg font-bold font-mono text-rose-700 dark:text-rose-300">
                      {summary.errorCount}
                    </p>
                  </div>
                </div>

                {summary.addedCount > 0 && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      {summary.addedCount} nouveaux étudiants sont immédiatement autorisés à se connecter.
                    </span>
                  </div>
                )}
              </div>

              {/* Error Details */}
              {summary.errors.length > 0 && (
                <div className="p-4 bg-rose-50/70 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800">
                  <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-semibold text-xs mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Détail des anomalies détectées ({summary.errors.length}) :</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 text-xs text-rose-700 dark:text-rose-300 font-mono">
                    {summary.errors.map((err, i) => (
                      <p key={i} className="py-0.5 border-b border-rose-100 dark:border-rose-900/50 last:border-0">
                        • {err}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {summary ? 'Fermer' : 'Annuler'}
          </button>

          {!summary ? (
            <button
              onClick={handleProcessImport}
              disabled={!file || parsing}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
            >
              {parsing ? 'Analyse en cours...' : 'Lancer l\'importation'}
            </button>
          ) : (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Importer un autre fichier
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
