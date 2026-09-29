import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function Datasets() {
  const [datasets, setDatasets] = useState([]);
  const [discipline, setDiscipline] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (discipline) params.set('discipline', discipline);
        if (searchQ) params.set('q', searchQ);
        const data = await api.get(`/datasets?${params}`);
        setDatasets(data.datasets || []);
      } catch { setDatasets([]); }
      setLoading(false);
    }
    load();
  }, [discipline, searchQ]);

  const disciplines = ['Atmospheric Science', 'Oceanography', 'Glaciology', 'Marine Biology', 'Geology'];

  return (
    <div className="max-w-[1200px] mx-auto px-3 py-5">
      <h1 className="text-h1 mb-2">Data Repository</h1>
      <p className="text-[16px] font-sans text-slate-500 mb-4">Scientific datasets from NCPOR research programmes. Download data for your research.</p>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input type="search" placeholder="Search datasets..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
          className="border border-line rounded-input px-3 py-1 text-[14px] font-sans w-[260px] focus:border-glacier-500 transition-colors duration-150" />
        <select value={discipline} onChange={e => setDiscipline(e.target.value)}
          className="border border-line rounded-input px-2 py-1 text-[14px] font-sans focus:border-glacier-500 transition-colors duration-150">
          <option value="">All disciplines</option>
          {disciplines.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? <p className="text-slate-500 font-sans">Loading...</p> : (
        <div className="bg-white rounded-card border border-line overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-frost-50 border-b border-line">
                <th className="px-3 py-2 text-[13px] font-sans font-bold text-navy-900">Title</th>
                <th className="px-3 py-2 text-[13px] font-sans font-bold text-navy-900">Discipline</th>
                <th className="px-3 py-2 text-[13px] font-sans font-bold text-navy-900">Format</th>
                <th className="px-3 py-2 text-[13px] font-sans font-bold text-navy-900">Access</th>
                <th className="px-3 py-2 text-[13px] font-sans font-bold text-navy-900">Licence</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map(ds => (
                <tr key={ds.id} className="border-b border-line last:border-0 hover:bg-frost-50 transition-colors duration-150">
                  <td className="px-3 py-2">
                    <Link to={`/datasets/${ds.slug}`} className="text-[14px] font-serif font-bold text-navy-900 hover:text-glacier-500 transition-colors duration-150">{ds.title}</Link>
                  </td>
                  <td className="px-3 py-2 text-[13px] font-sans text-slate-500">{ds.discipline}</td>
                  <td className="px-3 py-2"><span className="text-[11px] font-mono bg-frost-50 border border-line px-2 py-0.5 rounded-card">{ds.format}</span></td>
                  <td className="px-3 py-2 text-[13px] font-sans text-slate-500">{ds.access_level}</td>
                  <td className="px-3 py-2 text-[12px] font-sans text-slate-500">{ds.licence}</td>
                </tr>
              ))}
              {!datasets.length && <tr><td colSpan="5" className="px-3 py-4 text-center text-slate-500 font-sans">No datasets found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
