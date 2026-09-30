import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/client";

const typeLabels = {
  PAPER: "Research Paper", TECHNICAL_REPORT: "Technical Report",
  ANNUAL_REPORT: "Annual Report", NEWSLETTER: "Newsletter", BOOK: "Book",
};

export default function PublicationDetail() {
  const { slug } = useParams();
  const [pub, setPub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.get(`/publications/${slug}`);
        setPub(data.publication || data);
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) return (
    <div className="max-w-[900px] mx-auto px-3 py-8">
      <p className="text-slate-500 font-sans">Loading...</p>
    </div>
  );

  if (notFound || !pub) return (
    <div className="max-w-[900px] mx-auto px-3 py-8">
      <h1 className="text-h1 mb-3">Publication Not Found</h1>
      <p className="text-slate-500 font-sans mb-4">This publication could not be found.</p>
      <Link to="/publications" className="text-glacier-500 font-sans text-[14px] hover:underline">Back to Publications</Link>
    </div>
  );

  const apiBase = import.meta.env.VITE_API_URL || "/api/v1";

  return (
    <div className="max-w-[900px] mx-auto px-3 py-5">
      <Link to="/publications" className="text-glacier-500 font-sans text-[13px] hover:underline mb-4 inline-block">All Publications</Link>
      <div className="bg-white rounded-card border border-line p-5 mt-2">
        <span className="text-[11px] font-sans border border-glacier-700 text-glacier-700 px-2 py-0.5 rounded-[2px]">
          {typeLabels[pub.pub_type] || pub.pub_type}
        </span>
        <h1 className="text-[26px] font-serif font-bold text-navy-900 leading-tight mt-3 mb-2">{pub.title}</h1>
        {pub.authors && <p className="text-[15px] font-sans text-slate-700 mb-1"><span className="font-semibold">Authors:</span> {pub.authors}</p>}
        {(pub.journal || pub.year) && (
          <p className="text-[14px] font-sans text-slate-500 mb-1">
            {pub.journal && <span>{pub.journal}</span>}
            {pub.volume && <span>, Vol. {pub.volume}</span>}
            {pub.issue && <span>({pub.issue})</span>}
            {pub.pages && <span>, pp. {pub.pages}</span>}
            {pub.year && <span>, {pub.year}</span>}
          </p>
        )}
        {pub.doi && (
          <p className="text-[13px] font-sans text-slate-500 mb-1">
            DOI: <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="text-glacier-500 hover:underline">{pub.doi}</a>
          </p>
        )}
        {pub.keywords && (
          <div className="flex flex-wrap gap-1.5 mt-3 mb-4">
            {pub.keywords.split(",").map(k => k.trim()).filter(Boolean).map(k => (
              <span key={k} className="text-[11px] font-sans border border-line text-slate-500 px-2 py-0.5 rounded-[2px]">{k}</span>
            ))}
          </div>
        )}
        <div className="border-t border-line my-4" />
        {pub.abstract && (
          <div className="mb-4">
            <h2 className="text-[15px] font-serif font-bold text-navy-900 mb-2">Abstract</h2>
            <p className="text-[14px] font-sans text-slate-800 leading-relaxed">{pub.abstract}</p>
          </div>
        )}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-line">
          <span className="text-[13px] font-sans text-slate-500">Export:</span>
          <a href={`${apiBase}/publications/${pub.id}/pdf`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[13px] font-sans text-white bg-glacier-500 hover:bg-glacier-700 px-4 py-1.5 rounded-[4px] transition-colors duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}
