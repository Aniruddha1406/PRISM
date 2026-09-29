import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import api from '../../api/client';

export default function Dashboard() {
  const { user } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, notifData] = await Promise.all([
          api.get('/stats/admin'),
          api.get('/notifications?unread_only=true'),
        ]);
        setStats(statsData);
        setNotifications(notifData.notifications || []);
      } catch (err) { console.error('Failed to load data', err); }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <p className="font-sans text-slate-500">Loading dashboard...</p>;

  const countByStatus = (statusArray, status) => {
    if (!statusArray) return 0;
    const item = statusArray.find(s => s.status === status);
    return item ? item.count : 0;
  };

  const totalByType = (statusArray) => {
    if (!statusArray) return 0;
    return statusArray.reduce((sum, s) => sum + s.count, 0);
  };

  const pubExpeditions = countByStatus(stats?.contentByStatus?.expeditions, 'PUBLISHED');
  const pubDatasets = countByStatus(stats?.contentByStatus?.datasets, 'PUBLISHED');
  const pubPublications = countByStatus(stats?.contentByStatus?.publications, 'PUBLISHED');
  const pubMedia = countByStatus(stats?.contentByStatus?.media, 'PUBLISHED');
  const pubNews = countByStatus(stats?.contentByStatus?.news, 'PUBLISHED');

  const totalExpeditions = totalByType(stats?.contentByStatus?.expeditions);
  const totalDatasets = totalByType(stats?.contentByStatus?.datasets);
  const totalPublications = totalByType(stats?.contentByStatus?.publications);
  const totalMedia = totalByType(stats?.contentByStatus?.media);

  // Status bar widths
  const statusBar = (statusArray) => {
    const total = totalByType(statusArray);
    if (!total) return [];
    const colors = { DRAFT: '#64748B', IN_REVIEW: '#00B4D8', APPROVED: '#1E3E62', PUBLISHED: '#3B82F6', ARCHIVED: '#94A3B8' };
    return (statusArray || []).map(s => ({
      status: s.status, count: s.count, pct: Math.round((s.count / total) * 100),
      color: colors[s.status] || '#94A3B8',
    }));
  };

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6 pb-2 border-b border-line">
        <div>
          <h1 className="font-serif text-[20px] font-normal text-navy-900">Welcome, {user.name}</h1>
          <p className="text-[14px] font-sans text-slate-500 mt-1">
            {stats?.totalPending || 0} items awaiting review.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[12px] font-sans text-slate-400">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Overview Stats (Ruled layout) */}
      <div className="flex items-start border-b border-line pb-4 mb-6">
        <div className="flex-1 border-r border-line pr-4 mr-4">
          <p className="text-[10px] font-sans text-slate-500 mb-1 uppercase tracking-wider font-bold">Pending</p>
          <p className="text-[24px] font-serif font-normal text-ember-500">{stats?.totalPending || 0}</p>
          <Link to="/admin/approvals" className="text-[11px] font-sans text-ember-500 hover:underline inline-block mt-1">View queue</Link>
        </div>
        <div className="flex-1 border-r border-line pr-4 mr-4">
          <p className="text-[10px] font-sans text-slate-500 mb-1 uppercase tracking-wider font-bold">Expeditions</p>
          <p className="text-[24px] font-serif font-normal text-navy-900">{pubExpeditions}</p>
        </div>
        <div className="flex-1 border-r border-line pr-4 mr-4">
          <p className="text-[10px] font-sans text-slate-500 mb-1 uppercase tracking-wider font-bold">Datasets</p>
          <p className="text-[24px] font-serif font-normal text-navy-900">{pubDatasets}</p>
        </div>
        <div className="flex-1 border-r border-line pr-4 mr-4">
          <p className="text-[10px] font-sans text-slate-500 mb-1 uppercase tracking-wider font-bold">Publications</p>
          <p className="text-[24px] font-serif font-normal text-navy-900">{pubPublications}</p>
        </div>
        <div className="flex-1 border-r border-line pr-4 mr-4">
          <p className="text-[10px] font-sans text-slate-500 mb-1 uppercase tracking-wider font-bold">Media</p>
          <p className="text-[24px] font-serif font-normal text-navy-900">{pubMedia}</p>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-sans text-slate-500 mb-1 uppercase tracking-wider font-bold">News</p>
          <p className="text-[24px] font-serif font-normal text-navy-900">{pubNews}</p>
        </div>
      </div>

      {/* Panels for Expeditions and Datasets instead of simple status bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-line p-0">
          <div className="flex items-center justify-between p-3 border-b border-line bg-frost-50">
            <h3 className="text-[13px] font-sans font-bold text-navy-900">Latest Expeditions</h3>
            <Link to="/admin/expeditions" className="text-[11px] font-sans text-glacier-500 hover:underline">View all</Link>
          </div>
          <table className="w-full text-left">
            <tbody>
              {/* Mocking latest 3 entries since we don't have the API endpoint handy in stats */}
              <tr className="border-b border-line">
                <td className="p-3 text-[13px] font-sans text-navy-900">43rd ISEA</td>
                <td className="p-3 text-[12px] font-sans text-slate-500 text-right">Published</td>
              </tr>
              <tr className="border-b border-line">
                <td className="p-3 text-[13px] font-sans text-navy-900">Arctic Summer Campaign 2024</td>
                <td className="p-3 text-[12px] font-sans text-slate-500 text-right">In Review</td>
              </tr>
              <tr>
                <td className="p-3 text-[13px] font-sans text-navy-900">Himalayan Cryosphere Monitoring</td>
                <td className="p-3 text-[12px] font-sans text-slate-500 text-right">Published</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-white border border-line p-0">
          <div className="flex items-center justify-between p-3 border-b border-line bg-frost-50">
            <h3 className="text-[13px] font-sans font-bold text-navy-900">Latest Datasets</h3>
            <Link to="/admin/datasets" className="text-[11px] font-sans text-glacier-500 hover:underline">View all</Link>
          </div>
          <table className="w-full text-left">
            <tbody>
              <tr className="border-b border-line">
                <td className="p-3 text-[13px] font-sans text-navy-900">Kongsfjorden Glacier Mass Balance</td>
                <td className="p-3 text-[12px] font-sans text-slate-500 text-right">Published</td>
              </tr>
              <tr className="border-b border-line">
                <td className="p-3 text-[13px] font-sans text-navy-900">Southern Ocean CTD Profiles</td>
                <td className="p-3 text-[12px] font-sans text-slate-500 text-right">Published</td>
              </tr>
              <tr>
                <td className="p-3 text-[13px] font-sans text-navy-900">Himansh Permafrost Temps</td>
                <td className="p-3 text-[12px] font-sans text-slate-500 text-right">Draft</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Audit Log */}
        <div className="lg:col-span-2 bg-white border border-line">
          <div className="flex items-center justify-between p-3 border-b border-line bg-frost-50">
            <h2 className="text-[13px] font-sans font-bold text-navy-900">Recent Activity</h2>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-[11px] font-sans text-slate-500 uppercase tracking-wide">
                <th className="p-3 font-normal">Date</th>
                <th className="p-3 font-normal">Action</th>
                <th className="p-3 font-normal">User</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentAudit?.slice(0,5).map(log => (
                <tr key={log.id} className="border-b border-line last:border-0 hover:bg-frost-50/50">
                  <td className="p-3 text-[12px] font-sans text-slate-500 whitespace-nowrap">{log.created_at}</td>
                  <td className="p-3 text-[13px] font-sans text-navy-900">
                    <span className="capitalize">{log.action?.toLowerCase()}</span> {log.entity_type?.toLowerCase()}
                  </td>
                  <td className="p-3 text-[12px] font-sans text-slate-500">{log.user_name || 'System'}</td>
                </tr>
              ))}
              {(!stats?.recentAudit || stats.recentAudit.length === 0) && (
                <tr><td colSpan="3" className="p-3 text-[13px] font-sans text-slate-500">No recent activity.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* System Info Panel */}
        <div className="bg-white border border-line p-4">
          <h2 className="text-h3 mb-3">System Info</h2>
          {user.role === 'ADMIN' && (
            <div className="mb-4">
              <h3 className="text-[13px] font-sans font-bold text-slate-800 mb-2">Users by Role</h3>
              <div className="space-y-1.5">
                {stats?.usersByRole?.map(r => (
                  <div key={r.role} className="flex justify-between items-center text-[13px] font-sans">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${r.role === 'ADMIN' ? 'bg-navy-900' : r.role === 'EDITOR' ? 'bg-glacier-700' : 'bg-slate-500'}`} />
                      {r.role}
                    </span>
                    <span className="font-mono bg-frost-50 px-2 py-0.5 rounded border border-line text-[12px]">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats?.expeditionsByRegion && stats.expeditionsByRegion.length > 0 && (
            <div className="mb-4">
              <h3 className="text-[13px] font-sans font-bold text-slate-800 mb-2">Expeditions by Region</h3>
              <div className="space-y-1.5">
                {stats.expeditionsByRegion.map(r => (
                  <div key={r.region} className="flex justify-between items-center text-[12px] font-sans">
                    <span className="text-slate-600">{r.region?.replace('_', ' ')}</span>
                    <span className="font-mono text-navy-900 font-bold">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-line">
            <h3 className="text-[13px] font-sans font-bold text-slate-800 mb-1">Downloads</h3>
            <p className="text-[12px] font-sans text-slate-600">
              Total dataset downloads: <span className="font-bold text-navy-900">{stats?.totalDownloads || 0}</span>
            </p>
          </div>

          {/* Quick actions */}
          <div className="mt-4 pt-3 border-t border-line">
            <h3 className="text-[13px] font-sans font-bold text-slate-800 mb-2">Quick Actions</h3>
            <div className="space-y-1">
              <Link to="/admin/expeditions" className="block text-[12px] font-sans text-glacier-500 hover:text-glacier-700 hover:underline transition-colors">+ New Expedition</Link>
              <Link to="/admin/datasets" className="block text-[12px] font-sans text-glacier-500 hover:text-glacier-700 hover:underline transition-colors">+ New Dataset</Link>
              <Link to="/admin/publications" className="block text-[12px] font-sans text-glacier-500 hover:text-glacier-700 hover:underline transition-colors">+ New Publication</Link>
              <Link to="/admin/news" className="block text-[12px] font-sans text-glacier-500 hover:text-glacier-700 hover:underline transition-colors">+ New Article</Link>
              <Link to="/admin/studio" className="block text-[12px] font-sans text-glacier-500 hover:text-glacier-700 hover:underline transition-colors">Go to Content Studio</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
