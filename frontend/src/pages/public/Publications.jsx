import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function Publications() {
  const [publications, setPublications] = useState([]);
  const [pubType, setPubType] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (pubType) params.set('pub_type', pubType);
        if (searchQ) params.set('q', searchQ);
        const data = await api.get(`/publications?${params}`);
        setPublications(data.publications || []);
      } catch { setPublications([]); }
      setLoading(false);
    }
    load();
  }, [pubType, searchQ]);

  const typeLabels = { PAPER:'Paper', TECHNICAL_REPORT:'Technical Report', ANNUAL_REPORT:'Annual Report', NEWSLETTER:'Newsletter', BOOK:'Book' };

  return (
    <div className="max-w-[1200px] mx-auto px-3 py-5">
      <h1 className="text-h1 mb-2">Publications</h1>
      <p className="text-[16px] font-sans text-slate-500 mb-4">Research papers, reports, and publications from PRISM scientists.</p>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input type="search" placeholder="Search publications..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
          className="border border-line rounded-input px-3 py-1 text-[14px] font-sans w-[260px] focus:border-glacier-500 transition-colors duration-150" />
        <select value={pubType} onChange={e => setPubType(e.target.value)}
          className="border border-line rounded-input px-2 py-1 text-[14px] font-sans focus:border-glacier-500 transition-colors duration-150">
          <option value="">All types</option>
          {Object.entries(typeLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? <p className="text-slate-500 font-sans">Loading...</p> : (
        <div className="bg-white rounded-card border border-line">
          {publications.map((pub, i) => (
            <div key={pub.id} className={`px-3 py-3 ${i < publications.length - 1 ? 'border-b border-line' : ''} hover:bg-frost-50 transition-colors duration-150`}>
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <Link to={`/publications/${pub.slug}`} className="text-[15px] font-serif font-bold text-navy-900 hover:text-glacier-500 transition-colors duration-150">{pub.title}</Link>
                  <p className="text-[13px] font-sans text-slate-500 mt-0.5">
                    {pub.authors}{pub.journal ? ` — ${pub.journal}` : ''}{pub.year ? `, ${pub.year}` : ''}
                  </p>
                  {pub.abstract && <p className="text-[13px] font-sans text-slate-800 mt-1 leading-relaxed">{pub.abstract.slice(0, 200)}{pub.abstract.length > 200 ? '...' : ''}</p>}
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <span className="text-[11px] font-sans border border-glacier-700 text-glacier-700 px-2 py-0.5 rounded-[2px]">{typeLabels[pub.pub_type] || pub.pub_type}</span>
                  <a href={`${import.meta.env.VITE_API_URL || '/api/v1'}/publications/${pub.id}/bibtex`} className="text-[12px] font-sans text-glacier-500 hover:underline">BibTeX</a>
                  <a href={`${import.meta.env.VITE_API_URL || '/api/v1'}/publications/${pub.id}/ris`} className="text-[12px] font-sans text-glacier-500 hover:underline">RIS</a>
                </div>
              </div>
            </div>
          ))}
          {!publications.length && <p className="px-3 py-4 text-center text-slate-500 font-sans">No publications found.</p>}
        </div>
      )}
    </div>
  );
}
