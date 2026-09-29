import { useState, useEffect, useCallback } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/client';
import api from '../api/client';

export default function AdminLayout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(4); // Mock pending count
  const [showNotifications, setShowNotifications] = useState(false);
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

  // Poll for notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/login');
  };

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch {}
  };

  if (loading) return <div className="min-h-screen bg-frost-50 flex items-center justify-center"><p className="font-sans text-slate-500">Loading...</p></div>;
  if (!user) return null;

  // Redirect handled in Login page for MEDIA, but public just goes to home

  // Role-based nav items
  // Grouped nav items
  const adminNavGroups = [
    {
      heading: 'Overview',
      items: [
        { path: '/admin', label: 'Dashboard', exact: true },
        { path: '/admin/approvals', label: 'Pending Approvals', badge: pendingCount },
        { path: '/admin/new-entry', label: 'New Entry' },
      ]
    },
    {
      heading: 'Content',
      items: [
        { path: '/admin/expeditions', label: 'Expeditions' },
        { path: '/admin/datasets', label: 'Datasets' },
        { path: '/admin/publications', label: 'Publications' },
        { path: '/admin/media', label: 'Media Library' },
        { path: '/admin/news', label: 'News' },
        { path: '/admin/studio', label: 'Content Studio' },
      ]
    },
    {
      heading: 'Administration',
      items: [
        { path: '/admin/users', label: 'Users' },
      ]
    }
  ];

  const editorNavGroups = [
    {
      heading: 'Overview',
      items: [
        { path: '/admin', label: 'Dashboard', exact: true },
        { path: '/admin/my-submissions', label: 'My Submissions' },
        { path: '/admin/new-entry', label: 'New Entry' },
      ]
    },
    {
      heading: 'Content',
      items: [
        { path: '/admin/expeditions', label: 'Expeditions' },
        { path: '/admin/datasets', label: 'Datasets' },
        { path: '/admin/publications', label: 'Publications' },
        { path: '/admin/media', label: 'Media Library' },
        { path: '/admin/news', label: 'News' },
        { path: '/admin/studio', label: 'Content Studio' },
      ]
    }
  ];

  const navGroups = user.role === 'ADMIN' ? adminNavGroups : editorNavGroups;

  const roleLabel = user.role === 'ADMIN' ? 'Admin' : 'Editor';
  const roleColor = user.role === 'ADMIN' ? 'bg-navy-900' : 'bg-glacier-700';

  const notificationTypeIcons = {
    SUBMISSION: 'Submission',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  };

  return (
    <div className="min-h-screen bg-frost-50 flex">
      {/* Sidebar */}
      <aside className="w-[230px] bg-navy-900 min-h-screen flex-shrink-0 flex flex-col">
        <div className="p-3 border-b border-white/10 mb-2">
          <Link to="/" className="text-white font-serif text-[16px] font-bold">PRISM Admin</Link>
        </div>
        <nav className="flex-grow overflow-y-auto">
          {navGroups.map((group, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="px-3 text-[10px] font-sans font-bold uppercase tracking-wider text-white/50 mb-1">{group.heading}</h3>
              {group.items.map(item => {
                const isActive = item.exact ? location.pathname === item.path : location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}
                    className={`flex items-center justify-between px-3 py-1.5 text-[13px] font-sans mb-0.5 transition-colors duration-150 border-l-[3px] ${isActive ? 'bg-white/5 border-glacier-500 text-white' : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'}`}>
                    <span>{item.label}</span>
                    {item.badge ? <span className="text-white/50 text-[12px]">{item.badge}</span> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex flex-col gap-1">
            <p className="text-[13px] font-sans text-white truncate">{user.name}</p>
            <p className="text-[11px] font-sans text-white/50">{roleLabel}</p>
          </div>
          <button onClick={handleLogout} className="text-[12px] font-sans text-white/50 hover:text-white mt-2 transition-colors duration-150">Sign out</button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-grow flex flex-col min-h-screen">
        {/* Top bar with notifications */}
        <header className="bg-white border-b border-line px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="text-[13px] font-sans text-slate-500">
            {location.pathname === '/admin' && 'Dashboard'}
            {location.pathname === '/admin/approvals' && 'Pending Approvals'}
            { location.pathname === '/admin/my-submissions' && 'My Submissions' }
            { location.pathname === '/admin/new-entry' && 'New Entry' }
            { location.pathname === '/admin/expeditions' && 'Expedition Manager' }
            {location.pathname === '/admin/datasets' && 'Dataset Manager'}
            {location.pathname === '/admin/publications' && 'Publication Manager'}
            {location.pathname === '/admin/media' && 'Media Library'}
            {location.pathname === '/admin/news' && 'News Editor'}
            {location.pathname === '/admin/studio' && 'Content Studio'}
            {location.pathname === '/admin/users' && 'User Management'}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 rounded-card hover:bg-frost-50 transition-colors duration-150"
            >
              <span className="text-[14px] font-sans font-bold text-slate-800">
                Notifications {unreadCount > 0 ? `(${unreadCount > 9 ? '9+' : unreadCount})` : ''}
              </span>
            </button>

            {/* Notification dropdown */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-full mt-1 w-[360px] bg-white border border-line rounded-card z-50 overflow-hidden">
                  <div className="flex items-center justify-between p-3 border-b border-line bg-frost-50">
                    <h3 className="text-[14px] font-sans font-bold text-navy-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-[11px] font-sans text-glacier-500 hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-[13px] font-sans text-slate-500">No notifications yet.</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.is_read) handleMarkRead(n.id);
                            if (n.link) navigate(n.link);
                            setShowNotifications(false);
                          }}
                          className={`px-3 py-2.5 border-b border-line last:border-0 cursor-pointer transition-colors duration-100 ${n.is_read ? 'bg-white hover:bg-frost-50/50' : 'bg-glacier-500/5 hover:bg-glacier-500/10'}`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-[11px] font-sans font-bold uppercase text-slate-500 mt-0.5 flex-shrink-0">{notificationTypeIcons[n.type] || 'Note'}</span>
                            <div className="min-w-0 flex-grow">
                              <div className="flex items-center gap-1">
                                <p className="text-[13px] font-sans font-bold text-navy-900 truncate">{n.title}</p>
                                {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-glacier-500 flex-shrink-0" />}
                              </div>
                              <p className="text-[12px] font-sans text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] font-sans text-slate-400 mt-1">
                                {n.from_user_name && `From ${n.from_user_name} · `}
                                {n.created_at}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-grow p-4 overflow-auto">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}
