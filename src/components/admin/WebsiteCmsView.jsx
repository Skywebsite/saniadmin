import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Image as ImageIcon, 
  Film, 
  Upload, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  ExternalLink,
  Edit3,
  Phone,
  Building,
  Layers,
  MapPin,
  RefreshCw,
  Eye
} from 'lucide-react';
import { 
  fetchContentFromAPI, 
  saveContentToAPI, 
  fetchAllMedia, 
  uploadMediaToAPI, 
  DEFAULT_CONTENT 
} from '../../services/cmsService';

export default function WebsiteCmsView() {
  const [activeSubTab, setActiveSubTab] = useState('media'); // 'media' | 'hero' | 'about' | 'clubhouse' | 'contact'
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [mediaList, setMediaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const [pendingUploadTarget, setPendingUploadTarget] = useState(null);

  useEffect(() => {
    loadCMSData();
  }, []);

  const loadCMSData = async () => {
    setIsLoading(true);
    try {
      const [fetchedContent, fetchedMedia] = await Promise.all([
        fetchContentFromAPI(),
        fetchAllMedia()
      ]);
      if (fetchedContent) setContent(fetchedContent);
      if (fetchedMedia && fetchedMedia.data) setMediaList(fetchedMedia.data);
    } catch (err) {
      console.warn('Error loading CMS data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContent = async () => {
    setIsSaving(true);
    setErrorMsg('');
    setSaveSuccess(false);

    try {
      const res = await saveContentToAPI(content);
      if (res && res.success !== false) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMsg(res?.message || 'Failed to save website content to database');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error saving content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerUpload = (targetKey, category, title, resourceType) => {
    setPendingUploadTarget({ key: targetKey, category, title, resourceType });
    if (fileInputRef.current) {
      fileInputRef.current.accept = resourceType === 'video' ? 'video/*' : 'image/*';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !pendingUploadTarget) return;

    setUploadingKey(pendingUploadTarget.key);
    setErrorMsg('');

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result;
        const uploadRes = await uploadMediaToAPI({
          key: pendingUploadTarget.key,
          file: base64Data,
          title: pendingUploadTarget.title,
          category: pendingUploadTarget.category,
          resourceType: pendingUploadTarget.resourceType || (file.type.startsWith('video') ? 'video' : 'image')
        });

        if (uploadRes.success) {
          await loadCMSData();
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        } else {
          setErrorMsg(uploadRes.message || 'Cloudinary upload failed');
        }
        setUploadingKey(null);
        setPendingUploadTarget(null);
      };
    } catch (err) {
      setErrorMsg(err.message || 'File reading error');
      setUploadingKey(null);
      setPendingUploadTarget(null);
    }
    e.target.value = '';
  };

  const getMediaUrl = (key, fallback = '') => {
    const item = mediaList.find((m) => m.key === key);
    return item?.cloudinaryUrl || fallback;
  };

  if (isLoading) {
    return (
      <div className="empty-state" style={{ minHeight: '400px' }}>
        <Loader2 size={36} className="animate-spin text-teal-600" />
        <div style={{ fontWeight: 700, marginTop: '1rem' }}>Loading Website CMS &amp; Cloud Assets...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Hidden File Input for Cloudinary Uploads */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileSelected} 
      />

      {/* Top CMS Header */}
      <div className="table-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="table-title" style={{ fontSize: '1.25rem' }}>
              <Globe size={20} className="text-cyan-500" />
              <span>Live Website CMS &amp; Media Studio</span>
              <span className="live-indicator" style={{ marginLeft: '0.5rem' }}>
                <span className="live-dot" />
                <span>Sync Active</span>
              </span>
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
              Update real-time copy, hero slogans, pricing, contact numbers and upload 4K images/videos to Cloudinary CDN.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={loadCMSData}
              title="Refresh from MongoDB"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>

            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <span>Preview Site</span>
              <ExternalLink size={13} />
            </a>

            <button
              className="btn btn-primary"
              onClick={handleSaveContent}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving to Cloud...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save &amp; Publish Website</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {saveSuccess && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#dcfce7', border: '1.5px solid #86efac', borderRadius: '8px', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
            <CheckCircle size={16} />
            <span>Success! Website changes published and saved to MongoDB &amp; Cloudinary CDN!</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#fee2e2', border: '1.5px solid #fca5a5', borderRadius: '8px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Sub Tabs Navigation */}
      <div className="nav-tabs" style={{ alignSelf: 'flex-start' }}>
        <button
          className={`nav-tab-btn ${activeSubTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('media')}
        >
          <ImageIcon size={15} />
          <span>🖼️ Media &amp; Cloudinary Assets</span>
        </button>

        <button
          className={`nav-tab-btn ${activeSubTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('hero')}
        >
          <Sparkles size={15} />
          <span>✨ Hero &amp; Headline Copy</span>
        </button>

        <button
          className={`nav-tab-btn ${activeSubTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('about')}
        >
          <Building size={15} />
          <span>🏢 About &amp; Township Stats</span>
        </button>

        <button
          className={`nav-tab-btn ${activeSubTab === 'clubhouse' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('clubhouse')}
        >
          <Layers size={15} />
          <span>🏊 Clubhouse &amp; Amenities</span>
        </button>

        <button
          className={`nav-tab-btn ${activeSubTab === 'contact' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('contact')}
        >
          <Phone size={15} />
          <span>📞 Contact &amp; Location Details</span>
        </button>
      </div>

      {/* TAB 1: MEDIA ASSETS STUDIO */}
      {activeSubTab === 'media' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Brand & Hero Media Grid */}
          <div className="table-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ImageIcon size={18} className="text-cyan-600" />
              <span>Core Brand &amp; Hero Background Media</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {/* Brand Logo */}
              <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span className="stat-label">Main Brand Logo</span>
                  <span className="brand-badge admin-badge">Logo</span>
                </div>
                <div style={{ width: '100%', height: '80px', background: '#0b132b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                  <img src={getMediaUrl('logo', '/ambhuja-logo.png')} alt="Logo" style={{ maxHeight: '60px', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleTriggerUpload('logo', 'logo', 'Maytri Ambhuja Brand Logo', 'image')}
                  disabled={uploadingKey === 'logo'}
                >
                  {uploadingKey === 'logo' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  <span>{uploadingKey === 'logo' ? 'Uploading...' : 'Replace Logo on Cloud'}</span>
                </button>
              </div>

              {/* Sanghi City Logo */}
              <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span className="stat-label">Sanghi City Navbar Logo</span>
                  <span className="brand-badge emp-badge">Navbar Right</span>
                </div>
                <div style={{ width: '100%', height: '80px', background: '#0b132b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                  <img src={getMediaUrl('sanghiLogo', '/sanghicity-logo.png')} alt="Sanghi Logo" style={{ maxHeight: '55px', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleTriggerUpload('sanghiLogo', 'logo', 'Sanghi City Logo', 'image')}
                  disabled={uploadingKey === 'sanghiLogo'}
                >
                  {uploadingKey === 'sanghiLogo' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  <span>{uploadingKey === 'sanghiLogo' ? 'Uploading...' : 'Replace Sanghi Logo'}</span>
                </button>
              </div>

              {/* Hero Background Poster */}
              <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span className="stat-label">Hero Poster / Cover</span>
                  <span className="brand-badge admin-badge">Image</span>
                </div>
                <div style={{ width: '100%', height: '80px', background: '#0b132b', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={getMediaUrl('heroPoster', '/hero-bg.png')} alt="Hero Poster" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleTriggerUpload('heroPoster', 'image', 'Hero Background Poster', 'image')}
                  disabled={uploadingKey === 'heroPoster'}
                >
                  {uploadingKey === 'heroPoster' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  <span>{uploadingKey === 'heroPoster' ? 'Uploading...' : 'Upload Hero Poster'}</span>
                </button>
              </div>

              {/* Hero Video Background */}
              <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span className="stat-label">Hero 4K Streaming Video</span>
                  <span className="brand-badge emp-badge">Video (MP4)</span>
                </div>
                <div style={{ width: '100%', height: '80px', background: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Film size={28} className="text-teal-400" />
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleTriggerUpload('heroVideo', 'video', 'Hero Background Video', 'video')}
                  disabled={uploadingKey === 'heroVideo'}
                >
                  {uploadingKey === 'heroVideo' ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  <span>{uploadingKey === 'heroVideo' ? 'Uploading Video...' : 'Upload Video to Cloud'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Clubhouse & Amenities Showcase Gallery 001 - 010 */}
          <div className="table-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} className="text-cyan-600" />
                <span>Clubhouse Showcase Gallery (Images 001 – 010)</span>
              </h3>
              <span className="table-badge-count">10 Gallery Units</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {[
                { key: 'gallery001', title: 'Grand Clubhouse Architecture' },
                { key: 'gallery002', title: 'Infinity Lap Pool' },
                { key: 'gallery003', title: 'Wellness Spa & Steam' },
                { key: 'gallery004', title: 'Grand Celebration Banquet' },
                { key: 'gallery005', title: 'Multi-Sport Arena' },
                { key: 'gallery006', title: 'Executive Guest Suites' },
                { key: 'gallery007', title: 'Children Activity Creche' },
                { key: 'gallery008', title: 'Dolby Atmos 4K Theatre' },
                { key: 'gallery009', title: 'Technogym Fitness Center' },
                { key: 'gallery010', title: 'Rooftop Starlit Sky Lounge' }
              ].map((item, idx) => {
                const imgUrl = getMediaUrl(item.key);
                return (
                  <div key={item.key} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>#{idx + 1} {item.title}</span>
                      <span className="brand-badge emp-badge">00{idx + 1}</span>
                    </div>

                    <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', background: '#0f172a' }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', marginTop: '4px' }}
                      onClick={() => handleTriggerUpload(item.key, 'image', item.title, 'image')}
                      disabled={uploadingKey === item.key}
                    >
                      {uploadingKey === item.key ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      <span>{uploadingKey === item.key ? 'Uploading...' : 'Replace Image'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floor Plans Manager (222 SQ YDS East Facing) */}
          <div className="table-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={18} className="text-cyan-600" />
                <span>222 SQ YDS East Facing Villa Floor Plans</span>
              </h3>
              <span className="table-badge-count">3 Floor Levels</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {[
                { key: 'floorplan_222_east_ground', title: 'Ground Floor Plan', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788858229/maytri_ambhuja/floorplans/222_east_ground.webp', sft: '1397.37 SFT' },
                { key: 'floorplan_222_east_first', title: 'First Floor Plan', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788858230/maytri_ambhuja/floorplans/222_east_first.webp', sft: '1397.371 SFT' },
                { key: 'floorplan_222_east_terrace', title: 'Terrace Floor Plan', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788858231/maytri_ambhuja/floorplans/222_east_terrace.webp', sft: '561.55 SFT' },
              ].map((item) => {
                const imgUrl = getMediaUrl(item.key, item.fallback);
                return (
                  <div key={item.key} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{item.title}</span>
                      <span className="brand-badge admin-badge">{item.sft}</span>
                    </div>

                    <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={imgUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', marginTop: '4px' }}
                      onClick={() => handleTriggerUpload(item.key, 'floorplans', item.title, 'image')}
                      disabled={uploadingKey === item.key}
                    >
                      {uploadingKey === item.key ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      <span>{uploadingKey === item.key ? 'Uploading...' : 'Replace Floor Plan'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floor Plans Manager (222 SQ YDS West Facing) */}
          <div className="table-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={18} className="text-cyan-600" />
                <span>222 SQ YDS West Facing Villa Floor Plans</span>
              </h3>
              <span className="table-badge-count">3 Floor Levels</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {[
                { key: 'floorplan_222_west_ground', title: 'Ground Floor Plan', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788859741/maytri_ambhuja/floorplans/222_west_ground.jpg', sft: '1397.37 SFT' },
                { key: 'floorplan_222_west_first', title: 'First Floor Plan', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788859742/maytri_ambhuja/floorplans/222_west_first.jpg', sft: '1397.371 SFT' },
                { key: 'floorplan_222_west_terrace', title: 'Terrace Floor Plan', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788859743/maytri_ambhuja/floorplans/222_west_terrace.jpg', sft: '561.55 SFT' },
              ].map((item) => {
                const imgUrl = getMediaUrl(item.key, item.fallback);
                return (
                  <div key={item.key} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{item.title}</span>
                      <span className="brand-badge emp-badge">{item.sft}</span>
                    </div>

                    <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={imgUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', marginTop: '4px' }}
                      onClick={() => handleTriggerUpload(item.key, 'floorplans', item.title, 'image')}
                      disabled={uploadingKey === item.key}
                    >
                      {uploadingKey === item.key ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      <span>{uploadingKey === item.key ? 'Uploading...' : 'Replace Floor Plan'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floor Plans Manager (300 SQ YDS East Facing) */}
          <div className="table-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={18} className="text-cyan-600" />
                <span>300 SQ YDS East Facing Villa Floor Plans</span>
              </h3>
              <span className="table-badge-count">3 Floor Levels</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {[
                { key: 'floorplan_300_east_ground', title: 'Ground Floor Plan', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788860148/maytri_ambhuja/floorplans/300_east_ground.jpg', sft: '1850.50 SFT' },
                { key: 'floorplan_300_east_first', title: 'First Floor Plan', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788860149/maytri_ambhuja/floorplans/300_east_first.jpg', sft: '1850.50 SFT' },
                { key: 'floorplan_300_east_terrace', title: 'Terrace Floor Plan', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788860150/maytri_ambhuja/floorplans/300_east_terrace.jpg', sft: '820.00 SFT' },
              ].map((item) => {
                const imgUrl = getMediaUrl(item.key, item.fallback);
                return (
                  <div key={item.key} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{item.title}</span>
                      <span className="brand-badge admin-badge">{item.sft}</span>
                    </div>

                    <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={imgUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', marginTop: '4px' }}
                      onClick={() => handleTriggerUpload(item.key, 'floorplans', item.title, 'image')}
                      disabled={uploadingKey === item.key}
                    >
                      {uploadingKey === item.key ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      <span>{uploadingKey === item.key ? 'Uploading...' : 'Replace Floor Plan'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Floor Plans Manager (300 SQ YDS West Facing) */}
          <div className="table-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={18} className="text-cyan-600" />
                <span>300 SQ YDS West Facing Villa Floor Plans</span>
              </h3>
              <span className="table-badge-count">3 Floor Levels</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {[
                { key: 'floorplan_300_west_ground', title: 'Ground Floor Plan', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788860555/maytri_ambhuja/floorplans/300_west_ground.jpg', sft: '1850.50 SFT' },
                { key: 'floorplan_300_west_first', title: 'First Floor Plan', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788860556/maytri_ambhuja/floorplans/300_west_first.jpg', sft: '1850.50 SFT' },
                { key: 'floorplan_300_west_terrace', title: 'Terrace Floor Plan', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788860557/maytri_ambhuja/floorplans/300_west_terrace.jpg', sft: '820.00 SFT' },
              ].map((item) => {
                const imgUrl = getMediaUrl(item.key, item.fallback);
                return (
                  <div key={item.key} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{item.title}</span>
                      <span className="brand-badge emp-badge">{item.sft}</span>
                    </div>

                    <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={imgUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', marginTop: '4px' }}
                      onClick={() => handleTriggerUpload(item.key, 'floorplans', item.title, 'image')}
                      disabled={uploadingKey === item.key}
                    >
                      {uploadingKey === item.key ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      <span>{uploadingKey === item.key ? 'Uploading...' : 'Replace Floor Plan'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clubhouse Showcase & Renders Manager (90,000 SFT) */}
          <div className="table-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} className="text-cyan-600" />
                <span>90,000 SFT Club House Views &amp; Renders</span>
              </h3>
              <span className="table-badge-count">4 Renders &amp; Views</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {[
                { key: 'clubhouse_front_panorama', title: 'Grand Pool & Deck', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788861578/maytri_ambhuja/clubhouse/clubhouse_front_panorama.webp', sft: '90,000 SFT' },
                { key: 'clubhouse_pool_aerial', title: 'Aerial Pool & Sun Deck', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788861579/maytri_ambhuja/clubhouse/clubhouse_pool_aerial.webp', sft: 'Olympic Pool' },
                { key: 'clubhouse_evening_elevation', title: 'Evening Illumination', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788861580/maytri_ambhuja/clubhouse/clubhouse_evening_elevation.webp', sft: 'Night Elevation' },
                { key: 'clubhouse_courtyard_lawn', title: 'Courtyard & Central Lawn', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788861581/maytri_ambhuja/clubhouse/clubhouse_courtyard_lawn.webp', sft: '4.5 Acres Park' },
              ].map((item) => {
                const imgUrl = getMediaUrl(item.key, item.fallback);
                return (
                  <div key={item.key} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{item.title}</span>
                      <span className="brand-badge admin-badge">{item.sft}</span>
                    </div>

                    <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={imgUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', marginTop: '4px' }}
                      onClick={() => handleTriggerUpload(item.key, 'clubhouse', item.title, 'image')}
                      disabled={uploadingKey === item.key}
                    >
                      {uploadingKey === item.key ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      <span>{uploadingKey === item.key ? 'Uploading...' : 'Replace Render'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Villa Architectural Elevations Manager (7 Views) */}
          <div className="table-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={18} className="text-cyan-600" />
                <span>Villa Architectural Elevations (7 Views)</span>
              </h3>
              <span className="table-badge-count">7 Elevation Renders</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {[
                { key: 'elevation_01', title: 'Villa Elevation 01', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788862454/maytri_ambhuja/elevations/elevation_01.webp', tag: 'Front Facade' },
                { key: 'elevation_02', title: 'Villa Elevation 02', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788862455/maytri_ambhuja/elevations/elevation_02.webp', tag: 'Corner View' },
                { key: 'elevation_03', title: 'Villa Elevation 03', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788862456/maytri_ambhuja/elevations/elevation_03.webp', tag: 'Grand Modern' },
                { key: 'elevation_04', title: 'Villa Elevation 04', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788862458/maytri_ambhuja/elevations/elevation_04.webp', tag: 'Street Enclave' },
                { key: 'elevation_05', title: 'Villa Elevation 05', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788862459/maytri_ambhuja/elevations/elevation_05.webp', tag: 'Contemporary' },
                { key: 'elevation_06', title: 'Villa Elevation 06', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788862461/maytri_ambhuja/elevations/elevation_06.webp', tag: 'Garden Perspective' },
                { key: 'elevation_07', title: 'Villa Elevation 07', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788862462/maytri_ambhuja/elevations/elevation_07.webp', tag: 'Terrace & Balcony' },
              ].map((item) => {
                const imgUrl = getMediaUrl(item.key, item.fallback);
                return (
                  <div key={item.key} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{item.title}</span>
                      <span className="brand-badge admin-badge">{item.tag}</span>
                    </div>

                    <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={imgUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', marginTop: '4px' }}
                      onClick={() => handleTriggerUpload(item.key, 'elevations', item.title, 'image')}
                      disabled={uploadingKey === item.key}
                    >
                      {uploadingKey === item.key ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      <span>{uploadingKey === item.key ? 'Uploading...' : 'Replace Elevation'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outdoor Amenities & Sports Arena Manager */}
          <div className="table-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} className="text-cyan-600" />
                <span>Outdoor Amenities &amp; Sports Landscapes</span>
              </h3>
              <span className="table-badge-count">3 Amenity Renders</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              {[
                { key: 'elevation_pool', title: 'Resort Swimming Pool & Deck', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788862463/maytri_ambhuja/elevations/elevation_pool.webp', tag: 'Clubhouse Pool' },
                { key: 'elevation_cricket_pitch', title: 'Cricket Pitch & Sports Arena', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788862464/maytri_ambhuja/elevations/elevation_cricket_pitch.webp', tag: 'Outdoor Sports' },
                { key: 'elevation_park_day', title: '4.5 Acres Central Park (Day View)', fallback: 'https://res.cloudinary.com/lti7vujc/image/upload/v1788862466/maytri_ambhuja/elevations/elevation_park_day.webp', tag: 'Central Park' },
              ].map((item) => {
                const imgUrl = getMediaUrl(item.key, item.fallback);
                return (
                  <div key={item.key} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1rem', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{item.title}</span>
                      <span className="brand-badge emp-badge">{item.tag}</span>
                    </div>

                    <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={imgUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%', marginTop: '4px' }}
                      onClick={() => handleTriggerUpload(item.key, 'elevations', item.title, 'image')}
                      disabled={uploadingKey === item.key}
                    >
                      {uploadingKey === item.key ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                      <span>{uploadingKey === item.key ? 'Uploading...' : 'Replace Amenity'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HERO & HEADLINE COPY */}
      {activeSubTab === 'hero' && (
        <div className="table-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} className="text-cyan-600" />
            <span>Hero Headline &amp; Slogan Configuration</span>
          </h3>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Developer Eyebrow Badge</label>
              <input
                type="text"
                className="form-input"
                value={content.hero?.eyebrowBadge || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, eyebrowBadge: e.target.value } })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telangana RERA Registration Number</label>
              <input
                type="text"
                className="form-input"
                value={content.hero?.reraNumber || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, reraNumber: e.target.value } })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Hero H1 Title</label>
            <input
              type="text"
              className="form-input"
              value={content.hero?.title || ''}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hero Subheading</label>
            <input
              type="text"
              className="form-input"
              value={content.hero?.subheading || ''}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, subheading: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Hero Supporting Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={content.hero?.description || ''}
              onChange={(e) => setContent({ ...content, hero: { ...content.hero, description: e.target.value } })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Starting Villa Price</label>
              <input
                type="text"
                className="form-input"
                value={content.hero?.startingPrice || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, startingPrice: e.target.value } })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Token Advance Booking Amount</label>
              <input
                type="text"
                className="form-input"
                value={content.hero?.tokenAdvance || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, tokenAdvance: e.target.value } })}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ABOUT & TOWNSHIP STATS */}
      {activeSubTab === 'about' && (
        <div className="table-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={18} className="text-cyan-600" />
            <span>About Section &amp; Township Statistics</span>
          </h3>

          <div className="form-group">
            <label className="form-label">About Section Title</label>
            <input
              type="text"
              className="form-input"
              value={content.about?.sectionTitle || ''}
              onChange={(e) => setContent({ ...content, about: { ...content.about, sectionTitle: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">About Tagline</label>
            <input
              type="text"
              className="form-input"
              value={content.about?.tagline || ''}
              onChange={(e) => setContent({ ...content, about: { ...content.about, tagline: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description Paragraph 1</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={content.about?.description1 || ''}
              onChange={(e) => setContent({ ...content, about: { ...content.about, description1: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description Paragraph 2</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={content.about?.description2 || ''}
              onChange={(e) => setContent({ ...content, about: { ...content.about, description2: e.target.value } })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Total Villas Stat</label>
              <input
                type="text"
                className="form-input"
                value={content.about?.totalVillas || ''}
                onChange={(e) => setContent({ ...content, about: { ...content.about, totalVillas: e.target.value } })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Acres Stat</label>
              <input
                type="text"
                className="form-input"
                value={content.about?.totalAcres || ''}
                onChange={(e) => setContent({ ...content, about: { ...content.about, totalAcres: e.target.value } })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Clubhouse Size Stat</label>
              <input
                type="text"
                className="form-input"
                value={content.about?.clubhouseSize || ''}
                onChange={(e) => setContent({ ...content, about: { ...content.about, clubhouseSize: e.target.value } })}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CLUBHOUSE & AMENITIES */}
      {activeSubTab === 'clubhouse' && (
        <div className="table-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} className="text-cyan-600" />
            <span>Clubhouse &amp; Amenities Copy</span>
          </h3>

          <div className="form-group">
            <label className="form-label">Clubhouse Title</label>
            <input
              type="text"
              className="form-input"
              value={content.clubhouse?.title || ''}
              onChange={(e) => setContent({ ...content, clubhouse: { ...content.clubhouse, title: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Clubhouse Tagline</label>
            <input
              type="text"
              className="form-input"
              value={content.clubhouse?.tagline || ''}
              onChange={(e) => setContent({ ...content, clubhouse: { ...content.clubhouse, tagline: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Clubhouse Overview Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={content.clubhouse?.description || ''}
              onChange={(e) => setContent({ ...content, clubhouse: { ...content.clubhouse, description: e.target.value } })}
            />
          </div>
        </div>
      )}

      {/* TAB 5: CONTACT & LOCATION */}
      {activeSubTab === 'contact' && (
        <div className="table-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={18} className="text-cyan-600" />
            <span>Sales Desk &amp; Location Information</span>
          </h3>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Sales Hotline Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={content.contact?.phone || ''}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, phone: e.target.value } })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official WhatsApp Enquiry Number</label>
              <input
                type="text"
                className="form-input"
                value={content.contact?.whatsapp || ''}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, whatsapp: e.target.value } })}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Official Enquiries Email</label>
              <input
                type="email"
                className="form-input"
                value={content.contact?.email || ''}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Office &amp; Site Visiting Hours</label>
              <input
                type="text"
                className="form-input"
                value={content.contact?.officeHours || ''}
                onChange={(e) => setContent({ ...content, contact: { ...content.contact, officeHours: e.target.value } })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Project Site Address</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={content.contact?.siteAddress || ''}
              onChange={(e) => setContent({ ...content, contact: { ...content.contact, siteAddress: e.target.value } })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
