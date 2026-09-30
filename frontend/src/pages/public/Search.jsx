import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query || query.length < 2) return;
    setLoading(true);
    try {
      const data = await api.get(`/search?q=${encodeURIComponent(query)}`);
      setResults(data.results);
    } catch { setResults(null); }
    setLoading(false);
  };

  const typeConfig = {
    expeditions: { label: 'Expeditions', path: '/expeditions', color: 'text-glacier-700 border-glacier-700' },
    datasets: { label: 'Datasets', path: '/datasets', color: 'text-aurora-500 border-aurora-500' },
    publications: { label: 'Publications', path: '/publications', color: 'text-glacier-500 border-glacier-500' },
    media: { label: 'Media', path: '/media', color: 'text-navy-900 border-navy-900' },
    news: { label: 'News', path: '/news', color: 'text-ember-500 border-ember-500' },
    glossary: { label: 'Glossary', path: '/outreach', color: 'text-slate-500 border-slate-500' },
  };

  return (
    <div className="max-w-[1200px] mx-auto px-3 py-5">
      <h1 className="text-h1 mb-4">Search</h1>
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-5 max-w-[600px]">
        <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search across all content..."
          className="flex-grow border border-line rounded-input px-3 py-2 text-[16px] font-sans focus:border-glacier-500 transition-colors duration-150" />
        <button type="submit" className="bg-glacier-500 text-white font-sans text-[14px] px-4 py-2 rounded-card hover:bg-glacier-700 transition-colors duration-150">Search</button>
      </form>

      {loading && <p className="text-slate-500 font-sans">Searching...</p>}

      {results && (
        <div className="space-y-5">
          {Object.entries(results).map(([type, items]) => {
            if (!items || !items.length) return null;
            const cfg = typeConfig[type] || { label: type, path: '/', color: 'text-slate-500 border-slate-500' };
            return (
              <section key={type}>
                <h2 className="text-h2 mb-2">{cfg.label} <span className="text-[14px] font-sans text-slate-500 font-normal">({items.length} result{items.length !== 1 ? 's' : ''})</span></h2>
                <div className="bg-white rounded-card border border-line">
                  {items.map((item, i) => (
                    <div key={item.id} className={`px-3 py-2 ${i < items.length - 1 ? 'border-b border-line' : ''} hover:bg-frost-50 transition-colors duration-150`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <Link to={item.slug ? `${cfg.path}/${item.slug}` : cfg.path}
                            className="text-[15px] font-serif font-bold text-navy-900 hover:text-glacier-500 transition-colors duration-150">
                            {item.title}
                          </Link>
                          {item.summary && <p className="text-[13px] font-sans text-slate-500 mt-0.5">{item.summary.slice(0, 150)}{item.summary.length > 150 ? '...' : ''}</p>}
                        </div>
                        <span className={`text-[10px] font-sans border px-2 py-0.5 rounded-[2px] ml-2 whitespace-nowrap ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
          {Object.values(results).every(items => !items || !items.length) && (
            <p className="text-slate-500 font-sans">No results found for "{query}".</p>
          )}
        </div>
      )}
    </div>
  );
}
