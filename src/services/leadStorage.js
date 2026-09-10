// Lead Storage Service with localStorage, Employee Assignment and BroadcastChannel Sync

const STORAGE_KEY = 'maytri_realestate_leads_db_v1';
const CHANNEL_NAME = 'maytri_leads_sync_channel';

export const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const host = (typeof window !== 'undefined' && window.location && window.location.hostname) || 'localhost';
  return `http://${host}:5000/api`;
};

export const API_BASE_URL = getApiBaseUrl();

const INITIAL_SAMPLE_LEADS = [
  {
    id: 'lead-1001',
    fullName: 'Rajesh Kumar Verma',
    phone: '+91 98490 12345',
    email: 'rajesh.verma@techcorp.in',
    preferredMethod: 'WhatsApp',
    source: 'Website Enquiry',
    message: 'Interested in 300 SQ YD East Facing 4BHK Villa with private lift. Requesting weekend site visit.',
    status: 'Site Visit Scheduled',
    unitInterest: '300 SQ YD Villa (East Facing)',
    budget: '₹4.5 Cr - ₹5.5 Cr',
    assignedToId: 'emp-102',
    assignedToName: 'Rahul Varma',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    notes: 'Scheduled site visit with family for Saturday 11:00 AM. Assigned to senior consultant Rahul.',
    followUpDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'lead-1002',
    fullName: 'Dr. Snigdha Reddy',
    phone: '+91 98855 67890',
    email: 'dr.snigdha.reddy@apollohealth.org',
    preferredMethod: 'Phone',
    source: 'Brochure Download',
    message: 'Downloaded digital project kit. Want pricing sheet and bank approval list for HDFC/SBI.',
    status: 'New',
    unitInterest: '222 SQ YD Villa (West Facing)',
    budget: '₹3.8 Cr - ₹4.5 Cr',
    assignedToId: 'emp-101',
    assignedToName: 'Kavitha Ramanathan',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    notes: 'First touchpoint pending. Needs pricing breakdown and floor plan PDF on WhatsApp.',
    followUpDate: new Date().toISOString().split('T')[0],
  },
  {
    id: 'lead-1003',
    fullName: 'Venkata Satyanarayana',
    phone: '+91 94401 88990',
    email: 'v.satya@gmrinfra.com',
    preferredMethod: 'Phone',
    source: 'Website Enquiry',
    message: 'Looking for luxury gated community near ORR Exit 12 / Shamshabad connectivity.',
    status: 'Contacted',
    unitInterest: '300 SQ YD Villa (West Facing)',
    budget: '₹5.0 Cr+',
    assignedToId: 'emp-102',
    assignedToName: 'Rahul Varma',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    notes: 'Spoke on call. Liked the 90,000 sq ft clubhouse & 4.5 acre central park. Will visit after Dussehra.',
    followUpDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'lead-1004',
    fullName: 'Ananya & Rohit Sharma',
    phone: '+91 97000 45612',
    email: 'rohit.sharma@microsoft.com',
    preferredMethod: 'WhatsApp',
    source: 'Direct WhatsApp CTA',
    message: 'NRI enquiry from Seattle, parents living in Hyderabad. Require virtual 3D tour link.',
    status: 'Negotiation',
    unitInterest: '300 SQ YD Villa (East Facing Corner)',
    budget: '₹5.5 Cr',
    assignedToId: 'emp-103',
    assignedToName: 'Pooja Deshmukh',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    notes: 'Virtual walkthrough conducted via Zoom. Pricing discussion in progress with Sales Director.',
    followUpDate: new Date(Date.now() + 12 * 3600 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'lead-1005',
    fullName: 'K. S. Rao',
    phone: '+91 99890 22334',
    email: 'ksrao.investments@gmail.com',
    preferredMethod: 'Phone',
    source: 'Brochure Download',
    message: 'Seeking 2 contiguous villa units for joint family living.',
    status: 'Converted',
    unitInterest: '2x 222 SQ YD Villas',
    budget: '₹8.0 Cr',
    assignedToId: 'emp-102',
    assignedToName: 'Rahul Varma',
    createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    notes: 'Token advance received for Villa #42 & #43. Agreement of sale drafting initiated.',
    followUpDate: '',
  }
];

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (err) {
  console.warn('BroadcastChannel not supported', err);
}

export function getLeads() {
  if (typeof window === 'undefined') return INITIAL_SAMPLE_LEADS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_LEADS));
      return INITIAL_SAMPLE_LEADS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load leads from localStorage', e);
    return INITIAL_SAMPLE_LEADS;
  }
}

export async function saveLead(leadInput) {
  const currentLeads = getLeads();
  const assignedId = leadInput.assignedToId || leadInput.assignedTo || '';
  const assignedName = leadInput.assignedToName || leadInput.assignedEmployeeName || (assignedId ? 'Assigned' : 'Unassigned');

  const newLead = {
    id: leadInput.id || ('lead-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6)),
    fullName: leadInput.fullName || 'Anonymous Prospect',
    phone: leadInput.phone || '',
    email: leadInput.email || '',
    preferredMethod: leadInput.preferredMethod || 'Phone',
    source: leadInput.source || 'Admin Manual Entry',
    message: leadInput.message || '',
    status: leadInput.status || 'New',
    unitInterest: leadInput.unitInterest || 'Villa Enquiry',
    budget: leadInput.budget || '₹3.8 Cr - ₹5.5 Cr',
    assignedToId: assignedId,
    assignedToName: assignedName,
    assignedTo: assignedId,
    assignedEmployeeName: assignedName,
    createdAt: new Date().toISOString(),
    notes: leadInput.notes || 'Created in CRM.',
    followUpDate: leadInput.followUpDate || new Date().toISOString().split('T')[0],
  };

  const updatedLeads = [newLead, ...currentLeads];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'LEADS_UPDATED', leads: updatedLeads, newLead });
    }
  } catch (e) {
    console.error('Error saving lead to storage', e);
  }

  // Sync with MongoDB API and wait for result
  try {
    await syncLeadToAPI(newLead);
  } catch (err) {
    console.warn('API lead save sync failed:', err);
  }

  return newLead;
}

