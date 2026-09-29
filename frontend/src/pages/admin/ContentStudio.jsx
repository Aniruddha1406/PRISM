import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function ContentStudio() {
  const [sourceType, setSourceType] = useState('expedition');
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [generated, setGenerated] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [existingContent, setExistingContent] = useState([]);

  useEffect(() => {
    async function loadSources() {
      try {
        const endpoints = { expedition: '/expeditions?limit=50', dataset: '/datasets?limit=50', publication: '/publications?limit=50', news: '/news?limit=50', event: '/events' };
        const data = await api.get(endpoints[sourceType]);
        const items = data.expeditions || data.datasets || data.publications || data.articles || data.events || [];
        setSources(items);
      } catch { setSources([]); }
    }
    loadSources();
  }, [sourceType]);

  useEffect(() => {
    async function loadExisting() {
      try { const data = await api.get('/studio/content'); setExistingContent(data.content || []); } catch {}
    }
    loadExisting();
  }, [generated]);

  const handleGenerate = async () => {
    if (!selectedSource) return;
    setGenerating(true);
    try {
      const data = await api.post('/studio/generate', { source_type: sourceType, source_id: selectedSource });
      setGenerated(data.generated || []);
    } catch (err) { alert(err.message); }
    setGenerating(false);
  };

  const handleApprove = async (id) => {
    try { await api.put(`/studio/content/${id}/approve`); setExistingContent(prev => prev.map(c => c.id === id ? { ...c, status: 'APPROVED' } : c)); } catch (err) { alert(err.message); }
  };

  const handleReject = async (id) => {
    try { await api.put(`/studio/content/${id}/reject`); setExistingContent(prev => prev.map(c => c.id === id ? { ...c, status: 'REJECTED' } : c)); } catch (err) { alert(err.message); }
  };

  const platformLabels = { website_article: 'Website Article', press_release: 'Press Release', facebook: 'Facebook', twitter: 'X/Twitter', instagram: 'Instagram', linkedin: 'LinkedIn', youtube: 'YouTube', newsletter: 'Newsletter' };

  return (
    <div>
      <h1 className="text-h1 mb-4">Content Studio</h1>

      {/* Generator */}
      <section className="bg-white rounded-card border border-line p-4 mb-5">
        <h2 className="text-h3 mb-3">Generate Content Drafts</h2>
        <p className="text-[13px] font-sans text-slate-500 mb-3">Select a source record. The system will generate drafts for all platforms in English and Hindi using the record's metadata. All drafts are labelled "Draft: needs human review".</p>
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-[13px] font-sans text-slate-800 mb-1">Source type</label>
            <select value={sourceType} onChange={e => { setSourceType(e.target.value); setSelectedSource(''); }}
              className="border border-line rounded-input px-2 py-1 text-[14px] font-sans">
              <option value="expedition">Expedition</option>
              <option value="dataset">Dataset</option>
              <option value="publication">Publication</option>
              <option value="news">News Article</option>
              <option value="event">Event</option>
            </select>
          </div>
          <div className="flex-grow">
            <label className="block text-[13px] font-sans text-slate-800 mb-1">Source record</label>
            <select value={selectedSource} onChange={e => setSelectedSource(e.target.value)}
              className="w-full border border-line rounded-input px-2 py-1 text-[14px] font-sans">
              <option value="">Select a record...</option>
              {sources.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <button onClick={handleGenerate} disabled={!selectedSource || generating}
            className="bg-glacier-500 text-white font-sans text-[14px] px-4 py-1 rounded-card hover:bg-glacier-700 transition-colors duration-150 disabled:opacity-50">
            {generating ? 'Generating...' : 'Generate Drafts'}
          </button>
        </div>
      </section>

      {/* Newly generated results */}
      {generated.length > 0 && (
        <section className="bg-white rounded-card border border-line p-4 mb-5">
          <h2 className="text-h3 mb-3">Generated Drafts <span className="text-[12px] font-sans text-ember-500 font-normal">Draft: needs human review</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {generated.map(g => (
              <div key={g.id} className="border border-line rounded-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-sans font-bold text-navy-900">{platformLabels[g.platform] || g.platform}</span>
                  <span className="text-[11px] font-sans text-slate-500">{g.language === 'hi' ? 'Hindi' : 'English'}</span>
                </div>
                <pre className="text-[13px] font-sans text-slate-800 whitespace-pre-wrap leading-relaxed bg-frost-50 p-2 rounded-card border border-line max-h-[200px] overflow-auto">{g.content}</pre>
                {g.fact_annotations && g.fact_annotations.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-[11px] font-sans text-aurora-500 cursor-pointer">Fact guard: {g.fact_annotations.length} traced value{g.fact_annotations.length !== 1 ? 's' : ''}</summary>
                    <ul className="mt-1 space-y-0.5">
                      {g.fact_annotations.map((a, i) => (
                        <li key={i} className="text-[11px] font-mono text-slate-500">"{a.text}" from field <span className="text-aurora-500">{a.sourceField}</span></li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Existing generated content */}
      <section className="bg-white rounded-card border border-line p-4">
        <h2 className="text-h3 mb-3">All Generated Content</h2>
        {existingContent.length > 0 ? (
          <table className="w-full text-left">
            <thead><tr className="border-b border-line">
              <th className="text-[12px] font-sans text-slate-500 py-1 px-2">Platform</th>
              <th className="text-[12px] font-sans text-slate-500 py-1 px-2">Language</th>
              <th className="text-[12px] font-sans text-slate-500 py-1 px-2">Status</th>
              <th className="text-[12px] font-sans text-slate-500 py-1 px-2">Preview</th>
              <th className="text-[12px] font-sans text-slate-500 py-1 px-2">Actions</th>
            </tr></thead>
            <tbody>
              {existingContent.slice(0, 20).map(c => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="text-[13px] font-sans text-slate-800 py-1 px-2">{platformLabels[c.platform] || c.platform}</td>
                  <td className="text-[13px] font-sans text-slate-500 py-1 px-2">{c.language === 'hi' ? 'Hindi' : 'English'}</td>
                  <td className="py-1 px-2">
                    <span className={`text-[11px] font-sans px-2 py-0.5 rounded-full ${c.status === 'APPROVED' ? 'bg-glacier-500/10 text-glacier-500' : c.status === 'REJECTED' ? 'bg-ember-500/10 text-ember-500' : 'bg-frost-50 text-slate-500 border border-line'}`}>{c.status}</span>
                  </td>
                  <td className="text-[12px] font-sans text-slate-500 py-1 px-2 max-w-[200px] truncate">{c.content?.slice(0, 60)}...</td>
                  <td className="py-1 px-2">
                    {c.status === 'DRAFT' && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleApprove(c.id)} className="text-[12px] font-sans text-glacier-500 hover:underline">Approve</button>
                        <button onClick={() => handleReject(c.id)} className="text-[12px] font-sans text-ember-500 hover:underline">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-[13px] font-sans text-slate-500">No generated content yet. Use the generator above to create drafts.</p>
        )}
      </section>
    </div>
  );
}
