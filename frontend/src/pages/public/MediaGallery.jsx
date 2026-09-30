import { useState, useEffect } from 'react';
import api from '../../api/client';
import photos from '../../config/photos.json';

// Demo videos — YouTube iframes (work on deployed domain; blocked on localhost by browser security)
const DEMO_VIDEOS = [
  {
    id: 'demo-video-1',
    media_type: 'VIDEO',
    title: 'At the Bottom of the World — Polar Science',
    credit: 'National Science Foundation',
    location: 'Amundsen-Scott South Pole Station, Antarctica',
    thumbnail: '/assets/expedition_40-640.webp',
    embedUrl: 'https://www.youtube.com/embed/GBqt98Rw0BQ',
    tags: [{ id: 'antarctic', name: 'Antarctic' }, { id: 'field-work', name: 'Field Work' }],
  },
  {
    id: 'demo-video-2',
    media_type: 'VIDEO',
    title: 'Antarctic Ice Mass Loss 2002–2023',
    credit: 'NASA / GRACE & GRACE-FO',
    location: 'Antarctic Ice Sheet',
    thumbnail: '/assets/ncpor_campus-640.webp',
    embedUrl: 'https://www.youtube.com/embed/QH8LQCzV1L9',
    tags: [{ id: 'antarctic', name: 'Antarctic' }, { id: 'glaciology', name: 'Glaciology' }],
  },
];

export default function MediaGallery() {
  const [items, setItems] = useState([]);
  const [mediaType, setMediaType] = useState('');
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let apiItems = [];
      try {
        const params = new URLSearchParams();
        if (mediaType) params.set('media_type', mediaType);
        const data = await api.get(`/media?${params}`);
        apiItems = (data.items || []).filter(i => i.image || i.url); // only items with actual media
      } catch { /* ignore */ }

      if (!mediaType || mediaType === 'PHOTO') {
        const staticItems = photos.map(p => ({
          id: p.id,
          media_type: 'PHOTO',
          title: p.description,
          credit: p.credit,
          image: `/assets/${p.id}-640.webp`,
          full_image: `/assets/${p.id}-1920.webp`,
          tags: [{ id: p.album, name: p.album }]
        }));
        const existingIds = new Set(apiItems.map(i => i.id));
        const videos = (!mediaType || mediaType === 'VIDEO') ? DEMO_VIDEOS : [];
        setItems([...apiItems, ...staticItems.filter(s => !existingIds.has(s.id)), ...videos]);
      } else if (mediaType === 'VIDEO') {
        setItems([...apiItems, ...DEMO_VIDEOS]);
      } else {
        setItems(apiItems);
      }
      setLoading(false);
    }
    load();
  }, [mediaType]);

  return (
    <div className="max-w-[1200px] mx-auto px-3 py-5">
      <div className="panel-reading">
        <h1 className="text-h1 mb-2">Media Gallery</h1>
        <p className="text-[16px] font-sans text-slate-500 mb-4">Photographs and videos from India's polar and ocean research programmes.</p>

        <div className="flex items-center gap-2 mb-4">
          {['', 'PHOTO', 'VIDEO'].map(t => (
            <button key={t} onClick={() => setMediaType(t)}
              className={`text-[13px] font-sans px-3 py-1 rounded-[4px] border transition-colors duration-150 ${mediaType === t ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-slate-800 border-line hover:border-slate-300'}`}>
              {t || 'All'}{t === 'PHOTO' ? 's' : t === 'VIDEO' ? 's' : ''}
            </button>
          ))}
        </div>

        {loading ? <p className="text-slate-500 font-sans">Loading...</p> : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map(item => (
                <button key={item.id} onClick={() => setLightbox(item)}
                  className="text-left bg-white rounded-[4px] border border-line overflow-hidden hover: transition-shadow duration-150 group">
                  <div className="aspect-[4/3] bg-frost-50 overflow-hidden relative">
                    <img src={item.thumbnail || item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                    {item.media_type === 'VIDEO' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-navy-900/40 group-hover:bg-navy-900/50 transition-colors duration-150">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5 text-navy-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      {item.media_type === 'VIDEO' && (
                        <span className="text-[10px] font-sans bg-glacier-700 text-white px-1.5 py-0.5 rounded-[2px]">VIDEO</span>
                      )}
                      <h3 className="text-[13px] font-serif font-bold text-navy-900 leading-tight line-clamp-2">{item.title}</h3>
                    </div>
                    {item.credit && <p className="text-[11px] font-sans text-slate-500 mt-0.5">{item.credit}</p>}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(item.tags || []).slice(0, 3).map(tag => (
                        <span key={tag.id} className="text-[10px] font-sans border border-line text-slate-500 px-1.5 py-0.5 rounded-[2px]">{tag.name}</span>
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
                  <div className="bg-navy-900 rounded-[8px] overflow-hidden">
                    <div className="aspect-[16/10] bg-black flex items-center justify-center overflow-hidden">
                      {lightbox.media_type === 'VIDEO' && lightbox.embedUrl ? (
                        <iframe
                          src={lightbox.embedUrl}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={lightbox.title}
                        />
                      ) : (
                        <img src={lightbox.full_image || lightbox.image} alt={lightbox.title} className="w-full h-full object-contain" />
                      )}
                    </div>
                    {/* Glass caption panel */}
                    <div className="glass-navy p-3 mx-3 mb-3 -mt-6 relative z-10 rounded-[8px]">
                      <h3 className="text-[16px] font-serif font-bold text-white">{lightbox.title}</h3>
                      <div className="flex items-center gap-3 mt-2 text-[12px] font-sans text-white/60">
                        {lightbox.credit && <span>{lightbox.credit}</span>}
                        {lightbox.location && <span>Location: {lightbox.location}</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setLightbox(null)}
                    className="absolute top-3 right-3 text-white/80 hover:text-white text-[14px] font-sans bg-navy-900/60 px-3 py-1 rounded-[4px] transition-colors duration-150">
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

