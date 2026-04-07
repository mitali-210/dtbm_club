const SUPABASE_URL = "https://vxtiwopablzbnfjlriqc.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dGl3b3BhYmx6Ym5mamxyaXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzMxNDYsImV4cCI6MjA5MDAwOTE0Nn0.dxOAyEtUE_6CfAymPwy91hv7yXluLMt_v04b4pRqWuI";
const API_URL = `${SUPABASE_URL}/functions/v1/make-server-a694af94`;

async function getQrData() {
  console.log('--- FETCHING REAL QR DATA ---');
  
  // 1. Login
  const resAuth = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mitalidiwate23@gmail.com', password: 'mitali@897' })
  });
  const authData = await resAuth.json();
  const token = authData.access_token;
  const userId = authData.user.id;

  // 2. Get Ticket for Event
  const resEvents = await fetch(`${API_URL}/events`);
  const evId = (await resEvents.json()).events[0].id;

  const resTicket = await fetch(`${API_URL}/events/${evId}/ticket`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const tData = await resTicket.json();
  console.log('QR DATA:', tData.ticket.qr_data);
}

getQrData().catch(e => console.error(e));
