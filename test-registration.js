const SUPABASE_URL = "https://vxtiwopablzbnfjlriqc.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dGl3b3BhYmx6Ym5mamxyaXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzMxNDYsImV4cCI6MjA5MDAwOTE0Nn0.dxOAyEtUE_6CfAymPwy91hv7yXluLMt_v04b4pRqWuI";
const API_URL = `${SUPABASE_URL}/functions/v1/make-server-a694af94`;

async function testRegistration() {
  console.log('--- TESTING REGISTRATION FLOW ---');
  
  // 1. Login
  const resAuth = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mitalidiwate23@gmail.com', password: 'mitali@897' })
  });
  const authData = await resAuth.json();
  if (authData.error) throw new Error(authData.error_description);
  const token = authData.access_token;
  console.log('Login success');

  // 2. Get Events
  const resEvents = await fetch(`${API_URL}/events`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const eventsData = await resEvents.json();
  if (!eventsData.events || eventsData.events.length === 0) throw new Error('No events found');
  const eventId = eventsData.events[0].id;
  console.log(`Found event: ${eventsData.events[0].name} (${eventId})`);

  // 3. Register
  console.log('Registering for event...');
  const resReg = await fetch(`${API_URL}/events/${eventId}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ selectedDistance: '10 km', consentAccepted: true }),
  });
  
  const regData = await resReg.json();
  console.log('Registration Response:', JSON.stringify(regData));
  
  // 4. Verify Ticket
  console.log('Fetching ticket...');
  const resTicket = await fetch(`${API_URL}/events/${eventId}/ticket`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const ticketData = await resTicket.json();
  console.log('Ticket Data:', JSON.stringify(ticketData));
}

testRegistration().catch(e => console.error('FAILED:', e.message));
