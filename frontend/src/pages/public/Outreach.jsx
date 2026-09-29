import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Outreach() {
  const [resources, setResources] = useState([]);
  const [glossary, setGlossary] = useState([]);
  const [questionForm, setQuestionForm] = useState({ name: '', email: '', question: '' });
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('programmes');

  useEffect(() => {
    async function load() {
      try { const data = await api.get('/education'); setResources(data.resources || []); } catch {}
      try { const data = await api.get('/education/glossary'); setGlossary(data.terms || []); } catch {}
    }
    load();
  }, []);

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    try {
      await api.post('/education/questions', questionForm);
      setSubmitted(true);
      setQuestionForm({ name: '', email: '', question: '' });
    } catch (err) { alert(err.message); }
  };

  const tabs = [
    { id: 'programmes', label: 'Programmes' },
    { id: 'glossary', label: 'Glossary' },
    { id: 'ask', label: 'Ask a Polar Scientist' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-3 py-5">
      <h1 className="text-h1 mb-2">Outreach and Education</h1>
      <p className="text-[16px] font-sans text-slate-500 mb-4">Educational resources, glossary, and interactive programmes for students and the public.</p>

      <div className="flex items-center gap-0 border-b border-line mb-4">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-[14px] font-sans transition-colors duration-150 border-b-2 ${activeTab === tab.id ? 'text-navy-900 border-glacier-500 font-bold' : 'text-slate-500 border-transparent hover:text-slate-800'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'programmes' && (
        <div>
          <h2 className="text-h2 mb-3">Educational Resources</h2>
          {resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {resources.map(r => (
                <div key={r.id} className="bg-white rounded-card border border-line p-3 hover: transition-shadow duration-150">
                  <span className="text-[11px] font-sans border border-aurora-500 text-aurora-500 px-2 py-0.5 rounded-[2px]">{r.resource_type}</span>
                  <h3 className="text-[16px] font-serif font-bold text-navy-900 mt-2">{r.title}</h3>
                  <p className="text-[13px] font-sans text-slate-500 mt-1">{r.description}</p>
                  {r.target_audience && <p className="text-[12px] font-sans text-slate-500 mt-1">Audience: {r.target_audience}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-card border border-line p-4">
              <p className="text-[14px] font-sans text-slate-800">Educational programmes including school workshops, lecture series, and downloadable teaching kits are being developed. Check back for updates.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'glossary' && (
        <div>
          <h2 className="text-h2 mb-3">Glossary of Polar Terms</h2>
          <div className="bg-white rounded-card border border-line overflow-hidden">
            {glossary.map((term, i) => (
              <div key={term.id} className={`px-4 py-3 ${i < glossary.length - 1 ? 'border-b border-line' : ''}`}>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-[16px] font-serif font-bold text-navy-900">{term.term}</h3>
                  {term.term_hi && <span className="text-[13px] font-sans text-slate-500">({term.term_hi})</span>}
                  {term.category && <span className="text-[11px] font-sans border border-line text-slate-500 px-2 py-0.5 rounded-[2px]">{term.category}</span>}
                </div>
                <p className="text-[14px] font-sans text-slate-800 mt-1 leading-relaxed">{term.definition}</p>
                {term.definition_hi && <p className="text-[13px] font-sans text-slate-500 mt-1">{term.definition_hi}</p>}
              </div>
            ))}
            {!glossary.length && <p className="px-4 py-3 text-slate-500 font-sans">No glossary terms available.</p>}
          </div>
        </div>
      )}

      {activeTab === 'ask' && (
        <div className="max-w-[500px]">
          <h2 className="text-h2 mb-3">Ask a Polar Scientist</h2>
          {submitted ? (
            <div className="bg-white rounded-card border border-line p-4">
              <p className="text-[16px] font-sans text-slate-800">Thank you for your question. It has been submitted for moderation and will be answered by our scientists.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitQuestion} className="bg-white rounded-card border border-line p-4">
              <p className="text-[14px] font-sans text-slate-500 mb-3">Submit a question about polar science. All questions are moderated before a response is published.</p>
              <div className="mb-3">
                <label htmlFor="q-name" className="block text-[14px] font-sans text-slate-800 mb-1">Your name</label>
                <input id="q-name" type="text" required value={questionForm.name} onChange={e => setQuestionForm({ ...questionForm, name: e.target.value })}
                  className="w-full border border-line rounded-input px-2 py-1 text-[14px] font-sans" />
              </div>
              <div className="mb-3">
                <label htmlFor="q-email" className="block text-[14px] font-sans text-slate-800 mb-1">Email</label>
                <input id="q-email" type="email" required value={questionForm.email} onChange={e => setQuestionForm({ ...questionForm, email: e.target.value })}
                  className="w-full border border-line rounded-input px-2 py-1 text-[14px] font-sans" />
              </div>
              <div className="mb-3">
                <label htmlFor="q-question" className="block text-[14px] font-sans text-slate-800 mb-1">Your question</label>
                <textarea id="q-question" rows="4" required value={questionForm.question} onChange={e => setQuestionForm({ ...questionForm, question: e.target.value })}
                  className="w-full border border-line rounded-input px-2 py-1 text-[14px] font-sans" />
              </div>
              <button type="submit" className="bg-glacier-500 text-white font-sans text-[14px] px-4 py-1 rounded-card hover:bg-glacier-700 transition-colors duration-150">Submit Question</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
