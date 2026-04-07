const SUPABASE_URL = "https://vxtiwopablzbnfjlriqc.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dGl3b3BhYmx6Ym5mamxyaXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzMxNDYsImV4cCI6MjA5MDAwOTE0Nn0.dxOAyEtUE_6CfAymPwy91hv7yXluLMt_v04b4pRqWuI";

async function test() {
  // 1. Login
  const resAuth = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: 'mitalidiwate23@gmail.com', password: 'mitali@897' })
  });
  
  const authData = await resAuth.json();
  if (authData.error) throw new Error(authData.error_description);
  
  console.log('Login success');
  const token = authData.access_token;
  const adminUserId = authData.user.id;
  
  const API_URL = `${SUPABASE_URL}/functions/v1/make-server-a694af94`;
  
  // 2. Add Activity
  const activityData = {
    name: 'Test Running Activity',
    date: new Date().toISOString(),
    distance: "3.5",
    duration: "25",
    pace: "7:08"
  };

  console.log(`Adding activity for user: ${adminUserId}`);
  
  const res = await fetch(`${API_URL}/admin/users/${adminUserId}/activity`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(activityData)
  });
  
  const status = res.status;
  const result = await res.json();
  console.log('Status /admin/users/:id/activity:', status);
  console.log('Response:', JSON.stringify(result, null, 2));

  if (status === 200 && result.success) {
    console.log('SUCCESS: Activity added and stats updated.');
  } else {
    console.error('FAILED: Could not add activity.');
  }
}

test().catch(console.error);
