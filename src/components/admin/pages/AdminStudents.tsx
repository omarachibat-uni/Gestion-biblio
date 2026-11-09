import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Student } from '../../../types';
import {
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  ScanLine,
  QrCode,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { ExcelImportModal } from '../ExcelImportModal';
import { QRCodeModal } from '../../common/QRCodeModal';
import { QRScannerModal, ScannedStudentData } from '../../common/QRScannerModal';

export const AdminStudents: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, toggleStudentStatus, loans } = useApp();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [qrCodeStudent, setQrCodeStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentNumber: '',
    department: 'Faculté des Sciences Dhar El Mehraz',
    classLevel: 'Master 1',
    phone: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Calculate active loans per student
  const activeLoansCountByStudent = useMemo(() => {
    const map: { [studentId: string]: number } = {};
    loans.forEach((l) => {
      if (l.status === 'active') {
        map[l.studentId] = (map[l.studentId] || 0) + 1;
      }
    });
    return map;
  }, [loans]);

  // Filtered list
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        s.firstName.toLowerCase().includes(query) ||
        s.lastName.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.studentNumber.toLowerCase().includes(query) ||
        s.department.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' || s.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, searchTerm, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormError(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      studentNumber: `E2024${Math.floor(1000 + Math.random() * 9000)}`,
      department: 'Faculté des Sciences Dhar El Mehraz',
      classLevel: 'Master 1',
      phone: '+212 6 ',
      status: 'active',
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormError(null);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      studentNumber: student.studentNumber,
      department: student.department,
      classLevel: student.classLevel,
      phone: student.phone || '',
      status: student.status,
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.email.endsWith('@usmba.ac.ma')) {
      setFormError("L'adresse e-mail doit impérativement se terminer par @usmba.ac.ma");
      return;
    }

    if (editingStudent) {
      const res = updateStudent(editingStudent.id, formData);
      if (!res.success) {
        setFormError(res.message || 'Erreur lors de la mise à jour.');
        return;
      }
    } else {
      const res = addStudent(formData);
      if (!res.success) {
        setFormError(res.message || "Erreur lors de l'enregistrement.");
        return;
      }
    }

    setIsFormOpen(false);
  };

  const handleScanSuccess = ({ student }: { student?: ScannedStudentData }) => {
    setIsQRScannerOpen(false);
    if (student) {
      setEditingStudent(null);
      setFormError(null);
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        studentNumber: student.studentNumber,
        department: student.department,
        classLevel: student.classLevel,
        phone: student.phone || '',
        status: 'active',
      });
      setIsFormOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      const res = deleteStudent(studentToDelete.id);
      if (!res.success) {
        alert(res.message);
      }
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Gestion des Étudiants Autorisés
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Liste blanche des comptes habilités à emprunter et se connecter au portail USMBA
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsQRScannerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
          >
            <ScanLine className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Scanner une carte étudiant
          </button>
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 rounded-lg shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Importer Excel
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter un étudiant
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, prénom, email @usmba.ac.ma, code étudiant..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">🟢 Actifs uniquement</option>
            <option value="inactive">🟡 Désactivés / Suspendus</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Étudiant</th>
                <th className="py-3 px-4">Email Académique</th>
                <th className="py-3 px-4">N° Étudiant</th>
                <th className="py-3 px-4">Filière & Classe</th>
                <th className="py-3 px-4 text-center">Prêts en cours</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucun étudiant trouvé.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const loanCount = activeLoansCountByStudent[student.id] || 0;
                  const isActive = student.status === 'active';

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {student.firstName} {student.lastName}
                            </p>
                            {student.phone && (
                              <p className="text-[11px] text-slate-400 font-mono">
                                {student.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {student.email}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {student.studentNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {student.classLevel}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">
                          {student.department}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono tabular-nums font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {loanCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            Suspendu
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setQrCodeStudent(student)}
                            title="Générer / Imprimer la carte QR code"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleStudentStatus(student.id)}
                            title={isActive ? 'Désactiver le compte' : 'Réactiver le compte'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActive
                                ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                                : 'text-amber-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                            }`}
                          >
                            {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(student)}
                            title="Modifier l'étudiant"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setStudentToDelete(student)}
                            title="Supprimer définitivement"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Form Modal (Add / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {editingStudent ? "Modifier l'étudiant" : 'Enregistrer un nouvel étudiant'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Ex: Ahmed"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Ex: Benali"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email académique (@usmba.ac.ma) *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="prenom.nom@usmba.ac.ma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Seuls les emails académiques sont autorisés à accéder au système.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Numéro étudiant / Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentNumber}
                    onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                    placeholder="E2024001"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Téléphone (optionnel)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+212 6..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Faculté / Établissement
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Faculté des Sciences, ENSA..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Filière / Niveau
                  </label>
                  <input
                    type="text"
                    value={formData.classLevel}
                    onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                    placeholder="Licence 3 SMI, Master ISI..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
                >
                  {editingStudent ? 'Enregistrer les modifications' : "Ajouter l'étudiant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Supprimer cet étudiant ?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              Confirmez-vous le retrait de{' '}
              <strong className="text-slate-900 dark:text-white">
                {studentToDelete.firstName} {studentToDelete.lastName}
              </strong>{' '}
              de la liste des étudiants autorisés ? (L'historique des prêts passés sera préservé).
            </p>
            <div className="flex gap-2 justify-center mt-6">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student QR Code Modal */}
      {qrCodeStudent && (
        <QRCodeModal
          isOpen={!!qrCodeStudent}
          onClose={() => setQrCodeStudent(null)}
          title={`Carte Étudiant : ${qrCodeStudent.firstName} ${qrCodeStudent.lastName}`}
          subtitle={`USMBA · ${qrCodeStudent.studentNumber} · ${qrCodeStudent.classLevel}`}
          data={JSON.stringify({
            id: qrCodeStudent.id,
            studentNumber: qrCodeStudent.studentNumber,
            firstName: qrCodeStudent.firstName,
            lastName: qrCodeStudent.lastName,
            email: qrCodeStudent.email,
            department: qrCodeStudent.department,
            classLevel: qrCodeStudent.classLevel,
          })}
        />
      )}

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
      />

      {/* QR Scanner Modal for Student Card */}
      {isQRScannerOpen && (
        <QRScannerModal
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          mode="student"
          onScanSuccess={handleScanSuccess}
        />
      )}
    </div>
  );
};
