const SUPABASE_URL = "https://vxtiwopablzbnfjlriqc.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dGl3b3BhYmx6Ym5mamxyaXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzMxNDYsImV4cCI6MjA5MDAwOTE0Nn0.dxOAyEtUE_6CfAymPwy91hv7yXluLMt_v04b4pRqWuI";

async function inspect() {
  console.log('--- INSPECTING AYUSH DATA ---');

  // 1. Get all users named Ayush
  const resUsers = await fetch(`${SUPABASE_URL}/rest/v1/profiles?name=ilike.*ayush*`, {
    headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
  });
  const users = await resUsers.json();
  console.log(`Found ${users.length} users with "ayush" in name:`);
  console.log(JSON.stringify(users, null, 2));

  if (users.length === 0) return;

  for (const user of users) {
    console.log(`\nChecking activities for ${user.name} (${user.id})...`);
    
    // 2. Get activities for this user
    const resActivities = await fetch(`${SUPABASE_URL}/rest/v1/activities?user_id=eq.${user.id}&order=created_at.desc`, {
      headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
    });
    const activities = await resActivities.json();
    console.log(`Found ${activities.length} activities.`);
    if (activities.length > 0) {
      console.log('Latest activity:', JSON.stringify(activities[0], null, 2));
    }
    
    console.log(`Current Profile Stats: Miles=${user.total_miles}, Runs=${user.total_runs}`);
  }
}

inspect().catch(console.error);
