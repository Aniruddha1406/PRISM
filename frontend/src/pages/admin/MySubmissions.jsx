import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function MySubmissions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/approvals/my`);
      setItems(data.items || []);
    } catch { setItems([]); }
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, []);

  const entityLabels = {
    expedition: 'Expedition', dataset: 'Dataset', publication: 'Publication',
    news: 'News Article', event: 'Event', media: 'Media Item', education: 'Education Resource',
  };

  const statusColors = {
    PENDING: 'bg-aurora-500',
    APPROVED: 'bg-glacier-700',
    REJECTED: 'bg-ember-500',
  };

  return (
    <div>
      <h1 className="text-h1 mb-4">My Submissions</h1>
      <p className="text-[14px] font-sans text-slate-500 mb-4">Track the status of your submitted content changes.</p>

      {loading ? (
        <p className="font-sans text-slate-500">Loading...</p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-card border border-line p-4">
          <p className="text-[14px] font-sans text-slate-500">You haven't submitted any changes yet.</p>
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
                  </div>
                  <p className="text-[11px] font-sans text-slate-400 mt-0.5">Submitted on {item.created_at}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-sans text-white px-2 py-0.5 rounded-full ${statusColors[item.status] || 'bg-slate-500'}`}>
                    {item.status}
                  </span>
                </div>
              </div>

              {item.payload && (
                <details className="mt-2">
                  <summary className="text-[12px] font-sans text-aurora-500 cursor-pointer">View submitted data</summary>
                  <pre className="mt-1 text-[12px] font-mono text-slate-800 bg-frost-50 p-2 rounded-card border border-line max-h-[200px] overflow-auto whitespace-pre-wrap">
                    {typeof item.payload === 'object' ? JSON.stringify(item.payload, null, 2) : item.payload}
                  </pre>
                </details>
              )}

              {item.review_note && (
                <p className="text-[12px] font-sans text-slate-500 mt-2 p-2 bg-frost-50 rounded border border-line">
                  <span className="font-bold text-navy-900">Admin Note:</span> {item.review_note}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
