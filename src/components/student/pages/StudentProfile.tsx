import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../../context/AppContext';
import { Student } from '../../../types';
import {
  User,
  GraduationCap,
  Mail,
  CreditCard,
  Building,
  Calendar,
  CheckCircle2,
  Download,
  Printer,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { formatFrenchDate } from '../../../utils/delayCalculator';

export const StudentProfile: React.FC = () => {
  const { currentUser, loans, simulatedDate } = useApp();
  const student = currentUser as Student;
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Payload for student QR Code
  const qrPayload = JSON.stringify({
    id: student.id,
    studentNumber: student.studentNumber,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    department: student.department,
    classLevel: student.classLevel,
  });

  useEffect(() => {
    if (qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        qrPayload,
        {
          width: 160,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (err) => {
          if (err) console.error('Error drawing student QR', err);
        }
      );
    }
  }, [qrPayload]);

  const handleDownloadCard = () => {
    window.print();
  };

  const activeLoanCount = loans.filter((l) => l.studentId === student.id && l.status === 'active').length;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Mon Profil Académique & Carte Étudiant
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Identité universitaire, droits d'emprunt et carte numérique officielle USMBA
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Digital Student Card */}
        <div className="lg:col-span-6 space-y-3">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white border border-sky-900/60 shadow-xl relative overflow-hidden">
            {/* Background seal watermarks */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full border border-sky-400/10 pointer-events-none" />
            <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full border border-sky-400/10 pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-300">
                    Université Sidi Mohamed Ben Abdellah
                  </h4>
                  <p className="text-[10px] text-slate-300">Carte de Bibliothèque Universitaire</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded border border-sky-500/30">
                2026-2027
              </span>
            </div>

            {/* Card Body */}
            <div className="my-5 flex items-center justify-between gap-4">
              <div className="space-y-2 min-w-0 flex-1">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-sky-400 block">
                    Étudiant Titulaire
                  </span>
                  <p className="text-base font-bold text-white truncate">
                    {student.firstName} {student.lastName}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-sky-400 block">
                    N° Matricule / Code
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-200">
                    {student.studentNumber}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-sky-400 block">
                    Filière & Établissement
                  </span>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    {student.classLevel}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {student.department}
                  </p>
                </div>
              </div>

              {/* QR Code Canvas */}
              <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                <canvas ref={qrCanvasRef} className="w-28 h-28" />
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>{student.email}</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                Habilité aux prêts
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={handleDownloadCard}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer la carte
            </button>
          </div>
        </div>

        {/* Right: Academic Details & Statistics */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Dossier Administratif
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                Compte Validé
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-500">Adresse institutionnelle :</span>
                <span className="font-mono font-medium text-slate-900 dark:text-white">
                  {student.email}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-500">Identifiant d'étudiant :</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {student.studentNumber}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-500">Faculté / Institut :</span>
                <span className="font-medium text-slate-900 dark:text-white text-right">
                  {student.department}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-500">Niveau / Promotion :</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {student.classLevel}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-500">Téléphone de contact :</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {student.phone || 'Non renseigné'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Prêts actifs en cours :</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {activeLoanCount} livre(s)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