export async function updateLead(leadId, updates) {
  const currentLeads = getLeads();
  const normalizedUpdates = { ...updates };

  if (normalizedUpdates.assignedToId !== undefined) {
    normalizedUpdates.assignedTo = normalizedUpdates.assignedToId;
  }
  if (normalizedUpdates.assignedToName !== undefined) {
    normalizedUpdates.assignedEmployeeName = normalizedUpdates.assignedToName;
  }
  if (normalizedUpdates.assignedTo !== undefined) {
    normalizedUpdates.assignedToId = normalizedUpdates.assignedTo;
  }
  if (normalizedUpdates.assignedEmployeeName !== undefined) {
    normalizedUpdates.assignedToName = normalizedUpdates.assignedEmployeeName;
  }

  const updatedLeads = currentLeads.map(lead => {
    if (lead.id === leadId) {
      return { ...lead, ...normalizedUpdates, updatedAt: new Date().toISOString() };
    }
    return lead;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'LEADS_UPDATED', leads: updatedLeads });
    }
  } catch (e) {
    console.error('Error updating lead in storage', e);
  }

  // Sync update with MongoDB API and wait for completion to avoid race conditions
  try {
    await updateLeadOnAPI(leadId, normalizedUpdates);
  } catch (err) {
    console.warn('API update failed:', err);
  }

  return updatedLeads;
}

export async function assignLeadToEmployee(leadId, employeeId, employeeName) {
  return await updateLead(leadId, {
    assignedToId: employeeId,
    assignedToName: employeeName,
    assignedTo: employeeId,
    assignedEmployeeName: employeeName,
    notes: `Assigned to ${employeeName} on ${new Date().toLocaleDateString()}`
  });
}

export async function deleteLead(leadId) {
  const currentLeads = getLeads();
  const updatedLeads = currentLeads.filter(lead => lead.id !== leadId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLeads));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'LEADS_UPDATED', leads: updatedLeads });
    }
  } catch (e) {
    console.error('Error deleting lead', e);
  }

  // Sync delete with MongoDB API
  try {
    await deleteLeadOnAPI(leadId);
  } catch (err) {
    console.warn('API delete failed:', err);
  }

  return updatedLeads;
}

export function resetToDefaults() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_LEADS));
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'LEADS_UPDATED', leads: INITIAL_SAMPLE_LEADS });
  }
  return INITIAL_SAMPLE_LEADS;
}

export function subscribeToLeads(callback) {
  if (typeof window === 'undefined') return () => {};

  const handleBroadcast = (event) => {
    if (event.data && event.data.type === 'LEADS_UPDATED') {
      callback(event.data.leads || getLeads());
    }
  };

  const handleStorageEvent = (event) => {
    if (event.key === STORAGE_KEY) {
      callback(getLeads());
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorageEvent);
  };
}

export function exportLeadsToCSV(leads) {
  if (!leads || !leads.length) return;
  const headers = ['Lead ID', 'Full Name', 'Phone', 'Email', 'Assigned Specialist', 'Preferred Contact', 'Status', 'Unit Interest', 'Source', 'Submission Date', 'Follow Up', 'Message', 'Notes'];
  const rows = leads.map(l => [
    `"${l.id}"`,
    `"${(l.fullName || '').replace(/"/g, '""')}"`,
    `"${(l.phone || '').replace(/"/g, '""')}"`,
    `"${(l.email || '').replace(/"/g, '""')}"`,
    `"${(l.assignedToName || 'Unassigned').replace(/"/g, '""')}"`,
    `"${(l.preferredMethod || '').replace(/"/g, '""')}"`,
    `"${(l.status || '').replace(/"/g, '""')}"`,
    `"${(l.unitInterest || '').replace(/"/g, '""')}"`,
    `"${(l.source || '').replace(/"/g, '""')}"`,
    `"${new Date(l.createdAt).toLocaleString()}"`,
    `"${l.followUpDate || ''}"`,
    `"${(l.message || '').replace(/"/g, '""')}"`,
    `"${(l.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `maytri_leads_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------------- MongoDB Online Cloud API Helpers ----------------
export async function fetchLeadsFromAPI() {
  try {
    const res = await fetch(`${API_BASE_URL}/leads`);
    if (!res.ok) throw new Error('API fetch failed');
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      const normalized = json.data.map(l => {
        const assignedId = l.assignedToId || l.assignedTo || '';
        const assignedName = l.assignedToName || l.assignedEmployeeName || (assignedId ? 'Assigned' : 'Unassigned');
        return {
          ...l,
          assignedToId: assignedId,
          assignedToName: assignedName,
          assignedTo: assignedId,
          assignedEmployeeName: assignedName
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    }
  } catch (err) {
    console.warn('Could not sync leads from MongoDB API, using local storage:', err.message);
  }
  return getLeads();
}

export async function syncLeadToAPI(leadData) {
  try {
    const res = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
    return await res.json();
  } catch (err) {
    console.warn('API lead save failed, stored locally:', err.message);
    return null;
  }
}

export async function updateLeadOnAPI(leadId, updates) {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return await res.json();
  } catch (err) {
    console.warn('API lead update failed:', err.message);
    return null;
  }
}

export async function deleteLeadOnAPI(leadId) {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${leadId}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (err) {
    console.warn('API lead delete failed:', err.message);
    return null;
  }
}
