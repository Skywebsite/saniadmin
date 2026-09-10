// Activity Log Service (Calls Completed & Emails Dispatched by Employees)

const CALL_LOGS_KEY = 'maytri_call_logs_v1';
const EMAIL_LOGS_KEY = 'maytri_email_logs_v1';
const CHANNEL_NAME = 'maytri_leads_sync_channel';

const INITIAL_CALL_LOGS = [
  {
    id: 'call-101',
    leadId: 'lead-1001',
    leadName: 'Rajesh Kumar Verma',
    leadPhone: '+91 98490 12345',
    employeeId: 'emp-102',
    employeeName: 'Rahul Varma',
    employeeDept: 'Telecalling & Direct Sales',
    outcome: 'Site Visit Confirmed', // 'Connected - Interested', 'Site Visit Confirmed', 'Callback Requested', 'Ringing / No Answer', 'Not Interested'
    duration: '4 mins 20 secs',
    durationSec: 260,
    notes: 'Client is interested in 300 SQ YD East Facing 4BHK. Confirmed site visit for Saturday 11:00 AM with his family.',
    timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  },
  {
    id: 'call-102',
    leadId: 'lead-1002',
    leadName: 'Dr. Snigdha Reddy',
    leadPhone: '+91 98855 67890',
    employeeId: 'emp-101',
    employeeName: 'Kavitha Ramanathan',
    employeeDept: 'Digital Marketing & Growth',
    outcome: 'Connected - Interested',
    duration: '5 mins 10 secs',
    durationSec: 310,
    notes: 'Requested complete pricing sheet and bank approval details for 222 SQ YD Villa.',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  },
  {
    id: 'call-103',
    leadId: 'lead-1003',
    leadName: 'Venkata Satyanarayana',
    leadPhone: '+91 94401 88990',
    employeeId: 'emp-102',
    employeeName: 'Rahul Varma',
    employeeDept: 'Telecalling & Direct Sales',
    outcome: 'Callback Requested',
    duration: '1 min 45 secs',
    durationSec: 105,
    notes: 'Currently in a meeting. Asked to call back on Friday evening around 6:00 PM.',
    timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },
  {
    id: 'call-104',
    leadId: 'lead-1004',
    leadName: 'Ananya & Rohit Sharma',
    leadPhone: '+91 97000 45612',
    employeeId: 'emp-103',
    employeeName: 'Pooja Deshmukh',
    employeeDept: 'NRI & Luxury Sales',
    outcome: 'Connected - Interested',
    duration: '12 mins 15 secs',
    durationSec: 735,
    notes: 'Virtual Zoom presentation completed with NRI buyers. Discussed corner villa pricing and payment milestone schedule.',
    timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: 'call-105',
    leadId: 'lead-1005',
    leadName: 'K. S. Rao',
    leadPhone: '+91 99890 22334',
    employeeId: 'emp-102',
    employeeName: 'Rahul Varma',
    employeeDept: 'Telecalling & Direct Sales',
    outcome: 'Site Visit Confirmed',
    duration: '8 mins 30 secs',
    durationSec: 510,
    notes: 'Visited site on Sunday. Finalized token payment for 2 contiguous villa units.',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  }
];

