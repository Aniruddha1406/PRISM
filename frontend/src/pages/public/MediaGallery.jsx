import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function MediaGallery() {
  const [items, setItems] = useState([]);
  const [mediaType, setMediaType] = useState('');
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (mediaType) params.set('media_type', mediaType);
        const data = await api.get(`/media?${params}`);
        setItems(data.items || []);
      } catch { setItems([]); }
      setLoading(false);
    }
    load();
  }, [mediaType]);

  return (
    <div className="max-w-[1200px] mx-auto px-3 py-5">
      <h1 className="text-h1 mb-2">Media Gallery</h1>
      <p className="text-[16px] font-sans text-slate-500 mb-4">Photographs and videos from India's polar and ocean research programmes.</p>

      <div className="flex items-center gap-2 mb-4">
        {['', 'PHOTO', 'VIDEO'].map(t => (
          <button key={t} onClick={() => setMediaType(t)}
            className={`text-[13px] font-sans px-3 py-1 rounded-card border transition-colors duration-150 ${mediaType === t ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-slate-800 border-line hover:border-glacier-500'}`}>
            {t || 'All'}{t === 'PHOTO' ? 's' : t === 'VIDEO' ? 's' : ''}
          </button>
        ))}
      </div>

      {loading ? <p className="text-slate-500 font-sans">Loading...</p> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map(item => (
              <button key={item.id} onClick={() => setLightbox(item)}
                className="text-left bg-white rounded-card border border-line overflow-hidden hover:shadow-hover transition-shadow duration-150 group">
                <div className="aspect-[4/3] bg-navy-900 flex items-center justify-center relative">
                  {item.media_type === 'VIDEO' && (
                    <span className="absolute top-2 right-2 bg-aurora-500 text-white text-[10px] font-sans px-2 py-0.5 rounded-full">Video</span>
                  )}
                  <span className="text-white/50 text-[13px] font-sans">{item.media_type === 'PHOTO' ? 'Photo' : 'Video'}</span>
                </div>
                <div className="p-2">
                  <h3 className="text-[13px] font-serif font-bold text-navy-900 leading-tight">{item.title}</h3>
                  {item.credit && <p className="text-[11px] font-sans text-slate-500 mt-0.5">Credit: {item.credit}</p>}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(item.tags || []).slice(0, 3).map(tag => (
                      <span key={tag.id} className="text-[10px] font-sans border border-line text-slate-500 px-1.5 py-0.5 rounded-full">{tag.name}</span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
            {!items.length && <p className="text-slate-500 font-sans col-span-4">No media items found.</p>}
          </div>

          {/* Lightbox */}
          {lightbox && (
            <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
              <div className="absolute inset-0 bg-navy-900/80" onClick={() => setLightbox(null)} />
              <div className="relative max-w-[900px] w-full mx-3">
                <div className="bg-navy-900 rounded-glass overflow-hidden">
                  <div className="aspect-[16/10] bg-navy-900 flex items-center justify-center">
                    <span className="text-white/40 text-[16px] font-sans">{lightbox.title}</span>
                  </div>
                  {/* Glass caption panel */}
                  <div className="glass-dark p-3 mx-3 mb-3 -mt-6 relative z-10 rounded-glass">
                    <h3 className="text-[16px] font-serif font-bold text-white">{lightbox.title}</h3>
                    {lightbox.description && <p className="text-white/80 text-[13px] font-sans mt-1">{lightbox.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-[12px] font-sans text-white/60">
                      {lightbox.credit && <span>Credit: {lightbox.credit}</span>}
                      {lightbox.location && <span>Location: {lightbox.location}</span>}
                      {lightbox.taken_date && <span>Date: {lightbox.taken_date}</span>}
                      {lightbox.licence && <span>Licence: {lightbox.licence}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => setLightbox(null)}
                  className="absolute top-3 right-3 text-white/80 hover:text-white text-[20px] font-sans bg-navy-900/60 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150">
                  x
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
