import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { authApi } from '../../api/client';

export default function MediaPortal() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      try { 
        const data = await authApi.me(); 
        setUser(data.user); 
        // Redirect if not Media
        if (data.user.role !== 'MEDIA') {
          navigate('/admin');
        }
      }
      catch { navigate('/login'); }
      setLoading(false);
    }
    checkAuth();
  }, [navigate]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    try {
      // Basic implementation of search across publications, datasets, and media
      // In a real app, you'd have a unified search endpoint, but for this demo, 
      // let's fetch from the public endpoints which the Media role has access to
      const [pubsRes, datasetsRes, mediaRes] = await Promise.all([
        api.get(`/publications?q=${encodeURIComponent(search)}`),
        api.get(`/datasets?q=${encodeURIComponent(search)}`),
        api.get(`/media`) // Our media endpoint doesn't have 'q' yet, so we get all and filter
      ]);

      const pubs = (pubsRes.publications || []).map(p => ({ ...p, type: 'Publication', label: 'Publication' }));
      const datasets = (datasetsRes.datasets || []).map(d => ({ ...d, type: 'Dataset', label: 'Dataset' }));
      
      const searchTerm = search.toLowerCase();
      const media = (mediaRes.items || [])
        .filter(m => m.title?.toLowerCase().includes(searchTerm) || m.description?.toLowerCase().includes(searchTerm))
        .map(m => ({ ...m, type: 'Media', label: 'Media' }));

      setResults([...pubs, ...datasets, ...media]);
    } catch (err) {
      console.error("Search failed", err);
    }
    setSearching(false);
  };

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen bg-frost-50 flex items-center justify-center"><p className="font-sans text-slate-500">Loading...</p></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-frost-50 flex flex-col">
      {/* Header */}
      <header className="bg-navy-900 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <h1 className="text-[20px] font-serif font-bold">NCPOR Media Portal</h1>
          <span className="text-[10px] bg-slate-500 px-2 py-0.5 rounded-full">Media Access</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[14px] font-sans text-white/70">Welcome, {user.name}</span>
          <button onClick={handleLogout} className="text-[14px] font-sans hover:text-aurora-500 transition-colors">Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-8 max-w-[1000px] mx-auto w-full">
        <h2 className="text-h2 mb-2 text-navy-900">Content Search</h2>
        <p className="text-[15px] font-sans text-slate-600 mb-6">Search across public publications, datasets, and media items.</p>

        <form onSubmit={handleSearch} className="mb-8 flex gap-2">
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search for content..."
            className="flex-grow px-4 py-3 rounded-card border border-line focus:border-glacier-500 focus:outline-none focus:ring-1 focus:ring-glacier-500"
          />
          <button 
            type="submit" 
            disabled={searching}
            className="bg-glacier-500 hover:bg-glacier-700 text-white px-6 py-3 rounded-card font-sans font-bold transition-colors disabled:opacity-50"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {results.length > 0 && (
          <div>
            <h3 className="text-h3 mb-4 text-navy-900">Search Results ({results.length})</h3>
            <div className="space-y-4">
              {results.map((item, idx) => (
                <div key={`${item.type}-${item.id || idx}`} className="bg-white p-5 rounded-card border border-line hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[18px] font-serif font-bold text-navy-900">{item.title}</h4>
                    <span className="text-[11px] font-sans bg-frost-50 text-slate-500 px-2 py-1 rounded border border-line">
                      {item.label}
                    </span>
                  </div>
                  <p className="text-[14px] font-sans text-slate-600 mb-3 line-clamp-2">
                    {item.description || item.abstract || item.summary || 'No description available.'}
                  </p>
                  
                  {item.type === 'Publication' && (
                    <div className="text-[12px] font-sans text-slate-500 flex gap-4">
                      <span><strong className="text-slate-700">Authors:</strong> {item.authors}</span>
                      <span><strong className="text-slate-700">Year:</strong> {item.year}</span>
                    </div>
                  )}
                  {item.type === 'Dataset' && (
                    <div className="text-[12px] font-sans text-slate-500 flex gap-4">
                      <span><strong className="text-slate-700">Discipline:</strong> {item.discipline}</span>
                      <span><strong className="text-slate-700">Format:</strong> {item.format}</span>
                    </div>
                  )}
                  {item.type === 'Media' && (
                    <div className="text-[12px] font-sans text-slate-500 flex gap-4">
                      <span><strong className="text-slate-700">Type:</strong> {item.media_type}</span>
                      <span><strong className="text-slate-700">Credit:</strong> {item.credit}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