const INITIAL_EMAIL_LOGS = [
  {
    id: 'mail-201',
    leadId: 'lead-1001',
    leadName: 'Rajesh Kumar Verma',
    leadEmail: 'rajesh.verma@techcorp.in',
    employeeId: 'emp-102',
    employeeName: 'Rahul Varma',
    templateType: 'Site Visit Pass & Route Guide',
    subject: 'Confirmation: Your VIP Site Visit at Maytri Ambhuja (Saturday 11:00 AM)',
    preview: 'Dear Mr. Verma, we look forward to hosting you and your family at Maytri Ambhuja Luxury Township. Attached is your digital visitor pass & Google Maps location.',
    status: 'Delivered',
    sentAt: new Date(Date.now() - 50 * 60 * 1000).toISOString()
  },
  {
    id: 'mail-202',
    leadId: 'lead-1002',
    leadName: 'Dr. Snigdha Reddy',
    leadEmail: 'dr.snigdha.reddy@apollohealth.org',
    employeeId: 'emp-101',
    employeeName: 'Kavitha Ramanathan',
    templateType: 'Digital Project Kit & Pricing',
    subject: 'Maytri Ambhuja Villa Township: Comprehensive Digital Kit & Pricing Breakdown',
    preview: 'Dear Dr. Snigdha, thank you for your enquiry. Please find attached the complete 222 & 300 SQ YD villa floor plans, payment schedules, and SBI/HDFC pre-approval letters.',
    status: 'Delivered',
    sentAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'mail-203',
    leadId: 'lead-1004',
    leadName: 'Ananya & Rohit Sharma',
    leadEmail: 'rohit.sharma@microsoft.com',
    employeeId: 'emp-103',
    employeeName: 'Pooja Deshmukh',
    templateType: 'NRI Investment Dossier & 3D Walkthrough',
    subject: 'Exclusive 3D Virtual Tour & Master Plan — Maytri Ambhuja Villas',
    preview: 'Dear Mr. Rohit & Mrs. Ananya, following our Zoom session, here are the high-resolution 3D walkthrough links, clubhouse master plan, and NRI payment gateway details.',
    status: 'Opened',
    sentAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
  }
];

export const EMAIL_TEMPLATES = [
  {
    id: 'tpl-brochure',
    title: 'Digital Project Kit & Master Plan',
    subject: (name) => `Maytri Ambhuja Villa Township: Comprehensive Digital Kit for ${name || 'You'}`,
    body: (name, unit) => `Dear ${name || 'Sir/Madam'},

Thank you for your interest in Maytri Ambhuja, Hyderabad's premier luxury villa community near Pedda Amberpet & ORR Exit-11.

We are pleased to share the complete project digital kit:
• Township Master Plan (4.5 Acres Central Park)
• 90,000 Sq.Ft Luxury Clubhouse & 16 Amenities
• Architectural Floor Plans for 222 SQ YD & 300 SQ YD East/West Facing Villas (${unit || 'Luxury Villas'})
• Official Telangana RERA Registration: P02400007647

Please let us know your preferred date and time for an exclusive guided walkthrough.

Warm regards,
Sales & Advisory Desk
Maytri Ambhuja Township
Phone: 040-24200456 | Web: www.maytrigroup.in`
  },
  {
    id: 'tpl-cost-sheet',
    title: 'Cost Sheet & Payment Milestone Plan',
    subject: (name) => `Official Pricing & Payment Schedule — Maytri Ambhuja`,
    body: (name, unit) => `Dear ${name || 'Valued Client'},

As requested during our discussion, here is the detailed pricing overview and payment milestone schedule for ${unit || 'Maytri Ambhuja Luxury Villas'}:

• All-inclusive pricing breakdown with base rate and clubhouse charges
• Construction linked payment milestones (10% booking advance, phased structure payments)
• Approved Home Loan Partners: SBI, HDFC Bank, ICICI Bank & Axis Bank

Our finance advisory team is available to assist you with custom payment schedules and loan pre-approvals.

Warm regards,
Maytri Group Sales Office`
  },
  {
    id: 'tpl-site-visit',
    title: 'VIP Site Visit Confirmation & Google Maps Pass',
    subject: (name) => `Confirmation: Your VIP Site Visit at Maytri Ambhuja`,
    body: (name, unit) => `Dear ${name || 'Sir/Madam'},

We are delighted to confirm your upcoming site visit to Maytri Ambhuja Villa Township!

📍 Site Location: Survey No: 156, ORR Exit-11, Pedda Amberpet, Hyderabad 501511.
Google Maps Link: https://maps.google.com/?q=Maytri+Ambhuja+Hyderabad

Your dedicated relationship manager will receive you at the township experience center to give you and your family a personalized tour of the sample villa and clubhouse.

Looking forward to meeting you!

Best regards,
Maytri Ambhuja Welcome Desk`
  }
];

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel error', e);
}

