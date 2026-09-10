import { getApiBaseUrl } from './leadStorage';

const API_BASE_URL = getApiBaseUrl();
const CONTENT_STORAGE_KEY = 'maytri_website_content_v1';
const CMS_CHANNEL_NAME = 'maytri_cms_sync_channel';

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CMS_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported', e);
}

export const DEFAULT_CONTENT = {
  hero: {
    eyebrowBadge: 'MAYTRI GROUP',
    reraNumber: 'P02400007647',
    title: 'Exclusive Villa Township in Hyderabad',
    subheading: 'Spacious Villas with Picturesque Pathways & Rich Finishes',
    description: 'Surrounded by pristine landscapes and tree-lined avenues, experience an eco-friendly lifestyle designed for comfortable community living.',
    startingPrice: '₹3.8 Cr*',
    tokenAdvance: '₹5 Lakhs',
    highlights: [
      { title: '4.5 Acres', subtitle: 'Dedicated Green Park' },
      { title: 'Spacious Villas', subtitle: 'Picturesque Pathways' },
      { title: 'Rich Finishes', subtitle: 'Premium Living' },
      { title: 'All Age Groups', subtitle: 'Inclusive Villa Spaces' }
    ]
  },
  about: {
    sectionTitle: 'Where Nature Meets Architectural Opulence',
    tagline: 'A Masterpiece of Luxury Living in Shamshabad',
    description1: 'Nestled amidst 35+ acres of verdant serenity, Maytri Ambhuja is Hyderabad’s pinnacle luxury villa community crafted for discerning global citizens.',
    description2: 'Strategically located minutes from Shamshabad & ORR Exit 12, each villa is an epitome of timeless contemporary architecture with 100% Vaastu compliance.',
    totalVillas: '150+ Luxury Villas',
    totalAcres: '35+ Acres Township',
    clubhouseSize: '90,000 Sq.Ft Clubhouse'
  },
  clubhouse: {
    title: 'The Grand Ambhuja Clubhouse',
    tagline: '90,000 Sq.Ft of Resort-Class Leisure & Wellness',
    description: 'An architectural marvel offering 30+ bespoke luxury amenities including infinity pools, private 4K preview theatres, Olympic multi-sport arenas, and Ayurvedic spas.'
  },
  contact: {
    phone: '+91 98490 12345',
    whatsapp: '+91 98490 12345',
    email: 'sales@maytriambhuja.com',
    siteAddress: 'Maytri Ambhuja, Near ORR Exit 12, Shamshabad - Sanghi Nagar Road, Hyderabad, Telangana 501511',
    officeHours: 'Monday – Sunday: 9:30 AM – 7:30 PM'
  }
};

export function getLocalContent() {
  if (typeof window === 'undefined') return DEFAULT_CONTENT;
  try {
    const raw = localStorage.getItem(CONTENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CONTENT;
  } catch (e) {
    return DEFAULT_CONTENT;
  }
}

export async function fetchContentFromAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/content`);
    if (!res.ok) throw new Error('Failed to fetch content');
    const json = await res.json();
    if (json.success && json.data) {
      localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(json.data));
      return json.data;
    }
  } catch (err) {
    console.warn('API content fetch failed, using local storage:', err.message);
  }
  return getLocalContent();
}

export async function saveContentToAPI(contentData) {
  try {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(contentData));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'CONTENT_UPDATED', content: contentData });
    }

    const res = await fetch(`${API_BASE_URL}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contentData)
    });
    return await res.json();
  } catch (err) {
    console.error('API content save error:', err.message);
    return { success: false, message: err.message };
  }
}

export async function fetchAllMedia() {
  try {
    const res = await fetch(`${API_BASE_URL}/media`);
    if (!res.ok) throw new Error('Failed to fetch media');
    return await res.json();
  } catch (err) {
    console.warn('Media fetch failed:', err.message);
    return { success: false, data: [] };
  }
}

export async function uploadMediaToAPI(mediaPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mediaPayload)
    });
    const result = await res.json();
    if (broadcastChannel && result.success) {
      broadcastChannel.postMessage({ type: 'MEDIA_UPDATED', media: result.data });
    }
    return result;
  } catch (err) {
    console.error('Media upload error:', err.message);
    return { success: false, message: err.message };
  }
}
