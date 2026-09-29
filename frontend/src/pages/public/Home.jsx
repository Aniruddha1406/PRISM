import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function Home() {
  const [stats, setStats] = useState({ expeditions: 0, datasets: 0, publications: 0, media: 0 });
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.get('/stats');
        setStats(data);
      } catch {
        // Stats endpoint may not exist yet — use placeholders
        setStats({ expeditions: 43, datasets: 120, publications: 350, media: 2500 });
      }
      try {
        const data = await api.get('/news?status=PUBLISHED&limit=3');
        setLatestNews(data.articles || []);
      } catch {
        setLatestNews([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero section */}
      <section className="relative h-[480px] bg-navy-900 overflow-hidden">
        {/* Scrim overlay */}
        <div className="absolute inset-0 scrim" />
        
        <div className="relative z-10 max-w-[1200px] mx-auto px-3 h-full flex flex-col justify-end pb-6">
          <h1 className="text-white font-serif text-h1 font-bold max-w-[600px]">
            India's Polar and Ocean Research
          </h1>
          <p className="text-white/90 font-sans text-[16px] mt-2 max-w-[540px]">
            Advancing scientific knowledge of the Arctic, Antarctic, Southern Ocean, and Himalayan cryosphere through sustained research programmes and expeditions.
          </p>

          {/* Glass search panel */}
          <div className="glass-dark mt-4 px-3 py-2 max-w-[540px] flex items-center gap-2">
            <label htmlFor="hero-search" className="sr-only">Search the portal</label>
            <input
              id="hero-search"
              type="search"
              placeholder="Search expeditions, datasets, publications, media..."
              className="flex-grow bg-transparent text-white placeholder-white/50 font-sans text-[14px] outline-none border-none"
            />
            <Link
              to="/search"
              className="text-white text-[14px] font-sans px-3 py-1 bg-glacier-500 rounded-card hover:bg-glacier-700 transition-colors duration-150"
            >
              Search
            </Link>
          </div>

          {/* Glass counter strip */}
          <div className="glass-dark mt-3 px-4 py-2 flex items-center gap-5 max-w-[540px]">
            <CounterItem label="Expeditions" value={stats.expeditions} />
            <div className="w-px h-5 bg-white/30" />
            <CounterItem label="Datasets" value={stats.datasets} />
            <div className="w-px h-5 bg-white/30" />
            <CounterItem label="Publications" value={stats.publications} />
            <div className="w-px h-5 bg-white/30" />
            <CounterItem label="Media Items" value={stats.media} />
          </div>
        </div>
      </section>

      {/* Content sections on solid frost-50 */}
      <div className="max-w-[1200px] mx-auto px-3 py-5">
        {/* Latest expeditions */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-h2">Latest Expeditions</h2>
            <Link to="/expeditions" className="text-glacier-500 font-sans text-[14px] hover:underline transition-colors duration-150">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ExpeditionCard
              title="43rd ISEA"
              region="Antarctic"
              year="2023-24"
              summary="Multi-disciplinary research at Bharati and Maitri stations covering atmospheric sciences, glaciology, and marine biology."
              slug="isea-43"
            />
            <ExpeditionCard
              title="Arctic Summer Campaign 2024"
              region="Arctic"
              year="2024"
              summary="Research at Himadri station including glacier mass balance studies and Kongsfjorden ecosystem observations."
              slug="arctic-summer-2024"
            />
            <ExpeditionCard
              title="Himalayan Cryosphere Monitoring"
              region="Himalaya"
              year="2024"
              summary="Continuous glacier and permafrost monitoring at Himansh station in Spiti Valley."
              slug="himalaya-cryo-2024"
            />
          </div>
        </section>

        {/* Featured highlights */}
        <section className="mb-6">
          <h2 className="text-h2 mb-3">Research Stations</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <StationCard name="Himadri" location="Ny-Alesund, Svalbard" region="Arctic" year={2008} />
            <StationCard name="Bharati" location="Larsemann Hills" region="Antarctic" year={2012} />
            <StationCard name="Maitri" location="Schirmacher Oasis" region="Antarctic" year={1989} />
            <StationCard name="Himansh" location="Spiti Valley" region="Himalaya" year={2016} />
          </div>
        </section>

        {/* Latest publications */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-h2">Latest Publications</h2>
            <Link to="/publications" className="text-glacier-500 font-sans text-[14px] hover:underline transition-colors duration-150">
              View all
            </Link>
          </div>
          <div className="bg-white rounded-card border border-line">
            <PublicationRow
              title="Glacier Mass Balance Observations in Svalbard: A Decadal Assessment"
              authors="Thamban M., Kumar S., Sharma P."
              journal="Journal of Glaciology, 2024"
              type="Paper"
            />
            <PublicationRow
              title="NCPOR Annual Report 2023-24"
              authors="NCPOR"
              journal=""
              type="Annual Report"
              isLast
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function CounterItem({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-white font-serif text-[22px] font-bold">{value}</div>
      <div className="text-white/70 font-sans text-[11px]">{label}</div>
    </div>
  );
}

function ExpeditionCard({ title, region, year, summary, slug }) {
  const regionColors = {
    Antarctic: 'bg-glacier-700',
    Arctic: 'bg-aurora-500',
    Himalaya: 'bg-ember-500',
  };
  return (
    <Link to={`/expeditions/${slug}`} className="block bg-white rounded-card border border-line hover:shadow-hover transition-shadow duration-150">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className={`${regionColors[region] || 'bg-glacier-700'} text-white text-[11px] font-sans px-2 py-0.5 rounded-full`}>
            {region}
          </span>
          <span className="text-slate-500 text-[12px] font-sans">{year}</span>
        </div>
        <h3 className="text-[16px] font-serif font-bold text-navy-900 mb-1">{title}</h3>
        <p className="text-slate-500 text-[13px] font-sans leading-relaxed">{summary}</p>
      </div>
    </Link>
  );
}

function StationCard({ name, location, region, year }) {
  return (
    <div className="bg-white rounded-card border border-line p-3 hover:shadow-hover transition-shadow duration-150">
      <h3 className="text-[16px] font-serif font-bold text-navy-900">{name}</h3>
      <p className="text-slate-500 text-[13px] font-sans mt-1">{location}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[11px] font-sans text-glacier-700 border border-glacier-700 px-2 py-0.5 rounded-full">{region}</span>
        <span className="text-slate-500 text-[11px] font-sans">Est. {year}</span>
      </div>
    </div>
  );
}

function PublicationRow({ title, authors, journal, type, isLast }) {
  return (
    <div className={`px-3 py-2 ${!isLast ? 'border-b border-line' : ''} hover:bg-frost-50 transition-colors duration-150`}>
      <div className="flex items-start justify-between">
        <div className="flex-grow">
          <h3 className="text-[15px] font-serif font-bold text-navy-900">{title}</h3>
          <p className="text-slate-500 text-[13px] font-sans mt-0.5">
            {authors}{journal ? ` — ${journal}` : ''}
          </p>
        </div>
        <span className="text-[11px] font-sans text-glacier-700 border border-glacier-700 px-2 py-0.5 rounded-full ml-2 whitespace-nowrap">
          {type}
        </span>
      </div>
    </div>
  );
}
