import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';


const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/expeditions', label: 'Expeditions' },
  { path: '/datasets', label: 'Data Repository' },
  { path: '/publications', label: 'Publications' },
  { path: '/media', label: 'Media Gallery' },
  { path: '/outreach', label: 'Outreach and Education' },
  { path: '/news', label: 'News and Events' },
  { path: '/contact', label: 'Contact' },
];

export default function TopBar() {
  const location = useLocation();
  const [fontSize, setFontSize] = useState(100);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeFontSize = (delta) => {
    const next = Math.max(80, Math.min(130, fontSize + delta));
    setFontSize(next);
    document.documentElement.style.fontSize = `${next}%`;
  };

  return (
    <>
      {/* Skip to content */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Government identity bar */}
      <div className="bg-white border-b border-line">
        <div className="max-w-[1200px] mx-auto px-3 py-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-sans text-[13px] text-navy-900 font-bold">
              Government of India
            </span>
            <span className="text-line">|</span>
            <span className="font-sans text-[13px] text-slate-500 hidden sm:inline">
              Ministry of Earth Sciences
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeFontSize(-10)}
              className="text-[12px] text-slate-800 px-1 hover:text-glacier-500 transition-colors duration-150"
              aria-label="Decrease text size"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize(100) || (document.documentElement.style.fontSize = '100%')}
              className="text-[14px] text-slate-800 px-1 hover:text-glacier-500 transition-colors duration-150"
              aria-label="Default text size"
            >
              A
            </button>
            <button
              onClick={() => changeFontSize(10)}
              className="text-[16px] text-slate-800 px-1 hover:text-glacier-500 transition-colors duration-150"
              aria-label="Increase text size"
            >
              A+
            </button>
          </div>
        </div>
      </div>


      <nav className="glass-navy sticky top-0 z-50 mx-3 mt-2" aria-label="Main navigation">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity duration-150 mr-4 flex-shrink-0">
              <img src="/assets/logo_transparent.png" alt="PRISM Logo" className="h-14 w-auto object-contain drop-shadow-md" />
              <span className="text-white font-serif text-[24px] font-bold tracking-wide">PRISM</span>
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              <ul className="flex items-center gap-0.5" role="menubar">
                {navLinks.map(link => {
                  const isActive = location.pathname === link.path;
                  return (
                    <li key={link.path} role="none">
                      <Link
                        to={link.path}
                        role="menuitem"
                        className={`
                          block px-2 py-1 text-[13px] font-sans whitespace-nowrap transition-colors duration-150
                          ${isActive
                            ? 'text-white border-b-2 border-aurora-500'
                            : 'text-white/75 hover:text-white border-b-2 border-transparent'
                          }
                        `}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link to="/login" className="text-[13px] font-sans text-aurora-500 hover:text-white ml-2 transition-colors duration-150">
                Staff Login
              </Link>
            </div>

            <button
              className="lg:hidden text-white font-sans text-[14px] px-2 py-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              Menu
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/15 px-4 py-3">
            <ul className="flex flex-col gap-2">
              {navLinks.map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="block text-white/80 hover:text-white text-[14px] font-sans py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2 border-t border-white/15">
                <Link to="/login" className="block text-aurora-500 text-[14px] font-sans" onClick={() => setMobileMenuOpen(false)}>
                  Staff Login
                </Link>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </>
  );
}
