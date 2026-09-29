import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try { const data = await api.get('/stats/admin'); setStats(data); } catch { setStats(null); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="font-sans text-slate-500">Loading dashboard...</p>;
  if (!stats) return <p className="font-sans text-slate-500">Unable to load analytics.</p>;

  return (
    <div>
      <h1 className="text-h1 mb-4">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label="Expeditions" items={stats.contentByStatus?.expeditions} />
        <StatCard label="Datasets" items={stats.contentByStatus?.datasets} />
        <StatCard label="Publications" items={stats.contentByStatus?.publications} />
        <StatCard label="Media Items" items={stats.contentByStatus?.media} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Expeditions by Region */}
        <div className="bg-white rounded-card border border-line p-4">
          <h2 className="text-h3 mb-3">Expeditions by Region</h2>
          {(stats.expeditionsByRegion || []).map(r => (
            <div key={r.region} className="flex items-center justify-between py-1 border-b border-line last:border-0">
              <span className="text-[14px] font-sans text-slate-800">{r.region}</span>
              <div className="flex items-center gap-2">
                <div className="w-[100px] h-2 bg-frost-50 rounded-full overflow-hidden">
                  <div className="h-full bg-glacier-700 rounded-full" style={{ width: `${Math.min(100, (r.count / 5) * 100)}%` }} />
                </div>
                <span className="text-[13px] font-sans text-slate-500 w-6 text-right">{r.count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Users by Role */}
        <div className="bg-white rounded-card border border-line p-4">
          <h2 className="text-h3 mb-3">Users by Role</h2>
          {(stats.usersByRole || []).map(r => (
            <div key={r.role} className="flex items-center justify-between py-1 border-b border-line last:border-0">
              <span className="text-[14px] font-sans text-slate-800">{r.role}</span>
              <span className="text-[13px] font-sans text-glacier-500 font-bold">{r.count}</span>
            </div>
          ))}
        </div>

        {/* Content Studio Stats */}
        <div className="bg-white rounded-card border border-line p-4">
          <h2 className="text-h3 mb-3">Content Studio</h2>
          {(stats.studioByStatus || []).length > 0 ? (
            stats.studioByStatus.map(s => (
              <div key={s.status} className="flex items-center justify-between py-1 border-b border-line last:border-0">
                <span className="text-[14px] font-sans text-slate-800">{s.status}</span>
                <span className="text-[13px] font-sans text-aurora-500 font-bold">{s.count}</span>
              </div>
            ))
          ) : (
            <p className="text-[13px] font-sans text-slate-500">No generated content yet.</p>
          )}
        </div>

        {/* Downloads */}
        <div className="bg-white rounded-card border border-line p-4">
          <h2 className="text-h3 mb-3">Dataset Downloads</h2>
          <p className="text-[28px] font-serif font-bold text-navy-900">{stats.totalDownloads}</p>
          <p className="text-[13px] font-sans text-slate-500">Total downloads recorded</p>
        </div>
      </div>

      {/* Recent Audit Log */}
      <div className="bg-white rounded-card border border-line p-4">
        <h2 className="text-h3 mb-3">Recent Activity</h2>
        {(stats.recentAudit || []).length > 0 ? (
          <table className="w-full text-left">
            <thead><tr className="border-b border-line">
              <th className="text-[12px] font-sans text-slate-500 py-1 px-2">User</th>
              <th className="text-[12px] font-sans text-slate-500 py-1 px-2">Action</th>
              <th className="text-[12px] font-sans text-slate-500 py-1 px-2">Entity</th>
              <th className="text-[12px] font-sans text-slate-500 py-1 px-2">Date</th>
            </tr></thead>
            <tbody>
              {stats.recentAudit.map(log => (
                <tr key={log.id} className="border-b border-line last:border-0">
                  <td className="text-[13px] font-sans text-slate-800 py-1 px-2">{log.user_name}</td>
                  <td className="text-[13px] font-sans text-slate-800 py-1 px-2">{log.action}</td>
                  <td className="text-[13px] font-sans text-slate-500 py-1 px-2">{log.entity_type}</td>
                  <td className="text-[12px] font-sans text-slate-500 py-1 px-2">{log.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-[13px] font-sans text-slate-500">No audit log entries yet.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, items }) {
  const total = (items || []).reduce((sum, i) => sum + (i.count || 0), 0);
  const published = (items || []).find(i => i.status === 'PUBLISHED')?.count || 0;
  return (
    <div className="bg-white rounded-card border border-line p-3">
      <p className="text-[12px] font-sans text-slate-500">{label}</p>
      <p className="text-[28px] font-serif font-bold text-navy-900">{total}</p>
      <p className="text-[11px] font-sans text-glacier-500">{published} published</p>
    </div>
  );
}
