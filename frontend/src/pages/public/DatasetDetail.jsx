import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';

export default function DatasetDetail() {
  const { slug } = useParams();
  const [ds, setDs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    async function load() {
      try { const data = await api.get(`/datasets/${slug}`); setDs(data.dataset); } catch { setDs(null); }
      setLoading(false);
    }
    load();
  }, [slug]);

  const handleDownload = async () => {
    if (!accepted) return;
    try { await api.post(`/datasets/${ds.id}/download`, { accepted_terms: true }); } catch {}
    alert('Download logged. In production this would initiate the file download.');
  };

  if (loading) return <div className="max-w-[1200px] mx-auto px-3 py-5"><p className="text-slate-500 font-sans">Loading...</p></div>;
  if (!ds) return <div className="max-w-[1200px] mx-auto px-3 py-5"><h1 className="text-h1">Dataset not found</h1></div>;

  return (
    <div className="max-w-[1200px] mx-auto px-3 py-5">
      <nav className="text-[13px] font-sans text-slate-500 mb-3">
        <Link to="/datasets" className="hover:text-glacier-500 transition-colors duration-150">Data Repository</Link>
        <span className="mx-1">/</span><span className="text-slate-800">{ds.title}</span>
      </nav>
      <h1 className="text-h1 mb-3">{ds.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <section className="bg-white rounded-card border border-line p-4 mb-3">
            <h2 className="text-h2 mb-2">Description</h2>
            <p className="text-[16px] font-sans text-slate-800 leading-relaxed">{ds.description}</p>
          </section>
          {ds.citation && (
            <section className="bg-white rounded-card border border-line p-4 mb-3">
              <h2 className="text-h2 mb-2">Citation</h2>
              <p className="text-[14px] font-mono text-slate-800 bg-frost-50 p-3 rounded-card border border-line">{ds.citation}</p>
            </section>
          )}
          <section className="bg-white rounded-card border border-line p-4">
            <h2 className="text-h2 mb-2">Download</h2>
            <label className="flex items-start gap-2 cursor-pointer mb-3">
              <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-1" />
              <span className="text-[14px] font-sans text-slate-800">I accept the usage terms and acknowledge that this data is provided under the {ds.licence || 'specified'} licence.</span>
            </label>
            <button onClick={handleDownload} disabled={!accepted}
              className={`text-[14px] font-sans px-4 py-1 rounded-card transition-colors duration-150 ${accepted ? 'bg-glacier-500 text-white hover:bg-glacier-700' : 'bg-line text-slate-500 cursor-not-allowed'}`}>
              Download Dataset
            </button>
          </section>
        </div>
        <aside>
          <div className="bg-white rounded-card border border-line p-3">
            <h3 className="text-h3 mb-2">Metadata</h3>
            <dl className="space-y-2 text-[14px] font-sans">
              <div><dt className="text-slate-500">Discipline</dt><dd className="text-slate-800">{ds.discipline}</dd></div>
              <div><dt className="text-slate-500">Parameters</dt><dd className="text-slate-800">{ds.parameters}</dd></div>
              <div><dt className="text-slate-500">Spatial Coverage</dt><dd className="text-slate-800">{ds.spatial_coverage}</dd></div>
              <div><dt className="text-slate-500">Temporal Coverage</dt><dd className="text-slate-800">{ds.temporal_coverage_start} to {ds.temporal_coverage_end}</dd></div>
              <div><dt className="text-slate-500">Format</dt><dd><span className="font-mono bg-frost-50 border border-line px-2 py-0.5 rounded-card text-[12px]">{ds.format}</span></dd></div>
              <div><dt className="text-slate-500">Access Level</dt><dd className="text-slate-800">{ds.access_level}</dd></div>
              <div><dt className="text-slate-500">Version</dt><dd className="text-slate-800">{ds.version}</dd></div>
              <div><dt className="text-slate-500">Licence</dt><dd className="text-slate-800">{ds.licence}</dd></div>
              {ds.contact_name && <div><dt className="text-slate-500">Contact</dt><dd className="text-slate-800">{ds.contact_name} ({ds.contact_email})</dd></div>}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
