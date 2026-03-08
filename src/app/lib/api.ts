import { API_URL, supabase } from './supabase';
import { SUPABASE_ANON_KEY } from './config';

async function getAccessToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || SUPABASE_ANON_KEY;
}

export async function fetchEvents() {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/events`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    return [];
  }
}

export async function registerForEvent(eventId: string, selectedDistance: string, consentAccepted: boolean) {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/events/${eventId}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ selectedDistance, consentAccepted }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to register for event');
  }
  
  const data = await response.json();
  return data;
}

export async function fetchEventTicket(eventId: string) {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/events/${eventId}/ticket`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    return null;
  }
  
  const data = await response.json();
  return data.ticket;
}

export async function fetchLeaderboard(level?: string) {
  return fetchLeaderboardByLevel(level);
}

export async function fetchLeaderboardByLevel(level?: string) {
  try {
    const token = await getAccessToken();
    const query = level ? `?level=${encodeURIComponent(level)}` : '';
    const response = await fetch(`${API_URL}/leaderboard${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.leaderboard || [];
  } catch (error) {
    return [];
  }
}

export async function fetchAdminEventCheckins(eventId: string, searchQuery?: string) {
  const token = await getAccessToken();
  const query = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
  const response = await fetch(`${API_URL}/admin/events/${eventId}/checkins${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to load check-ins');
  }

  return response.json();
}

export async function exportAdminEventCsv(eventId: string) {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/admin/events/${eventId}/export`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to export CSV');
  }

  return response.text();
}

export async function fetchReminderPreview(eventId: string) {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/admin/events/${eventId}/reminders/preview`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to load reminder preview');
  }

  return response.json();
}

export async function sendEventReminders(eventId: string) {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/admin/events/${eventId}/reminders/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to send reminders');
  }

  return response.json();
}

export async function fetchEventCertificate(eventId: string) {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/events/${eventId}/certificate`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Certificate not available');
  }

  return response.json();
}

export async function fetchGlobalStats() {
  try {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      return {
        totalMembers: 0,
        totalMiles: 0,
        totalRuns: 0,
        totalEvents: 0,
        bestPerformerThisMonth: { name: '--', distance: 0, time: '--:--:--' },
      };
    }
    
    const data = await response.json();
    return data.stats || {
      totalMembers: 0,
      totalMiles: 0,
      totalRuns: 0,
      totalEvents: 0,
      bestPerformerThisMonth: { name: '--', distance: 0, time: '--:--:--' },
    };
  } catch (error) {
    return {
      totalMembers: 0,
      totalMiles: 0,
      totalRuns: 0,
      totalEvents: 0,
      bestPerformerThisMonth: { name: '--', distance: 0, time: '--:--:--' },
    };
  }
}

export async function updateUserStats(miles: number, runs: number) {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/user/stats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ miles, runs }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update user stats');
  }
  
  const data = await response.json();
  return data.profile;
}

// ========== STRAVA INTEGRATION ==========

/**
 * STRAVA SETUP INSTRUCTIONS:
 * 
 * 1. Go to https://www.strava.com/settings/api
 * 2. Create an application (or update existing one with Client ID: 199506)
 * 3. Set the following values:
 *    - Application Name: DTBM Run Club
 *    - Category: Social Network or Tracking Service
 *    - Authorization Callback Domain: jyprakntruyooyaiadnh.supabase.co
 *      (IMPORTANT: Do NOT include https:// or any path, just the domain)
 * 
 * 4. Your complete callback URL will be:
 *    https://jyprakntruyooyaiadnh.supabase.co/functions/v1/server/make-server-a694af94/strava/callback
 * 
 * 5. Make sure the STRAVA_CLIENT_SECRET is set in your Supabase secrets
 */

export function getStravaAuthUrl(userId: string) {
  const clientId = '199506'; // Your Strava Client ID
  const redirectUri = `${API_URL}/strava/callback`;
  const scope = 'read,activity:read_all';
  
  console.log('Strava Auth URL:', `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${userId}`);
  console.log('Expected Callback:', redirectUri);
  
  return `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${userId}`;
}

export async function syncStravaActivities() {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/strava/sync`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sync Strava activities');
  }
  
  const data = await response.json();
  return data;
}

export async function disconnectStrava() {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}/strava/disconnect`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to disconnect Strava');
  }
  
  const data = await response.json();
  return data;
}