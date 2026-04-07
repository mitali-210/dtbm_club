const SUPABASE_URL = "https://vxtiwopablzbnfjlriqc.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dGl3b3BhYmx6Ym5mamxyaXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzMxNDYsImV4cCI6MjA5MDAwOTE0Nn0.dxOAyEtUE_6CfAymPwy91hv7yXluLMt_v04b4pRqWuI";
const API_URL = `${SUPABASE_URL}/functions/v1/make-server-a694af94`;

async function testAdmin() {
  console.log('--- TESTING ADMIN FLOW ---');
  
  // 1. Login
  const resAuth = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mitalidiwate23@gmail.com', password: 'mitali@897' })
  });
  const authData = await resAuth.json();
  const token = authData.access_token;
  console.log('Login success');

  // 2. Test Admin Users
  console.log('Testing GET /admin/users...');
  const resUsers = await fetch(`${API_URL}/admin/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`  Status: ${resUsers.status}`);
  const usersData = await resUsers.json();
  if (resUsers.status !== 200) throw new Error(`Admin users failed: ${JSON.stringify(usersData)}`);
  console.log(`  Users found: ${usersData.users?.length || 0}`);

  // 3. Test QR Scan
  const testQrData = `MOCK-QR-${Date.now()}`; // This will fail but we want to see the error flow
  console.log('Testing POST /admin/tickets/scan...');
  const resScan = await fetch(`${API_URL}/admin/tickets/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ qrData: testQrData })
  });
  const scanData = await resScan.json();
  console.log(`  Status: ${resScan.status}`);
  console.log(`  Response: ${JSON.stringify(scanData)}`);
  
  // 4. Test Export
  const resEvents = await fetch(`${API_URL}/events`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const eventId = (await resEvents.json()).events[0].id;

  console.log('Testing GET /admin/events/:id/export...');
  const resExport = await fetch(`${API_URL}/admin/events/${eventId}/export`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`  Status: ${resExport.status}`);
  
  // 5. Test Reminder Preview
  console.log('Testing GET /admin/events/:id/reminders/preview...');
  const resPrev = await fetch(`${API_URL}/admin/events/${eventId}/reminders/preview`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const prevData = await resPrev.json();
  console.log(`  Status: ${resPrev.status}`);
  console.log(`  JSON: ${JSON.stringify(prevData)}`);
}

testAdmin().catch(e => console.error('FAILED:', e.message));
