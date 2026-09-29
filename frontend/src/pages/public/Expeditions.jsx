import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function Expeditions() {
  const [expeditions, setExpeditions] = useState([]);
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (region) params.set('region', region);
        const data = await api.get(`/expeditions?${params}`);
        setExpeditions(data.expeditions || []);
      } catch { setExpeditions([]); }
      setLoading(false);
    }
    load();
  }, [region]);

  const regionColors = { ANTARCTIC:'bg-glacier-700', ARCTIC:'bg-aurora-500', SOUTHERN_OCEAN:'bg-glacier-500', HIMALAYA:'bg-ember-500' };

  return (
    <div className="max-w-[1200px] mx-auto px-3 py-5">
      <h1 className="text-h1 mb-2">Expeditions</h1>
      <p className="text-[16px] font-sans text-slate-500 mb-4">Scientific expeditions to the Arctic, Antarctic, Southern Ocean and Himalayan regions.</p>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-[13px] font-sans text-slate-800">Filter by region:</span>
        {['', 'ARCTIC', 'ANTARCTIC', 'SOUTHERN_OCEAN', 'HIMALAYA'].map(r => (
          <button key={r} onClick={() => setRegion(r)}
            className={`text-[13px] font-sans px-3 py-1 rounded-card border transition-colors duration-150 ${region === r ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-slate-800 border-line hover:border-slate-300'}`}>
            {r || 'All'}
          </button>
        ))}
      </div>

      {loading ? <p className="text-slate-500 font-sans">Loading...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {expeditions.map(exp => (
            <Link to={`/expeditions/${exp.slug}`} key={exp.id} className="block bg-white rounded-card border border-line hover: transition-shadow duration-150 p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className={`${regionColors[exp.region]||'bg-glacier-700'} text-white text-[11px] font-sans px-2 py-0.5 rounded-[2px]`}>{exp.region}</span>
                <span className="text-[11px] font-sans text-slate-500">{exp.year}</span>
                <span className={`text-[11px] font-sans px-2 py-0.5 rounded-[2px] border ${exp.expedition_status==='COMPLETED'?'border-glacier-700 text-glacier-700':'border-aurora-500 text-aurora-500'}`}>{exp.expedition_status}</span>
              </div>
              <h3 className="text-[16px] font-serif font-bold text-navy-900 mb-1">{exp.title}</h3>
              <p className="text-slate-500 text-[13px] font-sans leading-relaxed">{(exp.summary||'').slice(0,150)}{(exp.summary||'').length>150?'...':''}</p>
              {exp.station_name && <p className="text-[12px] font-sans text-aurora-500 mt-2">Station: {exp.station_name}</p>}
            </Link>
          ))}
          {!expeditions.length && <p className="text-slate-500 font-sans col-span-3">No expeditions found.</p>}
        </div>
      )}
    </div>
  );
}
