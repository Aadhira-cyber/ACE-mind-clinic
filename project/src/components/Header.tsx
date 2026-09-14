import { useState, useEffect } from 'react';
import { Menu, X, Brain, Calendar } from 'lucide-react';

type Props = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

export default function Header({ currentPage, onNavigate }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navItems = [
    { key: 'home', label: 'Home' },
    { key: 'services', label: 'Services' },
    { key: 'about', label: 'About' },
    { key: 'faq', label: 'FAQ' },
    { key: 'contact', label: 'Contact' },
  ];

  const handleNav = (key: string) => {
    onNavigate(key);
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <button onClick={() => handleNav('home')} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className={`font-serif text-lg font-semibold transition-colors ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
              Acemind Clinic
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === item.key
                    ? 'text-teal-700 bg-teal-50'
                    : 'text-gray-600 hover:text-teal-700 hover:bg-teal-50/50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => handleNav('booking')}
              className="ml-2 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-teal-800 hover:shadow-md"
            >
              <Calendar className="h-4 w-4" />
              Book Now
            </button>
            <button
              onClick={() => handleNav('doctor-login')}
              className="ml-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:text-teal-700"
            >
              Doctor
            </button>
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in">
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                  currentPage === item.key ? 'text-teal-700 bg-teal-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => handleNav('booking')}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-3 text-sm font-medium text-white"
            >
              <Calendar className="h-4 w-4" />
              Book Appointment
            </button>
            <button
              onClick={() => handleNav('doctor-login')}
              className="mt-1 rounded-lg px-4 py-3 text-left text-sm font-medium text-gray-400"
            >
              Doctor Portal
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