// ----------------- CALL LOGS -----------------
export function getCallLogs() {
  if (typeof window === 'undefined') return INITIAL_CALL_LOGS;
  try {
    const raw = localStorage.getItem(CALL_LOGS_KEY);
    if (!raw) {
      localStorage.setItem(CALL_LOGS_KEY, JSON.stringify(INITIAL_CALL_LOGS));
      return INITIAL_CALL_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get call logs', e);
    return INITIAL_CALL_LOGS;
  }
}

export function logCall(callData) {
  const current = getCallLogs();
  const newCall = {
    id: callData.id || ('call-' + Date.now().toString(36)),
    leadId: callData.leadId || '',
    leadName: callData.leadName || 'Prospect',
    leadPhone: callData.leadPhone || '',
    employeeId: callData.employeeId || 'emp-unknown',
    employeeName: callData.employeeName || 'Staff Member',
    employeeDept: callData.employeeDept || 'Marketing & Sales',
    outcome: callData.outcome || 'Connected - Interested',
    duration: callData.duration || '2 mins 30 secs',
    durationSec: callData.durationSec || 150,
    notes: callData.notes || '',
    timestamp: new Date().toISOString()
  };

  const updated = [newCall, ...current];
  localStorage.setItem(CALL_LOGS_KEY, JSON.stringify(updated));

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'CALLS_UPDATED', calls: updated, newCall });
  }

  // Sync with MongoDB API
  syncCallLogToAPI(newCall);

  return newCall;
}

// ----------------- EMAIL LOGS -----------------
export function getEmailLogs() {
  if (typeof window === 'undefined') return INITIAL_EMAIL_LOGS;
  try {
    const raw = localStorage.getItem(EMAIL_LOGS_KEY);
    if (!raw) {
      localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(INITIAL_EMAIL_LOGS));
      return INITIAL_EMAIL_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get email logs', e);
    return INITIAL_EMAIL_LOGS;
  }
}

export function logEmail(emailData) {
  const current = getEmailLogs();
  const newMail = {
    id: emailData.id || ('mail-' + Date.now().toString(36)),
    leadId: emailData.leadId || '',
    leadName: emailData.leadName || 'Prospect',
    leadEmail: emailData.leadEmail || '',
    employeeId: emailData.employeeId || 'emp-unknown',
    employeeName: emailData.employeeName || 'Marketing Executive',
    templateType: emailData.templateType || 'Digital Project Kit & Master Plan',
    subject: emailData.subject || 'Maytri Ambhuja Villa Township Enquiry',
    preview: emailData.preview || (emailData.body ? emailData.body.substring(0, 120) + '...' : ''),
    body: emailData.body || '',
    status: 'Delivered',
    sentAt: new Date().toISOString()
  };

  const updated = [newMail, ...current];
  localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(updated));

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'EMAILS_UPDATED', emails: updated, newMail });
  }

  // Sync with MongoDB API
  syncEmailLogToAPI(newMail);

  return newMail;
}

// ---------------- MongoDB API Helpers ----------------
const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const host = (typeof window !== 'undefined' && window.location && window.location.hostname) || 'localhost';
  return `http://${host}:5000/api`;
};

export async function fetchCallLogsFromAPI() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/activity/calls`);
    if (!res.ok) throw new Error('API fetch calls failed');
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      localStorage.setItem(CALL_LOGS_KEY, JSON.stringify(json.data));
      return json.data;
    }
  } catch (err) {
    console.warn('Could not sync call logs from API:', err.message);
  }
  return getCallLogs();
}

export async function syncCallLogToAPI(callData) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/activity/calls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(callData)
    });
    return await res.json();
  } catch (err) {
    console.warn('API call log save failed:', err.message);
    return null;
  }
}

export async function fetchEmailLogsFromAPI() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/activity/emails`);
    if (!res.ok) throw new Error('API fetch emails failed');
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(json.data));
      return json.data;
    }
  } catch (err) {
    console.warn('Could not sync email logs from API:', err.message);
  }
  return getEmailLogs();
}

export async function syncEmailLogToAPI(emailData) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/activity/emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
    return await res.json();
  } catch (err) {
    console.warn('API email log save failed:', err.message);
    return null;
  }
}
