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
            {/* National emblem placeholder — text only per visual rules */}
            <span className="font-sans text-[13px] text-navy-900 font-bold">
              Government of India
            </span>
            <span className="text-line">|</span>
            <span className="font-sans text-[13px] text-slate-500">
              Ministry of Earth Sciences
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Text size controls */}
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
            <span className="text-line ml-1">|</span>
            {/* Language toggle */}
            <button className="text-[13px] text-glacier-500 font-sans ml-1 hover:underline transition-colors duration-150">
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="bg-navy-900 sticky top-0 z-50" aria-label="Main navigation">
        <div className="max-w-[1200px] mx-auto px-3">
          <div className="flex items-center justify-between py-2">
            <Link to="/" className="text-white font-serif text-[18px] font-bold hover:opacity-90 transition-opacity duration-150">
              NCPOR
            </Link>
            <ul className="flex items-center gap-0" role="menubar">
              {navLinks.map(link => {
                const isActive = location.pathname === link.path;
                return (
                  <li key={link.path} role="none">
                    <Link
                      to={link.path}
                      role="menuitem"
                      className={`
                        block px-2 py-1 text-[14px] font-sans transition-colors duration-150
                        ${isActive
                          ? 'text-white border-b-2 border-aurora-500'
                          : 'text-white/80 hover:text-white border-b-2 border-transparent hover:border-white/40'
                        }
                      `}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link to="/login" className="text-[13px] font-sans text-aurora-500 hover:text-white border border-aurora-500 px-2 py-0.5 rounded-card transition-colors duration-150 ml-2">
              Staff Login
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
