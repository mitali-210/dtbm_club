import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { Upload, Users, Calendar, Trash2, Edit, Plus, X, Save, ScanLine, Play, Image } from 'lucide-react';
import { toast } from 'sonner';
import { API_URL, supabase } from '../lib/supabase';
import { Scanner } from '@yudiel/react-qr-scanner';
import { exportAdminEventCsv, fetchAdminEventCheckins, fetchReminderPreview, sendEventReminders, fetchGalleryPhotos, uploadGalleryPhoto, deleteGalleryPhoto } from '../lib/api';
import { ADMIN_EMAILS } from '../lib/config';

type TabType = 'events' | 'users' | 'activities' | 'scanner' | 'gallery' | 'settings';

function parseFlexibleDateTime(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : Number.NaN;
  }

  if (typeof value !== 'string') {
    return Number.NaN;
  }

  const trimmed = value.trim();
  if (!trimmed) return Number.NaN;

  const parsedDirect = new Date(trimmed).getTime();
  if (Number.isFinite(parsedDirect)) return parsedDirect;

  const normalized = trimmed.includes(' ') ? trimmed.replace(' ', 'T') : trimmed;
  return new Date(normalized).getTime();
}

function normalizeEventDateInput(value: string): string {
  const parsed = parseFlexibleDateTime(value);
  if (!Number.isFinite(parsed)) return '';
  return new Date(parsed).toISOString();
}

