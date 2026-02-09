// ============================================
// MAIN APP - Duty Manager with Auth
// ============================================

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import PersonnelList from './components/PersonnelList';
import LeaveManager from './components/LeaveManager';
import DutyScheduler from './components/DutyScheduler';
import AddPersonnelModal from './components/AddPersonnelModal';
import AddLeaveModal from './components/AddLeaveModal';
import SettingsPanel from './components/SettingsPanel';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

type Tab = 'personnel' | 'leaves' | 'duties' | 'settings';

// Main App Content (protected)
function DutyManager() {
  const { state, setCurrentDate, runAutoSchedule, clearAutoSchedule, refreshData } = useApp();
  const { signOut, state: authState } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('duties');
  const [showAddPersonnel, setShowAddPersonnel] = useState(false);
  const [showAddLeave, setShowAddLeave] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'personnel', label: 'Personel', icon: '👥' },
    { id: 'leaves', label: 'İzinler', icon: '🏖️' },
    { id: 'duties', label: 'Nöbetler', icon: '🗓️' },
    { id: 'settings', label: 'Ayarlar', icon: '⚙️' },
  ];

  // Refresh data when tab changes
  useEffect(() => {
    async function refresh() {
      setIsRefreshing(true);
      await refreshData();
      setIsRefreshing(false);
    }
    refresh();
  }, [activeTab]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const navigateDate = (days: number) => {
    const newDate = new Date(state.currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const handleAutoSchedule = () => {
    if (confirm(`${state.currentDate.toLocaleDateString('tr-TR')} tarihi için otomatik nöbet oluşturulsun mu?`)) {
      runAutoSchedule(state.currentDate);
    }
  };

  const handleClearAutoSchedule = () => {
    if (confirm('Otomatik oluşturulan nöbetler silinsin mi?')) {
      clearAutoSchedule(state.currentDate);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                🛡️ Nöbet Yönetimi
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {authState.user?.email}
              </p>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-4">
              {/* Supabase Status */}
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${state.supabaseConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {state.supabaseConnected ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Çıkış
              </button>
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Tarih</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatDate(state.currentDate)}
              </div>
            </div>
            
            <button
              onClick={() => navigateDate(1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
            >
              Bugün
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 min-w-fit px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                {isRefreshing && activeTab === tab.id && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Loading State */}
        {(state.isLoading || isRefreshing) && (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              {isRefreshing ? 'Veriler güncelleniyor...' : 'Yükleniyor...'}
            </span>
          </div>
        )}

        {/* Tab Content */}
        {!state.isLoading && !isRefreshing && (
          <>
            {activeTab === 'personnel' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Personel Listesi
                  </h2>
                  <button
                    onClick={() => setShowAddPersonnel(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Ekle
                  </button>
                </div>
                <PersonnelList />
              </div>
            )}

            {activeTab === 'leaves' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    İzin Takibi
                  </h2>
                  <button
                    onClick={() => setShowAddLeave(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    İzin Ekle
                  </button>
                </div>
                <LeaveManager />
              </div>
            )}

            {activeTab === 'duties' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Nöbet Çizelgesi
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearAutoSchedule}
                      className="btn-secondary text-red-600 dark:text-red-400"
                    >
                      Temizle
                    </button>
                    <button
                      onClick={handleAutoSchedule}
                      className="btn-primary flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Otomatik Oluştur
                    </button>
                  </div>
                </div>
                <DutyScheduler />
              </div>
            )}

            {activeTab === 'settings' && (
              <SettingsPanel />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {showAddPersonnel && (
        <AddPersonnelModal onClose={() => setShowAddPersonnel(false)} />
      )}
      
      {showAddLeave && (
        <AddLeaveModal onClose={() => setShowAddLeave(false)} />
      )}
    </div>
  );
}

// Main App with Routing
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPageWrapper />} />
            
            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <DutyManager />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Login Page Wrapper that handles auth state
function LoginPageWrapper() {
  const { isAuthenticated, state } = useAuth();

  // If already authenticated, redirect to home
  if (state.initialized && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

export default App;
