import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/client';

export default function Dashboard() {
  const { user } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.get('/stats/admin');
        setStats(data);
      } catch (err) { console.error('Failed to load stats', err); }
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) return <p className="font-sans text-slate-500">Loading dashboard...</p>;

  // Count active items
  const countPublished = (statusArray) => {
    if (!statusArray) return 0;
    const item = statusArray.find(s => s.status === 'PUBLISHED');
    return item ? item.count : 0;
  };

  const pubExpeditions = countPublished(stats?.contentByStatus?.expeditions);
  const pubDatasets = countPublished(stats?.contentByStatus?.datasets);
  const pubPublications = countPublished(stats?.contentByStatus?.publications);
  const pubMedia = countPublished(stats?.contentByStatus?.media);

  return (
    <div>
      <h1 className="text-h1 mb-2">Welcome, {user.name}</h1>
      <p className="text-[14px] font-sans text-slate-500 mb-6">
        {user.role === 'ADMIN' ? 'You have full administrative access.' : 'You have editor access. Your content changes will require admin approval.'}
      </p>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-card border border-line shadow-sm">
          <p className="text-[12px] font-sans text-slate-500 mb-1 uppercase tracking-wider font-bold">Pending Approvals</p>
          <p className="text-[28px] font-serif font-bold text-navy-900">{stats?.totalPending || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-card border border-line shadow-sm">
          <p className="text-[12px] font-sans text-slate-500 mb-1 uppercase tracking-wider font-bold">Active Expeditions</p>
          <p className="text-[28px] font-serif font-bold text-navy-900">{pubExpeditions}</p>
        </div>
        <div className="bg-white p-4 rounded-card border border-line shadow-sm">
          <p className="text-[12px] font-sans text-slate-500 mb-1 uppercase tracking-wider font-bold">Public Datasets</p>
          <p className="text-[28px] font-serif font-bold text-navy-900">{pubDatasets}</p>
        </div>
        <div className="bg-white p-4 rounded-card border border-line shadow-sm">
          <p className="text-[12px] font-sans text-slate-500 mb-1 uppercase tracking-wider font-bold">Publications</p>
          <p className="text-[28px] font-serif font-bold text-navy-900">{pubPublications}</p>
        </div>
        <div className="bg-white p-4 rounded-card border border-line shadow-sm">
          <p className="text-[12px] font-sans text-slate-500 mb-1 uppercase tracking-wider font-bold">Media Items</p>
          <p className="text-[28px] font-serif font-bold text-navy-900">{pubMedia}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audit Log */}
        <div className="bg-white rounded-card border border-line p-4 shadow-sm h-[400px] flex flex-col">
          <h2 className="text-h2 mb-4">Recent Activity</h2>
          <div className="overflow-y-auto flex-grow pr-2 space-y-3">
            {stats?.recentAudit?.map(log => (
              <div key={log.id} className="pb-3 border-b border-line last:border-0 last:pb-0">
                <p className="text-[13px] font-sans text-slate-800">
                  <span className="font-bold text-navy-900">{log.user_name || 'System'}</span> {log.action.toLowerCase()}d a {log.entity_type}
                </p>
                <p className="text-[11px] font-sans text-slate-400 mt-1">{log.created_at}</p>
              </div>
            ))}
            {(!stats?.recentAudit || stats.recentAudit.length === 0) && (
              <p className="text-[13px] font-sans text-slate-500">No recent activity.</p>
            )}
          </div>
        </div>

        {/* Admin Info / Quick Links */}
        <div className="bg-white rounded-card border border-line p-4 shadow-sm">
          <h2 className="text-h2 mb-4">System Information</h2>
          {user.role === 'ADMIN' && (
            <div className="mb-6">
              <h3 className="text-[14px] font-sans font-bold text-slate-800 mb-2">Users by Role</h3>
              <div className="space-y-2">
                {stats?.usersByRole?.map(r => (
                  <div key={r.role} className="flex justify-between items-center text-[13px] font-sans">
                    <span className="text-slate-600">{r.role}</span>
                    <span className="font-mono bg-frost-50 px-2 py-0.5 rounded border border-line">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
             <h3 className="text-[14px] font-sans font-bold text-slate-800 mb-2">Downloads</h3>
             <p className="text-[13px] font-sans text-slate-600">Total dataset downloads: <span className="font-bold text-navy-900">{stats?.totalDownloads || 0}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
