const SUPABASE_URL = "https://vxtiwopablzbnfjlriqc.supabase.co";
const API_URL = `${SUPABASE_URL}/functions/v1/make-server-a694af94`;

async function diagnostic() {
  console.log('--- STARTING DIAGNOSTIC ---');
  
  const endpoints = [
    { name: 'Stats', path: '/stats' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Events', path: '/events' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);
      const res = await fetch(`${API_URL}${endpoint.path}`);
      console.log(`  Status: ${res.status}`);
      const data = await res.json();
      console.log(`  Data: ${JSON.stringify(data).substring(0, 100)}...`);
    } catch (e) {
      console.error(`  Error testing ${endpoint.name}:`, e.message);
    }
  }
}

diagnostic();
