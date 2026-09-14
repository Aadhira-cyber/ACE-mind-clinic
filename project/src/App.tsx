import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import type { CmsContentMap } from '@/lib/cms';
import { fetchCmsContent } from '@/lib/cms';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Services from '@/pages/Services';
import About from '@/pages/About';
import FAQ from '@/pages/FAQ';
import Contact from '@/pages/Contact';
import Booking from '@/pages/Booking';
import IntakeForm from '@/pages/IntakeForm';
import DoctorLogin from '@/pages/DoctorLogin';
import DoctorDashboard from '@/pages/DoctorDashboard';

function AppContent() {
  const { session, loading, signOut } = useAuth();
  const [page, setPage] = useState('home');
  const [cms, setCms] = useState<CmsContentMap>({});
  const [cmsLoaded, setCmsLoaded] = useState(false);

  const loadCms = useCallback(async () => {
    const data = await fetchCmsContent();
    setCms(data);
    setCmsLoaded(true);
  }, []);

  useEffect(() => {
    loadCms();
  }, [loadCms]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const handleNavigate = (newPage: string) => {
    if (newPage === 'doctor-login' && session) {
      setPage('doctor-dashboard');
      return;
    }
    setPage(newPage);
  };

  const handleSignOut = async () => {
    await signOut();
    setPage('home');
  };

  if (loading || !cmsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-700" />
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (page === 'doctor-dashboard') {
    if (!session) {
      return <DoctorLogin onNavigate={handleNavigate} onAuthSuccess={() => setPage('doctor-dashboard')} />;
    }
    return <DoctorDashboard onSignOut={handleSignOut} />;
  }

  if (page === 'doctor-login') {
    if (session) {
      return <DoctorDashboard onSignOut={handleSignOut} />;
    }
    return <DoctorLogin onNavigate={handleNavigate} onAuthSuccess={() => setPage('doctor-dashboard')} />;
  }

  const showHeaderFooter = page !== 'doctor-dashboard' && page !== 'doctor-login';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {showHeaderFooter && <Header currentPage={page} onNavigate={handleNavigate} />}

      <div className="flex-1">
        {page === 'home' && <Home cms={cms} onNavigate={handleNavigate} />}
        {page === 'services' && <Services cms={cms} onNavigate={handleNavigate} />}
        {page === 'about' && <About cms={cms} onNavigate={handleNavigate} />}
        {page === 'faq' && <FAQ cms={cms} />}
        {page === 'contact' && <Contact cms={cms} onNavigate={handleNavigate} />}
        {page === 'booking' && <Booking cms={cms} onNavigate={handleNavigate} />}
        {page === 'intake' && <IntakeForm cms={cms} onNavigate={handleNavigate} />}
      </div>

      {showHeaderFooter && <Footer cms={cms} onNavigate={handleNavigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
