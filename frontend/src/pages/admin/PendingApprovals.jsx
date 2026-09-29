import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function PendingApprovals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [actionLoading, setActionLoading] = useState(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/approvals?status=${filter}`);
      setItems(data.items || []);
    } catch { setItems([]); }
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, [filter]);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.put(`/approvals/${id}/approve`, {});
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) { alert(err.message); }
    setActionLoading(null);
  };

  const handleReject = async (id) => {
    const note = prompt('Rejection reason (optional):');
    setActionLoading(id);
    try {
      await api.put(`/approvals/${id}/reject`, { note: note || '' });
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) { alert(err.message); }
    setActionLoading(null);
  };

  const entityLabels = {
    expedition: 'Expedition', dataset: 'Dataset', publication: 'Publication',
    news: 'News Article', event: 'Event', media: 'Media Item', education: 'Education Resource',
  };

  return (
    <div>
      <h1 className="text-h1 mb-4">Pending Approvals</h1>
      <p className="text-[14px] font-sans text-slate-500 mb-4">Review and approve changes submitted by editors. Approved changes are committed to the database.</p>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 text-[13px] font-sans rounded-card border transition-colors duration-150 ${filter === s ? 'bg-glacier-500 text-white border-glacier-500' : 'bg-white text-slate-500 border-line hover:border-glacier-500'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-sans text-slate-500">Loading...</p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-card border border-line p-4">
          <p className="text-[14px] font-sans text-slate-500">No {filter.toLowerCase()} items.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-card border border-line p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-sans text-white px-2 py-0.5 rounded-full ${item.action === 'CREATE' ? 'bg-aurora-500' : 'bg-glacier-700'}`}>
                      {item.action}
                    </span>
                    <span className="text-[12px] font-sans text-slate-500">
                      {entityLabels[item.entity_type] || item.entity_type}
                    </span>
                    {item.entity_id && (
                      <span className="text-[11px] font-mono text-slate-400">ID: {item.entity_id.slice(0, 8)}...</span>
                    )}
                  </div>
                  <p className="text-[13px] font-sans text-slate-500">
                    Submitted by <span className="text-navy-900 font-bold">{item.submitted_by_name}</span> ({item.submitted_by_email})
                  </p>
                  <p className="text-[11px] font-sans text-slate-400 mt-0.5">{item.created_at}</p>
                </div>

                {filter === 'PENDING' && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={actionLoading === item.id}
                      className="bg-glacier-500 text-white text-[12px] font-sans px-3 py-1 rounded-card hover:bg-glacier-700 transition-colors duration-150 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={actionLoading === item.id}
                      className="bg-ember-500 text-white text-[12px] font-sans px-3 py-1 rounded-card hover:bg-ember-500/80 transition-colors duration-150 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>

              {/* Show payload preview */}
              {item.payload && (
                <details className="mt-2">
                  <summary className="text-[12px] font-sans text-aurora-500 cursor-pointer">View submitted data</summary>
                  <pre className="mt-1 text-[12px] font-mono text-slate-800 bg-frost-50 p-2 rounded-card border border-line max-h-[200px] overflow-auto whitespace-pre-wrap">
                    {typeof item.payload === 'object' ? JSON.stringify(item.payload, null, 2) : item.payload}
                  </pre>
                </details>
              )}

              {item.review_note && (
                <p className="text-[12px] font-sans text-slate-500 mt-2">
                  <span className="font-bold">Review note:</span> {item.review_note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
