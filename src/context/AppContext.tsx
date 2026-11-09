import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AdminUser,
  AppSettings,
  Book,
  DelayInfo,
  Loan,
  SentEmail,
  Student,
  ToastMessage,
  UserRole,
} from '../types';
import {
  INITIAL_BOOKS,
  INITIAL_LOANS,
  INITIAL_SETTINGS,
  INITIAL_SIMULATED_DATE,
  INITIAL_STUDENTS,
} from '../services/seedData';
import { addDaysToDate, calculateDelay } from '../utils/delayCalculator';

interface ExcelImportSummary {
  totalFound: number;
  addedCount: number;
  duplicateCount: number;
  errorCount: number;
  errors: string[];
}

interface AppContextType {
  currentUser: AdminUser | Student | null;
  role: UserRole | null;
  simulatedDate: string;
  setSimulatedDate: (date: string) => void;
  students: Student[];
  books: Book[];
  loans: Loan[];
  settings: AppSettings;
  sentEmails: SentEmail[];
  toasts: ToastMessage[];
  login: (email: string, password?: string) => { success: boolean; message?: string };
  logout: () => void;
  // Student operations
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => { success: boolean; message?: string };
  updateStudent: (id: string, student: Partial<Student>) => { success: boolean; message?: string };
  deleteStudent: (id: string) => { success: boolean; message?: string };
  toggleStudentStatus: (id: string) => void;
  importStudents: (incomingStudents: Array<{
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    classLevel: string;
    studentNumber: string;
    phone?: string;
  }>) => ExcelImportSummary;
  // Book operations
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'borrowCount' | 'availableCopies'> & { totalCopies: number }) => { success: boolean; message?: string };
  updateBook: (id: string, book: Partial<Book>) => { success: boolean; message?: string };
  deleteBook: (id: string) => { success: boolean; message?: string };
  // Loan & Return operations
  createLoan: (studentId: string, bookId: string, customDurationDays?: number) => { success: boolean; message?: string };
  returnLoan: (loanId: string) => { success: boolean; message?: string };
  // Delays and Emails
  getLoanDelayInfo: (loan: Loan) => DelayInfo;
  sendDelayReminders: (loanIds: string[]) => { count: number; messages: SentEmail[] };
  // Settings
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetAllData: () => void;
  // Notifications
  showToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'bu_usmba_current_user',
  SIMULATED_DATE: 'bu_usmba_simulated_date',
  STUDENTS: 'bu_usmba_students',
  BOOKS: 'bu_usmba_books',
  LOANS: 'bu_usmba_loans',
  SETTINGS: 'bu_usmba_settings',
  EMAILS: 'bu_usmba_emails',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Current simulated date
  const [simulatedDate, setSimulatedDateState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.SIMULATED_DATE) || INITIAL_SIMULATED_DATE;
  });

  // 2. Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // 3. Students
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  // 4. Books
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKS);
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  // 5. Loans
  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOANS);
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  // 6. Sent emails
  const [sentEmails, setSentEmails] = useState<SentEmail[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EMAILS);
    return saved ? JSON.parse(saved) : [];
  });

  // 7. Current user
  const [currentUser, setCurrentUser] = useState<AdminUser | Student | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : null;
  });

  // 8. Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIMULATED_DATE, simulatedDate);
  }, [simulatedDate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EMAILS, JSON.stringify(sentEmails));
  }, [sentEmails]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  const showToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setSimulatedDate = (date: string) => {
    setSimulatedDateState(date);
    showToast('info', 'Date système ajustée', `Date de référence : ${date}`);
  };

  // Determine current role
  const role: UserRole | null = currentUser
    ? 'role' in currentUser && currentUser.role === 'admin'
      ? 'admin'
      : 'student'
    : null;

  // Authentication
  const login = (emailInput: string, passwordInput?: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();

    // 1. Mandatory @usmba.ac.ma domain check
    if (!cleanEmail.endsWith('@usmba.ac.ma')) {
      showToast('error', 'Domaine non autorisé', "Seules les adresses académiques en '@usmba.ac.ma' sont acceptées.");
      return {
        success: false,
        message: "L'adresse e-mail doit obligatoirement se terminer par @usmba.ac.ma.",
      };
    }

    // 2. Admin account check
    if (cleanEmail === 'admin@usmba.ac.ma') {
      const admin: AdminUser = {
        id: 'admin-1',
        name: 'Directeur Bibliothèque BU-USMBA',
        email: 'admin@usmba.ac.ma',
        role: 'admin',
        title: 'Responsable des Prêts & Acquisitions',
      };
      setCurrentUser(admin);
      showToast('success', 'Connexion réussie', 'Bienvenue dans le portail administrateur.');
      return { success: true };
    }

    // 3. Student account whitelist verification
    const student = students.find((s) => s.email.toLowerCase() === cleanEmail);

    if (!student) {
      showToast(
        'error',
        'Étudiant non enregistré',
        "Votre adresse @usmba.ac.ma n'est pas encore enregistrée par la bibliothèque. Veuillez contacter l'administration."
      );
      return {
        success: false,
        message: "Accès refusé : vous ne figurez pas sur la liste des étudiants autorisés par l'administration.",
      };
    }

    if (student.status === 'inactive') {
      showToast(
        'warning',
        'Compte désactivé',
        "Votre compte étudiant a été temporairement suspendu par l'administration."
      );
      return {
        success: false,
        message: 'Ce compte étudiant est actuellement inactif ou suspendu.',
      };
    }

    setCurrentUser(student);
    showToast('success', 'Connexion réussie', `Bienvenue ${student.firstName} ${student.lastName} !`);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('info', 'Déconnexion', 'Vous avez été déconnecté avec succès.');
  };

  // Student management
  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const email = studentData.email.trim().toLowerCase();
    if (!email.endsWith('@usmba.ac.ma')) {
      return { success: false, message: "L'adresse e-mail doit se terminer par @usmba.ac.ma" };
    }

    const emailExists = students.some((s) => s.email.toLowerCase() === email);
    if (emailExists) {
      return { success: false, message: 'Un étudiant avec cette adresse e-mail existe déjà.' };
    }

    const numberExists = students.some(
      (s) => s.studentNumber.toUpperCase() === studentData.studentNumber.trim().toUpperCase()
    );
    if (numberExists) {
      return { success: false, message: 'Un étudiant avec ce numéro d\'étudiant existe déjà.' };
    }

    const newStudent: Student = {
      ...studentData,
      id: `std-${Date.now()}`,
      email,
      studentNumber: studentData.studentNumber.trim().toUpperCase(),
      createdAt: simulatedDate,
    };

    setStudents((prev) => [newStudent, ...prev]);
    showToast('success', 'Étudiant ajouté', `${newStudent.firstName} ${newStudent.lastName} est maintenant autorisé.`);
    return { success: true };
  };

  const updateStudent = (id: string, updatedData: Partial<Student>) => {
    if (updatedData.email) {
      const cleanEmail = updatedData.email.trim().toLowerCase();
      if (!cleanEmail.endsWith('@usmba.ac.ma')) {
        return { success: false, message: "L'adresse doit se terminer par @usmba.ac.ma" };
      }
      const duplicate = students.some((s) => s.id !== id && s.email.toLowerCase() === cleanEmail);
      if (duplicate) {
        return { success: false, message: 'Cet e-mail est déjà utilisé par un autre étudiant.' };
      }
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );
    showToast('success', 'Étudiant modifié', 'Les informations ont été mises à jour.');
    return { success: true };
  };

  const deleteStudent = (id: string) => {
    // Check if student has active loans
    const hasActiveLoans = loans.some((l) => l.studentId === id && l.status === 'active');
    if (hasActiveLoans) {
      return {
        success: false,
        message: "Impossible de supprimer un étudiant ayant des emprunts en cours. Enregistrez les retours d'abord ou désactivez-le.",
      };
    }

    setStudents((prev) => prev.filter((s) => s.id !== id));
    showToast('info', 'Étudiant supprimé', "L'étudiant a été retiré de la liste (l'historique des prêts est préservé).");
    return { success: true };
  };

  const toggleStudentStatus = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === 'active' ? 'inactive' : 'active';
          showToast(
            nextStatus === 'active' ? 'success' : 'warning',
            `Statut étudiant mis à jour`,
            `${s.firstName} ${s.lastName} est désormais ${nextStatus === 'active' ? 'Actif' : 'Désactivé'}`
          );
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const importStudents = (
    incomingStudents: Array<{
      firstName: string;
      lastName: string;
      email: string;
      department: string;
      classLevel: string;
      studentNumber: string;
      phone?: string;
    }>
  ): ExcelImportSummary => {
    const summary: ExcelImportSummary = {
      totalFound: incomingStudents.length,
      addedCount: 0,
      duplicateCount: 0,
      errorCount: 0,
      errors: [],
    };

    const newStudentsToAdd: Student[] = [];
    const existingEmails = new Set(students.map((s) => s.email.toLowerCase()));
    const existingNumbers = new Set(students.map((s) => s.studentNumber.toUpperCase()));

    incomingStudents.forEach((row, index) => {
      const lineNum = index + 2; // considering header is line 1
      const firstName = row.firstName?.trim() || '';
      const lastName = row.lastName?.trim() || '';
      const email = row.email?.trim().toLowerCase() || '';
      const studentNumber = row.studentNumber?.trim().toUpperCase() || '';
      const department = row.department?.trim() || 'Faculté des Sciences';
      const classLevel = row.classLevel?.trim() || 'Licence';
      const phone = row.phone?.trim() || '';

      if (!firstName || !lastName) {
        summary.errorCount++;
        summary.errors.push(`Ligne ${lineNum} : Prénom ou nom manquant.`);
        return;
      }

      if (!email || !email.endsWith('@usmba.ac.ma')) {
        summary.errorCount++;
        summary.errors.push(`Ligne ${lineNum} (${firstName} ${lastName}) : Email invalide (${email}). Doit être @usmba.ac.ma.`);
        return;
      }

      if (!studentNumber) {
        summary.errorCount++;
        summary.errors.push(`Ligne ${lineNum} (${firstName} ${lastName}) : Numéro étudiant manquant.`);
        return;
      }

      if (existingEmails.has(email) || newStudentsToAdd.some((s) => s.email === email)) {
        summary.duplicateCount++;
        summary.errors.push(`Ligne ${lineNum} (${firstName} ${lastName}) : Email ${email} déjà existant.`);
        return;
      }

      if (existingNumbers.has(studentNumber) || newStudentsToAdd.some((s) => s.studentNumber === studentNumber)) {
        summary.duplicateCount++;
        summary.errors.push(`Ligne ${lineNum} : Numéro étudiant ${studentNumber} déjà existant.`);
        return;
      }

      newStudentsToAdd.push({
        id: `std-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        firstName,
        lastName,
        email,
        studentNumber,
        department,
        classLevel,
        phone,
        status: 'active',
        createdAt: simulatedDate,
      });
    });

    if (newStudentsToAdd.length > 0) {
      setStudents((prev) => [...newStudentsToAdd, ...prev]);
    }

    summary.addedCount = newStudentsToAdd.length;

    showToast(
      summary.addedCount > 0 ? 'success' : 'warning',
      'Import Excel terminé',
      `${summary.addedCount} ajoutés, ${summary.duplicateCount} doublons, ${summary.errorCount} erreurs.`
    );

    return summary;
  };

  // Book management
  const addBook = (
    bookData: Omit<Book, 'id' | 'createdAt' | 'borrowCount' | 'availableCopies'> & { totalCopies: number }
  ) => {
    const totalCopies = Math.max(1, Number(bookData.totalCopies) || 1);
    const newBook: Book = {
      ...bookData,
      id: `bk-${Date.now()}`,
      totalCopies,
      availableCopies: totalCopies,
      borrowCount: 0,
      createdAt: simulatedDate,
    };

    setBooks((prev) => [newBook, ...prev]);
    showToast('success', 'Livre ajouté', `"${newBook.title}" a été ajouté au catalogue.`);
    return { success: true };
  };

  const updateBook = (id: string, updatedData: Partial<Book>) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        let nextTotal = b.totalCopies;
        let nextAvailable = b.availableCopies;

        if (updatedData.totalCopies !== undefined) {
          const delta = updatedData.totalCopies - b.totalCopies;
          nextTotal = updatedData.totalCopies;
          nextAvailable = Math.max(0, b.availableCopies + delta);
        }

        return {
          ...b,
          ...updatedData,
          totalCopies: nextTotal,
          availableCopies: updatedData.availableCopies !== undefined ? updatedData.availableCopies : nextAvailable,
        };
      })
    );
    showToast('success', 'Livre modifié', 'Informations du livre mises à jour.');
    return { success: true };
  };

  const deleteBook = (id: string) => {
    const hasActiveLoan = loans.some((l) => l.bookId === id && l.status === 'active');
    if (hasActiveLoan) {
      return {
        success: false,
        message: 'Impossible de supprimer un livre ayant des exemplaires actuellement empruntés.',
      };
    }

    setBooks((prev) => prev.filter((b) => b.id !== id));
    showToast('info', 'Livre retiré', 'Le livre a été supprimé du catalogue.');
    return { success: true };
  };

  // Loan and return operations
  const createLoan = (studentId: string, bookId: string, customDurationDays?: number) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      return { success: false, message: 'Étudiant introuvable.' };
    }

    if (student.status !== 'active') {
      return { success: false, message: "Cet étudiant est désactivé et ne peut pas emprunter d'ouvrages." };
    }

    const book = books.find((b) => b.id === bookId);
    if (!book) {
      return { success: false, message: 'Livre introuvable.' };
    }

    if (book.availableCopies <= 0) {
      return { success: false, message: "Ce livre n'est actuellement pas disponible (tous les exemplaires sont empruntés)." };
    }

    // Check if this student already has this book actively borrowed
    const alreadyHasThisBook = loans.some(
      (l) => l.studentId === studentId && l.bookId === bookId && l.status === 'active'
    );
    if (alreadyHasThisBook) {
      return { success: false, message: "Cet étudiant a déjà emprunté un exemplaire de cet ouvrage en cours." };
    }

    const duration = customDurationDays || settings.defaultLoanDurationDays;
    const loanDate = simulatedDate;
    const dueDate = addDaysToDate(loanDate, duration);

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      studentId,
      bookId,
      loanDate,
      dueDate,
      returnDate: null,
      status: 'active',
    };

    // Update book copies and borrow count
    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId
          ? {
              ...b,
              availableCopies: Math.max(0, b.availableCopies - 1),
              borrowCount: b.borrowCount + 1,
            }
          : b
      )
    );

    setLoans((prev) => [newLoan, ...prev]);

    showToast(
      'success',
      'Emprunt enregistré',
      `"${book.title}" prêté à ${student.firstName} ${student.lastName} (à rendre le ${dueDate}).`
    );

    return { success: true };
  };

  const returnLoan = (loanId: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) {
      return { success: false, message: 'Emprunt introuvable.' };
    }

    if (loan.status === 'returned') {
      return { success: false, message: 'Cet emprunt a déjà été retourné.' };
    }

    const delayInfo = calculateDelay(loan.dueDate, simulatedDate, settings);
    const returnDate = simulatedDate;
    const daysOverdueAtReturn = delayInfo.days;

    // Update loan
    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              status: 'returned',
              returnDate,
              daysOverdueAtReturn,
            }
          : l
      )
    );

    // Make book available again
    setBooks((prev) =>
      prev.map((b) =>
        b.id === loan.bookId
          ? {
              ...b,
              availableCopies: Math.min(b.totalCopies, b.availableCopies + 1),
            }
          : b
      )
    );

    const book = books.find((b) => b.id === loan.bookId);
    const student = students.find((s) => s.id === loan.studentId);

    showToast(
      'success',
      'Retour enregistré',
      `"${book?.title || 'Livre'}" restitué par ${student ? student.firstName + ' ' + student.lastName : 'l\'étudiant'}.${
        daysOverdueAtReturn > 0 ? ` Retard enregistré : ${daysOverdueAtReturn} jour(s).` : ' Rendu à temps !'
      }`
    );

    return { success: true };
  };

  const getLoanDelayInfo = (loan: Loan): DelayInfo => {
    return calculateDelay(loan.dueDate, simulatedDate, settings, loan.returnDate);
  };

  const sendDelayReminders = (loanIds: string[]): { count: number; messages: SentEmail[] } => {
    const sentList: SentEmail[] = [];

    loanIds.forEach((loanId) => {
      const loan = loans.find((l) => l.id === loanId && l.status === 'active');
      if (!loan) return;

      const student = students.find((s) => s.id === loan.studentId);
      const book = books.find((b) => b.id === loan.bookId);
      if (!student || !book) return;

      const delayInfo = getLoanDelayInfo(loan);
      if (delayInfo.days <= 0) return; // only overdue

      // Generate personalized body
      const subject = settings.emailSubjectTemplate
        .replace(/{nom}/g, student.lastName)
        .replace(/{prenom}/g, student.firstName)
        .replace(/{livre}/g, book.title)
        .replace(/{retard}/g, String(delayInfo.days))
        .replace(/{dateLimite}/g, loan.dueDate);

      const body = settings.emailBodyTemplate
        .replace(/{nom}/g, `${student.firstName} ${student.lastName}`)
        .replace(/{prenom}/g, student.firstName)
        .replace(/{livre}/g, book.title)
        .replace(/{retard}/g, String(delayInfo.days))
        .replace(/{dateLimite}/g, loan.dueDate);

      const sentItem: SentEmail = {
        id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        studentEmail: student.email,
        bookTitle: book.title,
        daysLate: delayInfo.days,
        subject,
        body,
        sentAt: `${simulatedDate} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
      };

      sentList.push(sentItem);
    });

    if (sentList.length > 0) {
      setSentEmails((prev) => [...sentList, ...prev]);
      showToast(
        'success',
        'Rappels envoyés',
        `${sentList.length} e-mail(s) personnalisé(s) ont été expédié(s) aux étudiants concernés.`
      );
    }

    return { count: sentList.length, messages: sentList };
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('success', 'Paramètres mis à jour', 'La configuration de la bibliothèque a été enregistrée.');
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.BOOKS);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.EMAILS);
    localStorage.removeItem(STORAGE_KEYS.SIMULATED_DATE);

    setStudents(INITIAL_STUDENTS);
    setBooks(INITIAL_BOOKS);
    setLoans(INITIAL_LOANS);
    setSettings(INITIAL_SETTINGS);
    setSentEmails([]);
    setSimulatedDateState(INITIAL_SIMULATED_DATE);

    showToast('info', 'Données réinitialisées', 'La base de données a été restaurée à ses valeurs initiales.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        role,
        simulatedDate,
        setSimulatedDate,
        students,
        books,
        loans,
        settings,
        sentEmails,
        toasts,
        login,
        logout,
        addStudent,
        updateStudent,
        deleteStudent,
        toggleStudentStatus,
        importStudents,
        addBook,
        updateBook,
        deleteBook,
        createLoan,
        returnLoan,
        getLoanDelayInfo,
        sendDelayReminders,
        updateSettings,
        resetAllData,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
