import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import DashboardPage from './pages/DashboardPage';
import ScanPage from './pages/ScanPage';
import ScanHistoryPage from './pages/ScanHistoryPage';
import ScanDetailsPage from './pages/ScanDetailsPage';
import ReviewQueuePage from './pages/ReviewQueuePage';
import ProtectedRoute from './components/ProtectedRoute';
import { ShieldCheck, Scale } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('packcheck_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentToken, setCurrentToken] = useState(() => {
    return localStorage.getItem('packcheck_token') || null;
  });

  // Track simple URL hash/pathname navigation
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleGlobalLogout = () => {
      setCurrentUser(null);
      setCurrentToken(null);
      localStorage.removeItem('packcheck_token');
      localStorage.removeItem('packcheck_user');
    };

    window.addEventListener('packcheck_logout', handleGlobalLogout);
    return () => window.removeEventListener('packcheck_logout', handleGlobalLogout);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setCurrentToken(token);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('packcheck_token');
    localStorage.removeItem('packcheck_user');
    setCurrentUser(null);
    setCurrentToken(null);
    navigate('/');
  };

  if (!currentUser || !currentToken) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Parse path for single scan details matching /scans/{scanReference}
  let scanDetailRef = null;
  if (currentPath.startsWith('/scans/') && currentPath.length > 7) {
    scanDetailRef = currentPath.substring(7);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Top Application Navbar */}
      <Navbar
        currentUser={currentUser}
        currentPath={currentPath}
        onNavigate={navigate}
        onLogout={handleLogout}
      />

      {/* Main Content Router View */}
      <main className="flex-1">
        {scanDetailRef ? (
          <ProtectedRoute currentUser={currentUser} onNavigateLogin={handleLogout}>
            <ScanDetailsPage
              scanReference={scanDetailRef}
              currentUser={currentUser}
              onNavigate={navigate}
            />
          </ProtectedRoute>
        ) : currentPath === '/scan' ? (
          <ProtectedRoute currentUser={currentUser} onNavigateLogin={handleLogout}>
            <ScanPage currentUser={currentUser} onNavigate={navigate} />
          </ProtectedRoute>
        ) : currentPath === '/scans' ? (
          <ProtectedRoute currentUser={currentUser} onNavigateLogin={handleLogout}>
            <ScanHistoryPage onNavigate={navigate} />
          </ProtectedRoute>
        ) : currentPath === '/reviews' ? (
          <ProtectedRoute currentUser={currentUser} onNavigateLogin={handleLogout}>
            <ReviewQueuePage onNavigate={navigate} />
          </ProtectedRoute>
        ) : (
          <ProtectedRoute currentUser={currentUser} onNavigateLogin={handleLogout}>
            <DashboardPage currentUser={currentUser} onNavigate={navigate} />
          </ProtectedRoute>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-xs text-slate-500 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-900">PackCheck AI</span>
            <span>— Legal Metrology Compliance System (SIH26034)</span>
          </div>
          <div className="flex items-center gap-2 text-amber-800 text-[11px] font-medium bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            <span>Advisory AI output — human officer verification required</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
