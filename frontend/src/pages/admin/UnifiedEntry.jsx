import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/client';

export default function UnifiedEntry() {
  const { user } = useOutletContext();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Expedition State
  const [useExpedition, setUseExpedition] = useState(false);
  const blankExpedition = { title: '', region: 'ANTARCTIC', year: new Date().getFullYear(), summary: '' };
  const [expeditionForm, setExpeditionForm] = useState(blankExpedition);

  // Dataset State
  const [useDataset, setUseDataset] = useState(false);
  const blankDataset = { title: '', discipline: 'Glaciology', format: 'CSV', access_level: 'PUBLIC', description: '', file_path: '' };
  const [datasetForm, setDatasetForm] = useState(blankDataset);

  // Publication State
  const [usePublication, setUsePublication] = useState(false);
  const blankPublication = { title: '', pub_type: 'PAPER', authors: '', year: new Date().getFullYear(), abstract: '', pdf_path: '' };
  const [publicationForm, setPublicationForm] = useState(blankPublication);

  // Media State
  const [useMedia, setUseMedia] = useState(false);
  const blankMedia = { title: '', media_type: 'PHOTO', description: '', file_path: '' };
  const [mediaForm, setMediaForm] = useState(blankMedia);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!useExpedition && !useDataset && !usePublication && !useMedia) {
      setMessage({ type: 'error', text: 'You must fill at least one section to submit a new entry.' });
      return;
    }

    setSaving(true);
    setMessage(null);
    let successCount = 0;
    const errors = [];

    try {
      if (useExpedition) {
        if (!expeditionForm.title) throw new Error("Expedition requires a title.");
        await api.post('/expeditions', expeditionForm);
        successCount++;
      }
      if (useDataset) {
        if (!datasetForm.title) throw new Error("Dataset requires a title.");
        await api.post('/datasets', datasetForm);
        successCount++;
      }
      if (usePublication) {
        if (!publicationForm.title) throw new Error("Publication requires a title.");
        await api.post('/publications', publicationForm);
        successCount++;
      }
      if (useMedia) {
        if (!mediaForm.title) throw new Error("Media requires a title.");
        await api.post('/media', mediaForm);
        successCount++;
      }

      const isEditor = user.role === 'EDITOR';
      setMessage({ 
        type: 'success', 
        text: `Successfully created ${successCount} record(s). ${isEditor ? 'They have been submitted for admin approval.' : ''}` 
      });

      // Reset forms
      setUseExpedition(false); setExpeditionForm(blankExpedition);
      setUseDataset(false); setDatasetForm(blankDataset);
      setUsePublication(false); setPublicationForm(blankPublication);
      setUseMedia(false); setMediaForm(blankMedia);

    } catch (err) {
      errors.push(err.message);
      setMessage({ type: 'error', text: `Errors occurred: ${errors.join(' | ')}` });
    }
    setSaving(false);
  };

  const numSections = [useExpedition, useDataset, usePublication, useMedia].filter(Boolean).length;

  return (
    <div className="max-w-[800px] mx-auto pb-24">
      <h1 className="text-h1 mb-2 text-navy-900">New Unified Entry</h1>
      <p className="text-[14px] font-sans text-slate-500 mb-5">
        Create a comprehensive entry spanning multiple content types.
      </p>

      {message && (
        <div className={`mb-5 px-3 py-2 rounded-card text-[13px] font-sans border ${message.type === 'success' ? 'bg-glacier-500/10 border-glacier-500 text-glacier-700' : 'bg-ember-500/10 border-ember-500 text-ember-500'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Expedition Section */}
        <div className={`bg-white border border-line transition-all duration-150 ${useExpedition ? 'border-l-[3px] border-l-glacier-500' : 'hover:bg-frost-50/50'}`}>
          <div className="flex items-center justify-between p-4">
            <div>
              <h2 className="text-[15px] font-serif font-bold text-navy-900">Expedition</h2>
              {!useExpedition && <p className="text-[12px] font-sans text-slate-500 mt-0.5">Details about a field campaign or research voyage.</p>}
            </div>
            <button type="button" onClick={() => setUseExpedition(!useExpedition)} className={`text-[13px] font-sans font-bold px-3 py-1.5 transition-colors duration-150 ${useExpedition ? 'text-ember-500 hover:text-ember-600' : 'text-glacier-500 hover:text-glacier-600'}`}>
              {useExpedition ? 'Remove section' : 'Add section'}
            </button>
          </div>
          {useExpedition && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Title *</label>
                  <input required value={expeditionForm.title} onChange={e => setExpeditionForm({...expeditionForm, title: e.target.value})} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans" />
                </div>
                <div>
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Region</label>
                  <select value={expeditionForm.region} onChange={e => setExpeditionForm({...expeditionForm, region: e.target.value})} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans">
                    <option value="ANTARCTIC">Antarctic</option><option value="ARCTIC">Arctic</option><option value="SOUTHERN_OCEAN">Southern Ocean</option><option value="HIMALAYA">Himalaya</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Year</label>
                  <input type="number" value={expeditionForm.year} onChange={e => setExpeditionForm({...expeditionForm, year: parseInt(e.target.value)})} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans" />
                </div>
                <div>
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Summary</label>
                  <textarea value={expeditionForm.summary} onChange={e => setExpeditionForm({...expeditionForm, summary: e.target.value})} rows={1} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-sans text-slate-800 mb-1">Upload Expedition Document</label>
                <input type="file" className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans file:mr-4 file:py-1 file:px-3 file:rounded-card file:border-0 file:text-[12px] file:font-sans file:bg-glacier-500/10 file:text-glacier-700 hover:file:bg-glacier-500/20" />
              </div>
            </div>
          )}
        </div>

        {/* Dataset Section */}
        <div className={`bg-white border border-line transition-all duration-150 ${useDataset ? 'border-l-[3px] border-l-glacier-500' : 'hover:bg-frost-50/50'}`}>
          <div className="flex items-center justify-between p-4">
            <div>
              <h2 className="text-[15px] font-serif font-bold text-navy-900">Dataset</h2>
              {!useDataset && <p className="text-[12px] font-sans text-slate-500 mt-0.5">Scientific data files and metadata records.</p>}
            </div>
            <button type="button" onClick={() => setUseDataset(!useDataset)} className={`text-[13px] font-sans font-bold px-3 py-1.5 transition-colors duration-150 ${useDataset ? 'text-ember-500 hover:text-ember-600' : 'text-glacier-500 hover:text-glacier-600'}`}>
              {useDataset ? 'Remove section' : 'Add section'}
            </button>
          </div>
          {useDataset && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Title *</label>
                  <input required value={datasetForm.title} onChange={e => setDatasetForm({...datasetForm, title: e.target.value})} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans" />
                </div>
                <div>
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Discipline</label>
                  <select value={datasetForm.discipline} onChange={e => setDatasetForm({...datasetForm, discipline: e.target.value})} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans">
                    <option value="Glaciology">Glaciology</option><option value="Meteorology">Meteorology</option><option value="Oceanography">Oceanography</option><option value="Biology">Biology</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Format</label>
                  <select value={datasetForm.format} onChange={e => setDatasetForm({...datasetForm, format: e.target.value})} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans">
                    <option value="CSV">CSV</option><option value="NetCDF">NetCDF</option><option value="GeoJSON">GeoJSON</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Description</label>
                  <textarea value={datasetForm.description} onChange={e => setDatasetForm({...datasetForm, description: e.target.value})} rows={1} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-sans text-slate-800 mb-1">Upload Dataset File</label>
                <input type="file" onChange={e => {
                  if (e.target.files[0]) setDatasetForm({...datasetForm, file_path: e.target.files[0].name});
                }} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans file:mr-4 file:py-1 file:px-3 file:rounded-card file:border-0 file:text-[12px] file:font-sans file:bg-glacier-500/10 file:text-glacier-700 hover:file:bg-glacier-500/20" />
              </div>
            </div>
          )}
        </div>

        {/* Publication Section */}
        <div className={`bg-white border border-line transition-all duration-150 ${usePublication ? 'border-l-[3px] border-l-glacier-500' : 'hover:bg-frost-50/50'}`}>
          <div className="flex items-center justify-between p-4">
            <div>
              <h2 className="text-[15px] font-serif font-bold text-navy-900">Publication</h2>
              {!usePublication && <p className="text-[12px] font-sans text-slate-500 mt-0.5">Research papers, technical reports, and documents.</p>}
            </div>
            <button type="button" onClick={() => setUsePublication(!usePublication)} className={`text-[13px] font-sans font-bold px-3 py-1.5 transition-colors duration-150 ${usePublication ? 'text-ember-500 hover:text-ember-600' : 'text-glacier-500 hover:text-glacier-600'}`}>
              {usePublication ? 'Remove section' : 'Add section'}
            </button>
          </div>
          {usePublication && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Title *</label>
                  <input required value={publicationForm.title} onChange={e => setPublicationForm({...publicationForm, title: e.target.value})} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans" />
                </div>
                <div>
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Type</label>
                  <select value={publicationForm.pub_type} onChange={e => setPublicationForm({...publicationForm, pub_type: e.target.value})} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans">
                    <option value="PAPER">Paper</option><option value="TECHNICAL_REPORT">Technical Report</option><option value="ANNUAL_REPORT">Annual Report</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Authors</label>
                  <input value={publicationForm.authors} onChange={e => setPublicationForm({...publicationForm, authors: e.target.value})} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans" />
                </div>
                <div>
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Year</label>
                  <input type="number" value={publicationForm.year} onChange={e => setPublicationForm({...publicationForm, year: parseInt(e.target.value)})} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans" />
                </div>
                <div>
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Abstract</label>
                  <textarea value={publicationForm.abstract} onChange={e => setPublicationForm({...publicationForm, abstract: e.target.value})} rows={1} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-sans text-slate-800 mb-1">Upload Document (PDF)</label>
                <input type="file" accept=".pdf" onChange={e => {
                  if (e.target.files[0]) setPublicationForm({...publicationForm, pdf_path: e.target.files[0].name});
                }} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans file:mr-4 file:py-1 file:px-3 file:rounded-card file:border-0 file:text-[12px] file:font-sans file:bg-glacier-500/10 file:text-glacier-700 hover:file:bg-glacier-500/20" />
              </div>
            </div>
          )}
        </div>

        {/* Media Section */}
        <div className={`bg-white border border-line transition-all duration-150 ${useMedia ? 'border-l-[3px] border-l-glacier-500' : 'hover:bg-frost-50/50'}`}>
          <div className="flex items-center justify-between p-4">
            <div>
              <h2 className="text-[15px] font-serif font-bold text-navy-900">Media</h2>
              {!useMedia && <p className="text-[12px] font-sans text-slate-500 mt-0.5">Photographs or video content for the gallery.</p>}
            </div>
            <button type="button" onClick={() => setUseMedia(!useMedia)} className={`text-[13px] font-sans font-bold px-3 py-1.5 transition-colors duration-150 ${useMedia ? 'text-ember-500 hover:text-ember-600' : 'text-glacier-500 hover:text-glacier-600'}`}>
              {useMedia ? 'Remove section' : 'Add section'}
            </button>
          </div>
          {useMedia && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Title *</label>
                  <input required value={mediaForm.title} onChange={e => setMediaForm({...mediaForm, title: e.target.value})} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans" />
                </div>
                <div>
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Type</label>
                  <select value={mediaForm.media_type} onChange={e => setMediaForm({...mediaForm, media_type: e.target.value})} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans">
                    <option value="PHOTO">Photo</option><option value="VIDEO">Video</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Upload Media File *</label>
                  <input type="file" required accept="image/*,video/*" onChange={e => {
                    if (e.target.files[0]) setMediaForm({...mediaForm, file_path: e.target.files[0].name});
                  }} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans file:mr-4 file:py-1 file:px-3 file:rounded-card file:border-0 file:text-[12px] file:font-sans file:bg-glacier-500/10 file:text-glacier-700 hover:file:bg-glacier-500/20" />
                </div>
                <div>
                  <label className="block text-[13px] font-sans text-slate-800 mb-1">Description</label>
                  <textarea value={mediaForm.description} onChange={e => setMediaForm({...mediaForm, description: e.target.value})} rows={1} className="w-full border border-line rounded-input px-3 py-2 text-[14px] font-sans" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer Bar */}
        <div className="fixed bottom-0 left-[230px] right-0 bg-white border-t border-line p-4 flex items-center justify-between z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="text-[13px] font-sans text-slate-500">
            {numSections} section{numSections !== 1 && 's'} included
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="text-[13px] font-sans font-bold text-slate-500 hover:text-navy-900 transition-colors">
              Save draft
            </button>
            <button type="submit" disabled={saving || numSections === 0} className="bg-navy-900 text-white font-sans text-[13px] font-bold px-5 py-2 hover:bg-navy-800 transition-colors duration-150 disabled:opacity-50">
              {saving ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
