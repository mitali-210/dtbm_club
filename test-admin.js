const SUPABASE_URL = "https://vxtiwopablzbnfjlriqc.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dGl3b3BhYmx6Ym5mamxyaXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzMxNDYsImV4cCI6MjA5MDAwOTE0Nn0.dxOAyEtUE_6CfAymPwy91hv7yXluLMt_v04b4pRqWuI";

async function test() {
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
  
  const API_URL = `${SUPABASE_URL}/functions/v1/make-server-a694af94`;
  const res = await fetch(`${API_URL}/admin/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const text = await res.text();
  console.log('Status /admin/users:', res.status);
  console.log('Response /admin/users:', text);
}

test().catch(console.error);
