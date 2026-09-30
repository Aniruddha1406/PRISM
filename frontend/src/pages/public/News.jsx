import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function News() {
  const [articles, setArticles] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [newsData, eventsData] = await Promise.all([
          api.get('/news').catch(() => ({ articles: [] })),
          api.get('/events').catch(() => ({ events: [] })),
        ]);
        setArticles(newsData.articles || []);
        setEvents(eventsData.events || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto px-3 py-5">
      <h1 className="text-h1 mb-4">News and Events</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* News column */}
        <div className="lg:col-span-2">
          <h2 className="text-h2 mb-3">Latest News</h2>
          {loading ? <p className="text-slate-500 font-sans">Loading...</p> : (
            <div className="space-y-3">
              {articles.map(article => (
                <article key={article.id} className="bg-white rounded-card border border-line p-4 hover: transition-shadow duration-150">
                  <p className="text-[12px] font-sans text-slate-500 mb-1">{article.publish_date}</p>
                  <Link to={`/news/${article.slug}`} className="text-[18px] font-serif font-bold text-navy-900 hover:text-glacier-500 transition-colors duration-150">
                    {article.title}
                  </Link>
                  {article.title_hi && <p className="text-[14px] font-sans text-slate-500 mt-0.5">{article.title_hi}</p>}
                  <p className="text-[14px] font-sans text-slate-800 mt-2 leading-relaxed">{article.summary}</p>
                </article>
              ))}
              {!articles.length && <p className="text-slate-500 font-sans">No news articles available.</p>}
            </div>
          )}
        </div>

        {/* Events sidebar */}
        <aside>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-h2">Upcoming Events</h2>
            <a href={`${import.meta.env.VITE_API_URL || '/api/v1'}/events/export/ical`} className="text-[12px] font-sans text-glacier-500 hover:underline">
              Export iCal
            </a>
          </div>
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-card border border-line p-3 mb-2 hover: transition-shadow duration-150">
              <p className="text-[12px] font-sans text-aurora-500 font-bold">{event.start_date}{event.end_date && event.end_date !== event.start_date ? ` — ${event.end_date}` : ''}</p>
              <h3 className="text-[15px] font-serif font-bold text-navy-900 mt-1">{event.title}</h3>
              {event.location && <p className="text-[12px] font-sans text-slate-500 mt-0.5">{event.location}</p>}
              <p className="text-[13px] font-sans text-slate-800 mt-1">{(event.description || '').slice(0, 120)}</p>
            </div>
          ))}
          {!events.length && <p className="text-slate-500 font-sans text-[14px]">No upcoming events.</p>}
        </aside>
      </div>
    </div>
  );
}