function toDateTimeLocalInput(value: unknown): string {
  const parsed = parseFlexibleDateTime(value);
  if (!Number.isFinite(parsed)) return '';

  const date = new Date(parsed);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatAdminEventDate(value: unknown): string {
  const parsed = parseFlexibleDateTime(value);
  if (!Number.isFinite(parsed)) return 'Date pending';
  return new Date(parsed).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
}

export function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('events');
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [activityData, setActivityData] = useState({
    name: '',
    date: '',
    distance: '',
    duration: '',
    pace: ''
  });
  const [updating, setUpdating] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [scanBusy, setScanBusy] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [raceStartBusy, setRaceStartBusy] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardEventId, setDashboardEventId] = useState('');
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [reminderPreview, setReminderPreview] = useState<any | null>(null);
  const [reminderSendResult, setReminderSendResult] = useState<any | null>(null);
  const lastScannedValueRef = useRef('');const [editingEvent, setEditingEvent] = useState<any>(null);
  const [eventForm, setEventForm] = useState({
    name: '',
    date: '',
    location: '',
    distance: '',
    photoUrl: '',
    distanceOptionsText: '',
    level: 'fun',
    description: '',
    maxParticipants: '',
    registrationCutoffMinutes: '0'
  });
  

  useEffect(() => {
    if (!loading && (!user || !user.email || !ADMIN_EMAILS.has(user.email.toLowerCase()))) {
      navigate('/');
      toast.error('Access denied. Admin only.');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user?.email && ADMIN_EMAILS.has(user.email.toLowerCase())) {
      loadAllUsers();
      loadAllEvents();
    }
  }, [user]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Spidy';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const loadAllUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadAllEvents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${API_URL}/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const formToSend = {
        ...eventForm,
        date: normalizeEventDateInput(eventForm.date),
        distanceOptions: eventForm.distanceOptionsText
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
      };

      if (!formToSend.date) {
        throw new Error('Please enter a valid event date and time');
      }

      const response = await fetch(`${API_URL}/admin/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formToSend),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create event');
      }

      toast.success('Event created successfully!');
      setEventForm({ name: '', date: '', location: '', distance: '', photoUrl: '', distanceOptionsText: '', level: 'fun', description: '', maxParticipants: '', registrationCutoffMinutes: '0' });
      setShowEventForm(false);
      loadAllEvents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const formToSend = {
        ...eventForm,
        date: normalizeEventDateInput(eventForm.date),
        distanceOptions: eventForm.distanceOptionsText
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
      };

      if (!formToSend.date) {
        throw new Error('Please enter a valid event date and time');
      }

      const response = await fetch(`${API_URL}/admin/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formToSend),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      toast.success('Event updated successfully!');
      setEventForm({ name: '', date: '', location: '', distance: '', photoUrl: '', distanceOptionsText: '', level: 'fun', description: '', maxParticipants: '', registrationCutoffMinutes: '0' });
      setEditingEvent(null);
      loadAllEvents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update event');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${API_URL}/admin/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      toast.success('Event deleted successfully!');
      loadAllEvents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete event');
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }

    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Ensure date is a valid ISO string
      const payload = {
        ...activityData,
        date: activityData.date ? new Date(activityData.date).toISOString() : new Date().toISOString()
      };

      const response = await fetch(`${API_URL}/admin/users/${selectedUser}/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add activity');
      }

      toast.success('Activity added successfully!');
      setActivityData({ name: '', date: '', distance: '', duration: '', pace: '' });
      loadAllUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add activity');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateUserStats = async (userId: string, stats: any) => {
    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${API_URL}/admin/users/${userId}/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(stats),
      });

      if (!response.ok) {
        throw new Error('Failed to update stats');
      }

      toast.success('Stats updated successfully!');
      loadAllUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update stats');
    } finally {
      setUpdating(false);
    }
  };

  const startEditEvent = (event: any) => {
    setEditingEvent(event);
    setEventForm({
      name: event.name,
      date: toDateTimeLocalInput(event.date),
      location: event.location,
      distance: event.distance,
      photoUrl: event.photoUrl || '',
      distanceOptionsText: Array.isArray(event.distanceOptions) ? event.distanceOptions.join(', ') : '',
      level: event.level || 'fun',
      description: event.description || '',
      maxParticipants: event.maxParticipants?.toString() || '',
      registrationCutoffMinutes: String(event.registrationCutoffMinutes || '0')
    });
  };

  const handleScanTicket = async (rawQrData?: string) => {
    let qrData = (rawQrData ?? scanInput).trim();
    if (!qrData || scanBusy) return;

    // Handle JSON QR data from QRTicket component
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.qrSignature) {
        qrData = parsed.qrSignature;
      }
    } catch (e) {
      // Not JSON, use as is (normal string scanner or manual input)
    }

    setScanBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${API_URL}/admin/tickets/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ qrData }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan ticket');
      }

      setScanResult(data);
      if (data.alreadyCheckedIn) {
        toast.info(`${data.userName || 'Runner'} is already marked present.`);
      } else {
        toast.success(`${data.userName || 'Runner'} marked present.`);
      }
      setScanInput('');
      loadAllEvents();
      if (dashboardEventId) {
        await loadCheckinDashboard(dashboardEventId, dashboardSearch);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to scan ticket');
    } finally {
      setScanBusy(false);
    }
  };

  const handleStartRace = async () => {
    if (!dashboardEventId || raceStartBusy) {
      if (!dashboardEventId) toast.error('Select an event first');
      return;
    }

    setRaceStartBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch(`${API_URL}/admin/events/${dashboardEventId}/start-race`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start race');
      }

      if (data.alreadyStarted) {
        toast.info('Race already started for this event.');
      } else {
        toast.success('Race started successfully. Timer is running.');
      }

      await loadAllEvents();
      await loadCheckinDashboard(dashboardEventId, dashboardSearch);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start race');
    } finally {
      setRaceStartBusy(false);
    }
  };

  const loadCheckinDashboard = async (eventId: string, searchText?: string) => {
    if (!eventId) {
      setDashboardData(null);
      return;
    }
    setDashboardLoading(true);
    try {
      const data = await fetchAdminEventCheckins(eventId, searchText);
      setDashboardData(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load check-in dashboard');
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleExportCsv = async () => {
    if (!dashboardEventId) {
      toast.error('Select an event first');
      return;
    }

    try {
      const csvText = await exportAdminEventCsv(dashboardEventId);
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dashboardEventId}-participants.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export CSV');
    }
  };

  const handleReminderPreview = async () => {
    if (!dashboardEventId) {
      toast.error('Select an event first');
      return;
    }

    try {
      const preview = await fetchReminderPreview(dashboardEventId);
      setReminderPreview(preview);
      toast.success(`Reminder preview ready (${preview?.count || 0} recipients)`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load reminder preview');
    }
  };

  const handleSendReminders = async () => {
    if (!dashboardEventId) {
      toast.error('Select an event first');
      return;
    }

    try {
      const result = await sendEventReminders(dashboardEventId);
      setReminderSendResult(result);
      toast.success(`Reminders sent: ${result.sent}, failed: ${result.failed}`);
      await handleReminderPreview();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reminders');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center pt-20">
        <div className="font-['Space_Mono'] text-white/60 text-sm uppercase tracking-wider">Loading...</div>
      </div>
    );
  }

  if (!user?.email || !ADMIN_EMAILS.has(user.email.toLowerCase())) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black pt-28 md:pt-32 pb-20 px-[var(--site-margin)]">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 border-b border-white/10 pb-8"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-2">
                admin panel
              </p>
              <h1 className="font-['Bebas_Neue'] text-[8vw] md:text-[6vw] lg:text-[80px] leading-[0.95]">
                DASHBOARD
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 md:mb-12 border border-white/10 overflow-x-auto">
          <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')}>
            Events
          </TabButton>
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            Users
          </TabButton>
          <TabButton active={activeTab === 'activities'} onClick={() => setActiveTab('activities')}>
            Activities
          </TabButton>
          <TabButton active={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')}>
            Scan Tickets
          </TabButton>
          <TabButton active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')}>
            Gallery
          </TabButton>
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
            Settings
          </TabButton>
        </div>

        {/* Tab Content */}
        {activeTab === 'events' && (
          <EventsTab
            events={events}
            showEventForm={showEventForm}
            setShowEventForm={setShowEventForm}
            editingEvent={editingEvent}
            setEditingEvent={setEditingEvent}
            eventForm={eventForm}
            setEventForm={setEventForm}
            handleCreateEvent={handleCreateEvent}
            handleUpdateEvent={handleUpdateEvent}
            handleDeleteEvent={handleDeleteEvent}
            startEditEvent={startEditEvent}
            updating={updating}
          />
        )}

        {activeTab === 'users' && (
          <UsersTab users={users} onUpdate={handleUpdateUserStats} />
        )}

        {activeTab === 'activities' && (
          <ActivitiesTab
            users={users}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            activityData={activityData}
            setActivityData={setActivityData}
            handleAddActivity={handleAddActivity}
            updating={updating}
          />
        )}

        {activeTab === 'scanner' && (
          <TicketScannerTab
            events={events}
            scanInput={scanInput}
            setScanInput={setScanInput}
            scanBusy={scanBusy}
            scanResult={scanResult}
            onScanTicket={handleScanTicket}
            lastScannedValueRef={lastScannedValueRef}
            dashboardEventId={dashboardEventId}
            setDashboardEventId={setDashboardEventId}
            dashboardSearch={dashboardSearch}
            setDashboardSearch={setDashboardSearch}
            dashboardData={dashboardData}
            dashboardLoading={dashboardLoading}
            onLoadDashboard={loadCheckinDashboard}
            onStartRace={handleStartRace}
            raceStartBusy={raceStartBusy}
            onExportCsv={handleExportCsv}
            onReminderPreview={handleReminderPreview}
            onSendReminders={handleSendReminders}
            reminderPreview={reminderPreview}
            reminderSendResult={reminderSendResult}
          />
        )}

        {activeTab === 'gallery' && <GalleryTab />}

        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-none md:flex-1 px-5 md:px-8 py-3 md:py-4 font-['Space_Mono'] text-[11px] md:text-xs uppercase tracking-wider whitespace-nowrap transition-all ${
        active ? 'bg-white text-black' : 'bg-black text-white/60 hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
    </button>
  );
}

// Events Tab Component
function EventsTab({
  events,
  showEventForm,
  setShowEventForm,
  editingEvent,
  setEditingEvent,
  eventForm,
  setEventForm,
  handleCreateEvent,
  handleUpdateEvent,
  handleDeleteEvent,
  startEditEvent,
  updating
}: any) {
  return (
    <div className="space-y-8">
      {/* Create Button */}
      {!showEventForm && !editingEvent && (
        <button
          onClick={() => setShowEventForm(true)}
          className="border border-white px-6 md:px-12 py-4 md:py-6 hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-3 w-full sm:w-auto"
        >
          <Plus size={20} />
          <span className="font-['Space_Mono'] text-sm uppercase tracking-wider">
            Create New Event
          </span>
        </button>
      )}

      {/* Event Form */}
      {(showEventForm || editingEvent) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-white/10 p-8 md:p-12"
        >
          <div className="flex justify-between items-start mb-8">
            <h3 className="font-['Bebas_Neue'] text-4xl">
              {editingEvent ? 'Edit Event' : 'Create Event'}
            </h3>
            <button
              onClick={() => {
                setShowEventForm(false);
                setEditingEvent(null);
                setEventForm({ name: '', date: '', location: '', distance: '', photoUrl: '', distanceOptionsText: '', level: 'fun', description: '', maxParticipants: '', registrationCutoffMinutes: '0' });
              }}
              className="p-2 hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                  Event Name
                </label>
                <input
                  type="text"
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
                  placeholder="Urban Sunset 10K"
                  required
                />
              </div>

              <div>
                <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                  Date
                </label>
                <input
                  type="datetime-local"
                  step="60"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  onFocus={(e) => e.currentTarget.showPicker?.()}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
                  required
                />
              </div>

              <div>
                <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                  Location
                </label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                  className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
                  placeholder="Golden Gate Park, SF"
                  required
                />
              </div>

              <div>
                <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                  Event Display Distance
                </label>
                <input
                  type="text"
                  value={eventForm.distance}
                  onChange={(e) => setEventForm({ ...eventForm, distance: e.target.value })}
                  className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
                  placeholder="10 km"
                  required
                />
              </div>

              <div>
                <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                  Event Photo URL
                </label>
                <input
                  type="url"
                  value={eventForm.photoUrl}
                  onChange={(e) => setEventForm({ ...eventForm, photoUrl: e.target.value })}
                  className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                  Runner Distance Options (comma separated)
                </label>
                <input
                  type="text"
                  value={eventForm.distanceOptionsText}
                  onChange={(e) => setEventForm({ ...eventForm, distanceOptionsText: e.target.value })}
                  className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
                  placeholder="3 km, 5 km, 10 km"
                  required
                />
              </div>

              <div>
                <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                  Level
                </label>
                <select
                  value={eventForm.level}
                  onChange={(e) => setEventForm({ ...eventForm, level: e.target.value })}
                  className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
                >
                  <option value="fun">Fun</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                  Max Participants (Optional)
                </label>
                <input
                  type="number"
                  value={eventForm.maxParticipants}
                  onChange={(e) => setEventForm({ ...eventForm, maxParticipants: e.target.value })}
                  className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                  Registration Cutoff (minutes before start)
                </label>
                <input
                  type="number"
                  min="0"
                  value={eventForm.registrationCutoffMinutes}
                  onChange={(e) => setEventForm({ ...eventForm, registrationCutoffMinutes: e.target.value })}
                  className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
                  placeholder="60"
                />
              </div>
            </div>

            <div>
              <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                Description (Optional)
              </label>
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm min-h-[120px]"
                placeholder="Event description..."
              />
            </div>

              <button
              type="submit"
              disabled={updating}
                className="border border-white px-6 md:px-12 py-4 md:py-6 hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 w-full sm:w-auto"
            >
              <Save size={20} />
              <span className="font-['Space_Mono'] text-sm uppercase tracking-wider">
                {updating ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
              </span>
            </button>
          </form>
        </motion.div>
      )}

      {/* Events List */}
      <div className="space-y-[1px] bg-white/10 border border-white/10">
        {events.length === 0 ? (
          <div className="bg-black p-12 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-white/20" />
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider">
              No events found
            </p>
          </div>
        ) : (
          events.map((event: any) => (
            <div key={event.id} className="bg-black hover:bg-white/5 transition-all duration-300">
              <div className="p-8 md:p-12">
                {(() => {
                  const registeredCount = Array.isArray(event.participants)
                    ? event.participants.length
                    : Number(event.participants || 0);
                  const checkedInCount = Array.isArray(event.checkedInParticipants)
                    ? event.checkedInParticipants.length
                    : 0;
                  const maxCount = Number(event.maxParticipants || 0);
                  return (
                    <div className="mb-5 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1 border border-white/20 text-xs font-['Space_Mono'] uppercase tracking-wider text-white/80">
                        Present: {checkedInCount}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 border border-white/20 text-xs font-['Space_Mono'] uppercase tracking-wider text-white/80">
                        Registered: {registeredCount}{maxCount > 0 ? ` / ${maxCount}` : ''}
                      </span>
                    </div>
                  );
                })()}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 md:gap-8">
                  <div className="flex-1">
                    <h3 className="font-['Bebas_Neue'] text-3xl mb-4">{event.name}</h3>
                    <div className="space-y-2">
                      <p className="font-['Space_Mono'] text-xs text-white/60">
                        {formatAdminEventDate(event.date)}
                      </p>
                      <p className="font-['Space_Mono'] text-xs text-white/60">{event.location}</p>
                      <p className="font-['Space_Mono'] text-xs text-white/60">{event.distance}</p>
                      {event.level && (
                        <p className="font-['Space_Mono'] text-xs text-white/60">Level: {String(event.level).toUpperCase()}</p>
                      )}
                      {Array.isArray(event.distanceOptions) && event.distanceOptions.length > 0 && (
                        <p className="font-['Space_Mono'] text-xs text-white/60">Options: {event.distanceOptions.join(', ')}</p>
                      )}
                      {Number(event.registrationCutoffMinutes || 0) > 0 && (
                        <p className="font-['Space_Mono'] text-xs text-white/60">Cutoff: {event.registrationCutoffMinutes} min before start</p>
                      )}
                      {Array.isArray(event.waitlist) && event.waitlist.length > 0 && (
                        <p className="font-['Space_Mono'] text-xs text-white/60">Waitlist: {event.waitlist.length}</p>
                      )}
                      {event.description && (
                        <p className="text-sm text-white/50 mt-4">{event.description}</p>
                      )}
                      {event.photoUrl && (
                        <p className="font-['Space_Mono'] text-xs text-white/50 mt-2 break-all">Photo: {event.photoUrl}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 self-start md:self-auto">
                    <button
                      onClick={() => startEditEvent(event)}
                      className="p-3 border border-white/20 hover:bg-white/5 transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-3 border border-white/20 hover:bg-white/5 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Users Tab Component
function UsersTab({ users, onUpdate }: { users: any[]; onUpdate: (userId: string, stats: any) => void }) {
  return (
    <div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-[1px] bg-white/10 border border-white/10 mb-12">
        <div className="bg-black p-8">
          <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-4">Total Users</p>
          <p className="font-['Bebas_Neue'] text-5xl">{users.length}</p>
        </div>
        <div className="bg-black p-8">
          <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-4">Total Miles</p>
          <p className="font-['Bebas_Neue'] text-5xl">{users.reduce((sum, u) => sum + (u.totalMiles || 0), 0).toFixed(0)}</p>
        </div>
        <div className="bg-black p-8">
          <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-4">Total Runs</p>
          <p className="font-['Bebas_Neue'] text-5xl">{users.reduce((sum, u) => sum + (u.totalRuns || 0), 0)}</p>
        </div>
        <div className="bg-black p-8">
          <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-4">Active Runners</p>
          <p className="font-['Bebas_Neue'] text-5xl">{users.filter(u => (u.totalMiles || 0) > 0).length}</p>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-[1px] bg-white/10 border border-white/10">
        {users.length === 0 ? (
          <div className="bg-black p-12 text-center">
            <Users size={48} className="mx-auto mb-4 text-white/20" />
            <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider">
              No users found
            </p>
          </div>
        ) : (
          users.map((user) => (
            <UserCard key={user.id} user={user} onUpdate={onUpdate} />
          ))
        )}
      </div>
    </div>
  );
}

// Activities Tab Component
function ActivitiesTab({ users, selectedUser, setSelectedUser, activityData, setActivityData, handleAddActivity, updating }: any) {
  return (
    <div className="max-w-3xl">
      <div className="border border-white/10 p-8 md:p-12">
        <h3 className="font-['Bebas_Neue'] text-4xl mb-8">Add Running Activity</h3>

        <form onSubmit={handleAddActivity} className="space-y-6">
          <div>
            <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
              Select User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              required
              className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
            >
              <option value="">-- Select a user --</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
              Activity Name
            </label>
            <input
              type="text"
              value={activityData.name}
              onChange={(e) => setActivityData({ ...activityData, name: e.target.value })}
              required
              placeholder="Morning Run"
              className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
            />
          </div>

          <div>
            <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
              Date
            </label>
            <input
              type="date"
              value={activityData.date}
              onChange={(e) => setActivityData({ ...activityData, date: e.target.value })}
              onFocus={(e) => e.currentTarget.showPicker?.()}
              onClick={(e) => e.currentTarget.showPicker?.()}
              required
              className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                Distance (mi)
              </label>
              <input
                type="number"
                step="0.01"
                value={activityData.distance}
                onChange={(e) => setActivityData({ ...activityData, distance: e.target.value })}
                required
                placeholder="5.2"
                className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
              />
            </div>

            <div>
              <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                Duration (min)
              </label>
              <input
                type="number"
                value={activityData.duration}
                onChange={(e) => setActivityData({ ...activityData, duration: e.target.value })}
                required
                placeholder="45"
                className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
              />
            </div>

            <div>
              <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-4">
                Pace (min/mi)
              </label>
              <input
                type="text"
                value={activityData.pace}
                onChange={(e) => setActivityData({ ...activityData, pace: e.target.value })}
                required
                placeholder="8:30"
                className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="border border-white px-6 md:px-12 py-4 md:py-6 hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 w-full sm:w-auto"
          >
            <Save size={20} />
            <span className="font-['Space_Mono'] text-sm uppercase tracking-wider">
              {updating ? 'Adding...' : 'Add Activity'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

function TicketScannerTab({
  events,
  scanInput,
  setScanInput,
  scanBusy,
  scanResult,
  onScanTicket,
  lastScannedValueRef,
  dashboardEventId,
  setDashboardEventId,
  dashboardSearch,
  setDashboardSearch,
  dashboardData,
  dashboardLoading,
  onLoadDashboard,
  onStartRace,
  raceStartBusy,
  onExportCsv,
  onReminderPreview,
  onSendReminders,
  reminderPreview,
  reminderSendResult,
}: {
  events: any[];
  scanInput: string;
  setScanInput: (value: string) => void;
  scanBusy: boolean;
  scanResult: any;
  onScanTicket: (rawQrData?: string) => Promise<void>;
  lastScannedValueRef: React.MutableRefObject<string>;
  dashboardEventId: string;
  setDashboardEventId: (value: string) => void;
  dashboardSearch: string;
  setDashboardSearch: (value: string) => void;
  dashboardData: any;
  dashboardLoading: boolean;
  onLoadDashboard: (eventId: string, searchText?: string) => Promise<void>;
  onStartRace: () => Promise<void>;
  raceStartBusy: boolean;
  onExportCsv: () => Promise<void>;
  onReminderPreview: () => Promise<void>;
  onSendReminders: () => Promise<void>;
  reminderPreview: any;
  reminderSendResult: any;
}) {
  const [timerNow, setTimerNow] = useState<number>(Date.now());
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const raceStartedAt = dashboardData?.event?.raceStartedAt || null;

  // Fallback: if camera doesn't signal ready in 3s, assume it's running
  useEffect(() => {
    const timer = setTimeout(() => setCameraReady(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!raceStartedAt) return;
    const intervalId = window.setInterval(() => {
      setTimerNow(Date.now());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [raceStartedAt]);

  const elapsedRaceTime = (() => {
    if (!raceStartedAt) return '--:--:--';
    const startMs = new Date(raceStartedAt).getTime();
    if (!Number.isFinite(startMs)) return '--:--:--';
    const totalSeconds = Math.max(0, Math.floor((timerNow - startMs) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  })();

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border border-white/10 p-8 md:p-10">
        <h3 className="font-['Bebas_Neue'] text-3xl mb-6">Check-in Dashboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <select
            value={dashboardEventId}
            onChange={(e) => {
              const nextEventId = e.target.value;
              setDashboardEventId(nextEventId);
              onLoadDashboard(nextEventId, dashboardSearch);
            }}
            className="px-4 py-3 bg-black border border-white/10 text-white"
          >
            <option value="">Select Event</option>
            {events.map((event: any) => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
          <input
            value={dashboardSearch}
            onChange={(e) => setDashboardSearch(e.target.value)}
            placeholder="Search name/email/bib"
            className="px-4 py-3 bg-black border border-white/10 text-white"
          />
          <button
            onClick={() => onLoadDashboard(dashboardEventId, dashboardSearch)}
            className="border border-white px-4 py-3 hover:bg-white hover:text-black transition-all"
          >
            Refresh
          </button>
        </div>

        <div className="border border-white/10 p-4 mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="font-['Space_Mono'] text-[11px] text-white/60 uppercase tracking-wider mb-1">Race Clock</p>
            <p className="font-['Bebas_Neue'] text-3xl leading-none">{elapsedRaceTime}</p>
            <p className="text-xs text-white/50 mt-1">
              {raceStartedAt ? `Started at ${new Date(raceStartedAt).toLocaleTimeString()}` : 'Race not started yet'}
            </p>
          </div>
          <button
            onClick={() => onStartRace()}
            disabled={!dashboardEventId || raceStartBusy || Boolean(raceStartedAt)}
            className="border border-white px-6 py-3 hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
          >
            <Play size={16} />
            <span className="font-['Space_Mono'] text-xs uppercase tracking-wider">
              {raceStartedAt ? 'Race Started' : raceStartBusy ? 'Starting...' : 'Start Race'}
            </span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={onExportCsv} className="border border-white/30 px-4 py-2 text-sm hover:bg-white hover:text-black transition-all">Export CSV</button>
          <button onClick={onReminderPreview} className="border border-white/30 px-4 py-2 text-sm hover:bg-white hover:text-black transition-all">Reminder Preview</button>
          <button onClick={onSendReminders} className="border border-white/30 px-4 py-2 text-sm hover:bg-white hover:text-black transition-all">Send Reminders</button>
        </div>

        {dashboardData?.event && (
          <div className="text-xs text-white/70 mb-4 font-['Space_Mono'] uppercase tracking-wider">
            Registered: {dashboardData.event.totalRegistered} • Present: {dashboardData.event.totalPresent} • Waitlist: {dashboardData.event.totalWaitlist}
          </div>
        )}

        {dashboardLoading ? (
          <p className="text-white/60">Loading check-ins...</p>
        ) : (
          <div className="space-y-2 max-h-[260px] overflow-auto pr-1">
            {(dashboardData?.checkins || []).map((row: any) => (
              <div key={row.userId} className="border border-white/10 p-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm">{row.userName}</p>
                  <p className="text-white/50 text-xs">Bib {row.bibNumber || '--'} • {row.selectedDistance || '--'}{row.finishTimeHms ? ` • ${row.finishTimeHms}` : ''}</p>
                </div>
                <p className="text-xs text-white/70">{row.checkedIn ? 'Present' : 'Pending'}</p>
              </div>
            ))}
            {dashboardData && (dashboardData.checkins || []).length === 0 && (
              <p className="text-white/50 text-sm">No matching runners.</p>
            )}
          </div>
        )}

        {reminderPreview && (
          <div className="text-white/60 text-xs mt-4 space-y-1">
            <p>Reminder Window: {String(reminderPreview.reminderType || 'none').toUpperCase()} • Audience: {reminderPreview.count || 0}</p>
            <p>Channels: WhatsApp {reminderPreview.channels?.whatsappWebhookConfigured ? 'configured' : 'not configured'} • Email {reminderPreview.channels?.resendConfigured ? 'configured' : 'not configured'}</p>
          </div>
        )}
        {reminderSendResult && (
          <p className="text-white/60 text-xs mt-2">
            Last send → Sent: {reminderSendResult.sent || 0}, Skipped: {reminderSendResult.skipped || 0}, Failed: {reminderSendResult.failed || 0}
          </p>
        )}
      </div>

      <div className="border border-white/10 p-8 md:p-12">
        <h3 className="font-['Bebas_Neue'] text-4xl mb-4">Scan Runner Ticket</h3>
        <p className="font-['Space_Mono'] text-xs text-white/50 uppercase tracking-wider mb-8">
          only admin scan can mark runner present
        </p>

        <div className="overflow-hidden border border-white/10 bg-black mb-6 relative min-h-[260px] flex items-center justify-center">
          {cameraError ? (
            <div className="text-center px-6 py-10">
              <p className="font-['Space_Mono'] text-xs text-red-400 uppercase tracking-wider mb-2">Camera unavailable</p>
              <p className="text-white/50 text-xs mb-4">{cameraError}</p>
              <p className="text-white/30 text-xs">Use the manual paste fallback below.</p>
            </div>
          ) : (
            <>
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                  <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider animate-pulse">Starting camera...</p>
                </div>
              )}
              <Scanner
                constraints={{ facingMode: 'user' }}
                onScan={(detectedCodes) => {
                  if (!cameraReady) setCameraReady(true);
                  const rawValue = detectedCodes?.[0]?.rawValue?.trim();
                  if (!rawValue || scanBusy || lastScannedValueRef.current === rawValue) return;
                  lastScannedValueRef.current = rawValue;
                  onScanTicket(rawValue).finally(() => {
                    window.setTimeout(() => {
                      if (lastScannedValueRef.current === rawValue) {
                        lastScannedValueRef.current = '';
                      }
                    }, 3000);
                  });
                }}
                onError={(err: unknown) => {
                  const msg = err instanceof Error ? err.message : String(err);
                  if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed')) {
                    setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
                  } else if (msg.toLowerCase().includes('notfound') || msg.toLowerCase().includes('devicenotfound')) {
                    setCameraError('No camera found on this device.');
                  } else if (msg.toLowerCase().includes('https') || msg.toLowerCase().includes('secure')) {
                    setCameraError('Camera requires a secure (HTTPS) connection.');
                  } else {
                    setCameraError('Camera could not be started. Try the manual input below.');
                  }
                }}
              />
            </>
          )}
        </div>

        <div className="space-y-4">
          <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block">
            Paste QR payload (fallback)
          </label>
          <textarea
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            placeholder='Paste full QR content here'
            className="w-full px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm min-h-[110px]"
          />
          <button
            onClick={() => onScanTicket()}
            disabled={scanBusy || !scanInput.trim()}
            className="border border-white px-10 py-4 hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
          >
            <ScanLine size={18} />
            <span className="font-['Space_Mono'] text-xs uppercase tracking-wider">
              {scanBusy ? 'Checking...' : 'Scan Finish QR'}
            </span>
          </button>
        </div>
      </div>

      {scanResult && (
        <div className="border border-white/10 p-8 md:p-10 bg-black">
          <h4 className="font-['Bebas_Neue'] text-3xl mb-6">Scan Result</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="text-white/70">Runner: <span className="text-white">{scanResult.userName || '--'}</span></div>
            <div className="text-white/70">Bib: <span className="text-white">{scanResult.bibNumber || '--'}</span></div>
            <div className="text-white/70">Event: <span className="text-white">{scanResult.eventName || '--'}</span></div>
            <div className="text-white/70">Submitted Distance: <span className="text-white">{scanResult.selectedDistance || '--'}</span></div>
            <div className="text-white/70">Finish Time: <span className="text-white">{scanResult.finishTimeHms || '--'}</span></div>
            <div className="text-white/70">Status: <span className="text-white">{scanResult.alreadyCheckedIn ? 'Already Present' : 'Marked Present'}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

// User Card Component
function UserCard({ user, onUpdate }: { user: any; onUpdate: (userId: string, stats: any) => void }) {
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({
    totalMiles: user.totalMiles || 0,
    totalRuns: user.totalRuns || 0,
    currentStreak: user.currentStreak || 0,
    longestStreak: user.longestStreak || 0,
  });

  const handleSave = () => {
    onUpdate(user.id, stats);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-black p-8 md:p-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-['Bebas_Neue'] text-2xl mb-1">{user.name}</h3>
            <p className="font-['Space_Mono'] text-xs text-white/40">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="p-3 border border-white hover:bg-white hover:text-black transition-all"
            >
              <Save size={16} />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="p-3 border border-white/20 hover:bg-white/5 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-2">
              Total Miles
            </label>
            <input
              type="number"
              step="0.1"
              value={stats.totalMiles}
              onChange={(e) => setStats({ ...stats, totalMiles: parseFloat(e.target.value) })}
              className="w-full px-4 py-3 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
            />
          </div>
          <div>
            <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-2">
              Total Runs
            </label>
            <input
              type="number"
              value={stats.totalRuns}
              onChange={(e) => setStats({ ...stats, totalRuns: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
            />
          </div>
          <div>
            <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-2">
              Current Streak
            </label>
            <input
              type="number"
              value={stats.currentStreak}
              onChange={(e) => setStats({ ...stats, currentStreak: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
            />
          </div>
          <div>
            <label className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider block mb-2">
              Longest Streak
            </label>
            <input
              type="number"
              value={stats.longestStreak}
              onChange={(e) => setStats({ ...stats, longestStreak: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black hover:bg-white/5 transition-all duration-300 group">
      <div className="p-8 md:p-12">
        <div className="flex justify-between items-start gap-8">
          <div className="flex-1">
            <h3 className="font-['Bebas_Neue'] text-2xl mb-1">{user.name}</h3>
            <p className="font-['Space_Mono'] text-xs text-white/40 mb-6">{user.email}</p>
            <div className="flex items-center gap-8">
              <div>
                <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-1">Miles</p>
                <p className="font-['Bebas_Neue'] text-3xl">{user.totalMiles || 0}</p>
              </div>
              <div>
                <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-1">Runs</p>
                <p className="font-['Bebas_Neue'] text-3xl">{user.totalRuns || 0}</p>
              </div>
              <div>
                <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-1">Streak</p>
                <p className="font-['Bebas_Neue'] text-3xl">{user.currentStreak || 0}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="p-3 border border-white/20 hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
          >
            <Edit size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Gallery Tab Component
function GalleryTab() {
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const data = await fetchGalleryPhotos();
      setPhotos(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load gallery');
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      await Promise.all(files.map(f => uploadGalleryPhoto(f)));
      toast.success(`${files.length} photo(s) uploaded`);
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm('Delete this photo from the gallery?')) return;
    try {
      await deleteGalleryPhoto(name);
      toast.success('Photo deleted');
      setPhotos(prev => prev.filter(p => p.name !== name));
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="border border-white px-6 py-4 hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-3 disabled:opacity-50"
        >
          <Image size={20} />
          <span className="font-['Space_Mono'] text-sm uppercase tracking-wider">
            {uploading ? 'Uploading...' : 'Upload Photos'}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
        <span className="font-['Space_Mono'] text-xs text-white/40 uppercase">{photos.length} photo(s)</span>
      </div>

      {photos.length === 0 ? (
        <div className="border border-white/10 p-16 text-center">
          <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider">No photos yet. Upload some above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map(photo => (
            <div key={photo.name} className="relative group aspect-square overflow-hidden border border-white/10">
              <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(photo.name)}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                  title="Delete photo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const [formUrl, setFormUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('settings').select('value').eq('key', 'activity_form_url').single().then(({ data }) => {
      if (data?.value) setFormUrl(data.value);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('settings').upsert({ key: 'activity_form_url', value: formUrl }, { onConflict: 'key' });
      if (error) throw error;
      toast.success('Form URL saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border border-white/10 p-8 md:p-12">
        <h3 className="font-['Bebas_Neue'] text-4xl mb-8">Submit Activity Form URL</h3>
        <p className="font-['Space_Mono'] text-xs text-white/40 uppercase tracking-wider mb-4">
          This URL will be used for the "Submit Activity" button on the user dashboard.
        </p>
        <div className="flex gap-4">
          <input
            type="url"
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
            className="flex-1 px-6 py-4 bg-black border border-white/10 focus:border-white/30 focus:outline-none transition-all font-['Space_Mono'] text-sm"
            placeholder="https://forms.gle/..."
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="border border-white px-8 py-4 hover:bg-white hover:text-black transition-all duration-300 font-['Space_Mono'] text-xs uppercase tracking-wider disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
