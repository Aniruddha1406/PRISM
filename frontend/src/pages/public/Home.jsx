import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function Home() {
  const [stats, setStats] = useState({ expeditions: 0, datasets: 0, publications: 0, media: 0 });
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.get('/stats');
        setStats(data);
      } catch {
        setStats({ expeditions: 43, datasets: 120, publications: 350, media: 2500 });
      }
      try {
        const pubData = await api.get('/publications?limit=2');
        setPublications(pubData.publications || []);
      } catch {
        setPublications([
          { id: '1', title: 'Glacier Mass Balance Observations in Svalbard: A Decadal Assessment', authors: 'Thamban M., Kumar S., Sharma P.', journal: 'Journal of Glaciology, 2024', pub_type: 'PAPER' },
          { id: '2', title: 'PRISM Annual Report 2023-24', authors: 'PRISM', journal: '', pub_type: 'ANNUAL_REPORT' },
        ]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero section */}
      <section className="relative h-[520px] overflow-hidden">
        <div className="relative z-10 max-w-[1200px] mx-auto px-3 h-full flex flex-col justify-start pt-10">
          <h1 className="text-navy-900 font-serif text-[56px] font-bold max-w-[700px] leading-none tracking-wide">
            PRISM
            <span className="block text-[28px] font-normal text-navy-900/80 tracking-normal leading-snug mt-1">Polar Research Information Science Media</span>
          </h1>
          <p className="text-slate-800 font-sans font-semibold text-[16px] mt-4 max-w-[540px]">
            Advancing scientific knowledge of the Arctic, Antarctic, Southern Ocean, and Himalayan cryosphere through sustained research programmes and expeditions.
          </p>

          {/* Glass search panel */}
          <div className="glass-navy mt-4 px-3 py-2 max-w-[540px] flex items-center gap-2">
            <label htmlFor="hero-search" className="sr-only">Search the portal</label>
            <input
              id="hero-search"
              type="search"
              placeholder="Search expeditions, datasets, publications, media..."
              className="flex-grow bg-transparent text-white placeholder-white/50 font-sans text-[14px] outline-none border-none"
            />
            <Link
              to="/search"
              className="text-white text-[14px] font-sans px-3 py-1 bg-glacier-500 rounded-[4px] hover:bg-glacier-700 transition-colors duration-150"
            >
              Search
            </Link>
          </div>

          {/* Glass counter strip */}
          <div className="glass-navy mt-3 px-4 py-2 flex items-center gap-5 max-w-[540px]">
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

      {/* Content sections on glass reading panel */}
      <div className="max-w-[1200px] mx-auto px-3 py-5">
        <div className="panel-reading">

          {/* Latest from the field */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-h2">Latest from the Field</h2>
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
                image="/assets/south_pole_2010-640.webp"
              />
              <ExpeditionCard
                title="Arctic Summer Campaign 2024"
                region="Arctic"
                year="2024"
                summary="Research at Himadri station including glacier mass balance studies and Kongsfjorden ecosystem observations."
                slug="arctic-summer-2024"
                image="/assets/orv_sagar_kanya-640.webp"
              />
              <ExpeditionCard
                title="Himalayan Cryosphere Monitoring"
                region="Himalaya"
                year="2024"
                summary="Continuous glacier and permafrost monitoring at Himansh station in Spiti Valley."
                slug="himalaya-cryo-2024"
                image="/assets/ice_drilling-640.webp"
              />
            </div>
          </section>

          {/* Research Stations */}
          <section className="mb-6">
            <h2 className="text-h2 mb-3">Research Stations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <StationCard name="Himadri" location="Ny-Alesund, Svalbard" region="Arctic" year={2008} image="/assets/ncpor_campus-640.webp" />
              <StationCard name="Bharati" location="Larsemann Hills" region="Antarctic" year={2012} image="/assets/expedition_40-640.webp" />
              <StationCard name="Maitri" location="Schirmacher Oasis" region="Antarctic" year={1989} image="/assets/multinational_team-640.webp" />
              <StationCard name="Himansh" location="Spiti Valley" region="Himalaya" year={2016} image="/assets/ncpor_staff-640.webp" />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Latest publications */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-h2">Latest Publications</h2>
                <Link to="/publications" className="text-glacier-500 font-sans text-[14px] hover:underline transition-colors duration-150">
                  View all
                </Link>
              </div>
              <div className="bg-white rounded-[4px] border border-line">
                {publications.length === 0 ? (
                  <p className="text-[13px] font-sans text-slate-500 p-3">Loading publications...</p>
                ) : publications.map((pub, idx) => (
                  <PublicationRow
                    key={pub.id}
                    title={pub.title}
                    authors={pub.authors}
                    journal={pub.journal ? `${pub.journal}${pub.year ? `, ${pub.year}` : ''}` : (pub.year ? String(pub.year) : '')}
                    type={pub.pub_type?.replace(/_/g, ' ')}
                    isLast={idx === publications.length - 1}
                  />
                ))}
              </div>
            </section>

            {/* Media Highlight — fixed height grid so images fit properly */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-h2">Media Highlight</h2>
                <Link to="/media" className="text-glacier-500 font-sans text-[14px] hover:underline transition-colors duration-150">
                  Gallery
                </Link>
              </div>
              <div className="grid grid-cols-3 grid-rows-2 gap-2 h-[280px]">
                {/* Large left image spanning both rows */}
                <div className="row-span-2 col-span-2 overflow-hidden rounded-[4px] border border-line">
                  <img src="/assets/sa_agulhas-640.webp" alt="Researchers in front of the S.A. Agulhas" className="w-full h-full object-cover" />
                </div>
                {/* Top right */}
                <div className="overflow-hidden rounded-[4px] border border-line">
                  <img src="/assets/polar_team-640.webp" alt="Polar research team" className="w-full h-full object-cover" />
                </div>
                {/* Bottom right */}
                <div className="overflow-hidden rounded-[4px] border border-line">
                  <img src="/assets/ncpor_campus-640.webp" alt="PRISM Campus entrance" className="w-full h-full object-cover" />
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}

function CounterItem({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-white font-mono text-[22px] font-bold">{value}</div>
      <div className="text-white/70 font-sans text-[11px]">{label}</div>
    </div>
  );
}

function ExpeditionCard({ title, region, year, summary, slug, image }) {
  const regionColors = {
    Antarctic: 'bg-glacier-700',
    Arctic: 'bg-aurora-500',
    Himalaya: 'bg-ember-500',
  };
  return (
    <Link to={`/expeditions/${slug}`} className="block bg-white rounded-[4px] border border-line hover: transition-shadow duration-150">
      {image && (
        <div className="aspect-[16/9] w-full overflow-hidden rounded-t-[3px]">
          <img src={image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className={`${regionColors[region] || 'bg-glacier-700'} text-white text-[11px] font-sans px-2 py-0.5 rounded-[2px]`}>
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

function StationCard({ name, location, region, year, image }) {
  return (
    <div className="bg-white rounded-[4px] border border-line hover: transition-shadow duration-150">
      {image && (
        <div className="aspect-[4/3] w-full overflow-hidden rounded-t-[3px]">
          <img src={image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-3">
        <h3 className="text-[16px] font-serif font-bold text-navy-900">{name}</h3>
        <p className="text-slate-500 text-[13px] font-sans mt-1">{location}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[11px] font-sans text-glacier-700 border border-glacier-700 px-2 py-0.5 rounded-[2px]">{region}</span>
          <span className="text-slate-500 text-[11px] font-sans">Est. {year}</span>
        </div>
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
        <span className="text-[11px] font-sans text-glacier-700 border border-glacier-700 px-2 py-0.5 rounded-[2px] ml-2 whitespace-nowrap">
          {type}
        </span>
      </div>
    </div>
  );
}
