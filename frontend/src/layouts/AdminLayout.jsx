import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';

export default function AdminLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      try { const data = await authApi.me(); setUser(data.user); }
      catch { navigate('/login'); }
      setLoading(false);
    }
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen bg-frost-50 flex items-center justify-center"><p className="font-sans text-slate-500">Loading...</p></div>;
  if (!user) return null;

  // Redirect MEDIA users away from admin
  if (user.role === 'MEDIA') {
    navigate('/portal');
    return null;
  }

  // Role-based nav items
  const adminNavItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/approvals', label: 'Pending Approvals' },
    { path: '/admin/expeditions', label: 'Expeditions' },
    { path: '/admin/datasets', label: 'Datasets' },
    { path: '/admin/publications', label: 'Publications' },
    { path: '/admin/media', label: 'Media Library' },
    { path: '/admin/news', label: 'News' },
    { path: '/admin/studio', label: 'Content Studio' },
    { path: '/admin/users', label: 'Users' },
  ];

  const editorNavItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/my-submissions', label: 'My Submissions' },
    { path: '/admin/expeditions', label: 'Expeditions' },
    { path: '/admin/datasets', label: 'Datasets' },
    { path: '/admin/publications', label: 'Publications' },
    { path: '/admin/media', label: 'Media Library' },
    { path: '/admin/news', label: 'News' },
    { path: '/admin/studio', label: 'Content Studio' },
  ];

  const navItems = user.role === 'ADMIN' ? adminNavItems : editorNavItems;

  const roleLabel = user.role === 'ADMIN' ? 'Admin' : 'Editor';
  const roleColor = user.role === 'ADMIN' ? 'bg-navy-900' : 'bg-glacier-700';

  return (
    <div className="min-h-screen bg-frost-50 flex">
      {/* Sidebar */}
      <aside className="w-[220px] bg-navy-900 min-h-screen flex-shrink-0">
        <div className="p-3 border-b border-white/10">
          <Link to="/" className="text-white font-serif text-[16px] font-bold">NCPOR Admin</Link>
        </div>
        <nav className="p-2">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`block px-3 py-1.5 text-[13px] font-sans rounded-card mb-0.5 transition-colors duration-150 ${isActive ? 'bg-glacier-500 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 mt-auto border-t border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[12px] font-sans text-white/50">{user.name}</p>
            <span className={`text-[9px] font-sans text-white px-1.5 py-0.5 rounded-full ${roleColor}`}>{roleLabel}</span>
          </div>
          <button onClick={handleLogout} className="text-[12px] font-sans text-white/50 hover:text-white mt-1 transition-colors duration-150">Logout</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-grow p-4 overflow-auto">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}
