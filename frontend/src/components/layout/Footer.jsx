import { Link } from 'react-router-dom';

const footerLinks = [
  { label: 'Accessibility', path: '/accessibility' },
  { label: 'Terms of Use', path: '/terms' },
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Sitemap', path: '/sitemap' },
  { label: 'Help', path: '/help' },
];

export default function Footer() {
  return (
    <footer className="glass-navy mx-3 mb-3 mt-6">
      <div className="max-w-[1200px] mx-auto px-4 py-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* About column */}
          <div>
            <h3 className="text-[16px] font-serif font-bold text-white mb-2">
              National Centre for Polar and Ocean Research
            </h3>
            <p className="text-[13px] text-white/70 leading-relaxed font-sans">
              Headland Sada, Vasco da Gama, Goa 403804, India
            </p>
            <p className="text-[13px] text-white/70 font-sans mt-1">
              Ministry of Earth Sciences, Government of India
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-[16px] font-serif font-bold text-white mb-2">Quick Links</h3>
            <ul className="space-y-1">
              <li><Link to="/expeditions" className="text-[13px] text-white/70 hover:text-aurora-500 transition-colors duration-150 font-sans">Expeditions</Link></li>
              <li><Link to="/datasets" className="text-[13px] text-white/70 hover:text-aurora-500 transition-colors duration-150 font-sans">Data Repository</Link></li>
              <li><Link to="/publications" className="text-[13px] text-white/70 hover:text-aurora-500 transition-colors duration-150 font-sans">Publications</Link></li>
              <li><Link to="/media" className="text-[13px] text-white/70 hover:text-aurora-500 transition-colors duration-150 font-sans">Media Gallery</Link></li>
            </ul>
          </div>

          {/* Policy links */}
          <div>
            <h3 className="text-[16px] font-serif font-bold text-white mb-2">Policies</h3>
            <ul className="space-y-1">
              {footerLinks.map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-[13px] text-white/70 hover:text-aurora-500 transition-colors duration-150 font-sans">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-4 pt-3 flex flex-col md:flex-row justify-between items-center">
          <p className="text-[12px] text-white/50 font-sans">
            &copy; {new Date().getFullYear()} PRISM, Ministry of Earth Sciences, Government of India. All rights reserved.
          </p>
          <p className="text-[12px] text-white/50 font-sans mt-1 md:mt-0">
            Content on this site is licensed under applicable terms. Sample data for demonstration.
          </p>
        </div>
      </div>
    </footer>
  );
}
