import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';

export default function ExpeditionDetail() {
  const { slug } = useParams();
  const [exp, setExp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try { const data = await api.get(`/expeditions/${slug}`); setExp(data.expedition); } catch { setExp(null); }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) return <div className="max-w-[1200px] mx-auto px-3 py-5"><p className="text-slate-500 font-sans">Loading...</p></div>;
  if (!exp) return <div className="max-w-[1200px] mx-auto px-3 py-5"><h1 className="text-h1">Expedition not found</h1></div>;

  return (
    <div className="max-w-[1200px] mx-auto px-3 py-5">
      <nav className="text-[13px] font-sans text-slate-500 mb-3">
        <Link to="/expeditions" className="hover:text-glacier-500 transition-colors duration-150">Expeditions</Link>
        <span className="mx-1">/</span>
        <span className="text-slate-800">{exp.title}</span>
      </nav>

      <div className="flex items-center gap-2 mb-2">
        <span className="bg-glacier-700 text-white text-[11px] font-sans px-2 py-0.5 rounded-full">{exp.region}</span>
        <span className={`text-[11px] font-sans px-2 py-0.5 rounded-full border ${exp.expedition_status==='COMPLETED'?'border-glacier-700 text-glacier-700':'border-aurora-500 text-aurora-500'}`}>{exp.expedition_status}</span>
      </div>

      <h1 className="text-h1 mb-2">{exp.title}</h1>
      {exp.title_hi && <p className="text-[18px] font-sans text-slate-500 mb-3">{exp.title_hi}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <section className="bg-white rounded-card border border-line p-4 mb-3">
            <h2 className="text-h2 mb-2">Summary</h2>
            <p className="text-[16px] font-sans text-slate-800 leading-relaxed">{exp.description || exp.summary}</p>
          </section>

          {exp.objectives && (
            <section className="bg-white rounded-card border border-line p-4 mb-3">
              <h2 className="text-h2 mb-2">Research Objectives</h2>
              <ul className="list-disc pl-4 space-y-1">
                {exp.objectives.split(';').map((obj, i) => (
                  <li key={i} className="text-[15px] font-sans text-slate-800">{obj.trim()}</li>
                ))}
              </ul>
            </section>
          )}

          {exp.datasets && exp.datasets.length > 0 && (
            <section className="bg-white rounded-card border border-line p-4 mb-3">
              <h2 className="text-h2 mb-2">Linked Datasets</h2>
              {exp.datasets.map(ds => (
                <Link to={`/datasets/${ds.slug}`} key={ds.id} className="block border-b border-line last:border-0 py-2 hover:bg-frost-50 transition-colors duration-150 px-2">
                  <span className="text-[15px] font-serif font-bold text-navy-900">{ds.title}</span>
                  <span className="text-[12px] font-sans text-slate-500 ml-2">{ds.discipline} - {ds.format}</span>
                </Link>
              ))}
            </section>
          )}

          {exp.publications && exp.publications.length > 0 && (
            <section className="bg-white rounded-card border border-line p-4 mb-3">
              <h2 className="text-h2 mb-2">Linked Publications</h2>
              {exp.publications.map(pub => (
                <Link to={`/publications/${pub.slug}`} key={pub.id} className="block border-b border-line last:border-0 py-2 hover:bg-frost-50 transition-colors duration-150 px-2">
                  <span className="text-[15px] font-serif font-bold text-navy-900">{pub.title}</span>
                  <span className="text-[12px] font-sans text-slate-500 ml-2">{pub.authors}, {pub.year}</span>
                </Link>
              ))}
            </section>
          )}
        </div>

        <aside>
          <div className="bg-white rounded-card border border-line p-3 mb-3">
            <h3 className="text-h3 mb-2">Details</h3>
            <dl className="space-y-2 text-[14px] font-sans">
              <div><dt className="text-slate-500">Station</dt><dd className="text-slate-800">{exp.station_name || 'Multiple'}</dd></div>
              {exp.station_location && <div><dt className="text-slate-500">Location</dt><dd className="text-slate-800">{exp.station_location}</dd></div>}
              <div><dt className="text-slate-500">Period</dt><dd className="text-slate-800">{exp.start_date} to {exp.end_date}</dd></div>
              <div><dt className="text-slate-500">Year</dt><dd className="text-slate-800">{exp.year}</dd></div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
