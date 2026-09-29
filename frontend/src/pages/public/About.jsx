export default function About() {
  return (
    <div className="max-w-[1200px] mx-auto px-3 py-5">
      <h1 className="text-h1 mb-3">About PRISM</h1>

      <section className="bg-white rounded-card border border-line p-4 mb-4">
        <h2 className="text-h2 mb-2">Mandate</h2>
        <p className="text-[16px] font-sans text-slate-800 leading-relaxed">
          The National Centre for Polar and Ocean Research (PRISM) is an autonomous research institution under the Ministry of Earth Sciences, Government of India. Headquartered in Vasco da Gama, Goa, PRISM is responsible for planning, promoting, and executing the entire gamut of polar and ocean research activities of India.
        </p>
        <p className="text-[16px] font-sans text-slate-800 leading-relaxed mt-2">
          PRISM manages Indian research stations in the Arctic and Antarctic, leads scientific expeditions to the polar regions and Southern Ocean, and operates India's high-altitude cryosphere research station in the Himalaya. The centre also conducts ocean research programmes, including studies of the Indian Ocean and deep-sea mining exploration.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="text-h2 mb-3">Research Stations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <StationCard
            name="Himadri"
            location="Ny-Alesund, Svalbard, Norway"
            region="Arctic"
            year={2008}
            description="India's Arctic research station at the International Arctic Research Base. Himadri supports research in atmospheric science, glaciology, and marine biology in the Kongsfjorden region."
          />
          <StationCard
            name="Bharati"
            location="Larsemann Hills, East Antarctica"
            region="Antarctic"
            year={2012}
            description="India's second Antarctic research station is a modern facility built to withstand extreme polar conditions. It supports year-round research in geosciences, glaciology, and atmospheric studies."
          />
          <StationCard
            name="Maitri"
            location="Schirmacher Oasis, Antarctica"
            region="Antarctic"
            year={1989}
            description="India's first permanent Antarctic research station. Maitri has been the base for Indian scientific expeditions to Antarctica for over three decades."
          />
          <StationCard
            name="Himansh"
            location="Spiti Valley, Himachal Pradesh"
            region="Himalaya"
            year={2016}
            description="India's high-altitude cryosphere research station dedicated to monitoring Himalayan glaciers, snow cover, and permafrost dynamics."
          />
        </div>
      </section>

      <section className="bg-white rounded-card border border-line p-4">
        <h2 className="text-h2 mb-2">Research Disciplines</h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
          {['Glaciology', 'Atmospheric Science', 'Marine Biology', 'Oceanography', 'Geology and Geophysics', 'Climate Science'].map(d => (
            <li key={d} className="text-[14px] font-sans text-slate-800 border border-line rounded-card px-3 py-2">
              {d}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StationCard({ name, location, region, year, description }) {
  const regionColors = {
    Antarctic: 'border-glacier-700 text-glacier-700',
    Arctic: 'border-aurora-500 text-aurora-500',
    Himalaya: 'border-ember-500 text-ember-500',
  };
  return (
    <div className="bg-white rounded-card border border-line p-3 hover: transition-shadow duration-150">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-[18px] font-serif font-bold text-navy-900">{name}</h3>
        <span className={`text-[11px] font-sans border px-2 py-0.5 rounded-[2px] ${regionColors[region] || ''}`}>
          {region}
        </span>
      </div>
      <p className="text-slate-500 text-[13px] font-sans">{location} &middot; Established {year}</p>
      <p className="text-slate-800 text-[14px] font-sans leading-relaxed mt-2">{description}</p>
    </div>
  );
}
