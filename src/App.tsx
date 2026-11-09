import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginView } from './components/auth/LoginView';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/pages/AdminDashboard';
import { AdminBooks } from './components/admin/pages/AdminBooks';
import { AdminStudents } from './components/admin/pages/AdminStudents';
import { AdminLoans } from './components/admin/pages/AdminLoans';
import { AdminReturns } from './components/admin/pages/AdminReturns';
import { AdminDelays } from './components/admin/pages/AdminDelays';
import { AdminSettings } from './components/admin/pages/AdminSettings';
import { StudentLayout, StudentTab } from './components/student/StudentLayout';
import { StudentDashboard } from './components/student/pages/StudentDashboard';
import { StudentCatalog } from './components/student/pages/StudentCatalog';
import { StudentLoans } from './components/student/pages/StudentLoans';
import { StudentHistory } from './components/student/pages/StudentHistory';
import { StudentProfile } from './components/student/pages/StudentProfile';
import { ToastContainer } from './components/common/ToastContainer';
import { QRScannerModal, ScannedBookData, ScannedStudentData } from './components/common/QRScannerModal';

const MainApp: React.FC = () => {
  const { currentUser, role } = useApp();

  // Admin active navigation tab
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');

  // Student active navigation tab
  const [studentTab, setStudentTab] = useState<StudentTab>('dashboard');

  // Global modals triggered from dashboard shortcuts
  const [globalQRScannerMode, setGlobalQRScannerMode] = useState<'student' | 'book' | null>(null);
  const [isGlobalNewLoanOpen, setIsGlobalNewLoanOpen] = useState(false);

  // If not authenticated, render Login Page
  if (!currentUser) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  // Admin View
  if (role === 'admin') {
    return (
      <AdminLayout activeTab={adminTab} onTabChange={setAdminTab}>
        {adminTab === 'dashboard' && (
          <AdminDashboard
            onNavigate={setAdminTab}
            onOpenQRScanner={(mode) => setGlobalQRScannerMode(mode)}
            onOpenNewLoanModal={() => {
              setAdminTab('loans');
              setIsGlobalNewLoanOpen(true);
            }}
          />
        )}
        {adminTab === 'books' && <AdminBooks />}
        {adminTab === 'students' && <AdminStudents />}
        {adminTab === 'loans' && (
          <AdminLoans
            initialCreateOpen={isGlobalNewLoanOpen}
            onCloseCreate={() => setIsGlobalNewLoanOpen(false)}
          />
        )}
        {adminTab === 'returns' && <AdminReturns />}
        {adminTab === 'delays' && <AdminDelays />}
        {adminTab === 'settings' && <AdminSettings />}

        {/* Global QR Scanner launched from Dashboard */}
        {globalQRScannerMode && (
          <QRScannerModal
            isOpen={!!globalQRScannerMode}
            onClose={() => setGlobalQRScannerMode(null)}
            mode={globalQRScannerMode}
            onScanSuccess={({ student, book }) => {
              setGlobalQRScannerMode(null);
              if (student) {
                setAdminTab('students');
              } else if (book) {
                setAdminTab('books');
              }
            }}
          />
        )}

        <ToastContainer />
      </AdminLayout>
    );
  }

  // Student View
  return (
    <StudentLayout activeTab={studentTab} onTabChange={setStudentTab}>
      {studentTab === 'dashboard' && <StudentDashboard onNavigate={setStudentTab} />}
      {studentTab === 'catalog' && <StudentCatalog />}
      {studentTab === 'my-loans' && <StudentLoans />}
      {studentTab === 'history' && <StudentHistory />}
      {studentTab === 'profile' && <StudentProfile />}
      <ToastContainer />
    </StudentLayout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
