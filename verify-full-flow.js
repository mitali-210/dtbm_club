const SUPABASE_URL = "https://vxtiwopablzbnfjlriqc.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4dGl3b3BhYmx6Ym5mamxyaXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MzMxNDYsImV4cCI6MjA5MDAwOTE0Nn0.dxOAyEtUE_6CfAymPwy91hv7yXluLMt_v04b4pRqWuI";

async function verify() {
  console.log('--- STARTING FULL VERIFICATION ---');

  // 1. LOGIN
  const resAuth = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mitalidiwate23@gmail.com', password: 'mitali@897' })
  });
  const authData = await resAuth.json();
  if (authData.error) throw new Error(authData.error_description);
  const token = authData.access_token;
  const userId = authData.user.id;
  const userName = authData.user.user_metadata.name;
  console.log(`Logged in as: ${userName} (${userId})`);

  const API_URL = `${SUPABASE_URL}/functions/v1/make-server-a694af94`;

  // 2. GET INITIAL STATS (Admin View)
  const resUsers = await fetch(`${API_URL}/admin/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const usersData = await resUsers.json();
  const userStats = usersData.users.find(u => u.id === userId);
  const initialMiles = parseFloat(userStats.total_miles || 0);
  const initialRuns = parseInt(userStats.total_runs || 0);
  console.log(`Initial Admin Stats: ${initialMiles} miles, ${initialRuns} runs`);

  // 3. GET INITIAL LEADERBOARD
  const resLeaderboard = await fetch(`${API_URL}/leaderboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const lbData = await resLeaderboard.json();
  const lbUser = lbData.leaderboard.find(u => u.user_id === userId);
  const initialPoints = lbUser ? lbUser.total_points : 0;
  console.log(`Initial Leaderboard Points: ${initialPoints}`);

  // 4. GET INITIAL PROFILE
  const resProfile = await fetch(`${API_URL}/user/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const profData = await resProfile.json();
  console.log(`Initial Profile Stats: ${profData.profile.total_miles} miles`);

  // 5. ADD ACTIVITY (Admin API)
  const addMiles = 10;
  console.log(`\nAdding ${addMiles} mile activity...`);
  const resAdd = await fetch(`${API_URL}/admin/users/${userId}/activity`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Verification Run',
      date: new Date().toISOString(),
      distance: addMiles.toString(),
      duration: "60",
      pace: "6:00"
    })
  });
  const addResult = await resAdd.json();
  if (!addResult.success) throw new Error('Failed to add activity');
  console.log('Activity added successfully.');

  // 6. VERIFY ADMIN STATS
  const resUsers2 = await fetch(`${API_URL}/admin/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const userStats2 = (await resUsers2.json()).users.find(u => u.id === userId);
  const newMiles = parseFloat(userStats2.total_miles);
  const newRuns = parseInt(userStats2.total_runs);
  console.log(`\nVerification 1: Admin Stats -> Miles: ${newMiles} (Expected: ${initialMiles + addMiles}), Runs: ${newRuns} (Expected: ${initialRuns + 1})`);

  // 7. VERIFY LEADERBOARD
  const resLeaderboard2 = await fetch(`${API_URL}/leaderboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const lbUser2 = (await resLeaderboard2.json()).leaderboard.find(u => u.user_id === userId);
  const newPoints = lbUser2.total_points;
  const expectedPoints = newMiles * 10 + newRuns * 5;
  console.log(`Verification 2: Leaderboard Points -> Points: ${newPoints} (Expected: ${expectedPoints})`);

  // 8. VERIFY PROFILE
  const resProfile2 = await fetch(`${API_URL}/user/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const newProfileMiles = parseFloat((await resProfile2.json()).profile.total_miles);
  console.log(`Verification 3: Profile Stats -> Miles: ${newProfileMiles} (Expected: ${newMiles})`);

  if (newMiles === initialMiles + addMiles && newRuns === initialRuns + 1 && newPoints === expectedPoints && newProfileMiles === newMiles) {
    console.log('\n--- ALL VERIFICATIONS PASSED! ---');
  } else {
    console.error('\n--- VERIFICATION FAILED! ---');
  }
}

verify().catch(console.error);
